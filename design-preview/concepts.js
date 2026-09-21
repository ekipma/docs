(() => {
  const select = document.getElementById('concept');
  const gallery = document.getElementById('gallery');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next-concept');
  const status = document.getElementById('view-status');
  const studies = [...document.querySelectorAll('[data-concept]')];
  const choices = ['all', ...studies.map(study => study.dataset.concept)];
  function render(value) {
    const choice = choices.includes(value) ? value : 'all';
    select.value = choice;
    studies.forEach(study => { study.hidden = choice !== 'all' && study.dataset.concept !== choice; });
    gallery.classList.toggle('focus', choice !== 'all');
    const index = choices.indexOf(choice);
    previous.disabled = index === 0;
    next.disabled = index === choices.length - 1;
    status.textContent = index === 0 ? '6 concepts' : `${index} / 6`;
  }
  function choose(value) {
    render(value);
    history.replaceState(null, '', select.value === 'all' ? location.pathname + location.search : '#' + select.value);
  }
  select.addEventListener('change', () => choose(select.value));
  previous.addEventListener('click', () => choose(choices[choices.indexOf(select.value) - 1]));
  next.addEventListener('click', () => choose(choices[choices.indexOf(select.value) + 1]));
  window.addEventListener('hashchange', () => render(location.hash.slice(1)));
  render(location.hash.slice(1));
})();
