/* Keep variant copy accurate without changing the shared Breathe prototype. */
(() => {
  const refreshCopy = () => {
    if (document.querySelector('.phone').dataset.route === 'home') {
      document.querySelector('#page-description').textContent = 'A luminous violet balance orb anchors the page. Pearl surfaces, pastel details, and a quiet plan card leave plenty of room for your people.';
    }
    document.querySelectorAll('.setting-row').forEach(row => {
      if (row.firstElementChild?.firstChild?.textContent === 'Appearance') {
        row.querySelector('small').textContent = 'Breathe pastel';
        row.querySelector(':scope > span').textContent = 'Light';
      }
    });
  };
  new MutationObserver(refreshCopy).observe(document.querySelector('#screen'), { childList: true });
  refreshCopy();
})();
