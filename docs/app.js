const IMG={ball:'img/ball.jpg',iron:'img/iron.jpg',thor:'img/thor.jpg',pop:'img/pop.jpg',sum:'img/sum.jpg',corp:'img/corp.jpg',work:'img/work.jpg',spider:'img/spider.jpg'};
const TH={spider:'img/spider-th.jpg'};
const C=[
 {id:'ball',ac:'#f0683e',name:'BALLGIRL',org:'FRANCE',cls:'ASSAUT',tag:'Déterminée, endurante, compétitrice',gear:['Ballon taille 2','Résine extra-collante','Tir en suspension'],st:[90,70,60],models:['handball','resin','jumpshot']},
 {id:'iron',ac:'#d4557a',name:'IRONGIRL',org:'NEW YORK',cls:'AÉRIENNE',tag:'Stratégique, protectrice',gear:['Propulseurs','Armure grenat','Décollage + vrille 360°'],st:[95,85,70],models:['thruster','armor','spin']},
 {id:'thor',ac:'#dba63f',name:'THIRHMAN',org:'ASGARD',cls:'TANK',tag:'Fière, inébranlable',gear:['Marteau','Cape en fourrure','Frappe sismique'],st:[100,75,95],models:['hammer','cape','quake']},
 {id:'pop',ac:'#6d8cff',name:'HIIIHMAN',org:'NEVERLAND',cls:'DIVERSION',tag:'Charismatique, audacieuse',gear:['Gant de strass','Lunettes aviateur','Moonwalk'],st:[50,100,80],models:['glove','aviators','moonwalk']},
 {id:'sum',ac:'#f1e2b8',name:'IHMEN',org:'COPENHAGUE',cls:'ÉCLAIREUSE',tag:'Solaire, esprit libre',gear:['Maxi-scooter','Créoles dorées','Wheeling'],st:[45,90,95],models:['scooter','hoops','wheel']},
 {id:'corp',ac:'#aaa56c',name:'IHMAN',org:'PARIS',cls:'INFILTRATION',tag:'Calme, ambitieuse, observatrice',gear:['Pince à cravate','Sac à main','Le défilé'],st:[55,95,30],models:['tieclip','handbag','runway']},
 {id:'work',ac:'#5ec6dc',name:'IHMAN',org:'SILICON VALLEY',cls:'STRATÈGE',tag:'Rigoureuse, posée',gear:['Ordinateur portable','Tableau de bord IA','Deal conclu'],st:[60,85,25],models:['laptop','dashboard','deal']},
 {id:'spider',ac:'#f03a3a',name:'SPIDERGIRL',org:'NEW YORK',cls:'VOLTIGE',tag:'Déterminée, courageuse, loyale',gear:['Lance-toile','Bijoux dorés','Toile géante'],st:[70,85,75],models:['webshooter','jewels','web']}
];
const SLOT=['PRINCIPALE','SECONDAIRE','COUP SPÉCIAL'],STAT=['PUISSANCE','STYLE','CHAOS'];
const $=id=>document.getElementById(id);
let cur='thor',viewers=[];

/* ---------- objets 3D ---------- */
/* matériaux et raccourci de pose partagés par les objets */
const KIT=T=>{const M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5},o||{}));
 return{M,bronze:M(0x8f5f30,{metalness:.5,roughness:.38}),dark:M(0x4a3220,{metalness:.6,roughness:.5}),leather:M(0x3a2416,{roughness:.85}),
  gold:M(0xc9a05a,{metalness:.85,roughness:.25}),cream:M(0xe9dccb,{roughness:.72}),garnet:M(0x7a2a2a,{metalness:.45,roughness:.38}),
  glow:M(0xffd9a0,{emissive:0xffb060,emissiveIntensity:1.6}),
  put(g,geo,mat,x,y,z,rx,ry,rz){const m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m;}};};
