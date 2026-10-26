/* Gli Amici di Boyle · Rete di Boyle in 3D (BETA, v2)
   Nucleo olografico al centro, membri come nodi nello spazio, filamenti con impulsi di energia.
   - La luce del nucleo segue il puntatore; i nodi fluttuano, la rete ruota piano.
   - Avvicinandosi (rotella, pizzico, pulsanti) le persone vicine mostrano la loro scheda.
   - Clic su un nodo: la camera vola verso la persona. Clic sul nucleo: onda. Tenere premuto: P·V = k.
   - I filamenti sono neutri; prendono il colore dell'area solo quando si sceglie un'area.
   Sorgente; il file servito e' assets/rete3d/rete3d.min.js (esbuild). */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const AREAS = [
  { id: 'A', name: 'Subacquea', color: '#56B4E9', tags: ['diving', 'subacquea', 'esplorazione'] },
  { id: 'B', name: 'Iperbarica', color: '#2fd6b0', tags: ['iperbarica'] },
  { id: 'C', name: 'Emergenza e area critica', color: '#E69F00', tags: ['critical care', 'emergenza', 'trauma', 'ecmo', 'hems', 'chirurgia', 'mass gathering', 'nursing', 'area critica', 'sar', 'soccorso in ambienti estremi', 'medicina umanitaria'] },
  { id: 'D', name: 'Quota, poli e spazio', color: '#e58fd0', tags: ['space', 'spazio', 'aerospaziale', 'astrobiologia', 'montagna', 'medicina polare', 'medicina delle spedizioni', 'ambienti estremi'] },
  { id: 'E', name: 'Medicina operativa e militare', color: '#F0E442', tags: ['medicina militare', 'medical intelligence', 'droni'] },
  { id: 'F', name: 'Ricerca e altre specialità', color: '#b9a6ff', tags: [] },
];
export function areaOf(tags) {
  for (const t of tags || []) { const k = String(t).trim().toLowerCase(); const a = AREAS.find(a => a.tags.includes(k)); if (a) return a.id; }
  return 'F';
}
function secondaryAreas(tags, primary) {
  const out = new Set();
  for (const t of tags || []) { const k = String(t).trim().toLowerCase(); const a = AREAS.find(a => a.tags.includes(k)); if (a && a.id !== primary) out.add(a.id); }
  return [...out];
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);

