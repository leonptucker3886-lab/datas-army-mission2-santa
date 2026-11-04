// ---- Pure logic (testable in Node) ----
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function normDept(d){return String(d??'').trim().replace(/\s+/g,' ').toLowerCase()}
function makeBlocker(rules){const b=new Set(),k=(a,c)=>a.trim().toLowerCase()+'>'+c.trim().toLowerCase();
  ((rules.ex||'')+'\n'+(rules.last||'')).split('\n').forEach(l=>{let m=l.split('=');if(m.length==2){b.add(k(m[0],m[1]));b.add(k(m[1],m[0]));return}m=l.split('>');if(m.length==2)b.add(k(m[0],m[1]))});
  return (g,r)=>g.name===r.name||b.has(k(g.name,r.name))||(!!rules.dept&&normDept(g.dept)!==''&&normDept(g.dept)===normDept(r.dept))}
function assignPairs(people,rules){if(people.length<2)return null;const bad=makeBlocker(rules);
  for(let t=0;t<50;t++){const givers=shuffle([...people]),used=new Set(),out=[];let steps=0;
    const bt=i=>{if(++steps>200000)return false;if(i===givers.length)return true;
      for(const r of shuffle([...people])){if(used.has(r.name)||bad(givers[i],r))continue;used.add(r.name);out.push([givers[i].name,r.name]);if(bt(i+1))return true;used.delete(r.name);out.pop()}return false};
    if(bt(0))return out}
  return null}
const GIFTS={coffee:['Specialty coffee sampler','Insulated travel mug'],books:['Bookstore gift card','Personalized bookmark set'],tea:['Loose-leaf tea collection','Glass teapot'],
  gaming:['Gaming store gift card','Controller desk stand'],gardening:['Indoor herb garden kit','Garden tool set'],running:['Running socks & armband','Race entry voucher'],
  cooking:['Cooking class voucher','Spice blend set'],music:['Music streaming subscription','Wireless earbuds'],travel:['Packing cubes set','Travel experience voucher']};
const GENERIC={birthday:['Cake or treat delivery','Team-signed card + gift card'],1:['Branded hoodie + handwritten note','Team lunch'],3:['Experience voucher','Premium desk accessory'],5:['Engraved keepsake','Extra day off + dinner voucher'],10:['Weekend getaway voucher','Custom award + donation in their name']};
function giftIdeas(p,kind,years,budget){const out=[];(p.likes||'').toLowerCase().split(',').map(s=>s.trim()).forEach(l=>{if(GIFTS[l])out.push(...GIFTS[l])});
  const tier=kind==='birthday'?'birthday':(years>=10?10:years>=5?5:years>=3?3:1);out.push(...GENERIC[tier]);
  const amt=(tier==='birthday'||tier===1)?Math.min(budget,50):budget;return out.slice(0,3).map(g=>g+' (~$'+amt+')')}
function upcoming(people,days,budget,today){today=today||new Date();today=new Date(today.getFullYear(),today.getMonth(),today.getDate());const res=[];
  const next=iso=>{const d=new Date(iso+'T00:00:00');if(isNaN(d))return null;let n=new Date(today.getFullYear(),d.getMonth(),d.getDate());if(n<today)n=new Date(today.getFullYear()+1,d.getMonth(),d.getDate());return{orig:d,n}};
  people.forEach(p=>{if(p.start){const x=next(p.start);if(x){const yrs=x.n.getFullYear()-x.orig.getFullYear(),dd=Math.round((x.n-today)/864e5);if(yrs>0&&dd<=days)res.push({p,label:yrs+'-year work anniversary',date:x.n,days:dd,gifts:giftIdeas(p,'anniversary',yrs,budget)})}}
    if(p.bday){const x=next(p.bday);if(x){const dd=Math.round((x.n-today)/864e5);if(dd<=days)res.push({p,label:'Birthday',date:x.n,days:dd,gifts:giftIdeas(p,'birthday',0,budget)})}}});
  return res.sort((a,b)=>a.days-b.days)}
