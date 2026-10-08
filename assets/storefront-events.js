/**
 * @capability Shopify standard storefront events and actions: dispatches the `shopify:cart:*` events for the theme's own cart requests, and configures `Shopify.actions.updateCart` / `openCart` so apps and agents update the cart without a page reload.
 * @when Any code that mutates the cart (add, change, note, discount, attributes) should open a standard event with `FoxTheme.storefrontEvents.start()` before the request and settle it with `resolveCart()` / `failCart()`. Any code that needs the cart UI re-rendered from the server should call `FoxTheme.storefrontActions.refreshCart()`.
 * @contract `window.StandardEvents` is assigned by the module script in snippets/storefront-events.liquid (rendered by both layouts); every helper is a no-op when it is missing. Cart sections join the refresh through the `cart:grouped-sections` event, and the render goes through the `cartUpdate` pubsub event.
 * @keywords standard events, storefront events, shopify:cart, Shopify.actions, updateCart, openCart, cart refresh, app integration
 */
(() => {
  if (FoxTheme.storefrontEvents) return;

  const ACTION_SOURCE = 'storefront-action';

  const getLibrary = () => window.StandardEvents || null;

  const toCartSummary = (cart) => getLibrary().CartLinesUpdateEvent.createCartFromAjaxResponse(cart);

  const fetchCart = async (signal) => {
    const response = await fetch(`${FoxTheme.routes.cart_url}.js`, { signal });
    if (!response.ok) throw new Error(`Cart request failed: ${response.status}`);
    return response.json();
  };

  FoxTheme.storefrontEvents = {
    /** The standard events library, or null until (or unless) it loads. */
    get library() {
      return getLibrary();
    },

    /**
     * Dispatches a promise-carrying event (cart, product select, collection/search update) on `target`
     * as the operation starts. Returns the deferred to settle once it finishes, or null when the
     * library isn't loaded.
     */
    start(target, eventName, payload) {
      const EventClass = getLibrary()?.[eventName];
      if (!EventClass || !target) return null;

      try {
        const deferred = EventClass.createPromise();
        const event = new EventClass({ ...payload, promise: deferred.promise });
        // Listeners attach their own handlers; these only keep an unobserved rejection out of the console.
        // The event carries a promise derived from the deferred's, so both need one.
        deferred.promise.catch(() => {});
        event.promise?.catch?.(() => {});
        target.dispatchEvent(event);
        return deferred;
      } catch (error) {
        console.error('[Hyper] Standard event dispatch failed', error);
        return null;
      }
    },

    /**
     * Returns the message of an AJAX cart error response, or null when the response is a cart.
     */
    getAjaxError(state) {
      if (!state) return null;
      if (state.status) return state.description || state.message || String(state.status);
      if (state.errors) {
        return typeof state.errors === 'string' ? state.errors : Object.values(state.errors).flat().join(' ');
      }
      return null;
    },

    /**
     * Resolves a cart event. A declined change still resolves, with `userErrors` describing why.
     * The AJAX API answers a partly applied change (a quantity capped at the stock available) with
     * the same error as a declined one, so `isApplied(ajaxCart)` tells the two apart: when it returns
     * true the message is reported as a warning instead. When `cart` isn't a full AJAX cart, the
     * current cart is fetched first.
     */
    async resolveCart(deferred, cart, errorMessage = null, isApplied = null) {
      if (!deferred) return;
      // Settled from here on: an error thrown by the code that runs after this is not a failed cart request.
      deferred.settled = true;

      try {
        const ajaxCart = cart?.currency ? cart : await fetchCart();
        const result = { cart: toCartSummary(ajaxCart) };
        if (errorMessage && isApplied?.(ajaxCart)) {
          result.warnings = [{ code: 'MERCHANDISE_NOT_ENOUGH_STOCK', message: errorMessage }];
        } else if (errorMessage) {
          result.userErrors = [{ code: 'INVALID', message: errorMessage }];
        }
        deferred.resolve(result);
      } catch (error) {
        deferred.reject(error);
      }
    },

    /**
     * Converts a variant as Liquid's `| json` renders it into the standard `ProductVariant` shape.
     * `optionNames` are the product's option names in position order.
     */
    toVariant(variant, optionNames = []) {
      if (!variant) return null;

      return {
        id: variant.id,
        title: variant.title,
        availableForSale: variant.available,
        price: {
          // Liquid prices are in the currency's subunit (cents).
          amount: (variant.price / 100).toFixed(2),
          currencyCode: window.Shopify?.currency?.active
        },
        selectedOptions: (variant.options || []).map((value, index) => ({ name: optionNames[index], value }))
      };
    },

    /**
     * Rejects the cart events of a failed request, and tells every other listener through one
     * `shopify:cart:error`. `deferreds` is one deferred or the array one request opened. Events already
     * settled are left alone, so an error thrown after a request succeeded is not reported as a cart error.
     */
    failCart(target, deferreds, error) {
      const pending = [].concat(deferreds).filter((deferred) => deferred && !deferred.settled);
      if (!pending.length) return;

      pending.forEach((deferred) => {
        deferred.settled = true;
        deferred.reject(error);
      });
      if (error?.name === 'AbortError') return;

      const CartErrorEvent = getLibrary()?.CartErrorEvent;
      if (!CartErrorEvent || !target) return;

      target.dispatchEvent(
        new CartErrorEvent({
          error: error?.message || FoxTheme.cartStrings.error,
          code: 'SERVICE_UNAVAILABLE'
        })
      );
    }
  };

  FoxTheme.storefrontActions = {
    ACTION_SOURCE,

    configure() {
      const actions = window.Shopify?.actions;
      if (!actions || this.configured) return;
      this.configured = true;

      actions.updateCart.configure({
        eventTarget: (meta) => this.getEventTarget(meta),
        handler: async (defaultHandler) => {
          const result = await defaultHandler();

          try {
            await this.refreshCart({ source: ACTION_SOURCE });
          } catch (error) {
            // A newer refresh superseded this one and renders the latest cart.
            if (error.name !== 'AbortError') {
              console.error('[Hyper] Cart refresh after updateCart failed; reloading.', error);
              window.location.reload();
            }
          }

          return { ...result, detail: { ...result?.detail, handledBy: 'hyper' } };
        }
      });

      actions.openCart.configure({
        handler: () => this.openCart()
      });
    },

    getEventTarget(meta) {
      if (meta.type === 'shopify:cart:note-update') return document.querySelector('cart-note');
      if (meta.type === 'shopify:cart:discount-update') return document.querySelector('form[is="cart-discount"]');
      return document.querySelector('cart-drawer') || document.querySelector('main-cart');
    },

    /**
     * Re-renders every cart section on the page from the server, then publishes `cartUpdate`
     * so the existing subscribers (cart items, count bubble, quick order list) update.
     * A newer call aborts an older one still in flight.
     */
    async refreshCart({ source } = {}) {
      this.refreshController?.abort();
      const controller = new AbortController();
      this.refreshController = controller;
      const { signal } = controller;

      const sections = [];
      document.documentElement.dispatchEvent(
        new CustomEvent('cart:grouped-sections', { bubbles: true, detail: { sections } })
      );

      // Sections render in the context of the URL they're requested from. `/cart.js` ignores
      // `sections`, and the cart drawer section renders nothing on the cart template, so the
      // sections come from the current page.
      const [cart, renderedSections] = await Promise.all([
        fetchCart(signal),
        sections.length
          ? fetch(`${window.location.pathname}?sections=${sections.join(',')}`, { signal }).then((response) => {
              if (!response.ok) throw new Error(`Sections request failed: ${response.status}`);
              return response.json();
            })
          : null
      ]);

      if (renderedSections) cart.sections = renderedSections;

      // Subscribers render synchronously, so elements connected by this render can read `renderSource`
      // to tell an app's change from the buyer's (see GiftWrapping).
      this.renderSource = source;
      try {
        FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate, { cart, source });
      } finally {
        this.renderSource = null;
      }
      return cart;
    },

    async openCart() {
      const cartDrawer = document.querySelector('cart-drawer');

      if (cartDrawer) {
        const quickViewModal = document.querySelector('quick-view-modal[open]');
        if (quickViewModal) await quickViewModal.hide();
        if (!cartDrawer.open) await cartDrawer.show();
        return;
      }

      if (FoxTheme.settings.template === 'cart') {
        document.querySelector('main-cart')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      window.location.href = FoxTheme.routes.cart_url;
    }
  };

  // Legacy hook for apps (FoxKit and others): `cart:refresh` re-renders the cart, and opens the drawer on `detail.open`.
  document.addEventListener('cart:refresh', async (event) => {
    try {
      await FoxTheme.storefrontActions.refreshCart();
      if (event.detail?.open === true) document.querySelector('cart-drawer')?.show();
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error refreshing cart:', error);
    }
  });
})();
