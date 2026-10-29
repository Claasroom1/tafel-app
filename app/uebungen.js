// Tafel-App – interaktive Übungen (Kärtchen sortieren, Reihenfolge, Zuordnen, Lückentext, Multiple Choice),
// Diagramme, Messwerttabelle und Formelsammlung
'use strict';
(function () {
const { doc, ln, tx, rc, f } = T._svg, B = T.BAUSTEINE, CM = T.CM;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const zeilen = s => String(s || '').split(/\r?\n/).map(z => z.trim()).filter(Boolean);
const mess = (t, fs, fett) => { const c = T._mctx || (T._mctx = document.createElement('canvas').getContext('2d')); c.font = `${fett ? 700 : 400} ${fs}px Segoe UI`; return c.measureText(String(t)).width; };
const PASTELL = ['#e3f2fd', '#fff3e0', '#e8f5e9', '#fce4ec', '#ede7f6', '#e0f7fa'];

// ---------- Bausteine der Übungen (werden über die Übungs-Leiste erzeugt) ----------
B.ukarte = { name: 'Kärtchen', gruppe: 'intern', def: { text: '', w: 200, h: 70 }, felder: [],
  gen: (d, P) => {
    const W = d.w, H = d.h, st = d.status, rand = st === 'richtig' ? '#16a34a' : st === 'falsch' ? '#dc2626' : (d.mc ? '#5b5bd6' : '#64748b');
    const fs = Math.min(H * 0.42, (W - (d.mc ? 70 : 24)) / Math.max(3, String(d.text).length) * 1.9);
    let s = rc(3, 3, W - 6, H - 6, rand, st === 'richtig' ? '#dcfce7' : st === 'falsch' ? '#fee2e2' : (d.fuell || '#ffffff'), st ? 5 : 3, 'rx="16"');
    if (d.mc) { s += rc(18, H / 2 - 16, 32, 32, '#334155', d.gewaehlt ? '#5b5bd6' : '#fff', 3, 'rx="7"'); if (d.gewaehlt) s += `<path d="M24 ${H / 2} l7 8 l14 -16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`; }
    s += tx(d.mc ? 60 + (W - 60) / 2 : W / 2, H / 2, d.text, '#1b1f2a', fs, 'middle', 'font-weight="600"');
    if (st) s += `<circle cx="${W - 18}" cy="18" r="15" fill="${rand}"/>` + tx(W - 18, 19, st === 'richtig' ? '✓' : '✗', '#fff', 20, 'middle', 'font-weight="700"');
    return { svg: doc(W, H, s), w: W, h: H };
  } };
B.uziel = { name: 'Ablagefeld', gruppe: 'intern', def: { titel: '', w: 260, h: 300 }, felder: [],
  gen: (d) => {
    const W = d.w, H = d.h; let s = rc(3, 3, W - 6, H - 6, '#94a3b8', d.fuell || 'rgba(148,163,184,.08)', 3, 'rx="18" stroke-dasharray="12 8"');
    if (d.titel) s += rc(3, 3, W - 6, 54, 'none', d.kopf || '#e2e8f0', 0, 'rx="18"') + tx(W / 2, 31, d.titel, '#1b1f2a', Math.min(26, (W - 20) / Math.max(4, d.titel.length) * 1.9), 'middle', 'font-weight="700"');
    if (d.nr != null) s += tx(W / 2, H / 2, d.nr, '#cbd5e1', Math.min(W, H) * 0.5, 'middle', 'font-weight="700"');
    return { svg: doc(W, H, s), w: W, h: H };
  } };
B.uknopf = { name: 'Übungsknopf', gruppe: 'intern', def: { text: '✓ Prüfen', w: 220, h: 70 }, felder: [],
  gen: (d) => { const W = d.w, H = d.h; const s = `<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${d.farbe || '#5b5bd6'}"/><stop offset="1" stop-color="${d.farbe2 || '#8e5bd6'}"/></linearGradient></defs>` + rc(2, 2, W - 4, H - 4, 'none', 'url(#g)', 0, `rx="${H / 2}"`) + tx(W / 2, H / 2, d.text, '#fff', H * 0.38, 'middle', 'font-weight="700"'); return { svg: doc(W, H, s), w: W, h: H }; } };
// Lückentext: Wörter in [eckigen Klammern] werden zu Lücken (Teile g0, g1 …)
B.luecktext = { name: 'Lückentext', gruppe: 'intern', def: { text: '', breite: 1100 }, felder: [],
  gen: (d, P) => {
    const fs = 30, lh = 74, W = d.breite, pad = 20, teile = []; let s = '', x = pad, y = pad, gi = 0;
    const loes = [...String(d.text).matchAll(/\[([^\]]+)\]/g)].map(m => m[1]), lw = Math.max(120, ...loes.map(l => mess(l, fs, true) + 50));
    for (const stueck of String(d.text).split(/(\[[^\]]+\])/)) {
      if (!stueck) continue;
      if (/^\[.*\]$/.test(stueck)) {
        if (x + lw > W - pad) { x = pad; y += lh; }
        s += rc(x, y + 6, lw, lh - 16, '#94a3b8', 'rgba(148,163,184,.12)', 2.5, 'rx="10" stroke-dasharray="8 6"'); teile.push({ id: 'g' + gi++, x, y: y + 6, w: lw, h: lh - 16 }); x += lw + 12; continue;
      }
      for (const wort of stueck.split(/(\s+)/)) {
        if (!wort) continue; if (/^\s+$/.test(wort)) { x += mess(' ', fs); continue; }
        if (wort === '\n') { x = pad; y += lh; continue; }
        const ww = mess(wort, fs); if (x + ww > W - pad) { x = pad; y += lh; }
        s += `<text x="${f(x)}" y="${f(y + lh / 2)}" font-size="${fs}" fill="${P.ink}" dominant-baseline="central">${esc(wort)}</text>`; x += ww;
      }
    }
    const H = y + lh + pad;
    return { svg: doc(W, H, rc(2, 2, W - 4, H - 4, P.grid, P.ink === '#1a1a1a' ? '#fff' : 'rgba(255,255,255,.06)', 2, 'rx="16"') + s), w: W, h: H, teile };
  } };

