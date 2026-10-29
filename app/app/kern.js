// Tafel-App – Kern: Zustand, Geometrie, Zeichnen, Verlauf
'use strict';
(function () {
const T = window.T = window.T || {};

T.CM = 40;                       // Weltpixel pro Zentimeter
T.uid = () => Math.random().toString(36).slice(2, 10);
T.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
T.r1 = v => Math.round(v * 10) / 10;
T.r2 = v => Math.round(v * 100) / 100;
T.zahl = (v, st = 2) => (Math.round(v * 10 ** st) / 10 ** st).toLocaleString('de-DE');

T.FAECHER = [
  { id: 'Mathe', farbe: '#1e88e5', icon: '➗' }, { id: 'Deutsch', farbe: '#e53935', icon: '✍️' },
  { id: 'Englisch', farbe: '#3949ab', icon: '💬' }, { id: 'NaWi', farbe: '#43a047', icon: '🔬' },
  { id: 'Biologie', farbe: '#7cb342', icon: '🌱' }, { id: 'Chemie', farbe: '#00897b', icon: '⚗️' },
  { id: 'Physik', farbe: '#5e35b1', icon: '🧲' }, { id: 'Erdkunde', farbe: '#00838f', icon: '🌍' },
  { id: 'Geschichte', farbe: '#8d6e63', icon: '🏛️' }, { id: 'Politik', farbe: '#546e7a', icon: '⚖️' },
  { id: 'Wirtschaft', farbe: '#f9a825', icon: '📈' }, { id: 'Religion-WuN', farbe: '#ab47bc', icon: '🕊️' },
  { id: 'Musik', farbe: '#d81b60', icon: '🎵' }, { id: 'Kunst', farbe: '#fb8c00', icon: '🎨' },
  { id: 'Sport', farbe: '#43a047', icon: '⚽' }, { id: 'Technik', farbe: '#6d4c41', icon: '🔧' },
  { id: 'Informatik', farbe: '#3949ab', icon: '💻' }, { id: 'Französisch', farbe: '#1565c0', icon: '🥐' },
  { id: 'Klassenrat', farbe: '#00acc1', icon: '🤝' }, { id: 'Sonstiges', farbe: '#757575', icon: '📌' }
];
T.fach = id => T.FAECHER.find(f => f.id === id) || { id, farbe: '#757575', icon: '📁' };

T.HINTERGRUENDE = [
  { id: 'weiss', name: 'Weiß' }, { id: 'kariert', name: 'Kariert' }, { id: 'liniert', name: 'Liniert' },
  { id: 'lineatur', name: 'Schreiblinien' }, { id: 'punkte', name: 'Punkte' }, { id: 'noten', name: 'Notenlinien' },
  { id: 'gruen', name: 'Tafelgrün', dunkel: true }, { id: 'gruenkariert', name: 'Grün kariert', dunkel: true },
  { id: 'schwarz', name: 'Schwarz', dunkel: true }
];
T.isDark = pg => !!(T.HINTERGRUENDE.find(b => b.id === pg.bg) || {}).dunkel;

// ---------- Einstellungen (nur Komfort, keine Tafeldaten) ----------
const OPT_KEY = 'tafelapp.opts';
T.opts = { finger: 'pan', palm: true, druck: 'auto', glatt: 0.45, leisteOben: false, lehrkraft: '' };
try { Object.assign(T.opts, JSON.parse(localStorage.getItem(OPT_KEY) || '{}')); } catch (e) {}
T.saveOpts = () => { try { localStorage.setItem(OPT_KEY, JSON.stringify(T.opts)); } catch (e) {} };

T.S = {
  board: null, page: 0, tool: 'stift',
  farbe: { stift: '#1a1a1a', marker: '#ffe14d' },
  groesse: { stift: 4, marker: 28, radierer: 50 },
  radModus: 'teil', form: 'linie', stiftArt: T.opts.stiftArt === 'kalli' ? 'kalli' : 'normal', inst: [], sel: null, drag: null, dirty: false, file: null
};
T.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
T.newPage = (bg = 'weiss') => ({ bg, items: [], view: { x: 0, y: 0, z: 1 } });
T.newBoard = (lehrkraft, fach, titel) => ({
  app: 'Tafel-App', version: 1, id: T.uid(), lehrkraft, fach, titel, datum: T.today(),
  erstellt: new Date().toISOString(), geaendert: new Date().toISOString(), pages: [T.newPage()]
});
T.page = () => T.S.board.pages[T.S.page];

// ---------- Geometrie ----------
T.distSeg = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = T.clamp(t, 0, 1);
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const bbCache = new WeakMap();
T.bbox = it => {
  let b = bbCache.get(it); if (b) return b;
  if (it.t === 's') {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of it.p) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const m = it.w; b = { x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m };
  } else {
    const c = T.objCorners(it);
    b = { x0: Math.min(...c.map(p => p[0])), y0: Math.min(...c.map(p => p[1])), x1: Math.max(...c.map(p => p[0])), y1: Math.max(...c.map(p => p[1])) };
  }
  bbCache.set(it, b); return b;
};
T.objCorners = o => {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2, a = (o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => { const lx = u * o.w / 2, ly = v * o.h / 2; return [cx + lx * c - ly * s, cy + lx * s + ly * c]; });
};
T.objLocal = (o, x, y) => {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2, a = -(o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const dx = x - cx, dy = y - cy; return [dx * c - dy * s, dx * s + dy * c];
};
T.hitObj = (o, x, y, pad = 0) => { const [lx, ly] = T.objLocal(o, x, y); return Math.abs(lx) <= o.w / 2 + pad && Math.abs(ly) <= o.h / 2 + pad; };
T.hitStroke = (it, x, y, r) => {
  const b = T.bbox(it); if (x < b.x0 - r || x > b.x1 + r || y < b.y0 - r || y > b.y1 + r) return false;
  const p = it.p, rr = r + it.w / 2;
  if (p.length === 1) return Math.hypot(x - p[0][0], y - p[0][1]) <= rr;
  for (let i = 1; i < p.length; i++) if (T.distSeg(x, y, p[i - 1][0], p[i - 1][1], p[i][0], p[i][1]) <= rr) return true;
  return false;
};

// ---------- Strich-Pfade ----------
const halfW = (w, pr) => w * (0.35 + 1.3 * pr) / 2;
function outlinePath(path, pts, w) {
  const n = pts.length;
  if (n === 1 || (n === 2 && Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) < 0.5)) {
    path.arc(pts[0][0], pts[0][1], halfW(w, pts[0][2]), 0, Math.PI * 2); return;
  }
  const L = [], R = [], A = [], H = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const h = halfW(w, pts[i][2]);
    L.push([pts[i][0] - dy * h, pts[i][1] + dx * h]); R.push([pts[i][0] + dy * h, pts[i][1] - dx * h]);
    A.push(Math.atan2(dx, -dy)); H.push(h);
  }
  path.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n - 1; i++) path.quadraticCurveTo(L[i][0], L[i][1], (L[i][0] + L[i + 1][0]) / 2, (L[i][1] + L[i + 1][1]) / 2);
  path.lineTo(L[n - 1][0], L[n - 1][1]);
  path.arc(pts[n - 1][0], pts[n - 1][1], H[n - 1], A[n - 1], A[n - 1] + Math.PI, true);
  for (let i = n - 2; i > 0; i--) path.quadraticCurveTo(R[i][0], R[i][1], (R[i][0] + R[i - 1][0]) / 2, (R[i][1] + R[i - 1][1]) / 2);
  path.lineTo(R[0][0], R[0][1]);
  path.arc(pts[0][0], pts[0][1], H[0], A[0] + Math.PI, A[0], true);
  path.closePath();
}
function polyPath(path, pts, smooth, closed) {
  const n = pts.length; path.moveTo(pts[0][0], pts[0][1]);
  if (n === 1) { path.lineTo(pts[0][0] + 0.01, pts[0][1]); return; }
  if (!smooth || n < 3) { for (let i = 1; i < n; i++) path.lineTo(pts[i][0], pts[i][1]); }
  else {
    for (let i = 1; i < n - 1; i++) path.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
    path.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
  if (closed) path.closePath();
}
// Kalligrafie: breite Feder im festen Winkel – je Abschnitt die konvexe Hülle der Federabdrücke
const NIB = -40 * Math.PI / 180;
function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function kalliPath(path, pts, w) {
  const L = w * 1.3, nx = Math.cos(NIB) * L, ny = Math.sin(NIB) * L, hair = Math.max(0.6, w * 0.09);
  const seg = (a, b) => {
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx = -dy / l * hair; dy = (b[0] - a[0]) / l * hair;
    const h = hull([[a[0] + nx, a[1] + ny], [a[0] - nx, a[1] - ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] + dx, a[1] + dy], [a[0] - dx, a[1] - dy], [b[0] + dx, b[1] + dy], [b[0] - dx, b[1] - dy]]);
    path.moveTo(h[0][0], h[0][1]); for (let i = 1; i < h.length; i++) path.lineTo(h[i][0], h[i][1]); path.closePath();
  };
  if (pts.length === 1) seg(pts[0], [pts[0][0] + 0.5, pts[0][1] + 0.5]);
  for (let i = 1; i < pts.length; i++) seg(pts[i - 1], pts[i]);
}
T.buildPath = it => {
  const p = new Path2D();
  if (it.m === 'kalli') kalliPath(p, it.p, it.w);
  else if (it.m === 'pen') outlinePath(p, it.p, it.w); else polyPath(p, it.p, it.m === 'hl' && !it.g, it.closed);
  return p;
};
const pathCache = new WeakMap();
T.strokePath = it => { let p = pathCache.get(it); if (!p) { p = T.buildPath(it); pathCache.set(it, p); } return p; };

