const IMG={ball:'img/ball.jpg',iron:'img/iron.jpg',thor:'img/thor.jpg',pop:'img/pop.jpg',sum:'img/sum.jpg',corp:'img/corp.jpg',work:'img/work.jpg'};
const C=[
 {id:'ball',name:'BALLGIRL',org:'FRANCE',cls:'ASSAUT',tag:'Déterminée, endurante, compétitrice',gear:['Ballon taille 2','Résine extra-collante','Tir en suspension'],st:[90,70,60],models:['handball']},
 {id:'iron',name:'IRONGIRL',org:'NEW YORK',cls:'AÉRIENNE',tag:'Stratégique, protectrice',gear:['Propulseurs','Armure grenat','Décollage + vrille 360°'],st:[95,85,70]},
 {id:'thor',name:'THIRHMAN',org:'ASGARD',cls:'TANK',tag:'Fière, inébranlable',gear:['Marteau','Cape en fourrure','Frappe sismique'],st:[100,75,95],models:['hammer']},
 {id:'pop',name:'HIIIHMAN',org:'NEVERLAND',cls:'DIVERSION',tag:'Charismatique, audacieuse',gear:['Gant de strass','Lunettes aviateur','Moonwalk'],st:[50,100,80],models:[null,'aviators']},
 {id:'sum',name:'IHMEN',org:'COPENHAGUE',cls:'ÉCLAIREUSE',tag:'Solaire, esprit libre',gear:['Maxi-scooter','Créoles dorées','Wheeling'],st:[45,90,95]},
 {id:'corp',name:'IHMAN',org:'PARIS',cls:'INFILTRATION',tag:'Calme, ambitieuse, observatrice',gear:['Pince à cravate','Sac à main','Le défilé'],st:[55,95,30],models:['tieclip']},
 {id:'work',name:'IHMAN',org:'SILICON VALLEY',cls:'STRATÈGE',tag:'Rigoureuse, posée',gear:['Ordinateur portable','Tableau de bord IA','Deal conclu'],st:[60,85,25],models:['laptop']}
];
const SLOT=['PRINCIPALE','SECONDAIRE','COUP SPÉCIAL'],STAT=['PUISSANCE','STYLE','CHAOS'];
const $=id=>document.getElementById(id);
let cur='thor',viewers=[];

/* ---------- objets 3D ---------- */
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
 }
};
function mount3D(tile,key){
 if(!window.THREE||!MODELS[key])return false;
 try{
  const T=THREE,cv=document.createElement('canvas');tile.appendChild(cv);
  const r=new T.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio||1,2));r.setSize(tile.clientWidth,tile.clientHeight,false);r.outputEncoding=T.sRGBEncoding;
  const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,tile.clientWidth/tile.clientHeight,.1,50);cam.position.set(0,.3,7);
  sc.add(new T.AmbientLight(0xffe2cc,.28));
  const k=new T.DirectionalLight(0xfff0e0,.85);k.position.set(3,4,5);sc.add(k);
  const rim=new T.DirectionalLight(0xe8a487,.8);rim.position.set(-4,2,-3);sc.add(rim);
  const f=new T.PointLight(0xffc9a0,.35,20);f.position.set(0,-3,4);sc.add(f);
  const pivot=new T.Group();pivot.add(MODELS[key](T));sc.add(pivot);
  const v={alive:true};viewers.push(v);const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  (function loop(t){if(!v.alive){r.dispose();return;}
   if(!still){pivot.rotation.y=t*.0011;pivot.position.y=Math.sin(t*.002)*.14;}else pivot.rotation.y=.6;
   r.render(sc,cam);requestAnimationFrame(loop);})(0);
  return true;
 }catch(e){return false;}
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
function reveal(on){$('cine').classList.toggle('show',on);$('hero').classList.toggle('play',on);}
function tryPlay(v){const p=v.play();if(p&&p.catch)p.catch(()=>{v.muted=true;const q=v.play();if(q&&q.catch)q.catch(()=>{});});}
/* boucle muette de l'opératrice sélectionnée ; le portrait reste affiché tant que la vidéo n'a pas démarré */
function loopClip(){
 const v=$('cineVid');reveal(false);
 if(still){unload(v);return;}
 v.muted=true;v.loop=true;loadClip(v,cur,()=>reveal(false));
}
function deploy(done){
 if(playing){endDeploy();return;}
 const v=$('cineVid');playing=true;after=done||null;v.loop=false;v.muted=false;
 if(v.getAttribute('src')&&v.readyState>=2&&!v.error){v.currentTime=0;tryPlay(v);}
 else loadClip(v,cur,endDeploy);
}
function endDeploy(){
 if(!playing)return;playing=false;
 const v=$('cineVid'),done=after;after=null;
 if(done)done();
 v.muted=true;v.loop=true;
 if(still){reveal(false);unload(v);return;}
 if(v.getAttribute('src')&&!v.error){v.currentTime=0;tryPlay(v);}else reveal(false);
}
$('cineVid').addEventListener('playing',()=>reveal(true));
$('cineVid').addEventListener('ended',endDeploy);
$('cine').addEventListener('click',endDeploy);$('hero').addEventListener('click',endDeploy);
addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(playing){e.preventDefault();endDeploy();}return;}
 if(playing||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==='y'||e.key==='Y')deploy();
});
function placeholder(tile,i){const p=document.createElement('div');p.className='fl';p.style.animationDelay=(-i)+'s';p.innerHTML='<div class="ph">OBJET 3D</div>';tile.appendChild(p);}

