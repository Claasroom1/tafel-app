// Tafel-App – Eingabe: Stift, Finger, Maus (Pointer Events)
'use strict';
(function () {
const S = T.S, PI = Math.PI;
const ptrs = new Map();
let cvs;
const view = () => T.page().view;
const world = (sx, sy) => { const v = view(); return [(sx - T.ox - v.x) / v.z, (sy - v.y) / v.z]; };
const px = () => 1 / view().z;

T.initInput = () => {
  cvs = document.getElementById('cOver');
  cvs.style.pointerEvents = 'auto';
  cvs.addEventListener('pointerdown', down);
  cvs.addEventListener('pointermove', move);
  cvs.addEventListener('pointerup', up);
  cvs.addEventListener('pointercancel', cancel);
  cvs.addEventListener('lostpointercapture', e => { if (ptrs.has(e.pointerId)) cancel(e); });
  cvs.addEventListener('contextmenu', e => e.preventDefault());
  cvs.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey) T.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0025));
    else { const v = view(); v.x -= e.shiftKey ? e.deltaY : e.deltaX; v.y -= e.shiftKey ? 0 : e.deltaY; T.render(); T.renderOver(); }
  }, { passive: false });
  // Hover-Anzeige für den Radierer
  cvs.addEventListener('pointerleave', () => { if (T.overlay.cursor && !ptrs.size) { T.overlay.cursor = null; T.renderOver(); } });
};

function down(e) {
  if (!S.board) return;
  e.preventDefault();
  T.closePops && T.closePops();
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  try { cvs.setPointerCapture(e.pointerId); } catch (x) {}
  T.onPointerInfo && T.onPointerInfo(e);
  const P = { id: e.pointerId, type: e.pointerType, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, t0: performance.now(), h: null };
  ptrs.set(e.pointerId, P);
  const [wx, wy] = world(e.clientX, e.clientY);

  // zweiter Finger → Geste (Zoomen/Verschieben bzw. Werkzeug drehen)
  if (P.type === 'touch') {
    const others = [...ptrs.values()].filter(q => q !== P && q.type === 'touch');
    if (others.length === 1) {
      const A = others[0];
      if (A.h && A.h.kind === 'stroke' && performance.now() - A.t0 > 400) { P.h = idle(); return; } // es wird gerade geschrieben
      if (A.h && A.h.cancel) A.h.cancel();
      const I = A.h && A.h.inst;
      const g = I && I.kind !== 'zirkel' ? twoFingerInst(I, A, P) : pinch(A, P);
      A.h = g; P.h = g; return;
    }
    if (others.length > 1) { P.h = idle(); return; }
  }
  P.h = choose(P, e, wx, wy);
}
function move(e) {
  const P = ptrs.get(e.pointerId);
  if (!P) { hover(e); return; }
  P.x = e.clientX; P.y = e.clientY;
  if (P.h && P.h.move) P.h.move(P, e);
}
function up(e) {
  const P = ptrs.get(e.pointerId); if (!P) return;
  P.x = e.clientX; P.y = e.clientY; ptrs.delete(e.pointerId);
  if (P.h && P.h.up) P.h.up(P, e);
}
function cancel(e) {
  const P = ptrs.get(e.pointerId); if (!P) return; ptrs.delete(e.pointerId);
  if (P.h && P.h.cancel) P.h.cancel(P); else if (P.h && P.h.up) P.h.up(P, e);
}
function hover(e) {
  if (S.tool === 'radierer' && e.pointerType !== 'touch') {
    const [x, y] = world(e.clientX, e.clientY); T.overlay.cursor = { x, y, r: S.groesse.radierer / 2 * px() }; T.renderOver();
  }
}
const idle = () => ({ kind: 'idle' });

