/* Theme preference, preview copy, and accessible icon-only navigation. */
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const languageToggle = document.querySelector('#language-toggle');
  let syncingLanguage = false;
  const faCopy = new Map([
    ['Home', 'خانه'], ['Circles & friends', 'حلقه‌ها و دوستان'], ['A Circle', 'یک حلقه'],
    ['A friend', 'یک دوست'], ['Activity', 'فعالیت‌ها'], ['A plan', 'یک برنامه'],
    ['A payment', 'یک پرداخت'], ['Add a record', 'افزودن رکورد'], ['Balance details', 'جزئیات حساب'],
    ['Your space', 'فضای تو'], ['Welcome', 'خوش آمدی'], ['Returning launch', 'ورود دوباره'],
    ['Explore the design', 'بررسی طراحی'], ['Reset demo', 'بازنشانی نمونه'], ['Material study ↗', 'مطالعه متریال ↗'],
    ['Room to breathe.', 'جا برای نفس کشیدن.'], ['Your people', 'آدم‌های تو'], ['All Circles', 'همه حلقه‌ها'],
    ['Friends', 'دوستان'], ['Groups', 'گروه‌ها'], ['Latest together.', 'آخرین اتفاق‌ها'],
    ['Payments', 'پرداخت‌ها'], ['Turns', 'نوبت‌ها'], ['Plans', 'برنامه‌ها'], ['Updates', 'به‌روزرسانی‌ها'],
    ['Nothing new just yet.', 'فعلاً خبر تازه‌ای نیست.'], ['Open activity', 'باز کردن فعالیت‌ها'],
    ['Your net balance', 'حساب خالص تو'], ["You're owed", 'از تو طلبکارند'], ['You owe', 'تو بدهکاری'],
    ['A little outside time.', 'کمی وقت بیرون از خانه.'], ['Sunday hike · 8:00 AM', 'کوهنوردی یکشنبه · ساعت ۸'],
    ['Your patterns.', 'الگوهای تو.'], ['Better in Circles.', 'در حلقه‌ها بهتر است.'],
    ['Shared plans. Shared tabs. One place.', 'برنامه‌های مشترک، حساب‌های مشترک، یک‌جا.'],
    ['HEY, HAYYAUN', 'سلام، هیایون'], ['UPCOMING · SUN 27', 'پیش‌رو · یکشنبه ۲۷'],
    ['Your space.', 'فضای تو.'], ['A little less admin.', 'کمی دردسر کمتر.'], ['Save draft', 'ذخیره پیش‌نویس'],
    ['Review record', 'بررسی رکورد'], ['Log in', 'ورود'], ['Join Ekipma', 'عضویت در اکیپما'],
    ['Preferences', 'تنظیمات'], ['Personal details', 'اطلاعات شخصی'], ['Notifications', 'اعلان‌ها'],
    ['Invited people', 'افراد دعوت‌شده'], ['The little shop', 'فروشگاه کوچک'], ['Add tokens', 'افزودن توکن'],
    ['Search people or Circles', 'جست‌وجوی آدم‌ها یا حلقه‌ها'], ['List spacing', 'فاصله فهرست'],
    ['Plan reminders', 'یادآوری برنامه‌ها'], ['Appearance', 'ظاهر'], ['Language', 'زبان']
  ]);
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
  const syncLanguage = () => {
    if (syncingLanguage) return;
    syncingLanguage = true;
    const fa = root.dataset.language === 'fa';
    root.lang = fa ? 'fa' : 'en';
    // Keep the surrounding design menu stable; only the app preview switches direction.
    root.dir = 'ltr';
    languageToggle.setAttribute('aria-pressed', String(fa));
    languageToggle.textContent = fa ? 'English' : 'فارسی';
    languageToggle.setAttribute('aria-label', fa ? 'Switch to English' : 'تغییر به فارسی');
    document.querySelectorAll('#page-menu a span, #page-menu summary').forEach(node => {
      if (!node.dataset.enLabel) node.dataset.enLabel = node.textContent.trim();
      node.textContent = fa ? (faCopy.get(node.dataset.enLabel) || node.dataset.enLabel) : node.dataset.enLabel;
    });
    document.querySelectorAll('#screen, #app-header, #app-nav').forEach(node => { node.dir = fa ? 'rtl' : 'ltr'; });
    document.querySelectorAll('#screen input, #screen textarea').forEach(input => {
      if (!input.dataset.enPlaceholder) input.dataset.enPlaceholder = input.placeholder || '';
      input.placeholder = fa ? (faCopy.get(input.dataset.enPlaceholder) || input.dataset.enPlaceholder) : input.dataset.enPlaceholder;
    });
    document.querySelectorAll('#screen *').forEach(element => {
      [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => {
        const original = node.textContent.trim();
        if (!original) return;
        if (!node.__enText) node.__enText = original;
        const translated = fa ? faCopy.get(node.__enText) : node.__enText;
        if (translated) node.textContent = node.textContent.replace(original, translated);
      });
    });
    syncingLanguage = false;
  };
  const setLanguage = language => {
    root.dataset.language = language;
    try { localStorage.setItem('ekipma-pastel-language', language); } catch { /* Session fallback. */ }
    syncLanguage();
  };
  toggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  languageToggle.addEventListener('click', () => setLanguage(root.dataset.language === 'fa' ? 'en' : 'fa'));
  const refreshCopy = () => {
    if (document.querySelector('.phone').dataset.route === 'home') {
      document.querySelector('#page-description').textContent = 'A smooth violet balance orb, soft glass surfaces, and diffuse pastel shadows. Simple navigation keeps attention on your balance and your people. Compare light and dark using the design-menu toggle.';
    }
    document.querySelectorAll('#app-nav button').forEach(button => {
      const label = button.getAttribute('aria-label') || button.textContent.trim();
      button.setAttribute('aria-label', label);
      button.title = label;
      if (button.classList.contains('add-nav')) button.querySelector('use').setAttribute('href', '#i-nav-add');
      // Preserve the SVG and its accessible name, without a second visual label.
      [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
    });
    document.querySelectorAll('.setting-row').forEach(row => {
      if (row.firstElementChild?.firstChild?.textContent === 'Appearance') {
        row.querySelector('small').textContent = 'Breathe pastel';
      }
    });
    syncTheme();
    syncLanguage();
  };
  new MutationObserver(refreshCopy).observe(document.querySelector('#screen'), { childList: true });
  refreshCopy();
})();