// ---------- Übungen erzeugen ----------
const mische = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function objekt(k, d, x, y, k2 = 1) { const g = T.genObj(k, d, false); return { t: 'o', id: T.uid(), k, d, x, y, w: g.w * k2, h: g.h * k2, r: 0 }; }
T.UEBUNGEN = {
  gruppen: { n: 'Kärtchen sortieren', bsp: 'Säugetiere: Hund, Katze, Wal, Fledermaus\nVögel: Amsel, Pinguin, Strauß\nFische: Hai, Forelle', hilfe: 'Eine Gruppe pro Zeile: „Gruppe: Begriff, Begriff, …“' },
  reihe: { n: 'Reihenfolge', bsp: 'Ei\nRaupe\nPuppe\nSchmetterling', hilfe: 'Ein Schritt pro Zeile – in der richtigen Reihenfolge eintippen, die App mischt.' },
  paare: { n: 'Zuordnen', bsp: 'dog = Hund\ncat = Katze\nhorse = Pferd\nbird = Vogel', hilfe: 'Ein Paar pro Zeile: „links = rechts“' },
  luecke: { n: 'Lückentext', bsp: 'Die Sonne [geht] im Osten [auf] und im [Westen] unter.\nAblenker: Norden, steht', hilfe: 'Lückenwörter in [eckige Klammern]. Optional letzte Zeile „Ablenker: …“ für falsche Wörter.' },
  mc: { n: 'Multiple Choice', bsp: 'Welche Tiere sind Säugetiere?\n*Wal\nHai\n*Fledermaus\nPinguin', hilfe: 'Erste Zeile: Frage. Dann eine Antwort pro Zeile, richtige mit * davor.' }
};
T.uebungErzeugen = (typ, text) => {
  const pg = T.page(), z = pg.view.z, k = T.clamp(1 / z, 0.5, 4), uid = T.uid(), r = T.viewRect(), x0 = r.x0 + 60 * k, y0 = r.y0 + 90 * k, neu = [];
  const L = zeilen(text); if (!L.length) { T.toast('Bitte zuerst Inhalte eintippen.'); return; }
  const karte = (text, extra, x, y) => neu.push(objekt('ukarte', { text, w: Math.max(170, mess(text, 28, true) + 50), h: 70, uid, ziehbar: true, ...extra }, x, y, k));
  let unten = y0;
  if (typ === 'gruppen') {
    const G = L.map(l => { const [t, rest] = l.split(/:(.*)/s); return { t: t.trim(), w: (rest || '').split(/[,;]/).map(s => s.trim()).filter(Boolean) }; }).filter(g => g.w.length);
    const breite = 280, hoehe = Math.max(260, 90 + Math.max(...G.map(g => g.w.length)) * 80);
    G.forEach((g, i) => neu.push(objekt('uziel', { titel: g.t, w: breite, h: hoehe, uid, id: 'z' + i, kopf: PASTELL[i % 6] }, x0 + i * (breite + 30) * k, y0, k)));
    unten = y0 + (hoehe + 50) * k; let x = x0, y = unten;
    mische(G.flatMap((g, i) => g.w.map(w => [w, 'z' + i, i]))).forEach(([w, soll]) => { const wb = (Math.max(170, mess(w, 28, true) + 50) + 20) * k; if (x + wb > x0 + G.length * (breite + 30) * k && x > x0) { x = x0; y += 90 * k; } karte(w, { soll }, x, y); x += wb; });
  } else if (typ === 'reihe') {
    const sw = 220; L.forEach((l, i) => neu.push(objekt('uziel', { nr: i + 1, w: sw, h: 110, uid, id: 'z' + i }, x0 + i * (sw + 20) * k, y0, k)));
    unten = y0 + 150 * k; let x = x0; mische(L.map((l, i) => [l, 'z' + i])).forEach(([l, soll]) => { karte(l, { soll, w: 200 }, x, unten); x += 220 * k; });
  } else if (typ === 'paare') {
    const P = L.map(l => l.split(/\s*=\s*/)).filter(p => p.length >= 2), lw = Math.max(200, ...P.map(p => mess(p[0], 28, true) + 50)), rw = Math.max(200, ...P.map(p => mess(p[1], 28, true) + 50));
    P.forEach((p, i) => { const y = y0 + i * 90 * k; neu.push(objekt('ukarte', { text: p[0], w: lw, h: 70, uid, fuell: '#f1f5f9' }, x0, y, k), objekt('uziel', { w: rw + 20, h: 84, uid, id: 'z' + i }, x0 + (lw + 30) * k, y - 7 * k, k)); });
    const xr = x0 + (lw + rw + 140) * k; mische(P.map((p, i) => [p[1], 'z' + i])).forEach(([t, soll], i) => karte(t, { soll, w: rw }, xr, y0 + i * 90 * k));
    unten = y0 + P.length * 90 * k;
  } else if (typ === 'luecke') {
    let ablenker = []; const textZ = L.filter(l => { const m = l.match(/^ablenker\s*:\s*(.*)$/i); if (m) { ablenker = m[1].split(/[,;]/).map(s => s.trim()).filter(Boolean); return false; } return true; });
    const t = textZ.join('\n'), lt = objekt('luecktext', { text: t, breite: 1100, uid }, x0, y0, k); neu.push(lt);
    const loes = [...t.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]); unten = y0 + lt.h + 40 * k; let x = x0, y = unten;
    mische(loes.map((w, i) => [w, 'g' + i]).concat(ablenker.map(a => [a, null]))).forEach(([w, soll]) => { const wb = (Math.max(150, mess(w, 28, true) + 50) + 20) * k; if (x + wb > x0 + 1100 * k) { x = x0; y += 90 * k; } karte(w, { soll, w: Math.max(150, mess(w, 28, true) + 50), luecke: lt.id }, x, y); x += wb; });
    unten = y;
  } else if (typ === 'mc') {
    const frage = L[0], opts = L.slice(1);
    const tg = { text: frage, size: 36, c: '#1b1f2a', fett: true }, m = T.textMetrics(tg); neu.push({ t: 'o', id: T.uid(), k: 'text', d: tg, x: x0, y: y0, w: m.w * k, h: m.h * k, r: 0 });
    const bw = Math.max(320, ...opts.map(o => mess(o.replace(/^\*/, ''), 28, true) + 120));
    opts.forEach((o, i) => neu.push(objekt('ukarte', { text: o.replace(/^\*\s*/, ''), richtig: o.startsWith('*'), mc: true, gewaehlt: false, w: bw, h: 76, uid }, x0, y0 + (m.h + 20 + i * 90) * k, k)));
    unten = y0 + (m.h + 20 + opts.length * 90) * k;
  }
  // Knöpfe unter der Übung
  const ky = Math.max(...neu.map(o => o.y + o.h)) + 30 * k;
  [['✓ Prüfen', 'pruefen', '#16a34a', '#22c55e'], ['↺ Mischen', 'mischen', '#5b5bd6', '#8e5bd6'], ['💡 Lösung', 'loesung', '#f59e0b', '#f97316']].forEach(([t, a, c1, c2], i) =>
    neu.push(objekt('uknopf', { text: t, aktion: a, uid, farbe: c1, farbe2: c2, typ }, x0 + i * 240 * k, ky, k)));
  T.snap(); neu.forEach(o => pg.items.push(o)); T.render();
  T.toast('Übung steht auf der Tafel – Kärtchen mit Finger oder Stift ziehen, dann „✓ Prüfen“.', 3500);
};

