// Tafel-App – flexible Bausteine: Felder/Zellen/Äste einzeln vergrößern, schnell Zeilen, Spalten, Äste, Felder ergänzen.
// Jeder Generator liefert zusätzlich „teile“ (Rechtecke mit fester id). Damit lassen sich Felder antippen und
// Handschrift im Feld wandert mit, wenn sich davor etwas ändert.
'use strict';
(function () {
const { doc, ln, tx, rc, f } = T._svg, CM = T.CM, B = T.BAUSTEINE;
const zeilenRoh = s => { const a = String(s == null ? '' : s).split(/\r?\n/); while (a.length && !a[a.length - 1].trim()) a.pop(); return a; };
const arr = (a, n, def) => Array.from({ length: n }, (_, i) => (Array.isArray(a) && a[i] != null ? a[i] : def));
const ins = (a, i, v) => { a = a.slice(); a.splice(i, 0, v); return a; };
const del = (a, i) => { a = a.slice(); a.splice(i, 1); return a; };
const um = (v, d, min, max) => Math.round(T.clamp(v + d, min, max) * 10) / 10;
const rc2 = id => id.split(',').map(Number);

// ---------- Tabelle (auch für Satzbau) ----------
const parseTab = s => zeilenRoh(s).map(l => l.split(/;|\t/));
const serTab = z => z.map(r => (r || []).join(';')).join('\n');
function tabelle(d, P) {
  const nz = T.clamp(Math.round(d.zeilen), 1, 40), ns = T.clamp(Math.round(d.spalten), 1, 20);
  const sb = arr(d.sb, ns, d.breite).map(v => v * CM), zh = arr(d.zh, nz, d.hoehe).map(v => v * CM), m = 6;
  const xs = [m], ys = [m]; sb.forEach(w => xs.push(xs[xs.length - 1] + w)); zh.forEach(hh => ys.push(ys[ys.length - 1] + hh));
  const W = xs[ns] + m, H = ys[nz] + m, z = parseTab(d.inhalt), teile = [];
  let s = '';
  if (d.kopf) s += d.farben ? d.farben.map((c, i) => rc(xs[i], ys[0], sb[i], zh[0], 'none', c, 0)).join('') : rc(m, m, W - 2 * m, zh[0], 'none', P.head, 0);
  for (let r = 0; r < nz; r++) for (let c = 0; c < ns; c++) {
    teile.push({ id: r + ',' + c, x: xs[c], y: ys[r], w: sb[c], h: zh[r] });
    const t = (z[r] && z[r][c] || '').trim(); if (!t) continue;
    s += tx(xs[c] + sb[c] / 2, ys[r] + Math.min(zh[r], 1.6 * CM) / 2, t, P.ink, Math.min(24, Math.min(zh[r], 1.6 * CM) * 0.45), 'middle', d.kopf && r === 0 ? 'font-weight="700"' : '');
  }
  ys.forEach((y, r) => { s += ln(m, y, W - m, y, P.ink, (r === 1 && d.kopf) || r === 0 || r === nz ? 3 : 1.6); });
  xs.forEach((x, c) => { s += ln(x, m, x, H - m, P.ink, c === 0 || c === ns ? 3 : 1.6); });
  return { svg: doc(W, H, s), w: W, h: H, teile };
}
// Zeilen-/Spaltenoperationen für Tabellen (r, c = Zeile/Spalte; dz = Versatz der Inhaltszeilen)
const tabOps = {
  zeileEin: (d, r, nachher) => { const at = r + (nachher ? 1 : 0), z = parseTab(d.inhalt), n = Math.round(d.zeilen); while (z.length < n) z.push([]);
    return { d: { ...d, zeilen: n + 1, zh: ins(arr(d.zh, n, d.hoehe), at, arr(d.zh, n, d.hoehe)[r]), inhalt: serTab(ins(z, at, [])) }, map: id => { const [i, j] = rc2(id); return (i >= at ? i + 1 : i) + ',' + j; } }; },
  zeileWeg: (d, r) => { const n = Math.round(d.zeilen); if (n <= 1) return null; const z = parseTab(d.inhalt); while (z.length < n) z.push([]);
    return { d: { ...d, zeilen: n - 1, zh: del(arr(d.zh, n, d.hoehe), r), inhalt: serTab(del(z, r)) }, map: id => { const [i, j] = rc2(id); return i === r ? null : (i > r ? i - 1 : i) + ',' + j; } }; },
  spalteEin: (d, c, nachher) => { const at = c + (nachher ? 1 : 0), ns = Math.round(d.spalten), z = parseTab(d.inhalt).map(row => { const r2 = arr(row, ns, ''); r2.splice(at, 0, ''); return r2; });
    return { d: { ...d, spalten: ns + 1, sb: ins(arr(d.sb, ns, d.breite), at, arr(d.sb, ns, d.breite)[c]), inhalt: serTab(z) }, map: id => { const [i, j] = rc2(id); return i + ',' + (j >= at ? j + 1 : j); } }; },
  spalteWeg: (d, c) => { const ns = Math.round(d.spalten); if (ns <= 1) return null; const z = parseTab(d.inhalt).map(row => del(arr(row, ns, ''), c));
    return { d: { ...d, spalten: ns - 1, sb: del(arr(d.sb, ns, d.breite), c), inhalt: serTab(z) }, map: id => { const [i, j] = rc2(id); return j === c ? null : i + ',' + (j > c ? j - 1 : j); } }; },
  breite: (d, c, dv) => ({ d: { ...d, sb: arr(d.sb, Math.round(d.spalten), d.breite).map((v, i) => i === c ? um(v, dv, 1, 30) : v) } }),
  hoehe: (d, r, dv) => ({ d: { ...d, zh: arr(d.zh, Math.round(d.zeilen), d.hoehe).map((v, i) => i === r ? um(v, dv, 0.8, 20) : v) } })
};
B.tabelle.gen = tabelle;
B.tabelle.schnell = [
  { l: '＋ Zeile', f: d => tabOps.zeileEin(d, Math.round(d.zeilen) - 1, true) },
  { l: '＋ Spalte', f: d => tabOps.spalteEin(d, Math.round(d.spalten) - 1, true) },
  { l: '↕ alle höher', f: d => ({ d: { ...d, zh: arr(d.zh, Math.round(d.zeilen), d.hoehe).map(v => um(v, 1, 0.8, 20)) } }) },
  { l: '↔ alle breiter', f: d => ({ d: { ...d, sb: arr(d.sb, Math.round(d.spalten), d.breite).map(v => um(v, 1, 1, 30)) } }) }];
B.tabelle.teil = (d, id) => { const [r, c] = rc2(id); return [
  { l: '↕ Zeile höher', f: d => tabOps.hoehe(d, r, 1) }, { l: 'Zeile niedriger', f: d => tabOps.hoehe(d, r, -1) },
  { l: '↔ Spalte breiter', f: d => tabOps.breite(d, c, 1) }, { l: 'Spalte schmaler', f: d => tabOps.breite(d, c, -1) },
  { l: '＋ Zeile darunter', f: d => tabOps.zeileEin(d, r, true) }, { l: '＋ Zeile darüber', f: d => tabOps.zeileEin(d, r, false) },
  { l: '＋ Spalte rechts', f: d => tabOps.spalteEin(d, c, true) }, { l: '＋ Spalte links', f: d => tabOps.spalteEin(d, c, false) },
  { l: '🗑 Zeile', f: d => tabOps.zeileWeg(d, r), warn: 1 }, { l: '🗑 Spalte', f: d => tabOps.spalteWeg(d, c), warn: 1 }]; };

// Satzbau: Tabelle mit fester Kopfzeile; d.zeilen = Datenzeilen, d.zh/d.sb gelten für die ganze Tabelle
const SATZ = {
  svopt: [['Subject', '#e3f2fd'], ['Verb', '#ffebee'], ['Object', '#e8f5e9'], ['Place', '#fff8e1'], ['Time', '#f3e5f5']],
  felder: [['Vorfeld', '#e3f2fd'], ['linke Satzklammer', '#ffebee'], ['Mittelfeld', '#e8f5e9'], ['rechte Satzklammer', '#ffebee'], ['Nachfeld', '#f3e5f5']],
  satzglieder: [['Subjekt', '#e3f2fd'], ['Prädikat', '#ffebee'], ['Dativobjekt', '#e8f5e9'], ['Akkusativobjekt', '#fff8e1'], ['Adverbiale', '#f3e5f5']],
  wortarten: [['Nomen', '#e3f2fd'], ['Verben', '#ffebee'], ['Adjektive', '#e8f5e9'], ['Andere', '#f3e5f5']]
};
const satzTab = d => { const M = SATZ[d.art] || SATZ.svopt; return { zeilen: Math.round(d.zeilen) + 1, spalten: M.length, kopf: true, breite: 5.2, hoehe: 1.5, sb: d.sb, zh: d.zh, inhalt: M.map(x => x[0]).join(';') + '\n' + (d.inhalt || '') }; };
const vonTab = (d, t) => ({ ...d, zeilen: t.zeilen - 1, sb: t.sb, zh: t.zh, inhalt: t.inhalt.split('\n').slice(1).join('\n') });
B.satzbau.gen = (d, P) => { const M = SATZ[d.art] || SATZ.svopt; return tabelle({ ...satzTab(d), farben: P.ink === '#1a1a1a' ? M.map(x => x[1]) : null }, P); };
const satzOp = (op, ...a) => d => { const r = tabOps[op](satzTab(d), ...a); return r && { d: vonTab(d, r.d), map: r.map }; };
B.satzbau.schnell = [{ l: '＋ Zeile', f: d => satzOp('zeileEin', Math.round(d.zeilen), true)(d) }, { l: '↕ alle höher', f: d => ({ d: { ...d, zh: arr(d.zh, Math.round(d.zeilen) + 1, 1.5).map((v, i) => i ? um(v, 1, 0.8, 20) : v) } }) }];
B.satzbau.teil = (d, id) => { const [r, c] = rc2(id); const L = [
  { l: '↕ Zeile höher', f: satzOp('hoehe', r, 1) }, { l: 'Zeile niedriger', f: satzOp('hoehe', r, -1) },
  { l: '↔ Spalte breiter', f: satzOp('breite', c, 1) }, { l: 'Spalte schmaler', f: satzOp('breite', c, -1) },
  { l: '＋ Zeile darunter', f: satzOp('zeileEin', r, true) }];
  if (r > 0) L.push({ l: '🗑 Zeile', f: satzOp('zeileWeg', r), warn: 1 }); return L; };

// ---------- Vokabeltabelle ----------
const vokTeilen = l => { const i = l.search(/\s*(=|–|;|\t)\s*/); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i).replace(/^\s*(=|–|;|\t)\s*/, '')]; };
B.vokabeln.gen = (d, P) => {
  const z = zeilenRoh(d.inhalt).map(vokTeilen), n = Math.max(Math.round(d.zeilen), z.length);
  const sb = arr(d.sb, 2, d.breite).map(v => v * CM), zh = arr(d.zh, n, 1.4).map(v => v * CM), nr = 2 * CM, m = 8, kh = 1.4 * CM;
  const xs = [m, m + nr, m + nr + sb[0], m + nr + sb[0] + sb[1]], ys = [m + kh]; zh.forEach(v => ys.push(ys[ys.length - 1] + v));
  const W = xs[3] + m, H = ys[n] + m, teile = [];
  let s = rc(m, m, W - 2 * m, kh, 'none', P.head, 0) + tx(xs[1] + sb[0] / 2, m + kh / 2, d.links, P.ink, 24, 'middle', 'font-weight="700"') + tx(xs[2] + sb[1] / 2, m + kh / 2, d.rechts, P.ink, 24, 'middle', 'font-weight="700"');
  for (let r = 0; r < n; r++) {
    const y = ys[r], hh = zh[r], my = y + Math.min(hh, 1.4 * CM) / 2; if (r % 2) s += rc(m, y, W - 2 * m, hh, 'none', P.soft, 0);
    s += tx(m + nr / 2, my, r + 1, P.grid === '#c9d7e6' ? '#8795a8' : P.grid, 16);
    const [a, b] = z[r] || ['', ''];
    [[0, a], [1, b]].forEach(([i, t]) => {
      const x = xs[i + 1], w = sb[i], hide = (i === 0 && d.verdecken === 'links') || (i === 1 && d.verdecken === 'rechts');
      teile.push({ id: r + ',' + i, x, y, w, h: hh });
      if (hide && t) s += rc(x + 10, y + 10, w - 20, Math.min(hh, 1.4 * CM) - 20, 'none', P.ink === '#1a1a1a' ? '#cfd6df' : 'rgba(255,255,255,.3)', 0, 'rx="8"') + tx(x + w / 2, my, '?', P.ink, 22, 'middle', 'font-weight="700"');
      else if (t) s += tx(x + 16, my, t, P.ink, 24, 'start');
    });
  }
  s += ln(m, m, W - m, m, P.ink, 1.5); ys.forEach((y, i) => { s += ln(m, y, W - m, y, P.ink, i === 0 ? 3 : 1.5); });
  xs.forEach((x, i) => { s += ln(x, m, x, H - m, P.ink, i === 2 ? 3 : 1.5); });
  return { svg: doc(W, H, s), w: W, h: H, teile };
};
const vokZeile = (d, at, n0) => { const n = Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length), z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
  return { d: { ...d, zeilen: n + 1, inhalt: ins(z, at, '').join('\n'), zh: ins(arr(d.zh, n, 1.4), at, arr(d.zh, n, 1.4)[n0 == null ? n - 1 : n0]) }, map: id => { const [i, j] = rc2(id); return (i >= at ? i + 1 : i) + ',' + j; } }; };