function choose(P, e, wx, wy) {
  const isTouch = P.type === 'touch';
  // Radierer am Stift (Rückseite oder Taste)
  if (P.type === 'pen' && (e.button === 5 || (e.buttons & 32) || e.button === 2)) return erase(P, e);
  if (P.type === 'mouse' && (e.button === 1 || e.button === 2)) return pan(P);
  if (isTouch && T.opts.palm && e.width * e.height >= 45 * 45 && e.width > 0) return erase(P, e, Math.max(e.width, e.height) * 1.2);

  const treatAsPen = !isTouch || T.opts.finger === 'schreiben';
  // Werkzeuge (Lineal usw.)
  const ih = T.instHit(wx, wy, px());
  if (treatAsPen && (S.tool === 'stift' || S.tool === 'marker')) {
    const ed = T.findEdge(wx, wy, 28 * px());
    if (ed && (!ih || ih.part === 'body')) return ruled(P, ed);
  }
  if (ih) return instAction(P, ih, wx, wy);
  // Auswahl-Griffe
  const sh = selHit(wx, wy); if (sh) return sh(P);
  // Übungen: Kärtchen ziehen, Multiple-Choice-Kärtchen und Knöpfe antippen – mit Finger und Stift, egal welches Werkzeug
  const uo = topObjAt(wx, wy);
  if (uo && uo.d && S.tool !== 'radierer' && (uo.k === 'uknopf' || (uo.k === 'ukarte' && (uo.d.mc || uo.d.ziehbar)))) return uebungGriff(P, uo, wx, wy);

  if (isTouch && T.opts.finger !== 'schreiben') {
    const o = topObjAt(wx, wy);
    if (o) { const war = !!(S.sel && S.sel.ids.size === 1 && S.sel.ids.has(o.id)); if (!war) select([o.id]); return moveSel(P, wx, wy, o, war); }
    if (T.opts.finger === 'radieren') return erase(P, e);
    return pan(P);
  }
  if (S.tool !== 'auswahl' && S.sel) { S.sel = null; T.renderOver(); }
  switch (S.tool) {
    case 'stift': case 'marker': return stroke(P, e);
    case 'radierer': return erase(P, e);
    case 'auswahl': return selectDown(P, wx, wy);
    case 'hand': return pan(P);
    case 'form': return shape(P, wx, wy);
    case 'stempel': return { up(Q) { // Stempel setzen (Emoji als Text-Element, Größe unabhängig vom Zoom)
      if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 12 || !S.stempel) return;
      const d = { text: S.stempel, size: Math.round((S.stempelGr || 110) / view().z), c: '#1a1a1a', fett: false }, m = T.textMetrics(d);
      T.snap(); T.addItem({ t: 'o', k: 'text', d, x: wx - m.w / 2, y: wy - m.h / 2, w: m.w, h: m.h, r: 0 });
    } };
    case 'text': return { up(Q) { if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 12) T.textDialog && T.textDialog(null, wx, wy); } };
  }
  return idle();
}

// ---------- Freihand-Strich ----------
function stroke(P, e) {
  const tool = S.tool === 'marker' ? 'marker' : 'stift', hl = tool === 'marker';
  const live = { t: 's', m: hl ? 'hl' : S.stiftArt === 'kalli' ? 'kalli' : 'pen', c: S.farbe[tool], w: S.groesse[tool], p: [] };
  let last = null, pr = 0.55, real = false, lastS = null;
  const add = ev => {
    const [x, y] = world(ev.clientX, ev.clientY);
    let p = 0.5;
    if (!hl && T.opts.druck !== 'aus') {
      if (ev.pointerType === 'pen' && ev.pressure > 0 && (real || ev.pressure !== 0.5)) { real = true; pr += (ev.pressure - pr) * 0.5; }
      else if (T.opts.druck === 'auto') {
        const sp = lastS ? Math.hypot(ev.clientX - lastS[0], ev.clientY - lastS[1]) : 0;
        pr += (T.clamp(0.85 - sp / 45, 0.3, 0.85) - pr) * 0.25;
      }
      p = pr;
    }
    lastS = [ev.clientX, ev.clientY];
    if (!last) { last = [x, y]; live.p.push([T.r1(x), T.r1(y), T.r2(p)]); return; }
    const k = T.clamp(T.opts.glatt, 0, 0.85);
    const nx = last[0] + (x - last[0]) * (1 - k), ny = last[1] + (y - last[1]) * (1 - k);
    if (Math.hypot(nx - last[0], ny - last[1]) * view().z < 1.1) return;
    last = [nx, ny]; live.p.push([T.r1(nx), T.r1(ny), T.r2(p)]);
  };
  add(e); T.live = live; T.renderLive();
  const evs = ev => { const c = ev.getCoalescedEvents ? ev.getCoalescedEvents() : []; return c.length ? c : [ev]; };
  return {
    kind: 'stroke',
    move(Q, ev) { for (const c of evs(ev)) add(c); T.renderLive(); },
    up(Q, ev) {
      const [x, y] = world(ev.clientX, ev.clientY), lp = live.p[live.p.length - 1];
      if (lp && Math.hypot(x - lp[0], y - lp[1]) > 0.8) live.p.push([T.r1(x), T.r1(y), lp[2]]);
      T.live = null; T.renderLive();
      if (live.p.length) { T.snap(); T.addItem(live); }
    },
    cancel() { T.live = null; T.renderLive(); }
  };
}

