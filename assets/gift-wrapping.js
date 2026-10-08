if (!customElements.get('gift-wrapping')) {
  customElements.define(
    'gift-wrapping',
    class GiftWrapping extends HTMLElement {
      // The last rendered state per section: after a re-render it tells which side of the cart changed.
      static states = new Map();

      constructor() {
        super();

        this.giftWrapProductId = this.dataset.giftWrapId;
        this.isGiftWrappingEnabled = this.dataset.giftWrapping;
        this.cartItemCount = parseInt(this.getAttribute('cart-items-size'));
        this.giftWrapItemCount = parseInt(this.getAttribute('gift-wraps-in-cart'));
        this.totalItemCount = parseInt(this.getAttribute('items-in-cart'));
        this.giftWrapMode = this.dataset.giftWrappingLimit;
        // The cart's attributes as last saved: standard events report the complete set, not only the changed keys.
        try {
          this.cartAttributes = JSON.parse(this.dataset.cartAttributes || '{}');
        } catch {
          this.cartAttributes = {};
        }
      }

      connectedCallback() {
        this.initializeGiftWrapCheckbox();
        this.handleInitialGiftWrapState();
      }

      initializeGiftWrapCheckbox() {
        this.querySelector('[name="attributes[gift-wrapping]"]').addEventListener('change', (event) => {
          event.target.checked ? this.addGiftWrap() : this.removeGiftWrap();
        });
      }

      handleInitialGiftWrapState() {
        const previousState = GiftWrapping.states.get(this.dataset.sectionId);
        GiftWrapping.states.set(this.dataset.sectionId, {
          lineCount: this.giftWrapItemCount,
          enabled: this.isGiftWrappingEnabled.length > 0
        });

        if (this.cartItemCount == 1 && this.giftWrapItemCount > 0) {
          return this.removeGiftWrap();
        }
        if (previousState && FoxTheme.storefrontActions?.renderSource === FoxTheme.storefrontActions.ACTION_SOURCE) {
          return this.followActionChange(previousState);
        }
        if (this.giftWrapItemCount > 0 && this.isGiftWrappingEnabled.length == 0) {
          return this.addGiftWrap();
        }
        if (this.giftWrapItemCount == 0 && this.isGiftWrappingEnabled.length > 0) {
          return this.addGiftWrap();
        }
      }

      /**
       * After an app's `Shopify.actions.updateCart`, the gift wrap line and the `gift-wrapping` attribute can
       * disagree. The side the app changed wins and the other follows, instead of undoing the app's change.
       */
      followActionChange(previousState) {
        const enabled = this.isGiftWrappingEnabled.length > 0;
        const hasLine = this.giftWrapItemCount > 0;
        if (hasLine === enabled) return;

        if (hasLine) {
          // Line without attribute: the app cleared the attribute, or added the gift wrap product.
          return previousState.enabled ? this.removeGiftWrap() : this.addGiftWrap();
        }
        // Attribute without line: the app removed the gift wrap line, or set the attribute.
        return previousState.lineCount > 0 ? this.removeGiftWrap() : this.addGiftWrap();
      }

      addGiftWrap() {
        this.showLoader();
        const sectionsToUpdate = this.getSectionsToUpdate();
        const requestBody = this.createRequestBody(
          {
            [this.giftWrapProductId]: 1,
          },
          { 'gift-wrapping': true },
          sectionsToUpdate
        );
        // cart/update.js sets the gift wrap line to 1: an add when it isn't in the cart yet, otherwise
        // an update, and no line change at all when it already is 1.
        const lineKey = this.dataset.giftWrapLineKey;
        let lines = null;
        if (!lineKey) {
          lines = { action: 'add', lines: [{ merchandiseId: this.giftWrapProductId, quantity: 1 }] };
        } else if (this.giftWrapItemCount !== 1) {
          lines = { action: 'update', lines: [{ id: lineKey, quantity: 1 }] };
        }
        this.updateCart(requestBody, { lines, attributes: { 'gift-wrapping': true } });
      }

      removeGiftWrap() {
        this.showLoader();
        const sectionsToUpdate = this.getSectionsToUpdate();
        const requestBody = this.createRequestBody(
          {
            [this.giftWrapProductId]: 0,
          },
          { 'gift-wrapping': '', 'gift-note': '' },
          sectionsToUpdate
        );
        const lineKey = this.dataset.giftWrapLineKey;
        this.updateCart(requestBody, {
          lines: lineKey ? { action: 'remove', lines: [{ id: lineKey, quantity: 0 }] } : null,
          attributes: { 'gift-wrapping': '', 'gift-note': '' }
        });
      }

      getSectionsToUpdate() {
        let sections = [];
        document.documentElement.dispatchEvent(
          new CustomEvent('cart:grouped-sections', { bubbles: true, detail: { sections } })
        );
        return sections;
      }

      createRequestBody(updates, attributes, sections) {
        return JSON.stringify({ updates, attributes, sections });
      }

      updateCart(body, change) {
        const cartEvents = this.startCartEvents(change);

        fetch(`${FoxTheme.routes.cart_update_url}`, { ...FoxTheme.utils.fetchConfig(), ...{ body } })
          .then((response) => response.json())
          .then((parsedState) => {
            this.settleCartEvents(cartEvents, parsedState);
            FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate, { cart: parsedState });
          })
          .catch((error) => {
            FoxTheme.storefrontEvents?.failCart(this, cartEvents, error);
            console.error('Error updating cart:', error);
          });
      }

      /**
       * Dispatch the standard events for one cart/update.js request: the gift wrap line, when it
       * changes, and the cart attributes. Returns the deferreds to settle.
       */
      startCartEvents({ lines, attributes }, target = this) {
        const context = this.closest('cart-drawer') ? 'dialog' : 'cart';
        const cartEvents = [];
        if (lines) {
          cartEvents.push(FoxTheme.storefrontEvents?.start(target, 'CartLinesUpdateEvent', { ...lines, context }));
        }
        cartEvents.push(
          FoxTheme.storefrontEvents?.start(target, 'CartAttributesUpdateEvent', {
            context,
            attributes: this.mergeAttributes(attributes)
          })
        );
        return cartEvents.filter(Boolean);
      }

      settleCartEvents(cartEvents, cart) {
        const errorMessage = FoxTheme.storefrontEvents?.getAjaxError(cart);
        cartEvents.forEach((cartEvent) =>
          FoxTheme.storefrontEvents.resolveCart(cartEvent, errorMessage ? null : cart, errorMessage)
        );
        if (!errorMessage && cart?.attributes) this.cartAttributes = cart.attributes;
      }

      /**
       * The complete attribute set the cart ends up with after `changes`, in the standard `{ key, value }`
       * shape. As in the AJAX API, an empty value removes the key.
       */
      mergeAttributes(changes) {
        return Object.entries({ ...this.cartAttributes, ...changes })
          .filter(([, value]) => value !== '' && value !== null && value !== undefined)
          .map(([key, value]) => ({ key, value: String(value) }));
      }

      showLoader() {
        const loaderElement = this.querySelector('.loader');
        if (loaderElement) loaderElement.classList.add('btn--loading');
      }
    }
  );
}