B.vokabeln.schnell = [{ l: '＋ Zeile', f: d => vokZeile(d, Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length)) },
  { l: '↕ alle höher', f: d => { const n = Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length); return { d: { ...d, zh: arr(d.zh, n, 1.4).map(v => um(v, 1, 0.8, 20)) } }; } }];
B.vokabeln.teil = (d, id) => { const [r, c] = rc2(id), n = Math.max(Math.round(d.zeilen), zeilenRoh(d.inhalt).length); return [
  { l: '↕ Zeile höher', f: d => ({ d: { ...d, zh: arr(d.zh, n, 1.4).map((v, i) => i === r ? um(v, 1, 0.8, 20) : v) } }) },
  { l: 'Zeile niedriger', f: d => ({ d: { ...d, zh: arr(d.zh, n, 1.4).map((v, i) => i === r ? um(v, -1, 0.8, 20) : v) } }) },
  { l: '↔ Spalte breiter', f: d => ({ d: { ...d, sb: arr(d.sb, 2, d.breite).map((v, i) => i === c ? um(v, 1, 3, 30) : v) } }) },
  { l: 'Spalte schmaler', f: d => ({ d: { ...d, sb: arr(d.sb, 2, d.breite).map((v, i) => i === c ? um(v, -1, 3, 30) : v) } }) },
  { l: '＋ Zeile darunter', f: d => vokZeile(d, r + 1, r) }, { l: '＋ Zeile darüber', f: d => vokZeile(d, r, r) },
  { l: '🗑 Zeile', warn: 1, f: d => { if (n <= 1) return null; const z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
    return { d: { ...d, zeilen: n - 1, inhalt: del(z, r).join('\n'), zh: del(arr(d.zh, n, 1.4), r) }, map: id => { const [i, j] = rc2(id); return i === r ? null : (i > r ? i - 1 : i) + ',' + j; } }; } }]; };