const MODELS={
 hammer(T){
  const g=new T.Group();
  const bronze=new T.MeshStandardMaterial({color:0x8f5f30,metalness:.5,roughness:.38});
  const dark=new T.MeshStandardMaterial({color:0x4a3220,metalness:.6,roughness:.5});
  const leather=new T.MeshStandardMaterial({color:0x3a2416,roughness:.85});
  const rune=new T.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb060,emissiveIntensity:1.6});
  const head=new T.Mesh(new T.BoxGeometry(1.7,1.0,1.0),bronze);head.position.y=.95;g.add(head);
  for(const s of[-1,1]){const cap=new T.Mesh(new T.BoxGeometry(.16,1.12,1.12),dark);cap.position.set(s*.86,.95,0);g.add(cap);
   const band=new T.Mesh(new T.BoxGeometry(.08,1.04,1.04),dark);band.position.set(s*.38,.95,0);g.add(band);}
  for(const z of[-1,1]){[[-.14,.2,.06,.5],[.14,.12,.06,.34],[0,-.18,.34,.06]].forEach(r=>{const m=new T.Mesh(new T.BoxGeometry(r[2],r[3],.02),rune);m.position.set(r[0],.95+r[1],z*.51);g.add(m);});}
  const handle=new T.Mesh(new T.CylinderGeometry(.11,.13,2.0,16),leather);handle.position.y=-.5;g.add(handle);
  for(let i=0;i<5;i++){const w=new T.Mesh(new T.TorusGeometry(.135,.025,8,20),dark);w.rotation.x=Math.PI/2;w.position.y=-.1-i*.3;g.add(w);}
  const pommel=new T.Mesh(new T.SphereGeometry(.2,20,16),bronze);pommel.position.y=-1.55;g.add(pommel);
  g.rotation.z=.35;g.scale.setScalar(.82);return g;
 },
 handball(T){
  const g=new T.Group();
  const hide=new T.MeshStandardMaterial({color:0xe9dccb,roughness:.72});
  const panel=new T.MeshStandardMaterial({color:0x8f5f30,metalness:.3,roughness:.55});
  const seam=new T.MeshStandardMaterial({color:0x3a2416,roughness:.85});
  g.add(new T.Mesh(new T.SphereGeometry(1.1,40,28),hide));
  const ring=(rad,rx,rz,y)=>{const p=new T.Group();const m=new T.Mesh(new T.TorusGeometry(rad,.022,8,56),seam);m.rotation.x=Math.PI/2;m.position.y=y;p.add(m);p.rotation.set(rx,0,rz);g.add(p);};
  [[0,0],[Math.PI/2,0],[0,Math.PI/2]].forEach(a=>{ring(1.1,a[0],a[1],0);ring(.93,a[0],a[1],.6);ring(.93,a[0],a[1],-.6);});
  [[0,0],[Math.PI/2,0],[0,Math.PI/2]].forEach(a=>{for(const s of[-1,1]){const p=new T.Group();
   const c=new T.Mesh(new T.SphereGeometry(1.108,32,10,0,Math.PI*2,0,.52),panel);c.rotation.x=s>0?0:Math.PI;p.add(c);p.rotation.set(a[0],0,a[1]);g.add(p);}});
  g.rotation.z=.35;g.rotation.x=.3;g.scale.setScalar(.95);return g;
 },
 laptop(T){
  const g=new T.Group();
  const shell=new T.MeshStandardMaterial({color:0x8f5f30,metalness:.5,roughness:.38});
  const dark=new T.MeshStandardMaterial({color:0x4a3220,metalness:.6,roughness:.5});
  const key=new T.MeshStandardMaterial({color:0x3a2416,roughness:.85});
  const glow=new T.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb060,emissiveIntensity:1.1});
  const line=new T.MeshStandardMaterial({color:0x4a3220,emissive:0x2b1a10,roughness:.6});
  const base=new T.Mesh(new T.BoxGeometry(2.4,.1,1.6),shell);g.add(base);
  const deck=new T.Mesh(new T.BoxGeometry(2.1,.02,.82),dark);deck.position.set(0,.055,-.22);g.add(deck);
  for(let r=0;r<4;r++)for(let c=0;c<10;c++){const k=new T.Mesh(new T.BoxGeometry(.16,.025,.15),key);k.position.set(-.9+c*.2,.075,-.52+r*.2);g.add(k);}
  const pad=new T.Mesh(new T.BoxGeometry(.7,.02,.4),dark);pad.position.set(0,.055,.5);g.add(pad);
  const hinge=new T.Mesh(new T.CylinderGeometry(.06,.06,2.0,16),dark);hinge.rotation.z=Math.PI/2;hinge.position.set(0,.06,-.8);g.add(hinge);
  const lid=new T.Group();lid.position.set(0,.06,-.8);lid.rotation.x=-.3;g.add(lid);
  const back=new T.Mesh(new T.BoxGeometry(2.4,1.6,.07),shell);back.position.y=.82;lid.add(back);
  const bezel=new T.Mesh(new T.BoxGeometry(2.24,1.44,.02),dark);bezel.position.set(0,.82,.04);lid.add(bezel);
  const screen=new T.Mesh(new T.BoxGeometry(2.08,1.28,.02),glow);screen.position.set(0,.82,.05);lid.add(screen);
  [[-.5,.3,.8],[-.35,.1,1.1],[-.6,-.1,.6],[-.25,-.3,1.3]].forEach(r=>{const m=new T.Mesh(new T.BoxGeometry(r[2],.07,.02),line);m.position.set(r[0],.82+r[1],.065);lid.add(m);});
  const logo=new T.Mesh(new T.CylinderGeometry(.16,.16,.02,24),glow);logo.rotation.x=Math.PI/2;logo.position.set(0,.82,-.04);lid.add(logo);
  g.position.y=-.55;g.rotation.x=.28;const o=new T.Group();o.add(g);o.scale.setScalar(.9);return o;
 },
 aviators(T){
  const g=new T.Group();
  const gold=new T.MeshStandardMaterial({color:0xc9a05a,metalness:.85,roughness:.25});
  const lens=new T.MeshStandardMaterial({color:0x6b452a,emissive:0x2b1a10,metalness:.35,roughness:.18,transparent:true,opacity:.92});
  const tip=new T.MeshStandardMaterial({color:0x3a2416,roughness:.85});
  for(const s of[-1,1]){const e=new T.Group();e.position.set(s*.74,0,0);e.rotation.z=s*-.22;e.scale.set(1,.86,1);
   const l=new T.Mesh(new T.CylinderGeometry(.6,.6,.03,40),lens);l.rotation.x=Math.PI/2;e.add(l);
   e.add(new T.Mesh(new T.TorusGeometry(.61,.035,10,48),gold));g.add(e);
   const pad=new T.Mesh(new T.SphereGeometry(.06,12,10),gold);pad.position.set(s*.2,-.2,-.12);g.add(pad);
   const arm=new T.Mesh(new T.BoxGeometry(.05,.06,1.5),gold);arm.position.set(s*1.36,.22,-.75);g.add(arm);
   const ear=new T.Mesh(new T.BoxGeometry(.06,.07,.55),tip);ear.position.set(s*1.36,.1,-1.7);ear.rotation.x=-.5;g.add(ear);}
  for(const y of[.36,.14]){const b=new T.Mesh(new T.CylinderGeometry(.028,.028,y>.2?.78:.44,10),gold);b.rotation.z=Math.PI/2;b.position.set(0,y,0);g.add(b);}
  g.position.z=.75;const o=new T.Group();o.add(g);o.rotation.x=.18;o.scale.setScalar(.8);return o;
 },
 tieclip(T){
  const g=new T.Group();
  const gold=new T.MeshStandardMaterial({color:0xc9a05a,metalness:.85,roughness:.25});
  const dark=new T.MeshStandardMaterial({color:0x4a3220,metalness:.6,roughness:.5});
  const rune=new T.MeshStandardMaterial({color:0xffd9a0,emissive:0xffb060,emissiveIntensity:1.6});
  const front=new T.Mesh(new T.BoxGeometry(2.5,.4,.07),gold);front.position.z=.12;g.add(front);
  const tipF=new T.Mesh(new T.CylinderGeometry(.2,.2,.07,24),gold);tipF.rotation.x=Math.PI/2;tipF.position.set(1.25,0,.12);g.add(tipF);
  const rear=new T.Mesh(new T.BoxGeometry(2.3,.3,.05),dark);rear.position.set(-.1,0,-.12);g.add(rear);
  const tipR=new T.Mesh(new T.CylinderGeometry(.15,.15,.05,24),dark);tipR.rotation.x=Math.PI/2;tipR.position.set(1.05,0,-.12);g.add(tipR);
  const bend=new T.Mesh(new T.CylinderGeometry(.155,.155,.4,20,1,false,0,Math.PI),gold);bend.rotation.y=Math.PI;bend.position.set(-1.25,0,0);g.add(bend);
  for(const x of[-.75,.75]){const b=new T.Mesh(new T.BoxGeometry(.05,.42,.09),dark);b.position.set(x,0,.12);g.add(b);}
  const inlay=new T.Mesh(new T.BoxGeometry(1.1,.06,.02),rune);inlay.position.set(0,0,.165);g.add(inlay);
  for(const z of[.12,-.12]){for(let i=0;i<4;i++){const t=new T.Mesh(new T.BoxGeometry(.05,.3,.03),dark);t.position.set(.55+i*.14,0,z>0?.07:-.085);g.add(t);}}
  g.rotation.z=.35;g.rotation.x=-.25;g.scale.set(1.05,1.5,1.5);return g;
 },
 resin(T){
  const k=KIT(T),g=new T.Group();
  k.put(g,new T.CylinderGeometry(.72,.72,1.1,32),k.dark,0,-.15,0);
  k.put(g,new T.CylinderGeometry(.735,.735,.5,32),k.cream,0,-.15,0);
  k.put(g,new T.BoxGeometry(.5,.07,.02),k.leather,0,-.08,.74);k.put(g,new T.BoxGeometry(.34,.05,.02),k.leather,0,-.24,.74);
  k.put(g,new T.CylinderGeometry(.78,.78,.2,32),k.gold,0,.5,0);
  k.put(g,new T.CylinderGeometry(.6,.6,.06,32),k.bronze,0,.62,0);
  k.put(g,new T.SphereGeometry(.2,16,12),k.glow,.5,.42,.5).scale.set(1,.6,1);
  k.put(g,new T.CylinderGeometry(.06,.05,.5,10),k.glow,.56,.15,.56);k.put(g,new T.SphereGeometry(.085,12,10),k.glow,.56,-.12,.56);
  k.put(g,new T.CylinderGeometry(.045,.04,.28,10),k.glow,.36,.28,.66);
  g.rotation.z=.2;g.scale.setScalar(1.15);return g;
 },
 jumpshot(T){
  const k=KIT(T),g=new T.Group();
  for(const s of[-1,1])k.put(g,new T.BoxGeometry(.12,1.7,.12),k.cream,s*1.05,-.45,-.5);
  k.put(g,new T.BoxGeometry(2.22,.12,.12),k.cream,0,.4,-.5);
  for(let i=0;i<5;i++){k.put(g,new T.BoxGeometry(.125,.17,.125),k.garnet,-1.05,-1.1+i*.34,-.5);k.put(g,new T.BoxGeometry(.125,.17,.125),k.garnet,1.05,-1.1+i*.34,-.5);}
  for(let i=0;i<6;i++)k.put(g,new T.BoxGeometry(.2,.125,.125),k.garnet,-.9+i*.36,.4,-.5);
  for(let i=1;i<6;i++)k.put(g,new T.BoxGeometry(.015,1.7,.015),k.dark,-1.05+i*.35,-.45,-.9);
  for(let i=0;i<5;i++)k.put(g,new T.BoxGeometry(2.1,.015,.015),k.dark,0,-1.15+i*.36,-.9);
  k.put(g,new T.SphereGeometry(.36,24,18),k.cream,.25,.95,.7);
  k.put(g,new T.TorusGeometry(.362,.015,6,32),k.leather,.25,.95,.7);k.put(g,new T.TorusGeometry(.362,.015,6,32),k.leather,.25,.95,.7,Math.PI/2);
  [[.34,.2],[.26,.5],[.18,.76],[.1,.98]].forEach((r,i)=>k.put(g,new T.SphereGeometry(r[0]*.5,12,10),k.glow,.25-r[1]*.35,.95-r[1]*.75,.7+r[1]*.8));
  g.position.y=.1;const o=new T.Group();o.add(g);o.scale.setScalar(.95);return o;
 },
 thruster(T){
  const k=KIT(T),g=new T.Group();
  k.put(g,new T.CylinderGeometry(.42,.6,.7,28),k.garnet,0,.75,0);
  k.put(g,new T.CylinderGeometry(.6,.6,.3,28),k.gold,0,.3,0);
  k.put(g,new T.CylinderGeometry(.5,.78,.75,28,1,true),k.bronze,0,-.2,0).material.side=T.DoubleSide;
  for(const y of[.47,.13,-.56])k.put(g,new T.TorusGeometry(y<0?.78:.61,.035,8,36),k.dark,0,y,0,Math.PI/2);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;k.put(g,new T.BoxGeometry(.08,.5,.3),k.dark,Math.cos(a)*.62,.6,Math.sin(a)*.62,0,-a,0);}
  k.put(g,new T.CylinderGeometry(.44,.44,.05,24),k.glow,0,-.1,0);
  const f=k.M(0xffd9a0,{emissive:0xffb060,emissiveIntensity:1.4,transparent:true,opacity:.75});
  k.put(g,new T.ConeGeometry(.4,1.3,24),f,0,-.95,0,Math.PI);k.put(g,new T.ConeGeometry(.2,1.7,16),k.glow,0,-1.05,0,Math.PI);
  g.position.y=.25;const o=new T.Group();o.add(g);o.rotation.z=.3;return o;
 },
 armor(T){
  const k=KIT(T),g=new T.Group();
  k.put(g,new T.SphereGeometry(.95,32,20),k.garnet,0,.35,0).scale.set(1.1,.85,.62);
  k.put(g,new T.CylinderGeometry(.72,.6,.9,28),k.garnet,0,-.55,0).scale.set(1,1,.62);
  for(const y of[-.3,-.58,-.86])k.put(g,new T.TorusGeometry(.67+y*.1,.03,8,36),k.gold,0,y,0,Math.PI/2).scale.set(1,.62,1);
  for(const s of[-1,1]){k.put(g,new T.SphereGeometry(.4,24,16),k.gold,s*1.05,.72,0).scale.set(1,.8,.9);
   k.put(g,new T.BoxGeometry(.5,.12,.04),k.gold,s*.42,.62,.5,0,0,s*-.35);}
  k.put(g,new T.CylinderGeometry(.4,.46,.3,24),k.dark,0,1.08,0);
  k.put(g,new T.CylinderGeometry(.22,.22,.06,6),k.gold,0,.38,.59,Math.PI/2);
  k.put(g,new T.CylinderGeometry(.16,.16,.08,6),k.glow,0,.38,.6,Math.PI/2);
  k.put(g,new T.BoxGeometry(.9,.2,.4),k.gold,0,-1.05,0).scale.set(1,1,1.4);
  g.scale.setScalar(.92);return g;
 },
 spin(T){
  const k=KIT(T),g=new T.Group();
  for(let i=0;i<34;i++){const t=i/33,a=t*Math.PI*4,r=.95-t*.55;k.put(g,new T.SphereGeometry(.05+t*.06,10,8),k.glow,Math.cos(a)*r,-1.3+t*2.1,Math.sin(a)*r);}
  k.put(g,new T.TorusGeometry(.95,.03,8,40),k.gold,0,-1.3,0,Math.PI/2);k.put(g,new T.TorusGeometry(.6,.02,8,40),k.gold,0,-1.3,0,Math.PI/2);
  const r=new T.Group();r.position.set(0,1.05,0);g.add(r);
  k.put(r,new T.CylinderGeometry(.16,.2,.6,16),k.garnet,0,0,0);k.put(r,new T.ConeGeometry(.16,.36,16),k.gold,0,.48,0);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;k.put(r,new T.BoxGeometry(.03,.3,.24),k.gold,Math.cos(a)*.24,-.2,Math.sin(a)*.24,0,-a,0);}
  k.put(r,new T.ConeGeometry(.13,.5,12),k.glow,0,-.55,0,Math.PI);
  g.position.y=-.1;const o=new T.Group();o.add(g);o.rotation.z=.15;return o;
 },
 cape(T){
  const k=KIT(T),g=new T.Group();
  const cloth=k.M(0x4a3220,{roughness:.8,side:T.DoubleSide}),fur=k.M(0xb89a72,{roughness:1});
  k.put(g,new T.CylinderGeometry(.62,1.15,2.2,28,6,true,Math.PI*.5,Math.PI),cloth,0,-.35,0);
  for(let i=0;i<7;i++){const a=Math.PI*.5+i*Math.PI/6;k.put(g,new T.CylinderGeometry(.035,.06,2.2,8),k.leather,Math.sin(a)*.89,-.35,Math.cos(a)*.89,Math.cos(a)*-.24,0,Math.sin(a)*.24);}
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=.68;k.put(g,new T.SphereGeometry(.2+(i%3)*.035,10,8),fur,Math.cos(a)*r,.88+((i*7)%5)*.02,Math.sin(a)*r*.8);}
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2+.2;k.put(g,new T.ConeGeometry(.08,.3,6),fur,Math.cos(a)*.82,.74,Math.sin(a)*.66,Math.PI);}
  for(const s of[-1,1])k.put(g,new T.CylinderGeometry(.13,.13,.06,20),k.gold,s*.36,.8,.6,Math.PI/2);
  k.put(g,new T.BoxGeometry(.72,.045,.03),k.gold,0,.8,.62);
  g.scale.setScalar(.95);return g;
 },
 quake(T){
  const k=KIT(T),g=new T.Group();
  k.put(g,new T.CylinderGeometry(1.35,1.2,.22,9),k.dark,0,-.7,0);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7+.3,L=.7+(i%3)*.22;
   k.put(g,new T.BoxGeometry(L,.03,.06),k.glow,Math.cos(a)*L*.55,-.58,Math.sin(a)*L*.55,0,-a,0);
   k.put(g,new T.BoxGeometry(L*.5,.03,.04),k.glow,Math.cos(a+.25)*L*.9,-.58,Math.sin(a+.25)*L*.9,0,-(a+.7),0);}
  k.put(g,new T.CylinderGeometry(.2,.2,.04,16),k.glow,0,-.58,0);
  k.put(g,new T.TorusGeometry(.75,.03,8,48),k.glow,0,-.35,0,Math.PI/2);k.put(g,new T.TorusGeometry(1.15,.02,8,48),k.glow,0,-.15,0,Math.PI/2);
  [[.7,.35,.3,.26],[-.6,.7,.5,.2],[.1,1.05,-.6,.17],[-.85,.2,-.5,.22],[.9,.9,-.2,.14],[-.2,.5,.9,.16],[.4,1.4,.3,.11]].forEach((r,i)=>k.put(g,new T.DodecahedronGeometry(r[3],0),i%2?k.bronze:k.leather,r[0],r[1],r[2],i,i*2,i*3));
  g.position.y=-.1;const o=new T.Group();o.add(g);o.rotation.x=.3;return o;
 },
 glove(T){
  const k=KIT(T),g=new T.Group();
  const white=k.M(0xf3ebe0,{roughness:.45,metalness:.15});
  k.put(g,new T.BoxGeometry(.95,.95,.34),white,0,0,0);
  [[-.36,.62,.72],[-.12,.72,.92],[.12,.7,.86],[.36,.6,.66]].forEach(f=>{k.put(g,new T.CylinderGeometry(.1,.115,f[2],12),white,f[0],.45+f[2]/2,0);k.put(g,new T.SphereGeometry(.1,12,10),white,f[0],.45+f[2],0);});
  k.put(g,new T.CylinderGeometry(.105,.125,.6,12),white,-.66,.05,0,0,0,.75);k.put(g,new T.SphereGeometry(.105,12,10),white,-.87,.27,0);
  k.put(g,new T.CylinderGeometry(.42,.52,.55,24),white,0,-.72,0).scale.set(1,1,.5);
  k.put(g,new T.TorusGeometry(.45,.035,8,32),k.gold,0,-.48,0,Math.PI/2).scale.set(1,.5,1);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++)if((i+j)%2===0)k.put(g,new T.OctahedronGeometry(.055,0),k.glow,-.36+i*.18,-.34+j*.17,-.185);
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)k.put(g,new T.OctahedronGeometry(.04,0),k.glow,[-.36,-.12,.12,.36][i],.62+j*.2,-.11);
  g.position.y=-.2;const o=new T.Group();o.add(g);o.rotation.z=-.2;o.scale.setScalar(1.05);return o;
 },
 moonwalk(T){
  const k=KIT(T),g=new T.Group(),s=new T.Group();g.add(s);
  const shoe=k.M(0x1c1410,{roughness:.25,metalness:.3});
  k.put(s,new T.BoxGeometry(1.7,.1,.58),k.leather,0,-.05,0);
  k.put(s,new T.BoxGeometry(.4,.14,.56),k.leather,-.62,-.17,0);
  k.put(s,new T.SphereGeometry(.34,24,16),shoe,.45,.14,0).scale.set(1.5,.62,.82);
  k.put(s,new T.BoxGeometry(.75,.42,.54),shoe,-.42,.2,0);
  k.put(s,new T.BoxGeometry(.3,.05,.5),k.gold,.12,.3,0,0,0,-.3);
  k.put(s,new T.CylinderGeometry(.22,.24,.55,20),k.cream,-.4,.62,0);
  k.put(s,new T.CylinderGeometry(.34,.3,.7,20),k.dark,-.4,1.2,0);
  s.rotation.z=-.5;s.position.set(.1,-.35,0);
  k.put(g,new T.CylinderGeometry(1.25,1.25,.05,40),k.dark,0,-1.25,0);
  k.put(g,new T.TorusGeometry(1.0,.02,8,48),k.glow,0,-1.2,0,Math.PI/2);
  [[.75,.5],[.5,.72],[.3,.9]].forEach(r=>k.put(g,new T.BoxGeometry(r[0],.035,.035),k.glow,1.05,-1.15+r[1]*.55,r[1]*.5-.35));
  g.position.y=.25;const o=new T.Group();o.add(g);o.scale.setScalar(.88);return o;
 },
 scooter(T){
  const k=KIT(T),g=new T.Group();
  const body=k.M(0xe9dccb,{roughness:.35,metalness:.2});
  for(const x of[-1.05,1.05]){k.put(g,new T.TorusGeometry(.36,.15,12,28),k.leather,x,-.75,0);k.put(g,new T.CylinderGeometry(.24,.24,.2,20),k.gold,x,-.75,0,Math.PI/2);}
  k.put(g,new T.BoxGeometry(1.1,.12,.5),body,.05,-.6,0);
  k.put(g,new T.SphereGeometry(.6,28,18),body,-.85,-.38,0).scale.set(1.25,.85,.62);
  k.put(g,new T.BoxGeometry(1.0,.16,.42),k.leather,-.72,.16,0);k.put(g,new T.BoxGeometry(.3,.2,.4),k.leather,-.3,.18,0);
  k.put(g,new T.BoxGeometry(.14,1.35,.66),body,.72,-.05,0,0,0,-.22);
  k.put(g,new T.SphereGeometry(.42,24,14,0,Math.PI*2,0,Math.PI/2),body,1.05,-.72,0).scale.set(1.15,1,.55);
  k.put(g,new T.CylinderGeometry(.05,.05,.5,10),k.gold,.86,.72,0,0,0,-.22);
  k.put(g,new T.CylinderGeometry(.04,.04,1.0,10),k.gold,.92,.98,0,Math.PI/2);
  for(const z of[-.5,.5])k.put(g,new T.CylinderGeometry(.055,.055,.24,10),k.leather,.92,.98,z,Math.PI/2);
  k.put(g,new T.SphereGeometry(.17,16,12),k.glow,1.0,.62,0).scale.set(.6,1,1);
  k.put(g,new T.SphereGeometry(.08,10,8),k.glow,-1.58,-.3,0);
  k.put(g,new T.CylinderGeometry(.03,.03,.7,8),k.gold,0,-.85,.2,0,0,.5);
  g.position.y=.1;const o=new T.Group();o.add(g);o.scale.setScalar(.82);return o;
 },
 hoops(T){
  const k=KIT(T),g=new T.Group();
  for(const s of[-1,1]){const e=new T.Group();e.position.set(s*.72,0,0);e.rotation.y=s*.5;g.add(e);
   k.put(e,new T.TorusGeometry(.6,.07,14,56),k.gold,0,-.25,0);
   k.put(e,new T.TorusGeometry(.6,.075,8,8,.5),k.bronze,0,-.25,0,0,0,-1.82);
   k.put(e,new T.SphereGeometry(.1,16,12),k.gold,0,.38,0);k.put(e,new T.CylinderGeometry(.02,.02,.5,8),k.gold,0,.62,0);
   k.put(e,new T.SphereGeometry(.06,12,10),k.glow,0,.9,0);}
  g.position.y=-.15;g.scale.setScalar(1.05);return g;
 },
 wheel(T){
  const k=KIT(T),g=new T.Group(),w=new T.Group();g.add(w);
  k.put(w,new T.TorusGeometry(.95,.24,16,48),k.leather);
  for(let i=0;i<20;i++){const a=i*Math.PI/10;k.put(w,new T.BoxGeometry(.1,.2,.5),k.dark,Math.cos(a)*1.14,Math.sin(a)*1.14,0,0,0,a);}
  k.put(w,new T.TorusGeometry(.68,.06,10,40),k.gold);
  k.put(w,new T.CylinderGeometry(.2,.2,.3,20),k.gold,0,0,0,Math.PI/2);k.put(w,new T.CylinderGeometry(.09,.09,.42,12),k.dark,0,0,0,Math.PI/2);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.put(w,new T.BoxGeometry(.62,.1,.06),k.cream,Math.cos(a)*.38,Math.sin(a)*.38,0,0,0,a);}
  w.rotation.y=.25;w.position.set(-.1,.15,0);
  for(let i=0;i<3;i++)k.put(g,new T.TorusGeometry(1.35+i*.16,.022,8,28,.9-i*.2),k.glow,-.1,.15,0,0,0,3.5+i*.1);
  k.put(g,new T.BoxGeometry(2.2,.04,.5),k.dark,0,-1.15,0);
  g.scale.setScalar(.85);return g;
 },
 handbag(T){
  const k=KIT(T),g=new T.Group();
  const hide=k.M(0x1c1410,{roughness:.4,metalness:.2});
  k.put(g,new T.BoxGeometry(1.7,1.15,.62),hide,0,-.3,0);
  k.put(g,new T.CylinderGeometry(.31,.31,1.7,20,1,false,0,Math.PI),hide,0,.27,0,0,0,Math.PI/2).rotation.set(Math.PI/2,0,Math.PI/2);
  k.put(g,new T.BoxGeometry(1.74,.55,.05),k.leather,0,.05,.32);
  k.put(g,new T.BoxGeometry(.34,.24,.06),k.gold,0,-.22,.35);k.put(g,new T.BoxGeometry(.14,.08,.08),k.glow,0,-.22,.37);
  k.put(g,new T.TorusGeometry(.5,.05,10,32,Math.PI),k.gold,0,.55,0);
  for(const s of[-1,1]){k.put(g,new T.CylinderGeometry(.08,.08,.1,12),k.gold,s*.5,.56,0);
   for(const z of[-.22,.22])k.put(g,new T.SphereGeometry(.06,10,8),k.gold,s*.7,-.9,z);
   k.put(g,new T.BoxGeometry(.04,1.15,.64),k.leather,s*.84,-.3,0);}
  g.position.y=.1;const o=new T.Group();o.add(g);o.rotation.x=.15;return o;
 },
 runway(T){
  const k=KIT(T),g=new T.Group();
  k.put(g,new T.BoxGeometry(1.1,.05,2.8),k.garnet,0,-.9,0);
  for(const s of[-1,1]){k.put(g,new T.BoxGeometry(.05,.055,2.8),k.gold,s*.55,-.9,0);
   for(const z of[-1.1,0,1.1]){k.put(g,new T.CylinderGeometry(.2,.22,.06,16),k.gold,s*.95,-.9,z);k.put(g,new T.CylinderGeometry(.04,.04,.9,10),k.gold,s*.95,-.45,z);k.put(g,new T.SphereGeometry(.09,12,10),k.gold,s*.95,.03,z);}
   for(const z of[-.55,.55]){k.put(g,new T.CylinderGeometry(.03,.03,.58,8),k.garnet,s*.95,-.2,z-.27,1.1);k.put(g,new T.CylinderGeometry(.03,.03,.58,8),k.garnet,s*.95,-.2,z+.27,-1.1);}}
  const h=new T.Group();h.position.set(0,-.86,.3);g.add(h);
  k.put(h,new T.BoxGeometry(.22,.04,.3),k.leather,0,.02,.25);k.put(h,new T.BoxGeometry(.2,.04,.45),k.leather,0,.2,-.12,.75);
  k.put(h,new T.CylinderGeometry(.03,.015,.4,8),k.leather,0,.2,-.3);k.put(h,new T.SphereGeometry(.13,12,10),k.leather,0,.1,.3).scale.set(.85,.6,1.2);
  k.put(g,new T.CylinderGeometry(.5,.05,1.6,20,1,true),k.M(0xffd9a0,{emissive:0xffb060,emissiveIntensity:.9,transparent:true,opacity:.22,side:T.DoubleSide}),0,.1,.3,Math.PI);
  g.position.y=.25;const o=new T.Group();o.add(g);o.rotation.x=.35;o.scale.setScalar(.92);return o;
 },
 dashboard(T){
  const k=KIT(T),g=new T.Group(),s=new T.Group();g.add(s);
  k.put(s,new T.BoxGeometry(2.5,1.6,.08),k.bronze);k.put(s,new T.BoxGeometry(2.34,1.44,.02),k.leather,0,0,.045);
  [.3,.52,.4,.74,.95].forEach((h,i)=>k.put(s,new T.BoxGeometry(.15,h*.8,.03),k.glow,-.98+i*.22,-.6+h*.4,.07));
  k.put(s,new T.TorusGeometry(.3,.055,10,36,Math.PI*1.5),k.gold,.65,.3,.07);k.put(s,new T.TorusGeometry(.3,.055,10,12,Math.PI*.45),k.dark,.65,.3,.07,0,0,Math.PI*1.52);
  k.put(s,new T.CylinderGeometry(.09,.09,.04,16),k.glow,.65,.3,.07,Math.PI/2);
  [[.25,-.25,.3,.5],[.52,-.12,.32,.1],[.8,-.02,.3,.55]].forEach(r=>k.put(s,new T.BoxGeometry(r[2],.035,.03),k.glow,r[0],r[1]-.2,.07,0,0,r[3]));
  for(let i=0;i<3;i++)k.put(s,new T.BoxGeometry(.5-i*.1,.045,.03),k.cream,-.82+i*-.05+.02*i,.55-i*.13,.07);
  for(let i=0;i<4;i++)k.put(s,new T.SphereGeometry(.035,8,8),k.cream,.2+i*.3,-.6,.07);
  s.rotation.x=-.18;s.position.y=.25;
  k.put(g,new T.CylinderGeometry(.06,.08,.6,12),k.dark,0,-.8,-.05);k.put(g,new T.CylinderGeometry(.55,.6,.06,28),k.dark,0,-1.1,0);
  g.scale.setScalar(.9);return g;
 },
 deal(T){
  const k=KIT(T),g=new T.Group();
  k.put(g,new T.BoxGeometry(1.6,2.1,.03),k.cream,.04,-.04,-.05,0,0,-.05);
  k.put(g,new T.BoxGeometry(1.6,2.1,.03),k.M(0xf3ebe0,{roughness:.8}));
  k.put(g,new T.BoxGeometry(.8,.1,.02),k.leather,-.28,.8,.02);
  for(let i=0;i<7;i++)k.put(g,new T.BoxGeometry(i%3===2?.9:1.3,.035,.02),k.dark,i%3===2?-.2:0,.55-i*.16,.02);
  k.put(g,new T.BoxGeometry(.7,.02,.02),k.leather,-.3,-.82,.02);
  [[-.58,-.72,.2,.9],[-.44,-.7,.16,-.8],[-.3,-.72,.22,.7],[-.14,-.7,.18,-.6],[.0,-.73,.14,.3]].forEach(r=>k.put(g,new T.BoxGeometry(r[2],.03,.02),k.bronze,r[0],r[1],.025,0,0,r[3]));
  k.put(g,new T.CylinderGeometry(.27,.27,.06,10),k.garnet,.45,-.68,.04,Math.PI/2);k.put(g,new T.TorusGeometry(.19,.025,8,24),k.gold,.45,-.68,.075);
  k.put(g,new T.BoxGeometry(.14,.4,.02),k.garnet,.38,-1.0,.03,0,0,.2);k.put(g,new T.BoxGeometry(.14,.4,.02),k.garnet,.56,-1.0,.03,0,0,-.2);
  const p=new T.Group();p.position.set(.2,-.15,.3);p.rotation.set(.5,0,-.9);g.add(p);
  k.put(p,new T.CylinderGeometry(.055,.055,1.2,12),k.leather);k.put(p,new T.ConeGeometry(.055,.2,12),k.gold,0,-.7,0,Math.PI);
  k.put(p,new T.CylinderGeometry(.06,.06,.08,12),k.gold,0,.3,0);k.put(p,new T.BoxGeometry(.02,.4,.03),k.gold,.065,.38,0);
  g.rotation.z=.12;g.rotation.x=-.2;g.scale.setScalar(1.02);return g;
 },
 webshooter(T){
  const k=KIT(T),g=new T.Group();
  const cuff=k.put(g,new T.CylinderGeometry(.62,.68,.8,28,1,true),k.M(0x4a3220,{metalness:.6,roughness:.5,side:T.DoubleSide}));cuff.scale.set(1,1,.8);
  for(const y of[-.4,.4])k.put(g,new T.TorusGeometry(y<0?.68:.62,.04,8,36),k.gold,0,y,0,Math.PI/2).scale.set(1,.8,1);
  k.put(g,new T.BoxGeometry(.62,.5,.26),k.garnet,0,0,.6);k.put(g,new T.BoxGeometry(.5,.38,.06),k.dark,0,0,.75);
  k.put(g,new T.CylinderGeometry(.09,.12,.38,14),k.gold,0,.42,.62);k.put(g,new T.CylinderGeometry(.05,.05,.1,10),k.glow,0,.62,.62);
  for(let i=0;i<6;i++){const a=-1.0+i*.4;k.put(g,new T.CylinderGeometry(.075,.075,.42,10),i%2?k.gold:k.cream,Math.sin(a+Math.PI)*.68,0,Math.cos(a+Math.PI)*.56);}
  const web=k.M(0xf3ebe0,{emissive:0xe9dccb,emissiveIntensity:.5,roughness:.6});
  k.put(g,new T.CylinderGeometry(.02,.02,.9,6),web,0,1.1,.62);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;k.put(g,new T.CylinderGeometry(.012,.012,.5,5),web,Math.cos(a)*.16,1.75,.62+Math.sin(a)*.16,Math.sin(a)*.65,0,-Math.cos(a)*.65);}
  k.put(g,new T.TorusGeometry(.2,.01,5,5),web,0,1.82,.62,Math.PI/2);
  g.position.y=-.55;const o=new T.Group();o.add(g);o.rotation.z=-.3;o.scale.setScalar(.95);return o;
 },
 jewels(T){
  const k=KIT(T),g=new T.Group();
  const amber=k.M(0xe0a050,{emissive:0x8a4a10,emissiveIntensity:.6,roughness:.15,metalness:.3,transparent:true,opacity:.92});
  for(const s of[-1,1]){const e=new T.Group();e.position.set(s*.62,0,0);g.add(e);
   k.put(e,new T.SphereGeometry(.07,12,10),k.gold,0,1.15,0);k.put(e,new T.TorusGeometry(.12,.02,8,20,Math.PI),k.gold,0,1.15,0);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;k.put(e,new T.SphereGeometry(.1,12,10),k.gold,Math.cos(a)*.17,.78+Math.sin(a)*.17,0).scale.set(1,1,.5);}
   k.put(e,new T.SphereGeometry(.09,12,10),k.glow,0,.78,.04);
   k.put(e,new T.SphereGeometry(.15,16,12),amber,0,.36,0);k.put(e,new T.TorusGeometry(.08,.02,6,16),k.gold,0,.56,0);
   k.put(e,new T.SphereGeometry(.19,16,12),amber,0,-.02,0);k.put(e,new T.TorusGeometry(.08,.02,6,16),k.gold,0,.2,0);
   k.put(e,new T.SphereGeometry(.23,16,12),amber,0,-.48,0);k.put(e,new T.TorusGeometry(.08,.02,6,16),k.gold,0,-.23,0);
   k.put(e,new T.ConeGeometry(.1,.3,12),k.gold,0,-.88,0,Math.PI);}
  g.position.y=-.1;g.scale.setScalar(1.15);return g;
 },
 web(T){
  const k=KIT(T),g=new T.Group();
  const web=k.M(0xf3ebe0,{emissive:0xe9dccb,emissiveIntensity:.55,roughness:.6});
  for(let i=0;i<4;i++)k.put(g,new T.CylinderGeometry(.014,.014,2.9,5),web,0,0,0,0,0,i*Math.PI/4+Math.PI/8);
  [.28,.58,.9,1.24].forEach((r,i)=>k.put(g,new T.TorusGeometry(r,.012,5,8),web,0,0,0,0,0,Math.PI/8+(i%2)*.05));
  k.put(g,new T.TorusGeometry(1.45,.03,8,8),k.gold,0,0,0,0,0,Math.PI/8);
  const sp=new T.Group();sp.position.set(.2,.1,.08);g.add(sp);
  k.put(sp,new T.SphereGeometry(.13,14,10),k.leather,0,-.1,0).scale.set(1,1.4,.8);k.put(sp,new T.SphereGeometry(.09,12,10),k.leather,0,.14,0);
  k.put(sp,new T.BoxGeometry(.05,.14,.02),k.garnet,0,-.1,.11);
  for(const s of[-1,1])for(let i=0;i<4;i++)k.put(sp,new T.CylinderGeometry(.012,.012,.42,5),k.leather,s*.2,.12-i*.1,0,0,0,s*(1.0+i*.25-.4));
  g.scale.setScalar(.98);return g;
 }
};
/* un seul moteur de rendu partagé (éclairage d'ambiance par reflets, rendu filmique) :
   chaque vitrine est un canvas 2D dans lequel on recopie l'image de son objet */