/* ---------- interface ---------- */
function renderList(){
 const L=$('list');L.innerHTML='';
 C.forEach(c=>{const b=document.createElement('button');b.type='button';if(c.id===cur)b.className='on';
  b.innerHTML='<span class="th"><img alt="" src="'+IMG[c.id]+'"></span><span><span class="nm">'+c.name+'</span><span class="cl">'+c.cls+' · '+c.org+'</span></span>';
  b.onclick=()=>select(c.id);L.appendChild(b);});
 const k=document.createElement('button');k.type='button';k.disabled=true;k.className='lock';k.textContent='VERROUILLÉE · NIVEAU 30';L.appendChild(k);
}
function renderInfo(){
 const c=C.find(x=>x.id===cur);
 $('cls').textContent=c.cls;$('name').textContent=c.name;$('org').textContent=c.org;$('tag').textContent=c.tag;
 viewers.forEach(v=>v.alive=false);viewers=[];
 const G=$('gear');G.innerHTML='';
 c.gear.forEach((it,i)=>{const w=document.createElement('div');
  w.innerHTML='<div class="tile"><div class="n">0'+(i+1)+'</div></div><div class="slot">'+SLOT[i]+'</div><div class="item">'+it+'</div>';
  G.appendChild(w);const tile=w.firstChild;
  if(!(c.models&&c.models[i]&&mount3D(tile,c.models[i])))placeholder(tile,i);
 });
 $('stats').innerHTML=c.st.map((v,i)=>'<div class="st"><span>'+STAT[i]+'</span><div class="bar"><i style="width:'+v+'%"></i></div></div>').join('');
}
function select(id){
 if(id===cur)return;playing=false;after=null;cur=id;renderList();loopClip();
 const im=$('heroImg');im.classList.add('swap');
 setTimeout(()=>{const c=C.find(x=>x.id===cur);im.src=IMG[cur];im.alt=c.name+' '+c.org;im.classList.remove('swap');},200);
 renderInfo();
}
function toast(c){const t=$('toast');t.textContent=c.name+' · '+c.org+' DÉPLOYÉE';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600);}
$('go').onclick=()=>{const c=C.find(x=>x.id===cur);deploy(()=>toast(c));};
$('prev').onclick=()=>deploy();
$('prev').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();deploy();}};
function fit(){const s=Math.min(innerWidth/1280,innerHeight/720);$('fit').style.transform='scale('+s+') translate(-50%,-50%)';}
addEventListener('resize',fit);fit();
$('heroImg').src=IMG[cur];$('heroImg').alt='THIRHMAN ASGARD';renderList();renderInfo();loopClip();
