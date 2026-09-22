/* Intro previews are local to Pastel; the shared Breathe router stays intact. */
(() => {
  const phone = document.querySelector('.phone');
  const replay = document.querySelector('#replay-launch');
  const intro = document.createElement('section');
  intro.className = 'pastel-intro';
  intro.hidden = true;
  intro.setAttribute('aria-label', 'Welcome to Ekipma');
  intro.innerHTML = `
    <h2 class="intro-brand" tabindex="-1">ekipma<span>•</span></h2>
    <div class="intro-art" aria-hidden="true">
      <div class="art-haze"></div>
      <div class="floating-receipt"><svg viewBox="0 0 42 48"><path d="M9 5h24v38l-6-4-6 4-6-4-6 4Z"/><path d="M15 15h12m-12 7h12m-12 7h7"/></svg></div>
      <div class="circle-sculpture"><i class="sculpture-ring ring-rose"></i><i class="sculpture-ring ring-cyan"></i><i class="sculpture-ring ring-mint"></i></div>
      <div class="floating-calendar"><svg viewBox="0 0 42 44"><rect x="6" y="9" width="30" height="29" rx="6"/><path d="M13 5v9m16-9v9M7 20h28m-20 9 4 4 8-9"/></svg></div>
      <span class="art-spark">✦</span>
    </div>
    <div class="intro-copy"><p class="intro-kicker">YOUR PEOPLE. YOUR CIRCLES.</p><h1 tabindex="-1">Life’s better<br>in Circles.</h1><p class="intro-description">Shared plans. Shared tabs.<br>A little more together.</p></div>
    <div class="intro-start"><button type="button" class="welcome-start">Get started <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button><p>A little less admin. A lot more life.</p></div>`;
  phone.insertBefore(intro, document.querySelector('.home-indicator'));
  let timer;
  let replayRequested = false;
  const runLaunch = () => {
    clearTimeout(timer);
    replayRequested = false;
    phone.classList.remove('is-launching');
    void intro.offsetWidth;
    phone.classList.add('is-launching');
    timer = setTimeout(() => { location.hash = 'home'; }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 400 : 1700);
  };
  const renderIntro = () => {
    const route = location.hash.slice(1);
    const active = route === 'welcome' || route === 'launch';
    intro.hidden = !active;
    replay.hidden = !active;
    if (!active) {
      delete phone.dataset.intro;
      clearTimeout(timer);
      phone.classList.remove('is-launching');
      replayRequested = false;
      return;
    }
    phone.dataset.intro = route;
    if (route !== 'launch') {
      clearTimeout(timer);
      phone.classList.remove('is-launching');
    }
    const descriptionTitle = document.querySelector('#page-description-title');
    const description = document.querySelector('#page-description');
    delete descriptionTitle.dataset.enText;
    delete description.dataset.enText;
    descriptionTitle.textContent = route === 'welcome' ? 'Life’s better in Circles.' : 'A familiar hello.';
    description.textContent = route === 'welcome'
      ? 'A violet welcome with a floating rose, cyan, and mint Circle sculpture. Get started opens account registration. Use the replay control to try the shorter returning launch.'
      : 'The same artwork and wordmark, without a call to action. This preview stays still for inspection; Replay launch shows its short transition into Home.';
    document.querySelectorAll('#page-menu a').forEach(link => {
      if (link.hash === '#' + route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (replayRequested) runLaunch();
    window.dispatchEvent(new Event('pastel-language-ready'));
  };
  intro.querySelector('.welcome-start').addEventListener('click', () => { location.hash = 'register'; });
  replay.addEventListener('click', () => {
    replayRequested = true;
    if (location.hash === '#launch') runLaunch();
    else location.hash = 'launch';
  });
  window.addEventListener('hashchange', () => {
    renderIntro();
    if (!intro.hidden) intro.querySelector(phone.dataset.intro === 'welcome' ? '.intro-copy h1' : '.intro-brand').focus({ preventScroll: true });
  });
  new MutationObserver(renderIntro).observe(document.querySelector('#screen'), { childList: true });
  renderIntro();
})();