T.inkColor = (c, dark) => {
  if (dark && (c === '#1a1a1a' || c === '#000000')) return '#f4f4f0';
  if (!dark && (c === '#ffffff' || c === '#f4f4f0')) return '#1a1a1a';
  return c;
};
T.drawStroke = (ctx, it, dark, path) => {
  path = path || T.strokePath(it);
  const col = T.inkColor(it.c, dark);
  if (it.m === 'pen' || it.m === 'kalli') { ctx.fillStyle = col; ctx.fill(path); }
  else {
    ctx.save();
    if (it.m === 'hl') { ctx.globalAlpha = dark ? 0.42 : 0.5; if (!dark) ctx.globalCompositeOperation = 'multiply'; }
    ctx.strokeStyle = col; ctx.lineWidth = it.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(path);
    ctx.restore();
  }
  if (it.arrow && it.p.length > 1) {
    const b = it.p[it.p.length - 1]; let a = it.p[0];
    for (let i = it.p.length - 2; i >= 0; i--) if (Math.hypot(b[0] - it.p[i][0], b[1] - it.p[i][1]) > 2) { a = it.p[i]; break; }
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.max(16, it.w * 4.5), sp = 0.45;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(b[0] + Math.cos(ang) * it.w * 0.6, b[1] + Math.sin(ang) * it.w * 0.6);
    ctx.lineTo(b[0] - L * Math.cos(ang - sp), b[1] - L * Math.sin(ang - sp));
    ctx.lineTo(b[0] - L * Math.cos(ang + sp), b[1] - L * Math.sin(ang + sp)); ctx.closePath(); ctx.fill();
  }
};

