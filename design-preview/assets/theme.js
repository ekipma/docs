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
    ['Plan reminders', 'یادآوری برنامه‌ها'], ['Appearance', 'ظاهر'], ['Language', 'زبان'],
    ['The calm home.', 'خانه آرام'], ['People, before admin.', 'آدم‌ها، قبل از مدیریت'],
    ['A Circle in context.', 'یک حلقه در متن'], ['A familiar face.', 'یک چهره آشنا'],
    ['Easy to catch up.', 'مرور اتفاق‌ها آسان است'], ['An invitation, with the details.', 'دعوتی با همه جزئیات'],
    ['Nothing hidden in the split.', 'هیچ چیز در تقسیم پنهان نیست'], ['A small, clear starting point.', 'یک شروع کوچک و روشن'],
    ['Know who owes what.', 'بدان چه کسی چه‌قدر بدهکار است'], ['Search groups and friends', 'جست‌وجوی گروه‌ها و دوستان'],
    ['View members', 'دیدن اعضا'], ['Your shared Circles', 'حلقه‌های مشترک تو'], ['Shared activity', 'فعالیت‌های مشترک'],
    ['Latest together', 'آخرین اتفاق‌ها'], ['Choose your Circle', 'حلقه‌ات را انتخاب کن'],
    ['Where do you share this record with ...?', 'این رکورد را با چه کسانی به اشتراک می‌گذاری؟'],
    ['No matches.', 'موردی پیدا نشد.'], ['Try a different name.', 'نام دیگری را امتحان کن.'],
    ['No records match these filters.', 'رکوردی با این فیلترها پیدا نشد.'], ['Try All or choose another Circle.', 'همه را انتخاب کن یا حلقه دیگری را امتحان کن.'],
    ['Circle', 'حلقه'], ['All', 'همه'], ['Today', 'امروز'], ['Yesterday', 'دیروز'], ['Coming up', 'پیش‌رو'],
    ['Just now', 'همین حالا'], ['Saved just now', 'همین حالا ذخیره شد'], ['Draft', 'پیش‌نویس'], ['Draft saved', 'پیش‌نویس ذخیره شد'],
    ['View plan', 'دیدن برنامه'], ['Your turn', 'نوبت تو'], ['Sara’s turn', 'نوبت سارا'], ['See everyone', 'دیدن همه'],
    ['Going', 'می‌روم'], ['Including you', 'با احتساب تو'], ['Count me in', 'من هم هستم'], ['Change RSVP', 'تغییر پاسخ'],
    ['I can’t make it', 'نمی‌توانم بیایم'], ['Keep me in', 'من را نگه دار'], ['Record deleted', 'رکورد حذف شد'],
    ['This record no longer affects your balance', 'این رکورد دیگر روی حساب تو اثر نمی‌گذارد'],
    ['Your next turn', 'نوبت بعدی تو'], ['The rotation', 'ترتیب نوبت‌ها'], ['Position', 'جایگاه'], ['Next up', 'نفر بعدی'],
    ['Starting with you', 'شروع از تو'], ['people in rotation', 'نفر در چرخه'], ['What was it for?', 'برای چه بود؟'],
    ['What are you taking turns on?', 'برای چه چیزی نوبتی هستید؟'], ['What is the plan?', 'برنامه چیست؟'],
    ['Total amount · USD', 'مبلغ کل · دلار'], ['Paid by you · Equal split', 'پرداخت‌شده توسط تو · تقسیم برابر'],
    ['Save a draft to review the details. Nobody is charged or notified, and balances do not change.', 'برای بررسی جزئیات، یک پیش‌نویس ذخیره کن. هیچ‌کس شارژ یا مطلع نمی‌شود و حساب‌ها تغییر نمی‌کنند.'],
    ['When · Tehran time', 'زمان · وقت تهران'], ['Where', 'کجا'], ['Meeting point', 'محل قرار'], ['A little context', 'کمی توضیح'],
    ['optional', 'اختیاری'], ['Cancel', 'لغو'], ['Your balance.', 'حساب تو.'], ['Net across all Circles', 'خالص حساب در همه حلقه‌ها'],
    ['across people', 'بین نفر'], ['Choose how much fits in a list.', 'انتخاب کن چه‌قدر از فهرست دیده شود.'],
    ['Remember the good things.', 'خاطره‌های خوب را به یاد بیاور.'], ['English · Tehran', 'انگلیسی · تهران'],
    ['Log out', 'خروج'], ['A LITTLE LESS ADMIN', 'کمی دردسر کمتر'], ['Add something shared.', 'یک چیز مشترک اضافه کن.'],
    ['Payment', 'پرداخت'], ['Turn', 'نوبت'], ['Plan', 'برنامه'], ['Take turns on…', 'برای چه چیزی نوبتی هستید؟'],
    ['Share with', 'اشتراک‌گذاری با'], ['Choose friends', 'انتخاب دوستان'], ['Participants', 'شرکت‌کنندگان'],
    ['Time between turns · hours', 'فاصله بین نوبت‌ها · ساعت'], ['The participant order becomes the rotation order.', 'ترتیب شرکت‌کنندگان، ترتیب نوبت‌ها می‌شود.'],
    ['When · your local time', 'زمان · وقت محلی تو'], ['ONE LAST LOOK', 'یک نگاه آخر'], ['The equal split', 'تقسیم برابر'],
    ['Participant', 'شرکت‌کننده'], ['Edit details', 'ویرایش جزئیات'], ['Add payment/turn/plan', 'افزودن پرداخت/نوبت/برنامه'],
    ['Record history', 'تاریخچه رکورد'], ['Created', 'ایجاد شد'], ['Turn completed', 'نوبت انجام شد'], ['Review & add', 'بررسی و افزودن'],
    ['Delete record', 'حذف رکورد'], ['A LITTLE LESS OWING', 'کمی بدهی کمتر'], ['Settle with', 'تسویه با'],
    ['YOU OWE', 'تو بدهکاری'], ['OWES YOU', 'به تو بدهکار است'], ['Your outstanding balance', 'بدهی باقی‌مانده تو'],
    ['Already paid them back?', 'قبلاً بدهی را پرداخت کرده‌ای؟'], ['I paid them back', 'بدهی را پرداخت کردم'],
    ['Waiting for confirmation', 'در انتظار تأیید'], ['Confirm receipt', 'تأیید دریافت'], ['Repayment history', 'تاریخچه بازپرداخت'],
    ['Confirmed', 'تأیید شد'], ['No confirmed repayments yet.', 'هنوز بازپرداخت تأییدشده‌ای نیست.'], ['Welcome back.', 'خوش برگشتی.'],
    ['A little less admin starts here.', 'کمی دردسر کمتر از این‌جا شروع می‌شود.'], ['Phone number', 'شماره تلفن'], ['Password', 'رمز عبور'],
    ['New here? Join Ekipma', 'اینجایی؟ به اکیپما بپیوند'], ['CHECK YOUR MESSAGES', 'پیام‌هایت را بررسی کن'], ['A tiny code.', 'یک کد کوچک.'],
    ['Verification code', 'کد تأیید'], ['Send a new code', 'ارسال کد جدید'], ['Change phone number', 'تغییر شماره تلفن'],
    ['MAKE YOURSELF AT HOME', 'اینجا خانه خودت باش'], ['What should we call you?', 'تو را چه صدا کنیم؟'], ['Your name', 'نام تو'],
    ['Create password', 'ساخت رمز عبور'], ['At least 8 characters.', 'حداقل ۸ نویسه.'], ['Let’s go', 'بزن بریم'],
    ['GOOD THINGS START SMALL', 'چیزهای خوب کوچک شروع می‌شوند'], ['Make a Circle.', 'یک حلقه بساز.'], ['Circle name', 'نام حلقه'],
    ['A little description', 'یک توضیح کوتاه'], ['Create Circle', 'ساخت حلقه'], ['THERE’S ROOM FOR YOU', 'برای تو جا هست'],
    ['Join your people.', 'به آدم‌هایت بپیوند.'], ['Invite code or link', 'کد یا لینک دعوت'], ['Paste your invite here', 'دعوتت را این‌جا جای‌گذاری کن'],
    ['Preview Circle', 'پیش‌نمایش حلقه'], ['ONE MORE FAMILIAR FACE', 'یک چهره آشنای دیگر'], ['Add a friend.', 'یک دوست اضافه کن.'],
    ['Find them by their phone number.', 'با شماره تلفن پیدایشان کن.'], ['Add a friend', 'افزودن دوست'], ['Find friends from contacts', 'پیدا کردن دوستان از مخاطبان'],
    ['YOUR CIRCLE', 'حلقه تو'], ['Circle details', 'جزئیات حلقه'], ['Invite someone', 'دعوت از یک نفر'], ['Send a link or show your code', 'لینک را بفرست یا کدت را نشان بده'],
    ['The people', 'آدم‌ها'], ['members', 'عضو'], ['Circle admin', 'مدیر حلقه'], ['Member', 'عضو'], ['Remove', 'حذف'],
    ['A LITTLE CIRCLE ADMIN', 'کمی مدیریت حلقه'], ['Your role', 'نقش تو'], ['You are the Circle admin.', 'تو مدیر حلقه هستی.'],
    ['You are a member.', 'تو عضو هستی.'], ['Delete Circle', 'حذف حلقه'], ['Leave Circle', 'ترک حلقه'], ['BETTER WITH YOUR PEOPLE', 'با آدم‌ها بهتر است'],
    ['A place for your people.', 'جایی برای آدم‌هایت.'], ['Come join the Circle', 'به حلقه بپیوند'], ['Invitation code', 'کد دعوت'],
    ['Copy invitation', 'کپی دعوت‌نامه'], ['Show QR invitation', 'نمایش دعوت QR'], ['Generate a new invite code', 'ساخت کد دعوت جدید'],
    ['Anyone with a valid invitation can join this Circle.', 'هرکس دعوت‌نامه معتبر داشته باشد می‌تواند به این حلقه بپیوندد.'],
    ['Personal details.', 'اطلاعات شخصی.'], ['Change photo', 'تغییر عکس'], ['Your patterns', 'الگوهای تو'], ['Expenses, activity, and the bigger picture', 'هزینه‌ها، فعالیت و تصویر بزرگ‌تر'],
    ['You’re all caught up', 'همه چیز را دنبال کرده‌ای'], ['People you’ve brought along', 'آدم‌هایی که همراه کرده‌ای'], ['Make it yours', 'شخصی‌اش کن'],
    ['Ekipma Plus', 'اکیپما پلاس'], ['Your membership is active', 'عضویت تو فعال است'], ['A little extra for your Circles', 'کمی امکانات بیشتر برای حلقه‌هایت'],
    ['Sync', 'همگام‌سازی'], ['Up to date', 'به‌روز'], ['Offline · Showing saved balances', 'آفلاین · نمایش حساب‌های ذخیره‌شده'],
    ['Couldn’t update your records', 'رکوردها به‌روز نشدند'], ['Refresh', 'تازه‌سازی'], ['Clear cached records', 'پاک کردن رکوردهای ذخیره‌شده'],
    ['Little moments, added up.', 'لحظه‌های کوچک، کنار هم.'], ['Week', 'هفته'], ['Month', 'ماه'], ['Year', 'سال'], ['View chart values', 'دیدن مقادیر نمودار'],
    ['Days together', 'روزهای باهم‌بودن'], ['What you share', 'چیزهایی که شریک می‌شوید'], ['A LITTLE EXTRA', 'کمی بیشتر'], ['More room for together.', 'جای بیشتر برای باهم بودن.'],
    ['You’re part of Plus.', 'تو بخشی از پلاس هستی.'], ['A clearer picture of your shared life.', 'تصویر روشن‌تری از زندگی مشترکتان.'],
    ['See your spending patterns and keep your records in sync.', 'الگوهای خرج‌کردنت را ببین و رکوردهایت را همگام نگه دار.'],
    ['Get tokens + 30 days of Plus', 'دریافت توکن + ۳۰ روز پلاس'], ['Your token balance', 'موجودی توکن تو'], ['The little shop.', 'فروشگاه کوچک.'],
    ['SMALL THINGS. BIG PERSONALITY.', 'چیزهای کوچک، شخصیت بزرگ.'], ['tokens', 'توکن'], ['Owned', 'خریداری‌شده'], ['Purchase history', 'تاریخچه خرید'],
    ['FOR THE LITTLE EXTRAS', 'برای امکانات کوچک بیشتر'], ['Add a little sparkle.', 'کمی درخشش اضافه کن.'], ['YOUR BALANCE', 'حساب تو'],
    ['Choose a pack', 'یک بسته انتخاب کن'], ['Toman', 'تومان'], ['Review purchase', 'بررسی خرید'], ['YOUR TOKEN PURCHASE', 'خرید توکن تو'],
    ['Ready when you are.', 'هر وقت آماده‌ای.'], ['Waiting for payment.', 'در انتظار پرداخت.'], ['Continue to payment', 'ادامه پرداخت'],
    ['Check payment status', 'بررسی وضعیت پرداخت'], ['Try again', 'تلاش دوباره'], ['Loading, offline & empty', 'در حال بارگذاری، آفلاین و خالی'],
    ['LIFE HAPPENS', 'زندگی جریان دارد'], ['Still here for you.', 'هنوز کنارت هستیم.'], ['Reconnect at your pace.', 'هر وقت آماده‌ای دوباره وصل شو.'],
    ['Show offline Home', 'نمایش خانه آفلاین'], ['Show sync error', 'نمایش خطای همگام‌سازی'], ['Show loading state', 'نمایش حالت بارگذاری'],
    ['Show empty Activity', 'نمایش فعالیت خالی'], ['Restore connection', 'بازگردانی اتصال'], ['Privacy & terms.', 'حریم خصوصی و شرایط.'],
    ['Your information', 'اطلاعات تو'], ['All caught up', 'همه چیز به‌روز است'], ['A quiet moment.', 'یک لحظه آرام.'],
    ['There’s room for more.', 'برای افراد بیشتر جا هست.'], ['Invite your people into a Circle to get started.', 'برای شروع، آدم‌هایت را به یک حلقه دعوت کن.'],
    ['Back to English preferences', 'بازگشت به تنظیمات انگلیسی']
    ,['Verify number', 'تأیید شماره'], ['Join Circle', 'پیوستن به حلقه'], ['Add friend', 'افزودن دوست'],
    ['Contacts', 'مخاطبان'], ['Members', 'اعضا'], ['Invitation', 'دعوت‌نامه'], ['Circle settings', 'تنظیمات حلقه'],
    ['A turn', 'یک نوبت'], ['Confirm repayment', 'تأیید بازپرداخت'], ['Settle a balance', 'تسویه حساب'],
    ['Payment status', 'وضعیت پرداخت'], ['Privacy & terms', 'حریم خصوصی و شرایط'], ['Persian study', 'مطالعه فارسی'],
    ['Get started', 'شروع کنیم'], ['Make it complete', 'کاملش کن'], ['↙ You’re owed', '↙ از تو طلبکارند'], ['↙ You\'re owed', '↙ از تو طلبکارند'],
    ['↗ You owe', '↗ تو بدهکاری'], ['All Circles ↗', 'همه حلقه‌ها ↗'], ['2 shared Circles', '۲ حلقه مشترک'],
    ['Owes you', 'به تو بدهکار است'], ['All activity ↗', 'همه فعالیت‌ها ↗'], ['Weekend crew · payment', 'گروه آخرهفته · پرداخت'],
    ['Roommates · turn', 'هم‌خانه‌ها · نوبت']
    ,['Life’s better', 'زندگی بهتر است'], ['in Circles.', 'در حلقه‌ها.'], ['Life’s better in Circles.', 'زندگی در حلقه‌ها بهتر است.'], ['YOUR PEOPLE. YOUR CIRCLES.', 'آدم‌های تو. حلقه‌های تو.'],
    ['Shared plans. Shared tabs.', 'برنامه‌های مشترک. حساب‌های مشترک.'], ['A little more together.', 'کمی بیشتر با هم.'],
    ['Get started', 'شروع کنیم'], ['A little less admin. A lot more life.', 'کمی دردسر کمتر. زندگی خیلی بیشتر.'],
    ['A familiar hello.', 'یک سلام آشنا.'], ['Welcome to Ekipma', 'به اکیپما خوش آمدی'],
    ['Replay launch → Home', 'اجرای دوباره → خانه'],
    ['A violet welcome with a floating rose, cyan, and mint Circle sculpture. Get started opens account registration. Use the replay control to try the shorter returning launch.', 'خوش‌آمدگویی بنفش با مجسمه‌ای شناور از حلقه‌های صورتی، فیروزه‌ای و نعنایی. شروع کنیم، ثبت‌نام را باز می‌کند. برای دیدن ورود کوتاه دوباره، اجرای مجدد را امتحان کن.'],
    ['The same artwork and wordmark, without a call to action. This preview stays still for inspection; Replay launch shows its short transition into Home.', 'همان تصویر و نشان، بدون دعوت به اقدام. این پیش‌نمایش برای بررسی ثابت می‌ماند؛ اجرای دوباره، گذار کوتاه به خانه را نشان می‌دهد.']
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
  const translateText = text => {
    if (faCopy.has(text)) return faCopy.get(text);
    const translated = text
      .replace(/^(\d+) people$/, '$1 نفر')
      .replace(/^(\d+) members$/, '$1 عضو')
      .replace(/^Position (\d+)$/, 'جایگاه $1');
    return translated === text ? null : translated;
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
    document.querySelectorAll('#screen, #app-header, #app-nav, .pastel-intro').forEach(node => { node.dir = fa ? 'rtl' : 'ltr'; });
    document.querySelectorAll('#screen input, #screen textarea').forEach(input => {
      if (!input.dataset.enPlaceholder) input.dataset.enPlaceholder = input.placeholder || '';
      input.placeholder = fa ? (translateText(input.dataset.enPlaceholder) || input.dataset.enPlaceholder) : input.dataset.enPlaceholder;
    });
    document.querySelectorAll('#screen option').forEach(option => {
      if (!option.dataset.enText) option.dataset.enText = option.textContent.trim();
      option.textContent = fa ? (translateText(option.dataset.enText) || option.dataset.enText) : option.dataset.enText;
    });
    document.querySelectorAll('#screen [aria-label], #screen [title]').forEach(element => {
      ['aria-label', 'title'].forEach(attribute => {
        const value = element.getAttribute(attribute);
        if (!value) return;
        const key = `en${attribute.replace('-', '')}`;
        if (!element.dataset[key]) element.dataset[key] = value;
        element.setAttribute(attribute, fa ? (translateText(element.dataset[key]) || element.dataset[key]) : element.dataset[key]);
      });
    });
    document.querySelectorAll('#screen *, .pastel-intro *, #page-description-title, #page-description, #replay-launch').forEach(element => {
      [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => {
        const original = node.textContent.trim();
        if (!original) return;
        if (!node.__enText) node.__enText = original;
        const translated = fa ? translateText(node.__enText) : node.__enText;
        if (translated) node.textContent = node.textContent.replace(original, translated);
      });
    });
    ['#page-description-title', '#page-description', '#replay-launch'].forEach(selector => {
      const node = document.querySelector(selector);
      if (!node) return;
      if (!node.dataset.enText) node.dataset.enText = node.textContent.trim();
      const translated = fa ? translateText(node.dataset.enText) : node.dataset.enText;
      if (translated) node.textContent = translated;
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
  window.addEventListener('pastel-language-ready', syncLanguage);
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