/* ── shader del nucleo ── */
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;
const CORE_VS = `
varying vec3 vN; varying vec3 vV; varying vec3 vP;
void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const CORE_FS = `
precision mediump float;
uniform float uTime; uniform float uPulse; uniform float uWave; uniform float uInner; uniform float uPress; uniform float uOct;
uniform vec3 uLight; uniform vec3 uTint;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${NOISE}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<3;i++){ if(float(i)>=uOct) break; s+=a*snoise(p); p*=2.03; a*=0.5; } return s; }
void main(){
  vec3 N = normalize(vN); if(!gl_FrontFacing) N = -N;
  vec3 V = normalize(vV); vec3 L = normalize(uLight);
  float fr = pow(1.0 - abs(dot(N, V)), 2.2);
  float t = uTime * 0.16;
  vec3 q = vP * 1.35;
  float w = fbm(q + vec3(t, -t * 0.7, t * 0.5));
  float sw = fbm(q * 1.7 + vec3(w * 1.8) + vec3(-t * 0.6, t * 0.9, 0.0));
  float fil = smoothstep(0.32, 0.0, abs(sw));
  float neb = smoothstep(-0.45, 0.8, w);
  float toward = dot(N, L) * 0.5 + 0.5;
  float breath = 0.85 + 0.35 * uPulse + 0.45 * uPress;
  vec3 deep = vec3(0.03, 0.10, 0.36), elec = vec3(0.12, 0.48, 1.0), cyan = vec3(0.40, 0.95, 1.0), viol = vec3(0.58, 0.40, 1.0);
  vec3 plasma = mix(deep, elec, neb);
  plasma = mix(plasma, viol, smoothstep(0.2, 0.9, sw) * 0.4);
  plasma += cyan * fil * (0.7 + 1.0 * toward);
  plasma = mix(plasma, uTint, 0.25);
  plasma *= breath * (0.6 + 0.85 * pow(toward, 1.5));
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 34.0);
  float wave = uWave > 0.0 ? exp(-pow((fr - uWave) * 7.0, 2.0)) * (1.0 - uWave) : 0.0;
  vec3 col; float a;
  if (uInner > 0.5) { col = plasma * 0.85; a = 0.6 * (0.45 + neb); }
  else {
    vec3 rim = mix(cyan, viol, 0.25) * fr * 1.35;
    col = plasma * (1.0 - fr) * 0.65 + rim + vec3(0.88, 0.98, 1.0) * spec * 1.6 + cyan * wave * 1.8 + cyan * pow(fr, 6.0) * toward;
    a = clamp(fr * 0.95 + 0.42 * (1.0 - fr) * neb + spec + wave, 0.0, 1.0);
  }
  gl_FragColor = vec4(col, a);
}`;

function glowTexture(size = 128, inner = 'rgba(160,235,255,1)', mid = 'rgba(80,170,255,.35)') {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, inner); grd.addColorStop(0.25, mid); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const NEUTRAL = '#7be4ff';
function nodeCanvas(node, img, colored) {
  const S = 192, c = node._canvas || (node._canvas = document.createElement('canvas'));
  c.width = c.height = S;
  const g = c.getContext('2d'), r = S / 2, ring = colored && node.areaColor ? node.areaColor : (node.founder ? '#ffffff' : NEUTRAL);
  const halo = g.createRadialGradient(r, r, r * 0.42, r, r, r);
  halo.addColorStop(0, ring + '99'); halo.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(r, r, r * 0.5, 0, Math.PI * 2); g.closePath(); g.clip();
  if (img) g.drawImage(img, r - r * 0.5, r - r * 0.5, r, r);
  else { g.fillStyle = '#06203f'; g.fillRect(0, 0, S, S); g.fillStyle = '#cfefff'; g.font = '700 34px DM Sans, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(node.initials, r, r + 2); }
  g.restore();
  g.lineWidth = node.founder ? 8 : 5; g.strokeStyle = ring; g.beginPath(); g.arc(r, r, r * 0.5 + 3, 0, Math.PI * 2); g.stroke();
  if (node.founder) { g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(r, r, r * 0.5 + 11, 0, Math.PI * 2); g.stroke(); }
  return c;
}

export function createNetwork(stage, { members, founders, onSelect, onHover, onCoreState, onEmpty, onFrame, reduced, mobile }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'r3d-canvas'; canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 120);
  const CORE = 2.1;                 // raggio del nucleo
  const R_FIT = 8.2;                // raggio della rete da inquadrare
  const homeDist = () => {
    const v = THREE.MathUtils.degToRad(camera.fov), h = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
    const k = camera.aspect < 0.8 ? 0.8 : 0.86;   // in verticale la rete puo' uscire un po' dai lati
    return R_FIT * k / Math.sin(Math.min(v, h) / 2);
  };
  const homePos = () => new THREE.Vector3(0, 0.12, 1).normalize().multiplyScalar(homeDist());

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.rotateSpeed = 0.6; controls.zoomSpeed = 1.1;
  controls.zoomToCursor = true;
  controls.enableZoom = mobile;      // sul computer la rotella zooma solo dopo un clic nella scena
  controls.autoRotate = !reduced; controls.autoRotateSpeed = 0.55;
  controls.minDistance = 1.2; controls.maxDistance = 60;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
  canvas.style.touchAction = 'pan-y'; // un dito in verticale scorre la pagina, in orizzontale ruota; due dita: zoom

  /* ── nucleo ── */
  const core = new THREE.Group(); scene.add(core);
  const U = {
    uTime: { value: 0 }, uPulse: { value: 0 }, uWave: { value: 0 }, uPress: { value: 0 }, uOct: { value: mobile ? 2 : 3 },
    uLight: { value: new THREE.Vector3(0.5, 0.6, 0.8) }, uTint: { value: new THREE.Color('#2a7bff') },
  };
  const geo = new THREE.SphereGeometry(1, mobile ? 56 : 80, mobile ? 40 : 56);
  const mat = inner => new THREE.ShaderMaterial({ uniforms: { ...U, uInner: { value: inner } }, vertexShader: CORE_VS, fragmentShader: CORE_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: inner ? THREE.BackSide : THREE.FrontSide });
  const innerM = new THREE.Mesh(geo, mat(1)), shell = new THREE.Mesh(geo, mat(0));
  innerM.renderOrder = 2; shell.renderOrder = 3;
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }));
  coreGlow.scale.setScalar(3.6);
  core.add(coreGlow, innerM, shell);

  const hud = new THREE.Group(); scene.add(hud);
  const cyanMat = o => new THREE.MeshBasicMaterial({ color: 0x7be4ff, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const rings = [];
  [[1.38, 0.006, 0.6], [1.58, 0.004, 0.4], [1.86, 0.003, 0.25]].forEach(([r, w, o], i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, w, 4, 200), cyanMat(o));
    m.rotation.x = Math.PI / 2 + (i - 1) * 0.35; m.rotation.y = i * 0.6;
    hud.add(m); rings.push({ m, sp: (i % 2 ? -1 : 1) * (0.16 + i * 0.06) });
  });
  [[1.48, 1.52, 0, 1.4], [1.7, 1.73, 2.2, 0.9], [1.48, 1.51, 3.6, 0.6]].forEach(([a, b, s, l], i) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(a, b, 64, 1, s, l), cyanMat(0.75));
    m.rotation.x = Math.PI / 2 + 0.2 * i; hud.add(m); rings.push({ m, sp: (i % 2 ? 0.45 : -0.32) });
  });
  {
    const pts = [], R = 2.0;
    for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, l = i % 10 === 0 ? 0.12 : 0.05; pts.push(Math.cos(a) * R, 0, Math.sin(a) * R, Math.cos(a) * (R + l), 0, Math.sin(a) * (R + l)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const ticks = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x7be4ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    ticks.rotation.x = 0.18; hud.add(ticks); rings.push({ m: ticks, sp: 0.08, axis: 'y' });
  }
  hud.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.22, 2)), new THREE.LineBasicMaterial({ color: 0x7be4ff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false })));
  hud.scale.setScalar(CORE);
  const waveRing = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.0, 128), cyanMat(0));
  scene.add(waveRing);

  /* ── nodi ── */
  const nodeGroup = new THREE.Group(); scene.add(nodeGroup);
  const nodes = [];
  const AIDX = Object.fromEntries(AREAS.map((a, i) => [a.id, i]));
  const add = (data, founder) => {
    const area = founder ? (data.area || null) : areaOf(data.tags);
    const node = {
      data, founder, area, areaColor: area ? AREAS[AIDX[area]].color : null,
      initials: data.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase(),
      base: new THREE.Vector3(), pos: new THREE.Vector3(), phase: Math.random() * 6.28,
      size: founder ? 0.95 : 0.78, cur: 1, opacity: 1, sec: founder ? [] : secondaryAreas(data.tags, area), img: null, colored: false,
    };
    const tex = new THREE.CanvasTexture(nodeCanvas(node, null, false)); tex.colorSpace = THREE.SRGBColorSpace; node.tex = tex;
    node.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    node.sprite.userData.node = node; node.sprite.renderOrder = 5;
    nodeGroup.add(node.sprite);
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { node.img = im; nodeCanvas(node, im, node.colored); tex.needsUpdate = true; };
    im.src = data._thumb;
    nodes.push(node);
  };
  members.forEach(m => add(m, false));
  founders.forEach(f => add(f, true));
  nodes.forEach((n, i) => { n.index = i; });

  const dirs = AREAS.map((a, i) => { const y = 1 - (i + 0.5) / AREAS.length * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; return new THREE.Vector3(Math.cos(th) * r, y * 0.8, Math.sin(th) * r).normalize(); });

  let foundersInner = true;
  let edges = [];   // { a, b, kind }  b = -1 nucleo
  const lineGeo = new THREE.BufferGeometry();
  const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  lines.renderOrder = 1; scene.add(lines);
  const hiGeo = new THREE.BufferGeometry();
  hiGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(96 * 6), 3));
  const hiLines = new THREE.LineSegments(hiGeo, new THREE.LineBasicMaterial({ color: 0xd6f9ff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  hiGeo.setDrawRange(0, 0); hiLines.renderOrder = 4; scene.add(hiLines);
  let hiNode = null;
  let ePos, eCol;

  function layout() {
    const r = rng(42), byArea = {};
    nodes.forEach(n => { if (!n.founder || !foundersInner) (byArea[n.area || 'F'] ||= []).push(n); });
    Object.entries(byArea).forEach(([a, list]) => {
      const d = dirs[AIDX[a]];
      const t1 = new THREE.Vector3().crossVectors(d, Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize();
      const t2 = new THREE.Vector3().crossVectors(d, t1).normalize();
      list.forEach((n, k) => {
        const ang = k * 2.399963 + r() * 0.4, rad = 0.35 + Math.sqrt(k + 0.5) * 0.42;
        const v = d.clone().addScaledVector(t1, Math.cos(ang) * rad * 0.55).addScaledVector(t2, Math.sin(ang) * rad * 0.55).normalize();
        n.base.copy(v.multiplyScalar(5.6 + r() * 2.0));
      });
    });
    if (foundersInner) {
      const fs = nodes.filter(n => n.founder);
      fs.forEach((n, k) => { const a = k / fs.length * Math.PI * 2 + Math.PI / 2; n.base.set(Math.cos(a) * 4.0, Math.sin(a) * 4.0 * 0.82, Math.sin(a * 3) * 0.5); });
    }
    edges = []; const seen = new Set();
    const link = (a, b, kind) => { const k = a < b ? a + '-' + b : b + '-' + a; if (a === b || seen.has(k)) return; seen.add(k); edges.push({ a, b, kind }); };
    nodes.forEach((n, i) => {
      if (!n.founder || !foundersInner) link(i, -1, 'core');
      nodes.map((m, j) => ({ j, d: m.base.distanceTo(n.base) })).filter(o => o.j !== i && nodes[o.j].area === n.area && !(nodes[o.j].founder && foundersInner) && !(n.founder && foundersInner)).sort((a, b) => a.d - b.d).slice(0, 2).forEach(o => link(i, o.j, 'area'));
      n.sec.forEach(sa => { const best = nodes.map((m, j) => ({ j, d: m.base.distanceTo(n.base) })).filter(o => nodes[o.j].area === sa && !nodes[o.j].founder).sort((a, b) => a.d - b.d)[0]; if (best) link(i, best.j, 'cross'); });
    });
    if (foundersInner) {
      const fi = nodes.map((n, i) => n.founder ? i : -2).filter(i => i >= 0);
      fi.forEach((i, k) => { link(i, fi[(k + 1) % fi.length], 'ring'); link(i, -1, 'core'); });
      fi.forEach(i => { const a = nodes[i].area; if (!a) return; nodes.map((m, j) => ({ j, d: m.base.distanceTo(nodes[i].base) })).filter(o => nodes[o.j].area === a && !nodes[o.j].founder).sort((x, y) => x.d - y.d).slice(0, 3).forEach(o => link(i, o.j, 'founder')); });
    }
    ePos = new Float32Array(edges.length * 6); eCol = new Float32Array(edges.length * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
    colorEdges(); resetPulses();
  }

  /* colori dei filamenti: neutri; colorati solo per l'area scelta */
  let focusArea = null;
  function colorEdges() {
    const c = new THREE.Color(), n = new THREE.Color(NEUTRAL), cc = new THREE.Color('#9fdcff');
    edges.forEach((e, k) => {
      const A = nodes[e.a], B = e.b < 0 ? null : nodes[e.b];
      const inArea = focusArea && A.area === focusArea && (!B || B.area === focusArea);
      let f, col;
      if (focusArea) { col = inArea ? c.set(A.areaColor || '#ffffff') : n; f = inArea ? 0.95 : 0.05; }
      else { col = e.kind === 'core' ? cc : n; f = e.kind === 'core' ? 0.22 : e.kind === 'ring' ? 0.45 : 0.32; }
      // il capo verso il nucleo (o verso il secondo nodo) leggermente piu' luminoso
      eCol.set([col.r * f * 0.6, col.g * f * 0.6, col.b * f * 0.6, col.r * f, col.g * f, col.b * f], k * 6);
    });
    lineGeo.attributes.color.needsUpdate = true;
    nodes.forEach(nd => {
      const want = !!focusArea && nd.area === focusArea;
      if (want !== nd.colored) { nd.colored = want; nodeCanvas(nd, nd.img, want); nd.tex.needsUpdate = true; }
    });
  }

  /* ── impulsi ── */
  const PN = reduced ? 0 : (mobile ? 70 : 130);
  const pGeo = new THREE.BufferGeometry(); const pPos = new Float32Array(Math.max(PN, 1) * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pulseObj = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: mobile ? 0.34 : 0.26, map: glowTexture(64, 'rgba(255,255,255,1)', 'rgba(140,230,255,.55)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xd6f9ff }));
  pGeo.setDrawRange(0, PN); pulseObj.renderOrder = 6; scene.add(pulseObj);
  const pulses = Array.from({ length: PN }, () => ({ e: 0, t: 0, s: 0 }));
  function resetPulses() { const r = rng(7); pulses.forEach(p => { p.e = Math.floor(r() * edges.length); p.t = r(); p.s = 0.18 + r() * 0.3; }); }

  /* ── pulviscolo ── */
  const DN = mobile ? 180 : 420, dr = rng(3), dPos = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { const v = new THREE.Vector3(dr() * 2 - 1, dr() * 2 - 1, dr() * 2 - 1).normalize().multiplyScalar(3 + dr() * 14); dPos.set([v.x, v.y, v.z], i * 3); }
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.05, color: 0x7be4ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  layout();

  /* ── interazione ── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(9, 9);
  let inside = false, moved = false, hover = null, hoverCore = false, selected = null, match = null;
  let downAt = 0, downX = 0, downY = 0, pressing = false, pressT = 0, pressure = 1, waveT = -1, burst = 0, engaged = false;
  const lightTarget = new THREE.Vector3(0.5, 0.6, 0.8);
  const setNdc = e => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); };
  canvas.addEventListener('pointermove', e => { setNdc(e); inside = true; moved = true; });
  canvas.addEventListener('pointerleave', () => { inside = false; ndc.set(9, 9); moved = true; if (!mobile) { engaged = false; controls.enableZoom = false; } });
  canvas.addEventListener('pointerdown', e => {
    setNdc(e); downAt = performance.now(); downX = e.clientX; downY = e.clientY;
    if (!mobile) { engaged = true; controls.enableZoom = true; }
    pick();
    if (hoverCore && !hover) { pressing = true; pressT = 0; controls.enabled = false; }
  });
  window.addEventListener('pointerup', e => {
    const long = pressing && pressT > 0.25;
    if (pressing) { pressing = false; controls.enabled = true; if (long) wave(); }
    if (e.target !== canvas) return;
    if (performance.now() - downAt > 450 || Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return;
    setNdc(e); pick();
    if (hover) onSelect(hover.index);
    else if (hoverCore) { if (!long) wave(); }
    else if (onEmpty) onEmpty();
  });
  canvas.addEventListener('contextmenu', e => { if (hoverCore || pressing) e.preventDefault(); });
  canvas.addEventListener('wheel', () => { if (!mobile && !engaged) stage.dispatchEvent(new CustomEvent('r3d-wheelhint')); }, { passive: true });

  const sprites = nodes.map(n => n.sprite);
  function pick() {
    hover = null; hoverCore = false;
    if (Math.abs(ndc.x) > 1.5) return;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(sprites, false).find(h => h.object.userData.node.opacity > 0.3);
    const coreHit = ray.intersectObject(shell, false)[0];
    if (hit && (!coreHit || hit.distance < coreHit.distance + 0.5)) { hover = hit.object.userData.node; return; }
    if (coreHit) hoverCore = true;
  }
  function wave() { if (reduced) return; waveT = 0; burst = 1.6; if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {} }
  function zoom(f) { const d = camera.position.clone().sub(controls.target); const L = THREE.MathUtils.clamp(d.length() * f, controls.minDistance, controls.maxDistance); fly = null; camera.position.copy(controls.target).add(d.setLength(L)); }

  let fly = null;
  function flyTo(posTo, targetTo, ms = 1150) {
    if (reduced) { camera.position.copy(posTo); controls.target.copy(targetTo); return; }
    fly = { p0: camera.position.clone(), t0: controls.target.clone(), p1: posTo, t1: targetTo, start: performance.now(), ms };
  }
  function focusNode(i) {
    const n = nodes[i]; selected = n;
    const dir = n.base.clone().normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const to = n.base.clone().addScaledVector(dir, mobile ? 6.2 : 4.6).addScaledVector(side, mobile ? 0 : -1.1).add(new THREE.Vector3(0, 0.6, 0));
    controls.autoRotate = false;
    flyTo(to, n.base.clone().addScaledVector(side, mobile ? 0 : -0.9).add(new THREE.Vector3(0, mobile ? -2.1 : 0, 0)));
  }
  function home() { selected = null; controls.autoRotate = !reduced; flyTo(homePos(), new THREE.Vector3()); }
  function faceArea(a) {
    const d = dirs[AIDX[a]];
    controls.autoRotate = false;
    flyTo(d.clone().multiplyScalar(homeDist() * 0.82).add(new THREE.Vector3(0, 1.2, 0)), d.clone().multiplyScalar(2.5));
  }

  function highlightEdges(n) {
    hiNode = n; let k = 0;
    if (n) edges.forEach(e => { if (k < 96 && (e.a === n.index || e.b === n.index)) k++; });
    hiGeo.setDrawRange(0, k * 2);
  }
  function applyOpacity() {
    nodes.forEach(n => {
      let o = 1;
      if (focusArea && n.area !== focusArea) o = 0.18;
      if (match && !match.has(n.index)) o = 0.12;
      if (selected && selected !== n && !neighbors(selected.index).includes(n.index)) o = Math.min(o, 0.3);
      n.opacity = o;
    });
  }
  function neighbors(i) { return edges.filter(e => e.b >= 0 && (e.a === i || e.b === i)).map(e => e.a === i ? e.b : e.a); }

  /* ── ciclo ── */
  const clock = new THREE.Clock();
  let running = false, visible = true, raf = 0, intro = reduced ? 1 : 0;
  const tmp = new THREE.Vector3(), surf = new THREE.Vector3(), zero = new THREE.Vector3();
  const proj = nodes.map(() => ({ x: 0, y: 0, px: 0, front: false }));
  function edgeEnds(e, outA, outB, coreR) {
    outA.copy(nodes[e.a].pos);
    if (e.b < 0) outB.copy(outA).setLength(coreR);   // dal bordo del nucleo, non dal centro
    else outB.copy(nodes[e.b].pos);
  }
  const eA = new THREE.Vector3(), eB = new THREE.Vector3();
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (fly) {
      const k = Math.min((performance.now() - fly.start) / fly.ms, 1), e = ease(k);
      camera.position.lerpVectors(fly.p0, fly.p1, e); controls.target.lerpVectors(fly.t0, fly.t1, e);
      if (k >= 1) fly = null;
    }
    controls.update();

    /* entrata: la rete nasce dal nucleo */
    if (intro < 1) intro = Math.min(intro + dt / 2.2, 1);

    /* nodi che fluttuano */
    nodes.forEach((n, i) => {
      const k = easeOut(Math.min(Math.max(intro * 1.6 - (i % 12) * 0.05, 0), 1));
      n.pos.copy(n.base).multiplyScalar(k);
      if (!reduced) n.pos.add(tmp.set(Math.sin(t * 0.55 + n.phase) * 0.16, Math.cos(t * 0.47 + n.phase * 1.3) * 0.16, Math.sin(t * 0.39 + n.phase * 0.7) * 0.16));
      n.sprite.position.copy(n.pos);
    });
    if (moved) { pick(); moved = false; onHover(hover ? hover.index : -1); canvas.style.cursor = hover || hoverCore ? 'pointer' : 'grab'; }

    /* luce che segue il puntatore */
    if (inside && Math.abs(ndc.x) <= 1) lightTarget.set(ndc.x * 1.8, ndc.y * 1.8, 0.9);
    else lightTarget.set(Math.cos(t * 0.35) * 0.9, 0.5 + Math.sin(t * 0.27) * 0.4, 0.75);
    U.uLight.value.lerp(lightTarget, reduced ? 1 : 0.08);
    hud.rotation.x += ((inside ? -ndc.y * 0.22 : Math.sin(t * 0.3) * 0.06) - hud.rotation.x) * 0.05;
    hud.rotation.y += ((inside ? ndc.x * 0.26 : 0) - hud.rotation.y) * 0.05;

    /* respiro, pressione (Boyle), onda */
    const breath = reduced ? 0.5 : 0.5 - 0.5 * Math.cos(t * Math.PI * 2 / 5);
    U.uPulse.value = breath; U.uTime.value = reduced ? 8 : t;
    if (pressing) pressT = Math.min(pressT + dt, 2.5);
    const targetP = pressing ? 1 + Math.min(pressT / 1.6, 1) * 2 : 1;
    pressure += (targetP - pressure) * (pressing ? 0.12 : 0.08);
    U.uPress.value = (pressure - 1) / 2;
    const vol = 1 / pressure;
    const coreR = CORE * Math.cbrt(vol) * (1 + 0.035 * breath) * (0.3 + 0.7 * easeOut(intro));
    core.scale.setScalar(coreR);
    hud.scale.setScalar(CORE * (0.3 + 0.7 * easeOut(intro)));
    onCoreState(pressure, 6 * vol, pressing || pressure > 1.02);
    if (waveT >= 0) {
      waveT += dt / 1.4; U.uWave.value = Math.min(waveT, 1);
      waveRing.scale.setScalar(CORE * (1 + waveT * 4.5)); waveRing.material.opacity = 0.65 * (1 - waveT); waveRing.lookAt(camera.position);
      if (waveT >= 1) { waveT = -1; U.uWave.value = 0; waveRing.material.opacity = 0; }
    }
    coreGlow.material.opacity = 0.5 + 0.3 * breath + 0.35 * U.uPress.value;
    if (!reduced) rings.forEach(r => { if (r.axis === 'y') r.m.rotation.y += r.sp * dt; else r.m.rotation.z += r.sp * dt; });

    /* filamenti che seguono i nodi */
    edges.forEach((e, k) => { edgeEnds(e, eA, eB, coreR * 1.03); ePos[k * 6] = eA.x; ePos[k * 6 + 1] = eA.y; ePos[k * 6 + 2] = eA.z; ePos[k * 6 + 3] = eB.x; ePos[k * 6 + 4] = eB.y; ePos[k * 6 + 5] = eB.z; });
    lineGeo.attributes.position.needsUpdate = true;
    if (hiNode) {
      const arr = hiGeo.attributes.position.array; let k = 0;
      edges.forEach(e => { if (k >= 96 || (e.a !== hiNode.index && e.b !== hiNode.index)) return; edgeEnds(e, eA, eB, coreR * 1.03); arr.set([eA.x, eA.y, eA.z, eB.x, eB.y, eB.z], k * 6); k++; });
      hiGeo.attributes.position.needsUpdate = true;
    }

    /* nodi: dimensione e opacita' morbide, onda che li accende */
    const H = canvas.clientHeight, fovK = H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    nodes.forEach((n, i) => {
      const want = (n === hover || n === selected ? 1.4 : 1) * (match && match.has(n.index) ? 1.25 : 1);
      n.cur += (want - n.cur) * 0.15;
      let glow = 0;
      if (waveT >= 0) { const d = n.pos.length() / 9; glow = Math.max(0, 1 - Math.abs(waveT - d) * 6); }
      const sc = n.size * n.cur * (1 + glow * 0.4);
      n.sprite.scale.setScalar(sc);
      n.sprite.material.opacity += (n.opacity - n.sprite.material.opacity) * 0.12;
      /* proiezione per le schede che compaiono avvicinandosi */
      tmp.copy(n.pos).project(camera);
      const dist = camera.position.distanceTo(n.pos);
      const p = proj[i];
      p.x = (tmp.x + 1) / 2 * canvas.clientWidth; p.y = (1 - tmp.y) / 2 * H;
      p.front = tmp.z < 1 && tmp.z > -1; p.px = sc * 0.5 * fovK / Math.max(dist, 0.01); p.op = n.sprite.material.opacity;
    });
    if (onFrame) onFrame(proj);

    /* impulsi: dal nucleo verso le persone */
    if (burst > 0) burst = Math.max(0, burst - dt);
    for (let i = 0; i < PN; i++) {
      const p = pulses[i]; const e = edges[p.e]; if (!e) continue;
      p.t += p.s * dt * (1 + burst * 3.5);
      if (p.t >= 1) { p.t = 0; p.e = (p.e + 17 + i) % edges.length; }
      edgeEnds(e, eA, eB, coreR * 1.03);
      surf.lerpVectors(eB, eA, p.t);
      pPos[i * 3] = surf.x; pPos[i * 3 + 1] = surf.y; pPos[i * 3 + 2] = surf.z;
    }
    if (PN) pGeo.attributes.position.needsUpdate = true;
    if (!reduced) dust.rotation.y += dt * 0.012;
    renderer.render(scene, camera);
  }
  function start() { if (running || !visible || document.hidden) return; running = true; clock.getDelta(); frame(); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  new IntersectionObserver(en => { visible = en[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.02 }).observe(stage);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  let first = true;
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (first) { camera.position.copy(homePos()); first = false; }
  }
  new ResizeObserver(resize).observe(stage); resize();
  start();

  return {
    nodes, edgesCount: () => edges.length, neighbors,
    select(i) { focusNode(i); applyOpacity(); highlightEdges(nodes[i]); },
    clear() { selected = null; home(); applyOpacity(); highlightEdges(hover); },
    hoverEdges(i) { if (!selected) highlightEdges(i >= 0 ? nodes[i] : null); },
    setArea(a) { focusArea = a; colorEdges(); applyOpacity(); if (a) faceArea(a); else home(); },
    setMatch(set) { match = set; applyOpacity(); },
    setFoundersInner(on) { foundersInner = on; layout(); applyOpacity(); if (selected) highlightEdges(selected); },
    zoom, home, wave,
  };
}