// ---------- Am Lineal/Geodreieck entlang ----------
function ruled(P, ed) {
  const { I, e } = ed, tool = S.tool === 'marker' ? 'marker' : 'stift';
  const live = { t: 's', m: tool === 'marker' ? 'hl' : 'line', g: 1, c: S.farbe[tool], w: S.groesse[tool], p: [] };
  const [wx, wy] = world(P.x, P.y);
  let t0 = T.edgeParam(I, e, wx, wy), tmin = t0, tmax = t0, tlast = t0;
  const arc = e.t === 'c';
  const upd = () => {
    if (!arc) { const a = T.edgePoint(I, e, tmin), b = T.edgePoint(I, e, tmax); live.p = [[T.r1(a[0]), T.r1(a[1]), .5], [T.r1(b[0]), T.r1(b[1]), .5]]; }
    const len = arc ? Math.abs(tmax - tmin) * 180 / PI : (tmax - tmin) * T.edgeLen(e) / T.CM;
    const pt = T.edgePoint(I, e, tlast);
    T.overlay.label = { x: pt[0], y: pt[1], t: arc ? Math.round(len) + '°' : T.zahl(len, 1) + ' cm' };
    T.live = live; T.renderLive(); T.renderOver();
  };
  if (arc) { const p = T.edgePoint(I, e, t0); live.p.push([T.r1(p[0]), T.r1(p[1]), .5]); }
  upd();
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y), t = T.edgeParam(I, e, x, y);
      if (arc) {
        const step = Math.sign(t - tlast) * PI / 360;
        if (step) for (let a = tlast + step; Math.abs(t - a) >= PI / 360 * 0.99 && Math.sign(t - a) === Math.sign(step); a += step) { const p = T.edgePoint(I, e, a); live.p.push([T.r1(p[0]), T.r1(p[1]), .5]); }
        const p = T.edgePoint(I, e, t); live.p.push([T.r1(p[0]), T.r1(p[1]), .5]);
      }
      tlast = t; tmin = Math.min(tmin, t); tmax = Math.max(tmax, t); upd();
    },
    up() {
      T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver();
      const big = arc ? tmax - tmin > 0.004 : (tmax - tmin) * T.edgeLen(e) > 2;
      if (big) { T.snap(); T.addItem(live); }
    },
    cancel() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); }
  };
}