// ---------- Mindmap ----------
B.mindmap.gen = (d, P) => {
  const n = T.clamp(Math.round(d.aeste), 1, 16), z = zeilenRoh(d.inhalt), gr = arr(d.gr, n, 1), mg = d.mg || 1, teile = [];
  const maxg = Math.max(1, ...gr), rx = (8.5 + 2.3 * (maxg - 1)) * CM + 1.3 * CM * (mg - 1), ry = (5.4 + 0.75 * (maxg - 1)) * CM + 0.6 * CM * (mg - 1);
  const boxes = gr.map((g, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, w = 4.6 * CM * g, hh = 1.5 * CM * g, cx = Math.cos(a) * rx, cy = Math.sin(a) * ry; return { a, w, h: hh, cx, cy }; });
  const mrx = 3.6 * CM * mg, mry = 1.5 * CM * mg;
  let x0 = -mrx, x1 = mrx, y0 = -mry, y1 = mry;
  boxes.forEach(b => { x0 = Math.min(x0, b.cx - b.w / 2); x1 = Math.max(x1, b.cx + b.w / 2); y0 = Math.min(y0, b.cy - b.h / 2); y1 = Math.max(y1, b.cy + b.h / 2); });
  const m = 20, ox = m - x0, oy = m - y0, W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
  let s = '';
  boxes.forEach((b, i) => {
    const ex = ox + b.cx, ey = oy + b.cy;
    s += `<path d="M ${f(ox)} ${f(oy)} Q ${f(ox + Math.cos(b.a) * rx * 0.55)} ${f(oy + Math.sin(b.a) * ry * 0.4)} ${f(ex)} ${f(ey)}" fill="none" stroke="${P.acc}" stroke-width="5" stroke-linecap="round"/>`;
    s += rc(ex - b.w / 2, ey - b.h / 2, b.w, b.h, P.ink, P.ink === '#1a1a1a' ? '#fff' : P.soft, 2.5, `rx="${f(Math.min(30, b.h / 2))}"`);
    if (z[i]) s += tx(ex, ey, z[i], P.ink, Math.min(22 * gr[i], 34));
    teile.push({ id: 'a' + i, x: ex - b.w / 2, y: ey - b.h / 2, w: b.w, h: b.h });
  });
  s += `<ellipse cx="${f(ox)}" cy="${f(oy)}" rx="${f(mrx)}" ry="${f(mry)}" fill="${P.head}" stroke="${P.ink}" stroke-width="3.5"/>` + tx(ox, oy, d.mitte, P.ink, Math.min(30 * mg, 44), 'middle', 'font-weight="700"');
  teile.push({ id: 'm', x: ox - mrx * 0.7, y: oy - mry * 0.7, w: mrx * 1.4, h: mry * 1.4 });
  return { svg: doc(W, H, s), w: W, h: H, teile };
};
const mmAst = (d, at) => { const n = Math.round(d.aeste), z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
  return { d: { ...d, aeste: n + 1, inhalt: ins(z, at, '').join('\n'), gr: ins(arr(d.gr, n, 1), at, 1) }, map: id => { if (id === 'm') return id; const i = +id.slice(1); return 'a' + (i >= at ? i + 1 : i); } }; };
