// Tafel-App – Notizen als Registerkarten am rechten Rand (mehrere Notizen) + Störungsnotiz je Stunde
'use strict';
(function () {
const S = T.S, F = T.ablage, h = T.h;
const panel = h('div', { id: 'notizen' }), reiter = h('div', { id: 'nreiter' });
document.body.append(panel, reiter);
let offen = false, aktiv = null, schrift = 26;
const FARBEN = ['#fff3a8', '#ffd6a5', '#ffc9de', '#cde7ff', '#c9f2d0', '#e3d5ff'];
const REGELN = 'Unsere Klassenregeln\n1. Wir hören einander zu und lassen andere ausreden.\n2. Wir melden uns, bevor wir sprechen.\n3. Wir gehen freundlich und respektvoll miteinander um.\n4. Wir halten Ordnung an unserem Platz.\n5. Wir sind pünktlich und haben unser Material dabei.';

// ---------- Speicher: dauerhafte Notizen & Störungen liegen im Ordner der Lehrkraft (Unterordner mit „_“) ----------
async function lesen(sub, name, fallbackKey) {
  if (F.root && T.opts.lehrkraft) {
    try { const d = await F.dir([T.opts.lehrkraft, sub], false); return JSON.parse(await (await (await d.getFileHandle(name)).getFile()).text()); } catch (e) { return null; }
  }
  try { return await T.idbGet(fallbackKey); } catch (e) { return null; }
}
async function schreiben(sub, name, fallbackKey, daten) {
  if (F.root && T.opts.lehrkraft) {
    const d = await F.dir([T.opts.lehrkraft, sub], true), fh = await d.getFileHandle(name, { create: true }), w = await fh.createWritable();
    await w.write(JSON.stringify(daten, null, 1)); await w.close(); return;
  }
  await T.idbSet(fallbackKey, daten);
}
const lehrkraft = () => T.opts.lehrkraft || 'Lehrkraft';

// ---------- Notizlisten ----------
let dauer = null, dauerT = 0, laedt = false;   // dauerhafte Notizen der Lehrkraft (alle Tafeln)
const neueNotiz = (titel, scope) => ({ id: T.uid(), titel, farbe: FARBEN[(alle().length) % FARBEN.length], modus: 'text', text: '', ink: [], scope });
async function ladeDauer() {
  if (dauer || laedt) return; laedt = true;
  const d = await lesen('_Notizen', 'notizen.json', 'notizen:' + lehrkraft());
  if (d && Array.isArray(d.notizen)) dauer = d.notizen;
  else if (d && (d.text || (d.ink && d.ink.length))) dauer = [{ id: T.uid(), titel: 'Notizen', farbe: FARBEN[0], modus: d.ink && d.ink.length && !d.text ? 'ink' : 'text', text: d.text || '', ink: d.ink || [], scope: 'dauer' }];
  else dauer = [];
  laedt = false; zeichneReiter(); if (offen) zeichne();
}
function sichereDauer() {
  clearTimeout(dauerT);
  dauerT = setTimeout(() => schreiben('_Notizen', 'notizen.json', 'notizen:' + lehrkraft(), { notizen: dauer, geaendert: new Date().toISOString() }).catch(e => T.toast('Notiz nicht gespeichert: ' + e.message)), 700);
}
function tafelListe() {
  const b = S.board; if (!b) return [];
  if (!Array.isArray(b.notizListe)) { // ältere Tafeln: eine einzelne Notiz übernehmen
    b.notizListe = [];
    if ((typeof b.notizen === 'string' && b.notizen) || (b.notizInk && b.notizInk.length)) b.notizListe.push({ id: T.uid(), titel: 'Tafel-Notiz', farbe: FARBEN[3], modus: b.notizen ? 'text' : 'ink', text: b.notizen || '', ink: b.notizInk || [], scope: 'tafel' });
    delete b.notizen; delete b.notizInk;
  }
  return b.notizListe;
}
const alle = () => (dauer || []).concat(tafelListe());
const finde = id => alle().find(n => n.id === id);
function geaendert(n) { if (n.scope === 'dauer') sichereDauer(); else T.changed(); }

// ---------- Reiter am Rand ----------
function zeichneReiter() {
  reiter.innerHTML = ''; reiter.style.display = S.board ? 'flex' : 'none';
  if (!S.board) return;
  if (!dauer) ladeDauer();
  for (const n of alle()) reiter.append(h('button', { class: 'nr' + (offen && aktiv === n.id ? ' on' : ''), style: { background: n.farbe }, title: n.titel + (n.scope === 'dauer' ? ' (dauerhaft)' : ' (nur diese Tafel)'), onclick: () => oeffne(n.id) },
    h('span', {}, (n.scope === 'dauer' ? '📌 ' : '') + (n.titel || 'Notiz'))));
  reiter.append(h('button', { class: 'nr stoer' + (offen && aktiv === 'stoer' ? ' on' : ''), title: 'Störungen dieser Stunde', onclick: () => oeffne('stoer') }, h('span', {}, '⚠ Störungen')));
  reiter.append(h('button', { class: 'nr plus', title: 'Neue Notiz', onclick: () => {
    const n = neueNotiz('Notiz ' + (alle().length + 1), 'tafel'); tafelListe().push(n); T.changed(); oeffne(n.id); // Standard: nur diese Tafel
  } }, h('span', {}, '＋')));
}
function oeffne(id) {
  if (offen && aktiv === id) { schliesse(); return; }
  aktiv = id; offen = true; panel.classList.add('auf'); document.body.classList.add('notizAuf'); document.getElementById('bNotizen').classList.add('on'); zeichne();
}
function schliesse() { offen = false; panel.classList.remove('auf'); document.body.classList.remove('notizAuf'); document.getElementById('bNotizen').classList.remove('on'); zeichneReiter(); }
T.toggleNotizen = () => { if (offen) schliesse(); else oeffne(aktiv && (aktiv === 'stoer' || finde(aktiv)) ? aktiv : (alle()[0] ? alle()[0].id : 'stoer')); };

// Schreibfläche für Handschrift (Stift schreibt, Radierer entfernt ganze Striche)
function inkArea(ink) {
  const BASIS = 440, cv = h('canvas', { class: 'nink' }), wrap = h('div', { class: 'ninkwrap' }, cv);
  let farbe = '#1a1a1a', staerke = 3, radier = false, live = null;
  const k = () => cv.clientWidth / BASIS;
  const male = () => {
    const d = devicePixelRatio || 1, w = cv.clientWidth, hh = cv.clientHeight; if (!w) return;
    if (cv.width !== Math.round(w * d) || cv.height !== Math.round(hh * d)) { cv.width = Math.round(w * d); cv.height = Math.round(hh * d); }
    const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.fillStyle = '#fffdf3'; c.fillRect(0, 0, w, hh);
    c.strokeStyle = '#d7e3ef'; c.lineWidth = 1; c.beginPath(); for (let y = 44 * k(); y < hh; y += 44 * k()) { c.moveTo(0, y); c.lineTo(w, y); } c.stroke();
    c.setTransform(d * k(), 0, 0, d * k(), 0, 0);
    for (const s of ink.get().concat(live ? [live] : [])) T.drawStroke(c, s, false, s === live ? T.buildPath(s) : undefined);
  };
  const druck = ev => ev.pointerType === 'pen' && ev.pressure && ev.pressure !== 0.5 ? T.r2(ev.pressure) : 0.5;
  const pos = e => { const r = cv.getBoundingClientRect(); return [T.r1((e.clientX - r.left) / k()), T.r1((e.clientY - r.top) / k())]; };
  const radiere = p => { const alt = ink.get(), neu = alt.filter(s => !T.hitStroke(s, p[0], p[1], 10)); if (neu.length !== alt.length) { ink.set(neu); male(); } };
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} const p = pos(e);
    if (radier || (e.buttons & 32)) { live = { radier: true }; radiere(p); return; }
    live = { t: 's', m: 'pen', c: farbe, w: staerke, p: [[p[0], p[1], druck(e)]] }; male();
  });
  cv.addEventListener('pointermove', e => {
    if (!live) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of (evs.length ? evs : [e])) {
      const p = pos(ev); if (live.radier) { radiere(p); continue; }
      const l = live.p[live.p.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 0.8) continue;
      live.p.push([T.r1(l[0] + (p[0] - l[0]) * 0.6), T.r1(l[1] + (p[1] - l[1]) * 0.6), druck(ev)]);
    }
    if (!live.radier) male();
  });
  const ende = () => { if (live && !live.radier && live.p.length) ink.set(ink.get().concat([live])); live = null; male(); };
  cv.addEventListener('pointerup', ende); cv.addEventListener('pointercancel', ende);
  const leiste = h('div', { class: 'row' });
  const knopf = (txt, fn, an) => { const b = h('button', { class: 'big' + (an ? ' on' : ''), onclick: () => { fn(); if (b.dataset.wahl) { [...leiste.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); } } }, txt); return b; };
  for (const [c, n] of [['#1a1a1a', 'schwarz'], ['#d32f2f', 'rot'], ['#1565c0', 'blau'], ['#2e7d32', 'grün']]) {
    const b = knopf('', () => { farbe = c; radier = false; }, c === farbe); b.dataset.wahl = 1; b.title = n;
    b.append(h('span', { style: { display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: c, verticalAlign: 'middle' } })); leiste.append(b);
  }
  const rb = knopf('🧽', () => { radier = true; }); rb.dataset.wahl = 1; rb.title = 'Radierer (ganze Striche)'; leiste.append(rb);
  leiste.append(knopf('↶', () => { const a = ink.get(); if (a.length) { ink.set(a.slice(0, -1)); male(); } }), knopf('🗑', () => { if (ink.get().length && confirm('Handschrift löschen?')) { ink.set([]); male(); } }));
  new ResizeObserver(() => male()).observe(cv);
  return { el: wrap, leiste };
}

