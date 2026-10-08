if (!customElements.get('predictive-search')) {
  customElements.define(
    'predictive-search',
    class PredictiveSearch extends HTMLElement {
      constructor() {
        super();
        this.cachedMap = new Map();
        this.focusElement = this.input;
        this.searchContent = this.querySelector('.search__content');
        this.searchRecommendationEmpty = this.dataset.searchRecommendationEmpty === 'true';
        this.header = document.querySelector('header');
        this.toggleNavigationButton = document.querySelector('.toggle-navigation-button');

        this.isHeaderSearch = this.closest('header') !== null;

        this.states = {
          OPEN: 'predictive-search-open',
          LOADING: 'btn--loading',
          SEARCH_OPEN: 'search-open'
        };
      }

      connectedCallback() {
        // The header and the search page re-render in the theme editor: the document listeners must go with them.
        this.abortController = new AbortController();
        const { signal } = this.abortController;

        this.resetButton.addEventListener('click', this.clear.bind(this), { signal });
        this.input.addEventListener('input', FoxTheme.utils.debounce(this.onChange.bind(this), 300), { signal });
        this.input.addEventListener('focus', this.onFocus.bind(this), { signal });
        document.addEventListener('click', this.handleClickOutside.bind(this), { signal });
        this.searchProductTypes?.addEventListener('change', this.handleProductTypeChange.bind(this), { signal });
        this.form?.addEventListener('submit', this.onSubmit.bind(this), { signal });

        document.addEventListener(
          'menu-drawer:open',
          () => {
            this.classList.remove('predictive-search-open');
            document.body.classList.remove('search-open');
          },
          { signal }
        );
      }

      disconnectedCallback() {
        this.abortController?.abort();
      }

      get input() {
        return this.querySelector('input[type="search"]');
      }
      get resetButton() {
        return this.querySelector('button[type="reset"]');
      }

      get searchProductTypes() {
        return this.querySelector('.search__types select');
      }

      get form() {
        return this.querySelector('form');
      }

      get headerCollapseOnScroll() {
        return this.header.dataset.collapseOnScroll === 'true';
      }

      onFocus(event) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty(
          '--header-bottom-position',
          `${parseInt(this.header.getBoundingClientRect().bottom)}px`
        );
        if (this.isHeaderSearch && !this.searchRecommendationEmpty) {
          document.body.classList.add('search-open');
          this.toggleNavButtonVisibility(false);
        }

        if (!this.searchRecommendationEmpty) {
          this.searchContent.classList.remove('hidden');
        }
        this.classList.add('predictive-search-open');
        if (this.getQuery().length === 0) {
          if (this.searchRecommendationEmpty) {
            this.searchContent.classList.add('hidden');
          }
          return;
        }
        const url = this.setupURL().toString();
        // Reopening shows the results of a query the buyer already searched: not a search update.
        this.renderSection(url, { isReopen: true });
      }

      getQuery() {
        return this.input.value.trim();
      }

      clear(event = null) {
        event?.preventDefault();
        this.input.value = '';
        this.input.focus();
        this.removeAttribute('results');
        this.toggleSearchState(false);
      }

      handleProductTypeChange(evt) {
        const query = this.getQuery();
        if (query.length > 0) {
          const url = this.setupURL().toString();
          this.renderSection(url);
        }
      }

      onSubmit(event) {
        const productType = this.searchProductTypes?.value;
        if (!productType) return;
        const query = this.getQuery();
        if (query.length === 0) return;
        if (query.startsWith('product_type:')) return;
        event.preventDefault();
        const params = new URLSearchParams();
        params.set('q', `product_type:${productType} AND ${query}`);
        params.set('options[prefix]', 'last');
        window.location.href = `${this.form.getAttribute('action')}?${params.toString()}`;
      }

      setupURL() {
        const url = new URL(`${window.shopUrl}${FoxTheme.routes.predictive_search_url}`);
        let search_term = this.getQuery();
        if (this.searchProductTypes && this.searchProductTypes.value != '') {
          search_term = `product_type:${this.searchProductTypes.value} AND ${encodeURIComponent(search_term)}`;
        }
        return (
          url.searchParams.set('q', search_term),
          url.searchParams.set('resources[limit]', this.dataset.resultsLimit || 3),
          url.searchParams.set('resources[limit_scope]', 'each'),
          url.searchParams.set('section_id', FoxTheme.utils.getSectionId(this)),
          url
        );
      }

      onChange() {
        if (this.getQuery().length === 0) {
          this.clear();
          return;
        }
        const url = this.setupURL().toString();
        this.renderSection(url);
      }

      renderSection(url, { isReopen = false } = {}) {
        const searchUpdate = isReopen
          ? null
          : FoxTheme.storefrontEvents?.start(this, 'SearchUpdateEvent', {
              search: { query: this.getQuery() }
            });

        this.cachedMap.has(url)
          ? this.renderSectionFromCache(url, searchUpdate)
          : this.renderSectionFromFetch(url, searchUpdate);
      }

      renderSectionFromCache(url, searchUpdate) {
        const responseText = this.cachedMap.get(url);
        (this.renderSearchResults(responseText), this.setAttribute('results', ''));
        searchUpdate?.resolve({ totalCount: this.getTotalResults() });
      }

      renderSectionFromFetch(url, searchUpdate) {
        this.setLoadingState(true);

        fetch(url)
          .then((response) => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
          })
          .then((responseText) => {
            this.renderSearchResults(responseText);
            this.cachedMap.set(url, responseText);
            searchUpdate?.resolve({ totalCount: this.getTotalResults() });
          })
          .catch((error) => {
            searchUpdate?.reject(error);
            console.error('Error fetching data: ', error);
            this.setAttribute('error', 'Failed to load data');
          })
          .finally(() => this.setLoadingState(false));
      }

      getTotalResults() {
        const results = document.getElementById(`PredictiveSearchResults-${FoxTheme.utils.getSectionId(this)}`);
        return Number(results?.querySelector('[data-total-results]')?.dataset.totalResults) || 0;
      }
      renderSearchResults(responseText) {
        const id = 'PredictiveSearchResults-' + FoxTheme.utils.getSectionId(this);
        const targetElement = document.getElementById(id);

        if (targetElement) {
          const parser = new DOMParser();
          const parsedDoc = parser.parseFromString(responseText, 'text/html');
          const contentElement = parsedDoc.getElementById(id);

          if (contentElement) {
            this.searchContent?.classList.remove('hidden');
            targetElement.innerHTML = contentElement.innerHTML;

            if (this.isHeaderSearch && !document.body.classList.contains('search-open')) {
              document.body.classList.add('search-open');
              this.toggleNavButtonVisibility(true);
              this.classList.add('predictive-search-open');
            } else {
              this.classList.add('predictive-search-open');
            }
          } else {
            console.error(`Element with id '${id}' not found in the parsed response.`);
          }
        } else {
          console.error(`Element with id '${id}' not found in the document.`);
        }
      }

      handleClickOutside(event) {
        const target = event.target;
        const shouldClose = this.isHeaderSearch
          ? !this.contains(target) &&
            ((target.classList.contains('fixed-overlay') && target.closest('.header-section')) ||
              target.classList.contains('header__search-close'))
          : !this.contains(target);

        if (shouldClose) {
          setTimeout(() => this.toggleSearchState(false));
        }
      }

      toggleSearchState(isOpen) {
        this.classList.toggle(this.states.OPEN, isOpen);
        if (this.isHeaderSearch) {
          document.body.classList.toggle(this.states.SEARCH_OPEN, isOpen);
          this.toggleNavButtonVisibility(!isOpen);
        }
        if (!isOpen && this.searchRecommendationEmpty) {
          this.searchContent?.classList.add('hidden');
        }
      }

      toggleNavButtonVisibility(isOpen) {
        this.toggleNavigationButton &&
          this.headerCollapseOnScroll &&
          this.toggleNavigationButton.classList.toggle('is-show', isOpen);
      }

      setLoadingState(isLoading) {
        if (isLoading) {
          this.setAttribute('loading', 'true');
          this.resetButton.classList.add(this.states.LOADING);
        } else {
          this.removeAttribute('loading');
          this.resetButton.classList.remove(this.states.LOADING);
          this.setAttribute('results', 'true');
        }
      }
    }
  );
}