// ---------- Werkzeug bewegen/drehen, Zirkel ----------
function instAction(P, ih, wx, wy) {
  const I = ih.I;
  if (ih.part === 'close') return { up() { const i = S.inst.indexOf(I); if (i >= 0) S.inst.splice(i, 1); T.renderOver(); T.onInst && T.onInst(); } };
  if (ih.part === 'kreis') return { up() { zirkelArc(I, I.a, I.a + 2 * PI, true); } };
  if (ih.part === 'move') {
    const x0 = I.x, y0 = I.y;
    return { inst: I, move(Q) { const [x, y] = world(Q.x, Q.y); I.x = x0 + x - wx; I.y = y0 + y - wy; T.renderOver(); } };
  }
  if (ih.part === 'radius') {
    return { inst: I, move(Q) { const [x, y] = world(Q.x, Q.y); I.r = Math.max(8, Math.round(Math.hypot(x - I.x, y - I.y) / 2) * 2); I.a = Math.atan2(y - I.y, x - I.x); T.renderOver(); } };
  }
  if (ih.part === 'dreh') { // Zirkel drehen → Kreisbogen zeichnen
    const a0 = I.a, p0 = Math.atan2(wy - I.y, wx - I.x);
    let prev = p0, acc = 0;
    const live = { t: 's', m: 'line', g: 1, c: S.farbe.stift, w: S.groesse.stift, p: [] };
    const pt = a => [T.r1(I.x + I.r * Math.cos(a)), T.r1(I.y + I.r * Math.sin(a)), .5];
    live.p.push(pt(a0)); T.live = live;
    return {
      inst: I,
      move(Q) {
        const [x, y] = world(Q.x, Q.y), cur = Math.atan2(y - I.y, x - I.x);
        let d = cur - prev; while (d > PI) d -= 2 * PI; while (d < -PI) d += 2 * PI; prev = cur;
        const n = Math.ceil(Math.abs(d) / (PI / 180));
        for (let k = 1; k <= n; k++) live.p.push(pt(a0 + acc + d * k / n));
        acc += d; I.a = a0 + acc;
        T.overlay.label = { x: I.x, y: I.y, t: Math.round(Math.abs(acc) * 180 / PI) + '°' };
        T.renderLive(); T.renderOver();
      },
      up() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); if (Math.abs(acc) > PI / 180) { T.snap(); T.addItem(live); } },
      cancel() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); }
    };
  }
  const D = T.INSTR[I.kind];
  if (ih.part === 'knob') {
    const [lx, ly] = T.toLocal(I, wx, wy), off = Math.atan2(D.knob[1] - D.center[1], D.knob[0] - D.center[0]);
    void lx; void ly; let moved = false;
    return {
      inst: I,
      move(Q) {
        if (!moved && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 8) return; moved = true;
        const [x, y] = world(Q.x, Q.y), [cx, cy] = T.toWorld(I, D.center[0], D.center[1]);
        T.setAngleAbout(I, T.snapAngle(Math.atan2(y - cy, x - cx) - off), D.center[0], D.center[1]); T.renderOver();
      },
      up() { if (!moved && T.angleDialog) T.angleDialog(I); }
    };
  }
  // Körper verschieben
  const x0 = I.x, y0 = I.y;
  return { inst: I, move(Q) { const [x, y] = world(Q.x, Q.y); I.x = x0 + x - wx; I.y = y0 + y - wy; T.renderOver(); } };
}
function zirkelArc(I, a0, a1) {
  const n = 180, p = [];
  for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; p.push([T.r1(I.x + I.r * Math.cos(a)), T.r1(I.y + I.r * Math.sin(a)), .5]); }
  T.snap(); T.addItem({ t: 's', m: 'line', g: 1, c: S.farbe.stift, w: S.groesse.stift, p, closed: true });
}

function twoFingerInst(I, A, B) {
  const ang = () => Math.atan2(B.y - A.y, B.x - A.x), mid = () => world((A.x + B.x) / 2, (A.y + B.y) / 2);
  const dist = () => Math.hypot(B.x - A.x, B.y - A.y) || 1;
  const g0 = ang(), a0 = I.a, s0 = I.s || 1, d0 = dist(), [mx, my] = mid(), L = T.toLocal(I, mx, my);
  return {
    kind: 'gesture', inst: I,
    move() { // zwei Finger: drehen, verschieben und vergrößern/verkleinern
      const [x, y] = mid();
      I.a = T.snapAngle(a0 + ang() - g0); let k = s0 * dist() / d0; if (Math.abs(k - 1) < 0.06) k = 1; I.s = T.clamp(k, 0.5, 4);
      const c = Math.cos(I.a), s = Math.sin(I.a);
      I.x = x - (L[0] * c - L[1] * s) * I.s; I.y = y - (L[0] * s + L[1] * c) * I.s; T.renderOver();
    },
    up(Q) { const other = Q === A ? B : A; other.h = idle(); }
  };
}
function pinch(A, B) {
  const v = view(), d0 = Math.hypot(B.x - A.x, B.y - A.y) || 1, z0 = v.z;
  const c0 = [(A.x + B.x) / 2 - T.ox, (A.y + B.y) / 2], w0 = [(c0[0] - v.x) / v.z, (c0[1] - v.y) / v.z];
  return {
    kind: 'gesture',
    move() {
      const d = Math.hypot(B.x - A.x, B.y - A.y), c = [(A.x + B.x) / 2 - T.ox, (A.y + B.y) / 2];
      v.z = T.clamp(z0 * d / d0, 0.03, 8); v.x = c[0] - w0[0] * v.z; v.y = c[1] - w0[1] * v.z;
      T.render(); T.renderOver(); T.onZoom && T.onZoom();
    },
    up(Q) { const other = Q === A ? B : A; other.h = pan(other); }
  };
}
function pan(P) {
  const v = view(), x0 = v.x, y0 = v.y, sx = P.x, sy = P.y;
  return { kind: 'pan', move(Q) { v.x = x0 + Q.x - sx; v.y = y0 + Q.y - sy; T.render(); T.renderOver(); } };
}

