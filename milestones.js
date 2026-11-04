// Milestone & work-anniversary tracker. Reads people/brand from the Santa app's
// localStorage 'ssm' (read-only); keeps its own gift status in 'ssm-miles'.
const M_GIFTS={coffee:['Specialty coffee sampler','Travel mug'],books:['Bookstore gift card','Bookmark set'],tea:['Loose-leaf tea set','Glass teapot'],gaming:['Gaming gift card','Controller stand'],gardening:['Herb garden kit','Garden tool set'],running:['Running armband','Race entry voucher'],cooking:['Cooking class voucher','Spice set'],music:['Streaming subscription','Wireless earbuds'],travel:['Packing cubes','Travel voucher']};
const M_TIER={birthday:['Treat delivery','Team card + gift card'],1:['Branded hoodie + note','Team lunch'],3:['Experience voucher','Desk accessory'],5:['Engraved keepsake','Extra day off'],10:['Weekend getaway voucher','Custom award']};
function mTier(k,y){return k==='birthday'?'birthday':y>=10?10:y>=5?5:y>=3?3:1}
function mBudget(t,b){return t==='birthday'||t===1?Math.min(b,50):t===3?b:t===5?Math.round(b*1.5):b*2}
function mGifts(p,k,y,b){const o=[];String(p.likes||'').toLowerCase().split(',').forEach(l=>{l=l.trim();if(M_GIFTS[l])o.push(...M_GIFTS[l])});const t=mTier(k,y);o.push(...M_TIER[t]);return [...new Set(o)].slice(0,4).map(g=>g+' (~$'+mBudget(t,b)+')')}
function mNext(iso,today){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso||'').trim());if(!m)return null;const y=+m[1],mo=+m[2]-1,da=+m[3];
  const at=yr=>{const d=new Date(yr,mo,da);return d.getMonth()!==mo?new Date(yr,mo+1,0):d};// Feb 29 -> Feb 28
  let n=at(today.getFullYear());if(n<today)n=at(today.getFullYear()+1);return{y,n}}
function mUpcoming(people,days,b,today,dept){today=today||new Date();today=new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const r=[],dn=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
  (people||[]).forEach(p=>{if(dept&&dn(p.dept)!==dn(dept))return;
    const s=mNext(p.start,today);if(s){const y=s.n.getFullYear()-s.y,d=Math.round((s.n-today)/864e5);if(y>0&&d<=days)r.push({id:p.name+'|a|'+s.n.getFullYear(),p,label:y+'-year work anniversary',date:s.n,days:d,gifts:mGifts(p,'a',y,b)})}
    const x=mNext(p.bday,today);if(x){const d=Math.round((x.n-today)/864e5);if(d<=days)r.push({id:p.name+'|b|'+x.n.getFullYear(),p,label:'Birthday',date:x.n,days:d,gifts:mGifts(p,'birthday',0,b)})}});
  return r.sort((a,c)=>a.days-c.days||a.p.name.localeCompare(c.p.name))}
function mYmd(d){return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')}
function mIcs(list){const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DatasArmy//Milestones//EN'];list.forEach(x=>{const e=new Date(x.date);e.setDate(e.getDate()+1);
  L.push('BEGIN:VEVENT','UID:'+x.id.replace(/\W/g,'_')+'@milestones','DTSTART;VALUE=DATE:'+mYmd(x.date),'DTEND;VALUE=DATE:'+mYmd(e),'SUMMARY:'+(x.p.name+' - '+x.label).replace(/[,;]/g,' '),'DESCRIPTION:Gift ideas: '+x.gifts.join(' / ').replace(/[,;]/g,' '),'END:VEVENT')});
  L.push('END:VCALENDAR');return L.join('\r\n')}
function mCell(v){v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function mCsv(list,st){return [['date','days_away','name','department','milestone','gift_ideas','status']].concat(list.map(x=>[mYmd(x.date),x.days,x.p.name,x.p.dept||'',x.label,x.gifts.join(' | '),(st||{})[x.id]||'todo'])).map(r=>r.map(mCell).join(',')).join('\n')}
if(typeof module!=='undefined')module.exports={mUpcoming,mGifts,mNext,mIcs,mCsv,mBudget};
if(typeof document!=='undefined'){
const D=JSON.parse(localStorage.getItem('ssm')||'null')||{people:[],brand:{}},ST=JSON.parse(localStorage.getItem('ssm-miles')||'null')||{status:{},budget:50,days:60};
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),save=()=>localStorage.setItem('ssm-miles',JSON.stringify(ST));
document.documentElement.style.setProperty('--brand',(D.brand&&D.brand.color)||'#2A78D6');if(D.brand&&D.brand.name)$('title').textContent=D.brand.name+' · Milestones';
$('mDept').innerHTML='<option value="">All departments</option>'+[...new Set((D.people||[]).map(p=>(p.dept||'').trim()).filter(Boolean))].map(d=>'<option>'+esc(d)+'</option>').join('');
$('mDays').value=ST.days;$('mBudget').value=ST.budget;let cur=[];const NX={todo:'ordered',ordered:'given',given:'todo'};
window.mSet=i=>{const id=cur[i].id;ST.status[id]=NX[ST.status[id]||'todo'];save();render()};
function render(){ST.days=+$('mDays').value;ST.budget=+$('mBudget').value||50;save();cur=mUpcoming(D.people,ST.days,ST.budget,new Date(),$('mDept').value);
  $('mCount').textContent=(D.people||[]).length?cur.length+' milestone(s) coming up':'No people yet. Add them in the Secret Santa app first.';
  $('mList').innerHTML=cur.length?'<tr><th>Date</th><th>In</th><th>Who</th><th>Dept</th><th>Milestone</th><th>Gift ideas</th><th>Status</th></tr>'+cur.map((x,i)=>{const s=ST.status[x.id]||'todo';
    return '<tr class="'+(x.days<=7?'soon':'')+'"><td>'+x.date.toDateString()+'</td><td>'+(x.days?x.days+' days':'Today')+'</td><td>'+esc(x.p.name)+'</td><td>'+esc(x.p.dept)+'</td><td>'+esc(x.label)+'</td><td>'+x.gifts.map(esc).join('<br>')+'</td><td><button class="st '+s+'" onclick="mSet('+i+')">'+s+'</button></td></tr>'}).join(''):''}
const dl=(t,n,ty)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:ty}));a.download=n;a.click()};
window.mExportCsv=()=>dl(mCsv(cur,ST.status),'milestones.csv','text/csv');window.mExportIcs=()=>dl(mIcs(cur),'milestones.ics','text/calendar');
['mDays','mBudget','mDept'].forEach(i=>$(i).addEventListener('change',render));render();}
