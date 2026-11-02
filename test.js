const {assignPairs,upcoming}=require('./app.js');const assert=require('assert');
const P=[['Ava','Sales'],['Ben','Sales'],['Cara','Ops'],['Dev','Ops'],['Eli','Support'],['Fay','Support']].map(([name,dept])=>({name,dept}));
const rules={dept:true,ex:'Ava = Ben',last:'Cara > Dev'};
for(let i=0;i<500;i++){const r=assignPairs(P,rules);assert(r&&r.length===6);const recv=new Set(r.map(x=>x[1]));assert(recv.size===6);
 const d=Object.fromEntries(P.map(p=>[p.name,p.dept]));r.forEach(([g,v])=>{assert(g!==v);assert(d[g]!==d[v]);assert(!(g==='Cara'&&v==='Dev'))})}
assert(assignPairs(P.slice(0,2),{dept:true})===null);
const U=upcoming([{name:'X',start:'2021-11-20',bday:'1990-11-05',likes:'coffee'}],30,100,new Date(2026,10,2));
assert(U.length===2&&U[0].label==='Birthday'&&U[1].label==='5-year work anniversary'&&U[1].gifts.length===3);
console.log('ALL TESTS PASS');console.log(U.map(u=>u.label+': '+u.gifts.join('; ')).join('\n'));