// ---------- Radierer ----------
function erase(P, e, diam) {
  let snapped = false, last = null;
  const r = () => (diam || S.groesse.radierer) / 2 * px();
  const at = (x, y) => {
    const res = T.eraseAt(T.page().items, x, y, r(), S.radModus === 'strich');
    if (res) { if (!snapped) { T.snap(); snapped = true; } T.page().items = res; T.render(); }
  };
  const go = Q => {
    const [x, y] = world(Q.x, Q.y);
    if (last) { const d = Math.hypot(x - last[0], y - last[1]), n = Math.ceil(d / (r() / 2)); for (let k = 1; k <= n; k++) at(last[0] + (x - last[0]) * k / n, last[1] + (y - last[1]) * k / n); }
    else at(x, y);
    last = [x, y]; T.overlay.cursor = { x, y, r: r() }; T.renderOver();
  };
  go(P);
  return { kind: 'erase', move: go, up() { T.overlay.cursor = null; T.renderOver(); }, cancel() { T.overlay.cursor = null; T.renderOver(); } };
}

// ---------- Formen ----------
function shape(P, ax, ay) {
  const live = { t: 's', m: 'line', g: 1, c: S.farbe.stift, w: S.groesse.stift, p: [], arrow: S.form === 'pfeil' };
  const build = (bx, by) => {
    const f = S.form, q = (x, y) => [T.r1(x), T.r1(y), .5];
    if (f === 'linie' || f === 'pfeil') {
      const d = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax), s = T.snapAngle(a);
      if (Math.abs(s - a) < 4 * PI / 180 && Math.round(s * 180 / PI) % 45 === 0) { bx = ax + d * Math.cos(s); by = ay + d * Math.sin(s); }
      live.p = [q(ax, ay), q(bx, by)];
      T.overlay.label = { x: bx, y: by, t: T.zahl(d / T.CM, 1) + ' cm' };
    } else if (f === 'rechteck') { live.p = [q(ax, ay), q(bx, ay), q(bx, by), q(ax, by)]; live.closed = true; }
    else if (f === 'ellipse') {
      const cx = (ax + bx) / 2, cy = (ay + by) / 2, rx = Math.abs(bx - ax) / 2, ry = Math.abs(by - ay) / 2; live.p = [];
      for (let k = 0; k < 96; k++) { const a = k / 96 * 2 * PI; live.p.push(q(cx + rx * Math.cos(a), cy + ry * Math.sin(a))); }
      live.closed = true;
    } else if (f === 'kreis') { // Mittelpunkt antippen, zum Radius ziehen
      const r = Math.hypot(bx - ax, by - ay); live.p = [];
      for (let k = 0; k < 120; k++) { const a = k / 120 * 2 * PI; live.p.push(q(ax + r * Math.cos(a), ay + r * Math.sin(a))); }
      live.closed = true; T.overlay.label = { x: bx, y: by, t: 'r = ' + T.zahl(r / T.CM, 1) + ' cm' };
    } else if (f === 'dreieck') { live.p = [q((ax + bx) / 2, ay), q(bx, by), q(ax, by)]; live.closed = true; }
    T.live = live; T.renderLive(); T.renderOver();
  };
  build(ax, ay);
  return {
    move(Q) { const [x, y] = world(Q.x, Q.y); build(x, y); },
    up(Q) {
      const [x, y] = world(Q.x, Q.y); T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver();
      if (Math.hypot(x - ax, y - ay) > 4) { T.snap(); T.addItem(live); }
    },
    cancel() { T.live = null; T.overlay.label = null; T.renderLive(); T.renderOver(); }
  };
}