B.mindmap.schnell = [{ l: '＋ Ast', f: d => mmAst(d, Math.round(d.aeste)) },
  { l: '⤢ alle Felder größer', f: d => ({ d: { ...d, gr: arr(d.gr, Math.round(d.aeste), 1).map(v => um(v, 0.25, 0.6, 3)) } }) },
  { l: 'alle kleiner', f: d => ({ d: { ...d, gr: arr(d.gr, Math.round(d.aeste), 1).map(v => um(v, -0.25, 0.6, 3)) } }) }];
B.mindmap.teil = (d, id) => {
  if (id === 'm') return [{ l: '⤢ Mitte größer', f: d => ({ d: { ...d, mg: um(d.mg || 1, 0.25, 0.6, 3) } }) }, { l: 'Mitte kleiner', f: d => ({ d: { ...d, mg: um(d.mg || 1, -0.25, 0.6, 3) } }) }];
  const i = +id.slice(1), n = Math.round(d.aeste); return [
    { l: '⤢ Feld größer', f: d => ({ d: { ...d, gr: arr(d.gr, n, 1).map((v, j) => j === i ? um(v, 0.25, 0.6, 3) : v) } }) },
    { l: 'Feld kleiner', f: d => ({ d: { ...d, gr: arr(d.gr, n, 1).map((v, j) => j === i ? um(v, -0.25, 0.6, 3) : v) } }) },
    { l: '＋ Ast daneben', f: d => mmAst(d, i + 1) },
    { l: '🗑 Ast', warn: 1, f: d => { if (n <= 1) return null; const z = zeilenRoh(d.inhalt); while (z.length < n) z.push('');
      return { d: { ...d, aeste: n - 1, inhalt: del(z, i).join('\n'), gr: del(arr(d.gr, n, 1), i) }, map: id => { if (id === 'm') return id; const j = +id.slice(1); return j === i ? null : 'a' + (j > i ? j - 1 : j); } }; } }];
};