// ---------- Inhalt des Feldes ----------
function zeichne() {
  zeichneReiter(); panel.innerHTML = '';
  if (aktiv === 'stoer') { panel.append(kopfzeile('⚠ Störungen dieser Stunde', 'var(--surface2)'), stoerTab()); return; }
  const n = finde(aktiv);
  if (!n) { panel.append(kopfzeile('Notizen', 'var(--surface2)'), h('div', { class: 'nbody' }, h('p', { class: 'hint' }, laedt ? 'Wird geladen …' : 'Mit ＋ am Rand eine Notiz anlegen.'))); return; }
  panel.append(notizKopf(n), notizBody(n));
}
const kopfzeile = (titel, farbe) => h('div', { class: 'nkopf', style: { background: farbe } }, h('b', { style: { flex: 1, fontSize: '18px', alignSelf: 'center' } }, titel), h('button', { class: 'nzu', title: 'Schließen', onclick: schliesse }, '×'));
function notizKopf(n) {
  const titel = h('input', { type: 'text', value: n.titel, class: 'ntitel', oninput: e => { n.titel = e.target.value; geaendert(n); zeichneReiter(); } });
  const farben = h('div', { class: 'row', style: { gap: '6px' } }, ...FARBEN.map(c => h('button', { class: 'nfarbe' + (n.farbe === c ? ' on' : ''), style: { background: c }, onclick: () => { n.farbe = c; geaendert(n); zeichne(); } })));
  const scope = h('div', { class: 'row' },
    h('button', { class: 'big' + (n.scope === 'dauer' ? ' on' : ''), title: 'Erscheint bei jeder Tafel', onclick: () => verschiebe(n, 'dauer') }, '📌 Dauerhaft'),
    h('button', { class: 'big' + (n.scope === 'tafel' ? ' on' : ''), title: 'Gehört nur zu dieser Tafel', onclick: () => verschiebe(n, 'tafel') }, 'Nur diese Tafel'),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'big warn', title: 'Notiz löschen', onclick: () => loesche(n) }, '🗑'));
  return h('div', { class: 'nkopf col', style: { background: n.farbe } }, h('div', { class: 'row' }, titel, h('button', { class: 'nzu', title: 'Schließen', onclick: schliesse }, '×')), farben, scope);
}
function verschiebe(n, ziel) {
  if (n.scope === ziel) return;
  if (n.scope === 'dauer') { dauer.splice(dauer.indexOf(n), 1); tafelListe().push(n); n.scope = 'tafel'; }
  else { const l = tafelListe(); l.splice(l.indexOf(n), 1); dauer.push(n); n.scope = 'dauer'; }
  sichereDauer(); T.changed(); zeichne();
}
function loesche(n) {
  if ((n.text || (n.ink && n.ink.length)) && !confirm(`Notiz „${n.titel}“ löschen?`)) return;
  const l = n.scope === 'dauer' ? dauer : tafelListe(); l.splice(l.indexOf(n), 1); geaendert(n);
  const rest = alle(); aktiv = rest.length ? rest[0].id : null; if (!rest.length) schliesse(); else zeichne();
}
function notizBody(n) {
  const box = h('div', { class: 'nbody' });
  box.append(h('div', { class: 'row' },
    h('button', { class: 'big' + (n.modus === 'ink' ? ' on' : ''), onclick: () => { n.modus = 'ink'; geaendert(n); zeichne(); } }, '✍ Mit Stift'),
    h('button', { class: 'big' + (n.modus !== 'ink' ? ' on' : ''), onclick: () => { n.modus = 'text'; geaendert(n); zeichne(); } }, '⌨ Tippen')));
  if (n.modus === 'ink') {
    const f = inkArea({ get: () => n.ink || [], set: v => { n.ink = v; geaendert(n); } });
    box.append(f.el, f.leiste);
  } else {
    const ta = h('textarea', { class: 'ntext', style: { fontSize: schrift + 'px' }, placeholder: 'z. B. Klassenregeln, Dienste, Merksätze …' }); ta.value = n.text || '';
    ta.addEventListener('input', () => { n.text = ta.value; geaendert(n); });
    const groesse = d => { schrift = T.clamp(schrift + d, 16, 60); ta.style.fontSize = schrift + 'px'; };
    box.append(ta, h('div', { class: 'row' },
      h('button', { class: 'big', onclick: () => groesse(-4) }, 'A−'), h('button', { class: 'big', onclick: () => groesse(4) }, 'A+'),
      h('button', { class: 'big', onclick: () => { ta.value = (ta.value ? ta.value + '\n\n' : '') + REGELN; ta.dispatchEvent(new Event('input')); } }, '📋 Regel-Vorlage'),
      h('button', { class: 'big', title: 'Notiz als Text auf die Tafel setzen', onclick: () => { if (!ta.value.trim() || !S.board) return; const d = { text: ta.value.trim(), size: 32, c: T.isDark(T.page()) ? '#ffffff' : '#1a1a1a', fett: false }, m = T.textMetrics(d), [cx, cy] = T.viewCenter(); T.snap(); T.addItem({ t: 'o', k: 'text', d, x: cx - m.w / 2, y: cy - m.h / 2, w: m.w, h: m.h, r: 0 }); T.toast('Notiz steht jetzt auf der Tafel.'); } }, '⤴ Auf die Tafel')));
  }
  box.append(h('p', { class: 'hint' }, n.scope === 'dauer' ? (F.root ? '📌 Erscheint bei jeder Tafel – gespeichert unter „' + lehrkraft() + ' › _Notizen“.' : '📌 Erscheint bei jeder Tafel – ohne Ablageordner nur auf diesem PC gespeichert.') : 'Gehört nur zu dieser Tafel und wird mit ihr gespeichert.'));
  return box;
}

