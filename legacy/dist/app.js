const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem('tarrasque-'+key))??fallback}catch{return fallback}};
const save=(key,value)=>{try{localStorage.setItem('tarrasque-'+key,JSON.stringify(value));return true}catch{notify('Não foi possível salvar neste navegador.');return false}};
const sections={
 personagem:{title:'Personagem',list:'Meus personagens',action:'Novo personagem',icon:'person',description:'Crie e organize seus personagens.',field:'Classe ou origem',placeholder:'Ex.: Elfo · Mago'},
 campanha:{title:'Campanha',list:'Minhas campanhas',action:'Nova campanha',icon:'map',description:'Organize os mundos e as histórias do seu grupo.',field:'Cenário ou sistema',placeholder:'Ex.: Fantasia · D&D 5e'},
 encontros:{title:'Encontros',list:'Meus encontros',action:'Novo encontro',icon:'swords',description:'Prepare os desafios e registre os participantes de cada encontro.',field:'Participantes e preparação',placeholder:'Ex.: 4 aventureiros, 3 inimigos; ruínas ao anoitecer'},
 magias:{title:'Magias',list:'Minhas magias',action:'Nova magia',icon:'spark',description:'Mantenha sua coleção de magias e anotações à mão.',field:'Nível, escola e efeito',placeholder:'Registre os detalhes da sua magia'},
 bestiario:{title:'Bestiário',list:'Minhas criaturas',action:'Nova criatura',icon:'beast',description:'Organize criaturas e personagens do mestre para suas aventuras.',field:'Tipo, desafio e características',placeholder:'Descreva a criatura e suas habilidades'},
 equipamentos:{title:'Equipamentos',list:'Meus equipamentos',action:'Novo equipamento',icon:'bag',description:'Catalogue armas, armaduras, tesouros e itens mágicos.',field:'Tipo, propriedades e valor',placeholder:'Registre as propriedades do item'},
 biblioteca:{title:'Biblioteca',list:'Minhas anotações',action:'Nova anotação',icon:'book',description:'Guarde suas regras da casa, referências e resumos de sessão.',field:'Conteúdo',placeholder:'Escreva sua anotação ou referência'},
 dados:{title:'Dados',icon:'dice',description:''}
};
let page=sections[location.hash.slice(1)]?location.hash.slice(1):'personagem',mode='',editing=-1,collapsed=read('collapsed',false)===true,profile=read('profile','Aventureiro');
if(typeof profile!=='string')profile='Aventureiro';
const records={};for(const key in sections){records[key]=read(key,[]);if(!Array.isArray(records[key]))records[key]=[];records[key]=records[key].filter(x=>x&&typeof x.name==='string')}
let diceRollTimer=null;
function cancelDiceRoll(){clearTimeout(diceRollTimer);diceRollTimer=null}
let rolls=read('rolls',[]);if(!Array.isArray(rolls))rolls=[];
const mobile=matchMedia('(max-width:768px)');let timer;
function notify(message){$('toast').textContent=message;clearTimeout(timer);timer=setTimeout(()=>$('toast').textContent='',3500)}
function user(){ $('user-name').textContent=profile;$('avatar').textContent=profile.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()||'AV'}
function sidebar(){ $('sidebar').classList.toggle('collapsed',!mobile.matches&&collapsed);const expanded=mobile.matches?$('sidebar').classList.contains('mobile-open'):!collapsed;$('toggle').setAttribute('aria-expanded',expanded);$('toggle').setAttribute('aria-label',expanded?'Recolher sidebar':'Expandir sidebar');$('toggle').title=expanded?'Recolher sidebar':'Expandir sidebar';$('backdrop').hidden=!(mobile.matches&&expanded);$('sidebar').inert=mobile.matches&&!expanded}
$('toggle').onclick=()=>{if(mobile.matches)$('sidebar').classList.toggle('mobile-open');else{collapsed=!collapsed;save('collapsed',collapsed)}sidebar()};
function closeNav(){ $('sidebar').classList.remove('mobile-open');sidebar()}
$('backdrop').onclick=()=>{closeNav();$('toggle').focus()};mobile.addEventListener('change',closeNav);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('dialog').open&&mobile.matches){closeNav();$('toggle').focus()}});
function render(){cancelDiceRoll();if(typeof closeSheet==='function')closeSheet();const config=sections[page],isDice=page==='dados';
$('crumb').textContent=config.title;$('page-title').replaceChildren(document.createTextNode(config.title),Object.assign(document.createElement('span'),{textContent:'.'}));$('subtitle').textContent=config.description;$('subtitle').hidden=!config.description;
$('new-top').hidden=isDice;$('search-wrap').hidden=isDice;$('dice-tool').hidden=!isDice;document.querySelector('.section-line').hidden=isDice;
$('cards').replaceChildren();$('empty').hidden=true;
if(isDice){renderDice()}else{
$('new-top').querySelector('span').textContent=config.action;$('list-title').firstChild.textContent=config.list+' ';$('count').textContent=records[page].length;
const term=$('search').value.trim().toLocaleLowerCase('pt-BR');const filtered=records[page].map((item,index)=>({item,index})).filter(({item})=>(item.name+' '+(item.detail||'')).toLocaleLowerCase('pt-BR').includes(term));
$('empty').hidden=filtered.length>0;$('empty-title').textContent=term?'Nenhum resultado encontrado.':'Sua coleção começa aqui.';$('empty-copy').textContent=term?'Tente outro nome ou termo na busca.':'Adicione seu primeiro registro para consultar durante a próxima sessão.';$('new-empty').hidden=!!term;$('new-empty').querySelector('span').textContent=config.action;$('empty-foot').textContent='Coleção pessoal · salva neste navegador';
for(const {item,index} of filtered){const card=document.createElement('article');card.className='card';const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');const use=document.createElementNS(icon.namespaceURI,'use');use.setAttribute('href','#'+config.icon);icon.append(use);const title=document.createElement('h2');title.textContent=item.name;const text=document.createElement('p');text.textContent=item.detail||'Sem anotações.';const edit=document.createElement('button');edit.className='secondary';edit.textContent='Abrir / editar';edit.onclick=()=>open('new',index);card.append(icon,title,text,edit);$('cards').append(card)}}
document.querySelectorAll('[data-page]').forEach(button=>{const active=button.dataset.page===page;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});document.title=sections[page].title+' · Tarrasque';}
function navigate(){page=sections[location.hash.slice(1)]?location.hash.slice(1):'personagem';$('search').value='';render();closeNav()}
window.addEventListener('hashchange',navigate);document.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>{if(location.hash==='#'+button.dataset.page)closeNav();else location.hash=button.dataset.page});$('search').oninput=render;
function open(kind,index=-1){if(kind==='new'&&page==='personagem')return openSheet(index);mode=kind;editing=index;
if(kind==='settings'){ $('dialog-title').textContent='Configurações';$('dialog-body').innerHTML='<label for="theme">Tema da aplicação<select id="theme"><option value="dark">Original · Odysseus</option><option value="light">Light</option><option value="forest">Forest</option><option value="terminal">Terminal</option></select></label><p class="hint">Sua preferência de aparência será salva neste navegador.</p>';try{$('theme').value=localStorage.getItem('tarrasque-theme')||'dark'}catch{}}
else if(kind==='profile'){ $('dialog-title').textContent='Seu perfil';$('dialog-body').innerHTML='<label for="name">Nome de exibição<input id="name" required maxlength="32" autocomplete="nickname"></label>';$('name').value=profile}
else{const config=sections[page];$('dialog-title').textContent=index>=0?'Editar registro':config.action;$('dialog-body').innerHTML='<label for="name">Nome<input id="name" required maxlength="80"></label><label for="detail">'+config.field+'<textarea id="detail" rows="6" maxlength="6000"></textarea></label><p class="hint">Coleção pessoal, salva neste navegador. Não inclui o catálogo oficial do D&D Beyond.</p>';$('detail').placeholder=config.placeholder;if(index>=0){$('name').value=records[page][index].name;$('detail').value=records[page][index].detail||''}}
$('dialog').showModal()}
// Decorative faces never contain the actual result until the dice settle.
function paintDice(dice, values=null){
 const quantity=dice.length;
 const tray=$('dice-tray');tray.replaceChildren();
 const shapes={
  4:'<path d="M40 7 73 67H7Z"/><path class="die-facets" d="m40 7 0 41L7 67m33-19 33 19"/>',
  6:'<rect x="13" y="13" width="54" height="54" rx="9"/><path class="die-facets" d="m18 18 7 7m37-7-7 7m-37 37 7-7m37 7-7-7"/>',
  8:'<path d="m40 5 32 35-32 35L8 40Z"/><path class="die-facets" d="m40 5-19 35 19 35 19-35Z"/>',
  10:'<path d="m40 5 32 26-8 32-24 12L16 63 8 31Z"/><path class="die-facets" d="m8 31 14-9 18-17 18 17 14 9M16 63l6-41m42 41-6-41M16 63l24-9 24 9"/>',
  12:'<path d="m40 5 24 10 11 25-11 25-24 10-24-10L5 40l11-25Z"/><path class="die-facets" d="m40 17 22 16-8 26H26l-8-26Zm0-12v12m24-2-2 18m13 7-13-7m2 32-10-6M40 75l14-16m-14 16-14-16m-10 6 10-6M5 40l13-7m-2-18 2 18"/>',
  20:'<path d="m40 5 31 18v34L40 75 9 57V23Z"/><path class="die-facets" d="m40 5-19 23H9m12 0-12 29 20 2 11 16 11-16 20-2-12-29H21m38 0L40 5M29 59h22"/>'
 };
 const shading={
  4:'<path class="die-light" d="M40 7 7 67 40 48Z"/><path class="die-dark" d="m40 7 33 60-33-19Z"/>',
  6:'<path class="die-light" d="M13 22q0-9 9-9h36q9 0 9 9l-9 5H24Z"/><path class="die-dark" d="m58 27 9-5v36q0 9-9 9l-7-9Z"/>',
  8:'<path class="die-light" d="M40 5 8 40h13Z"/><path class="die-dark" d="m40 5 32 35-32 35 19-35Z"/>',
  10:'<path class="die-light" d="M40 5 8 31l14-9Z"/><path class="die-dark" d="m58 22 14 9-8 32-24 12 0-21 24 9Z"/>',
  12:'<path class="die-light" d="m40 5 24 10-2 18-22-16-22 16-2-18Z"/><path class="die-dark" d="m62 33 13 7-11 25-24 10 14-16Z"/>',
  20:'<path class="die-light" d="M40 5 9 23l12 5 38 0Z"/><path class="die-dark" d="m59 28 12-5v34L40 75l11-16Z"/>'
 };
 for(let i=0;i<quantity;i++){
  const sides=dice[i];
  const die=document.createElement('div');die.className='die';die.style.setProperty('--delay',(i%6)*35+'ms');die.style.setProperty('--tilt',((i%2?1:-1)*(12+i%4*4))+'deg');
  die.innerHTML='<span class="die-shadow"></span><div class="die-flight"><div class="die-body"><svg viewBox="0 0 80 80" aria-hidden="true">'+shapes[sides===100?10:sides]+shading[sides===100?10:sides]+'</svg><span class="die-value">'+(values?values[i]:'·')+'</span></div></div><span class="die-caption">d'+sides+'</span>';
  if(values&&sides===20&&(values[i]===20||values[i]===1)){
   const success=values[i]===20;die.classList.add(success?'critical-hit':'critical-miss');
   die.querySelector('.die-caption').textContent=success?'✦ CRÍTICO':'! ERRO CRÍTICO';
  }
  tray.append(die);
 }

}
function diceGroupRow(first=false){
 const row=document.createElement('div');row.className='dice-group';
 row.innerHTML='<label>Quantidade<input '+(first?'id="quantity" ':'')+'class="dice-quantity" type="number" min="1" max="10" value="1" required></label><label>Dado<select '+(first?'id="sides" ':'')+'class="dice-sides">'+[4,6,8,10,12,20,100].map(n=>'<option value="'+n+'" '+(n===(first?20:6)?'selected':'')+'>d'+n+'</option>').join('')+'</select></label>'+(first?'':'<button type="button" class="secondary remove-dice" aria-label="Remover grupo de dados">Remover</button>');
 return row;
}
function renderDice(){
 $('dice-tool').innerHTML='<div class="dice-panel"><h2>Rolador de dados</h2><form id="roll-form" class="dice-controls mixed-controls"><div id="dice-groups" class="dice-groups"></div><button id="add-dice" class="secondary" type="button">+ Adicionar tipo de dado</button><p class="hint dice-limit">Escolha até 10 dados de cada tipo disponível.</p><div class="dice-actions"><label>Modificador total<input id="modifier" type="number" min="-1000" max="1000" value="0" required></label><button id="roll-button" class="primary" type="submit">Rolar dados</button></div></form><div class="dice-table"><div id="dice-tray" class="dice-tray" aria-hidden="true"></div></div><output id="roll-result" aria-live="polite" aria-atomic="true"></output></div><div class="section-line"><span>Últimas 20 rolagens</span></div><ol id="roll-history" class="roll-history"></ol>';
 $('dice-groups').append(diceGroupRow(true));showRolls();paintDice([20]);
 const groups=()=>Array.from($('dice-groups').children,row=>({quantity:Number(row.querySelector('.dice-quantity').value),sides:Number(row.querySelector('.dice-sides').value)}));
 const validGroups=list=>list.every(g=>Number.isInteger(g.quantity)&&g.quantity>=1&&g.quantity<=10&&[4,6,8,10,12,20,100].includes(g.sides));
 const typeTotals=list=>list.reduce((totals,g)=>{totals[g.sides]=(totals[g.sides]||0)+g.quantity;return totals},{});
 const refresh=()=>{
  if(diceRollTimer!==null)return;
  const list=groups(),count=list.reduce((n,g)=>n+g.quantity,0);
  const totals=typeTotals(list),withinLimit=Object.values(totals).every(n=>n<=10);
  Array.from($('dice-groups').children).forEach((row,i)=>{
   row.querySelector('.dice-quantity').setCustomValidity(totals[list[i].sides]>10?'Use no máximo 10 dados d'+list[i].sides+', somando todos os grupos.':'');
  });
  $('add-dice').disabled=count>=70||list.length>=70;
  if(validGroups(list)&&withinLimit){paintDice(list.flatMap(g=>Array(g.quantity).fill(g.sides)));$('roll-result').textContent=''}
 };
 $('dice-groups').oninput=refresh;$('dice-groups').onchange=refresh;
 $('add-dice').onclick=()=>{const totals=typeTotals(groups());const available=[6,4,8,10,12,20,100].find(sides=>(totals[sides]||0)<10);if(!available)return;const row=diceGroupRow();row.querySelector('select').value=String(available);$('dice-groups').append(row);refresh();row.querySelector('select').focus()};
 $('dice-groups').onclick=e=>{const button=e.target.closest('.remove-dice');if(!button||diceRollTimer!==null)return;const row=button.closest('.dice-group');const previous=row.previousElementSibling;row.remove();refresh();(previous?.querySelector('select')||$('add-dice')).focus()};
 $('roll-form').onsubmit=e=>{
  e.preventDefault();if(diceRollTimer!==null)return;
  const list=groups(),modifier=Number($('modifier').value),quantity=list.reduce((n,g)=>n+g.quantity,0);
  if(!validGroups(list)||Object.values(typeTotals(list)).some(n=>n>10)||!Number.isInteger(modifier)||Math.abs(modifier)>1000)return;
  const dice=list.flatMap(g=>Array(g.quantity).fill(g.sides));
  const values=dice.map(sides=>randomDie(sides)),total=values.reduce((a,b)=>a+b,0)+modifier;
  const expression=list.map(g=>g.quantity+'d'+g.sides).join(' + '),notation=expression+(modifier>=0?'+':'')+modifier;
  const form=$('roll-form'),tray=$('dice-tray'),output=$('roll-result');
  paintDice(dice);tray.classList.remove('settled');
  const trayLeft=tray.getBoundingClientRect().left;
  for(const die of tray.querySelectorAll('.die'))die.style.setProperty('--travel-from',(trayLeft-die.getBoundingClientRect().left)+'px');
  tray.classList.add('rolling');output.textContent='Rolando '+expression+'…';$('roll-button').textContent='Rolando…';
  for(const control of form.elements)control.disabled=true;
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?450:2050;
  diceRollTimer=setTimeout(()=>{
   diceRollTimer=null;tray.classList.remove('rolling');paintDice(dice,values);tray.classList.add('settled');
   const roll={notation,total,values,dice,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};
   rolls=[roll,...rolls].slice(0,20);save('rolls',rolls);output.textContent=notation+' = '+total+' · Dados: '+rollDetails(roll);appendCriticalBadges(output,roll);showRolls();
   for(const control of form.elements)control.disabled=false;$('add-dice').disabled=quantity>=70||list.length>=70;$('roll-button').textContent='Rolar novamente';
  },duration);
 }
}
function rollDetails(roll){return Array.isArray(roll.values)?roll.values.map((value,i)=>Array.isArray(roll.dice)?'d'+roll.dice[i]+': '+value:value).join(', '):''}
function randomDie(sides){const buffer=new Uint32Array(1),limit=Math.floor(4294967296/sides)*sides;do{crypto.getRandomValues(buffer)}while(buffer[0]>=limit);return buffer[0]%sides+1}
// Detect natural d20 faces, never totals or modifiers. Parse legacy history too.
function appendCriticalBadges(container,roll){
 if(!Array.isArray(roll.values))return;
 const naturalValues=Array.isArray(roll.dice)?roll.values.filter((value,i)=>roll.dice[i]===20):(/^\d+d20(?:[+-]\d+)?$/.test(roll.notation)?roll.values:[]);
 const hits=naturalValues.filter(value=>value===20).length,misses=naturalValues.filter(value=>value===1).length;
 if(!hits&&!misses)return;
 const badges=document.createElement('span');badges.className='critical-badges';
 for(const [count,kind,label,symbol] of [[hits,'hit','Acerto crítico','✦'],[misses,'miss','Erro crítico','!']]){
  if(!count)continue;const badge=document.createElement('span');badge.className='critical-badge critical-'+kind;
  badge.textContent=symbol+' '+label+(count>1?' ×'+count:'')+' · '+(kind==='hit'?'20':'1')+' natural';badges.append(badge);
 }
 container.append(badges);
}
function showRolls(){$('roll-history').replaceChildren();for(const roll of rolls){const li=document.createElement('li');li.textContent=roll.time+' · '+roll.notation+' = '+roll.total+' ['+rollDetails(roll)+']';appendCriticalBadges(li,roll);$('roll-history').append(li)}if(!rolls.length){const li=document.createElement('li');li.textContent='Nenhuma rolagem nesta sessão de aventuras.';$('roll-history').append(li)}}
$('settings').onclick=()=>open('settings');$('profile').onclick=()=>open('profile');$('new-top').onclick=$('new-empty').onclick=()=>open('new');$('close').onclick=$('cancel').onclick=()=>$('dialog').close();
$('form').onsubmit=e=>{e.preventDefault();if(mode==='settings'){const theme=$('theme').value;try{localStorage.setItem('tarrasque-theme',theme)}catch{notify('Não foi possível salvar o tema.');return}applyTheme(theme)}else{const name=$('name').value.trim();if(!name){$('name').setCustomValidity('Digite um nome.');$('name').reportValidity();$('name').oninput=()=>$('name').setCustomValidity('');return}if(mode==='profile'){if(!save('profile',name))return;profile=name;user()}else{const next=[...records[page]];const entry={name,detail:$('detail').value.trim()};if(editing>=0)next[editing]=entry;else next.push(entry);if(!save(page,next))return;records[page]=next;render()}}$('dialog').close();notify('Salvo com sucesso.')};
user();sidebar();render();