// ---------- Versuchsprotokoll / Felder ----------
B.protokoll.def = { ...B.protokoll.def, sp: 2 };
B.protokoll.gen = (d, P) => {
  const z = zeilenRoh(d.felder), n = Math.max(1, z.length), hf = arr(d.hf, n, 4.4).map(v => v * CM), cols = +d.sp === 1 ? 1 : 2;
  const W = 24 * CM, bw = (W - 10 - 10 * cols) / cols, top = 70, teile = [];
  let s = tx(W / 2, 34, d.titel, P.ink, 32, 'middle', 'font-weight="700"'), y = top;
  for (let r = 0; r < Math.ceil(n / cols); r++) {
    const idx = Array.from({ length: cols }, (_, c) => r * cols + c).filter(i => i < n), rh = Math.max(...idx.map(i => hf[i]));
    idx.forEach((i, c) => {
      const x = 10 + c * (bw + 10);
      s += rc(x, y, bw, rh, P.ink, 'none', 2.5, 'rx="12"') + rc(x, y, bw, 44, 'none', P.head, 0, 'rx="12"') + tx(x + 16, y + 22, z[i] || '', P.ink, 22, 'start', 'font-weight="600"');
      teile.push({ id: 'f' + i, x, y, w: bw, h: rh });
    });
    y += rh + 12;
  }
  return { svg: doc(W, y, s), w: W, h: y, teile };
};
B.protokoll.felder = B.protokoll.felder.concat([{ k: 'sp', l: 'Spalten', typ: 'auswahl', opts: [[1, '1 Spalte'], [2, '2 Spalten']] }]);
const pfEin = (d, at, n0) => { const z = zeilenRoh(d.felder), n = z.length;
  return { d: { ...d, felder: ins(z, at, 'Neues Feld').join('\n'), hf: ins(arr(d.hf, n, 4.4), at, arr(d.hf, n, 4.4)[n0 == null ? n - 1 : n0] || 4.4) }, map: id => { const i = +id.slice(1); return 'f' + (i >= at ? i + 1 : i); } }; };