// ---------- Auswerten, Einrasten, Mischen, Lösung ----------
const mitte = o => [o.x + o.w / 2, o.y + o.h / 2];
function zielVon(karte, items) { // Ablagefeld bzw. Lücke, in der die Kartenmitte liegt
  const [cx, cy] = mitte(karte);
  for (const z of items) {
    if (z.k === 'uziel' && T.hitObj(z, cx, cy)) return { id: z.d.id, obj: z };
    if (z.k === 'luecktext') { const id = T.teilAt ? T.teilAtAlle(z, cx, cy) : null; if (id) return { id, obj: z, teil: id }; }
  }
  return null;
}
T.teilAtAlle = (o, x, y) => { const g = T.genObj(o.k, o.d, false); if (!g.teile) return null; const [lx, ly] = T.objLocal(o, x, y), sx = (lx + o.w / 2) * g.w / o.w, sy = (ly + o.h / 2) * g.h / o.h;
  const t = g.teile.find(t => sx >= t.x && sx <= t.x + t.w && sy >= t.y && sy <= t.y + t.h); return t ? t.id : null; };
const zielRechteck = (z, teil) => { if (!teil) return z; const g = T.genObj(z.k, z.d, false), t = g.teile.find(x => x.id === teil), [ax, ay] = T.svgZuWelt(z, g, t.x, t.y), [bx, by] = T.svgZuWelt(z, g, t.x + t.w, t.y + t.h); return { x: ax, y: ay, w: bx - ax, h: by - ay }; };
T.uebungEinrasten = karte => { // Kärtchen mittig in Ablagefeld/Lücke setzen; mehrere Kärtchen im Feld werden untereinander gestapelt
  const pg = T.page(), items = pg.items.filter(i => i.d && i.d.uid === karte.d.uid), z = zielVon(karte, items);
  let neu = { ...karte, d: { ...karte.d, status: null } };
  if (z) {
    const r = zielRechteck(z.obj, z.teil);
    if (z.obj.k === 'uziel' && z.obj.d.titel) { // Kategorie: unter der Überschrift stapeln
      const drin = items.filter(i => i.k === 'ukarte' && i.id !== karte.id && (zielVon(i, items) || {}).id === z.id).length, kopf = 64 * z.obj.h / T.genObj('uziel', z.obj.d, false).h;
      neu.x = r.x + (r.w - karte.w) / 2; neu.y = r.y + kopf + drin * (karte.h + 10);
    } else { neu.x = r.x + (r.w - karte.w) / 2; neu.y = r.y + (r.h - karte.h) / 2; }
  }
  T.replaceItem(neu);
};
T.uebungAktion = knopf => {
  const pg = T.page(), uid = knopf.d.uid, items = pg.items.filter(i => i.d && i.d.uid === uid), karten = items.filter(i => i.k === 'ukarte' && (i.d.ziehbar || i.d.mc));
  T.snap();
  if (knopf.d.aktion === 'pruefen') {
    let r = 0, n = 0;
    for (const c of karten) {
      let st;
      if (c.d.mc) { st = !!c.d.gewaehlt === !!c.d.richtig ? 'richtig' : 'falsch'; }
      else { const z = zielVon(c, items); if (c.d.soll == null) st = z ? 'falsch' : null; else st = z && z.id === c.d.soll ? 'richtig' : 'falsch'; }
      if (st) { n++; if (st === 'richtig') r++; }
      T.replaceItem({ ...c, d: { ...c.d, status: st } });
    }
    T.toast(r === n ? `🎉 Alles richtig! (${r} von ${n})` : `${r} von ${n} richtig – die roten Kärtchen noch einmal prüfen.`, 3500);
    if (r === n) T.beep && T.beep();
  } else if (knopf.d.aktion === 'mischen') {
    const xs = karten.map(c => c.x), ys = karten.map(c => c.y), x0 = Math.min(...xs), y0 = Math.min(...ys);
    const plaetze = mische(karten.map(c => [c.x, c.y]));
    if (knopf.d.typ === 'mc') karten.forEach(c => T.replaceItem({ ...c, d: { ...c.d, gewaehlt: false, status: null } }));
    else { // alle Kärtchen zurück in einen Stapelbereich unter der Übung
      const k = karten[0] ? karten[0].h / 70 : 1, start = Math.max(...items.filter(i => i.k !== 'ukarte' && i.k !== 'uknopf').map(i => i.y + i.h), y0) + 30 * k;
      let x = Math.min(...items.map(i => i.x)), y = start, xmax = x + 1100 * k; void plaetze; void x0;
      mische(karten).forEach(c => { if (c.d.soll === undefined && !c.d.ziehbar) return; if (x + c.w > xmax) { x = Math.min(...items.map(i => i.x)); y += c.h + 20 * k; } T.replaceItem({ ...c, x, y, d: { ...c.d, status: null } }); x += c.w + 20 * k; });
      const ky = y + 100 * k; items.filter(i => i.k === 'uknopf').forEach(b => T.replaceItem({ ...b, y: ky }));
    }
  } else if (knopf.d.aktion === 'loesung') {
    for (const c of karten) {
      if (c.d.mc) { T.replaceItem({ ...c, d: { ...c.d, gewaehlt: !!c.d.richtig, status: 'richtig' } }); continue; }
      if (c.d.soll == null) continue;
      const ziel = c.d.soll[0] === 'g' ? items.find(i => i.k === 'luecktext') : items.find(i => i.k === 'uziel' && i.d.id === c.d.soll); if (!ziel) continue;
      const r = zielRechteck(ziel, c.d.soll[0] === 'g' ? c.d.soll : null);
      T.replaceItem({ ...c, x: r.x + (r.w - c.w) / 2, y: r.y + (r.h - c.h) / 2, d: { ...c.d, status: 'richtig' } });
      if (ziel.k === 'uziel' && ziel.d.titel) T.uebungEinrasten(T.page().items.find(i => i.id === c.id));
    }
    T.page().items.filter(i => i.d && i.d.uid === uid && i.k === 'ukarte' && i.d.soll && i.d.ziehbar).forEach(c => T.replaceItem({ ...c, d: { ...c.d, status: 'richtig' } }));
  }
  T.render(); T.renderOver();
};