let R3=null,ticking=false;const SC={};
function engine(){
 if(R3!==null)return R3;
 try{
  const T=THREE,r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  r.setPixelRatio(1);r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.0;r.setClearColor(0,0);
  const es=new T.Scene();
  es.add(new T.Mesh(new T.BoxGeometry(30,30,30),new T.MeshBasicMaterial({color:0x0c0806,side:T.BackSide})));
  const panel=(c,k,x,y,z,w,h)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m);};
  panel(0xfff0e0,4,5,7,6,6,6);panel(0xe8a487,3.5,-9,3,-4,5,9);panel(0xffc9a0,1,0,-9,4,8,4);panel(0xffffff,1.2,-3,2,10,2,4);panel(0xe8a487,1,8,-2,-6,4,4);
  const pm=new T.PMREMGenerator(r),env=pm.fromScene(es,.03).texture;pm.dispose();
  R3={T,r,env,w:0,h:0};
 }catch(e){R3=false;}
 return R3;
}
function mount3D(tile,key){
 const E=engine();if(!E||!MODELS[key])return false;
 try{
  const T=E.T;let s=SC[key];
  if(!s){
   const sc=new T.Scene();sc.environment=E.env;
   sc.add(new T.AmbientLight(0xffe2cc,.12));
   const k=new T.DirectionalLight(0xfff0e0,.75);k.position.set(3,4,5);sc.add(k);
   const rim=new T.DirectionalLight(0xe8a487,.9);rim.position.set(-4,2,-3);sc.add(rim);
   const f=new T.PointLight(0xffc9a0,.3,20);f.position.set(0,-3,4);sc.add(f);
   const pivot=new T.Group();pivot.add(MODELS[key](T));sc.add(pivot);
   const cam=new T.PerspectiveCamera(32,tile.clientWidth/tile.clientHeight,.1,50);cam.position.set(0,.3,7);
   s=SC[key]={sc,pivot,cam};
  }
  s.cam.aspect=tile.clientWidth/tile.clientHeight;s.cam.updateProjectionMatrix();
  const dpr=Math.min(devicePixelRatio||1,2)*1.5,w=Math.round(tile.clientWidth*dpr),h=Math.round(tile.clientHeight*dpr);
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;tile.appendChild(cv);
  const v={s,cv,ctx:cv.getContext('2d'),w,h,t0:performance.now(),hover:0};
  tile.addEventListener('pointerenter',()=>{v.hover=1;SFX.hover();});tile.addEventListener('pointerleave',()=>v.hover=0);
  viewers.push(v);
  if(!ticking){ticking=true;requestAnimationFrame(tick);}
  return true;
 }catch(e){return false;}
}
function tick(t){
 if(!viewers.length||!R3){ticking=false;return;}
 requestAnimationFrame(tick);
 const E=R3;
 for(const v of viewers){
  if(E.w!==v.w||E.h!==v.h){E.r.setSize(v.w,v.h,false);E.w=v.w;E.h=v.h;}
  const p=v.s.pivot,a=Math.min(1,(t-v.t0)/450),e=1-Math.pow(1-a,3);
  v.spin=(v.spin===undefined?t*.0011:v.spin)+(v.last?(t-v.last)*.0011*(1+v.hover*2.2):0);v.last=t;
  if(!still){p.rotation.y=v.spin;p.position.y=Math.sin(t*.002)*.14;p.scale.setScalar(.55+.45*e);}else{p.rotation.y=.6;p.position.y=0;p.scale.setScalar(1);}
  E.r.render(v.s.sc,v.s.cam);v.ctx.clearRect(0,0,v.w,v.h);v.ctx.drawImage(E.r.domElement,0,0);
 }
}

