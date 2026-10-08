if (!customElements.get('variant-selects')) {
  customElements.define(
    'variant-selects',
    class VariantSelects extends HTMLElement {
      constructor() {
        super();
      }

      get selectedOptionValues() {
        return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(
          ({ dataset }) => dataset.optionValueId
        );
      }

      /** The selection as `{ name, value }` pairs, the shape of Shopify's `SelectedOption`. */
      get selectedOptions() {
        return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(
          ({ dataset, value }) => ({ name: dataset.optionName, value })
        );
      }

      getInputForEventTarget(target) {
        return target.tagName === 'SELECT' ? target.selectedOptions[0] : target;
      }

      connectedCallback() {
        if (this._hasChangeListener) {
          return;
        }

        this._hasChangeListener = true;

        this.addEventListener(
          'change',
          (event) => {
            // Check if target is inside this element
            const targetInThisElement = this.contains(event.target);

            // Check if there's a nested variant-selects between this and target
            let hasNestedVariantSelects = false;
            let currentElement = event.target;

            while (currentElement && currentElement !== document.body) {
              if (currentElement.tagName === 'VARIANT-SELECTS') {
                if (currentElement !== this) {
                  hasNestedVariantSelects = true;
                  break;
                } else {
                  break;
                }
              }
              currentElement = currentElement.parentElement;
            }

            // Ignore if target is not in this element or there's a nested variant-selects
            if (!targetInThisElement || hasNestedVariantSelects) {
              return;
            }

            const target = this.getInputForEventTarget(event.target);
            this.updateSelectedSwatchValue(event);
            // A combined-listing value swaps to another product, which this product's cache knows nothing
            // about: leave availability to that product's render.
            if (!target.dataset.productUrl || target.dataset.productUrl === this.dataset.url) {
              this.updateOptionAvailability();
            }
            FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.optionValueSelectionChange, {
              data: {
                event,
                target,
                selectedOptionValues: this.selectedOptionValues,
              },
            });
          },
          true
        ); // Use CAPTURE phase to catch events before they bubble
      }

      updateSelectedSwatchValue({ target }) {
        const { value, tagName } = target;

        // The "Color: Red" label next to the option name - just the clicked value's own text, so
        // unlike price/button/media this needs no variant lookup to be correct instantly. Left to the
        // section render otherwise, it would sit on the previous value for however long that fetch
        // takes.
        const selectedLabel = target.closest('.product-form__input')?.querySelector('[data-selected-swatch-value]');
        if (selectedLabel) selectedLabel.textContent = value;

        if (tagName === 'SELECT' && target.selectedOptions.length) {
          Array.from(target.options)
            .find((option) => option.getAttribute('selected'))
            .removeAttribute('selected');
          target.selectedOptions[0].setAttribute('selected', 'selected');

          const swatchValue = target.selectedOptions[0].dataset.optionSwatchValue;
          const selectedDropdownSwatchValue = target
            .closest('.product-form__input')
            .querySelector('[data-selected-value] > .swatch');
          if (!selectedDropdownSwatchValue) return;
          if (swatchValue) {
            selectedDropdownSwatchValue.style.setProperty('--swatch--background', swatchValue);
            selectedDropdownSwatchValue.classList.remove('swatch--unavailable');
          } else {
            selectedDropdownSwatchValue.style.setProperty('--swatch--background', 'unset');
            selectedDropdownSwatchValue.classList.add('swatch--unavailable');
          }

          selectedDropdownSwatchValue.style.setProperty(
            '--swatch-focal-point',
            target.selectedOptions[0].dataset.optionSwatchFocalPoint || 'unset'
          );
        } else if (tagName === 'INPUT' && target.type === 'radio') {
          const selectedSwatchValue = target.closest(`.product-form__input`).querySelector('[data-selected-value]');
          if (selectedSwatchValue) selectedSwatchValue.innerHTML = value;
        }
      }

      getVariantsCache() {
        const script = this.querySelector('[data-variants-cache]');
        if (!script) return null;

        // By content: product-info patches this picker in place, so the same script carries new JSON.
        const json = script.textContent;
        if (this._cachedVariantsSource !== json) {
          try {
            this._cachedVariants = JSON.parse(json);
          } catch (error) {
            console.error('Failed to parse the variants cache:', error);
            this._cachedVariants = null;
          }
          this._cachedVariantsSource = json;
        }

        return this._cachedVariants;
      }

      // Marks every OTHER option value available/unavailable the instant one is picked, using the same
      // cache product-info.js reads for price/button - so "Size M" stops showing available the moment
      // "Color: Red" is picked if Red only ever came in S/L, instead of waiting on the section fetch.
      //
      // Availability cascades top-down, matching Shopify's own product_option_value.available: a value
      // at position P is available when some purchasable variant carries it AND matches the currently
      // selected values of every option BEFORE P (in declared order) - options AFTER P are wildcards,
      // not fixed to their current selection. So picking a color still leaves every size available that
      // color comes in at all, even if the size currently checked isn't one of them for that color; only
      // the option that comes after size (checked as-is) narrows further.
      //
      // Two guards keep this from ever answering with a wrong or partial picture:
      // - data-complete !== 'true': past the 250 cap the cache only holds the option-value
      //   neighbourhood (see product-variant-picker.liquid), so a value missing from it might just be
      //   outside it rather than genuinely impossible - leave every value as the server rendered it.
      // - groups.length !== variants[0].options.length: this picker isn't showing every option a real
      //   variant has (e.g. a product-card's single-option picker), so position P here wouldn't line up
      //   with position P in the cached variants.
      updateOptionAvailability() {
        const variants = this.getVariantsCache();
        if (!variants?.length) return;

        const groups = Array.from(this.querySelectorAll(':scope > .product-form__input'));
        const isComplete = this.querySelector('[data-variants-cache]')?.dataset.complete === 'true';
        if (!isComplete || groups.length !== variants[0].options.length) return;

        const selected = this.selectedOptions.map(({ value }) => value);

        groups.forEach((group, groupIndex) => {
          Array.from(group.querySelectorAll('input[type="radio"], option')).forEach((valueEl) => {
            // A combined-listing value points at a different product (see product-variant-picker.liquid's
            // data-product-url) - this product's own cache has nothing to say about that one's variants.
            if (valueEl.dataset.productUrl && valueEl.dataset.productUrl !== this.dataset.url) return;

            const available = variants.some(
              (variant) =>
                variant.available &&
                variant.options.every((option, index) =>
                  index === groupIndex ? option === valueEl.value : index < groupIndex ? option === selected[index] : true
                )
            );

            this.setValueAvailability(valueEl, available);
          });
        });
      }

      setValueAvailability(valueEl, available) {
        if (valueEl.tagName === 'OPTION') {
          valueEl.textContent = available
            ? valueEl.value
            : FoxTheme.variantStrings.unavailable_with_option.replace('[value]', valueEl.value);
        } else {
          valueEl.classList.toggle('disabled', !available);
        }
      }
    }
  );
}