// ---------- Hintergrund ----------
const BGFARBE = { gruen: '#2d5a3d', gruenkariert: '#2d5a3d', schwarz: '#1f2328' };
// Abstände in Millimetern (pro Seite änderbar über page.abstand); 1 mm = 4 Weltpixel
T.ABSTAND = {
  kariert: { std: 20, opts: [5, 10, 15, 20, 25, 30], l: 'Kästchengröße' }, gruenkariert: { std: 20, opts: [10, 15, 20, 25, 30], l: 'Kästchengröße' },
  liniert: { std: 20, opts: [9, 12, 15, 20, 25, 30], l: 'Linienabstand' }, lineatur: { std: 15, opts: [5, 7, 10, 15, 20], l: 'Höhe Mittelband' },
  punkte: { std: 20, opts: [10, 15, 20, 25, 30], l: 'Punktabstand' }, noten: { std: 5, opts: [2.5, 3.5, 5, 7], l: 'Linienabstand' }
};
T.gridPx = pg => (pg.bg === 'kariert' || pg.bg === 'gruenkariert') ? (pg.abstand || T.ABSTAND[pg.bg].std) * 4 : null;
function paintBg(ctx, bg, r, px, abstand) {
  const mm = ((T.ABSTAND[bg] && (abstand || T.ABSTAND[bg].std)) || 10) * 4;
  ctx.fillStyle = BGFARBE[bg] || '#ffffff';
  ctx.fillRect(r.x0 - 2, r.y0 - 2, r.x1 - r.x0 + 4, r.y1 - r.y0 + 4);
  const lw = Math.max(px, 0.6);
  const hlines = (step, off, col, w) => {
    if (step / px < 4) return;
    ctx.beginPath(); for (let y = Math.floor((r.y0 - off) / step) * step + off; y <= r.y1; y += step) { ctx.moveTo(r.x0, y); ctx.lineTo(r.x1, y); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  const vlines = (step, col, w) => {
    if (step / px < 4) return;
    ctx.beginPath(); for (let x = Math.floor(r.x0 / step) * step; x <= r.x1; x += step) { ctx.moveTo(x, r.y0); ctx.lineTo(x, r.y1); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  };
  switch (bg) {
    case 'kariert': hlines(mm, 0, '#bcd2e6', lw); vlines(mm, '#bcd2e6', lw); break;
    case 'gruenkariert': hlines(mm, 0, 'rgba(255,255,255,.2)', lw); vlines(mm, 'rgba(255,255,255,.2)', lw); break;
    case 'liniert': hlines(mm, 0, '#a9c4dc', lw * 1.2); break;
    case 'lineatur': { // Grundschul-/Förderlineatur: Ober-, Mittel-, Grund-, Unterlinie; z = Höhe des Mittelbands
      const z = mm, p = z * 4;
      hlines(p, 0, '#c9d6e3', lw); hlines(p, z, '#7fa3c4', lw * 1.3); hlines(p, 2 * z, '#7fa3c4', lw * 1.3); hlines(p, 3 * z, '#c9d6e3', lw);
      if (z / px >= 4) { ctx.fillStyle = 'rgba(120,170,220,.08)'; for (let y = Math.floor(r.y0 / p) * p + z; y <= r.y1; y += p) ctx.fillRect(r.x0, y, r.x1 - r.x0, z); }
      break;
    }
    case 'punkte': {
      const st = mm; if (st / px < 6) break; ctx.fillStyle = '#9fb3c8';
      const d = Math.max(1.6, 1.6 * px);
      for (let x = Math.floor(r.x0 / st) * st; x <= r.x1; x += st) for (let y = Math.floor(r.y0 / st) * st; y <= r.y1; y += st) ctx.fillRect(x - d / 2, y - d / 2, d, d);
      break;
    }
    case 'noten':
      for (let k = 0; k < 5; k++) hlines(mm * 11, mm * 3 + k * mm, '#777', lw * 1.1); // System = 4 Abstände, dazwischen Platz
      break;
  }
}

// ---------- Seite malen ----------
T.paintPage = (ctx, pg, rect, px, o = {}) => {
  paintBg(ctx, pg.bg, rect, px, pg.abstand);
  const dark = T.isDark(pg), S = T.S;
  const drag = !o.export && S.drag && S.sel ? S.drag : null;
  const vis = it => { const b = T.bbox(it); return !(b.x1 < rect.x0 || b.x0 > rect.x1 || b.y1 < rect.y0 || b.y0 > rect.y1); };
  const each = (filter, fn) => {
    for (const it of pg.items) {
      if (!filter(it)) continue;
      const moved = drag && (S.sel.ids.has(it.id) || (S.dragMit && S.dragMit.has(it.id)));
      if (!moved && !vis(it)) continue;
      if (moved) { ctx.save(); ctx.translate(drag.dx, drag.dy); fn(it); ctx.restore(); } else fn(it);
    }
  };
  each(it => it.t === 'o', it => T.drawObj(ctx, it, dark, px));
  each(it => it.t === 's' && it.m === 'hl', it => T.drawStroke(ctx, it, dark));
  each(it => it.t === 's' && it.m !== 'hl', it => T.drawStroke(ctx, it, dark));
  each(it => it.t === 'o' && it.k === 'abdeckung', it => T.drawObj(ctx, it, dark, px)); // Abdeckung liegt über allem
};

// ---------- Leinwände & Rendern ----------
const cv = T.cv = {};
T.initCanvas = () => {
  for (const id of ['cMain', 'cLive', 'cOver']) { cv[id] = document.getElementById(id); cv[id + 'X'] = cv[id].getContext('2d'); }
  resize(); addEventListener('resize', resize);
};
function resize() {
  T.dpr = devicePixelRatio || 1; T.W = innerWidth; T.H = innerHeight;
  for (const id of ['cMain', 'cLive', 'cOver']) { cv[id].width = Math.round(T.W * T.dpr); cv[id].height = Math.round(T.H * T.dpr); }
  T.render(); T.renderLive(); T.renderOver();
}
const need = { main: false, live: false, over: false }; let raf = 0;
const req = k => { need[k] = true; if (!raf) raf = requestAnimationFrame(frame); };
T.render = () => req('main'); T.renderLive = () => req('live'); T.renderOver = () => req('over');
// T.ox: Breite der Seitenleiste links – die Tafel beginnt dann rechts davon (geteiltes Fenster)
T.ox = 0;
T.viewRect = () => { const v = T.page().view; return { x0: -v.x / v.z, y0: -v.y / v.z, x1: (T.W - T.ox - v.x) / v.z, y1: (T.H - v.y) / v.z }; };
T.setViewTf = ctx => { const v = T.page().view, d = T.dpr; ctx.setTransform(d * v.z, 0, 0, d * v.z, d * (v.x + T.ox), d * v.y); };
function frame() {
  raf = 0; if (!T.S.board) return;
  const n = { ...need }; need.main = need.live = need.over = false;
  if (n.main) { const ctx = cv.cMainX; T.setViewTf(ctx); T.paintPage(ctx, T.page(), T.viewRect(), 1 / T.page().view.z); }
  if (n.live) {
    const ctx = cv.cLiveX; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.cLive.width, cv.cLive.height);
    if (T.live && T.live.p.length) { T.setViewTf(ctx); T.drawStroke(ctx, T.live, T.isDark(T.page()), T.buildPath(T.live)); }
  }
  if (n.over && T.drawOverlay) T.drawOverlay();
}

// ---------- Verlauf (Rückgängig/Wiederholen) ----------
T.hist = { u: [], r: [] };
const capture = () => ({ page: T.S.page, pages: T.S.board.pages.map(p => ({ ...p, items: p.items.slice() })) });
T.snap = () => {
  T.hist.u.push(capture()); if (T.hist.u.length > 200) T.hist.u.shift();
  T.hist.r.length = 0; T.changed();
};
function restore(s) {
  T.S.board.pages = s.pages.map(p => ({ ...p, items: p.items.slice() }));
  T.S.page = Math.min(s.page, T.S.board.pages.length - 1); T.S.sel = null; T.S.drag = null;
  T.changed(); T.render(); T.renderOver(); T.onPage && T.onPage();
}
T.undo = () => { if (!T.hist.u.length) return; T.hist.r.push(capture()); restore(T.hist.u.pop()); };
T.redo = () => { if (!T.hist.r.length) return; T.hist.u.push(capture()); restore(T.hist.r.pop()); };
T.changed = () => { T.S.dirty = true; if (T.S.board) T.S.board.geaendert = new Date().toISOString(); T.onChange && T.onChange(); };

T.addItem = it => { it.id = it.id || T.uid(); T.page().items.push(it); T.render(); return it; };
T.replaceItem = it => { const a = T.page().items, i = a.findIndex(x => x.id === it.id); if (i >= 0) a[i] = it; T.render(); };

// ---------- Radieren ----------
function densify(pts, step) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(d / step);
    for (let k = 1; k <= n; k++) { const t = k / (n + 1); out.push([T.r1(a[0] + (b[0] - a[0]) * t), T.r1(a[1] + (b[1] - a[1]) * t), a[2] + (b[2] - a[2]) * t]); }
    out.push(b);
  }
  return out;
}
T.eraseAt = (items, x, y, r, whole) => {
  let changed = false; const out = [];
  for (const it of items) {
    if (it.t !== 's' || !T.hitStroke(it, x, y, r)) { out.push(it); continue; }
    const pts = densify(it.p, Math.max(1.5, r / 4)), rr = r + it.w * 0.3;
    if (!whole && !pts.some(p => Math.hypot(p[0] - x, p[1] - y) <= rr)) { out.push(it); continue; }
    changed = true; if (whole) continue;
    let run = [];
    const flush = arrow => { if (run.length >= 2 || (run.length === 1 && it.m === 'pen')) out.push({ ...it, id: T.uid(), p: run, closed: false, arrow }); run = []; };
    for (const p of pts) { if (Math.hypot(p[0] - x, p[1] - y) <= rr) flush(false); else run.push(p); }
    flush(!!it.arrow);
  }
  return changed ? out : null;
};

// ---------- Ansicht ----------
T.zoomAt = (sx, sy, f) => {
  sx -= T.ox; const v = T.page().view, z = T.clamp(v.z * f, 0.03, 8), wx = (sx - v.x) / v.z, wy = (sy - v.y) / v.z;
  v.z = z; v.x = sx - wx * z; v.y = sy - wy * z; T.render(); T.renderOver(); T.onZoom && T.onZoom();
};
T.resetView = () => { const v = T.page().view; v.x = 0; v.y = 0; v.z = 1; T.render(); T.renderOver(); T.onZoom && T.onZoom(); };
T.viewCenter = () => { const r = T.viewRect(); return [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2]; };
})();