/* ---------- vidéo centrale : en boucle muette à la place du portrait, avec le son au déploiement ---------- */
const clip=id=>'clips/'+id+'.mp4';
let playing=false,after=null;
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* charge un clip : URL directe, puis blob, puis data URI si l'hébergeur bloque les précédentes */
const MODES=['direct','blob','data'],srcCache={};let mode0=0;
function loadClip(v,id,fail){
 const tok=v._tok=(v._tok||0)+1;let n=mode0;
 const ok=()=>v._tok===tok;
 const go=u=>{if(!ok())return;v.src=u;const p=v.play();if(p&&p.catch)p.catch(()=>{if(!ok()||v.error)return;v.muted=true;const q=v.play();if(q&&q.catch)q.catch(()=>{});});};
 const next=()=>{if(!ok())return;const i=n++,m=MODES[i];if(!m){if(fail)fail();return;}
  const key=m+':'+id;
  if(m==='direct'){go(clip(id));return;}
  if(srcCache[key]){go(srcCache[key]);return;}
  fetch(clip(id)).then(r=>{if(!r.ok)throw 0;return r.blob();})
   .then(b=>m==='blob'?URL.createObjectURL(b):new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=rej;f.readAsDataURL(b);}))
   .then(u=>{srcCache[key]=u;go(u);}).catch(next);};
 v.onerror=()=>{if(ok()&&v.getAttribute('src'))next();};
 v.onloadeddata=()=>{if(ok())mode0=Math.max(mode0,n-1);};
 next();
}
function unload(v){v._tok=(v._tok||0)+1;v.onerror=null;v.pause();v.removeAttribute('src');v.load();}
function setDeploy(on){playing=on;ambience(!on);$('stage').classList.toggle('deploying',on);if(on)$('callName').textContent=C.find(x=>x.id===cur).gear[2];}
function reveal(on){$('cine').classList.toggle('show',on);$('hero').classList.toggle('play',on);$('stage').classList.toggle('vid',on);}
function tryPlay(v){const p=v.play();if(p&&p.catch)p.catch(()=>{v.muted=true;const q=v.play();if(q&&q.catch)q.catch(()=>{});});}
/* boucle muette de l'opératrice sélectionnée ; le portrait reste affiché tant que la vidéo n'a pas démarré */
function loopClip(){
 const v=$('cineVid');reveal(false);
 if(still){unload(v);return;}
 v.muted=true;v.loop=true;loadClip(v,cur,()=>reveal(false));
}
function deploy(done){
 if(playing){endDeploy();return;}
 const v=$('cineVid');setDeploy(true);after=done||null;v.loop=false;v.muted=!soundOn;SFX.deploy();setTimeout(()=>{if(playing)impact();},360);
 if(v.getAttribute('src')&&v.readyState>=2&&!v.error){v.currentTime=0;tryPlay(v);}
 else loadClip(v,cur,endDeploy);
}
function endDeploy(){
 if(!playing)return;setDeploy(false);
 const v=$('cineVid'),done=after;after=null;
 if(done)done();
 v.muted=true;v.loop=true;
 if(still){reveal(false);unload(v);return;}
 if(v.getAttribute('src')&&!v.error){v.currentTime=0;tryPlay(v);}else reveal(false);
}
$('cineVid').addEventListener('playing',()=>reveal(true));
$('cineVid').addEventListener('ended',endDeploy);
$('cine').addEventListener('click',endDeploy);$('hero').addEventListener('click',endDeploy);
/* fondu au rebouclage + barre de progression du déploiement */
(function vloop(){requestAnimationFrame(vloop);const v=$('cineVid'),d=v.duration;if(!d||!isFinite(d))return;
 if(playing){$('cine').classList.remove('dip');$('prog').firstChild.style.transform='scaleX('+Math.min(1,v.currentTime/d)+')';}
 else $('cine').classList.toggle('dip',!v.paused&&(d-v.currentTime<.28||v.currentTime<.1));})();