function uebungGriff(P, o, wx, wy) {
  let bewegt = false; const x0 = o.x, y0 = o.y;
  return {
    move(Q) {
      if (!o.d.ziehbar || (!bewegt && Math.hypot(Q.x - Q.sx, Q.y - Q.sy) < 6)) return;
      if (!bewegt) { T.snap(); bewegt = true; const pg = T.page(); pg.items = pg.items.filter(i => i.id !== o.id).concat([o]); } // Kärtchen nach vorne holen
      const [x, y] = world(Q.x, Q.y); T.replaceItem({ ...o, x: x0 + x - wx, y: y0 + y - wy, d: o.d.status ? { ...o.d, status: null } : o.d });
    },
    up() {
      if (bewegt) { T.uebungEinrasten(T.page().items.find(i => i.id === o.id)); T.render(); return; }
      if (o.k === 'uknopf') T.uebungAktion(o);
      else if (o.d.mc) { T.snap(); T.replaceItem({ ...o, d: { ...o.d, gewaehlt: !o.d.gewaehlt, status: null } }); }
    }
  };
}

// ---------- Auswahl ----------
function topObjAt(x, y) {
  const it = T.page().items;
  for (let i = it.length - 1; i >= 0; i--) if (it[i].t === 'o' && it[i].k === 'abdeckung' && T.hitObj(it[i], x, y)) return it[i];
  for (let i = it.length - 1; i >= 0; i--) if (it[i].t === 'o' && T.hitObj(it[i], x, y)) return it[i];
  return null;
}
function itemAt(x, y) {
  const it = T.page().items, r = 10 * px();
  for (let i = it.length - 1; i >= 0; i--) if (it[i].t === 's' && T.hitStroke(it[i], x, y, r)) return it[i];
  return topObjAt(x, y);
}
function select(ids) { S.sel = { ids: new Set(ids) }; S.teil = null; T.renderOver(); }
T.select = select;

