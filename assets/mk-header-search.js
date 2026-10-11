/* Mobile search toggle: the header search bar is hidden below the desktop breakpoint
   and opened from the icon next to the menu button. Opening reuses Hyper's own
   `search-open` body state, so Hyper's close button, overlay and menu-drawer logic
   close it again without any extra code here. */
(() => {
  const toggles = document.querySelectorAll('.mk-search-toggle');
  if (!toggles.length) return;

  const syncExpanded = () => {
    const open = document.body.classList.contains('search-open');
    toggles.forEach((btn) => btn.setAttribute('aria-expanded', open ? 'true' : 'false'));
  };

  toggles.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const header = btn.closest('header');
      const search = header && header.querySelector('.header__search');
      const input = search && search.querySelector('input[type="search"]');
      if (!search || !input) return;

      if (document.body.classList.contains('search-open')) {
        search.querySelector('.header__search-close')?.click();
        return;
      }

      document.body.classList.add('search-open');
      document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(header.getBoundingClientRect().bottom)}px`
      );
      // Let the bar render before focusing, so the keyboard opens on iOS/Android.
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    });
  });

  new MutationObserver(syncExpanded).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  syncExpanded();
})();