/* clavier : flèches pour changer d'opératrice, Entrée pour déployer, Y pour l'aperçu, B ou Échap pour revenir */
addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(!started){if(e.key!=='Tab'){e.preventDefault();start();}return;}
 const k=e.key,btn=e.target&&e.target.closest&&e.target.closest('button,[role=button]');
 if(k==='Escape'||k==='b'||k==='B'||k==='Backspace'){if(playing){e.preventDefault();SFX.back();endDeploy();}return;}
 if(k==='ArrowDown'||k==='ArrowUp'||k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();const i=C.findIndex(x=>x.id===cur),n=(i+(k==='ArrowDown'||k==='ArrowRight'?1:-1)+C.length)%C.length;select(C[n].id);const b=$('list').children[n];if(b)b.focus({preventScroll:true});return;}
 if(playing)return;
 if(k==='y'||k==='Y')deploy();
 else if(k==='Enter'&&!btn){e.preventDefault();$('go').click();}
});
function placeholder(tile,i){const p=document.createElement('div');p.className='fl';p.style.animationDelay=(-i)+'s';p.innerHTML='<div class="ph">OBJET 3D</div>';tile.appendChild(p);}

/* ---------- interface ---------- */
function renderList(){
 const L=$('list');L.innerHTML='';
 C.forEach(c=>{const b=document.createElement('button');b.type='button';if(c.id===cur)b.className='on';
  b.innerHTML='<span class="th"><img alt="" src="'+(TH[c.id]||IMG[c.id])+'"></span><span><span class="nm">'+c.name+'</span><span class="cl">'+c.cls+' · '+c.org+'</span></span>';
  b.onclick=()=>select(c.id);b.onmouseenter=()=>{if(c.id!==cur)SFX.hover();};L.appendChild(b);});
}
function renderInfo(){
 const c=C.find(x=>x.id===cur);$('stage').style.setProperty('--ac',c.ac);
 $('cls').textContent=c.cls;$('name').textContent=c.name;$('org').textContent=c.org;$('tag').textContent=c.tag;
 viewers=[];
 ['cls','name','org','tag'].forEach(id=>{const el=$(id);el.classList.remove('in');void el.offsetWidth;el.classList.add('in');});
 const G=$('gear');G.innerHTML='';
 c.gear.forEach((it,i)=>{const w=document.createElement('div');
  w.innerHTML='<div class="tile"><div class="n">0'+(i+1)+'</div></div><div class="slot">'+SLOT[i]+'</div><div class="item">'+it+'</div>';
  G.appendChild(w);const tile=w.firstChild;
  if(!(c.models&&c.models[i]&&mount3D(tile,c.models[i])))placeholder(tile,i);
 });
 $('stats').innerHTML=c.st.map((v,i)=>'<div class="st"><span>'+STAT[i]+'</span><div class="bar"><i style="width:0"></i></div><b>'+v+'</b></div>').join('');
 const bars=$('stats').querySelectorAll('.bar i');requestAnimationFrame(()=>requestAnimationFrame(()=>bars.forEach((b,i)=>b.style.width=c.st[i]+'%')));
}
function select(id){
 if(id===cur)return;after=null;setDeploy(false);cur=id;[...$('list').children].forEach((b,i)=>b.classList.toggle('on',C[i].id===cur));centre();SFX.select();loopClip();
 const im=$('heroImg');im.classList.add('swap');
 setTimeout(()=>{const c=C.find(x=>x.id===cur);im.src=IMG[cur];im.alt=c.name+' '+c.org;im.classList.remove('swap');},200);
 renderInfo();
}
/* en portrait, la liste est une bande horizontale : on garde l'opératrice choisie au milieu */
function centre(){const L=$('list'),b=L.querySelector('.on');if(!b||!$('stage').classList.contains('pt'))return;
 const x=b.offsetLeft-(L.clientWidth-b.offsetWidth)/2;if(L.scrollTo)L.scrollTo({left:x,behavior:still?'auto':'smooth'});else L.scrollLeft=x;}