// ---------- Störungen: einfache Notiz für diese Stunde (keine Statistik) ----------
// Liegt getrennt von der Tafel (Lehrkraft › _Stoerungen), damit sie nie in weitergegebenen Tafeln steckt.
let stoer = null, stoerFuer = null, stoerT = 0, verdeckt = false;
const stoerName = b => F.safe(b.stoerDatei || (b.stoerDatei = `${b.datum} ${b.fach} - ${b.titel}`)) + '.json';
async function ladeStoer() {
  const b = S.board; if (!b || stoerFuer === b.id) return;
  stoerFuer = b.id; stoer = null;
  stoer = (await lesen('_Stoerungen', stoerName(b), 'stoer:' + b.id)) || { text: '', ink: [] };
  if (offen && aktiv === 'stoer') zeichne();
}
function sichereStoer() {
  const b = S.board; if (!b || !stoer) return;
  clearTimeout(stoerT); stoerT = setTimeout(() => schreiben('_Stoerungen', stoerName(b), 'stoer:' + b.id, { ...stoer, datum: b.datum, fach: b.fach, tafel: b.titel, geaendert: new Date().toISOString() }).catch(e => T.toast('Nicht gespeichert: ' + e.message, 5000)), 800);
}
function stoerTab() {
  const box = h('div', { class: 'nbody' });
  if (!S.board) { box.append(h('p', { class: 'hint' }, 'Erst eine Tafel öffnen.')); return box; }
  if (stoerFuer !== S.board.id || !stoer) { ladeStoer(); box.append(h('p', { class: 'hint' }, 'Wird geladen …')); return box; }
  const modus = T.opts.stoerModus === 'text' ? 'text' : 'ink';
  box.append(h('div', { class: 'row' },
    h('button', { class: 'big' + (modus === 'ink' ? ' on' : ''), onclick: () => { T.opts.stoerModus = 'ink'; T.saveOpts(); zeichne(); } }, '✍ Mit Stift'),
    h('button', { class: 'big' + (modus === 'text' ? ' on' : ''), onclick: () => { T.opts.stoerModus = 'text'; T.saveOpts(); zeichne(); } }, '⌨ Tippen'),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'big', title: 'Sichtschutz: Notiz vor der Klasse verdecken', onclick: () => { verdeckt = !verdeckt; zeichne(); } }, verdeckt ? '👁 zeigen' : '🙈 verdecken')));
  let feld;
  if (modus === 'ink') { const f = inkArea({ get: () => stoer.ink || [], set: v => { stoer.ink = v; sichereStoer(); } }); feld = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 } }, f.el, f.leiste); }
  else { feld = h('textarea', { class: 'ntext', style: { fontSize: schrift + 'px' }, placeholder: 'Störungen in dieser Stunde, z. B. „10:15 Max – Handy“' }); feld.value = stoer.text || ''; feld.addEventListener('input', () => { stoer.text = feld.value; sichereStoer(); }); }
  const huelle = h('div', { class: 'nstoer' + (verdeckt ? ' verdeckt' : ''), style: { display: 'flex', flexDirection: 'column', flex: 1 } }, feld);
  if (verdeckt) huelle.append(h('button', { class: 'nvorhang', onclick: () => { verdeckt = false; zeichne(); } }, '🙈 verdeckt – antippen zum Zeigen'));
  box.append(huelle, h('p', { class: 'hint' }, 'Nur für diese Stunde (diese Tafel). ' + (F.root ? 'Gespeichert unter „' + lehrkraft() + ' › _Stoerungen“, getrennt von der Tafel – sie steckt also nicht in Tafeln, die Sie weitergeben.' : 'Ohne Ablageordner nur auf diesem PC gespeichert.')));
  return box;
}

T.onBoardLoaded = () => { if (aktiv && aktiv !== 'stoer' && !finde(aktiv)) aktiv = null; if (offen) { if (!aktiv) schliesse(); else zeichne(); } else zeichneReiter(); };
T.onLehrkraft = () => { dauer = null; stoerFuer = null; stoer = null; aktiv = null; if (offen) schliesse(); else zeichneReiter(); };
zeichneReiter();
})();