B.protokoll.schnell = [{ l: '＋ Feld', f: d => pfEin(d, zeilenRoh(d.felder).length) },
  { l: '▥ 1 / 2 Spalten', f: d => ({ d: { ...d, sp: +d.sp === 1 ? 2 : 1 } }) },
  { l: '↕ alle höher', f: d => ({ d: { ...d, hf: arr(d.hf, zeilenRoh(d.felder).length, 4.4).map(v => um(v, 1.5, 2, 30)) } }) }];
B.protokoll.teil = (d, id) => { const i = +id.slice(1), n = zeilenRoh(d.felder).length; return [
  { l: '↕ Feld höher', f: d => ({ d: { ...d, hf: arr(d.hf, n, 4.4).map((v, j) => j === i ? um(v, 1.5, 2, 30) : v) } }) },
  { l: 'Feld niedriger', f: d => ({ d: { ...d, hf: arr(d.hf, n, 4.4).map((v, j) => j === i ? um(v, -1.5, 2, 30) : v) } }) },
  { l: '＋ Feld danach', f: d => pfEin(d, i + 1, i) },
  { l: '🗑 Feld', warn: 1, f: d => { if (n <= 1) return null; const z = zeilenRoh(d.felder);
    return { d: { ...d, felder: del(z, i).join('\n'), hf: del(arr(d.hf, n, 4.4), i) }, map: id => { const j = +id.slice(1); return j === i ? null : 'f' + (j > i ? j - 1 : j); } }; } }]; };

// ---------- Zuordnung ----------
B.zuordnung.gen = (d, P) => {
  const L = zeilenRoh(d.links), R = zeilenRoh(d.rechts);
  const n = Math.max(L.length, R.length, Math.round(d.paare || 0), 1); while (L.length < n) L.push(''); while (R.length < n) R.push('');
  const RR = R.slice();
  if (d.mischen) { let seed = R.join('').length * 7 + 3; for (let i = RR.length - 1; i > 0; i--) { seed = (seed * 9301 + 49297) % 233280; const j = Math.floor(seed / 233280 * (i + 1)); [RR[i], RR[j]] = [RR[j], RR[i]]; } }
  const bw = (d.kb || 7) * CM, bh = (d.kh || 1.6) * CM, gap = 0.5 * CM, mid = 6 * CM, m = 14, top = d.titel ? 60 : 0, teile = [];
  const W = 2 * bw + mid + 2 * m, H = top + n * (bh + gap) - gap + 2 * m;
  let s = d.titel ? tx(W / 2, m + 22, d.titel, P.ink, 28, 'middle', 'font-weight="700"') : '';
  const card = (x, y, t, dotX) => rc(x, y, bw, bh, P.ink, P.soft, 2.5, 'rx="14"') + (t ? tx(x + bw / 2, y + bh / 2, t, P.ink, Math.min(24, bh * 0.4)) : '') + `<circle cx="${f(dotX)}" cy="${f(y + bh / 2)}" r="9" fill="${P.acc}"/>`;
  for (let i = 0; i < n; i++) {
    const y = m + top + i * (bh + gap);
    s += card(m, y, L[i], m + bw + 14) + card(m + bw + mid, y, RR[i], m + bw + mid - 14);
    teile.push({ id: 'l' + i, x: m, y, w: bw, h: bh }, { id: 'r' + i, x: m + bw + mid, y, w: bw, h: bh });
  }
  return { svg: doc(W, H, s), w: W, h: H, teile };
};
const zuPaar = (d, at) => { const L = zeilenRoh(d.links), R = zeilenRoh(d.rechts), n = Math.max(L.length, R.length, Math.round(d.paare || 0), 1); while (L.length < n) L.push(''); while (R.length < n) R.push('');
  return { d: { ...d, paare: n + 1, links: ins(L, at, '').join('\n'), rechts: ins(R, at, '').join('\n') }, map: id => { const i = +id.slice(1); return id[0] + (i >= at ? i + 1 : i); } }; };