$('go').onclick=()=>{const c=C.find(x=>x.id===cur);deploy(()=>endcard(c));};
$('go').onmouseenter=()=>SFX.hover();
/* glisser sur l'opératrice pour passer à la suivante ou à la précédente */
let sx=null;
$('hero').addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:true});
$('hero').addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)<46)return;
 const i=C.findIndex(x=>x.id===cur);select(C[(i+(dx<0?1:-1)+C.length)%C.length].id);});
$('prev').onclick=()=>deploy();
$('prev').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();deploy();}};
/* paysage : scène de 1280x720, élargie jusqu'à 2000 sur les écrans allongés.
   portrait (téléphone à la verticale) : scène de 720 de large, la hauteur suit l'écran et profite à l'opératrice */
let wasPt=null;
function fit(){
 const iw=innerWidth,ih=innerHeight,pt=ih>iw*1.12,st=$('stage'),cs=getComputedStyle($('safe'));
 const W=pt?720:(Math.max(1280,Math.min(2000,Math.round(720*iw/ih)))||1280),H=pt?Math.max(1280,Math.min(1900,Math.round(720*ih/iw))):720,s=Math.min(iw/W,ih/H);
 const inset=Math.max(parseFloat(cs.paddingLeft)||0,parseFloat(cs.paddingRight)||0);
 st.classList.toggle('pt',pt);st.style.setProperty('--gx',Math.max(pt?28:40,Math.ceil(inset/s))+'px');st.style.setProperty('--hh',(H-778)+'px');
 $('fit').style.width=st.style.width=W+'px';$('fit').style.height=st.style.height=H+'px';$('fit').style.transform='scale('+s+') translate(-50%,-50%)';
 if(wasPt!==null&&wasPt!==pt){renderInfo();centre();}
 wasPt=pt;
}
addEventListener('resize',fit);addEventListener('orientationchange',()=>{fit();setTimeout(fit,300);});
if(window.visualViewport)visualViewport.addEventListener('resize',fit);
if(window.ResizeObserver)new ResizeObserver(fit).observe(document.documentElement);
fit();
$('heroImg').src=IMG[cur];$('heroImg').alt='THIRHMAN ASGARD';renderList();renderInfo();loopClip();

