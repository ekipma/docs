/* Theme preference, preview copy, and accessible icon-only navigation. */
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const languageToggle = document.querySelector('#language-toggle');
  let syncingLanguage = false;
  const faCopy = new Map([
    ['Home', 'خونه'], ['Circles & friends', 'جمع‌ها و دوست‌ها'], ['A Circle', 'یک جمع'],
    ['A friend', 'یک دوست'], ['Activity', 'اتفاق‌ها'], ['A plan', 'یک برنامه'],
    ['A payment', 'یک پرداخت'], ['Add a record', 'افزودن رکورد'], ['Balance details', 'جزئیات حساب'],
    ['Your space', 'فضای تو'], ['Welcome', 'خوش اومدی'], ['Returning launch', 'دوباره خوش اومدی'],
    ['Explore the design', 'بریم سراغ طراحی'], ['Reset demo', 'نمونه رو از نو ببین'], ['Material study ↗', 'مطالعه متریال ↗'],
    ['Room to breathe.', 'یه نفس راحت.'], ['Your people', 'آدم‌های خودت'], ['All Circles', 'همه جمع‌ها'],
    ['Friends', 'دوست‌ها'], ['Groups', 'گروه‌ها'], ['Latest together.', 'تازه‌ترین اتفاق‌ها'],
    ['Payments', 'پرداخت‌ها'], ['Turns', 'نوبت‌ها'], ['Plans', 'برنامه‌ها'], ['Updates', 'تازه‌ها'],
    ['Nothing new just yet.', 'فعلاً خبر تازه‌ای نیست.'], ['Open activity', 'باز کردن فعالیت‌ها'],
    ['Your net balance', 'خالص حساب تو'], ["You're owed", 'از تو طلب دارن'], ['You owe', 'تو بدهکاری'],
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
    ['The calm home.', 'خونه‌ی آروم'], ['People, before admin.', 'اول آدم‌ها، بعد حساب‌وکتاب'],
    ['A Circle in context.', 'یک جمع، همین‌جا و همین حالا'], ['A familiar face.', 'یه چهره‌ی آشنا'],
    ['Easy to catch up.', 'از اتفاق‌ها جا نمی‌مونی'], ['An invitation, with the details.', 'دعوتی با همه‌چی سر جاش'],
    ['Nothing hidden in the split.', 'تقسیمش روشن و بی‌دردسره'], ['A small, clear starting point.', 'از یه شروع ساده شروع کن'],
    ['Know who owes what.', 'بدون کی به کی بدهکاره'], ['Search groups and friends', 'گروه‌ها و دوست‌ها رو پیدا کن'],
    ['View members', 'دیدن اعضا'], ['Your shared Circles', 'جمع‌های مشترک تو'], ['Shared activity', 'اتفاق‌های مشترک'],
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
    ,['Life’s better', 'زندگی قشنگ‌تره'], ['in Circles.', 'وقتی با همیم.'], ['Life’s better in Circles.', 'با هم، زندگی قشنگ‌تره.'], ['YOUR PEOPLE. YOUR CIRCLES.', 'آدم‌های خودت، جمع‌های خودت'],
    ['Shared plans. Shared tabs.', 'برنامه‌های مشترک، خرج‌های مشترک'], ['A little more together.', 'یه کم بیشتر کنار هم'],
    ['Get started', 'شروع کنیم'], ['A little less admin. A lot more life.', 'دردسر کمتر، حالِ بیشتر'],
    ['A familiar hello.', 'یه سلام آشنا'], ['Welcome to Ekipma', 'به اکیپما خوش اومدی'],
    ['Replay launch → Home', 'اجرای دوباره → خانه'],
    ['A violet welcome with a floating rose, cyan, and mint Circle sculpture. Get started opens account registration. Use the replay control to try the shorter returning launch.', 'یه خوش‌آمدگویی بنفش با حلقه‌های شناور صورتی، فیروزه‌ای و نعنایی. با «شروع کنیم» ثبت‌نام رو باز کن؛ یا ورود دوباره رو امتحان کن.'],
    ['The same artwork and wordmark, without a call to action. This preview stays still for inspection; Replay launch shows its short transition into Home.', 'همون تصویر و لوگو، بدون دکمه‌ی شروع. برای دیدن حرکت کوتاه ورود دوباره، «اجرای دوباره» رو بزن.']
  ]);
  // Localize the supplied demo content without changing record IDs or stored data.
  Object.entries({
    ekipma: 'اکیپما', EKIPMA: 'اکیپما', Circles: 'جمع‌ها', Back: 'برگشت',
    Sara: 'سارا', Amir: 'امیر', Mina: 'مینا', Reza: 'رضا', Nima: 'نیما', Hayyaun: 'حیان', Darya: 'دریا',
    You: 'تو', 'Former member': 'عضو سابق', 'Weekend crew': 'جمع آخر هفته', Roommates: 'هم‌خونه‌ها',
    'Friday pizza': 'پیتزای جمعه', 'Coffee run': 'نوبت قهوه', 'Sunday hike': 'کوه‌پیمایی یکشنبه', Groceries: 'خرید خونه',
    'Sunday people': 'جمع یکشنبه‌ها', 'With friends': 'با دوست‌ها', Friend: 'دوست',
    'Candy cloud': 'ابر آب‌نباتی', 'Little lagoon': 'مرداب کوچولو', 'Lucky clover': 'شبدر شانس',
    'Darband trailhead, Tehran': 'تهران، ابتدای مسیر دربند', 'Darband trailhead': 'ابتدای مسیر دربند',
    'e.g. Darband trailhead': 'مثلاً ابتدای مسیر دربند', 'Give it a name': 'یه اسم براش بذار',
    'Anything your people should know?': 'چیزی هست که بقیه باید بدونن؟',
    'Small plans. Great company.': 'برنامه‌های کوچیک، رفیق‌های خوب.',
    'A little less admin. A little more home.': 'حساب‌وکتاب کمتر، آرامش بیشتر.',
    'A little more outside.': 'یه کم بیشتر بریم بیرون.',
    "You're owed": 'طلب تو', 'You’re owed': 'طلب تو', "↙ You're owed": '↙ طلب تو', '↙ You’re owed': '↙ طلب تو',
    'Paid by you': 'تو پرداخت کردی', 'Paid by Sara': 'سارا پرداخت کرده',
    payment: 'پرداخت', turn: 'نوبت', event: 'برنامه', PAYMENT: 'پرداخت', TURN: 'نوبت', PLAN: 'برنامه',
    'NEW RECORD': 'ثبت جدید', 'Close dialog': 'بستن', 'App navigation': 'بخش‌های برنامه',
    'YOUR PEOPLE': 'آدم‌های خودت', 'All Circles ↗': 'همه جمع‌ها ↗', '2 shared Circles': '۲ جمع مشترک',
    Ali: 'علی', 'Full signal and battery': 'آنتن و باتری کامل', 'Show Circles': 'نمایش جمع‌ها', 'Record type': 'نوع مورد',
    'e.g. Weekend crew': 'مثلاً جمع آخر هفته', 'What brings you together?': 'چی شما رو دور هم جمع کرده؟',
    'Activity on 18 of the last 28 days': 'فعالیت در ۱۸ روز از ۲۸ روز گذشته',
    'Payments 60 percent, turns 25 percent, plans 15 percent': 'پرداخت‌ها ۶۰ درصد، نوبت‌ها ۲۵ درصد، برنامه‌ها ۱۵ درصد',
    'By phone or from contacts': 'با شماره تلفن یا از مخاطب‌هات', 'Create a Circle': 'یه جمع بساز',
    'A home for something shared': 'جایی برای کارهای مشترکتون', 'Join a Circle': 'به یه جمع بپیوند',
    'Have an invite?': 'دعوت‌نامه داری؟', 'Hide settled friends': 'دوست‌های تسویه‌شده رو پنهان کن',
    'YOUR BALANCE IN THIS CIRCLE': 'حساب تو توی این جمع', 'Add record': 'ثبت جدید',
    'Members, invitations, and settings': 'اعضا، دعوت‌ها و تنظیمات', 'SARA OWES YOU': 'سارا بهت بدهکاره',
    'Across your shared Circles': 'توی جمع‌های مشترکتون', 'Add a shared record': 'یه مورد مشترک ثبت کن',
    'Settle up': 'تسویه حساب', 'Repayments and confirmations': 'بازپرداخت‌ها و تأیید دریافت', 'Remove friend': 'حذف دوست',
    'THE SHARED STORY': 'اتفاق‌های بین ما', TODAY: 'امروز', YESTERDAY: 'دیروز', 'COMING UP': 'پیش رو',
    'See your patterns': 'ببین خرج‌هات چطور بوده', 'A little perspective on what you share': 'یه نگاه به کارهای مشترکتون',
    'WEEKEND CREW': 'جمع آخر هفته', 'A little': 'بزنیم', 'outside time.': 'بیرون!',
    'Sunday, September 27': 'یکشنبه، ۲۷ سپتامبر', '8:00–11:00 AM': '۸ تا ۱۱ صبح', 'Tehran time': 'به وقت تهران',
    'Meet by the main entrance, Tehran.': 'قرارمون کنار ورودی اصلیه، تهران.',
    'A slow morning with your people. Bring water, comfortable shoes, and a light jacket.': 'یه صبح آروم کنار رفیق‌ها. آب، کفش راحت و یه ژاکت سبک یادت نره.',
    'Open Weekend crew': 'برو به جمع آخر هفته', 'Location & calendar': 'آدرس و تقویم', 'Delete plan': 'حذف برنامه',
    'Total payment': 'مبلغ کل', 'Paid by': 'پرداخت‌کننده', Split: 'نحوه تقسیم', Equally: 'مساوی', 'The split': 'سهم هر نفر', 'Your share': 'سهم تو',
    'THE FULL PICTURE': 'حساب‌وکتاب کامل', 'Across your people and Circles': 'بین همه دوست‌ها و جمع‌هات',
    'A LITTLE MORE YOU': 'اینجا مال توئه', 'Language, spacing, and sync': 'زبان، فاصله‌ها و همگام‌سازی',
    'YOUR PEOPLE ARE HERE': 'رفیق‌هات اینجان', Country: 'کشور', 'ONE LITTLE STEP': 'فقط یه قدم کوچیک',
    'Find your people.': 'به جمع رفیق‌هات بپیوند.', 'Start with your phone number.': 'اول شماره تلفنت رو وارد کن.',
    'Your number': 'شماره تو', 'I agree to the privacy policy and terms.': 'شرایط استفاده و سیاست حریم خصوصی رو می‌پذیرم.',
    'Read privacy & terms': 'خوندن شرایط و حریم خصوصی', 'Send code': 'ارسال کد', 'Already have an account? Log in': 'حساب داری؟ وارد شو',
    'Enter the six digits sent to your phone.': 'کد شش‌رقمی پیامک‌شده رو وارد کن.', Verify: 'تأیید شماره',
    'For your people and whatever you share.': 'برای رفیق‌هات و کارهایی که با هم دارین.',
    'Find friend': 'پیدا کردن دوست', 'Already in your phone?': 'شماره‌ش رو داری؟', 'Choose who to add.': 'انتخاب کن کی رو اضافه کنی.',
    'FAMILIAR FACES': 'آشناهای خودت', 'Your people, closer.': 'رفیق‌هات همین نزدیکی‌ان.', 'You choose who comes along.': 'خودت انتخاب کن کی همراهت باشه.',
    'Find people you know on Ekipma, then choose who to add.': 'آشناهات رو توی اکیپما پیدا کن و هر کی رو خواستی اضافه کن.',
    'People on Ekipma': 'آشناهات توی اکیپما', 'Add selected friends': 'افزودن دوست‌های انتخاب‌شده', 'BETTER TOGETHER': 'با هم خوش می‌گذره',
    'Invite code and QR': 'کد دعوت و بارکد', 'Show QR invitation': 'نمایش بارکد دعوت',
    'You are up.': 'نوبت توئه!', 'Current turn': 'نوبت فعلی', Now: 'الان', 'Complete this turn': 'انجامش دادم',
    'A repayment to confirm': 'یه بازپرداخت منتظر تأییدته', Name: 'نام', Email: 'ایمیل', Phone: 'تلفن', 'Save changes': 'ذخیره تغییرات',
    'YOUR OWN RHYTHM': 'هر جور که تو راحتی', 'Preferences.': 'تنظیمات تو.', 'A little room or a little more detail.': 'خلوت‌تر دوست داری یا با جزئیات بیشتر؟',
    'English': 'انگلیسی', 'Preview فارسی': 'پیش‌نمایش فارسی', 'THE BIGGER PICTURE': 'خرج‌هات در یک نگاه',
    'YOUR SHARE': 'سهم تو', 'THIS WEEK': 'این هفته', 'THIS MONTH': 'این ماه', 'THIS YEAR': 'امسال', 'Shared moments': 'لحظه‌های مشترک',
    'Shared expenses': 'خرج‌های مشترک', 'Circles this week': 'جمع‌های این هفته', 'Your share of expenses, separate from what friends owe you.': 'اینجا سهم تو از خرج‌هاست؛ طلبت از دوست‌ها جدا حساب می‌شه.',
    'ALL CAUGHT UP': 'خبری رو از دست ندادی', 'Your shared story continues in Activity.': 'اتفاق‌های جمع‌تون رو توی بخش اتفاق‌ها دنبال کن.',
    'Invited people.': 'دعوت‌شده‌ها.', 'Choose a Circle': 'یه جمع انتخاب کن', 'EKIPMA PLUS': 'اکیپما پلاس',
    '30 days of Plus included with every successful token purchase.': 'با هر خرید موفق توکن، ۳۰ روز پلاس هم داری.',
    'The story behind your expenses': 'ببین پولت کجا خرج شده', 'Automatic sync': 'همگام‌سازی خودکار',
    'Shared records stay up to date while you’re here.': 'تا وقتی اینجایی، اطلاعات مشترکتون به‌روز می‌مونه.', 'View your patterns': 'دیدن گزارش خرج‌ها',
    'Token balance': 'موجودی توکن', 'Add tokens ＋': 'خرید توکن ＋', '1 token = 10,000 Toman. Review your total before continuing.': 'هر توکن ۱۰٬۰۰۰ تومنه. قبل از ادامه، مبلغ کل رو بررسی کن.',
    'YOUR LITTLE EXTRAS': 'یه چیز کوچیک برای خودت', 'Add tokens.': 'توکن بگیر.', 'Your next little extra.': 'یه تنوع کوچیک برای اکیپمات.',
    'Choose a token pack to get started.': 'برای شروع یه بسته توکن انتخاب کن.', 'Purchase history.': 'خریدهای قبلی.',
    'Nothing here yet.': 'هنوز چیزی اینجا نیست.', 'Your token purchases will appear here.': 'خریدهای توکن اینجا نمایش داده می‌شن.', 'Browse token packs': 'دیدن بسته‌های توکن',
    'A LITTLE CLARITY': 'شفاف و روشن', 'This page reserves space for the approved privacy policy and terms.': 'متن نهایی شرایط استفاده و حریم خصوصی اینجا قرار می‌گیره.',
    'Design placeholder only. Final legal text must be supplied before release.': 'این صفحه فعلاً نمونه‌ست. متن حقوقی نهایی باید قبل از انتشار اضافه بشه.',
    'Back to your space': 'برگشت به صفحه خودت', 'Offline and error examples keep cached information readable.': 'توی حالت آفلاین یا خطا هم اطلاعات ذخیره‌شده رو می‌تونی ببینی.'
  }).forEach(([key, value]) => faCopy.set(key, value));
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
    if (text.includes(' · ')) return text.split(' · ').map(part => translateText(part) || part).join(' · ');
    let match;
    if ((match = text.match(/^Remove (.+)$/))) return `حذف ${translateText(match[1]) || match[1]}`;
    if ((match = text.match(/^(Week|Month|Year) expenses: (.+) dollars$/))) return `خرج‌های ${translateText(match[1])}: ${match[2]} دلار`;
    if ((match = text.match(/^Settle with (.+)$/))) return `تسویه با ${translateText(match[1]) || match[1]}`;
    if ((match = text.match(/^(.+) marked (\$[\d.]+) as repaid\. Confirm only after you receive it\.$/))) return `${translateText(match[1]) || match[1]} گفته ${match[2]} رو پس داده. فقط وقتی پول رو گرفتی تأیید کن.`;
    if ((match = text.match(/^Record your repayment here\. (.+) confirms receiving it before your balance changes\.$/))) return `بازپرداختت رو اینجا ثبت کن. حسابت بعد از تأیید دریافت توسط ${translateText(match[1]) || match[1]} تغییر می‌کنه.`;
    const translated = text
      .replace(/^You're owed (\$[\d.]+)$/, 'طلب تو: $1')
      .replace(/^You owe (\$[\d.]+)$/, 'بدهی تو: $1')
      .replace(/^(\d+) going$/, '$1 نفر میان')
      .replace(/^Every (\d+) hours$/, 'هر $1 ساعت')
      .replace(/^Round (\d+)$/, 'دور $1')
      .replace(/^In (\d+) turns$/, '$1 نوبت دیگه')
      .replace(/^I received (\$[\d.]+)$/, '$1 رو گرفتم')
      .replace(/^Mark (\$[\d.]+) as repaid$/, '$1 رو پس دادم')
      .replace(/^(\d+) tokens available$/, '$1 توکن داری')
      .replace(/^(\d+) tokens$/, '$1 توکن')
      .replace(/^(\d+) available$/, '$1 موجود')
      .replace(/^([\d,]+) Toman$/, '$1 تومان')
      .replace(/^(\d+) expenses$/, '$1 خرج')
      .replace(/^Period (\d+)$/, 'بازه $1')
      .replace(/^Payments (\d+%)$/, 'پرداخت‌ها $1')
      .replace(/^Turns (\d+%)$/, 'نوبت‌ها $1')
      .replace(/^Plans (\d+%)$/, 'برنامه‌ها $1')
      .replace(/^(\d+) people$/, '$1 نفر')
      .replace(/^(\d+) members$/, '$1 عضو')
      .replace(/^All (\d+) Circle members$/, 'هر $1 نفر این جمع')
      .replace(/^(\d+) shared Circles$/, '$1 جمع مشترک')
      .replace(/^(\$[\d.]+) each$/, 'نفری $1')
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
    document.querySelectorAll('#screen, #app-header, #app-nav, .pastel-intro, #modal, #toast').forEach(node => { node.dir = fa ? 'rtl' : 'ltr'; });
    document.querySelectorAll('#screen input, #screen textarea').forEach(input => {
      if (!input.dataset.enPlaceholder) input.dataset.enPlaceholder = input.placeholder || '';
      input.placeholder = fa ? (translateText(input.dataset.enPlaceholder) || input.dataset.enPlaceholder) : input.dataset.enPlaceholder;
    });
    // Only the untouched sample profile name is localized; user-entered names stay as typed.
    document.querySelectorAll('#profile-form input[name="name"]').forEach(input => {
      if (input.value === 'Hayyaun' || input.value === 'حیان') input.value = fa ? 'حیان' : 'Hayyaun';
    });
    document.querySelectorAll('.phone [aria-label], .phone [title], #modal [aria-label]').forEach(element => {
      ['aria-label', 'title'].forEach(attribute => {
        const value = element.getAttribute(attribute);
        if (!value) return;
        const key = `en${attribute.replace('-', '')}`;
        if (!element.dataset[key]) element.dataset[key] = value;
        element.setAttribute(attribute, fa ? (translateText(element.dataset[key]) || element.dataset[key]) : element.dataset[key]);
      });
    });
    document.querySelectorAll('#screen *, #app-header *, .pastel-intro *, #modal *, #toast, #page-description-title, #page-description, #replay-launch').forEach(element => {
      [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => {
        const original = node.textContent.trim();
        if (!original) return;
        if (!node.__enText || (original !== node.__enText && original !== node.__faText)) node.__enText = original;
        node.__faText = translateText(node.__enText) || node.__enText;
        const initial = element.matches('.avatar, .avatar-stack > span, .profile-button')
          ? ({H:'ح', S:'س', A:'ا', M:'م', R:'ر', N:'ن', D:'د'})[node.__enText] : null;
        if (initial) node.__faText = initial;
        if (element.matches('.flow-chart small') && /^[MTWFS]$/.test(node.__enText)) {
          const index = [...element.closest('.flow-chart').querySelectorAll('small')].indexOf(element);
          node.__faText = ['د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی'][index];
        }
        const translated = fa ? node.__faText : node.__enText;
        if (translated) node.textContent = node.textContent.replace(original, translated);
      });
    });
    // Discard our own text mutations, but observe later nested updates and dialogs.
    languageObserver.takeRecords();
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
  const languageObserver = new MutationObserver(syncLanguage);
  document.querySelectorAll('.phone, #modal, #toast').forEach(node => {
    languageObserver.observe(node, { childList: true, subtree: true, characterData: true });
  });
  new MutationObserver(refreshCopy).observe(document.querySelector('#screen'), { childList: true });
  refreshCopy();
})();
