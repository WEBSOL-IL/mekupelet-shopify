/*
  MK FAQ tabs: accessible tab switching (click, arrow keys). Without JS the first panel is shown.
*/
if (!customElements.get('mk-faq-tabs')) {
  customElements.define(
    'mk-faq-tabs',
    class MkFaqTabs extends HTMLElement {
      connectedCallback() {
        this.tabs = [...this.querySelectorAll('[role="tab"]')];
        this.panels = [...this.querySelectorAll('[role="tabpanel"]')];
        if (this.tabs.length < 2) return;
        this.tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => this.select(index));
          tab.addEventListener('keydown', (event) => this.onKeydown(event, index));
        });
      }

      select(index) {
        this.tabs.forEach((tab, i) => {
          const active = i === index;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
          tab.tabIndex = active ? 0 : -1;
          const panel = document.getElementById(tab.getAttribute('aria-controls'));
          if (panel) panel.hidden = !active;
        });
        this.tabs[index].focus();
      }

      onKeydown(event, index) {
        const keys = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: this.tabs.length - 1 - index };
        if (!(event.key in keys)) return;
        event.preventDefault();
        const rtl = document.documentElement.dir === 'rtl';
        let step = keys[event.key];
        if (rtl && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) step = -step;
        this.select((index + step + this.tabs.length) % this.tabs.length);
      }
    }
  );
}
