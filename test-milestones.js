const a=require('assert'),{mUpcoming,mNext,mIcs,mCsv,mBudget}=require('./milestones.js');
const T=new Date(2026,10,4),P=[{name:'Ava',dept:'Sales',start:'2021-11-10',bday:'1990-11-05',likes:'coffee'},{name:'Leap',dept:' sales ',bday:'2000-02-29'},{name:'New',dept:'Ops',start:'2026-11-20'},{name:'Old',dept:'Ops',start:'2016-12-01'}];
const L=mUpcoming(P,60,50,T);
a.deepStrictEqual(L.map(x=>x.p.name+':'+x.label),['Ava:Birthday','Ava:5-year work anniversary','Old:10-year work anniversary']);
a.ok(L[1].gifts[0].startsWith('Specialty coffee')&&L[1].gifts[0].includes('$75'));
a.strictEqual(mUpcoming(P,365,50,T,'SALES').length,3);// dept filter ignores spaces/case
a.strictEqual(mNext('2000-02-29',new Date(2027,0,1)).n.getDate(),28);
a.strictEqual(mUpcoming(P,0,50,new Date(2026,10,5))[0].days,0);
a.strictEqual(mBudget(10,50),100);
a.ok(mIcs(L).includes('DTSTART;VALUE=DATE:20261105'));
a.ok(mCsv(L,{}).split('\n').length===4);
console.log('milestone tests passed');