if(typeof module!=='undefined')module.exports={assignPairs,upcoming,giftIdeas,normDept};
// ---- UI ----
if(typeof document!=='undefined'){
const S=JSON.parse(localStorage.getItem('ssm')||'null')||{people:[],rules:{budget:30,date:'',dept:false,ex:'',last:''},brand:{name:'',color:'#2A78D6'},pairs:[]};
const save=()=>localStorage.setItem('ssm',JSON.stringify(S)),$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.tab=t=>{document.querySelectorAll('.tab').forEach(d=>d.classList.add('hidden'));$(t).classList.remove('hidden');if(t==='miles')renderMiles()};
window.addPerson=()=>{const n=$('pName').value.trim();if(!n)return alert('Name required');if(S.people.some(p=>p.name.toLowerCase()===n.toLowerCase()))return alert('Name already exists');
  S.people.push({name:n,dept:$('pDept').value.trim(),email:$('pEmail').value.trim(),start:$('pStart').value,bday:$('pBday').value,likes:$('pLikes').value.trim()});save();renderPeople();['pName','pDept','pEmail','pStart','pBday','pLikes'].forEach(i=>$(i).value='')};
window.delPerson=i=>{S.people.splice(i,1);save();renderPeople()};
function renderPeople(){$('pTable').innerHTML='<tr><th>Name</th><th>Dept</th><th>Email</th><th>Start</th><th>Birthday</th><th>Interests</th><th></th></tr>'+S.people.map((p,i)=>`<tr><td>${esc(p.name)}</td><td>${esc(p.dept)}</td><td>${esc(p.email)}</td><td>${esc(p.start)}</td><td>${esc(p.bday)}</td><td>${esc(p.likes)}</td><td><button class="sec" onclick="delPerson(${i})">x</button></td></tr>`).join('')}
window.importCsv=inp=>{const f=inp.files[0];if(!f)return;f.text().then(t=>{t.split(/\r?\n/).slice(1).forEach(l=>{const c=l.split(','),n=(c[0]||'').trim();if(n&&!S.people.some(p=>p.name===n))S.people.push({name:n,dept:(c[1]||'').trim(),email:(c[2]||'').trim(),start:(c[3]||'').trim(),bday:(c[4]||'').trim(),likes:c.slice(5).join(',').trim()})});save();renderPeople()})};
window.loadDemo=()=>{const now=new Date(),y=now.getFullYear(),m=now.getMonth()+1,m2=m%12+1,d=(o,mm,dd)=>`${y-o}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  S.people=[{name:'Ava',dept:'Sales',email:'ava@example.com',start:d(5,m2,2),bday:d(30,m2,3),likes:'coffee,books'},{name:'Ben',dept:'Sales',email:'ben@example.com',start:d(1,m2,10),bday:d(28,m,28),likes:'gaming'},{name:'Cara',dept:'Ops',email:'cara@example.com',start:d(10,m,28),bday:d(40,1,1),likes:'gardening,tea'},{name:'Dev',dept:'Ops',email:'dev@example.com',start:d(3,6,1),bday:d(35,m2,15),likes:'running'},{name:'Eli',dept:'Support',email:'eli@example.com',start:d(2,m2,5),bday:d(26,8,8),likes:'cooking'},{name:'Fay',dept:'Support',email:'fay@example.com',start:d(0,1,15),bday:d(33,m2,20),likes:'music,travel'}];
  S.rules={budget:30,date:'',dept:true,ex:'Ava = Ben',last:'Cara > Dev'};S.pairs=[];save();renderPeople();loadRules()};
function loadRules(){$('rBudget').value=S.rules.budget;$('rDate').value=S.rules.date;$('rDept').checked=S.rules.dept;$('rEx').value=S.rules.ex;$('rLast').value=S.rules.last;renderPairs()}
window.saveRules=()=>{S.rules={budget:+$('rBudget').value||0,date:$('rDate').value,dept:!!$('rDept').checked,ex:$('rEx').value,last:$('rLast').value};save()};
window.assign=()=>{if(S.people.length<2){$('sMsg').innerHTML='<span class="err">Add at least 2 people.</span>';return}
  const r=assignPairs(S.people,S.rules);S.pairs=r||[];save();renderPairs();
  $('sMsg').innerHTML=r?`<span class="ok">Assigned all ${r.length} people. Budget $${S.rules.budget}${S.rules.date?', exchange on '+S.rules.date:''}.</span>`:'<span class="err">No valid assignment with these rules. Loosen a rule and try again.</span>'};
function renderPairs(){$('sTable').innerHTML=S.pairs.length?'<tr><th>Giver</th><th>Gives to</th><th>Receiver interests</th></tr>'+S.pairs.map(([g,r])=>{const dp=n=>(S.people.find(p=>p.name===n)||{}).dept;return [g,r,dp]}).map(([g,r,dp])=>`<tr><td>${esc(g)}${dp(g)?' ('+esc(dp(g))+')':''}</td><td>${esc(r)}${dp(r)?' ('+esc(dp(r))+')':''}</td><td>${esc((S.people.find(p=>p.name===r)||{}).likes)}</td></tr>`).join(''):''}
window.exportPairs=()=>{if(!S.pairs.length)return alert('Assign first');const rows=[['giver','giver_email','receiver','budget','date']].concat(S.pairs.map(([g,r])=>[g,(S.people.find(p=>p.name===g)||{}).email||'',r,S.rules.budget,S.rules.date]));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'}));a.download='secret-santa.csv';a.click()};
window.renderMiles=()=>{const L=upcoming(S.people,+$('mDays').value,+$('mBudget').value||50);
  $('mTable').innerHTML=L.length?'<tr><th>Date</th><th>In</th><th>Who</th><th>Milestone</th><th>Gift ideas</th></tr>'+L.map(x=>`<tr><td>${x.date.toDateString()}</td><td>${x.days} days</td><td>${esc(x.p.name)}</td><td>${esc(x.label)}</td><td>${x.gifts.map(esc).join('<br>')}</td></tr>`).join(''):'<tr><td>No milestones in this window.</td></tr>'};
function applyBrand(){document.documentElement.style.setProperty('--brand',S.brand.color||'#2A78D6');$('title').textContent=(S.brand.name?S.brand.name+' · ':'')+'Secret Santa & Milestones';$('bName').value=S.brand.name;$('bColor').value=S.brand.color||'#2A78D6'}
window.saveBrand=()=>{S.brand={name:$('bName').value.trim(),color:$('bColor').value};save();applyBrand()};
$('bColor').addEventListener('input',()=>{S.brand.color=$('bColor').value;save();applyBrand()});
$('rDept').addEventListener('change',()=>saveRules());
renderPeople();loadRules();applyBrand();
}