/* ---------- son : tout est synthétisé, aucun fichier audio ---------- */
let AC=null,master=null,amb=null,started=false,soundOn=true;
try{soundOn=localStorage.getItem('op-son')!=='0';}catch(e){}
function ac(){
 if(!started)return null;
 if(!AC){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;
  try{AC=new A();master=AC.createGain();master.gain.value=soundOn?.55:0;master.connect(AC.destination);}catch(e){AC=null;return null;}}
 if(AC.state==='suspended')AC.resume();
 return AC;
}
function tone(type,f0,f1,dur,vol,delay){
 const a=ac();if(!a)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
 o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);
}
function noise(dur,vol,f0,f1,q,delay,type){
 const a=ac();if(!a)return;const t=a.currentTime+(delay||0),n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type=type||'bandpass';f.Q.value=q||1;
 f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.15);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.05);
}
const SFX={
 hover(){tone('sine',1500,1100,.05,.05);},
 select(){tone('triangle',240,90,.16,.3);noise(.06,.12,3000,1200,1.5);tone('sine',880,1320,.12,.05,.03);},
 start(){noise(.55,.2,300,5000,2);tone('sawtooth',110,440,.5,.07);tone('sine',120,38,.9,.55,.48);noise(.5,.3,1800,120,.7,.48,'lowpass');},
 deploy(){noise(.4,.22,400,6000,3);tone('sine',110,34,1.1,.7,.36);noise(.7,.4,2400,90,.7,.36,'lowpass');tone('square',220,55,.3,.08,.36);},
 end(){[392,587.3,784].forEach((f,i)=>{tone('triangle',f,f,.9,.14,i*.07);tone('sine',f*2,f*2,.6,.04,i*.07);});noise(.3,.08,6000,2000,2);},
 back(){tone('triangle',300,160,.12,.14);}
};
function ambience(on){
 const a=ac();if(!a)return;
 if(!amb){const g=a.createGain(),f=a.createBiquadFilter(),l=a.createOscillator(),lg=a.createGain();g.gain.value=0;f.type='lowpass';f.frequency.value=170;f.Q.value=4;
  [55,55.6,82.6].forEach((hz,i)=>{const o=a.createOscillator();o.type=i<2?'sawtooth':'triangle';o.frequency.value=hz;o.connect(f);o.start();});
  l.frequency.value=.07;lg.gain.value=70;l.connect(lg);lg.connect(f.frequency);l.start();f.connect(g);g.connect(master);amb=g;}
 amb.gain.cancelScheduledValues(a.currentTime);amb.gain.setTargetAtTime(on?.16:0,a.currentTime,on?.9:.15);
}
function setSound(on){soundOn=on;try{localStorage.setItem('op-son',on?'1':'0');}catch(e){}
 const b=$('snd');b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'SON ACTIVÉ':'SON COUPÉ';
 if(master&&AC)master.gain.setTargetAtTime(on?.55:0,AC.currentTime,.05);
 if(playing)$('cineVid').muted=!on;}
$('snd').onclick=()=>{setSound(!soundOn);SFX.select();};
setSound(soundOn);

/* ---------- écran d'accueil ---------- */
function start(){
 if(started)return;started=true;$('title').classList.add('gone');
 SFX.start();ambience(true);renderList();renderInfo();
}
$('title').addEventListener('click',start);

/* ---------- déploiement : éclair, secousse, carton de fin ---------- */
function replay(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
function impact(){if(still)return;replay($('flash'),'go');replay($('stage'),'shake');}
let endT=0;
function endcard(c){
 const e=$('endcard');$('endName').textContent=c.name;clearTimeout(endT);replay(e,'show');SFX.end();
 endT=setTimeout(()=>e.classList.remove('show'),2100);
}
