/*
  MK Gift finder. Progressive enhancement over a plain GET form: without JS the form still submits
  to the target collection (empty params included). With JS, empty selects are dropped and a
  "min-max" price value becomes filter.v.price.gte / filter.v.price.lte.
*/
if (!customElements.get('mk-gift-finder')) {
  customElements.define(
    'mk-gift-finder',
    class MkGiftFinder extends HTMLElement {
      connectedCallback() {
        this.form = this.querySelector('form');
        if (!this.form) return;
        this.form.addEventListener('submit', this.onSubmit.bind(this));
      }

      onSubmit(event) {
        event.preventDefault();
        const target = this.form.dataset.target || this.form.getAttribute('action') || '/collections/all';
        const url = new URL(target, window.location.origin);
        this.form.querySelectorAll('select[data-param]').forEach((select) => {
          const param = select.dataset.param;
          const value = select.value.trim();
          if (!value) return;
          if (param === 'filter.v.price') {
            const [min, max] = value.split('-').map((part) => part.trim());
            if (min !== '' && min !== undefined) url.searchParams.append('filter.v.price.gte', min);
            if (max !== '' && max !== undefined) url.searchParams.append('filter.v.price.lte', max);
            return;
          }
          url.searchParams.append(param, value);
        });
        window.location.assign(url.toString());
      }
    }
  );
}