if (!customElements.get('gift-note')) {
  customElements.define(
    'gift-note',
    class GiftNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener('change', FoxTheme.utils.debounce(this.updateGiftNote.bind(this), 300));
      }

      updateGiftNote(event) {
        const attributes = { 'gift-note': event.target.value };
        const requestBody = JSON.stringify({ attributes });
        const giftWrapping = this.closest('gift-wrapping');
        const cartEvents = giftWrapping?.startCartEvents({ attributes }, this) || [];

        fetch(`${FoxTheme.routes.cart_update_url}`, { ...FoxTheme.utils.fetchConfig(), ...{ body: requestBody } })
          .then((response) => response.json())
          .then((cart) => giftWrapping?.settleCartEvents(cartEvents, cart))
          .catch((error) => FoxTheme.storefrontEvents?.failCart(this, cartEvents, error));
      }
    }
  );
}

if (!customElements.get('gift-wrap-remove-item')) {
  customElements.define(
    'gift-wrap-remove-item',
    class RemoveGiftWrapButton extends HTMLAnchorElement {
      constructor() {
        super();

        this.addEventListener('click', (event) => {
          event.preventDefault();

          const cartItemsElement = this.closest('cart-items');
          cartItemsElement.showLoader(this.dataset.index);

          const giftWrappingElement = document.querySelector('gift-wrapping');
          giftWrappingElement.removeGiftWrap();
        });
      }
    },
    { extends: 'a' }
  );
}
