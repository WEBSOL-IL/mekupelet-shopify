if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      abortController = undefined;
      onVariantChangeUnsubscriber = undefined;
      pendingRequestUrl = null;
      preProcessHtmlCallbacks = [];
      postProcessHtmlCallbacks = [];
      cachedVariants = null;
      cachedVariantsSource = null;
      variantDataAbortController = undefined;
      variantDataToken = null;

      constructor() {
        super();
      }

      get variantSelectors() {
        return this.querySelector('variant-selects');
      }

      get productId() {
        return this.getAttribute('data-product-id');
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section;
      }

      get pickupAvailability() {
        return this.querySelector(`pickup-availability`);
      }

      get quantityInput() {
        return this.querySelector('quantity-input input');
      }

      get productMediaWrapper() {
        return (this._productMediaWrapper = this._productMediaWrapper || this.querySelector('.product__media-wrapper'));
      }

      connectedCallback() {
        this.initializeProductSwapUtility();

        this.onVariantChangeUnsubscriber = FoxTheme.pubsub.subscribe(
          FoxTheme.pubsub.PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleOptionValueChange.bind(this)
        );

        this.initQuantityHandlers();

        this.currentVariant = this.getSelectedVariant(this);
        if (this.currentVariant) {
          this.updateMedia(this.currentVariant);
        }

        if (this.productMediaWrapper) {
          this.blockPositionHandler = this.handleBlocksPosition.bind(this);
          this.handleBlocksPosition();
          document.addEventListener('matchMobile', this.blockPositionHandler);
          document.addEventListener('unmatchMobile', this.blockPositionHandler);
        }
      }

      handleBlocksPosition() {
        const isMobile = FoxTheme.config.mqlMobile;
        const blocks = this.querySelectorAll(`.product__block[data-show-below-media="true"]`);

        blocks.forEach((block) => {
          const blockId = block.dataset.blockId;
          const blockPlacement = this.productMediaWrapper.querySelector(`[data-block-id="${blockId}"]`);
          if (!blockPlacement) return;

          if (isMobile) {
            const isMoveToMedia = block.hasAttribute('data-moved-below-media');
            if (isMoveToMedia) {
              this.moveChildNodes(blockPlacement, block);
              block.removeAttribute('data-moved-below-media');
            }
          } else {
            this.moveChildNodes(block, blockPlacement);
            block.setAttribute('data-moved-below-media', '');
          }
        });
      }

      moveChildNodes(from, to) {
        while (from.firstChild) {
          to.appendChild(from.firstChild);
        }
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber();
        this.variantDataAbortController?.abort();
      }

      initializeProductSwapUtility() {
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init();
          window?.ProductModel?.loadShopifyXR();
        });
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return;

        this.resetProductFormState();

        // A new selection supersedes any variant-data answer still in flight. Its options check is not
        // enough on its own: after a combined-listing swap the old picker, still holding the old
        // selection, stays in the DOM for 500ms, while #product-form- already resolves to the new
        // product's form.
        this.variantDataAbortController?.abort();
        this.variantDataToken = null;

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url;
        const shouldSwapProduct = this.dataset.url !== productUrl;
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct;
        const viewMode = this.dataset.viewMode || 'main-product';
        const productSelect = this.startProductSelect();

        // Answer the click with what the variant JSON already knows, then let the fetch below settle
        // the rest. A combined-listing swap, or a product too large to cache, has nothing to answer
        // with yet and falls back to the pending state until the fetch resolves.
        const optimisticVariant = shouldSwapProduct ? null : this.getVariantFromCache();
        if (optimisticVariant) {
          this.applyOptimisticUpdate(optimisticVariant, productUrl);
        } else {
          const cacheIsComplete = !!this.getVariantsCache() && this.isVariantsCacheComplete();

          // A complete cache with no match confirms the combination doesn't exist, so the unavailable
          // state can be shown immediately rather than waiting on a fetch.
          if (!shouldSwapProduct && cacheIsComplete) {
            this.updateURL(productUrl, null);
            this.updateVariantInputs(null);
            this.setUnavailable();
          } else {
            this.toggleAddButton(true);
          }

          // A complete cache (under the 250-variant cap) that found no match means this combination
          // genuinely doesn't exist - fetchVariantData's own round trip would only rediscover the same
          // "no variant" answer (see its own comment on Shopify's option_values fallback), so it isn't
          // worth spending. Past the cap the cache can't tell "impossible" from "just not cached", so
          // the fetch still runs.
          if (!shouldSwapProduct && !cacheIsComplete) this.fetchVariantData(productUrl, selectedOptionValues);
        }

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct
            ? this.handleSwapProduct(productUrl, shouldFetchFullPage, viewMode, productSelect)
            : this.handleUpdateProductInfo(productUrl, viewMode, productSelect),
          onError: (error) => productSelect?.reject(error)
        });
      }

      /**
       * Dispatches shopify:product:select as the variant lookup starts. A selection made before the
       * previous lookup finished supersedes it, so the older event's promise rejects rather than hanging.
       */
      startProductSelect() {
        this.pendingProductSelect?.reject(new DOMException('Superseded by a newer selection', 'AbortError'));

        const productSelect = FoxTheme.storefrontEvents?.start(this, 'ProductSelectEvent', {
          product: { id: this.productId, title: this.dataset.productTitle, handle: this.dataset.productHandle },
          selectedOptions: this.variantSelectors?.selectedOptions || []
        });
        this.pendingProductSelect = productSelect;
        return productSelect;
      }

      /** Resolves shopify:product:select with the variant the options map to, or null when none does. */
      resolveProductSelect(productSelect, variant, html) {
        if (!productSelect) return;

        const optionInputs = html.querySelectorAll('variant-selects [data-option-name]');
        const optionNames = [...new Set(Array.from(optionInputs, (input) => input.dataset.optionName))];
        productSelect.resolve({ variant: FoxTheme.storefrontEvents.toVariant(variant, optionNames) });
        if (this.pendingProductSelect === productSelect) this.pendingProductSelect = null;
      }

      get productForm() {
        return this.querySelector('form[is="product-form"');
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.resetFormState();
      }

      handleSwapProduct(productUrl, updateFullPage, viewMode, productSelect) {
        return async (html) => {
          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info';
          const variant = this.getSelectedVariant(html.querySelector(selector));
          this.resolveProductSelect(productSelect, variant, html);

          this.updateURL(productUrl, variant?.id);

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML;
            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
            HTMLUpdateUtility.viewTransition(
              document.getElementById('shopify-section-sticky-atc-bar'),
              html.getElementById('shopify-section-sticky-atc-bar'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks
            );
          } else {
            // Waits for the new product's stylesheets only: its markup would otherwise land unstyled.
            const request = this.abortController;
            await this.loadSwapAssets(html);
            // A newer selection started its own request meanwhile: this product is no longer the one asked for.
            if (this.abortController !== request || !this.isConnected) return;

            // The rest of what quick view / featured product keep beside product-info for the product: the
            // 3D models' JSON the XR button reads (loadShopifyXR() below picks it up), and the recently
            // viewed record. Both run on insertion.
            html.querySelectorAll('script[type="application/json"][id^="ProductJSON-"], product-recently-viewed').forEach((node) => {
              if (node.closest('product-info') || (node.id && document.getElementById(node.id))) return;
              this.parentElement?.append(document.importNode(node, true));
            });

            HTMLUpdateUtility.viewTransition(this, html.querySelector('product-info'), this.preProcessHtmlCallbacks, [
              ...this.postProcessHtmlCallbacks,
              // A quick view announces its product when it opens (trigger: manual): announce the new one too.
              // Featured product's view element fires on its own as it connects.
              (node) => node.querySelector('storefront-view-event[view-event-trigger="manual"]')?.dispatchViewEvent?.()
            ]);
          }

          this.currentVariant = variant;
        };
      }

      /**
       * Only this element is swapped here, but quick view and featured product declare part of their
       * assets beside it, conditional on the product: volume pricing (its CSS, show-more.js,
       * price-per-item.js), 3D models, the gallery and zoom. Swapping to a product that needs one the
       * first product didn't would leave it unstyled or undefined, so add whatever the page lacks.
       * Assets inside product-info come along with it.
       */
      loadSwapAssets(html) {
        const stylesheetLoads = [];

        html.querySelectorAll('link[rel="stylesheet"][href], script[src]').forEach((tag) => {
          if (tag.closest('product-info')) return;

          const isStylesheet = tag.tagName === 'LINK';
          const url = new URL(tag.getAttribute(isStylesheet ? 'href' : 'src'), window.location.href).href;
          const onPage = isStylesheet
            ? Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => link.href === url)
            : Array.from(document.scripts).some((script) => script.src === url);
          if (onPage) return;

          if (isStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            stylesheetLoads.push(new Promise((resolve) => (link.onload = link.onerror = resolve)));
            document.head.append(link);
          } else {
            const script = document.createElement('script');
            script.src = url;
            // In order, like the defer tags they stand in for.
            script.async = false;
            document.head.append(script);
          }
        });

        // Capped, so a stylesheet that never answers can't hold the swap.
        return Promise.race([Promise.all(stylesheetLoads), new Promise((resolve) => setTimeout(resolve, 3000))]);
      }

      handleUpdateProductInfo(productUrl, viewMode, productSelect) {
        return (html) => {
          const variant = this.getSelectedVariant(html);
          this.resolveProductSelect(productSelect, variant, html);

          // The render settles everything a pending variant-data answer would; arriving after it, that
          // answer would only patch and publish the same variant a second time.
          this.variantDataAbortController?.abort();
          this.variantDataToken = null;

          this.pickupAvailability?.update(variant);
          this.updateOptionValues(html);
          this.updateURL(productUrl, variant?.id);
          this.updateShareUrl(variant?.id);
          this.updateVariantInputs(variant?.id);

          if (!variant) {
            this.setUnavailable();
            return;
          }

          // hide_variant_media products never touch the media DOM optimistically (see
          // applyOptimisticUpdate) - the fetched section HTML is the only source of truth for which
          // media belongs to the new variant, so it's swapped in wholesale here rather than reordered
          // client-side.
          const productMedia = this.querySelector(`[id^="MediaGallery-${this.dataset.section}"]`);
          const newMediaGallery = html.querySelector(`[id^="MediaGallery-${this.sectionId}"]`);
          // Swapped only when the new variant shows a different set of media: changing an option the
          // media doesn't depend on (a size, a material) would otherwise reload every image and rebuild
          // the sliders for the same gallery. Compared as a set because a grid gallery is reordered
          // client side (sortMediaItems); updateMedia() below puts the variant's media first either way.
          if (
            productMedia?.dataset.hideVariantMedia === 'true' &&
            newMediaGallery &&
            this.getMediaIds(productMedia) !== this.getMediaIds(newMediaGallery)
          ) {
            HTMLUpdateUtility.viewTransition(productMedia, newMediaGallery, this.preProcessHtmlCallbacks, [
              ...this.postProcessHtmlCallbacks,
              // connectedCallback only wires up FoxTheme.Motion.inView, which waits on an
              // IntersectionObserver tick before building Swiper - a real gap on a gallery that's
              // already on screen (the shopper just clicked the swatch next to it), during which the
              // un-sliced thumbnail markup is visible without Swiper's layout applied yet. Calling
              // init() here runs it immediately instead; it's a no-op if the observer already won the
              // race (init() guards on this.initialized).
              // Before init(): the slider measures the layout these classes set.
              (node) => this.updateMediaCountClasses(node),
              (node) => node.init?.()
            ]);
          } else {
            this.updateMedia(variant);
          }

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`);
            const destination = this.querySelector(`#${id}-${this.dataset.section}`);
            if (source && destination) {
              // Price, SKU, barcode and inventory are role="status" regions the optimistic patch has usually
              // written already: rewriting the same content would have them announced a second time. The
              // badges too, which would otherwise be rebuilt for nothing.
              const isPatchedOptimistically = ['price', 'Sku', 'Barcode', 'Inventory', 'Badges'].includes(id);
              if (!isPatchedOptimistically || this.getRenderedSignature(source) !== this.getRenderedSignature(destination)) {
                destination.innerHTML = source.innerHTML;
              }
              destination.classList.toggle('hidden', shouldHide(source));
            }
          };

          updateSourceFromDestination('price');
          updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Barcode', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Inventory', ({ innerText }) => innerText === '');
          updateSourceFromDestination('Badges', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('PricePerItem', ({ classList }) => classList.contains('hidden'));
          updateSourceFromDestination('Volume');

          this.updateQuantityRules(this.sectionId, this.productId, html);
          this.querySelector(`#QuantityRules-${this.dataset.section}`)?.classList.remove('hidden');
          this.querySelector(`#VolumeNote-${this.dataset.section}`)?.classList.remove('hidden');

          HTMLUpdateUtility.viewTransition(
            document.querySelector(`#SizeChart-${this.sectionId}`),
            html.querySelector(`#SizeChart-${this.sectionId}`),
            this.preProcessHtmlCallbacks,
            this.postProcessHtmlCallbacks
          );

          const addButtonUpdated = html.getElementById(`ProductSubmitButton-${this.sectionId}`);
          this.toggleAddButton(
            addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true,
            FoxTheme.variantStrings.soldOut
          );

          document.dispatchEvent(
            new CustomEvent('variant:changed', {
              detail: {
                variant
              }
            })
          );

          FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant
            }
          });
        };
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = [];

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`);

        // A combined-listing value's product_url can already pin a variant (`?variant=`): Shopify adds it
        // when the current selection does not exist on that product, so it must win over option_values.
        const pinsVariant = url.includes('variant=');
        if (optionValues.length && !pinsVariant) {
          params.push(`option_values=${optionValues.join(',')}`);
        }

        return `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}`;
      }

      getSelectedVariant(productInfoNode) {
        const selectedVariant = productInfoNode.querySelector('variant-selects [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      getVariantsCache() {
        const script = this.querySelector('variant-selects [data-variants-cache]');
        if (!script) return null;

        // Re-parse when the JSON changed: the picker is patched in place by each render (updateOptionValues),
        // and past 250 variants the neighbourhood it holds follows the selection.
        const json = script.textContent;
        if (this.cachedVariantsSource !== json) {
          try {
            this.cachedVariants = JSON.parse(json);
          } catch (error) {
            console.error('Failed to parse the variants cache:', error);
            this.cachedVariants = null;
          }
          this.cachedVariantsSource = json;
        }

        return this.cachedVariants;
      }

      // Set by product-variant-picker.liquid: false for the option-value neighbourhood of a product past
      // 250 variants, whose length says nothing about whether it holds every variant.
      isVariantsCacheComplete() {
        return this.querySelector('variant-selects [data-variants-cache]')?.dataset.complete === 'true';
      }

      // The same nodes variant-selects reads for selectedOptionValues, so the two never disagree.
      //
      // Scoped to the picker rather than to this element: the picker is patched in place now
      // (updateOptionValues), but a viewTransition of the whole product (combined-listing swap) keeps the
      // old node beside the new one for 500ms, and a query from here would span both - one selection
      // appended to another, which every optimistic path's length check refuses.
      getSelectedOptionValues() {
        const picker = this.variantSelectors;
        if (!picker) return [];

        return Array.from(picker.querySelectorAll('select option[selected], fieldset input:checked')).map(
          (element) => element.value
        );
      }

      matchesOptions(variant, selectedValues) {
        return (
          selectedValues.length > 0 &&
          variant.options.length === selectedValues.length &&
          variant.options.every((option, index) => option === selectedValues[index])
        );
      }

      getVariantFromCache(selectedValues = this.getSelectedOptionValues()) {
        const variants = this.getVariantsCache();
        if (!variants) return null;

        return variants.find((variant) => this.matchesOptions(variant, selectedValues)) || null;
      }

      // The cache could not answer, which on a product past 250 variants is every click. Ask the
      // server for that one variant instead of waiting on the section render: still a round trip, but
      // a few hundred bytes rather than the whole section, so price and button land noticeably sooner.
      fetchVariantData(productUrl, optionValues) {
        if (!optionValues.length) return;

        this.variantDataAbortController?.abort();
        this.variantDataAbortController = new AbortController();

        const token = {};
        this.variantDataToken = token;

        fetch(`${productUrl}?section_id=variant-data&option_values=${optionValues.join(',')}`, {
          signal: this.variantDataAbortController.signal
        })
          .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.status))))
          .then((responseText) => {
            // A newer click owns the UI by now; this answer describes a variant nobody is looking at.
            if (this.variantDataToken !== token) return;

            const json = new DOMParser().parseFromString(responseText, 'text/html').body.textContent.trim();
            const variant = json ? JSON.parse(json) : null;

            // Shopify resolves option_values server-side, but a set it cannot resolve falls back to
            // the default variant rather than to nothing - a bogus option value id comes back as the
            // current variant, not null. So patch only when the answer describes the combination that
            // was actually asked for; anything else is left to the render and its setUnavailable.
            if (variant && this.matchesOptions(variant, this.getSelectedOptionValues())) {
              this.applyOptimisticUpdate(variant, productUrl);
            }
          })
          .catch((error) => {
            if (error.name !== 'AbortError') console.error('Variant data fetch failed:', error);
          });
      }

      applyOptimisticUpdate(variant, productUrl) {
        // Before toggleAddButton(false): it only re-enables once the form carries a variant id.
        this.updateVariantInputs(variant.id);

        // Quantity rules (B2B) give the quantity input its min/step/max from the variant and from what is
        // already in the cart, which only the render knows. Until it lands, a non-default rule on either
        // side would let the current input add a quantity the new variant refuses, so the buttons stay
        // pending; everything else still updates now.
        const awaitsQuantityRules = !this.isDefaultQuantityRule(variant.quantity_rule) || !this.isDefaultQuantityRule(this.getInputQuantityRule());
        if (variant.available) {
          // The text too: the previous variant may have left "Sold out" on a button now merely pending.
          this.toggleAddButton(awaitsQuantityRules, FoxTheme.variantStrings.addToCart);
        } else {
          this.toggleAddButton(true, FoxTheme.variantStrings.soldOut);
        }

        // Both callers only ever reach here for the product already on screen (a combined-listing
        // swap skips the optimistic path entirely), so this can only ever set/clear ?variant= - never
        // change the path - matching what updateURL already does for the section-render path.
        this.updateURL(productUrl, variant.id);

        // setUnavailable() hides this element when no variant matches the selection; a real variant
        // is known here, so it belongs visible again regardless of volume pricing - that only decides
        // whether its *content* is rewritten below or left to the fetch.
        const price = this.querySelector(`#price-${this.dataset.section}`);
        price?.classList.remove('hidden');

        // Quantity price breaks render a price range the variant JSON cannot express. #VolumeNote-
        // exists only in that case, so its presence is the signal to leave the price to the fetch.
        const hasVolumePricing = !!this.querySelector(`#VolumeNote-${this.dataset.section}`);
        if (!hasVolumePricing) {
          FoxTheme.updatePriceFromVariant(price, variant);
        }

        // hide_variant_media products leave media to the real section fetch (handleUpdateProductInfo
        // swaps the whole gallery from the fetched HTML) rather than reordering client-side: the
        // filtered set the gallery shows depends on server-rendered sorted_media, which the trimmed
        // cache/variant-data shape doesn't carry.
        const productMedia = this.querySelector(`[id^="MediaGallery-${this.dataset.section}"]`);
        if (variant.featured_media && productMedia?.dataset.hideVariantMedia !== 'true') {
          this.updateMedia(variant);
        }

        // Everything else the variant JSON can answer, so none of it sits on the previous variant until
        // the render lands. Pickup availability still needs its own request, but it starts now.
        this.updateBadges(variant);
        this.updateInventory(variant);
        this.updateVariantMeta('Sku', variant.sku);
        this.updateVariantMeta('Barcode', variant.barcode);
        this.updateShareUrl(variant.id);
        this.pickupAvailability?.update(variant);

        // Publishes the same event handleUpdateProductInfo does once the fetch settles, just sooner -
        // every subscriber only reads fields already on the trimmed cache/variant-data shape (id,
        // price, compare_at_price, unit_price_measurement, unit_price, available), so nothing here
        // needs subscriber-specific branching. `html: null` mirrors "not fetched yet"; skipped for
        // volume pricing for the same reason the price patch above is - price-per-item.js recomputes
        // its table on every variantChange, and firing this a second time once the real fetch lands
        // would redo that work for no visible gain.
        if (!hasVolumePricing) {
          FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html: null,
              variant
            }
          });
        }
      }

      renderProductInfo({ requestUrl, targetId, callback, onError }) {
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null;
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            // Returned: a swap waits on the new product's stylesheets, and focus should follow it.
            return callback(html);
          })
          .then(() => {
            // set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus();
          })
          .catch((error) => {
            onError?.(error);
            if (error.name === 'AbortError') {
              console.log('Fetch aborted by user');
            } else {
              console.error(error);
            }
          });
      }

      // Patched in place rather than swapped for the rendered picker. A swap lands ~1s after a click - right
      // when the shopper, who saw that click take effect at once, presses the next option: pressed on the
      // old picker and released on the new one, the press has no single target and the browser drops the
      // click ("had to click twice"). The rendered picker only differs in what this patches: values'
      // availability, the selection, the labels and the JSON scripts.
      updateOptionValues(html) {
        const variantSelects = html.querySelector('variant-selects');
        const current = this.variantSelectors;
        if (!variantSelects || !current) return;

        this.preProcessHtmlCallbacks.forEach((callback) => callback(variantSelects));
        this.morphNode(current, variantSelects);
      }

      // Makes `from` match `to` while keeping `from`'s nodes wherever both have the same structure; only a
      // subtree that differs in shape is replaced.
      morphNode(from, to) {
        Array.from(to.attributes).forEach(({ name, value }) => {
          if (from.getAttribute(name) !== value) from.setAttribute(name, value);
        });
        Array.from(from.attributes).forEach(({ name }) => {
          if (!to.hasAttribute(name)) from.removeAttribute(name);
        });

        // State the attributes only seed: a radio's `checked`, an option's `selected`.
        if (from.tagName === 'INPUT') from.checked = to.hasAttribute('checked');
        if (from.tagName === 'OPTION') from.selected = to.hasAttribute('selected');

        const fromNodes = Array.from(from.childNodes);
        const toNodes = Array.from(to.childNodes);
        const sameShape =
          fromNodes.length === toNodes.length &&
          fromNodes.every(
            (node, index) => node.nodeType === toNodes[index].nodeType && node.nodeName === toNodes[index].nodeName
          );

        if (!sameShape) {
          from.replaceChildren(...toNodes.map((node) => document.importNode(node, true)));
          return;
        }

        fromNodes.forEach((node, index) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.morphNode(node, toNodes[index]);
          } else if (node.nodeValue !== toNodes[index].nodeValue) {
            node.nodeValue = toNodes[index].nodeValue;
          }
        });
      }

      updateURL(url, variantId) {
        if (this.dataset.updateUrl === 'false') return;

        const parsedUrl = new URL(url, window.location.origin);

        if (variantId) {
          parsedUrl.searchParams.set('variant', variantId);
        } else {
          parsedUrl.searchParams.delete('variant');
        }

        window.history.replaceState({}, '', parsedUrl);
      }

      updateVariantInputs(variantId) {
        document
          .querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`)
          .forEach((productForm) => {
            const input = productForm.querySelector('input[name="id"]');
            input.value = variantId ?? '';
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
      }

      updateMedia(variant) {
        const productMedia = this.querySelector(`[id^="MediaGallery-${this.dataset.section}"]`);
        if (!productMedia) return; // Early return if productMedia is not found

        const setActiveMedia = () => {
          if (typeof productMedia.setActiveMedia === 'function') {
            productMedia.init();
            productMedia.setActiveMedia(variant);
            return true; // Indicate success
          }
          return false; // Indicate failure
        };

        // One retry loop at a time: a second one overwriting this.timer would leave the first running
        // forever, sliding the gallery back to its (older) variant every 100ms.
        clearInterval(this.timer);
        if (!setActiveMedia()) {
          this.timer = setInterval(() => {
            if (setActiveMedia()) {
              clearInterval(this.timer);
            }
          }, 100);
        }
      }

      // Shopify's rule for a variant without one: min 1, step 1, no max. A missing rule (no quantity input,
      // an older cache) reads as the default.
      isDefaultQuantityRule(rule) {
        return !rule || (Number(rule.min) === 1 && Number(rule.increment) === 1 && rule.max == null);
      }

      // The rule the quantity input was rendered with (buy-buttons.liquid), before any cart adjustment.
      getInputQuantityRule() {
        const input = this.quantityInput;
        if (!input) return null;

        return {
          min: input.dataset.min,
          max: input.dataset.max ?? null,
          increment: input.getAttribute('step')
        };
      }

      // Mirrors product-badges.liquid, from the config it renders (data-badges-config): the tag badges and a sale badge while the
      // variant is in stock, the sold-out badge otherwise. Done on the click like the price: the badge row
      // sits above the variant picker, and changed only once the render lands it would move the picker
      // while the shopper is already aiming at the next option.
      updateBadges(variant) {
        const badges = this.querySelector(`#Badges-${this.dataset.section}`);
        if (!badges?.dataset.badgesConfig || variant.in_stock === undefined) return;

        let config;
        try {
          config = JSON.parse(badges.dataset.badgesConfig);
        } catch (error) {
          return;
        }

        let html = '';
        if (variant.in_stock) {
          html = config.tags;
          const { price, compare_at_price } = variant;
          if (config.showSale && compare_at_price > price) {
            let text = config.onSaleText;
            if (config.saleType === 'percentage') {
              // Liquid's integer divided_by floors.
              text = config.saveText.replace('[amount]', `${Math.floor(((compare_at_price - price) * 100) / compare_at_price)}%`);
            } else if (config.saleType === 'fixed_amount') {
              text = config.saveText.replace('[amount]', FoxTheme.Currency.formatMoney(compare_at_price - price, config.moneyFormat));
            }
            html += `<span class="f-badge f-badge--sale">${text}</span>`;
          }
        } else if (config.showSoldout) {
          html = `<span class="f-badge f-badge--soldout">${config.soldOutText}</span>`;
        }

        badges.innerHTML = html;
        // setUnavailable() hides the row for a combination that doesn't exist.
        badges.classList.remove('hidden');
      }

      // Mirrors the inventory block in product-information-blocks.liquid, from the status variant-json.liquid
      // computed against that block's threshold. Same reason as the badges: it sits above the picker, and
      // its low-stock bar comes and goes with the variant.
      updateInventory(variant) {
        const inventory = this.querySelector(`#Inventory-${this.dataset.section}`);
        if (!inventory?.dataset.inventoryConfig || !variant.inventory) return;

        let config;
        try {
          config = JSON.parse(inventory.dataset.inventoryConfig);
        } catch (error) {
          return;
        }

        const { status, quantity } = variant.inventory;
        if (status === 'untracked') {
          inventory.replaceChildren();
          inventory.classList.add('hidden');
          return;
        }

        const withQuantity = (text) => text.replace('[quantity]', quantity);
        const messages = {
          'low-stock': config.showQuantity ? withQuantity(quantity === 1 ? config.lowStockOne : config.lowStockMany) : config.lowStock,
          'in-stock': config.showQuantity ? withQuantity(config.inStockCount) : config.inStock,
          continue: config.continueSelling,
          'out-of-stock': config.outOfStock
        };
        // A continue-selling variant out of stock reads "in stock" (its class too), as in Liquid.
        const statusClass = status === 'continue' ? 'in-stock' : status;

        let html = `<p class="product__inventory product__inventory--${statusClass} font-body-bolder"><span class="product__inventory-icon"></span><span class="product__inventory-text">${messages[status]}</span></p>`;
        if (status === 'low-stock' && quantity !== null && quantity < config.threshold) {
          html += `<progress-bar class="product__inventory-stock-bar progress-bar" data-value="${quantity}" data-max="${config.threshold}"></progress-bar>`;
        }

        inventory.innerHTML = html;
        inventory.classList.remove('hidden');
      }

      // Mirrors the Sku / Barcode markup in product-information-blocks.liquid: label and value, or empty
      // and hidden when the variant has none.
      updateVariantMeta(id, value) {
        const meta = this.querySelector(`#${id}-${this.dataset.section}`);
        if (!meta || value === undefined) return;

        const label = document.createElement('span');
        label.textContent = `${meta.dataset.label}:`;
        const text = document.createElement('span');
        text.textContent = value;

        // The space the Liquid markup gets from the line break between its two spans.
        meta.replaceChildren(...(value ? [label, ' ', text] : []));
        meta.classList.toggle('hidden', !value);
      }

      // Text and classes rather than markup: the optimistic patch writes the same price with different
      // whitespace and class order than the Liquid render. data-value too: a low-stock bar's quantity.
      getRenderedSignature(node) {
        const classes = Array.from(
          node.querySelectorAll('*'),
          (element) => [...element.classList].sort().join('.') + (element.dataset.value ?? '')
        );
        return `${classes.join('|')}#${node.textContent.replace(/\s+/g, '')}`;
      }

      // The layout classes the section derives from the gallery's media count (product-gallery-media-ids):
      // with hide_variant_media a variant change can change that count, while the element carrying them
      // stays. Mirrors main-product.liquid / quick-view.liquid / featured-product.liquid.
      updateMediaCountClasses(mediaGallery) {
        const product = mediaGallery.closest('.product');
        if (!product) return;

        const count = mediaGallery.querySelectorAll('.product__media-item').length;
        [...product.classList]
          .filter((className) => /^product--media-has-\d+$/.test(className))
          .forEach((className) => product.classList.remove(className));
        product.classList.add(`product--media-has-${count}`);
        product.classList.toggle('product--media-has-many', count > 1);
        if (product.classList.contains('product--grid-mix')) {
          product.classList.toggle('product--odd-media', count % 3 === 2);
        }
      }

      getMediaIds(mediaGallery) {
        return Array.from(mediaGallery.querySelectorAll('.product__media-item'), (media) => media.dataset.mediaId)
          .sort()
          .join(',');
      }

      updateShareUrl(variantId) {
        if (!variantId) return;
        const shareButton = document.getElementById(`ProductShare-${this.dataset.section}`);
        if (!shareButton || !shareButton.updateUrl) return;
        shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${variantId}`);
      }

      toggleAddButton(disable = true, text, modifyClass = true) {
        const productForm = document.getElementById(`product-form-${this.dataset.section}`);
        if (!productForm) return;
        const addButton = productForm.querySelector('[name="add"]');
        const addButtonText = productForm.querySelector('[name="add"] > span');
        if (!addButton) return;

        if (disable) {
          addButton.setAttribute('disabled', 'disabled');
          if (text) addButtonText.textContent = text;
        } else {
          addButton.removeAttribute('disabled');
          addButtonText.innerHTML = FoxTheme.variantStrings.addToCart;
        }

        // The dynamic checkout button reads the same variant id but only disables itself for a sold-out
        // variant: while a selection is pending the id is still the previous variant's, and Buy it now
        // would check that one out.
        productForm.querySelector('.shopify-payment-button')?.toggleAttribute('inert', disable);

        if (!modifyClass) return;
      }

      setUnavailable() {
        this.toggleAddButton(true, FoxTheme.variantStrings.unavailable);
        const price = document.getElementById(`price-${this.dataset.section}`);
        const inventory = document.getElementById(`Inventory-${this.dataset.section}`);
        const sku = document.getElementById(`Sku-${this.dataset.section}`);

        if (price) price.classList.add('hidden');
        if (inventory) inventory.classList.add('hidden');
        if (sku) sku.classList.add('hidden');

        // Everything else that describes the previous variant (a "Save 20%" badge, its barcode, quantity
        // rules and volume pricing). The next real variant's render shows them again.
        ['Barcode', 'Badges', 'QuantityRules', 'Volume', 'PricePerItem'].forEach((id) =>
          document.getElementById(`${id}-${this.dataset.section}`)?.classList.add('hidden')
        );

        // So the sticky bars stop offering the previous variant: they read variant: null as unavailable.
        FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId: this.sectionId,
            html: null,
            variant: null
          }
        });
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return;

        this.setQuantityBoundries();
        if (!this.hasAttribute('data-original-section')) {
          this.cartUpdateUnsubscriber = FoxTheme.pubsub.subscribe(
            FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate,
            this.fetchQuantityRules.bind(this)
          );
        }
      }

      setQuantityBoundries() {
        FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.quantityBoundries, {
          data: {
            sectionId: this.sectionId,
            productId: this.productId
          }
        });
      }

      fetchQuantityRules() {
        const currentVariantId = this.productForm?.productIdInput?.value;
        if (!currentVariantId) return;

        this.querySelector('.quantity__rules-cart')?.classList.add('btn--loading');

        fetch(`${this.getAttribute('data-url')}?variant=${currentVariantId}&section_id=${this.sectionId}`)
          .then((response) => response.text())
          .then((responseText) => {
            const parsedHTML = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateQuantityRules(this.sectionId, this.productId, parsedHTML);
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            this.querySelector('.quantity__rules-cart')?.classList.remove('btn--loading');
          });
      }

      updateQuantityRules(sectionId, productId, parsedHTML) {
        if (!this.quantityInput) return;

        FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.quantityRules, {
          data: {
            sectionId,
            productId,
            parsedHTML
          }
        });

        this.setQuantityBoundries();
      }
    }
  );
}

if (!customElements.get('product-promotion-alert')) {
  customElements.define(
    'product-promotion-alert',
    class ProductPromotionAlert extends HTMLElement {
      constructor() {
        super();

        this.abortController = new AbortController();
        this.buttonEl = this.querySelector('button');
        this.buttonEl.addEventListener('click', this.onClick.bind(this), {
          signal: this.abortController.signal
        });
      }

      onClick(evt) {
        evt.preventDefault();

        this.closest('.product__block').classList.add('hidden');
      }

      disconnectedCallback() {
        this.abortController.abort();
      }
    }
  );
}
