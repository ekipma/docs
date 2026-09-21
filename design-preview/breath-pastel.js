/* Keep variant copy accurate without changing the shared Breathe prototype. */
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const syncTheme = () => {
    const dark = root.dataset.theme === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.textContent = dark ? '☀ Light mode' : '☾ Dark mode';
    document.querySelectorAll('.setting-row').forEach(row => {
      if (row.firstElementChild?.firstChild?.textContent === 'Appearance') {
        row.querySelector(':scope > span').textContent = dark ? 'Dark' : 'Light';
      }
    });
  };
  const setTheme = theme => {
    root.dataset.theme = theme;
    try { localStorage.setItem('ekipma-pastel-theme', theme); } catch { /* Works for this session when storage is unavailable. */ }
    syncTheme();
  };
  toggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  const refreshCopy = () => {
    if (document.querySelector('.phone').dataset.route === 'home') {
      document.querySelector('#page-description').textContent = 'A smooth violet balance orb, soft glass surfaces, and diffuse pastel shadows. Simple navigation keeps attention on your balance and your people. Compare light and dark using the design-menu toggle.';
    }
    document.querySelectorAll('#app-nav button').forEach(button => {
      const label = button.getAttribute('aria-label') || button.textContent.trim();
      button.setAttribute('aria-label', label);
      button.title = label;
      // Preserve the SVG and its accessible name, without a second visual label.
      [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
    });
    document.querySelectorAll('.setting-row').forEach(row => {
      if (row.firstElementChild?.firstChild?.textContent === 'Appearance') {
        row.querySelector('small').textContent = 'Breathe pastel';
      }
    });
    syncTheme();
  };
  new MutationObserver(refreshCopy).observe(document.querySelector('#screen'), { childList: true });
  refreshCopy();
})();