B.zuordnung.schnell = [{ l: '＋ Paar', f: d => { const n = Math.max(zeilenRoh(d.links).length, zeilenRoh(d.rechts).length, Math.round(d.paare || 0), 1); return zuPaar(d, n); } },
  { l: '↔ Karten breiter', f: d => ({ d: { ...d, kb: um(d.kb || 7, 1, 3, 20) } }) }, { l: '↕ Karten höher', f: d => ({ d: { ...d, kh: um(d.kh || 1.6, 0.8, 1, 10) } }) },
  { l: 'Karten kleiner', f: d => ({ d: { ...d, kb: um(d.kb || 7, -1, 3, 20), kh: um(d.kh || 1.6, -0.8, 1, 10) } }) }];
B.zuordnung.teil = (d, id) => { const i = +id.slice(1); return [
  { l: '＋ Paar darunter', f: d => zuPaar(d, i + 1) },
  { l: '🗑 Paar', warn: 1, f: d => { const L = zeilenRoh(d.links), R = zeilenRoh(d.rechts), n = Math.max(L.length, R.length, Math.round(d.paare || 0), 1); if (n <= 1) return null; while (L.length < n) L.push(''); while (R.length < n) R.push('');
    return { d: { ...d, paare: n - 1, links: del(L, i).join('\n'), rechts: del(R, i).join('\n') }, map: id2 => { const j = +id2.slice(1); return j === i ? null : id2[0] + (j > i ? j - 1 : j); } }; } }]; };

// ---------- Schnellknöpfe für weitere Bausteine ----------
const q = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
B.zahlenstrahl.schnell = B.zeitstrahl.schnell = [
  q('＋ Schritt', d => { d.ende = +d.ende + +d.schritt; return d; }), q('− Schritt', d => { if (+d.ende - +d.schritt > +d.start) d.ende = +d.ende - +d.schritt; return d; }),
  q('↔ Abstand größer', d => { d.abstand = um(+d.abstand, 0.5, 0.5, 10); return d; }), q('Abstand kleiner', d => { d.abstand = um(+d.abstand, -0.5, 0.5, 10); return d; })];
B.koord.schnell = [
  q('＋ Bereich', d => { d.xmin--; d.xmax++; d.ymin--; d.ymax++; return d; }), q('− Bereich', d => { if (d.xmax - d.xmin > 2) { d.xmin++; d.xmax--; } if (d.ymax - d.ymin > 2) { d.ymin++; d.ymax--; } return d; }),
  q('⤢ Einheit größer', d => { d.einheit = um(+d.einheit, 0.5, 0.5, 5); return d; }), q('Einheit kleiner', d => { d.einheit = um(+d.einheit, -0.5, 0.5, 5); return d; }),
  q('▦ Raster ein/aus', d => { d.raster = !d.raster; return d; })];
B.bruchkreis.schnell = [q('＋ Teil', d => { d.n = Math.min(24, d.n + 1); return d; }), q('− Teil', d => { d.n = Math.max(1, d.n - 1); d.k = Math.min(d.k, d.n); return d; }),
  q('＋ färben', d => { d.k = Math.min(d.n, d.k + 1); return d; }), q('− färben', d => { d.k = Math.max(0, d.k - 1); return d; }), q('Bruch zeigen', d => { d.zeigen = !d.zeigen; return d; })];
B.bruchstreifen.schnell = [q('＋ Teil', d => { d.n = Math.min(40, d.n + 1); return d; }), q('− Teil', d => { d.n = Math.max(1, d.n - 1); d.k = Math.min(d.k, d.n); return d; }),
  q('＋ färben', d => { d.k = Math.min(d.n, d.k + 1); return d; }), q('− färben', d => { d.k = Math.max(0, d.k - 1); return d; }), q('Bruch zeigen', d => { d.zeigen = !d.zeigen; return d; })];
B.uhr.schnell = [q('+5 min', d => { let t = d.h * 60 + d.m + 5; t = (t + 1440) % 1440; d.h = Math.floor(t / 60); d.m = t % 60; return d; }), q('−5 min', d => { let t = d.h * 60 + d.m - 5; t = (t + 1440) % 1440; d.h = Math.floor(t / 60); d.m = t % 60; return d; }),
  q('+1 h', d => { d.h = (d.h + 1) % 24; return d; }), q('Zeiger ein/aus', d => { d.zeiger = !d.zeiger; return d; })];
B.stellenwert.schnell = [q('＋ Zeile', d => { d.zeilen = Math.min(12, d.zeilen + 1); return d; }), q('− Zeile', d => { d.zeilen = Math.max(1, d.zeilen - 1); return d; })];
B.rechnen.schnell = [q('＋ Zeile', d => { d.zeilen = Math.min(8, d.zeilen + 1); return d; }), q('− Zeile', d => { d.zeilen = Math.max(2, d.zeilen - 1); return d; }),
  q('＋ Stelle', d => { d.stellen = Math.min(9, d.stellen + 1); return d; }), q('− Stelle', d => { d.stellen = Math.max(2, d.stellen - 1); return d; })];