// ---------- Diagramm ----------
const zahlen = s => parseFloat(String(s).replace(',', '.'));
const schoen = roh => { const m = 10 ** Math.floor(Math.log10(roh || 1)), r = roh / m; return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * m; };
const DFARB = ['#5b5bd6', '#f59e0b', '#16a34a', '#ec4899', '#0ea5e9', '#8b5cf6'];
B.diagramm = { name: 'Diagramm', gruppe: 'Diagramme', def: { art: 'saeulen', titel: '', daten: 'Tag;Temperatur in °C\nMo;12\nDi;15\nMi;11\nDo;17\nFr;19', ausgleich: false },
  felder: [{ k: 'art', l: 'Art', typ: 'auswahl', opts: [['saeulen', 'Säulendiagramm'], ['balken', 'Balkendiagramm'], ['linie', 'Liniendiagramm'], ['punkte', 'Punktdiagramm (Messwerte)'], ['kreis', 'Kreisdiagramm']] },
    { k: 'titel', l: 'Überschrift', typ: 'text' }, { k: 'daten', l: 'Daten (erste Zeile: Beschriftungen, dann je Zeile „x;y“ – weitere Spalten = weitere Reihen)', typ: 'textarea' },
    { k: 'ausgleich', l: 'Ausgleichsgerade (bei Punkt-/Liniendiagramm)', typ: 'check' }],
  gen: (d, P) => diagramm(d, P) };
