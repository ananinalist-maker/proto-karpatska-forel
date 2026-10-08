/* Бронювання для прототипів «Карпатської Форелі»: календар вільних дат, гості, заявка у Viber (демо).
   Очікує розмітку з id: segType, oAd, oCh, kids, kAge, capHint, cal, calPrev, calNext, calSum, calReset, noDates,
   xChan, xTrain, fName, segHow, lbPhone, fPhone, fNote, bookForm, toViber, modal, mMsg, mClose, demoAvail.
   Необов'язково: pIn, pOut, pG (короткий підсумок у першому екрані), кнопки [data-room], [data-go], #addChan. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var VIBER='viber://chat?number=%2B380509256903';
var AV=JSON.parse($('#demoAvail').textContent);
var TYPES={any:['lx1','fm1','fm2','fm3','sd1','sd2'],lx:['lx1'],fm:['fm1','fm2','fm3'],sd:['sd1','sd2']};
var CAP={any:14,lx:4,fm:2,sd:2};
var NAMES={any:'будь-який вільний номер',lx:'Люкс сімейний',fm:'Сімейний номер з кухнею',sd:'Стандарт'};
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
function render(){
  var n=innerWidth>=720?2:1, h='', choosingOut=!!(st.a&&!st.b);
  for(var i=0;i<n;i++){
    var m=new Date(st.view.getFullYear(),st.view.getMonth()+i,1);
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
  cal.innerHTML=h;
  $('#calPrev').disabled=st.view<=new Date(today.getFullYear(),today.getMonth(),1);
  summary();
}
function summary(){
  var t;
  if($('#noDates').checked)t='Без дат: господар підкаже найближчі вільні.';
  else if(!st.a)t='Оберіть дату заїзду.';
  else if(!st.b)t='Заїзд '+fmt(st.a)+'. Тепер оберіть дату виїзду.';
  else t=fmt(st.a)+' → '+fmt(st.b)+' · '+nights(Math.round((st.b-st.a)/864e5));
  setText('calSum',t);
  setText('pIn',st.a?fmt(st.a):'Оберіть дату');
  setText('pOut',st.b?fmt(st.b):'Оберіть дату');
  setText('pG',adW(st.ad)+(st.ch?', '+kidsW(st.ch):''));
}
cal.addEventListener('click',function(e){
  var b=e.target.closest('.cal-d');if(!b||b.disabled)return;var dt=parse(b.dataset.k);
  $('#noDates').checked=false;
  if(!st.a||st.b){if(full(dt))return;st.a=dt;st.b=null}
  else if(dt<=st.a){if(full(dt))return;st.a=dt}
  else if(free(st.a,dt)){st.b=dt}
  else if(!full(dt)){st.a=dt}
  render();
});
$('#calPrev').addEventListener('click',function(){st.view=new Date(st.view.getFullYear(),st.view.getMonth()-1,1);render()});
$('#calNext').addEventListener('click',function(){st.view=new Date(st.view.getFullYear(),st.view.getMonth()+1,1);render()});
$('#calReset').addEventListener('click',function(){st.a=st.b=null;render()});
$('#noDates').addEventListener('change',function(){if(this.checked){st.a=st.b=null}render()});
var lastW=innerWidth;addEventListener('resize',function(){if((innerWidth>=720)!==(lastW>=720)){lastW=innerWidth;render()}});
function capCheck(){
  var g=st.ad+st.ch, c=CAP[st.type], h=$('#capHint');
  if(g>c){h.textContent=st.type==='any'?'Вас більше, ніж місць у готелі. Напишіть господарю, він підкаже варіанти.':'У цьому номері до '+c+' гостей. Для '+g+' краще кілька номерів: оберіть «Будь-який номер», господар підбере.';h.classList.add('on')}
  else if(st.type==='any'&&g>4){h.textContent='Для '+g+' гостей господар підбере кілька номерів поруч.';h.classList.add('on')}
  else h.classList.remove('on');
}
function setType(v){
  st.type=v;$$('#segType button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===v)});
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
$$('[data-room]').forEach(function(b){b.addEventListener('click',function(){setType(b.dataset.room);if(b.dataset.group){st.ad=+b.dataset.group;setText('oAd',st.ad);capCheck();summary()}goBook()})});
$$('[data-go]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();goBook()})});
var ac=$('#addChan');if(ac)ac.addEventListener('click',function(){$('#xChan').checked=true;goBook()});
function message(){
  var L=['Вітаю! Заявка з сайту «Карпатська Форель».','Номер: '+NAMES[st.type]];
  if($('#noDates').checked||!st.a||!st.b)L.push('Дати: ще не знаємо точно, підкажіть найближчі вільні');
  else L.push('Дати: з '+fmt(st.a)+' по '+fmt(st.b)+', '+nights(Math.round((st.b-st.a)/864e5)));
  var g='Гості: '+adW(st.ad);if(st.ch){g+=', '+kidsW(st.ch);var age=$('#kAge').value.trim();if(age)g+=' (вік: '+age+')'}L.push(g);
  if($('#xChan').checked)L.push('Хочемо чан на травах.');
  if($('#xTrain').checked)L.push('Зустріньте, будь ласка, на вокзалі.');
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
$('#bookForm').addEventListener('submit',function(e){e.preventDefault();openModal()});
$('#toViber').addEventListener('click',function(){
  var txt=message(), go=function(){location.href=VIBER};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(go,go)}else go();
});
render();summary();
})();