for (const k of ['karte_de', 'karte_eu', 'karte_welt']) B[k].schnell = [q('Namen ein/aus', d => { d.namen = !d.namen; return d; })].concat(k === 'karte_welt' ? [q('Gradnetz ein/aus', d => { d.gradnetz = !d.gradnetz; return d; })] : [q('Städte ein/aus', d => { d.staedte = !d.staedte; return d; })]);

// ---------- Teile antippen, Änderungen anwenden (Handschrift wandert mit) ----------
T.svgZuWelt = (o, g, sx, sy) => {
  const lx = sx * o.w / g.w - o.w / 2, ly = sy * o.h / g.h - o.h / 2, a = (o.r || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [o.x + o.w / 2 + lx * c - ly * s, o.y + o.h / 2 + lx * s + ly * c];
};
T.teilAt = (o, x, y) => {
  const Bk = B[o.k]; if (!Bk || !Bk.teil) return null;
  const g = T.genObj(o.k, o.d, false); if (!g.teile) return null;
  const [lx, ly] = T.objLocal(o, x, y), sx = (lx + o.w / 2) * g.w / o.w, sy = (ly + o.h / 2) * g.h / o.h;
  for (let i = g.teile.length - 1; i >= 0; i--) { const t = g.teile[i]; if (sx >= t.x && sx <= t.x + t.w && sy >= t.y && sy <= t.y + t.h) return t.id; }
  return null;
};
T.teilEcken = o => {
  if (!T.S.teil || T.S.teil.oid !== o.id) return null;
  const g = T.genObj(o.k, o.d, false), t = (g.teile || []).find(x => x.id === T.S.teil.id); if (!t) return null;
  return [[t.x, t.y], [t.x + t.w, t.y], [t.x + t.w, t.y + t.h], [t.x, t.y + t.h]].map(([a, b]) => T.svgZuWelt(o, g, a, b));
};
T.bausteinAendern = (o, akt) => {
  if (akt.aus) { akt.aus(o); return; } // Aktion mit eigener Wirkung (z. B. Diagramm aus Messwerttabelle)
  const r = akt.f(JSON.parse(JSON.stringify({ ...B[o.k].def, ...o.d }))); if (!r) { T.toast('Das geht hier nicht (mindestens ein Feld muss bleiben).'); return; }
  const gAlt = T.genObj(o.k, o.d, false), gNeu = T.genObj(o.k, r.d, false), k = o.w / gAlt.w;
  const neu = { ...o, d: r.d, w: gNeu.w * k, h: gNeu.h * k }; // gleicher Maßstab, obere linke Ecke bleibt
  const map = r.map || (id => id), pg = T.page();
  T.snap();
  // Handschrift in Feldern um die Verschiebung „ihres“ Feldes mitnehmen
  if (gAlt.teile && gNeu.teile) {
    pg.items = pg.items.map(it => {
      if (it.t !== 's') return it; const b = T.bbox(it), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
      if (!T.hitObj(o, cx, cy)) return it;
      const [lx, ly] = T.objLocal(o, cx, cy), sx = (lx + o.w / 2) * gAlt.w / o.w, sy = (ly + o.h / 2) * gAlt.h / o.h;
      const tAlt = gAlt.teile.slice().reverse().find(t => sx >= t.x && sx <= t.x + t.w && sy >= t.y && sy <= t.y + t.h); if (!tAlt) return it;
      const nid = map(tAlt.id), tNeu = nid != null && gNeu.teile.find(t => t.id === nid); if (!tNeu) return it;
      const [ax, ay] = T.svgZuWelt(o, gAlt, tAlt.x, tAlt.y), [bx, by] = T.svgZuWelt(neu, gNeu, tNeu.x, tNeu.y), dx = bx - ax, dy = by - ay;
      return dx || dy ? { ...it, p: it.p.map(q => [T.r1(q[0] + dx), T.r1(q[1] + dy), q[2]]) } : it;
    });
  }
  T.replaceItem(neu);
  if (T.S.teil && T.S.teil.oid === o.id) { const nid = map(T.S.teil.id); T.S.teil = nid != null && (gNeu.teile || []).some(t => t.id === nid) ? { oid: o.id, id: nid } : null; }
  T.renderOver(); T.onSelChange && T.onSelChange();
};
})();