function diagramm(d, P) {
  const Z = String(d.daten || '').split(/\r?\n/).map(l => l.split(/;|\t/).map(s => s.trim())).filter(r => r.some(Boolean));
  const kopf = Z[0] || ['x', 'y'], rows = Z.slice(1), reihen = Math.max(1, kopf.length - 1);
  const W = 900, H = 600, top = d.titel ? 70 : 30, ml = 90, mr = 30, mb = 80, pw = W - ml - mr, ph = H - top - mb;
  let s = d.titel ? tx(W / 2, 34, d.titel, P.ink, 30, 'middle', 'font-weight="700"') : '';
  const werte = rows.map(r => r.slice(1).map(zahlen));
  if (d.art === 'kreis') {
    const v = rows.map(r => Math.max(0, zahlen(r[1]) || 0)), sum = v.reduce((a, b) => a + b, 0) || 1, cx = 320, cy = top + ph / 2 + 10, R = Math.min(ph / 2, 230);
    let a = -Math.PI / 2;
    v.forEach((x, i) => { const b = a + x / sum * 2 * Math.PI, gross = b - a > Math.PI ? 1 : 0;
      s += v.length === 1 ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${DFARB[i % 6]}"/>` : `<path d="M${cx} ${cy} L${f(cx + R * Math.cos(a))} ${f(cy + R * Math.sin(a))} A${R} ${R} 0 ${gross} 1 ${f(cx + R * Math.cos(b))} ${f(cy + R * Math.sin(b))}Z" fill="${DFARB[i % 6]}" stroke="#fff" stroke-width="3"/>`;
      const m = (a + b) / 2; if (x / sum > 0.04) s += tx(cx + R * 0.62 * Math.cos(m), cy + R * 0.62 * Math.sin(m), Math.round(x / sum * 100) + ' %', '#fff', 22, 'middle', 'font-weight="700"'); a = b; });
    rows.forEach((r, i) => { const y = top + 30 + i * 40; s += rc(600, y - 12, 24, 24, 'none', DFARB[i % 6], 0, 'rx="5"') + tx(636, y, `${r[0]} (${r[1]})`, P.ink, 20, 'start'); });
    return { svg: doc(W, H, s), w: W, h: H };
  }
  const xNum = ['punkte', 'linie'].includes(d.art) && rows.every(r => isFinite(zahlen(r[0])));
  const alle = werte.flat().filter(isFinite), xs = rows.map(r => zahlen(r[0]));
  let ymin = Math.min(0, ...alle), ymax = Math.max(...alle, 1); const sy = schoen((ymax - ymin) / 6); ymin = Math.floor(ymin / sy) * sy; ymax = Math.ceil(ymax / sy) * sy;
  let xmin = 0, xmax = rows.length, sx = 1;
  if (xNum) { xmin = Math.min(0, ...xs); xmax = Math.max(...xs); sx = schoen((xmax - xmin) / 8 || 1); xmin = Math.floor(xmin / sx) * sx; xmax = Math.ceil(xmax / sx) * sx || 1; }
  const balken = d.art === 'balken';
  const X = v => ml + (v - xmin) / (xmax - xmin) * pw, Y = v => top + ph - (v - ymin) / (ymax - ymin) * ph;
  const VX = v => ml + (v - ymin) / (ymax - ymin) * pw; // für Balken (Wert waagerecht)
  // Gitter und Achsen
  for (let v = ymin; v <= ymax + 1e-9; v += sy) { const p = balken ? VX(v) : Y(v); s += balken ? ln(p, top, p, top + ph, P.grid, 1) + tx(p, top + ph + 22, T.zahl(v, 3), P.ink, 16) : ln(ml, p, ml + pw, p, P.grid, 1) + tx(ml - 10, p, T.zahl(v, 3), P.ink, 16, 'end'); }
  s += ln(ml, top + ph, ml + pw, top + ph, P.ink, 2.5) + ln(ml, top, ml, top + ph, P.ink, 2.5);
  const yName = kopf.slice(1).join(' / '), xName = kopf[0];
  s += balken ? tx(ml + pw / 2, H - 22, yName, P.ink, 18) : tx(ml + pw / 2, H - 22, xName, P.ink, 18) + `<text x="24" y="${f(top + ph / 2)}" font-size="18" fill="${P.ink}" text-anchor="middle" transform="rotate(-90 24 ${f(top + ph / 2)})">${esc(yName)}</text>`;
  if (xNum) for (let v = xmin; v <= xmax + 1e-9; v += sx) s += ln(X(v), top + ph, X(v), top + ph + 6, P.ink, 2) + tx(X(v), top + ph + 22, T.zahl(v, 3), P.ink, 16);
  const n = rows.length, slot = (balken ? ph : pw) / Math.max(1, n), bb = slot * 0.7 / reihen;
  if (!xNum) rows.forEach((r, i) => { const m = (balken ? top : ml) + slot * (i + 0.5); s += balken ? tx(ml - 10, m, r[0], P.ink, 16, 'end') : tx(m, top + ph + 22, r[0], P.ink, 16); });
  for (let j = 0; j < reihen; j++) {
    const farbe = DFARB[j % 6], pkt = rows.map((r, i) => [xNum ? xs[i] : i, werte[i][j]]).filter(p => isFinite(p[1]));
    const px = ([i]) => xNum ? X(i) : ml + slot * (i + 0.5);
    if (d.art === 'saeulen') pkt.forEach(([i, v]) => { const x = ml + slot * (i + 0.15) + j * bb; s += rc(x, Math.min(Y(v), Y(0)), bb - 4, Math.abs(Y(v) - Y(0)), 'none', farbe, 0, 'rx="4"'); });
    else if (balken) pkt.forEach(([i, v]) => { const y = top + slot * (i + 0.15) + j * bb; s += rc(Math.min(VX(v), VX(0)), y, Math.abs(VX(v) - VX(0)), bb - 4, 'none', farbe, 0, 'rx="4"'); });
    else {
      if (d.art === 'linie') s += `<polyline points="${pkt.map(p => f(px(p)) + ',' + f(Y(p[1]))).join(' ')}" fill="none" stroke="${farbe}" stroke-width="4" stroke-linejoin="round"/>`;
      pkt.forEach(p => { s += d.art === 'punkte' ? `<path d="M${f(px(p) - 8)} ${f(Y(p[1]) - 8)}l16 16M${f(px(p) + 8)} ${f(Y(p[1]) - 8)}l-16 16" stroke="${farbe}" stroke-width="3.5"/>` : `<circle cx="${f(px(p))}" cy="${f(Y(p[1]))}" r="6" fill="${farbe}"/>`; });
      if (d.ausgleich && pkt.length >= 2) { // lineare Regression; bei Text-x (Mo, Di …) nur Trendlinie ohne Gleichung
        const nn = pkt.length, sx1 = pkt.reduce((a, p) => a + p[0], 0), sy1 = pkt.reduce((a, p) => a + p[1], 0), sxx = pkt.reduce((a, p) => a + p[0] * p[0], 0), sxy = pkt.reduce((a, p) => a + p[0] * p[1], 0);
        const m = (nn * sxy - sx1 * sy1) / (nn * sxx - sx1 * sx1 || 1), b = (sy1 - m * sx1) / nn;
        const [a0, a1] = xNum ? [xmin, xmax] : [0, n - 1];
        s += `<line x1="${f(px([a0]))}" y1="${f(Y(m * a0 + b))}" x2="${f(px([a1]))}" y2="${f(Y(m * a1 + b))}" stroke="${farbe}" stroke-width="2.5" stroke-dasharray="10 7" opacity=".8"/>`;
        if (xNum) s += tx(ml + pw - 10, top + 20 + j * 28, `y ≈ ${T.zahl(m, 3)}·x ${b < 0 ? '−' : '+'} ${T.zahl(Math.abs(b), 3)}`, farbe, 18, 'end', 'font-weight="600"');
      }
    }
    if (reihen > 1) s += rc(ml + 10 + j * 190, top - 26, 18, 18, 'none', farbe, 0, 'rx="4"') + tx(ml + 34 + j * 190, top - 17, kopf[j + 1], P.ink, 16, 'start');
  }
  return { svg: doc(W, H, s), w: W, h: H };
}
const dq = (l, fn) => ({ l, f: d => ({ d: fn({ ...d }) }) });
B.diagramm.schnell = ['saeulen', 'balken', 'linie', 'punkte', 'kreis'].map((a, i) => dq(['▮ Säulen', '▬ Balken', '📈 Linie', '✕ Punkte', '◔ Kreis'][i], d => { d.art = a; return d; }))
  .concat([dq('Ausgleichsgerade', d => { d.ausgleich = !d.ausgleich; return d; })]);

