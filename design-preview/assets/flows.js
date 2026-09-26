/* Product-flow studies. This file never calls the app API or a payment provider. */
window.createPastelFlows = function (app) {
  'use strict';
  const {esc, icon, usd, amount, avatar, personName, title, section, recordRows, friendRow, groupRow, go, render, toast, modal, groups, people} = app;
  const $ = s => document.querySelector(s);
  groups.crew.code = 'CREW27'; groups.home.code = 'HOME24'; groups.home.admin = 'sara';
  const originalPeople = structuredClone(people), originalGroups = structuredClone(groups);
  const fresh = () => ({hideZero:false, profile:{name:'Hayyaun',email:'hayyaun@example.com',photo:''},
    draft:{type:'payment',title:'',description:'',group:'crew',amount:'',period:'24',when:'',location:'',participants:['you','sara'],payer:'you'},
    repayments:[{id:'sample',friend:'sara',amount:104,status:'incoming'}], window:'Week', premium:true,
    tokens:20, owned:[], purchase:null, purchases:[], contactsAdded:false,
    authPhone:'', authMethod:'', authMode:'otp', authDestination:'', authKey:'', knownAuth:{}, signup:false, authError:'', otpError:'', sync:'online', clear:false, id:10, review:null});
  let ui = fresh();
  const labels = {login:'Welcome back',register:'Join Ekipma',otp:'Verify your number',account:'A little about you',
    'new-circle':'Create a Circle',join:'Join a Circle','add-friend':'Add a friend',contacts:'Find your people',members:'Circle members',invite:'Invite to your Circle',
    'circle-settings':'Manage your Circle',review:'Review your record',repayment:'Settle up',profile:'Personal details',preferences:'Preferences',
    stats:'Your patterns',notifications:'Notifications',invites:'Invited people',premium:'A little extra',shop:'Make it yours',tokens:'Add tokens',checkout:'Payment status',purchases:'Purchase history',policy:'Privacy & terms',states:'Everyday states'};
  const button = (label, command, cls='action', extra='') => `<button type="button" class="${cls}" data-flow="${command}" ${extra}>${label}</button>`;
  const link = (label, route, detail='', mark='↗') => `<button class="row" data-go="${route}"><span class="avatar cool" aria-hidden="true">${mark}</span><span class="row-copy"><strong>${label}</strong>${detail?`<small>${detail}</small>`:''}</span>${icon('arrow')}</button>`;
  const field = (label, name, value='', type='text', attrs='') => `<label class="form-label">${label}<input class="field" name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
  const submit = label => `<button class="action" type="submit">${label} ${icon('arrow')}</button>`;
  const error = text => `<p class="flow-error" role="alert">${esc(text)}</p>`;
  const empty = (mark, heading, text, action='') => `<div class="flow-empty"><span class="flow-sculpture" aria-hidden="true">${mark}</span><h3>${heading}</h3><p class="subtext">${text}</p>${action}</div>`;
  const card = (heading, text, cls='') => `<div class="flow-card ${cls}"><h3>${heading}</h3><p class="subtext">${text}</p></div>`;
  const money = value => usd(value);
  const activeGroups = () => Object.entries(groups).filter(([,g])=>!g.archived);
  const activePeople = () => Object.keys(people).filter(id=>!people[id].removed);
  const participants = () => ui.draft.group ? (groups[ui.draft.group]?.members||[]) : ui.draft.participants;
  const balances = () => ({owed:Object.values(people).reduce((a,p)=>a+Math.max(0,p.balance),0),owe:Object.values(people).reduce((a,p)=>a+Math.max(0,-p.balance),0)});
  const fmt = n => Math.round(n*100)/100;
  function adjustPerson(id,delta,group) {
    if(!people[id])return;
    const before=people[id].balance; people[id].balance=fmt(before+delta);
    if(group&&groups[group]){groups[group].owed=fmt(groups[group].owed+Math.max(0,people[id].balance)-Math.max(0,before));groups[group].owe=fmt(groups[group].owe+Math.max(0,-people[id].balance)-Math.max(0,-before));}
  }
  function applyRecord(record,direction=1) {
    if(record.type!=='payment')return;
    const cents=Math.round(Number(record.amount)*100), count=record.participants.length;
    const payer=record.id==='groceries'?'sara':'you';
    record.participants.forEach((id,i)=>{const share=(Math.floor(cents/count)+(i<cents%count?1:0))/100;if(payer==='you'&&id!=='you')adjustPerson(id,direction*share,record.group);else if(payer!=='you'&&id==='you')adjustPerson(payer,-direction*share,record.group);});
  }
  function confirm(heading,text,command,label='Confirm') {
    modal(heading,`<p class="subtext">${text}</p>${button(label,command)}${button('Keep it','close','text-button')}`);
  }
  function recordFor(id){return app.state.records.find(r=>r.id===id);}
  function options(items, selected) {return items.map(([id,name])=>`<option value="${id}" ${id===selected?'selected':''}>${esc(name)}</option>`).join('');}
  function capture(form) {Object.assign(ui.draft,Object.fromEntries(new FormData(form)));}
  function editor() {
    const d=ui.draft, members=participants();
    return `${title('A LITTLE LESS ADMIN','Add something shared.')}<div class="add-types">${['payment','turn','event'].map(t=>button(`${icon(t)} ${t==='event'?'Plan':t==='payment'?'Payment':'Turn'}`,'type:'+t,'',`aria-pressed="${d.type===t}" data-type-look="${t}"`)).join('')}</div>
    <form id="record-editor">${field(d.type==='payment'?'What was it for?':d.type==='turn'?'Take turns on…':'What is the plan?','title',d.title,'text','required maxlength="60" placeholder="Give it a name"')}
    <label class="form-label">Share with<select class="field" name="group">${options([['','Choose friends'],...activeGroups().map(([id,g])=>[id,g.name])],d.group)}</select></label>
    ${d.group?`<div class="flow-members">${members.map(avatar).join('')}<small>All ${members.length} Circle members</small></div>`:`<fieldset class="flow-choices"><legend>Participants</legend>${['you',...activePeople()].map(id=>`<label><input type="checkbox" name="participant" value="${id}" ${members.includes(id)?'checked':''}><span>${avatar(id)} ${esc(personName(id))}</span></label>`).join('')}</fieldset>`}
    ${d.type==='payment'?`${field('Total amount · USD','amount',d.amount,'number','required min="0.01" max="999999" step="0.01" inputmode="decimal" placeholder="0.00"')}<div class="split-preview"><span>Paid by you · Equal split</span><strong id="flow-split">${members.length?`${money(Number(d.amount||0)/members.length)} each · ${members.length} people`:'Choose at least one participant'}</strong></div>`:d.type==='turn'?`${field('Time between turns · hours','period',d.period,'number','required min="1" max="8760" step="1"')}<p class="form-note">The participant order becomes the rotation order.</p>`:`${field('When · your local time','when',d.when,'datetime-local','required')}${field('Meeting point','location',d.location,'text','maxlength="90" placeholder="e.g. Darband trailhead"')}`}
    <label class="form-label">A little context <small>optional</small><textarea class="field" name="description" rows="3" maxlength="500" placeholder="Anything your people should know?">${esc(d.description)}</textarea></label>
    <p class="flow-error" id="record-error" role="alert"></p><div class="form-actions">${submit('Review record')}${button('Cancel','cancel-record','text-button')}</div></form>`;
  }
  function review() {
    const d=ui.review;
    if(!d)return empty('▤','Nothing to review yet.','Start with a payment, turn, or plan.',link('Add a record','add'));
    return `${title('ONE LAST LOOK',d.title)}<div class="flow-card ${d.type}"><span class="record-icon ${d.type}">${icon(d.type)}</span><h3>${d.type==='payment'?money(d.amount):d.type==='turn'?`Every ${d.period} hours`:esc(d.when.replace('T',' · '))}</h3><p class="subtext">${esc(groups[d.group]?.name||'With friends')} · ${d.participants.length} people</p></div><p class="subtext">${esc(d.description)}</p>${section(d.type==='payment'?'The equal split':'Your people')}${d.participants.map((id,i)=>`<div class="row">${avatar(id)}<span class="row-copy"><strong>${esc(personName(id))}</strong><small>${d.type==='turn'?'Position '+(i+1):id==='you'?'Paid by you':'Participant'}</small></span>${d.type==='payment'?`<span class="row-end">${money((Math.floor(Math.round(d.amount*100)/d.participants.length)+(i<Math.round(d.amount*100)%d.participants.length?1:0))/100)}</span>`:''}</div>`).join('')}${d.type==='event'?card('Meeting point',esc(d.location)||'Decide together'):''}<div class="form-actions">${button('Add '+(d.type==='event'?'plan':d.type),'publish')}${button('Keep as draft','draft','action secondary')}${button('Edit details','edit-draft','text-button')}</div>`;
  }
  function detailedRecord(id){
    const r=recordFor(id);if(!r)return null;
    if(r.deleted)return empty('▤','Record deleted.','This record no longer affects your balance.',link('Back to activity','activity'));
    if(r.type==='event'&&id==='hike')return null;
    const names=r.participants, rotation=r.iter||0;
    const header=title(`${r.type==='event'?'PLAN':r.type.toUpperCase()}${r.draft?' · DRAFT':''}`,r.title);
    const shared=`<p class="subtext">${esc(groups[r.group]?.name||'With friends')} · ${r.date}</p>`;
    let content='';
    if(r.type==='payment')content=`<div class="receipt-header"><span class="record-icon payment">${icon('payment')}</span>${amount(Number(r.amount),false)}<p class="subtext">Total payment</p></div><dl class="detail-list"><div><dt>Paid by</dt><dd>${r.id==='groceries'?'Sara':'You'}</dd></div><div><dt>Split</dt><dd>Equally · ${names.length} people</dd></div></dl>${section('The split')}${names.map((p,i)=>`<div class="row">${avatar(p)}<span class="row-copy"><strong>${esc(personName(p))}</strong><small>${p==='you'?'Your share':'Participant'}</small></span><span class="row-end">${money((Math.floor(Math.round(r.amount*100)/names.length)+(i<Math.round(r.amount*100)%names.length?1:0))/100)}</span></div>`).join('')}`;
    else if(r.type==='turn')content=`<div class="flow-card turn"><span class="record-icon turn">${icon('turn')}</span><h3>${esc(personName(names[rotation%names.length]))} ${names[rotation%names.length]==='you'?"are":"is"} up.</h3><p class="subtext">Round ${Math.floor(rotation/names.length)+1} · Every ${r.period||24} hours</p></div>${section('The rotation')}${names.map((_,i)=>{const p=names[(rotation+i)%names.length];return `<div class="row">${avatar(p)}<span class="row-copy"><strong>${esc(personName(p))}</strong><small>${i===0?'Current turn':i===1?'Next up':'In '+i+' turns'}</small></span>${i===0?'<span class="flow-badge">Now</span>':''}</div>`;}).join('')}${!r.draft&&names[rotation%names.length]==='you'?button('Complete this turn','advance:'+id):!r.draft?'<p class="form-note">The current participant will complete their turn.</p>':''}`;
    else content=`<div class="landscape" aria-hidden="true"><span class="sun"></span><span class="ridge"></span></div><dl class="detail-list"><div><dt>When</dt><dd>${esc((r.when||'').replace('T',' · '))}</dd></div><div><dt>Where</dt><dd>${esc(r.location||'Decide together')}</dd></div></dl>${button('Location & calendar','event-tools:'+id,'action secondary')}`;
    return `${header}${shared}${content}${r.description?card('A little context',esc(r.description)):''}${section('Record history')}<ol class="flow-timeline"><li><strong>${r.draft?'Draft saved':'Created'}</strong><small>${r.date} · ${r.id==='groceries'?'Sara':esc(ui.profile.name)}</small></li>${Array.from({length:Math.min(rotation,5)},(_,i)=>`<li><strong>Turn completed</strong><small>${esc(personName(names[i%names.length]))} · Round ${Math.floor(i/names.length)+1}</small></li>`).join('')}</ol>${r.draft?button('Review & add','review-saved:'+id):''}${r.id!=='groceries'?button('Delete record','delete-record:'+id,'text-button danger'):''}`;
  }
  function repayment(id){
    const p=people[id];if(!p)return empty('✓','Choose a friend.','Open a friend to settle your balance.',link('Your Circles','circles'));
    const pending=ui.repayments.find(r=>r.friend===id&&['pending','incoming'].includes(r.status));
    return `${title('A LITTLE LESS OWING','Settle with '+p.name)}<div class="flow-card payment"><p class="eyebrow">${p.balance<0?'YOU OWE':'OWES YOU'}</p>${amount(Math.abs(p.balance),false)}<p class="subtext">Your outstanding balance</p></div>${pending?`${card(pending.status==='incoming'?'A repayment to confirm':'Waiting for confirmation',`${esc(p.name)} ${pending.status==='incoming'?'marked '+money(pending.amount)+' as repaid. Confirm only after you receive it.':'will confirm once they receive '+money(pending.amount)+'. Your balance stays unchanged until then.'}`)}${pending.status==='incoming'?button('I received '+money(pending.amount),'confirm-repayment:'+pending.id):'<span class="flow-badge">Pending</span>'}`:p.balance<0?`${card('Already paid them back?','Record your repayment here. '+esc(p.name)+' confirms receiving it before your balance changes.')}${button('Mark '+money(-p.balance)+' as repaid','repay:'+id)}`:empty('✓',p.balance===0?'All settled.':'Nothing to send.',p.balance===0?'You’re square with '+esc(p.name)+'.':esc(p.name)+' will record their repayment for you to confirm.')}${section('Repayment history')}${ui.repayments.filter(r=>r.friend===id&&r.status==='confirmed').map(r=>card('Confirmed',money(r.amount)+' repaid')).join('')||'<p class="subtext">No confirmed repayments yet.</p>'}`;
  }
  function auth(page){
    if(page==='login'||page==='register')return `${title('YOUR PEOPLE ARE HERE','Welcome to Ekipma.','Your people, one tap away.')}<div class="flow-auth-art" aria-hidden="true">✦</div><div class="auth-options">${button('Continue with Google','oauth:google','auth-provider')}${button('Continue with Apple','oauth:apple','auth-provider')}</div><p class="auth-divider">or</p>${ui.authMethod==='phone'?ui.authMode==='password'?`<form id="login-form"><div class="flow-inline"><label class="form-label">Country<select class="field" name="country"><option>+98</option><option>+1</option></select></label>${field('Phone number','phone',ui.authPhone,'tel','required placeholder="912 345 6789"')}</div>${field('Password','password','','password','required minlength="6" autocomplete="current-password"')}${submit('Continue')}</form>${button('Use a one-time code instead','otp-mode','text-button')}`:`<form id="register-form"><div class="flow-inline"><label class="form-label">Country<select class="field" name="country"><option>+98</option><option>+1</option><option>+44</option><option>+49</option></select></label>${field('Phone number','phone',ui.authPhone,'tel','required pattern="[0-9 +()-]{7,18}" autocomplete="tel-national" placeholder="912 345 6789"')}</div><p class="form-note">We’ll text you a sign-in code.</p>${submit('Send code')}</form>${button('Use password instead','password-mode','text-button')}`:button('Continue with phone','phone','action')}<p class="auth-terms">By continuing, you agree to our terms and privacy policy.</p><button type="button" class="text-button" data-go="policy">Privacy & terms</button>`;
    if(page==='otp')return `${title('CHECK YOUR MESSAGES','Check your messages.','Enter the six-digit code.')}<p class="auth-number" dir="ltr">${esc(ui.authDestination||'')}</p><form id="otp-form">${field('Verification code','code','','text','required pattern="[0-9]{6}" maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="••••••"')}${error(ui.otpError)}${submit('Continue')}</form>${button('Send a new code','resend','text-button')}${button('Change phone number','phone','text-button')}`;
    return `${title('MAKE YOURSELF AT HOME','What should we call you?','This is how your friends will see you.')}<form id="account-form">${field('Your name','name',ui.authMethod==='phone'?'':'Hayyaun','text','required maxlength="40" autocomplete="name"')}${submit('Let’s go')}</form>`;
  }
  function circleForm(page){
    if(page==='new-circle')return `${title('GOOD THINGS START SMALL','Make a Circle.','For your people and whatever you share.')}<div class="flow-auth-art mint" aria-hidden="true">✳</div><form id="circle-form">${field('Circle name','name','','text','required maxlength="40" placeholder="e.g. Weekend crew"')}${field('A little description','description','','text','maxlength="120" placeholder="What brings you together?"')}${submit('Create Circle')}</form>`;
    if(page==='join')return `${title('THERE’S ROOM FOR YOU','Join your people.')}<div class="flow-auth-art" aria-hidden="true">↗</div><form id="join-form">${field('Invite code or link','code','','text','required maxlength="180" placeholder="Paste your invite here"')}<p class="flow-error" id="join-error" role="alert"></p>${submit('Preview Circle')}</form>`;
    return `${title('ONE MORE FAMILIAR FACE','Add a friend.','Find them by their phone number.')}<form id="friend-form">${field('Phone number','phone','','tel','required pattern="[0-9 +()-]{7,18}" placeholder="+98 912 345 6789"')}${submit('Find friend')}</form>${section('Already in your phone?')}${link('Find friends from contacts','contacts','Choose who to add.','＋')}`;
  }
  function members(id){const g=groups[id];if(!g)return null;return `${title('YOUR CIRCLE',g.name)}${link('Invite someone','invite/'+id,'Send a link or show your code','＋')}${section('The people')}<p class="subtext">${g.members.length} members</p>${g.members.map(p=>`<div class="row">${avatar(p)}<span class="row-copy"><strong>${esc(personName(p))}</strong><small>${p===(g.admin||'you')?'Circle admin':'Member'}</small></span>${(g.admin||'you')==='you'&&p!=='you'?button('Remove','remove-member:'+id+':'+p,'text-button danger',`aria-label="Remove ${esc(personName(p))}"`):''}</div>`).join('')}`;}
  function invite(id){const g=groups[id];if(!g)return null;const code=(g.code||'CREW27')+'-'+(g.inviteVersion||1);return `${title('BETTER TOGETHER','A place for your people.')}<div class="flow-card mint"><span class="flow-big-symbol" aria-hidden="true">↗</span><h3>${esc(g.name)}</h3><p class="subtext">${g.members.length} people · Come join the Circle</p></div><label class="form-label">Invitation code<input class="field" id="invite-code" readonly value="${esc(code)}"></label>${button('Copy invitation','copy-invite:'+id)}${button('Show QR invitation','qr:'+id,'action secondary')}${(g.admin||'you')==='you'?button('Generate a new invite code','renew-code:'+id,'text-button'):''}<p class="form-note">Anyone with a valid invitation can join this Circle.</p>`;}
  function circleSettings(id){const g=groups[id];if(!g)return null;return `${title('A LITTLE CIRCLE ADMIN',g.name)}${link('Members','members/'+id,g.members.length+' people')}${link('Invitation','invite/'+id,'Invite code and QR')}${card('Your role',(g.admin||'you')==='you'?'You are the Circle admin.':'You are a member.')}<div class="form-actions">${button((g.admin||'you')==='you'?'Delete Circle':'Leave Circle','archive-circle:'+id,'text-button danger')}</div>`;}
  function profile(){return `${title('A LITTLE MORE YOU','Personal details.')}<div class="flow-avatar-editor">${ui.profile.photo?`<img src="${ui.profile.photo}" alt="Your profile photo">`:avatar('you')}<label class="text-button">Change photo<input class="sr-only" id="avatar-upload" type="file" accept="image/png,image/jpeg,image/webp"></label></div><form id="profile-form">${field('Name','name',ui.profile.name,'text','required maxlength="40"')}${field('Email','email',ui.profile.email,'email','required')}<p class="form-note">Phone · +98 912 345 6789</p>${submit('Save changes')}</form>`;}
  function settings(){return `${title('A LITTLE MORE YOU','Your space.')}<button class="settings-profile flow-profile-link" data-go="profile">${ui.profile.photo?`<img class="avatar" src="${ui.profile.photo}" alt="">`:avatar('you')}<span><strong>${esc(ui.profile.name)}</strong><small>Personal details ${icon('arrow')}</small></span></button>${link('Notifications','notifications','You’re all caught up','✦')}${link('Invited people','invites','People you’ve brought along','↗')}${section('Make it yours')}${link('Ekipma Plus','premium',ui.premium?'Your membership is active':'A little extra for your Circles','✳')}${link('The little shop','shop',ui.tokens+' tokens available','▧')}${link('Preferences','preferences','Language, spacing, and sync','☷')}${link('Privacy & terms','policy')}${button('Log out','logout','text-button danger')}`;}
  function preferences(){const locale=localStorage.getItem('ekipma-pastel-locale')||'en-US';return `${title('YOUR OWN RHYTHM','Preferences.')}<div class="setting-row"><div>List spacing<small>A little room or a little more detail.</small></div><select id="density" aria-label="List spacing"><option value="airy" ${!app.state.compact?'selected':''}>Airy</option><option value="compact" ${app.state.compact?'selected':''}>Compact</option></select></div><div class="setting-row"><label for="reminders">Plan reminders<small>Remember the good things.</small></label><input type="checkbox" id="reminders" ${app.state.reminders?'checked':''}></div><div class="setting-row"><label for="locale">Language<small>Choose the app language.</small></label><select id="locale" aria-label="Language"><option value="en-US" ${locale==='en-US'?'selected':''}>en-US</option><option value="fa-IR" ${locale==='fa-IR'?'selected':''}>fa-IR</option><option value="fa-UN" ${locale==='fa-UN'?'selected':''}>fa-UN</option></select></div><div class="setting-row"><div>Sync<small>${ui.sync==='online'?'Up to date':ui.sync==='offline'?'Offline · Saved data available':'Couldn’t update'}</small></div>${button('Refresh','refresh','text-button')}</div>${button('Clear cached records','clear-data','text-button danger')}`;}
  const chartData={Week:[12,32,18,8,42,27,16],Month:[42,64,38,78,52,87,62],Year:[64,48,83,106,74,124,97]};
  function stats(){const v=chartData[ui.window];return `${title('THE BIGGER PICTURE','Your patterns.','Little moments, added up.')}<div class="segmented">${Object.keys(chartData).map(w=>button(w,'stats:'+w,'',`aria-pressed="${ui.window===w}"`)).join('')}</div>${!ui.premium?`${empty('✳','A little more perspective.','Explore your patterns with Ekipma Plus.',link('Discover Plus','premium'))}`:`<div class="flow-card payment"><p class="eyebrow">YOUR SHARE · THIS ${ui.window.toUpperCase()}</p><h3 class="flow-stat-number">${money(v.reduce((a,b)=>a+b,0))}</h3><p class="subtext">${v.length} expenses · Shared moments</p><div class="flow-chart" role="img" aria-label="${ui.window} expenses: ${v.join(', ')} dollars">${v.map((n,i)=>`<div><i style="--bar:${Math.round(n/Math.max(...v)*100)}%"></i><small>${ui.window==='Week'?['M','T','W','T','F','S','S'][i]:i+1}</small></div>`).join('')}</div><details><summary>View chart values</summary>${v.map((n,i)=>`<p class="subtext">Period ${i+1} · ${money(n)}</p>`).join('')}</details></div><div class="flow-stat-grid">${card('7','Shared expenses','mint')}${card('3','Circles this '+ui.window.toLowerCase(),'cyan')}</div>${section('Days together')}<div class="flow-heatmap" role="img" aria-label="Activity on 18 of the last 28 days">${Array.from({length:28},(_,i)=>`<i style="opacity:${i%3===0?.15:.35+(i%4)*.2}"></i>`).join('')}</div>${section('What you share')}<div class="flow-card"><div class="flow-distribution" role="img" aria-label="Payments 60 percent, turns 25 percent, plans 15 percent"><i></i><i></i><i></i></div><p class="subtext">Payments 60% · Turns 25% · Plans 15%</p></div><p class="form-note">Your share of expenses, separate from what friends owe you.</p>`}`;}
  function premium(){return `${title('A LITTLE EXTRA','More room for together.')}<div class="flow-premium-art" aria-hidden="true"><span>✳</span><i>✦</i><b>＋</b></div><div class="flow-card"><span class="flow-badge">EKIPMA PLUS</span><h3>${ui.premium?'You’re part of Plus.':'A clearer picture of your shared life.'}</h3><p class="subtext">30 days of Plus included with every successful token purchase.</p></div>${card('Automatic sync','Shared records stay up to date while you’re here.','cyan')}${!ui.premium?link('Get tokens + 30 days of Plus','tokens'):button('View your patterns','open-stats')}${link('Token balance','tokens',ui.tokens+' available')}`;}
  const assets=[{id:'candy',name:'Candy cloud',price:8,cls:'payment',mark:'☁'},{id:'lagoon',name:'Little lagoon',price:12,cls:'cyan',mark:'≈'},{id:'clover',name:'Lucky clover',price:10,cls:'mint',mark:'✳'}];
  function shop(){return `${title('SMALL THINGS. BIG PERSONALITY.','The little shop.')}<div class="flow-wallet"><span>${ui.tokens} tokens</span><button class="text-button" data-go="tokens">Add tokens ＋</button></div><div class="flow-shop">${assets.map(a=>`<button class="flow-card ${a.cls}" data-flow="asset:${a.id}"><span class="flow-big-symbol" aria-hidden="true">${a.mark}</span><h3>${a.name}</h3><p class="subtext">${ui.owned.includes(a.id)?'Owned ✓':a.price+' tokens'}</p></button>`).join('')}</div>${link('Purchase history','purchases')}`;}
  function tokens(){return `${title('FOR THE LITTLE EXTRAS','Add a little sparkle.')}<div class="flow-card mint"><p class="eyebrow">YOUR BALANCE</p><h3 class="flow-stat-number">${ui.tokens} <small>tokens</small></h3></div><form id="tokens-form"><fieldset class="flow-choices flow-token-options"><legend>Choose a pack</legend>${[10,20,50,100].map((n,i)=>`<label><input type="radio" name="quantity" value="${n}" ${i===0?'checked':''}><span><strong>${n} tokens</strong><small>${(n*10000).toLocaleString('en')} Toman</small></span></label>`).join('')}</fieldset><p class="form-note">1 token = 10,000 Toman. Review your total before continuing.</p>${submit('Review purchase')}</form>${link('Purchase history','purchases')}`;}
  function checkout(){const p=ui.purchase;if(!p)return title('YOUR LITTLE EXTRAS','Add tokens.')+empty('✦','Your next little extra.','Choose a token pack to get started.',link('Add tokens','tokens'));const text={review:['Ready when you are.','Check your pack and total.'],pending:['Waiting for payment.','You can return here after paying. Your tokens arrive once payment is confirmed.'],paid:['A little more sparkle.','Your tokens are ready, with 30 days of Plus included.'],failed:['That didn’t go through.','Your token balance has not changed. You can try again.'],reviewing:['We’re checking this one.','No need to pay again. Your payment is waiting for review.']}[p.status];return `${title('YOUR TOKEN PURCHASE',text[0])}<div class="flow-card mint"><span class="flow-big-symbol" aria-hidden="true">${p.status==='paid'?'✓':'✦'}</span><h3>${p.quantity} tokens</h3><p class="subtext">${(p.quantity*10000).toLocaleString('en')} Toman</p></div><p class="subtext" role="status">${text[1]}</p><div class="form-actions">${p.status==='review'?button('Continue to payment','start-payment'):p.status==='pending'||p.status==='reviewing'?button('Check payment status','check-payment'):p.status==='failed'?button('Try again','retry-payment'):link('Explore the shop','shop')}</div>${link('Purchase history','purchases')}`;}
  function statePage(){return `${title('LIFE HAPPENS','Still here for you.')}<div class="flow-card cyan"><h3>Reconnect at your pace.</h3><p class="subtext">Offline and error examples keep cached information readable.</p></div>${button('Show offline Home','offline','action secondary')}${button('Show sync error','sync-error','action secondary')}${button('Show loading state','loading','action secondary')}${button('Show empty Activity','empty','action secondary')}${button('Restore connection','refresh','action secondary')}`;}
  function page(name,id){
    if(['login','register','otp','account'].includes(name))return auth(name);
    if(['new-circle','join','add-friend'].includes(name))return circleForm(name);
    if(name==='plan'&&recordFor('hike')?.deleted)return title('YOUR PLANS','Plan removed.')+empty('✳','This plan was deleted.','Your other shared moments are still in Activity.',link('Open activity','activity'));
    if(name==='add')return editor();if(name==='review')return review();if(name==='record')return detailedRecord(id);
    if(name==='repayment')return repayment(id);if(name==='members')return members(id);if(name==='invite')return invite(id);if(name==='circle-settings')return circleSettings(id);
    if(name==='profile')return profile();if(name==='settings')return settings();if(name==='preferences')return preferences();if(name==='stats')return stats();if(name==='premium')return premium();if(name==='shop')return shop();if(name==='tokens')return tokens();if(name==='checkout')return checkout();if(name==='states')return statePage();
    if(name==='notifications')return `${title('ALL CAUGHT UP','A quiet moment.')}<div class="segmented">${button('Updates','notification-updates','', 'aria-pressed="true"')}</div>${empty('✦','Nothing new just yet.','Your shared story continues in Activity.',link('Open activity','activity'))}`;
    if(name==='invites')return `${title('BETTER WITH YOUR PEOPLE','Invited people.')} ${empty('↗','There’s room for more.','Invite your people into a Circle to get started.',link('Choose a Circle','circles'))}`;
    if(name==='contacts')return `${title('FAMILIAR FACES','Your people, closer.')}<div class="flow-card cyan"><h3>You choose who comes along.</h3><p class="subtext">Find people you know on Ekipma, then choose who to add.</p></div>${ui.contactsAdded?empty('✓','You found each other.','Darya and Ali are now in your friends.',link('See your people','circles')):`<form id="contacts-form"><fieldset class="flow-choices"><legend>People on Ekipma</legend>${['Darya','Ali'].map((n,i)=>`<label><input type="checkbox" name="contact" value="${i}" checked><span><span class="avatar cool">${n[0]}</span>${n}</span></label>`).join('')}</fieldset>${submit('Add selected friends')}</form>`}`;
    if(name==='purchases')return `${title('YOUR LITTLE EXTRAS','Purchase history.')} ${ui.purchases.length?ui.purchases.map(p=>`<button class="row" data-flow="purchase:${p.id}"><span class="avatar cool">✦</span><span class="row-copy"><strong>${p.quantity} tokens</strong><small>${(p.quantity*10000).toLocaleString('en')} Toman · Today</small></span><span class="flow-badge">${p.status}</span></button>`).join(''):empty('▤','Nothing here yet.','Your token purchases will appear here.',link('Browse token packs','tokens'))}`;
    if(name==='policy')return `${title('A LITTLE CLARITY','Privacy & terms.')}<div class="flow-card"><h3>Your information</h3><p class="subtext">This page reserves space for the approved privacy policy and terms.</p></div><p class="form-note">Design placeholder only. Final legal text must be supplied before release.</p>${link('Back to your space','settings')}`;
    if(name==='balance'){const b=balances(),owed=app.state.balanceTab==='owed';return `${title('THE FULL PICTURE','Your balance.')}<div class="balance-total">${amount(fmt(b.owed-b.owe))}<p class="subtext">Across your people and Circles</p></div><div class="segmented"><button data-balance-tab="owed" aria-pressed="${owed}">You're owed</button><button data-balance-tab="owe" aria-pressed="${!owed}">You owe</button></div><p class="selected-total">${money(owed?b.owed:b.owe)}</p>${Object.keys(people).filter(id=>owed?people[id].balance>0:people[id].balance<0).map(friendRow).join('')||empty('✓','All clear.','Nothing outstanding here.')}`;}
    if(name==='activity'&&ui.clear)return `${title('A FRESH PAGE','Your shared story.')} ${empty('▤','No records yet.','Start with a small shared moment.',link('Add your first record','add'))}`;
    return null;
  }
  function append(name,id){
    if(name==='circles')return `<div class="flow-tools">${link('Add a friend','add-friend','By phone or from contacts','＋')}${link('Create a Circle','new-circle','A home for something shared','✳')}${link('Join a Circle','join','Have an invite?','↗')}<label class="flow-check"><input id="hide-zero" type="checkbox" ${ui.hideZero?'checked':''}> Hide settled friends</label></div>`;
    if(name==='group')return link('Circle details','circle-settings/'+id,'Members, invitations, and settings');
    if(name==='friend')return `${link('Settle up','repayment/'+id,'Repayments and confirmations','✓')}${button('Remove friend','remove-friend:'+id,'text-button danger')}`;
    if(name==='plan'&&!recordFor('hike')?.deleted)return button('Location & calendar','event-tools:hike','action secondary')+button('Delete plan','delete-record:hike','text-button danger');
    if(name==='home')return section('Latest together','All activity','activity')+recordRows(app.state.records.filter(r=>!r.deleted).slice(0,2));
    if(name==='activity')return link('See your patterns','stats','A little perspective on what you share','▥');
    return '';
  }
  function afterRender(name){
    const addButton = $('#app-nav .add-nav');
    if (addButton && ['add', 'review'].includes(name)) {
      addButton.dataset.recordType = (name === 'review' ? ui.review?.type : ui.draft.type) || 'payment';
      addButton.setAttribute('aria-current', 'page');
    }
    const authPage=['login','register','otp','account'].includes(name);
    $('.phone').classList.toggle('flow-auth',authPage);
    if(authPage)$('#app-header').innerHTML=`<button class="header-back" data-go="${name==='login'||name==='register'?'welcome':'login'}">${icon('back')} Back</button><span class="brand">ekipma<span>•</span></span>`;
    if(name==='home'){
      if(recordFor('hike')?.deleted)$('.upcoming')?.remove();
      const b=balances();$('.medallion .amount').outerHTML=amount(fmt(b.owed-b.owe));
      $('[data-balance="owed"] strong').textContent=money(b.owed);$('[data-balance="owe"] strong').textContent=money(b.owe);
      $('.home-intro .eyebrow').textContent='HEY, '+ui.profile.name.toUpperCase();
      if(ui.sync!=='online')$('#screen .page').insertAdjacentHTML('afterbegin',`<div class="flow-sync" role="status"><span>${ui.sync==='offline'?'Offline · Showing saved balances':'Couldn’t update your records'}</span>${button('Retry','refresh','text-button')}</div>`);
      document.querySelectorAll('.page [data-go^="friend/"]').forEach(el=>{if(people[el.dataset.go.split('/')[1]]?.removed)el.remove();});
    }
    if(name==='activity')$('#screen .page > .flow-tools')?.remove();
    const activeLink=$('#page-menu a[href="#'+app.route+'"]');if(activeLink?.closest('details'))activeLink.closest('details').open=true;
    if(['group','friend'].includes(name)){
      const el=$('.page .amount'); if(name==='group'&&el){const g=groups[app.route.split('/')[1]];el.outerHTML=amount(g.owed-g.owe);}
    }
    if(name==='join'){const code=new URLSearchParams(location.search).get('invite');if(code)$('[name="code"]').value=code;$('#page-description').textContent='Paste a copied preview invitation or use SUNDAY to try joining a new Circle. Invalid codes show an error.';}
    if(name==='contacts')$('#page-description').textContent='Contact import study using two sample contacts. No device contacts or permissions are accessed.';
    if(name==='premium')$('#page-description').textContent='The current app includes 30 days of Premium with each successful token purchase. Plus is the proposed presentation name in this design.';
    if(name==='otp')$('#page-description').textContent='Registration code study. Use 123456 to continue; another code demonstrates an error. No SMS is sent.';
    if(name==='login'||name==='register'||name==='account')$('#page-description').textContent='Unified signup and login preview. Google and Apple simulate a successful provider response. Phone uses demo SMS code 123456. New users choose a display name; returning users continue home. No real authentication or SMS is performed.';
    if(name==='add')$('#page-description').textContent='Choose a Circle or individual friends, add context, then review. The app currently fixes payment entry to Toman and the current user as payer; the existing USD sample is retained here. Saved drafts do not affect balances; adding a record updates sample balances.';
    if(name==='stats')$('#page-description').textContent='A focused statistics layout using illustrative chart data. The app has premium-gated expense statistics; several of its other graphs are placeholders. Use the Plus control below to inspect the locked state.';
    if(name==='notifications'||name==='invites')$('#page-description').textContent='The current app provides an empty screen here. This is its designed empty state, without inventing a notification or invitation system.';
    let controls=$('#flow-scenarios'); if(!controls){controls=document.createElement('div');controls.id='flow-scenarios';$('.guide').append(controls);}
    controls.innerHTML=name==='repayment'&&ui.repayments.some(r=>r.friend===app.route.split('/')[1]&&r.status==='pending')?`<p class="eyebrow">OTHER PERSON’S ACTION</p>${button('Friend confirms receipt','friend-confirms:'+app.route.split('/')[1],'reset')}`:name==='checkout'?`<p class="eyebrow">PAYMENT SCENARIOS</p>${['paid','failed','reviewing'].map(s=>button(s==='paid'?'Successful':s==='failed'?'Failed':'Needs review','payment-state:'+s,'reset')).join('')}`:name==='stats'||name==='premium'?`<p class="eyebrow">MEMBERSHIP PREVIEW</p>${button(ui.premium?'Show free account':'Show Plus account','toggle-plus','reset')}`:'';
  }
  function close(){ $('#modal').close(); }
  function finish(message,destination){close();if(destination)go(destination);else render();toast(message);}
  function addPerson(name,phone=''){
    const existing=Object.entries(people).find(([,p])=>p.phone===phone&&phone);
    if(existing){existing[1].removed=false;return existing[0];}
    const id='person'+ui.id++;people[id]={name,phone,balance:0,groups:[],color:'cool',initials:name[0].toUpperCase()};return id;
  }
  function publish(draftOnly){
    if(!ui.review)return;
    const d=structuredClone(ui.review), id=d.savedId||'record'+ui.id++;
    if(d.savedId)app.state.records=app.state.records.filter(r=>r.id!==d.savedId);
    const r={...d,id,draft:draftOnly,date:'Just now',iter:0,posted:!draftOnly};
    app.state.records.unshift(r);if(!draftOnly)applyRecord(r);
    ui.review=null;ui.draft=fresh().draft;ui.clear=false;go('record/'+id);toast(draftOnly?'Draft saved':'Record added to this preview');
  }
  function eventTools(id){const r=recordFor(id);if(!r)return;modal('Time for something good',`<p class="subtext">${esc(r.location||'Darband trailhead, Tehran')}</p>${button('Open in maps','map:'+id)}${button('Add to calendar','calendar:'+id,'action secondary')}`);}
  function click(event,el){
    const command=el.dataset.flow;if(!command)return false;
    const [action,id,other]=command.split(':');event.preventDefault();
    if(action==='close'){close();return true;}
    if(action==='phone'){ui.authMethod='phone';ui.otpError='';go('login');return true;}
    if(action==='password-mode'){ui.authMethod='phone';ui.authMode='password';render();return true;}
    if(action==='otp-mode'){ui.authMode='otp';render();return true;}
    if(action==='oauth'){ui.authMethod=id;ui.authKey=id;go(ui.knownAuth[id]?'home':'account');return true;}
    if(action==='type'){const f=$('#record-editor');if(f)capture(f);ui.draft.type=id;render();return true;}
    if(action==='cancel-record'){ui.draft=fresh().draft;go('home');return true;}
    if(action==='publish'||action==='draft'){publish(action==='draft');return true;}
    if(action==='edit-draft'){go('add');return true;}
    if(action==='review-saved'){const r=recordFor(id);ui.review={...structuredClone(r),savedId:id};ui.draft={...ui.draft,...structuredClone(r)};go('review');return true;}
    if(action==='delete-record'){confirm('Delete this record?','This removes the shared record. Other people’s related records will be affected in the real app.','delete-record-confirm:'+id,'Delete record');return true;}
    if(action==='delete-record-confirm'){const r=recordFor(id);if(r?.id==='groceries')return true;if(r){if(!r.draft&&!r.deleted)applyRecord(r,-1);r.deleted=true;}finish('Record deleted','activity');return true;}
    if(action==='advance'){const r=recordFor(id);if(r.participants[(r.iter||0)%r.participants.length]!=='you')return true;confirm('Pass the turn along?',`${esc(personName(r.participants[(r.iter||0)%r.participants.length]))} has finished. ${esc(personName(r.participants[((r.iter||0)+1)%r.participants.length]))} is next.`, 'advance-confirm:'+id,'Complete turn');return true;}
    if(action==='advance-confirm'){const r=recordFor(id);if(r.participants[(r.iter||0)%r.participants.length]!=='you')return true;r.iter=(r.iter||0)+1;finish('Turn passed along');return true;}
    if(action==='repay'){const p=people[id];confirm('Record your repayment?',`${esc(p.name)} will confirm receipt of ${money(-p.balance)}. This records a repayment; it does not transfer money.`,'repay-confirm:'+id,'I paid them back');return true;}
    if(action==='repay-confirm'){if(!ui.repayments.some(r=>r.friend===id&&r.status==='pending'))ui.repayments.push({id:'repay'+ui.id++,friend:id,amount:-people[id].balance,status:'pending'});finish('Waiting for your friend to confirm');return true;}
    if(action==='friend-confirms'){const r=ui.repayments.find(r=>r.friend===id&&r.status==='pending');if(r){adjustPerson(id,r.amount,id==='nima'?'home':'crew');r.status='confirmed';finish('Your friend confirmed receipt');}return true;}
    if(action==='confirm-repayment'){const r=ui.repayments.find(r=>r.id===id);confirm('Received the repayment?',`Confirm that ${esc(people[r.friend].name)} repaid ${money(r.amount)}.`,'received:'+id,'Confirm receipt');return true;}
    if(action==='received'){const r=ui.repayments.find(r=>r.id===id);if(r.status!=='confirmed'){adjustPerson(r.friend,-r.amount,'crew');r.status='confirmed';}finish('Repayment confirmed');return true;}
    if(action==='remove-friend'){confirm('Remove this friend?','Shared record history will remain available.','remove-friend-confirm:'+id,'Remove friend');return true;}
    if(action==='remove-friend-confirm'){people[id].removed=true;finish('Friend removed','circles');return true;}
    if(action==='remove-member'){confirm('Remove '+esc(personName(other))+'?', 'They will no longer be part of this Circle.','remove-member-confirm:'+id+':'+other,'Remove member');return true;}
    if(action==='remove-member-confirm'){groups[id].members=groups[id].members.filter(p=>p!==other);people[other].groups=people[other].groups.filter(g=>g!==id);finish('Member removed');return true;}
    if(action==='archive-circle'){confirm((groups[id].admin||'you')==='you'?'Delete this Circle?':'Leave this Circle?','Your existing record history remains available.','archive-confirm:'+id,'Confirm');return true;}
    if(action==='archive-confirm'){groups[id].archived=true;Object.values(people).forEach(p=>p.groups=p.groups.filter(g=>g!==id));finish('Circle removed from your list','circles');return true;}
    if(action==='renew-code'){confirm('Replace the invitation?','The previous invite code will stop working.','renew-confirm:'+id,'Generate new code');return true;}
    if(action==='renew-confirm'){groups[id].inviteVersion=(groups[id].inviteVersion||1)+1;finish('New invitation ready');return true;}
    if(action==='copy-invite'){
      const code=(groups[id].code||'CREW27')+'-'+(groups[id].inviteVersion||1);
      const previewURL=new URL(location.href);previewURL.hash='join';previewURL.searchParams.set('invite',code);
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(previewURL.href).then(()=>toast('Preview invitation copied')).catch(()=>{const input=$('#invite-code');input.focus();input.select();toast('Select and copy the invitation code');});
      else {const input=$('#invite-code');input.focus();input.select();toast('Select and copy the invitation code');}return true;
    }
    if(action==='qr'){modal('Your Circle invitation',`<div class="flow-qr"><img src="assets/invite-qr.svg" alt="Non-scannable invitation QR layout placeholder" width="192" height="192"></div><p class="subtext">${esc(groups[id].name)}</p><p class="form-note">QR layout study. Placeholder artwork, not a scannable code. A live invitation QR will be generated by the app.</p>${button('Back to invitation','close','action secondary')}`);return true;}
    if(action==='join-confirm'){if(groups[id]){groups[id].archived=false;if(!groups[id].members.includes('you'))groups[id].members.unshift('you');}else{groups[id]={name:'Sunday people',mark:'✳',members:['you','mina'],owed:0,owe:0,description:'A little more outside.',admin:'mina',code:'SUNDAY'};people.mina.groups.push(id);}finish('You’re in!','group/'+id);return true;}
    if(action==='add-found'){const pid=addPerson(ui.found.name,ui.found.phone);finish('Friend added','friend/'+pid);return true;}
    if(action==='resend'){ui.otpError='';render();toast('New preview code ready · 123456');return true;}
    if(action==='logout'){confirm('See you soon?','Log out of your account on this device.','logout-confirm','Log out');return true;}
    if(action==='logout-confirm'){ui.authError='';finish('Logged out of the preview','login');return true;}
    if(action==='clear-data'){confirm('Clear cached records?','Your account and records on the server stay safe. Refresh will load them again.','clear-confirm','Clear cache');return true;}
    if(action==='clear-confirm'){ui.clear=true;finish('Cached list cleared','activity');return true;}
    if(action==='refresh'){ui.sync='online';ui.clear=false;finish('Your records are up to date',app.route==='states'?'home':null);return true;}
    if(action==='offline'||action==='sync-error'){ui.sync=action==='offline'?'offline':'error';go('home');return true;}
    if(action==='empty'){ui.clear=true;go('activity');return true;}
    if(action==='loading'){modal('Bringing everyone together',`<div class="flow-loading" role="status"><span></span><span></span><span></span><p class="subtext">Updating your shared records…</p></div>${button('Show loaded screen','loaded','action secondary')}`);return true;}
    if(action==='loaded'){finish('Up to date','home');return true;}
    if(action==='stats'){ui.window=id;render();return true;}
    if(action==='notification-updates'){toast('You’re all caught up');return true;}
    if(action==='toggle-plus'){ui.premium=!ui.premium;render();return true;}
    if(action==='open-stats'){go('stats');return true;}
    if(action==='asset'){const a=assets.find(a=>a.id===id);modal(a.name,`<div class="flow-card ${a.cls}"><span class="flow-big-symbol">${a.mark}</span><p class="subtext">A little personality for your shared records.</p></div>${ui.owned.includes(id)?'<p class="form-note">Already in your collection.</p>':button('Get it · '+a.price+' tokens','buy:'+id)}`);return true;}
    if(action==='buy'){const a=assets.find(a=>a.id===id);if(ui.owned.includes(id))return true;if(ui.tokens<a.price){go('tokens');toast('Add tokens to complete your collection');}else{ui.tokens-=a.price;ui.owned.push(id);finish('Added to your collection');}return true;}
    if(action==='start-payment'){ui.purchase.status='pending';if(!ui.purchases.some(p=>p.id===ui.purchase.id))ui.purchases.unshift(ui.purchase);render();toast('Payment preview · Choose an outcome in the design menu');return true;}
    if(action==='payment-state'){const p=ui.purchase;if(!p||p.status==='paid'){toast('Start a new purchase to try another outcome');return true;}if(p.status==='review'){toast('Continue to payment first');return true;}p.status=id;if(id==='paid'&&!p.credited){ui.tokens+=p.quantity;p.credited=true;ui.premium=true;}render();return true;}
    if(action==='check-payment'){toast(ui.purchase.status==='reviewing'?'Still under review · No second payment needed':'Still waiting for confirmation');return true;}
    if(action==='retry-payment'){ui.purchase={id:'purchase'+ui.id++,quantity:ui.purchase.quantity,status:'review',credited:false};render();return true;}
    if(action==='purchase'){ui.purchase=ui.purchases.find(p=>p.id===id);go('checkout');return true;}
    if(action==='event-tools'){eventTools(id);return true;}
    if(action==='map'){const r=recordFor(id);window.open('https://www.openstreetmap.org/search?query='+encodeURIComponent(r.location||'Darband Tehran'),'_blank','noopener,noreferrer');return true;}
    if(action==='calendar'){
      const r=recordFor(id),start=new Date(r.when||'2026-09-27T08:00:00+03:30'),end=new Date(start.getTime()+3600000);
      const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
      const ics=s=>String(s||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/[,;]/g,'\\$&').replace(/\r/g,'');
      const text=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Ekipma//Design preview//EN','BEGIN:VEVENT','UID:'+id+'@ekipma-preview','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(start),'DTEND:'+stamp(end),'SUMMARY:'+ics(r.title),'LOCATION:'+ics(r.location||'Darband trailhead'),'END:VEVENT','END:VCALENDAR'].join('\r\n');
      const url=URL.createObjectURL(new Blob([text],{type:'text/calendar'})),a=document.createElement('a');a.href=url;a.download='ekipma-plan.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Calendar file ready');return true;
    }
    return true;
  }
  document.addEventListener('submit', event=>{
    const form=event.target,id=form.id;
    if(!['record-editor','login-form','register-form','otp-form','account-form','circle-form','join-form','friend-form','contacts-form','profile-form','tokens-form'].includes(id))return;
    event.preventDefault();const data=Object.fromEntries(new FormData(form));
    if(id==='record-editor'){
      capture(form);if(!ui.draft.group)ui.draft.participants=new FormData(form).getAll('participant');
      const members=participants();if(!ui.draft.title.trim()||!members.length){$('#record-error').textContent='Add a title and choose at least one participant.';return;}
      ui.review={...structuredClone(ui.draft),title:ui.draft.title.trim(),amount:Number(ui.draft.amount),participants:[...members]};go('review');
    }
    if(id==='login-form'){ui.authPhone=data.phone;ui.authError='';go('home');toast('Welcome back · Preview account');}
    if(id==='register-form'){ui.authPhone=data.phone;ui.authDestination=data.country+' '+data.phone;ui.authKey=ui.authDestination.replace(/[^+0-9]/g,'');ui.otpError='';go('otp');}
    if(id==='otp-form'){if(data.code!=='123456'){ui.otpError='That code doesn’t match. Please try again.';render();return;}ui.otpError='';go(ui.knownAuth[ui.authKey]?'home':'account');}
    if(id==='account-form'){if(!data.name.trim())return;ui.profile.name=data.name.trim();if(ui.authKey)ui.knownAuth[ui.authKey]=true;go('home');toast('Welcome to your Circles');}
    if(id==='profile-form'){if(!data.name.trim())return;ui.profile.name=data.name.trim();ui.profile.email=data.email;go('settings');toast('Profile updated');}
    if(id==='circle-form'){if(!data.name.trim())return;const gid='circle'+ui.id++;groups[gid]={name:data.name.trim(),description:data.description,mark:'✳',members:['you'],owed:0,owe:0,admin:'you',code:'CIRCLE'+ui.id};go('invite/'+gid);toast('Your Circle is ready');}
    if(id==='join-form'){
      let code=data.code.trim();try{if(code.includes('://'))code=new URL(code).searchParams.get('invite')||code.split('/').pop();}catch{/* Validate as a plain code below. */}
      const found=Object.entries(groups).find(([,g])=>code===(g.code||'CREW27')+'-'+(g.inviteVersion||1));
      if(!found&&code!=='SUNDAY'){ $('#join-error').textContent='This invitation isn’t valid. Ask for a fresh link.';return; }
      const gid=found?.[0]||'sunday';modal('Your people are waiting',`${card(esc(found?.[1].name||'Sunday people'),'A Circle for shared moments.','mint')}${button('Join Circle','join-confirm:'+gid)}`);
    }
    if(id==='friend-form'){const match=Object.values(people).find(p=>p.phone===data.phone);ui.found={name:match?.name||'Darya',phone:data.phone};modal('Found your friend',`${card(esc(ui.found.name),esc(data.phone),'cyan')}${button('Add friend','add-found')}`);}
    if(id==='contacts-form'){const values=new FormData(form).getAll('contact');if(!values.length){toast('Choose at least one friend');return;}values.forEach(v=>addPerson(v==='0'?'Darya':'Ali',v==='0'?'+989120001001':'+989120001002'));ui.contactsAdded=true;render();toast('Selected friends added');}
    if(id==='tokens-form'){ui.purchase={id:'purchase'+ui.id++,quantity:Number(data.quantity),status:'review',credited:false};go('checkout');}
  });
  document.addEventListener('input',event=>{if(event.target.closest('#record-editor')){capture($('#record-editor'));const count=participants().length;if($('#flow-split'))$('#flow-split').textContent=count?`${money(Number(ui.draft.amount||0)/count)} each · ${count} people`:'Choose participants';}});
  document.addEventListener('change',event=>{
    const target=event.target;
    if(target.id==='hide-zero'){ui.hideZero=target.checked;render();}
    if(target.closest('#record-editor')){
      capture($('#record-editor'));
      if(target.name==='participant')ui.draft.participants=new FormData($('#record-editor')).getAll('participant');
      if(target.name==='group')render();
      const count=participants().length;if($('#flow-split'))$('#flow-split').textContent=count?`${money(Number(ui.draft.amount||0)/count)} each · ${count} people`:'Choose participants';
    }
    if(target.id==='avatar-upload'){
      const file=target.files[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){toast('Choose a PNG, JPEG, or WebP image under 5 MB');return;}
      const reader=new FileReader();reader.onload=()=>{ui.profile.photo=reader.result;render();toast('Profile photo updated in preview');};reader.onerror=()=>toast('Couldn’t read that image');reader.readAsDataURL(file);
    }
  });
  const routes = Object.keys(labels);
  const menuGroups=[['Get started',[['login','Sign in / Join'],['otp','Verify number'],['account','Your name']]],['Your people',[['new-circle','Create Circle'],['join','Join Circle'],['add-friend','Add friend'],['contacts','Contacts'],['members/crew','Members'],['invite/crew','Invitation'],['circle-settings/crew','Circle settings']]],['Make it complete',[['record/coffee','A turn'],['repayment/sara','Confirm repayment'],['repayment/nima','Settle a balance'],['profile','Personal details'],['preferences','Preferences'],['stats','Your patterns'],['notifications','Notifications'],['invites','Invited people'],['premium','Ekipma Plus'],['shop','The little shop'],['tokens','Add tokens'],['checkout','Payment status'],['purchases','Purchase history'],['policy','Privacy & terms'],['states','Loading, offline & empty']]]];
  menuGroups.forEach(([heading,items])=>$('#page-menu').insertAdjacentHTML('beforeend',`<details class="flow-menu-group"><summary>${heading}</summary>${items.map(([r,t])=>`<a href="#${r}">↗ <span>${t}</span></a>`).join('')}</details>`));
  $('#page-menu').addEventListener('click',event=>{if(event.target.closest('a')){const details=event.target.closest('details');if(details)details.open=true;}});
  return {page,append,afterRender,click,label:name=>labels[name]||name,hideZero:()=>ui.hideZero,
    accepts:value=>{const [p,id]=value.split('/');return routes.includes(p)&&(['members','invite','circle-settings'].includes(p)?!!groups[id]:p==='repayment'?!!people[id]:!id);},
    parent:(p,id)=>['members','invite','circle-settings'].includes(p)?'group/'+id:p==='repayment'?'friend/'+id:['profile','preferences','stats','premium','shop','notifications','invites'].includes(p)?'settings':['tokens','purchases'].includes(p)?'shop':p==='checkout'?'tokens':p==='review'?'add':['new-circle','join','add-friend','contacts'].includes(p)?'circles':null,
    addGroupRecord:id=>{ui.draft={...fresh().draft,group:id};go('add');},
    addFriendRecord:id=>{ui.draft={...fresh().draft,group:'',participants:['you',id]};go('add');},
    reset:()=>{Object.keys(people).forEach(k=>delete people[k]);Object.assign(people,structuredClone(originalPeople));Object.keys(groups).forEach(k=>delete groups[k]);Object.assign(groups,structuredClone(originalGroups));ui=fresh();},
  };
};
