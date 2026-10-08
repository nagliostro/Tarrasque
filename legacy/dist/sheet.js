// Ficha de personagem D&D 5e: três páginas (Ficha, Detalhes, Magias), cálculos automáticos e salvamento automático.
const SHEET_ABILITIES=[['for','Força'],['des','Destreza'],['con','Constituição'],['int','Inteligência'],['sab','Sabedoria'],['car','Carisma']];
const SHEET_SKILLS=[['Acrobacia','des'],['Adestrar Animais','sab'],['Arcanismo','int'],['Atletismo','for'],['Atuação','car'],['Enganação','car'],['Furtividade','des'],['História','int'],['Intimidação','car'],['Intuição','sab'],['Investigação','int'],['Medicina','sab'],['Natureza','int'],['Percepção','sab'],['Persuasão','car'],['Prestidigitação','des'],['Religião','int'],['Sobrevivência','sab']];
const SHEET_PERCEPTION=13;
const SHEET_SPELL_LINES={1:13,2:13,3:13,4:13,5:9,6:9,7:9,8:7,9:7};
const SHEET_PROF_LABELS=['sem proficiência','proficiente','especialista'];
const SHEET_PROF_SYMBOLS=['○','●','◆'];
const SHEET_COINS=[['pc','PC','Cobre'],['pp','PP','Prata'],['pe','PE','Electro'],['po','PO','Ouro'],['pl','PL','Platina']];
let sh=null,shIndex=-1,shTab='ficha',shTimer=null,shDirty=false;
function shDefault(){const ab={};SHEET_ABILITIES.forEach(([k])=>ab[k]=10);return{ab,lvl:1,atN:3}}
function shGet(path){return path.split('.').reduce((o,k)=>o==null?o:o[k],sh)}
function shSet(path,value){const keys=path.split('.');let o=sh;for(const k of keys.slice(0,-1)){if(typeof o[k]!=='object'||o[k]===null)o[k]={};o=o[k]}o[keys[keys.length-1]]=value}
const shMod=score=>Math.floor(((Number.isFinite(score)?score:10)-10)/2);
const shFmt=n=>(n>=0?'+':'−')+Math.abs(n);
const shNum=v=>Number.isFinite(Number(v))&&v!==''&&v!=null?Number(v):0;
function shField(label,key,{type='text',extra='',cls=''}={}){return '<label class="sf '+cls+'"><span>'+label+'</span><input data-k="'+key+'" type="'+type+'" '+extra+'></label>'}
function shArea(label,key,rows,cls=''){return '<label class="sf '+cls+'"><span>'+label+'</span><textarea data-k="'+key+'" rows="'+rows+'" maxlength="6000"></textarea></label>'}
function shProfButton(path,label){return '<button type="button" class="prof" data-cyc="'+path+'" aria-label="Proficiência em '+label+'"></button>'}
function shPageMain(){
 const abilities=SHEET_ABILITIES.map(([k,n])=>'<div class="ability"><span class="ab-name">'+n+'</span><output class="ab-mod" data-o="mod.'+k+'" aria-label="Modificador de '+n+'"></output><input data-k="ab.'+k+'" type="number" min="1" max="30" aria-label="Valor de '+n+'"></div>').join('');
 const saves=SHEET_ABILITIES.map(([k,n])=>'<li>'+shProfButton('sv.'+k,'salvaguarda de '+n)+'<output data-o="sv.'+k+'"></output><span>'+n+'</span></li>').join('');
 const skills=SHEET_SKILLS.map(([n,a],i)=>'<li>'+shProfButton('sk.'+i,n)+'<output data-o="sk.'+i+'"></output><span>'+n+' <small>('+a.toUpperCase()+')</small></span></li>').join('');
 const coins=SHEET_COINS.map(([k,s,n])=>'<label class="coin"><span title="'+n+'">'+s+'</span><input data-k="co.'+k+'" type="number" min="0" aria-label="Peças de '+n.toLowerCase()+'"></label>').join('');
 return '<div class="sh-head">'+shField('Nome do personagem','nm',{extra:'maxlength="80"',cls:'wide'})+shField('Classe','cl',{extra:'maxlength="40"'})+shField('Nível','lvl',{type:'number',extra:'min="1" max="20"'})+shField('Antecedente','bg',{extra:'maxlength="40"'})+shField('Nome do jogador','pl',{extra:'maxlength="40"'})+shField('Raça','rc',{extra:'maxlength="40"'})+shField('Tendência','al',{extra:'maxlength="40"'})+shField('Pontos de experiência','xp',{type:'number',extra:'min="0"'})+'</div>'
 +'<div class="sh-cols">'
 +'<div class="sh-col"><section class="box"><h3>Atributos</h3><div class="abilities">'+abilities+'</div></section>'
 +'<section class="box"><div class="stat-row"><label class="sf inline"><span>Inspiração</span><input data-k="insp" type="checkbox"></label><div class="stat-pair"><span>Bônus de proficiência</span><output data-o="prof"></output></div></div></section>'
 +'<section class="box"><h3>Salvaguardas</h3><ul class="rows">'+saves+'</ul></section>'
 +'<section class="box"><h3>Perícias</h3><ul class="rows">'+skills+'</ul></section>'
 +'<section class="box"><div class="stat-pair"><span>Sabedoria passiva (Percepção)</span><output data-o="pass"></output></div></section>'
 +'<section class="box">'+shArea('Outras proficiências e idiomas','prof',7)+'</section></div>'
 +'<div class="sh-col"><section class="box"><div class="vitals">'+shField('Classe de armadura','ca',{type:'number'})+'<div class="sf"><span>Iniciativa</span><output class="big" data-o="init"></output></div>'+shField('Deslocamento','spd',{extra:'maxlength="20"'})+'</div></section>'
 +'<section class="box"><div class="hp">'+shField('Pontos de vida máximos','hpm',{type:'number',extra:'min="0"'})+shField('Pontos de vida atuais','hpc',{type:'number'})+shField('Pontos de vida temporários','hpt',{type:'number',extra:'min="0"'})+'</div></section>'
 +'<section class="box"><div class="vitals two">'+shField('Dados de vida','hd',{extra:'maxlength="30" placeholder="Ex.: 5d8"'})+'<fieldset class="death"><legend>Salvaguardas contra a morte</legend><div><span>Sucessos</span>'+[0,1,2].map(i=>'<input data-k="ds.s'+i+'" type="checkbox" aria-label="Sucesso '+(i+1)+'">').join('')+'</div><div><span>Falhas</span>'+[0,1,2].map(i=>'<input data-k="ds.f'+i+'" type="checkbox" aria-label="Falha '+(i+1)+'">').join('')+'</div></fieldset></div></section>'
 +'<section class="box"><h3>Ataques e conjuração</h3><div id="attacks" class="attacks"></div><button type="button" class="secondary" id="add-attack">+ Adicionar ataque</button></section>'
 +'<section class="box"><h3>Equipamento</h3><div class="coins">'+coins+'</div>'+shArea('Itens e equipamento','eq',9)+'</section></div>'
 +'<div class="sh-col"><section class="box">'+shArea('Traços de personalidade','pt',3)+'</section><section class="box">'+shArea('Ideais','id',3)+'</section><section class="box">'+shArea('Vínculos','vn',3)+'</section><section class="box">'+shArea('Defeitos','df',3)+'</section><section class="box">'+shArea('Características e traços','ft',18)+'</section></div></div>';
}
function shPageDetails(){
 return '<div class="sh-head">'+shField('Nome do personagem','nm',{extra:'maxlength="80"',cls:'wide'})+shField('Idade','ag',{extra:'maxlength="20"'})+shField('Altura','ht',{extra:'maxlength="20"'})+shField('Peso','wt',{extra:'maxlength="20"'})+shField('Olhos','ey',{extra:'maxlength="20"'})+shField('Pele','sk',{extra:'maxlength="20"'})+shField('Cabelo','hr',{extra:'maxlength="20"'})+'</div>'
 +'<div class="sh-cols two"><div class="sh-col"><section class="box">'+shArea('Aparência do personagem','app',10)+'</section><section class="box">'+shArea('História do personagem','bio',20)+'</section></div>'
 +'<div class="sh-col"><section class="box">'+shField('Símbolo ou emblema (nome)','sym',{extra:'maxlength="60"'})+shArea('Aliados e organizações','aly',9)+'</section><section class="box">'+shArea('Características e traços adicionais','aft',12)+'</section><section class="box">'+shArea('Tesouro','tre',9)+'</section></div></div>';
}
function shPageSpells(){
 const levels=[];
 const lines=(lvl,count)=>Array.from({length:count},(_,i)=>'<li>'+(lvl?'<input data-k="sp.'+lvl+'.'+i+'.p" type="checkbox" aria-label="Preparada">':'')+'<input data-k="sp.'+lvl+'.'+i+'.n" type="text" maxlength="60" aria-label="Magia '+(i+1)+' de '+(lvl?'nível '+lvl:'truque')+'"></li>').join('');
 levels.push('<section class="box spell-level"><h3>Truques</h3><ul class="spell-lines">'+lines(0,8)+'</ul></section>');
 for(const lvl in SHEET_SPELL_LINES)levels.push('<section class="box spell-level"><h3>Nível '+lvl+'</h3><div class="slots"><label class="sf"><span>Espaços totais</span><input data-k="sl.'+lvl+'.t" type="number" min="0" max="9"></label><label class="sf"><span>Espaços gastos</span><input data-k="sl.'+lvl+'.e" type="number" min="0" max="9"></label></div><ul class="spell-lines">'+lines(lvl,SHEET_SPELL_LINES[lvl])+'</ul></section>');
 return '<div class="sh-head">'+shField('Classe conjuradora','sc',{extra:'maxlength="40"',cls:'wide'})+'<label class="sf"><span>Atributo de conjuração</span><select data-k="sa"><option value="">—</option><option value="int">Inteligência</option><option value="sab">Sabedoria</option><option value="car">Carisma</option></select></label><div class="sf"><span>CD de resistência</span><output class="big" data-o="dc"></output></div><div class="sf"><span>Bônus de ataque</span><output class="big" data-o="atkb"></output></div></div><p class="hint">Marque a caixa à esquerda de cada magia para indicá-la como preparada.</p><div class="spell-grid">'+levels.join('')+'</div>';
}
function shAttackRows(){
 const n=Math.max(3,shNum(sh.atN));
 $('attacks').innerHTML='<div class="atk head"><span>Nome</span><span>Bônus</span><span>Dano/tipo</span></div>'+Array.from({length:n},(_,i)=>'<div class="atk"><input data-k="at.'+i+'.n" maxlength="40" aria-label="Nome do ataque '+(i+1)+'"><input data-k="at.'+i+'.b" maxlength="8" aria-label="Bônus de ataque '+(i+1)+'"><input data-k="at.'+i+'.d" maxlength="40" aria-label="Dano e tipo '+(i+1)+'"></div>').join('');
 shFill($('attacks'));
}
function shFill(root){
 root.querySelectorAll('[data-k]').forEach(el=>{const v=shGet(el.dataset.k);if(el.type==='checkbox')el.checked=v===true;else el.value=v==null?'':v});
}
function shCalc(){
 const lvl=Math.min(20,Math.max(1,shNum(sh.lvl)||1)),pb=Math.ceil(lvl/4)+1;
 const mods={};SHEET_ABILITIES.forEach(([k])=>mods[k]=shMod(shNum(sh.ab&&sh.ab[k])));
 const out=(k,v)=>document.querySelectorAll('[data-o="'+k+'"]').forEach(o=>o.textContent=v);
 out('prof',shFmt(pb));
 for(const [k] of SHEET_ABILITIES){out('mod.'+k,shFmt(mods[k]));out('sv.'+k,shFmt(mods[k]+(shGet('sv.'+k)?pb:0)))}
 const skill=i=>mods[SHEET_SKILLS[i][1]]+pb*shNum(shGet('sk.'+i));
 SHEET_SKILLS.forEach((_,i)=>out('sk.'+i,shFmt(skill(i))));
 out('pass',10+skill(SHEET_PERCEPTION));out('init',shFmt(mods.des));
 const sa=sh.sa&&mods[sh.sa]!==undefined?mods[sh.sa]:null;
 out('dc',sa===null?'—':8+pb+sa);out('atkb',sa===null?'—':shFmt(pb+sa));
 document.querySelectorAll('[data-cyc]').forEach(b=>{const v=shNum(shGet(b.dataset.cyc));b.textContent=SHEET_PROF_SYMBOLS[v];b.title=SHEET_PROF_LABELS[v];b.setAttribute('aria-pressed',v>0);b.dataset.state=SHEET_PROF_LABELS[v]});
}
function shSummary(){
 const lvl=shNum(sh.lvl)||1;
 return [[sh.rc,sh.cl&&sh.cl+' '+lvl].filter(Boolean).join(' · '),sh.bg,sh.hpm!==undefined&&sh.hpm!==''?'PV '+(sh.hpc===undefined||sh.hpc===''?sh.hpm:sh.hpc)+'/'+sh.hpm:'',sh.ca!==undefined&&sh.ca!==''?'CA '+sh.ca:''].filter(Boolean).join('\n')||'Ficha em branco.';
}
function shPersist(){
 clearTimeout(shTimer);shTimer=null;if(!shDirty||!sh)return;
 const entry={name:(sh.nm||'').trim()||'Personagem sem nome',detail:shSummary(),sheet:sh};
 const next=[...records.personagem];
 if(shIndex>=0)next[shIndex]=entry;else{next.push(entry);}
 if(!save('personagem',next)){$('sheet-status').textContent='Não foi possível salvar';return}
 records.personagem=next;if(shIndex<0)shIndex=next.length-1;
 shDirty=false;$('sheet-status').textContent='Salvo automaticamente';
}
function shQueue(){shDirty=true;$('sheet-status').textContent='Salvando…';clearTimeout(shTimer);shTimer=setTimeout(shPersist,500)}
function shTabs(){
 const pages={ficha:shPageMain,detalhes:shPageDetails,magias:shPageSpells};
 $('sheet-body').innerHTML=pages[shTab]();
 document.querySelectorAll('[data-tab]').forEach(t=>{const on=t.dataset.tab===shTab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});
 $('sheet-body').setAttribute('aria-labelledby','tab-'+shTab);
 shFill($('sheet-body'));if(shTab==='ficha')shAttackRows();shCalc();
}
function openSheet(index=-1){
 shIndex=index;shDirty=false;shTab='ficha';
 const saved=index>=0?records.personagem[index].sheet:null;
 sh=saved&&typeof saved==='object'?{...shDefault(),...saved}:shDefault();
 if(index>=0&&!saved){sh.nm=records.personagem[index].name}
 for(const id of ['page-top','cards','empty','search-wrap'])$(id).hidden=true;
 document.querySelector('.section-line').hidden=true;$('sheet').hidden=false;
 $('sheet-status').textContent=index>=0?'Salvo automaticamente':'Novo personagem';$('sheet-delete').hidden=index<0;
 shTabs();$('main').scrollTop=0;$('sheet-body').querySelector('input')?.focus({preventScroll:true});
}
function closeSheet(){
 if(!sh)return;
 shPersist();sh=null;shIndex=-1;
 $('sheet').hidden=true;$('page-top').hidden=false;$('cards').hidden=false;
}
$('sheet-body').addEventListener('input',e=>{
 const el=e.target.closest('[data-k]');if(!el||!sh)return;
 let v=el.type==='checkbox'?el.checked:el.type==='number'?(el.value===''?'':Number(el.value)):el.value;
 shSet(el.dataset.k,v);shCalc();shQueue();
});
$('sheet-body').addEventListener('click',e=>{
 const cyc=e.target.closest('[data-cyc]');
 if(cyc&&sh){const max=cyc.dataset.cyc.startsWith('sk.')?2:1;shSet(cyc.dataset.cyc,(shNum(shGet(cyc.dataset.cyc))+1)%(max+1));shCalc();shQueue();return}
 if(e.target.closest('#add-attack')&&sh){sh.atN=Math.max(3,shNum(sh.atN))+1;shAttackRows();shQueue();$('attacks').querySelector('.atk:last-child input')?.focus()}
});
document.querySelectorAll('[data-tab]').forEach(t=>t.onclick=()=>{if(!sh)return;shTab=t.dataset.tab;shTabs()});
$('sheet-tabs').addEventListener('keydown',e=>{
 const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(document.activeElement);
 if(i<0||!['ArrowRight','ArrowLeft'].includes(e.key))return;
 const next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];next.focus();next.click();
});
$('sheet-back').onclick=()=>{closeSheet();render()};
$('sheet-delete').onclick=()=>{
 if(shIndex<0||!confirm('Excluir este personagem? Esta ação não pode ser desfeita.'))return;
 const next=records.personagem.filter((_,i)=>i!==shIndex);
 if(!save('personagem',next))return;records.personagem=next;shDirty=false;closeSheet();render();notify('Personagem excluído.');
};
window.addEventListener('pagehide',shPersist);