// ---------- Messwerttabelle ----------
B.messwerte = { name: 'Messwerttabelle', gruppe: 'Diagramme', def: { groessen: 'Zeit t in s;Weg s in m', zeilen: 6, werte: '' },
  felder: [{ k: 'groessen', l: 'Größen mit Einheit (mit ; trennen)', typ: 'text' }, { k: 'zeilen', l: 'Anzahl Messungen', typ: 'zahl', min: 1, max: 30 }, { k: 'werte', l: 'Messwerte (eine Messung pro Zeile, Werte mit ;) – oder leer lassen zum Hineinschreiben', typ: 'textarea' }],
  gen: (d, P) => { const g = String(d.groessen).split(';').map(s => s.trim()).filter(Boolean), w = String(d.werte || '').split(/\r?\n/).filter(l => l.trim());
    const n = Math.max(Math.round(d.zeilen), w.length);
    return B.tabelle.gen({ zeilen: n + 1, spalten: g.length + 1, kopf: true, breite: 4.2, hoehe: 1.3, sb: [1.6].concat(g.map(() => 4.2)), zh: d.zh, inhalt: ['Nr.'].concat(g).join(';') + '\n' + Array.from({ length: n }, (_, i) => [i + 1].concat((w[i] || '').split(';').map(s => s.trim())).join(';')).join('\n') }, P); } };
