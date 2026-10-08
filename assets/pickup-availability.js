if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();

        // Taken before the early return: a variant change can still fetch for a variant that has pickup
        // when the first one didn't, and update() empties the template out of the element.
        this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
        this.onClickRefreshList = this.onClickRefreshList.bind(this);

        if (!this.hasAttribute('available')) return;

        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        let rootUrl = this.dataset.rootUrl;
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

        // product-info asks twice per variant change (its optimistic update, then the section render)
        // and the shopper can change variants faster than this answers: only the latest request may
        // render, or an older variant's stores could land last.
        this.abortController?.abort();
        this.abortController = new AbortController();
        this.requestedVariantId = String(variantId);

        fetch(variantSectionUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            if (e.name === 'AbortError') return;
            const button = this.querySelector('button');
            if (button) button.removeEventListener('click', this.onClickRefreshList);
            this.renderError();
          });
      }

      onClickRefreshList(evt) {
        this.fetchAvailability(this.dataset.variantId);
      }

      update(variant) {
        if (variant?.available) {
          // Already requested by product-info's optimistic update for this same variant.
          if (String(variant.id) === this.requestedVariantId) return;
          this.fetchAvailability(variant.id);
        } else {
          this.abortController?.abort();
          this.requestedVariantId = null;
          this.removeAttribute('available');
          this.innerHTML = '';
        }
      }

      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);

        this.querySelector('button').addEventListener('click', this.onClickRefreshList);
      }

      renderPreview(sectionInnerHTML) {
        const drawer = document.querySelector('pickup-availability-drawer');
        if (drawer) drawer.remove();
        if (!sectionInnerHTML.querySelector('pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        this.innerHTML = sectionInnerHTML.querySelector('pickup-availability-preview').outerHTML;
        this.setAttribute('available', '');

        document.body.appendChild(sectionInnerHTML.querySelector('pickup-availability-drawer'));
      }
    }
  );
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define(
    'pickup-availability-drawer',
    class PickupAvailabilityDrawer extends BasicModal {
      constructor() {
        super();
      }
    }
  );
}
