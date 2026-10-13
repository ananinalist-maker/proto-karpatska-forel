/* Бронювання для прототипів «Карпатської Форелі»: календар вільних дат, гості, заявка у Viber (демо).
   Очікує розмітку з id: segType, oAd, oCh, kids, kAge, capHint, cal, calPrev, calNext, calSum, calReset, noDates,
   xChan, xTrain, fName, segHow, lbPhone, fPhone, fNote, bookForm, toViber, modal, mMsg, mClose, demoAvail.
   Необов'язково: pIn, pOut, pG (панель знизу), sT, sIn, sOut, sG, sN, sX (картка «Моя заявка»),
   кнопки [data-room] (+ data-ad, data-ch, data-chan, data-fish), [data-go]. v6: window.KF для попапів. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var LIVE=document.documentElement.hasAttribute('data-live');
var LEADS=window.KF_LEADS_URL||'';
var PHONE_TXT='050\u00a0925\u00a069\u00a003';
var VIBER='viber://chat?number=%2B380509256903';
var AV=JSON.parse($('#demoAvail').textContent);
var TYPES={any:['lx1','lx2','fm1','fm2','sd1','sd2'],dl:['sd1'],tr:['sd2'],ap:['fm1','fm2'],a3:['lx1','lx2']};
var CAP={any:14,dl:2,tr:2,ap:2,a3:4};
var NAMES={any:'будь-який вільний номер',dl:'Делюкс з окремими ліжками',tr:'Двомісний номер з терасою',ap:'Апартаменти з кухнею',a3:'Трикімнатні апартаменти'};
var MON=['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
var MGEN=['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
var WD=['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
var today=new Date();today.setHours(0,0,0,0);
var st={type:'any',ad:2,ch:0,a:null,b:null,how:'viber',view:new Date(today.getFullYear(),today.getMonth(),1)};
function clamp(x,a,b){return x<a?a:x>b?b:x}
function key(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function parse(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function add(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function busy(room,k){var r=AV.rooms[room];return !!r&&r.busy.some(function(b){return k>=b[0]&&k<b[1]})}
function full(d){var k=key(d);return TYPES[st.type].every(function(r){return busy(r,k)})}
function free(a,b){for(var d=new Date(a);d<b;d=add(d,1)){if(full(d))return false}return true}
function nights(n){var a=n%10,b=n%100;if(a===1&&b!==11)return n+' ніч';if(a>=2&&a<=4&&(b<12||b>14))return n+' ночі';return n+' ночей'}
function kidsW(n){var a=n%10,b=n%100;if(a===1&&b!==11)return n+' дитина';if(a>=2&&a<=4&&(b<12||b>14))return n+' дитини';return n+' дітей'}
function adW(n){return n===1?'1 дорослий':n+' дорослих'}
function fmt(d){return d.getDate()+' '+MGEN[d.getMonth()]}
function setText(id,t){var el=document.getElementById(id);if(el)el.textContent=t}
var cal=$('#cal');
var quickAfter=false;
var dp=$('#dp'),dpBg=$('#dpBg'),dpCal=$('#dpCal'),dpView=new Date(today.getFullYear(),today.getMonth(),1),dpAnchor=null,dpLast=null;
function calHTML(view,n){
  var h='', choosingOut=!!(st.a&&!st.b);
  for(var i=0;i<n;i++){
    var m=new Date(view.getFullYear(),view.getMonth()+i,1);
    h+='<div class="cal-m"><div class="cal-h">'+MON[m.getMonth()]+' '+m.getFullYear()+'</div><div class="cal-g">';
    WD.forEach(function(w){h+='<span class="cal-w">'+w+'</span>'});
    var off=(m.getDay()+6)%7;for(var j=0;j<off;j++)h+='<span></span>';
    var dim=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
    for(var d=1;d<=dim;d++){
      var dt=new Date(m.getFullYear(),m.getMonth(),d), past=dt<today, f=!past&&full(dt), cls='cal-d', dis=past;
      var asOut=choosingOut&&dt>st.a&&free(st.a,dt);
      if(f)cls+=' full';
      if(asOut&&f)cls+=' can-out';
      if(f&&!asOut)dis=true;
      if(choosingOut&&dt>st.a&&!asOut)dis=true;
      var isA=st.a&&+dt===+st.a, isB=st.b&&+dt===+st.b;
      if(isA)cls+=' s-a';
      if(isB)cls+=' s-b';
      if(st.a&&st.b&&dt>st.a&&dt<st.b)cls+=' s-in';
      h+='<button type="button" class="'+cls+'" data-k="'+key(dt)+'"'+(dis?' disabled':'')+' aria-label="'+d+' '+MGEN[m.getMonth()]+(f&&!asOut?', зайнято':'')+'"'+(isA||isB?' aria-pressed="true"':'')+'>'+d+'</button>';
    }
    h+='</div></div>';
  }
  return h;
}
function render(){
  cal.innerHTML=calHTML(st.view,innerWidth>=720?2:1);
  $('#calPrev').disabled=st.view<=new Date(today.getFullYear(),today.getMonth(),1);
  if(dp&&!dp.hidden)dpRender();
  summary();
}
function outs(){
  $$('[data-out=ad]').forEach(function(e){e.textContent=st.ad});
  $$('[data-out=ch]').forEach(function(e){e.textContent=st.ch});
  $$('[data-out=in]').forEach(function(e){e.textContent=st.a?fmt(st.a):'Оберіть дату'});
  $$('[data-out=out]').forEach(function(e){e.textContent=st.b?fmt(st.b):'Оберіть дату'});
}
function summary(){
  outs();
  var t;
  if($('#noDates').checked)t='Без дат: господар підкаже найближчі вільні.';
  else if(!st.a)t='Оберіть дату заїзду.';
  else if(!st.b)t='Заїзд '+fmt(st.a)+'. Тепер оберіть дату виїзду.';
  else t=fmt(st.a)+' → '+fmt(st.b)+' · '+nights(Math.round((st.b-st.a)/864e5));
  setText('calSum',t);
  var ph=innerWidth<=760?'дата':'Оберіть дату';
  setText('pIn',st.a?fmt(st.a):ph);
  setText('pOut',st.b?fmt(st.b):ph);
  setText('pG',adW(st.ad)+(st.ch?', '+kidsW(st.ch):''));
  var nd=$('#noDates').checked;
  setText('sT',NAMES[st.type].charAt(0).toUpperCase()+NAMES[st.type].slice(1));
  setText('sIn',nd?'підкаже господар':st.a?fmt(st.a):'—');
  setText('sOut',nd?'підкаже господар':st.b?fmt(st.b):'—');
  setText('sN',st.a&&st.b&&!nd?nights(Math.round((st.b-st.a)/864e5)):'—');
  setText('sG',adW(st.ad)+(st.ch?', '+kidsW(st.ch):''));
  var x=[];if($('#xChan').checked)x.push('чан на травах');if($('#xTrain').checked)x.push('рибалка');
  setText('sX',x.length?x.join(', '):'—');
}
function pick(dt){
  $('#noDates').checked=false;
  if(!st.a||st.b){if(full(dt))return;st.a=dt;st.b=null}
  else if(dt<=st.a){if(full(dt))return;st.a=dt}
  else if(free(st.a,dt)){st.b=dt}
  else if(!full(dt)){st.a=dt}
  if(st.a)st.view=new Date(st.a.getFullYear(),st.a.getMonth(),1);
  render();
}
cal.addEventListener('click',function(e){var b=e.target.closest('.cal-d');if(!b||b.disabled)return;pick(parse(b.dataset.k))});
$('#calPrev').addEventListener('click',function(){st.view=new Date(st.view.getFullYear(),st.view.getMonth()-1,1);render()});
$('#calNext').addEventListener('click',function(){st.view=new Date(st.view.getFullYear(),st.view.getMonth()+1,1);render()});
$('#calReset').addEventListener('click',function(){st.a=st.b=null;render()});
$('#noDates').addEventListener('change',function(){if(this.checked){st.a=st.b=null}render()});
var lastW=innerWidth;addEventListener('resize',function(){if((innerWidth>=720)!==(lastW>=720)){lastW=innerWidth;render()}});
function dpRender(){
  dpCal.innerHTML=calHTML(dpView,innerWidth>=720?2:1);
  $('#dpPrev').disabled=dpView<=new Date(today.getFullYear(),today.getMonth(),1);
  var t;
  if(!st.a)t='Оберіть дату заїзду';
  else if(!st.b)t='Тепер дата виїзду';
  else t='Ваші дати';
  setText('dpT',t);
  setText('dpSum',st.a&&st.b?fmt(st.a)+' → '+fmt(st.b)+' · '+nights(Math.round((st.b-st.a)/864e5)):st.a?'Заїзд '+fmt(st.a):'');
  dpPlace();
}
function dpPlace(){
  if(innerWidth<=760||!dpAnchor){dp.style.left=dp.style.top=dp.style.bottom='';return}
  var r=dpAnchor.getBoundingClientRect(),w=dp.offsetWidth,h=dp.offsetHeight,left=Math.min(Math.max(12,r.left),innerWidth-w-12);
  dp.style.left=left+'px';
  if(r.top>h+20){dp.style.top='';dp.style.bottom=(innerHeight-r.top+10)+'px'}
  else{dp.style.bottom='';dp.style.top=Math.min(r.bottom+10,innerHeight-h-12)+'px'}
}
function dpOpen(trigger,what){
  dpLast=trigger;dpAnchor=trigger.closest('.hbook,.dock')||trigger;
  if(what==='out'&&st.a&&st.b){st.b=null}
  if(what==='in'){st.a=st.b=null;$('#noDates').checked=false}
  dpView=st.a?new Date(st.a.getFullYear(),st.a.getMonth(),1):new Date(today.getFullYear(),today.getMonth(),1);
  dp.hidden=false;if(innerWidth<=760)dpBg.hidden=false;
  render();dpRender();
  setTimeout(function(){var f=dp.querySelector('.cal-d:not([disabled])');if(f)f.focus()},40);
}
function dpClose(){if(dp.hidden)return;dp.hidden=true;dpBg.hidden=true;if(quickAfter){quickAfter=false;if(st.a&&st.b){openQuick();return}}if(dpLast)dpLast.focus()}
$$('[data-dp]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();dpOpen(b,b.dataset.dp)})});
dpCal.addEventListener('click',function(e){var b=e.target.closest('.cal-d');if(!b||b.disabled)return;e.stopPropagation();pick(parse(b.dataset.k));if(st.a&&st.b)setTimeout(dpClose,450)});
$('#dpPrev').addEventListener('click',function(e){e.stopPropagation();dpView=new Date(dpView.getFullYear(),dpView.getMonth()-1,1);dpRender()});
$('#dpNext').addEventListener('click',function(e){e.stopPropagation();dpView=new Date(dpView.getFullYear(),dpView.getMonth()+1,1);dpRender()});
$('#dpX').addEventListener('click',dpClose);
$('#dpOk').addEventListener('click',dpClose);
dpBg.addEventListener('click',dpClose);
document.addEventListener('click',function(e){if(!dp.hidden&&!dp.contains(e.target)&&!e.target.closest('[data-dp]'))dpClose()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')dpClose()});
addEventListener('resize',function(){if(!dp.hidden)dpPlace()});
addEventListener('scroll',function(){if(!dp.hidden&&innerWidth>760)dpPlace()},{passive:true});
$$('[data-check]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();if(!st.a||!st.b){e.stopPropagation();quickAfter=true;dpOpen(b,'in')}else openQuick()})});
function capCheck(){
  var g=st.ad+st.ch, c=CAP[st.type], h=$('#capHint');
  if(g>c){h.textContent=st.type==='any'?'Вас більше, ніж місць у готелі. Напишіть господарю, він підкаже варіанти.':'У цьому номері до '+c+' гостей. Для '+g+' краще кілька номерів: оберіть «Будь-який номер», господар підбере.';h.classList.add('on')}
  else if(st.type==='any'&&g>4){h.textContent='Для '+g+' гостей господар підбере кілька номерів поруч.';h.classList.add('on')}
  else h.classList.remove('on');
}
function setType(v){
  st.type=v;$$('#segType button,#qbType button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===v)});
  if(st.a&&st.b&&!free(st.a,st.b)){st.a=st.b=null}
  if(st.a&&full(st.a)){st.a=st.b=null}
  capCheck();render();
}
$$('#segType button').forEach(function(b){b.addEventListener('click',function(){setType(b.dataset.v)})});
$$('[data-g]').forEach(function(b){b.addEventListener('click',function(){
  var g=b.dataset.g, d=+b.dataset.d;
  if(g==='ad')st.ad=clamp(st.ad+d,1,14);else st.ch=clamp(st.ch+d,0,10);
  setText('oAd',st.ad);setText('oCh',st.ch);$('#kids').classList.toggle('on',st.ch>0);capCheck();summary();
})});
var HOW={call:['Телефон для дзвінка','+380'],viber:['Номер у Viber','+380'],tg:['Нік або номер у Telegram','@нік або +380'],wa:['Номер у WhatsApp','+380']};
var HOWN={call:'дзвінок',viber:'Viber',tg:'Telegram',wa:'WhatsApp'};
$$('#segHow button').forEach(function(b){b.addEventListener('click',function(){
  st.how=b.dataset.v;$$('#segHow button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
  setText('lbPhone',HOW[st.how][0]);$('#fPhone').placeholder=HOW[st.how][1];
})});
function goBook(){$('#bron').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
function preset(o){
  var d={room:o.room,ad:o.group!=null?o.group:o.ad,ch:o.ch,chan:o.chan,fish:o.fish};
  if(d.room)setType(d.room);
  if(d.ad!=null){st.ad=clamp(+d.ad,1,14);setText('oAd',st.ad)}
  if(d.ch!=null){st.ch=clamp(+d.ch,0,10);setText('oCh',st.ch);$('#kids').classList.toggle('on',st.ch>0)}
  if(d.chan)$('#xChan').checked=true;
  if(d.fish)$('#xTrain').checked=true;
  capCheck();summary();
}
$$('[data-room],[data-fish],[data-chan]').forEach(function(b){b.addEventListener('click',function(){preset(b.dataset);goBook()})});
$$('#xChan,#xTrain').forEach(function(c){c.addEventListener('change',summary)});
/* зайняті дати з Google-таблиці (sheet.js): types = {dl:[...],tr:[...],ap:[...],a3:[...]}, av = {rooms:{назва:{busy:[[з,до)...]}}} */
function setAvail(types,av){
  if(types){['dl','tr','ap','a3'].forEach(function(k){if(types[k]&&types[k].length)TYPES[k]=types[k]});TYPES.any=[].concat(TYPES.dl,TYPES.tr,TYPES.ap,TYPES.a3)}
  AV=av&&av.rooms?av:{rooms:{}};
  if(st.a&&st.b&&!free(st.a,st.b)){st.a=st.b=null}
  if(st.a&&full(st.a)){st.a=st.b=null}
  render();
}
window.KF={preset:preset,goBook:goBook,setAvail:setAvail};
$$('[data-go]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();goBook()})});
function message(){
  var L=['Вітаю! Заявка з сайту «Карпатська Форель».','Номер: '+NAMES[st.type]];
  if($('#noDates').checked||!st.a||!st.b)L.push('Дати: ще не знаємо точно, підкажіть найближчі вільні');
  else L.push('Дати: з '+fmt(st.a)+' по '+fmt(st.b)+', '+nights(Math.round((st.b-st.a)/864e5)));
  var g='Гості: '+adW(st.ad);if(st.ch){g+=', '+kidsW(st.ch);var age=$('#kAge').value.trim();if(age)g+=' (вік: '+age+')'}L.push(g);
  if($('#xChan').checked)L.push('Хочемо чан на травах.');
  if($('#xTrain').checked)L.push('Хочемо порибалити, приготуйте, будь ласка, вудки.');
  var nm=$('#fName').value.trim(), ph=$('#fPhone').value.trim(), nt=$('#fNote').value.trim();
  if(nm)L.push("Ім'я: "+nm);
  L.push("Зв'язатися: "+HOWN[st.how]+(ph?', '+ph:''));
  if(nt)L.push('Коментар: '+nt);
  return L.join('\n');
}
var modal=$('#modal'), lastFocus=null;
function openModal(){lastFocus=document.activeElement;$('#mMsg').textContent=message();modal.classList.add('on');setTimeout(function(){$('#mClose').focus()},50)}
function closeModal(){if(!modal.classList.contains('on'))return;modal.classList.remove('on');if(lastFocus)lastFocus.focus()}
$('#mClose').addEventListener('click',closeModal);
modal.addEventListener('click',function(e){if(e.target===modal)closeModal()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal()});
/* текст заявки в буфер і чат з господарем у Viber (draft підставляє текст, де Viber це вміє) */
function sendViber(){
  var txt=message(), go=function(){location.href=VIBER+'&draft='+encodeURIComponent(txt)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(go,go)}else go();
}
/* копія заявки господарю (Worker → Telegram + таблиця заявок) */
function payload(via,txt){
  var nd=$('#noDates').checked||!st.a||!st.b, hp=$('#fWebsite');
  return {via:via,text:txt,name:$('#fName').value.trim(),phone:$('#fPhone').value.trim(),reply:HOWN[st.how],
    checkin:nd?'':fmt(st.a),checkout:nd?'':fmt(st.b),nights:nd?'':String(Math.round((st.b-st.a)/864e5)),
    guests:adW(st.ad)+(st.ch?', '+kidsW(st.ch):''),room:NAMES[st.type],
    comment:[$('#xChan').checked?'чан':'',$('#xTrain').checked?'рибалка':'',$('#fNote').value.trim()].filter(Boolean).join('; '),
    website:hp?hp.value:'',page:location.href};
}
/* ту саму заявку повторно протягом 30 с не надсилаємо */
var lastSig='',lastAt=0,lastOk=false;
function dup(p){var sig=JSON.stringify(p);return {sig:sig,dup:sig===lastSig&&Date.now()-lastAt<30000}}
function remember(sig,ok){lastSig=ok?sig:'';lastAt=Date.now();lastOk=ok}
function post(p,extra){var o={method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)};for(var k in extra)if(extra[k]!==undefined)o[k]=extra[k];return fetch(LEADS,o)}
function copyToHost(){
  if(!LEADS||!window.fetch)return;
  var p=payload('viber',message()),r=dup(p);
  if(r.dup)return;remember(r.sig,true);
  try{post(p,{keepalive:true}).catch(function(){})}catch(x){}
}
var fErr=$('#fErr');
function err(t,el,box){box=box||fErr;if(box)box.textContent=t||'';$$('#fName,#fPhone,#qName,#qPhone').forEach(function(x){x.removeAttribute('aria-invalid')});if(el){el.setAttribute('aria-invalid','true');el.focus()}}
function setModal(title,text,viber){var t=$('#mT'),x=$('#mTx'),v=$('#mViber');if(t)t.textContent=title;if(x)x.textContent=text;if(v)v.hidden=!viber}
function submitViber(){
  if(LIVE){err('');setModal('Залишилось надіслати у Viber','Текст заявки вже скопійовано. У чаті з паном Євгеном вставте його, якщо Viber не вставив сам, і натисніть «Надіслати». Немає Viber? Подзвоніть: '+PHONE_TXT+'.',true)}
  openModal();if(LIVE){copyToHost();sendViber()}
}
$('#bookForm').addEventListener('submit',function(e){e.preventDefault();submitViber()});
/* «Немає Viber?»: заявка тільки через сайт; чекаємо відповідь до 8 с (no-cors: виконаний запит = успіх) */
function siteSend(btn,nm,ph,box){
  var v=ph.value.trim();
  if(!nm.value.trim())return err('Вкажіть, як до вас звертатися.',nm,box);
  if(st.how==='tg'?v.length<3:v.replace(/\D/g,'').length<9)return err(st.how==='tg'?'Вкажіть нік або номер у Telegram, щоб господар міг відповісти.':'Вкажіть номер телефону (не менше 9 цифр), щоб господар міг з вами зв’язатися.',ph,box);
  err('',null,box);
  var txt=message();
  function done(ok){
    closeQuick();
    if(ok)setModal('Заявку надіслано','Господар отримав вашу заявку і зв’яжеться з вами найближчим часом ('+v+'). Якщо терміново, телефонуйте: '+PHONE_TXT+'.',false);
    else setModal('Не вдалося надіслати','Будь ласка, зателефонуйте: '+PHONE_TXT+' або напишіть у Viber. Текст заявки нижче, його можна скопіювати.',false);
    openModal();
  }
  if(!LEADS||!window.fetch)return done(false);
  var p=payload('site',txt),r=dup(p);
  if(r.dup)return done(lastOk);
  var label=btn.textContent,timer,ctrl=window.AbortController?new AbortController():null;
  btn.disabled=true;btn.textContent='Надсилаємо…';
  var timeout=new Promise(function(res,rej){timer=setTimeout(function(){if(ctrl)ctrl.abort();rej(new Error('timeout'))},8000)});
  var req;try{req=post(p,{signal:ctrl?ctrl.signal:undefined})}catch(x){req=Promise.reject(x)}
  Promise.race([req,timeout]).then(function(){return true},function(){return false}).then(function(ok){
    clearTimeout(timer);btn.disabled=false;btn.textContent=label;remember(r.sig,ok);done(ok);
  });
}
var fSite=$('#fSite');
if(fSite)fSite.addEventListener('click',function(){siteSend(fSite,$('#fName'),$('#fPhone'),fErr)});
/* швидка заявка з першої плашки: ті самі дати й гості, ім'я й телефон синхронізуються з основною формою */
var qb=$('#qb');
function syncQ(toMain){[['#qName','#fName'],['#qPhone','#fPhone']].forEach(function(p){var a=$(p[0]),c=$(p[1]);if(!a||!c)return;if(toMain)c.value=a.value;else if(!a.value)a.value=c.value})}
function openQuick(){
  if(!qb)return goBook();
  syncQ(false);
  setText('qbSum',fmt(st.a)+' → '+fmt(st.b)+' · '+nights(Math.round((st.b-st.a)/864e5))+' · '+adW(st.ad)+(st.ch?', '+kidsW(st.ch):''));
  $$('#qbType button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.v===st.type)});
  err('',null,$('#qErr'));
  qb.classList.add('on');
  setTimeout(function(){var f=$('#qName');if(f&&!f.value)f.focus()},80);
}
function closeQuick(){if(qb)qb.classList.remove('on')}
if(qb){
  $('#qbX').addEventListener('click',closeQuick);
  qb.addEventListener('click',function(e){if(e.target===qb)closeQuick()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeQuick()});
  $$('#qbType button').forEach(function(x){x.addEventListener('click',function(){setType(x.dataset.v);capCheck()})});
  $('#qbSum').addEventListener('click',function(e){e.stopPropagation();closeQuick();quickAfter=true;dpOpen($('#hbook [data-dp=in]')||$('#qbSum'),'in')});
  $('#qbViber').addEventListener('click',function(){syncQ(true);closeQuick();submitViber()});
  var qs=$('#qbSite');
  if(!LEADS)qs.hidden=true;
  else qs.addEventListener('click',function(){syncQ(true);siteSend(qs,$('#qName'),$('#qPhone'),$('#qErr'))});
}
var tv=$('#toViber');if(tv&&tv.tagName==='BUTTON')tv.addEventListener('click',sendViber);
var mv=$('#mViber');if(mv)mv.addEventListener('click',sendViber);
render();summary();
})();