B.messwerte.schnell = [
  dq('＋ Messung', d => { d.zeilen = Math.round(d.zeilen) + 1; return d; }), dq('＋ Größe', d => { d.groessen += ';Neue Größe in …'; return d; }),
  { l: '📊 Diagramm daraus', aus: o => { const g = String(o.d.groessen).split(';').map(s => s.trim()), w = String(o.d.werte || '').split(/\r?\n/).filter(l => l.trim());
    if (!w.length) { T.toast('Erst Messwerte eintragen (✏️ Bearbeiten) – dann entsteht das Diagramm.', 4000); return; }
    const d = { ...B.diagramm.def, art: 'punkte', ausgleich: true, titel: '', daten: g.join(';') + '\n' + w.join('\n') }, gg = T.genObj('diagramm', d, false), k = o.h / gg.h * 1.6;
    T.snap(); T.addItem({ t: 'o', k: 'diagramm', d, x: o.x + o.w + 40, y: o.y, w: gg.w * k, h: gg.h * k, r: 0 }); T.toast('Diagramm steht neben der Tabelle.'); } }];

// ---------- Formelsammlung ----------
// {Zähler|Nenner} wird als Bruch gesetzt
B.formel = { name: 'Formel', gruppe: 'intern', def: { text: 'v = {s|t}', name: '', groesse: 44 }, felder: [{ k: 'text', l: 'Formel ({Zähler|Nenner} für Brüche)', typ: 'text' }, { k: 'name', l: 'Bezeichnung (optional)', typ: 'text' }],
  gen: (d, P) => {
    const fs = d.groesse || 44, kf = fs * 0.8, teile = String(d.text).split(/(\{[^{}]*\|[^{}]*\})/), pad = 16; let x = pad, s = '';
    const hatBruch = teile.some(t => /^\{/.test(t)), H = (hatBruch ? fs * 2.6 : fs * 1.6) + (d.name ? 40 : 0) + pad, mid = (d.name ? 40 : 0) + pad / 2 + (hatBruch ? fs * 1.3 : fs * 0.8);
    if (d.name) s += tx(pad, 22, d.name, P.acc, 20, 'start', 'font-weight="600"');
    for (const t of teile) {
      if (!t) continue;
      const m = t.match(/^\{([^|]*)\|([^}]*)\}$/);
      if (m) { const w = Math.max(mess(m[1], kf), mess(m[2], kf)) + 16; s += tx(x + w / 2, mid - kf * 0.62, m[1], P.ink, kf) + ln(x + 4, mid, x + w - 4, mid, P.ink, Math.max(2, fs * 0.06)) + tx(x + w / 2, mid + kf * 0.66, m[2], P.ink, kf); x += w; }
      else { s += `<text x="${f(x)}" y="${f(mid)}" font-size="${fs}" fill="${P.ink}" dominant-baseline="central" font-family="Cambria Math, Segoe UI, serif">${esc(t)}</text>`; x += mess(t, fs) * 1.04; }
    }
    const W = Math.max(x + pad, d.name ? mess(d.name, 20, true) + 2 * pad : 0);
    return { svg: doc(W, H, s), w: W, h: H };
  } };
