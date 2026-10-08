if (!customElements.get('quick-view-modal')) {
  /**
   * Product content per request URL, shared by every quick view modal on the page, so a prefetch on hover
   * and a reopen reuse the same request. Cleared on cart changes: the buy buttons show the quantity in cart.
   */
  const contentCache = new Map();

  // The open request whose content is still loading. Only the latest one opens.
  let pendingOpen = null;

  const PREFETCH_DELAY = 150;
  // A request still pending after this long fails like any other, so the opener never spins forever.
  const REQUEST_TIMEOUT = 10000;

  /** Shows the loading state on the button that opened the quick view. */
  const setOpenerLoading = (opener, loading) => {
    if (!opener) return;

    opener.toggleAttribute('aria-busy', loading);
    // Other openers (the "+N" swatch link) only change the cursor, through `[aria-busy]`.
    if (!opener.classList.contains('btn')) return;

    if (loading && !opener.querySelector(':scope > .loading__spinner')) {
      const spinner = document.querySelector('.drawer__loading-spinner svg')?.cloneNode(true);
      if (spinner) {
        const wrapper = document.createElement('span');
        wrapper.className = 'loading__spinner';
        wrapper.append(spinner);
        opener.append(wrapper);
      }
    }
    opener.classList.toggle('btn--loading', loading);
  };

  // Loading assets can hold the open up to this long; past it the quick view opens anyway.
  const ASSETS_TIMEOUT = 5000;

  /**
   * Script and stylesheet files per URL, loaded once per page. The quick view content declares the
   * scripts its custom elements need (product-info.js, variant-selects.js…) and the stylesheets of parts
   * only some products have (volume pricing, 3D models). Inserted along with the content they would only
   * start downloading then: until the scripts ran, an option picked changed nothing but the radio (the
   * form kept the previous variant), and those parts showed unstyled until their stylesheet arrived.
   */
  const assetLoads = new Map();

  /** Resolves once every external script of the content has run and its stylesheets have loaded. */
  const loadAssets = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;

    const loads = Array.from(template.content.querySelectorAll('script[src], link[rel="stylesheet"][href]'), (tag) => {
      const isScript = tag.tagName === 'SCRIPT';
      const url = new URL(tag.getAttribute(isScript ? 'src' : 'href'), window.location.href).href;
      if (!assetLoads.has(url)) {
        // Already on the page from its own render (a product page's main product loads the same files).
        const onPage = isScript
          ? Array.from(document.scripts).some((script) => script.src === url)
          : Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => link.href === url);
        assetLoads.set(
          url,
          onPage
            ? Promise.resolve()
            : new Promise((resolve) => {
                const element = document.createElement(isScript ? 'script' : 'link');
                if (isScript) {
                  element.src = url;
                  // In order, like the defer tags they stand in for.
                  element.async = false;
                } else {
                  element.rel = 'stylesheet';
                  element.href = url;
                }
                element.onload = element.onerror = resolve;
                document.head.append(element);
              })
        );
      }
      return assetLoads.get(url);
    });

    return Promise.all(loads);
  };

  const cancelPendingOpen = () => {
    if (!pendingOpen) return;
    setOpenerLoading(pendingOpen.opener, false);
    pendingOpen = null;
  };

  // A cart change makes cached content stale (the buy buttons show the quantity in cart), and a quick view
  // still loading would open over the cart drawer: drop both.
  FoxTheme.pubsub.subscribe(FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate, () => {
    contentCache.clear();
    cancelPendingOpen();
  });

  customElements.define(
    'quick-view-modal',
    class QuickViewModal extends DrawerComponent {
      constructor() {
        super();

        this.classesToRemoveOnLoad = 'drawer--loading';
        this.drawerBody = this.querySelector(this.selector);
      }

      get selector() {
        return '.quick-view__content';
      }

      get requiresBodyAppended() {
        return !(Shopify.designMode && this.closest('.section-group-overlay-quick-view'));
      }

      get contentUrl() {
        return `${this.dataset.productUrl.split('?')[0]}?section_id=${this.getProductQuickViewSectionId()}`;
      }

      connectedCallback() {
        super.connectedCallback();
        if (this.designMode) return;

        // Start loading when the buyer is about to open the quick view, so most clicks open it straight away.
        const { signal } = this.abortController;
        // The overlay and close button inside the modal share its aria-controls; only openers prefetch.
        this.controls
          .filter((control) => !this.contains(control))
          .forEach((control) => {
            control.addEventListener('pointerenter', this.onControlPointerEnter.bind(this), { signal });
            control.addEventListener('pointerleave', this.onControlPointerLeave.bind(this), { signal });
            control.addEventListener('focus', this.prefetch.bind(this), { signal });
          });
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.prefetchTimer);
      }

      onControlPointerEnter() {
        clearTimeout(this.prefetchTimer);
        this.prefetchTimer = setTimeout(this.prefetch.bind(this), PREFETCH_DELAY);
      }

      onControlPointerLeave() {
        clearTimeout(this.prefetchTimer);
      }

      prefetch() {
        // The theme editor doesn't cache, so a prefetch there would only double the request.
        if (Shopify.designMode) return;
        this.loadContent().catch(() => {});
      }

      /**
       * Resolves with the quick view content of the product. Outside the theme editor, a request is shared
       * and reused until the cart changes; a failed one is dropped so the next attempt retries.
       */
      loadContent() {
        const url = this.contentUrl;
        if (!Shopify.designMode && contentCache.has(url)) return contentCache.get(url);

        const request = fetch(url, AbortSignal.timeout ? { signal: AbortSignal.timeout(REQUEST_TIMEOUT) } : {})
          .then((response) => {
            if (!response.ok) throw new Error(`Quick view request failed: ${response.status}`);
            return response.text();
          })
          .then((responseText) => {
            const content = new DOMParser().parseFromString(responseText, 'text/html').querySelector(this.selector);
            if (!content) throw new Error('Quick view content not found');
            // Started here so a prefetch warms the assets too; showWhenLoaded() waits for them.
            loadAssets(content.innerHTML);
            return content.innerHTML;
          });

        if (!Shopify.designMode) {
          contentCache.set(url, request);
          request.catch(() => contentCache.get(url) === request && contentCache.delete(url));
        }
        return request;
      }

      show(activeElement = null, animate = true) {
        if (this.open) return;
        return this.showWhenLoaded(activeElement, animate);
      }

      /**
       * Opens the modal once its content has loaded, so it opens at its final size instead of growing
       * from an empty loading state. The button that opened it shows the loading state meanwhile.
       */
      async showWhenLoaded(opener, animate) {
        if (pendingOpen?.modal === this) return;

        // A newer request supersedes one still loading: only the latest product opens.
        if (pendingOpen) setOpenerLoading(pendingOpen.opener, false);
        const request = { modal: this, opener };
        pendingOpen = request;
        setOpenerLoading(opener, true);

        let content;
        try {
          content = await this.loadContent();
          // Rendered only once its assets are in: its custom elements upgrade as they are inserted, styled.
          await Promise.race([loadAssets(content), new Promise((resolve) => setTimeout(resolve, ASSETS_TIMEOUT))]);
        } catch (error) {
          if (pendingOpen !== request) return;
          pendingOpen = null;
          setOpenerLoading(opener, false);
          console.error(error);
          // The quick view can't load: show the product page instead (not in the theme editor's preview).
          if (!Shopify.designMode) window.location.href = this.dataset.productUrl;
          return;
        }

        // Reopened while its close transition still runs: let the close finish first, or its clean-up
        // would empty the content rendered below.
        if (!this.open && !this.hidden && this.hasAttribute('inert')) {
          await FoxTheme.utils.waitForEvent(this, this.events.handleAfterHide);
        }

        // Superseded, or cancelled with hide() or a cart change.
        if (pendingOpen !== request) return;
        pendingOpen = null;
        setOpenerLoading(opener, false);
        // The card was re-rendered meanwhile (filters, load more…): don't open a modal it no longer has.
        if (!this.isConnected) return;

        // super.show() un-hides the modal synchronously: render the content in the same task, so the
        // first frame lays out at the final size and the sliders inside measure a visible container.
        const shown = super.show(opener, animate);
        this.renderContent(content);
        return shown;
      }

      hide() {
        if (pendingOpen?.modal === this) cancelPendingOpen();

        return super.hide();
      }

      handleAfterShow() {
        super.handleAfterShow();
        this.isShown = true;
        document.dispatchEvent(
          new CustomEvent('quick-view:open', {
            detail: { productUrl: this.dataset.productUrl }
          })
        );
        if (this.hasNewContent) this.announceContent();
      }

      handleAfterHide() {
        super.handleAfterHide();
        this.isShown = false;
        this.hasNewContent = false;
        const drawerContent = this.querySelector(this.selector);
        drawerContent.innerHTML = '';
        this.classList.add(this.classesToRemoveOnLoad);
      }

      getProductQuickViewSectionId() {
        let sectionId = FoxTheme.QuickViewSectionId || false;

        if (!sectionId) {
          // Get section id from overlay groups.
          const productQuickView = document.querySelector('.section-group-overlay-quick-view');
          if (productQuickView) {
            sectionId = FoxTheme.utils.getSectionId(productQuickView);
          }

          // Cache for better performance.
          FoxTheme.QuickViewSectionId = sectionId;
        }

        return sectionId;
      }

      renderContent(content) {
        // Clear content of ALL other quick view modals to prevent conflicts
        document.querySelectorAll('quick-view-modal .quick-view__content').forEach((element) => {
          if (element !== this.querySelector(this.selector)) {
            element.innerHTML = '';
          }
        });

        this.setInnerHTML(this.querySelector(this.selector), content);
        if (window.Shopify && Shopify.PaymentButton) {
          Shopify.PaymentButton.init();
        }

        // Announce the product once it is in front of the buyer, after the show transition.
        this.hasNewContent = true;
        if (this.isShown) this.announceContent();
      }

      announceContent() {
        // No trapFocus here: handleAfterShow has trapped focus on the rendered content already, and trapping
        // again on the element that already has focus drops the Tab handling (no new focusin re-arms it).
        this.hasNewContent = false;

        // shopify:product:view (context: dialog) — the product is now in front of the buyer.
        this.querySelector(this.selector).querySelector('storefront-view-event')?.dispatchViewEvent?.();

        document.dispatchEvent(
          new CustomEvent('quick-view:loaded', {
            detail: { productUrl: this.dataset.productUrl }
          })
        );
      }

      setInnerHTML(element, innerHTML) {
        element.innerHTML = innerHTML;
        element.querySelectorAll('script').forEach((oldScriptTag) => {
          // Loaded already by loadAssets(): running it again would only repeat the guarded defines.
          const src = oldScriptTag.getAttribute('src');
          if (src && assetLoads.has(new URL(src, window.location.href).href)) return;

          const newScriptTag = document.createElement('script');
          Array.from(oldScriptTag.attributes).forEach((attribute) => {
            newScriptTag.setAttribute(attribute.name, attribute.value);
          });
          newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
          oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
        });

        this.classList.remove(this.classesToRemoveOnLoad);
      }
    }
  );
}
