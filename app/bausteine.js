// Tafel-App – Bausteine und Vorlagen (alle Grafiken selbst erzeugt, als SVG)
'use strict';
(function () {
const CM = T.CM;
const f = v => Math.round(v * 10) / 10;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const doc = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}" height="${f(h)}" viewBox="0 0 ${f(w)} ${f(h)}" font-family="Segoe UI, Arial, sans-serif">${body}</svg>`;
const ln = (x1, y1, x2, y2, c, w = 2, extra = '') => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
const tx = (x, y, s, c, size = 18, anchor = 'middle', extra = '') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${c}" text-anchor="${anchor}" dominant-baseline="central" ${extra}>${esc(s)}</text>`;
const rc = (x, y, w, h, st, fill = 'none', sw = 2, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" stroke="${st}" fill="${fill}" stroke-width="${sw}" ${extra}/>`;
const arrowHead = (x, y, ang, c, L = 14) => { const a1 = ang + 2.7, a2 = ang - 2.7; return `<polygon points="${f(x)},${f(y)} ${f(x + L * Math.cos(a1))},${f(y + L * Math.sin(a1))} ${f(x + L * Math.cos(a2))},${f(y + L * Math.sin(a2))}" fill="${c}"/>`; };
const num = (v, jahr) => jahr ? String(Math.round(v)) : (Math.round(v * 1e6) / 1e6).toLocaleString('de-DE', { maximumFractionDigits: 4 });
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const pal = (dark, ink) => ({
  ink, soft: dark ? 'rgba(255,255,255,.10)' : '#eef4fb', head: dark ? 'rgba(255,255,255,.22)' : '#d9e7f7',
  acc: dark ? '#9cc7ff' : '#1e6fd9', grid: dark ? 'rgba(255,255,255,.28)' : '#c9d7e6', dash: '8 7', red: dark ? '#ff9a8a' : '#c62828'
});

// ---------- 3D-Körper (Schrägbild: Tiefe 45°, verkürzt auf die Hälfte) ----------
function poly3d(V, F, names, d, P) {
  const k = 0.5, c = Math.SQRT1_2;
  const Q = V.map(([x, y, z]) => [(x + k * z * c) * CM, (y + k * z * c) * CM]);
  const cen = [0, 1, 2].map(i => V.reduce((s, v) => s + v[i], 0) / V.length), dir = [-k * c, -k * c, 1];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const vis = F.map(fc => {
    let n = cross(sub(V[fc[1]], V[fc[0]]), sub(V[fc[2]], V[fc[0]]));
    const fcen = [0, 1, 2].map(i => fc.reduce((s, j) => s + V[j][i], 0) / fc.length);
    if (dot(n, sub(fcen, cen)) < 0) n = n.map(x => -x);
    return dot(n, dir) < -1e-9;
  });
  const edges = new Map();
  F.forEach((fc, fi) => fc.forEach((a, i) => { const b = fc[(i + 1) % fc.length], key = Math.min(a, b) + '-' + Math.max(a, b); const e = edges.get(key) || { a, b, v: false }; e.v = e.v || vis[fi]; edges.set(key, e); }));
  const m = 40, xs = Q.map(p => p[0]), ys = Q.map(p => p[1]), x0 = Math.min(...xs), y1 = Math.max(...ys);
  const W = Math.max(...xs) - x0 + 2 * m, H = y1 - Math.min(...ys) + 2 * m;
  const X = p => p[0] - x0 + m, Y = p => y1 - p[1] + m;
  let s = '';
  if (d.flaechen !== false) F.forEach((fc, fi) => { if (vis[fi]) s += `<polygon points="${fc.map(j => f(X(Q[j])) + ',' + f(Y(Q[j]))).join(' ')}" fill="${P.soft}" stroke="none"/>`; });
  for (const e of edges.values()) s += ln(X(Q[e.a]), Y(Q[e.a]), X(Q[e.b]), Y(Q[e.b]), P.ink, e.v ? 3 : 2, e.v ? '' : `stroke-dasharray="${P.dash}"`);
  if (d.ecken && names) {
    const cx = Q.reduce((a, p) => a + X(p), 0) / Q.length, cy = Q.reduce((a, p) => a + Y(p), 0) / Q.length;
    Q.forEach((p, i) => { const dx = X(p) - cx, dy = Y(p) - cy, l = Math.hypot(dx, dy) || 1; s += tx(X(p) + dx / l * 20, Y(p) + dy / l * 20, names[i], P.acc, 20, 'middle', 'font-weight="600"'); });
  }
  return { svg: doc(W, H, s), w: W, h: H };
}
const box = (a, b, c) => ({
  V: [[0, 0, 0], [a, 0, 0], [a, 0, b], [0, 0, b], [0, c, 0], [a, c, 0], [a, c, b], [0, c, b]],
  F: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]
});
function ellipseHalf(cx, cy, rx, ry, front, P, sw = 3) {
  const d = front ? `M ${f(cx - rx)} ${f(cy)} A ${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy)}` : `M ${f(cx - rx)} ${f(cy)} A ${f(rx)} ${f(ry)} 0 0 1 ${f(cx + rx)} ${f(cy)}`;
  return `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="${front ? sw : 2}" ${front ? '' : `stroke-dasharray="${P.dash}"`}/>`;
}

const F_KOERPER = [{ k: 'ecken', l: 'Ecken beschriften', typ: 'check' }, { k: 'flaechen', l: 'Sichtbare Flächen tönen', typ: 'check' }];
const F_RUND = [{ k: 'masse', l: 'r und h einzeichnen', typ: 'check' }];

T.BAUSTEINE = {
  wuerfel: { name: 'Würfel', gruppe: 'Körper', def: { a: 5, ecken: false, flaechen: true },
    felder: [{ k: 'a', l: 'Kantenlänge a (cm)', typ: 'zahl', min: 1, max: 20 }, ...F_KOERPER],
    gen: (d, P) => { const b = box(d.a, d.a, d.a); return poly3d(b.V, b.F, 'ABCDEFGH', d, P); } },
  quader: { name: 'Quader', gruppe: 'Körper', def: { a: 7, b: 4, c: 3, ecken: false, flaechen: true },
    felder: [{ k: 'a', l: 'Länge a (cm)', typ: 'zahl', min: 1, max: 30 }, { k: 'b', l: 'Breite b (cm)', typ: 'zahl', min: 1, max: 30 }, { k: 'c', l: 'Höhe c (cm)', typ: 'zahl', min: 1, max: 30 }, ...F_KOERPER],
    gen: (d, P) => { const b = box(d.a, d.b, d.c); return poly3d(b.V, b.F, 'ABCDEFGH', d, P); } },
  pyramide: { name: 'Pyramide', gruppe: 'Körper', def: { a: 6, h: 6, ecken: false, flaechen: true },
    felder: [{ k: 'a', l: 'Grundkante a (cm)', typ: 'zahl', min: 1, max: 20 }, { k: 'h', l: 'Höhe h (cm)', typ: 'zahl', min: 1, max: 20 }, ...F_KOERPER],
    gen: (d, P) => poly3d([[0, 0, 0], [d.a, 0, 0], [d.a, 0, d.a], [0, 0, d.a], [d.a / 2, d.h, d.a / 2]], [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]], 'ABCDS', d, P) },
  prisma: { name: 'Dreiecksprisma', gruppe: 'Körper', def: { g: 5, hd: 4, l: 7, ecken: false, flaechen: true },
    felder: [{ k: 'g', l: 'Grundseite g (cm)', typ: 'zahl', min: 1, max: 20 }, { k: 'hd', l: 'Dreieckshöhe (cm)', typ: 'zahl', min: 1, max: 20 }, { k: 'l', l: 'Länge (cm)', typ: 'zahl', min: 1, max: 30 }, ...F_KOERPER],
    gen: (d, P) => poly3d([[0, 0, 0], [d.g, 0, 0], [d.g / 2, d.hd, 0], [0, 0, d.l], [d.g, 0, d.l], [d.g / 2, d.hd, d.l]], [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]], 'ABCDEF', d, P) },
  zylinder: { name: 'Zylinder', gruppe: 'Körper', def: { r: 2.5, h: 6, masse: true },
    felder: [{ k: 'r', l: 'Radius r (cm)', typ: 'zahl', min: 0.5, max: 15 }, { k: 'h', l: 'Höhe h (cm)', typ: 'zahl', min: 0.5, max: 25 }, ...F_RUND],
    gen: (d, P) => {
      const rx = d.r * CM, ry = rx * 0.38, hh = d.h * CM, m = 40, W = 2 * rx + 2 * m, H = hh + 2 * ry + 2 * m, cx = W / 2, top = m + ry, bot = top + hh;
      let s = `<path d="M ${f(cx - rx)} ${f(top)} L ${f(cx - rx)} ${f(bot)} A ${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(bot)} L ${f(cx + rx)} ${f(top)} Z" fill="${P.soft}"/>`;
      s += `<ellipse cx="${f(cx)}" cy="${f(top)}" rx="${f(rx)}" ry="${f(ry)}" fill="${P.soft}" stroke="${P.ink}" stroke-width="3"/>`;
      s += ln(cx - rx, top, cx - rx, bot, P.ink, 3) + ln(cx + rx, top, cx + rx, bot, P.ink, 3) + ellipseHalf(cx, bot, rx, ry, true, P) + ellipseHalf(cx, bot, rx, ry, false, P);
      if (d.masse) s += ln(cx, top, cx + rx, top, P.acc, 2.5) + tx(cx + rx / 2, top - 14, 'r', P.acc, 22, 'middle', 'font-style="italic"') + ln(cx, top, cx, bot, P.acc, 2.5, `stroke-dasharray="${P.dash}"`) + tx(cx + 14, (top + bot) / 2, 'h', P.acc, 22, 'start', 'font-style="italic"') + `<circle cx="${f(cx)}" cy="${f(top)}" r="3.5" fill="${P.acc}"/>`;
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  kegel: { name: 'Kegel', gruppe: 'Körper', def: { r: 3, h: 6, masse: true },
    felder: [{ k: 'r', l: 'Radius r (cm)', typ: 'zahl', min: 0.5, max: 15 }, { k: 'h', l: 'Höhe h (cm)', typ: 'zahl', min: 0.5, max: 25 }, ...F_RUND],
    gen: (d, P) => {
      const rx = d.r * CM, ry = rx * 0.38, hh = d.h * CM, m = 40, W = 2 * rx + 2 * m, H = hh + ry + 2 * m, cx = W / 2, top = m, bot = m + hh;
      let s = `<path d="M ${f(cx)} ${f(top)} L ${f(cx - rx)} ${f(bot)} A ${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(bot)} Z" fill="${P.soft}"/>`;
      s += ln(cx, top, cx - rx, bot, P.ink, 3) + ln(cx, top, cx + rx, bot, P.ink, 3) + ellipseHalf(cx, bot, rx, ry, true, P) + ellipseHalf(cx, bot, rx, ry, false, P);
      if (d.masse) s += ln(cx, bot, cx + rx, bot, P.acc, 2.5) + tx(cx + rx / 2, bot + 16, 'r', P.acc, 22, 'middle', 'font-style="italic"') + ln(cx, top, cx, bot, P.acc, 2.5, `stroke-dasharray="${P.dash}"`) + tx(cx - 16, (top + bot) / 2, 'h', P.acc, 22, 'end', 'font-style="italic"') + `<circle cx="${f(cx)}" cy="${f(bot)}" r="3.5" fill="${P.acc}"/>`;
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  kugel: { name: 'Kugel', gruppe: 'Körper', def: { r: 3.5, masse: true },
    felder: [{ k: 'r', l: 'Radius r (cm)', typ: 'zahl', min: 0.5, max: 15 }, { k: 'masse', l: 'Radius einzeichnen', typ: 'check' }],
    gen: (d, P) => {
      const r = d.r * CM, m = 30, W = 2 * r + 2 * m, cx = W / 2, cy = W / 2;
      let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${P.soft}" stroke="${P.ink}" stroke-width="3"/>` + ellipseHalf(cx, cy, r, r * 0.3, true, P, 2.5) + ellipseHalf(cx, cy, r, r * 0.3, false, P);
      if (d.masse) s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="3.5" fill="${P.acc}"/>` + ln(cx, cy, cx + r * 0.7, cy - r * 0.7, P.acc, 2.5) + tx(cx + r * 0.3, cy - r * 0.45, 'r', P.acc, 22, 'middle', 'font-style="italic"');
      return { svg: doc(W, W, s), w: W, h: W };
    } },

  // ---------- Mathe ----------
  koord: { name: 'Koordinatensystem', gruppe: 'Mathe', def: { xmin: -5, xmax: 5, ymin: -5, ymax: 5, einheit: 1, schritt: 1, raster: true, funktionen: '' },
    felder: [{ k: 'funktionen', l: 'Funktionen zeichnen (eine pro Zeile, z. B. 2x+1 oder 0,5x^2-3)', typ: 'textarea' },{ k: 'xmin', l: 'x von', typ: 'zahl', min: -50, max: 50 }, { k: 'xmax', l: 'x bis', typ: 'zahl', min: -50, max: 50 }, { k: 'ymin', l: 'y von', typ: 'zahl', min: -50, max: 50 }, { k: 'ymax', l: 'y bis', typ: 'zahl', min: -50, max: 50 }, { k: 'einheit', l: 'Einheit (cm)', typ: 'zahl', min: 0.5, max: 5 }, { k: 'schritt', l: 'Beschriftung alle', typ: 'zahl', min: 1, max: 20 }, { k: 'raster', l: 'Raster', typ: 'check' }],
    gen: (d, P) => {
      let x0 = Math.min(d.xmin, d.xmax), x1 = Math.max(d.xmin, d.xmax), y0 = Math.min(d.ymin, d.ymax), y1 = Math.max(d.ymin, d.ymax);
      if (x1 - x0 < 1) x1 = x0 + 1; if (y1 - y0 < 1) y1 = y0 + 1;
      const u = d.einheit * CM, m = 44, W = (x1 - x0) * u + 2 * m, H = (y1 - y0) * u + 2 * m;
      const X = v => m + (v - x0) * u, Y = v => m + (y1 - v) * u;
      let s = '';
      if (d.raster) {
        const g = u >= 60 ? 0.5 : 1;
        for (let v = Math.ceil(x0 / g) * g; v <= x1 + 1e-9; v += g) s += ln(X(v), Y(y0), X(v), Y(y1), P.grid, 1);
        for (let v = Math.ceil(y0 / g) * g; v <= y1 + 1e-9; v += g) s += ln(X(x0), Y(v), X(x1), Y(v), P.grid, 1);
      }
      const ax = Y(T.clamp(0, y0, y1)), ay = X(T.clamp(0, x0, x1));
      s += ln(X(x0) - 10, ax, X(x1) + 26, ax, P.ink, 2.5) + arrowHead(X(x1) + 30, ax, 0, P.ink) + tx(X(x1) + 28, ax + 20, 'x', P.ink, 22, 'middle', 'font-style="italic"');
      s += ln(ay, Y(y0) + 10, ay, Y(y1) - 26, P.ink, 2.5) + arrowHead(ay, Y(y1) - 30, -Math.PI / 2, P.ink) + tx(ay - 20, Y(y1) - 28, 'y', P.ink, 22, 'middle', 'font-style="italic"');
      const st = Math.max(1, d.schritt);
      for (let v = Math.ceil(x0 / st) * st; v <= x1; v += st) if (v !== 0) s += ln(X(v), ax - 6, X(v), ax + 6, P.ink, 2) + tx(X(v), ax + 20, num(v), P.ink, 16);
      for (let v = Math.ceil(y0 / st) * st; v <= y1; v += st) if (v !== 0) s += ln(ay - 6, Y(v), ay + 6, Y(v), P.ink, 2) + tx(ay - 12, Y(v), num(v), P.ink, 16, 'end');
      if (x0 <= 0 && x1 >= 0 && y0 <= 0 && y1 >= 0) s += tx(ay - 12, ax + 18, '0', P.ink, 16, 'end');
      const cols = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa'];
      const terme = zeilen(d.funktionen);
      terme.forEach((term, i) => {
        const fn = T.parseFunktion(term); if (!fn) return;
        const col = cols[i % cols.length]; let path = '', pen = false, last = null;
        for (let k = 0; k <= 600; k++) {
          const xv = x0 + (x1 - x0) * k / 600; let yv; try { yv = fn(xv); } catch (e) { yv = NaN; }
          if (!isFinite(yv) || yv < y0 - (y1 - y0) || yv > y1 + (y1 - y0)) { pen = false; continue; }
          path += (pen ? ' L ' : ' M ') + f(X(xv)) + ' ' + f(Y(yv)); pen = true; last = [xv, yv];
        }
        s += `<g clip-path="url(#kc)"><path d="${path}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round"/></g>`;
        const fname = terme.length > 1 ? 'f' + '₁₂₃₄₅₆₇₈₉'[i % 9] : 'f';
        if (last) s += tx(X(x1) - 8, m + 14 + i * 24, d.ohneTerm ? fname : fname + '(x) = ' + term, col, 18, 'end', `font-weight="600" paint-order="stroke" stroke="${P.ink === '#1a1a1a' ? '#fff' : '#2d5a3d'}" stroke-width="4"`);
      });
      s = `<defs><clipPath id="kc"><rect x="${m}" y="${m}" width="${f(W - 2 * m)}" height="${f(H - 2 * m)}"/></clipPath></defs>` + s;
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  zahlenstrahl: { name: 'Zahlenstrahl', gruppe: 'Mathe', def: { start: 0, ende: 10, schritt: 1, teile: 1, abstand: 2, beschr: 'alle' },
    felder: [{ k: 'start', l: 'Start', typ: 'zahl' }, { k: 'ende', l: 'Ende', typ: 'zahl' }, { k: 'schritt', l: 'Schrittweite (große Striche)', typ: 'zahl', min: 0.0001 }, { k: 'teile', l: 'Unterteilung (kleine Striche je Schritt)', typ: 'zahl', min: 1, max: 20 }, { k: 'abstand', l: 'Abstand je Schritt (cm)', typ: 'zahl', min: 0.5, max: 10 }, { k: 'beschr', l: 'Beschriftung', typ: 'auswahl', opts: [['alle', 'alle großen Striche'], ['rand', 'nur Anfang und Ende'], ['keine', 'keine (zum Ausfüllen)']] }],
    gen: (d, P) => strahl(d, P, false) },
  bruchkreis: { name: 'Bruchkreis', gruppe: 'Mathe', def: { n: 4, k: 1, farbe: '#ff8a65', zeigen: false },
    felder: [{ k: 'n', l: 'Nenner (Teile)', typ: 'zahl', min: 1, max: 24 }, { k: 'k', l: 'Zähler (gefärbt)', typ: 'zahl', min: 0, max: 24 }, { k: 'farbe', l: 'Farbe', typ: 'farbe' }, { k: 'zeigen', l: 'Bruch darunter schreiben', typ: 'check' }],
    gen: (d, P) => {
      const n = Math.max(1, Math.round(d.n)), k = T.clamp(Math.round(d.k), 0, n), R = 4 * CM, m = 20, W = 2 * R + 2 * m, H = W + (d.zeigen ? 70 : 0), cx = W / 2, cy = m + R;
      let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${P.soft}"/>`;
      for (let i = 0; i < k; i++) {
        if (n === 1) { s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${d.farbe}"/>`; break; }
        const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
        s += `<path d="M ${cx} ${cy} L ${f(cx + R * Math.cos(a0))} ${f(cy + R * Math.sin(a0))} A ${R} ${R} 0 ${n === 2 ? 0 : 0} 1 ${f(cx + R * Math.cos(a1))} ${f(cy + R * Math.sin(a1))} Z" fill="${d.farbe}"/>`;
      }
      if (n > 1) for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; s += ln(cx, cy, cx + R * Math.cos(a), cy + R * Math.sin(a), P.ink, 2); }
      s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${P.ink}" stroke-width="3"/>`;
      if (d.zeigen) s += tx(cx, cy + R + 22, k, P.ink, 24) + ln(cx - 16, cy + R + 38, cx + 16, cy + R + 38, P.ink, 2.5) + tx(cx, cy + R + 54, n, P.ink, 24);
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  bruchstreifen: { name: 'Bruchstreifen', gruppe: 'Mathe', def: { n: 5, k: 2, laenge: 14, farbe: '#4fc3f7', zeigen: false },
    felder: [{ k: 'n', l: 'Nenner (Teile)', typ: 'zahl', min: 1, max: 40 }, { k: 'k', l: 'Zähler (gefärbt)', typ: 'zahl', min: 0, max: 40 }, { k: 'laenge', l: 'Länge (cm)', typ: 'zahl', min: 4, max: 40 }, { k: 'farbe', l: 'Farbe', typ: 'farbe' }, { k: 'zeigen', l: 'Bruch daneben schreiben', typ: 'check' }],
    gen: (d, P) => {
      const n = Math.max(1, Math.round(d.n)), k = T.clamp(Math.round(d.k), 0, n), L = d.laenge * CM, h = 1.5 * CM, m = 14, W = L + 2 * m + (d.zeigen ? 80 : 0), H = h + 2 * m;
      let s = rc(m, m, L, h, 'none', P.soft, 0);
      for (let i = 0; i < k; i++) s += rc(m + i * L / n, m, L / n, h, 'none', d.farbe, 0);
      for (let i = 1; i < n; i++) s += ln(m + i * L / n, m, m + i * L / n, m + h, P.ink, 2);
      s += rc(m, m, L, h, P.ink, 'none', 3);
      if (d.zeigen) s += tx(m + L + 40, m + h / 2 - 16, k, P.ink, 22) + ln(m + L + 26, m + h / 2, m + L + 54, m + h / 2, P.ink, 2.5) + tx(m + L + 40, m + h / 2 + 16, n, P.ink, 22);
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  rechnen: { name: 'Schriftlich rechnen', gruppe: 'Mathe', def: { art: 'plus', stellen: 5, zeilen: 2, kopf: true },
    felder: [{ k: 'art', l: 'Rechenart', typ: 'auswahl', opts: [['plus', 'Addition (+)'], ['minus', 'Subtraktion (−)'], ['mal', 'Multiplikation (·)'], ['geteilt', 'Division (:)']] }, { k: 'stellen', l: 'Stellen', typ: 'zahl', min: 2, max: 9 }, { k: 'zeilen', l: 'Zahlen untereinander / Teilschritte', typ: 'zahl', min: 2, max: 8 }, { k: 'kopf', l: 'Stellenwerte (E, Z, H …) zeigen', typ: 'check' }],
    gen: (d, P) => rechnen(d, P) },
  stellenwert: { name: 'Stellenwerttafel', gruppe: 'Mathe', def: { bereich: 'mio', zeilen: 3 },
    felder: [{ k: 'bereich', l: 'Bereich', typ: 'auswahl', opts: [['tsd', 'bis Tausender'], ['mio', 'bis Millionen'], ['mrd', 'bis Milliarden'], ['dez', 'mit Dezimalstellen']] }, { k: 'zeilen', l: 'Zeilen', typ: 'zahl', min: 1, max: 12 }],
    gen: (d, P) => {
      const sets = { tsd: ['T', 'H', 'Z', 'E'], mio: ['M', 'HT', 'ZT', 'T', 'H', 'Z', 'E'], mrd: ['Mrd', 'HM', 'ZM', 'M', 'HT', 'ZT', 'T', 'H', 'Z', 'E'], dez: ['T', 'H', 'Z', 'E', 'z', 'h', 't'] };
      const cols = sets[d.bereich] || sets.mio, cw = 1.8 * CM, rh = 1.4 * CM, m = 10, W = cols.length * cw + 2 * m, H = (Math.round(d.zeilen) + 1) * rh + 2 * m;
      const farb = ['#e3f2fd', '#e8f5e9', '#fff3e0', '#fce4ec'];
      let s = '';
      cols.forEach((c, i) => {
        const grp = d.bereich === 'dez' ? (i < 4 ? 0 : 3) : Math.floor((cols.length - 1 - i) / 3);
        s += rc(m + i * cw, m, cw, rh, 'none', P.ink === '#1a1a1a' ? farb[grp % 4] : P.head, 0) + tx(m + i * cw + cw / 2, m + rh / 2, c, P.ink, 22, 'middle', 'font-weight="700"');
      });
      for (let r = 0; r <= Math.round(d.zeilen) + 1; r++) s += ln(m, m + r * rh, W - m, m + r * rh, P.ink, r === 1 ? 3 : 1.5);
      cols.forEach((c, i) => { const thick = d.bereich === 'dez' ? i === 4 : (cols.length - i) % 3 === 0; s += ln(m + i * cw, m, m + i * cw, H - m, P.ink, thick && i ? 3.5 : 1.5); });
      s += ln(W - m, m, W - m, H - m, P.ink, 1.5);
      if (d.bereich === 'dez') s += tx(m + 4 * cw, m + rh / 2 + rh, ',', P.red, 34);
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  hunderter: { name: 'Hundertertafel', gruppe: 'Mathe', def: { start: 1, leer: false },
    felder: [{ k: 'start', l: 'Erste Zahl', typ: 'zahl' }, { k: 'leer', l: 'Leere Felder (zum Ausfüllen)', typ: 'check' }],
    gen: (d, P) => {
      const c = 1.4 * CM, m = 8, W = 10 * c + 2 * m; let s = '';
      for (let i = 0; i < 100; i++) {
        const x = m + (i % 10) * c, y = m + Math.floor(i / 10) * c, v = Math.round(d.start) + i;
        s += rc(x, y, c, c, P.ink, (i % 10 === 4 || Math.floor(i / 10) === 4) ? P.soft : 'none', 1.5);
        if (!d.leer) s += tx(x + c / 2, y + c / 2, v, P.ink, 20);
      }
      return { svg: doc(W, W, s), w: W, h: W };
    } },
  uhr: { name: 'Lernuhr', gruppe: 'Mathe', def: { h: 3, m: 0, zeiger: true, z24: false },
    felder: [{ k: 'h', l: 'Stunde', typ: 'zahl', min: 0, max: 23 }, { k: 'm', l: 'Minute', typ: 'zahl', min: 0, max: 59 }, { k: 'zeiger', l: 'Zeiger anzeigen', typ: 'check' }, { k: 'z24', l: '13–24 innen anzeigen', typ: 'check' }],
    gen: (d, P) => {
      const R = 5 * CM, m = 14, W = 2 * R + 2 * m, c = W / 2;
      let s = `<circle cx="${c}" cy="${c}" r="${R}" fill="${P.ink === '#1a1a1a' ? '#fff' : P.soft}" stroke="${P.ink}" stroke-width="5"/>`;
      for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, l = i % 5 ? 10 : 22; s += ln(c + Math.sin(a) * (R - 6), c - Math.cos(a) * (R - 6), c + Math.sin(a) * (R - 6 - l), c - Math.cos(a) * (R - 6 - l), P.ink, i % 5 ? 2 : 4); }
      for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; s += tx(c + Math.sin(a) * (R - 52), c - Math.cos(a) * (R - 52), i, P.ink, 32, 'middle', 'font-weight="600"'); if (d.z24) s += tx(c + Math.sin(a) * (R - 92), c - Math.cos(a) * (R - 92), i + 12, P.acc, 18); }
      if (d.zeiger) {
        const mm = T.clamp(Math.round(d.m), 0, 59), hh = ((Math.round(d.h) % 12) + mm / 60) * Math.PI / 6, ma = mm * Math.PI / 30;
        s += ln(c, c, c + Math.sin(hh) * R * 0.5, c - Math.cos(hh) * R * 0.5, P.ink, 12) + ln(c, c, c + Math.sin(ma) * R * 0.78, c - Math.cos(ma) * R * 0.78, P.red, 7);
        s += `<circle cx="${c}" cy="${c}" r="10" fill="${P.ink}"/>`;
      }
      return { svg: doc(W, W, s), w: W, h: W };
    } },
  tabelle: { name: 'Tabelle', gruppe: 'Mathe', def: { zeilen: 4, spalten: 3, kopf: true, breite: 4, hoehe: 1.3, inhalt: '' },
    felder: [{ k: 'zeilen', l: 'Zeilen', typ: 'zahl', min: 1, max: 30 }, { k: 'spalten', l: 'Spalten', typ: 'zahl', min: 1, max: 15 }, { k: 'kopf', l: 'Kopfzeile hervorheben', typ: 'check' }, { k: 'breite', l: 'Spaltenbreite (cm)', typ: 'zahl', min: 1, max: 15 }, { k: 'hoehe', l: 'Zeilenhöhe (cm)', typ: 'zahl', min: 0.8, max: 6 }, { k: 'inhalt', l: 'Inhalt (eine Zeile pro Tabellenzeile, Zellen mit ; trennen)', typ: 'textarea' }],
    gen: (d, P) => tabelle(d, P) },

  // ---------- Sprachen ----------
  vokabeln: { name: 'Vokabeltabelle', gruppe: 'Sprachen', def: { links: 'English', rechts: 'Deutsch', inhalt: 'apple = Apfel\nto go = gehen\nbeautiful = schön', zeilen: 8, verdecken: 'keine', breite: 8 },
    felder: [{ k: 'links', l: 'Überschrift links', typ: 'text' }, { k: 'rechts', l: 'Überschrift rechts', typ: 'text' }, { k: 'inhalt', l: 'Vokabeln (eine pro Zeile: Wort = Übersetzung)', typ: 'textarea' }, { k: 'zeilen', l: 'Mindestens Zeilen', typ: 'zahl', min: 1, max: 30 }, { k: 'verdecken', l: 'Spalte verdecken (Abfrage)', typ: 'auswahl', opts: [['keine', 'nichts verdecken'], ['links', 'linke Spalte verdecken'], ['rechts', 'rechte Spalte verdecken']] }, { k: 'breite', l: 'Spaltenbreite (cm)', typ: 'zahl', min: 3, max: 20 }],
    gen: (d, P) => {
      const z = zeilen(d.inhalt).map(l => { const i = l.search(/\s*(=|–|-|;|\t)\s*/); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i).replace(/^\s*(=|–|-|;|\t)\s*/, '')]; });
      const n = Math.max(Math.round(d.zeilen), z.length), cw = d.breite * CM, rh = 1.4 * CM, nr = 2 * CM, m = 8, W = nr + 2 * cw + 2 * m, H = (n + 1) * rh + 2 * m;
      let s = rc(m, m, W - 2 * m, rh, 'none', P.head, 0) + tx(m + nr + cw / 2, m + rh / 2, d.links, P.ink, 24, 'middle', 'font-weight="700"') + tx(m + nr + cw * 1.5, m + rh / 2, d.rechts, P.ink, 24, 'middle', 'font-weight="700"');
      for (let r = 0; r < n; r++) {
        const y = m + (r + 1) * rh; if (r % 2) s += rc(m, y, W - 2 * m, rh, 'none', P.soft, 0);
        s += tx(m + nr / 2, y + rh / 2, r + 1, P.grid === '#c9d7e6' ? '#8795a8' : P.grid, 16);
        const [a, b] = z[r] || ['', ''];
        for (const [i, t] of [[0, a], [1, b]]) {
          const x = m + nr + i * cw, hide = (i === 0 && d.verdecken === 'links') || (i === 1 && d.verdecken === 'rechts');
          if (hide && t) s += rc(x + 10, y + 10, cw - 20, rh - 20, 'none', P.ink === '#1a1a1a' ? '#cfd6df' : 'rgba(255,255,255,.3)', 0, 'rx="8"') + tx(x + cw / 2, y + rh / 2, '?', P.ink, 22, 'middle', 'font-weight="700"');
          else if (t) s += tx(x + 16, y + rh / 2, t, P.ink, 24, 'start');
        }
      }
      for (let r = 0; r <= n + 1; r++) s += ln(m, m + r * rh, W - m, m + r * rh, P.ink, r === 1 ? 3 : 1.5);
      for (const x of [m, m + nr, m + nr + cw, W - m]) s += ln(x, m, x, H - m, P.ink, x === m + nr + cw ? 3 : 1.5);
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  zuordnung: { name: 'Zuordnung', gruppe: 'Sprachen', def: { links: 'dog\ncat\nhorse\nbird', rechts: 'Katze\nVogel\nHund\nPferd', mischen: false, titel: '' },
    felder: [{ k: 'titel', l: 'Überschrift (optional)', typ: 'text' }, { k: 'links', l: 'Linke Spalte (eine Karte pro Zeile)', typ: 'textarea' }, { k: 'rechts', l: 'Rechte Spalte (eine Karte pro Zeile)', typ: 'textarea' }, { k: 'mischen', l: 'Rechte Spalte durchmischen', typ: 'check' }],
    gen: (d, P) => {
      const L = zeilen(d.links), R = zeilen(d.rechts);
      if (d.mischen) { let seed = R.join('').length * 7 + 3; for (let i = R.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [R[i], R[j]] = [R[j], R[i]]; } }
      const n = Math.max(L.length, R.length, 1), bw = 7 * CM, bh = 1.6 * CM, gap = 0.5 * CM, mid = 6 * CM, m = 14, top = d.titel ? 60 : 0;
      const W = 2 * bw + mid + 2 * m, H = top + n * (bh + gap) - gap + 2 * m;
      let s = d.titel ? tx(W / 2, m + 22, d.titel, P.ink, 28, 'middle', 'font-weight="700"') : '';
      const card = (x, y, t, dotX) => rc(x, y, bw, bh, P.ink, P.soft, 2.5, 'rx="14"') + tx(x + bw / 2, y + bh / 2, t, P.ink, 24) + `<circle cx="${f(dotX)}" cy="${f(y + bh / 2)}" r="9" fill="${P.acc}"/>`;
      for (let i = 0; i < n; i++) {
        const y = m + top + i * (bh + gap);
        if (L[i] != null) s += card(m, y, L[i], m + bw + 14);
        if (R[i] != null) s += card(m + bw + mid, y, R[i], m + bw + mid - 14);
      }
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  satzbau: { name: 'Satzbau-Tabelle', gruppe: 'Sprachen', def: { art: 'svopt', zeilen: 4, inhalt: '' },
    felder: [{ k: 'art', l: 'Modell', typ: 'auswahl', opts: [['svopt', 'Englisch: S – V – O – P – T'], ['felder', 'Deutsch: Feldermodell'], ['satzglieder', 'Deutsch: Satzglieder'], ['wortarten', 'Wortarten sammeln']] }, { k: 'zeilen', l: 'Zeilen', typ: 'zahl', min: 1, max: 20 }, { k: 'inhalt', l: 'Inhalt (Zellen mit ; trennen)', typ: 'textarea' }],
    gen: (d, P) => {
      const M = {
        svopt: [['Subject', '#e3f2fd'], ['Verb', '#ffebee'], ['Object', '#e8f5e9'], ['Place', '#fff8e1'], ['Time', '#f3e5f5']],
        felder: [['Vorfeld', '#e3f2fd'], ['linke Satzklammer', '#ffebee'], ['Mittelfeld', '#e8f5e9'], ['rechte Satzklammer', '#ffebee'], ['Nachfeld', '#f3e5f5']],
        satzglieder: [['Subjekt', '#e3f2fd'], ['Prädikat', '#ffebee'], ['Dativobjekt', '#e8f5e9'], ['Akkusativobjekt', '#fff8e1'], ['Adverbiale', '#f3e5f5']],
        wortarten: [['Nomen', '#e3f2fd'], ['Verben', '#ffebee'], ['Adjektive', '#e8f5e9'], ['Andere', '#f3e5f5']]
      }[d.art] || [];
      return tabelle({ zeilen: Math.round(d.zeilen) + 1, spalten: M.length, kopf: true, breite: 5.2, hoehe: 1.5, inhalt: M.map(x => x[0]).join(';') + '\n' + (d.inhalt || ''), farben: P.ink === '#1a1a1a' ? M.map(x => x[1]) : null }, P);
    } },
  mindmap: { name: 'Mindmap', gruppe: 'Sprachen', def: { mitte: 'Thema', aeste: 6, inhalt: '' },
    felder: [{ k: 'mitte', l: 'Thema in der Mitte', typ: 'text' }, { k: 'aeste', l: 'Anzahl Äste', typ: 'zahl', min: 2, max: 12 }, { k: 'inhalt', l: 'Ast-Beschriftungen (eine pro Zeile, optional)', typ: 'textarea' }],
    gen: (d, P) => {
      const n = Math.round(d.aeste), W = 26 * CM, H = 17 * CM, cx = W / 2, cy = H / 2, z = zeilen(d.inhalt);
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / n, ex = cx + Math.cos(a) * 9 * CM, ey = cy + Math.sin(a) * 5.6 * CM;
        s += `<path d="M ${f(cx)} ${f(cy)} Q ${f(cx + Math.cos(a) * 5 * CM)} ${f(cy + Math.sin(a) * 2.2 * CM)} ${f(ex)} ${f(ey)}" fill="none" stroke="${P.acc}" stroke-width="5" stroke-linecap="round"/>`;
        s += rc(ex - 2.3 * CM, ey - 0.75 * CM, 4.6 * CM, 1.5 * CM, P.ink, P.ink === '#1a1a1a' ? '#fff' : P.soft, 2.5, 'rx="30"');
        if (z[i]) s += tx(ex, ey, z[i], P.ink, 22);
      }
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${3.6 * CM}" ry="${1.5 * CM}" fill="${P.head}" stroke="${P.ink}" stroke-width="3.5"/>` + tx(cx, cy, d.mitte, P.ink, 30, 'middle', 'font-weight="700"');
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  venn: { name: 'Venn-Diagramm', gruppe: 'Sprachen', def: { links: 'A', rechts: 'B', mitte: 'beides' },
    felder: [{ k: 'links', l: 'Links', typ: 'text' }, { k: 'rechts', l: 'Rechts', typ: 'text' }, { k: 'mitte', l: 'Schnittmenge', typ: 'text' }],
    gen: (d, P) => {
      const R = 6 * CM, W = 2 * R + 7 * CM + 20, H = 2 * R + 70, c1 = 10 + R, c2 = W - 10 - R, cy = 60 + R;
      const s = `<circle cx="${c1}" cy="${cy}" r="${R}" fill="rgba(30,136,229,.12)" stroke="${P.ink}" stroke-width="3"/><circle cx="${c2}" cy="${cy}" r="${R}" fill="rgba(229,57,53,.12)" stroke="${P.ink}" stroke-width="3"/>`
        + tx(c1 - R * 0.35, 30, d.links, P.ink, 26, 'middle', 'font-weight="700"') + tx(c2 + R * 0.35, 30, d.rechts, P.ink, 26, 'middle', 'font-weight="700"') + tx(W / 2, cy - R + 30, d.mitte, P.acc, 20);
      return { svg: doc(W, H, s), w: W, h: H };
    } },

  // ---------- Sachfächer ----------
  zeitstrahl: { name: 'Zeitstrahl', gruppe: 'Sachfächer', def: { start: 1900, ende: 2020, schritt: 10, teile: 1, abstand: 2, beschr: 'alle' },
    felder: [{ k: 'start', l: 'Startjahr', typ: 'zahl' }, { k: 'ende', l: 'Endjahr', typ: 'zahl' }, { k: 'schritt', l: 'Schrittweite (Jahre)', typ: 'zahl', min: 1 }, { k: 'teile', l: 'Unterteilung', typ: 'zahl', min: 1, max: 20 }, { k: 'abstand', l: 'Abstand je Schritt (cm)', typ: 'zahl', min: 0.5, max: 10 }, { k: 'beschr', l: 'Beschriftung', typ: 'auswahl', opts: [['alle', 'alle großen Striche'], ['rand', 'nur Anfang und Ende'], ['keine', 'keine']] }],
    gen: (d, P) => strahl(d, P, true) },
  klima: { name: 'Klimadiagramm', gruppe: 'Sachfächer', def: { ort: '', temp: '', nied: '' },
    felder: [{ k: 'ort', l: 'Ort (Überschrift)', typ: 'text' }, { k: 'temp', l: 'Temperatur °C, 12 Werte mit ; (leer = Vorlage)', typ: 'text' }, { k: 'nied', l: 'Niederschlag mm, 12 Werte mit ; (leer = Vorlage)', typ: 'text' }],
    gen: (d, P) => klima(d, P) },
  protokoll: { name: 'Versuchsprotokoll', gruppe: 'Sachfächer', def: { titel: 'Versuch', felder: 'Frage\nVermutung\nMaterial\nDurchführung (Skizze)\nBeobachtung\nErgebnis' },
    felder: [{ k: 'titel', l: 'Titel', typ: 'text' }, { k: 'felder', l: 'Abschnitte (einer pro Zeile)', typ: 'textarea' }],
    gen: (d, P) => {
      const z = zeilen(d.felder), W = 24 * CM, cols = 2, bw = (W - 30) / cols, bh = 4.4 * CM, top = 70, rows = Math.ceil(z.length / cols), H = top + rows * (bh + 12) + 10;
      let s = tx(W / 2, 34, d.titel, P.ink, 32, 'middle', 'font-weight="700"');
      z.forEach((t, i) => { const x = 10 + (i % cols) * (bw + 10), y = top + Math.floor(i / cols) * (bh + 12); s += rc(x, y, bw, bh, P.ink, 'none', 2.5, 'rx="12"') + rc(x, y, bw, 44, 'none', P.head, 0, 'rx="12"') + tx(x + 16, y + 22, t, P.ink, 22, 'start', 'font-weight="600"'); });
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  abdeckung: { name: 'Abdeckung', gruppe: 'Werkzeug', def: { text: 'Abdeckung – zum Aufdecken verschieben' },
    felder: [{ k: 'text', l: 'Beschriftung', typ: 'text' }],
    gen: (d, P) => {
      const W = 16 * CM, H = 8 * CM;
      const s = `<defs><pattern id="st" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="#cfd6df"/><rect width="14" height="28" fill="#c3cbd5"/></pattern></defs>` + rc(0, 0, W, H, '#8a96a6', 'url(#st)', 4, 'rx="10"') + tx(W / 2, H / 2, d.text, '#37414f', 26, 'middle', 'font-weight="600"');
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  bevoelkerung: { name: 'Bevölkerungspyramide', gruppe: 'Sachfächer', def: { titel: '', prozent: 6 },
    felder: [{ k: 'titel', l: 'Land / Jahr (Überschrift)', typ: 'text' }, { k: 'prozent', l: 'Achse bis … %', typ: 'zahl', min: 2, max: 20 }],
    gen: (d, P) => {
      const rows = 18, rh = 0.6 * CM, half = 7 * CM, mid = 2 * CM, top = d.titel ? 90 : 50, m = 20, W = 2 * half + mid + 2 * m, H = top + rows * rh + 60;
      const pmax = Math.max(1, Math.round(d.prozent)), cx = W / 2;
      let s = d.titel ? tx(cx, 30, d.titel, P.ink, 26, 'middle', 'font-weight="700"') : '';
      s += tx(cx - mid / 2 - half / 2, top - 22, 'Männer', P.acc, 20, 'middle', 'font-weight="600"') + tx(cx + mid / 2 + half / 2, top - 22, 'Frauen', P.red, 20, 'middle', 'font-weight="600"');
      for (let i = 0; i <= pmax; i++) {
        const dx = mid / 2 + half * i / pmax;
        for (const sg of [-1, 1]) s += ln(cx + sg * dx, top, cx + sg * dx, top + rows * rh, P.grid, 1) + tx(cx + sg * dx, top + rows * rh + 16, i, P.ink, 14);
      }
      s += tx(cx, top + rows * rh + 40, 'Anteil an der Bevölkerung in %', P.ink, 15);
      for (let r = 0; r <= rows; r++) { const y = top + r * rh; s += ln(cx - mid / 2 - half, y, cx - mid / 2, y, P.grid, 1) + ln(cx + mid / 2, y, cx + mid / 2 + half, y, P.grid, 1); }
      for (let r = 0; r < rows; r++) { const a = (rows - 1 - r) * 5; s += tx(cx, top + r * rh + rh / 2, r === 0 ? '85+' : a + '–' + (a + 4), P.ink, 12); }
      s += ln(cx - mid / 2, top, cx - mid / 2, top + rows * rh, P.ink, 2.5) + ln(cx + mid / 2, top, cx + mid / 2, top + rows * rh, P.ink, 2.5);
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  periodensystem: { name: 'Periodensystem (Hauptgruppen)', gruppe: 'Sachfächer', def: { perioden: 4, nummern: true, leer: false, farbig: true },
    felder: [{ k: 'perioden', l: 'Perioden', typ: 'zahl', min: 1, max: 6 }, { k: 'nummern', l: 'Ordnungszahlen', typ: 'check' }, { k: 'leer', l: 'Nur leere Kästchen (zum Ausfüllen)', typ: 'check' }, { k: 'farbig', l: 'Metalle / Halbmetalle / Nichtmetalle / Edelgase färben', typ: 'check' }],
    gen: (d, P) => {
      const PS = [[['H', 1], null, null, null, null, null, null, ['He', 2]], ['Li Be B C N O F Ne', 3], ['Na Mg Al Si P S Cl Ar', 11], ['K Ca Ga Ge As Se Br Kr', [19, 20, 31, 32, 33, 34, 35, 36]], ['Rb Sr In Sn Sb Te I Xe', [37, 38, 49, 50, 51, 52, 53, 54]], ['Cs Ba Tl Pb Bi Po At Rn', [55, 56, 81, 82, 83, 84, 85, 86]]]
        .map(r => Array.isArray(r[0]) || r[0] === null ? r : r[0].split(' ').map((e, i) => [e, Array.isArray(r[1]) ? r[1][i] : r[1] + i]));
      const kl = e => /^(He|Ne|Ar|Kr|Xe|Rn)$/.test(e) ? 3 : /^(B|Si|Ge|As|Sb|Te)$/.test(e) ? 1 : /^(H|C|N|O|F|P|S|Cl|Se|Br|I|At)$/.test(e) ? 2 : 0;
      const fill = ['#ffe0b2', '#dcedc8', '#bbdefb', '#e1bee7'];
      const n = T.clamp(Math.round(d.perioden), 1, 6), c = 2.1 * CM, m = 10, lh = 36, W = 8 * c + 2 * m + 30, H = n * c + 2 * m + lh;
      let s = '';
      ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].forEach((g, i) => { s += tx(m + 30 + i * c + c / 2, m + lh / 2, g, P.ink, 18, 'middle', 'font-weight="700"'); });
      for (let r = 0; r < n; r++) {
        s += tx(m + 12, m + lh + r * c + c / 2, r + 1, P.ink, 18, 'middle', 'font-weight="700"');
        PS[r].forEach((el, i) => {
          if (!el) return; const x = m + 30 + i * c, y = m + lh + r * c;
          s += rc(x + 2, y + 2, c - 4, c - 4, P.ink, d.farbig && !d.leer && P.ink === '#1a1a1a' ? fill[kl(el[0])] : 'none', 2, 'rx="6"');
          if (!d.leer) { s += tx(x + c / 2, y + c / 2 + 6, el[0], P.ink, 30, 'middle', 'font-weight="700"'); if (d.nummern) s += tx(x + 10, y + 16, el[1], P.ink, 13, 'start'); }
        });
      }
      return { svg: doc(W, H, s), w: W, h: H };
    } },
  schaltzeichen: { name: 'Schaltzeichen', gruppe: 'Sachfächer', def: { art: 'lampe' },
    felder: [{ k: 'art', l: 'Bauteil', typ: 'auswahl', opts: [['batterie', 'Batterie / Spannungsquelle'], ['lampe', 'Glühlampe'], ['schalter', 'Schalter (offen)'], ['schalterzu', 'Schalter (geschlossen)'], ['widerstand', 'Widerstand'], ['motor', 'Motor'], ['amperemeter', 'Strommesser (A)'], ['voltmeter', 'Spannungsmesser (V)'], ['diode', 'Diode'], ['knoten', 'Leitung mit Knoten']] }],
    gen: (d, P) => {
      const W = 4 * CM, H = 2 * CM, cy = H / 2, I = P.ink; let s = '';
      const wire = (a, b) => ln(a, cy, b, cy, I, 3);
      const kreis = t => wire(0, 50) + wire(110, W) + `<circle cx="80" cy="${cy}" r="30" fill="none" stroke="${I}" stroke-width="3"/>` + (t ? tx(80, cy + 1, t, I, 26, 'middle', 'font-weight="700"') : '');
      switch (d.art) {
        case 'batterie': s = wire(0, 72) + wire(88, W) + ln(72, cy - 30, 72, cy + 30, I, 3) + ln(88, cy - 16, 88, cy + 16, I, 7) + tx(60, 14, '+', I, 18) + tx(102, 14, '−', I, 18); break;
        case 'lampe': s = kreis('') + ln(59, cy - 21, 101, cy + 21, I, 3) + ln(59, cy + 21, 101, cy - 21, I, 3); break;
        case 'schalter': s = wire(0, 50) + wire(112, W) + ln(50, cy, 106, cy - 26, I, 3) + `<circle cx="50" cy="${cy}" r="4" fill="${I}"/>`; break;
        case 'schalterzu': s = wire(0, 50) + wire(110, W) + ln(50, cy, 110, cy - 4, I, 3) + `<circle cx="50" cy="${cy}" r="4" fill="${I}"/>`; break;
        case 'widerstand': s = wire(0, 45) + wire(115, W) + rc(45, cy - 14, 70, 28, I, 'none', 3); break;
        case 'motor': s = kreis('M'); break;
        case 'amperemeter': s = kreis('A'); break;
        case 'voltmeter': s = kreis('V'); break;
        case 'diode': s = wire(0, 60) + wire(100, W) + `<polygon points="60,${cy - 20} 60,${cy + 20} 96,${cy}" fill="none" stroke="${I}" stroke-width="3"/>` + ln(98, cy - 20, 98, cy + 20, I, 3); break;
        default: s = wire(0, W) + ln(80, cy, 80, H, I, 3) + `<circle cx="80" cy="${cy}" r="7" fill="${I}"/>`;
      }
      return { svg: doc(W, H, s), w: W, h: H };
    } }
};

// Funktionsterm sicher in eine Funktion übersetzen (nur Zahlen, x, + − · : ^ und einige Funktionen)
T.parseFunktion = term => {
  let t = String(term).toLowerCase().replace(/^\s*(f\s*\(x\)|y)\s*=\s*/, '').replace(/,/g, '.').replace(/·|×/g, '*').replace(/:/g, '/').replace(/−/g, '-').replace(/\s+/g, '');
  if (!t || /[^0-9x+\-*/^().a-z]/.test(t)) return null;
  const words = t.match(/[a-z]+/g) || [];
  if (words.some(w => !/^(x|sin|cos|tan|sqrt|wurzel|abs|pi|e)$/.test(w))) return null;
  t = t.replace(/wurzel/g, 'sqrt').replace(/(\d)(x|\(|sin|cos|tan|sqrt|abs|pi)/g, '$1*$2').replace(/x(\(|\d|x)/g, 'x*$1').replace(/\)(\(|x|\d)/g, ')*$1')
    .replace(/(^|\()-/g, '$10-').replace(/\^/g, '**').replace(/\b(sin|cos|tan|sqrt|abs)\b/g, 'Math.$1').replace(/\bpi\b/g, 'Math.PI').replace(/\be\b/g, 'Math.E');
  try { const fn = new Function('x', 'return (' + t + ');'); fn(1); return fn; } catch (e) { return null; }
};

function strahl(d, P, jahr) {
  let a = +d.start, b = +d.ende; if (b <= a) b = a + 1;
  const st = Math.max(+d.schritt || 1, (b - a) / 200), n = Math.round((b - a) / st), sub = T.clamp(Math.round(d.teile) || 1, 1, 20), u = d.abstand * CM, m = 40;
  const W = n * u + 2 * m + 30, H = 110, y = 46;
  let s = ln(m - 14, y, m + n * u + 26, y, P.ink, 3) + arrowHead(m + n * u + 32, y, 0, P.ink, 16);
  for (let i = 0; i <= n; i++) {
    const x = m + i * u; s += ln(x, y - 14, x, y + 14, P.ink, 3);
    if (d.beschr === 'alle' || (d.beschr === 'rand' && (i === 0 || i === n))) s += tx(x, y + 34, num(a + i * st, jahr), P.ink, 20);
    if (i < n) for (let k = 1; k < sub; k++) { const xx = x + k * u / sub, half = sub % 2 === 0 && k === sub / 2; s += ln(xx, y - (half ? 10 : 7), xx, y + (half ? 10 : 7), P.ink, half ? 2.5 : 1.8); }
  }
  return { svg: doc(W, H, s), w: W, h: H };
}
function tabelle(d, P) {
  const nz = T.clamp(Math.round(d.zeilen), 1, 40), ns = T.clamp(Math.round(d.spalten), 1, 20), cw = d.breite * CM, rh = d.hoehe * CM, m = 6, W = ns * cw + 2 * m, H = nz * rh + 2 * m;
  const z = String(d.inhalt || '').split(/\r?\n/).map(l => l.split(/;|\t/));
  let s = '';
  if (d.kopf) s += d.farben ? d.farben.map((c, i) => rc(m + i * cw, m, cw, rh, 'none', c, 0)).join('') : rc(m, m, W - 2 * m, rh, 'none', P.head, 0);
  for (let r = 0; r < nz; r++) for (let c = 0; c < ns; c++) {
    const t = (z[r] && z[r][c] || '').trim(); if (!t) continue;
    const fs = Math.min(24, rh * 0.45); s += tx(m + c * cw + cw / 2, m + r * rh + rh / 2, t, P.ink, fs, 'middle', d.kopf && r === 0 ? 'font-weight="700"' : '');
  }
  for (let r = 0; r <= nz; r++) s += ln(m, m + r * rh, W - m, m + r * rh, P.ink, (r === 1 && d.kopf) || r === 0 || r === nz ? 3 : 1.6);
  for (let c = 0; c <= ns; c++) s += ln(m + c * cw, m, m + c * cw, H - m, P.ink, c === 0 || c === ns ? 3 : 1.6);
  return { svg: doc(W, H, s), w: W, h: H };
}
function rechnen(d, P) {
  const c = CM, st = T.clamp(Math.round(d.stellen), 2, 9), zl = T.clamp(Math.round(d.zeilen), 2, 8), m = 10;
  const names = ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'M', 'ZM', 'HM'];
  let cols, rows, s = '', head = d.kopf ? 1 : 0;
  if (d.art === 'plus' || d.art === 'minus') { cols = st + 2; rows = head + zl + 1 + 1; }  // Zahlen, Übertragszeile, Ergebnis
  else if (d.art === 'mal') { cols = st * 2 + 2; rows = head + 1 + zl + 1; }
  else { cols = st * 2 + 4; rows = head + 1 + zl * 2; }
  const W = cols * c + 2 * m, H = rows * c + 2 * m, X = i => m + i * c, Y = j => m + j * c;
  // Kästchengitter
  for (let i = 0; i <= cols; i++) s += ln(X(i), Y(0), X(i), Y(rows), P.grid, 1.2);
  for (let j = 0; j <= rows; j++) s += ln(X(0), Y(j), X(cols), Y(j), P.grid, 1.2);
  const right = cols - 1; // rechte Randspalte frei
  if (d.kopf) for (let k = 0; k < st && k < names.length; k++) { const i = (d.art === 'plus' || d.art === 'minus') ? right - 1 - k : (d.art === 'mal' ? right - 1 - k : st - 1 - k + 1); s += rc(X(i), Y(0), c, c, 'none', P.head, 0) + tx(X(i) + c / 2, Y(0) + c / 2, names[k], P.ink, 16, 'middle', 'font-weight="700"'); }
  if (d.art === 'plus' || d.art === 'minus') {
    const sign = d.art === 'plus' ? '+' : '−', ue = head + zl;
    s += tx(X(0) + c / 2, Y(ue - 1) + c / 2, sign, P.ink, 30, 'middle', 'font-weight="700"');
    s += rc(X(1), Y(ue), (cols - 2) * c, c, 'none', P.soft, 0) + tx(X(0) + c / 2, Y(ue) + c / 2, 'Ü', P.red, 14);
    s += ln(X(1), Y(ue + 1) - 2, X(right), Y(ue + 1) - 2, P.ink, 3) + ln(X(1), Y(ue + 1) + 3, X(right), Y(ue + 1) + 3, P.ink, 3);
  } else if (d.art === 'mal') {
    const r0 = head; s += tx(X(st + 1) + c / 2, Y(r0) + c / 2, '·', P.ink, 34, 'middle', 'font-weight="700"');
    s += ln(X(1), Y(r0 + 1), X(right), Y(r0 + 1), P.ink, 3);
    s += ln(X(1), Y(rows - 1) - 2, X(right), Y(rows - 1) - 2, P.ink, 3) + ln(X(1), Y(rows - 1) + 3, X(right), Y(rows - 1) + 3, P.ink, 3);
  } else {
    const r0 = head; s += tx(X(st + 1) + c / 2, Y(r0) + c / 2, ':', P.ink, 30, 'middle', 'font-weight="700"') + tx(X(st + 3) + c / 2, Y(r0) + c / 2, '=', P.ink, 30, 'middle', 'font-weight="700"');
    for (let k = 0; k < zl; k++) { const y = Y(r0 + 2 + k * 2); s += ln(X(1 + k), y, X(Math.min(st + 1, 2 + k + 1)), y, P.ink, 2.5); }
  }
  return { svg: doc(W, H, s), w: W, h: H };
}
function klima(d, P) {
  const pick = s => String(s || '').split(/[;\s]+/).map(v => parseFloat(v.replace(',', '.'))).filter(v => !isNaN(v));
  const t = pick(d.temp), n = pick(d.nied), hasT = t.length === 12, hasN = n.length === 12;
  const tmin = Math.min(-10, ...(hasT ? t : [0])), tmax = Math.max(30, ...(hasT ? t : [0]));
  const lo = Math.floor(tmin / 10) * 10, hi = Math.ceil(tmax / 10) * 10, cw = 1.3 * CM, ph = 0.7 * CM; // 10 °C ≙ 20 mm
  const steps = (hi - lo) / 10, Hc = steps * 2 * ph * 2, ml = 80, mr = 80, top = d.ort ? 80 : 40, W = 12 * cw + ml + mr, H = top + Hc + 70;
  const Yt = v => top + (hi - v) / 10 * 2 * ph * 2, Yn = v => Yt(v / 2);
  let s = d.ort ? tx(W / 2, 34, d.ort, P.ink, 28, 'middle', 'font-weight="700"') : '';
  for (let v = lo; v <= hi; v += 10) {
    s += ln(ml, Yt(v), ml + 12 * cw, Yt(v), P.grid, 1.2) + tx(ml - 12, Yt(v), v, P.red, 18, 'end');
    if (v >= 0) s += tx(ml + 12 * cw + 12, Yt(v), v * 2, '#1565c0', 18, 'start');
  }
  if (hasN) n.forEach((v, i) => { s += rc(ml + i * cw + 6, Yn(v), cw - 12, Yt(0) - Yn(v), 'none', 'rgba(30,136,229,.55)', 0); });
  if (hasT) s += `<polyline points="${t.map((v, i) => f(ml + i * cw + cw / 2) + ',' + f(Yt(v))).join(' ')}" fill="none" stroke="#e53935" stroke-width="4" stroke-linejoin="round"/>`;
  s += ln(ml, Yt(lo), ml, Yt(hi) - 20, P.red, 3) + ln(ml + 12 * cw, Yt(0), ml + 12 * cw, Yt(hi) - 20, '#1565c0', 3) + ln(ml, Yt(0), ml + 12 * cw, Yt(0), P.ink, 3);
  s += tx(ml, Yt(hi) - 34, '°C', P.red, 18) + tx(ml + 12 * cw, Yt(hi) - 34, 'mm', '#1565c0', 18);
  'JFMAMJJASOND'.split('').forEach((m, i) => { s += tx(ml + i * cw + cw / 2, Yt(lo) + 22, m, P.ink, 18); if (i) s += ln(ml + i * cw, Yt(0) - 6, ml + i * cw, Yt(0) + 6, P.ink, 2); });
  return { svg: doc(W, H, s), w: W, h: H };
}

// ---------- Karten (Daten in karten.js) ----------
const F_KARTE = [{ k: 'namen', l: 'Namen anzeigen', typ: 'check' }, { k: 'staedte', l: 'Hauptstädte anzeigen', typ: 'check' }, { k: 'fluesse', l: 'Flüsse (nur Deutschland)', typ: 'check' }, { k: 'farbig', l: 'Land und Meer färben', typ: 'check' }];
for (const [id, name] of [['karte_de', 'Deutschland'], ['karte_eu', 'Europa'], ['karte_welt', 'Welt']]) {
  T.BAUSTEINE[id] = { name, gruppe: 'Karten', def: { namen: false, staedte: false, fluesse: false, farbig: true, gradnetz: false },
    felder: id === 'karte_welt' ? [{ k: 'namen', l: 'Kontinente und Ozeane beschriften', typ: 'check' }, { k: 'gradnetz', l: 'Äquator, Wende- und Polarkreise', typ: 'check' }, { k: 'farbig', l: 'Land und Meer färben', typ: 'check' }] : F_KARTE.filter(x => id === 'karte_de' || x.k !== 'fluesse'),
    gen: (d, P) => T.karteSVG ? T.karteSVG(id, d, P, doc, esc) : { svg: doc(100, 100, ''), w: 100, h: 100 } };
}

// ---------- Erzeugung & Bilder ----------
T.palette = dark => pal(dark, dark ? '#f4f4f0' : '#1a1a1a');
T.genObj = (k, d, dark) => T.BAUSTEINE[k].gen({ ...T.BAUSTEINE[k].def, ...d }, T.palette(dark));
const imgCache = new WeakMap();
T.objImage = (o, dark) => {
  let c = imgCache.get(o.d);
  if (c && c.dark === dark) return c.img;
  const img = new Image();
  img.onload = () => { T.render(); };
  if (o.k === 'bild' || o.k === 'graph') img.src = o.d.src;
  else if (T.BAUSTEINE[o.k]) img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(o.k, o.d, dark).svg);
  imgCache.set(o.d, { dark, img }); return img;
};
// Text mit echten Brüchen: „3/4“ wird als Zähler über Bruchstrich über Nenner gesetzt
const FRAC = /(\d+)\s*\/\s*(\d+)/g;
const fontOf = (d, s) => `${d.fett ? 700 : 400} ${s}px Segoe UI`;
// Kästchenschrift: jedes Zeichen sitzt in einem Kästchen (d.karo = Kästchengröße), Brüche über zwei Kästchenzeilen
function karoMetrics(d) {
  const g = d.karo, lines = [];
  for (let raw of String(d.text).split('\n')) {
    const segs = []; let last = 0, m, hasF = false; FRAC.lastIndex = 0;
    const lab = raw.match(/^\s*([a-z]{1,2}\))\s*/); // „a)“ in ein Kästchen, danach ein Kästchen frei
    if (lab) { segs.push({ t: 's', text: lab[1], w: g, klein: true }, { t: 's', text: ' ', w: g }); raw = raw.slice(lab[0].length); }
    const buchst = c => /[A-Za-zÄÖÜäöüß]/.test(c || '');
    const plain = t => { // wie im Heft: keine leeren Kästchen um Zahlen und Rechenzeichen, nur zwischen Wörtern
      const z = [...t];
      z.forEach((ch, i) => { if (ch.trim() || (buchst(z[i - 1]) && buchst(z[i + 1]))) segs.push({ t: 's', text: ch, w: g }); });
    };
    while ((m = FRAC.exec(raw))) { plain(raw.slice(last, m.index)); segs.push({ t: 'f', z: m[1], n: m[2], w: Math.max(m[1].length, m[2].length) * g }); last = m.index + m[0].length; hasF = true; }
    plain(raw.slice(last));
    lines.push({ segs, w: segs.reduce((a, s) => a + s.w, 0), lh: hasF ? 2 * g : g });
  }
  return { w: Math.max(g, ...lines.map(l => l.w)), h: lines.reduce((a, l) => a + l.lh, 0), lines, karo: true };
}
function drawKaro(ctx, d, m, color) {
  const g = d.karo, fs = g * 0.62; let y = -m.h / 2;
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = fontOf(d, fs);
  for (const l of m.lines) {
    const mid = y + l.lh / 2; let x = -m.w / 2;
    for (const s of l.segs) {
      if (s.t === 's') { if (s.text.trim()) { if (s.klein) ctx.font = fontOf(d, fs * 0.72); ctx.fillText(s.text, x + g / 2, mid); if (s.klein) ctx.font = fontOf(d, fs); } }
      else {
        const cells = s.w / g, put = (txt, row) => { const off = cells - txt.length; [...txt].forEach((ch, i) => ctx.fillText(ch, x + (off + i) * g + g / 2, y + row * g + g / 2)); };
        put(s.z, 0); put(s.n, 1);
        ctx.lineWidth = Math.max(2, g * 0.05); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + g * 0.12, y + g); ctx.lineTo(x + s.w - g * 0.12, y + g); ctx.stroke();
      }
      x += s.w;
    }
    y += l.lh;
  }
  ctx.textAlign = 'left';
}
T.textMetrics = d => {
  if (d.karo) return karoMetrics(d);
  const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d'));
  const S0 = d.size, fs = S0 * 0.82, lines = [];
  for (const raw of String(d.text).split('\n')) {
    const segs = []; let last = 0, m, hasF = false; FRAC.lastIndex = 0;
    const plain = t => { if (!t) return; c.font = fontOf(d, S0); segs.push({ t: 's', text: t, w: c.measureText(t).width }); };
    while ((m = FRAC.exec(raw))) {
      plain(raw.slice(last, m.index)); c.font = fontOf(d, fs);
      segs.push({ t: 'f', z: m[1], n: m[2], w: Math.max(c.measureText(m[1]).width, c.measureText(m[2]).width) + S0 * 0.36 });
      last = m.index + m[0].length; hasF = true;
    }
    plain(raw.slice(last));
    lines.push({ segs, w: segs.reduce((a, s) => a + s.w, 0), lh: hasF ? S0 * 2.35 : S0 * 1.3 });
  }
  const w = Math.max(10, ...lines.map(l => l.w));
  return { w: w + S0 * 0.4, h: lines.reduce((a, l) => a + l.lh, 0) + S0 * 0.2, lines };
};
T.drawText = (ctx, d, m, color) => {
  if (m.karo) return drawKaro(ctx, d, m, color);
  const S0 = d.size, fs = S0 * 0.82; let y = -m.h / 2 + S0 * 0.1;
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.textBaseline = 'middle';
  for (const l of m.lines) {
    const mid = y + l.lh / 2; let x = -m.w / 2 + S0 * 0.2;
    for (const s of l.segs) {
      if (s.t === 's') { ctx.font = fontOf(d, S0); ctx.textAlign = 'left'; ctx.fillText(s.text, x, mid); }
      else {
        const cx = x + s.w / 2; ctx.font = fontOf(d, fs); ctx.textAlign = 'center';
        ctx.fillText(s.z, cx, mid - S0 * 0.58); ctx.fillText(s.n, cx, mid + S0 * 0.62);
        ctx.lineWidth = Math.max(1.5, S0 * 0.075); ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(x + S0 * 0.1, mid + S0 * 0.02); ctx.lineTo(x + s.w - S0 * 0.1, mid + S0 * 0.02); ctx.stroke();
      }
      x += s.w;
    }
    y += l.lh;
  }
  ctx.textAlign = 'left';
};
T.drawObj = (ctx, o, dark, px) => {
  ctx.save(); ctx.translate(o.x + o.w / 2, o.y + o.h / 2); if (o.r) ctx.rotate(o.r * Math.PI / 180);
  if (o.k === 'text') {
    const m = T.textMetrics(o.d); ctx.scale(o.w / m.w, o.h / m.h);
    T.drawText(ctx, o.d, m, T.inkColor(o.d.c, dark));
  } else {
    const img = T.objImage(o, dark);
    if (img.complete && img.naturalWidth) ctx.drawImage(img, -o.w / 2, -o.h / 2, o.w, o.h);
    else { ctx.strokeStyle = '#999'; ctx.setLineDash([8 * px, 6 * px]); ctx.lineWidth = px; ctx.strokeRect(-o.w / 2, -o.h / 2, o.w, o.h); }
  }
  ctx.restore();
};
T._svg = { doc, ln, tx, rc, f, esc, pal }; // für flexibel.js
T.thumb = k => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, {}, false).svg);
})();