function selHit(x, y) {
  const sb = T.selBounds(); if (!sb) return null;
  const p = px(), hr = 26 * p;
  if (sb.obj) {
    const o = sb.obj, h = T.objHandles(o, p);
    if (Math.hypot(x - h.scale[0], y - h.scale[1]) <= hr) return P => scaleObj(P, o);
    if (Math.hypot(x - h.rot[0], y - h.rot[1]) <= hr) return P => rotObj(P, o);
    if (T.hitObj(o, x, y)) return P => moveSel(P, x, y, o, true);
  } else if (x >= sb.x0 && x <= sb.x1 && y >= sb.y0 && y <= sb.y1) return P => moveSel(P, x, y);
  return null;
}
let lastTap = { id: null, t: 0 };
function moveSel(P, wx, wy, single, warSchon) {
  S.drag = { dx: 0, dy: 0 }; let moved = false;
  // Handschrift, die auf einem Baustein steht, wandert beim Verschieben mit
  S.dragMit = null;
  if (single && single.k !== 'abdeckung' && single.k !== 'text') {
    const ob = T.bbox(single), mit = T.page().items.filter(it => { if (it.t !== 's' || S.sel.ids.has(it.id)) return false; const b = T.bbox(it); return b.x0 >= ob.x0 - 4 && b.x1 <= ob.x1 + 4 && b.y0 >= ob.y0 - 4 && b.y1 <= ob.y1 + 4; });
    if (mit.length) S.dragMit = new Set(mit.map(it => it.id));
  }
  const mitDabei = it => S.sel.ids.has(it.id) || (S.dragMit && S.dragMit.has(it.id));
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y); S.drag.dx = x - wx; S.drag.dy = y - wy;
      if (Math.hypot(Q.x - Q.sx, Q.y - Q.sy) > 4) moved = true;
      T.render(); T.renderOver();
    },
    up() {
      const { dx, dy } = S.drag; S.drag = null;
      if (moved && (dx || dy)) {
        T.snap(); const pg = T.page(), g = T.gridPx(pg);
        const rast = (it, x, y) => { const k = g || (it.d && it.d.karo); return k && it.k === 'text' && it.d.karo ? [Math.round(x / k) * k, Math.round(y / k) * k] : [x, y]; }; // Kästchenschrift rastet ein
        pg.items = pg.items.map(it => { if (!mitDabei(it)) return it;
          if (it.t === 's') return { ...it, p: it.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]) };
          const [x, y] = rast(it, it.x + dx, it.y + dy); return { ...it, x, y }; });
      } else if (single) {
        const now = performance.now();
        if (lastTap.id === single.id && now - lastTap.t < 450) T.editObj && T.editObj(single);
        else if (warSchon && T.teilAt) { // bereits gewählter Baustein: einzelnes Feld antippen → Feld-Menü
          const id = T.teilAt(single, wx, wy);
          S.teil = id != null && !(S.teil && S.teil.oid === single.id && S.teil.id === id) ? { oid: single.id, id } : null;
          T.onSelChange && T.onSelChange();
        }
        lastTap = { id: single.id, t: now };
      }
      S.dragMit = null; T.render(); T.renderOver();
    },
    cancel() { S.drag = null; S.dragMit = null; T.render(); T.renderOver(); }
  };
}
function scaleObj(P, o) {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2, [wx, wy] = world(P.x, P.y), d0 = Math.hypot(wx - cx, wy - cy) || 1;
  let snapped = false;
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y), f = Math.max(Math.hypot(x - cx, y - cy) / d0, 30 / Math.min(o.w, o.h));
      if (!snapped) { T.snap(); snapped = true; }
      const w = o.w * f, h = o.h * f; T.replaceItem({ ...o, x: cx - w / 2, y: cy - h / 2, w, h }); T.renderOver();
    }
  };
}
function rotObj(P, o) {
  const cx = o.x + o.w / 2, cy = o.y + o.h / 2; let snapped = false;
  return {
    move(Q) {
      const [x, y] = world(Q.x, Q.y); if (!snapped) { T.snap(); snapped = true; }
      let d = Math.round(T.snapAngle(Math.atan2(y - cy, x - cx) + PI / 2) * 180 / PI); d = ((d % 360) + 360) % 360;
      T.overlay.rotDeg = d; T.replaceItem({ ...o, r: d }); T.renderOver();
    },
    up() { T.overlay.rotDeg = null; T.renderOver(); }
  };
}
function selectDown(P, wx, wy) {
  const hit = itemAt(wx, wy);
  if (hit) { const war = !!(S.sel && S.sel.ids.has(hit.id)); if (!war) select([hit.id]); return moveSel(P, wx, wy, hit.t === 'o' ? hit : null, war); }
  S.sel = null; T.overlay.band = { x0: wx, y0: wy, x1: wx, y1: wy }; T.renderOver();
  return {
    move(Q) { const [x, y] = world(Q.x, Q.y); T.overlay.band = { x0: Math.min(wx, x), y0: Math.min(wy, y), x1: Math.max(wx, x), y1: Math.max(wy, y) }; T.renderOver(); },
    up() {
      const b = T.overlay.band; T.overlay.band = null;
      const ids = T.page().items.filter(it => {
        if (it.t === 'o') { const c = [it.x + it.w / 2, it.y + it.h / 2]; return c[0] >= b.x0 && c[0] <= b.x1 && c[1] >= b.y0 && c[1] <= b.y1; }
        return it.p.some(q => q[0] >= b.x0 && q[0] <= b.x1 && q[1] >= b.y0 && q[1] <= b.y1);
      }).map(it => it.id);
      S.sel = ids.length ? { ids: new Set(ids) } : null; T.renderOver();
    },
    cancel() { T.overlay.band = null; T.renderOver(); }
  };
}
})();