T.FORMELN = {
  'Mathe: Flächen': [['Rechteck', 'A = a · b'], ['Quadrat', 'A = a²'], ['Dreieck', 'A = {g · h|2}'], ['Parallelogramm', 'A = g · h'], ['Trapez', 'A = {(a + c) · h|2}'], ['Kreis', 'A = π · r²'], ['Kreisumfang', 'u = 2 · π · r']],
  'Mathe: Körper': [['Würfel', 'V = a³'], ['Quader', 'V = a · b · c'], ['Prisma', 'V = G · h'], ['Zylinder', 'V = π · r² · h'], ['Pyramide', 'V = {1|3} · G · h'], ['Kegel', 'V = {1|3} · π · r² · h'], ['Kugel', 'V = {4|3} · π · r³'], ['Kugeloberfläche', 'O = 4 · π · r²']],
  'Mathe: Algebra & Funktionen': [['Satz des Pythagoras', 'a² + b² = c²'], ['Prozentwert', 'W = {G · p|100}'], ['Zinsen', 'Z = {K · p|100}'], ['Lineare Funktion', 'f(x) = m · x + b'], ['Steigung', 'm = {y₂ − y₁|x₂ − x₁}'], ['Scheitelpunktform', 'f(x) = a(x − d)² + e'], ['p-q-Formel', 'x₁,₂ = −{p|2} ± √({p²|4} − q)'], ['Binomische Formel', '(a + b)² = a² + 2ab + b²'], ['Dreisatz', '{a|b} = {c|d}']],
  'Physik': [['Geschwindigkeit', 'v = {s|t}'], ['Beschleunigung', 'a = {Δv|Δt}'], ['Kraft', 'F = m · a'], ['Gewichtskraft', 'F_G = m · g'], ['Dichte', 'ρ = {m|V}'], ['Druck', 'p = {F|A}'], ['Arbeit', 'W = F · s'], ['Leistung', 'P = {W|t}'], ['Ohmsches Gesetz', 'U = R · I'], ['Elektrische Leistung', 'P = U · I'], ['Kinetische Energie', 'E_kin = {1|2} · m · v²'], ['Lageenergie', 'E_pot = m · g · h'], ['Wirkungsgrad', 'η = {E_nutz|E_zu}']],
  'Chemie': [['Stoffmenge', 'n = {m|M}'], ['Konzentration', 'c = {n|V}'], ['Massenanteil', 'w = {m_Stoff|m_gesamt}'], ['Dichte', 'ρ = {m|V}']]
};
})();
