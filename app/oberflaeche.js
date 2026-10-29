// Tafel-App – Oberfläche: Werkzeugleiste, Dialoge, Ablage, Export, Klassen-Werkzeuge
'use strict';
(function () {
const S = T.S, F = T.ablage, $ = id => document.getElementById(id);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v; else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};
T.h = h;
const toast = (msg, ms = 2600, actions) => {
  const t = $('toast'); t.textContent = msg; t.style.display = 'block';
  if (actions) t.append(h('span', { class: 'toastBtns' }, ...actions.map(([l, fn]) => h('button', { onclick: () => { t.style.display = 'none'; fn(); } }, l)))); clearTimeout(toast.t); toast.t = setTimeout(() => t.style.display = 'none', ms); };
T.toast = toast;

// ---------- Symbole ----------
const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  stift: sv('<path d="M4 20l1.3-4.7L16.4 4.2a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.7 18.7z"/><path d="M14.6 6l3.4 3.4"/>'),
  marker: sv('<path d="M5 19l3-1 10-10-2-2L6 16z"/><path d="M14 6l4 4"/><path d="M3 21h8" stroke-width="3" stroke="#f2c200"/>'),
  radierer: sv('<path d="M8 20h12"/><path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 19H8.2z"/><path d="M9 11l5 5"/>'),
  auswahl: sv('<path d="M4 4l6.5 15 2-6.5 6.5-2z"/><path d="M14 14l5 5"/>'),
  hand: sv('<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'),
  form: sv('<rect x="3" y="12" width="9" height="9" rx="1"/><circle cx="16" cy="8" r="5"/>'),
  text: sv('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  lineal: sv('<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/>'),
  geodreieck: sv('<path d="M2 18h20L12 8z"/><path d="M8 18a4 4 0 0 1 8 0"/><path d="M12 18v-3"/>'),
  winkelmesser: sv('<path d="M2 17a10 10 0 0 1 20 0z"/><path d="M12 17l5-6"/><path d="M6 17a6 6 0 0 1 12 0"/>'),
  zirkel: sv('<circle cx="12" cy="4" r="1.6"/><path d="M11.2 5.5L6 20M12.8 5.5L18 20"/><path d="M8 15a8 6 0 0 0 8 0"/>'),
  einfuegen: sv('<path d="M12 2l8 4.5v9L12 20l-8-4.5v-9z"/><path d="M12 11l8-4.5M12 11v9M12 11L4 6.5"/>'),
  classroom: sv('<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 2"/><path d="M9 3h6M12 3v3"/>'),
  aufgaben: sv('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h4M9 6v4M14 8h4M7 16h4M14 15h4M14 17h4"/>'),
  undo: sv('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  redo: sv('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
  wischen: sv('<rect x="3" y="4" width="13" height="8" rx="2"/><path d="M5 12v2M9 12v3M13 12v2"/><path d="M18 9c2 2 3 6 1 11M15 16c1 2 1 3 0 5" stroke-dasharray="2 2"/>'),
  links: sv('<path d="M15 5l-7 7 7 7"/>'), rechts: sv('<path d="M9 5l7 7-7 7"/>'), plus: sv('<path d="M12 5v14M5 12h14"/>')
};

// ---------- Werkzeugleiste ----------
const FARBEN = { stift: ['#1a1a1a', '#ffffff', '#d32f2f', '#1565c0', '#2e7d32', '#ef6c00', '#6a1b9a'], marker: ['#ffe14d', '#7ef57e', '#ff8ad8', '#7fd3ff', '#ffb74d', '#c5a3ff', '#ff6b6b'] };
const MEHR = ['#1a1a1a', '#5f6368', '#9aa0a6', '#ffffff', '#d32f2f', '#e91e63', '#ad1457', '#6a1b9a', '#3949ab', '#1565c0', '#0288d1', '#00838f', '#2e7d32', '#7cb342', '#f9a825', '#ef6c00', '#795548', '#ffe14d', '#7ef57e', '#7fd3ff'];
const GROESSEN = { stift: [2, 4, 8, 14], marker: [16, 28, 44, 64], radierer: [24, 50, 90, 150] };
const STAERKE_NAME = ['S', 'M', 'L', 'XL'];
const TOOLS = [['stift', 'Stift'], ['marker', 'Marker'], ['radierer', 'Radierer'], ['auswahl', 'Auswahl'], ['hand', 'Tafel verschieben'], ['form', 'Formen'], ['text', 'Text']];
const INSTR = [['lineal', 'Lineal'], ['geodreieck', 'Geodreieck'], ['winkelmesser', 'Winkel'], ['zirkel', 'Zirkel']];

function buildToolbar() {
  const tb = $('toolbar'); tb.innerHTML = '';
  const btn = (id, label, icon, fn, title) => h('button', { class: 'tool', id: 't_' + id, title: title || label, onclick: fn, html: icon + `<span>${label}</span>` });
  for (const [id, l] of TOOLS) tb.append(btn(id, l, I[id], ev => toolClick(id, ev.currentTarget)));
  tb.append(h('div', { class: 'sep' }), h('div', { id: 'farben', class: 'row', style: { flexWrap: 'nowrap', gap: '5px' } }), h('button', { class: 'sw', id: 'mehrFarben', title: 'Weitere Farben', style: { background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }, onclick: ev => farbPop(ev.currentTarget) }));
  tb.append(h('div', { class: 'sep' }), h('div', { id: 'groessen', class: 'row', style: { flexWrap: 'nowrap', gap: '0' } }), h('div', { class: 'sep' }));
  tb.append(btn('werkzeuge', 'Werkzeuge', I.geodreieck, () => zeigeDock('werkzeuge', true), 'Lineal, Geodreieck, Zirkel, Rechner, Timer …'),
    btn('einfuegen', 'Einfügen', I.einfuegen, () => zeigeDock('einfuegen', true), 'Grafiken, Vorlagen, Karten, Bilder'),
    btn('aufgaben', 'Aufgaben', I.aufgaben, () => zeigeDock('aufgaben', true), 'Aufgabengenerator'),
    btn('classroom', 'Classroom', I.classroom, () => zeigeDock('classroom', true), 'Vorhang, Phasentimer, Timer, Zufall, Würfel'));
  tb.append(h('div', { class: 'sep' }), btn('undo', 'Zurück', I.undo, T.undo, 'Rückgängig (Strg+Z)'), btn('redo', 'Vor', I.redo, T.redo, 'Wiederholen (Strg+Y)'), btn('wischen', 'Wischen', I.wischen, tafelWischen, 'Tafel wischen: Handschrift, Bausteine oder alles'));
  tb.append(h('div', { class: 'sep' }), btn('prev', 'Seite', I.links, () => gotoPage(S.page - 1), 'Vorige Seite'),
    h('button', { class: 'tool seite', id: 'seiteBtn', onclick: ev => seitenPop(ev.currentTarget), title: 'Seiten und Hintergrund' }),
    btn('next', 'Seite', I.rechts, () => gotoPage(S.page + 1), 'Nächste Seite'), btn('neu', 'Neu', I.plus, neueSeite, 'Neue Seite anhängen'));
  updateToolbar();
}
function curKind() { return S.tool === 'marker' ? 'marker' : S.tool === 'radierer' ? 'radierer' : 'stift'; }
function updateToolbar() {
  for (const [id] of TOOLS) $('t_' + id).classList.toggle('on', S.tool === id);
  $('t_stift').querySelector('span').textContent = S.stiftArt === 'kalli' ? 'Feder' : 'Stift';
  $('t_stift').title = S.stiftArt === 'kalli' ? 'Kalligrafie-Feder (nochmals tippen: Stiftart wählen)' : 'Stift (nochmals tippen: Stiftart wählen)';
  for (const id of ['werkzeuge', 'einfuegen', 'aufgaben', 'classroom']) $('t_' + id).classList.toggle('on', dockArt === id || (id === 'classroom' && dockArt === 'classroom-stempel'));
  if (dockArt === 'werkzeuge') document.querySelectorAll('#dock [data-inst]').forEach(b => b.classList.toggle('on', S.inst.some(i => i.kind === b.dataset.inst)));
  const vb = document.querySelector('#dock [data-vorhang]'); if (vb) vb.classList.toggle('on', !!vorhang);
  const k = curKind(), fk = k === 'marker' ? 'marker' : 'stift', fw = $('farben'); fw.innerHTML = '';
  for (const c of FARBEN[fk]) fw.append(h('button', { class: 'sw' + (S.farbe[fk] === c ? ' on' : ''), style: { background: c }, title: c, onclick: () => { S.farbe[fk] = c; if (S.tool !== fk && S.tool !== 'form' && S.tool !== 'text') setTool(fk); updateToolbar(); T.renderOver(); } }));
  if (!FARBEN[fk].includes(S.farbe[fk])) fw.append(h('button', { class: 'sw on', style: { background: S.farbe[fk] } }));
  const gw = $('groessen'); gw.innerHTML = '';
  GROESSEN[k].forEach((g, i) => {
    const d = k === 'radierer' ? 8 + i * 6 : Math.min(24, Math.max(4, k === 'marker' ? g / 2.6 : g * 1.5));
    gw.append(h('button', { class: 'sz' + (S.groesse[k] === g ? ' on' : ''), title: (k === 'radierer' ? 'Radiergröße ' : 'Strichstärke ') + STAERKE_NAME[i], onclick: () => { S.groesse[k] = g; updateToolbar(); } },
      h('i', { style: { width: d + 'px', height: d + 'px', background: k === 'radierer' ? 'transparent' : k === 'marker' ? S.farbe.marker : (S.farbe.stift === '#ffffff' ? '#ccc' : S.farbe.stift), border: k === 'radierer' ? '2px solid currentColor' : '' } }),
      h('span', {}, STAERKE_NAME[i])));
  });
  $('t_undo').disabled = !T.hist.u.length; $('t_redo').disabled = !T.hist.r.length;
  if (S.board) { $('seiteBtn').innerHTML = `<span style="font-size:17px">${S.page + 1} / ${S.board.pages.length}</span><span>Seiten</span>`; $('t_prev').disabled = S.page === 0; $('t_next').disabled = S.page >= S.board.pages.length - 1; }
}
T.onInst = updateToolbar;

// ---------- Seitenleiste (geteiltes Fenster: links Werkzeuge/Einfügen/Aufgaben, rechts die Tafel) ----------
let dockArt = null;
const DOCK_TITEL = { werkzeuge: '🛠 Werkzeuge', einfuegen: '🧩 Einfügen', aufgaben: '🧮 Aufgaben', classroom: '🎒 Classroom', 'classroom-stempel': '😀 Emojis' };
function zeigeDock(art, umschalten) {
  const dock = $('dock');
  if (umschalten && dockArt === art) return schliesseDock();
  dockArt = art; dock.innerHTML = '';
  const inhalt = art === 'werkzeuge' ? werkzeugePanel() : art === 'einfuegen' ? einfuegenPanel() : art === 'classroom' ? classroomPanel() : art === 'classroom-stempel' ? stempelPanel() : aufgabenPanel();
  dock.append(h('div', { class: 'dkopf' }, h('b', {}, DOCK_TITEL[art]), h('button', { class: 'nzu', title: 'Seitenleiste schließen', onclick: schliesseDock }, '×')), h('div', { class: 'dbody' }, ...[].concat(inhalt)));
  if (!dock.classList.contains('auf')) {
    dock.classList.add('auf'); document.body.classList.add('dockAuf');
    T.ox = dock.getBoundingClientRect().width; document.documentElement.style.setProperty('--dockW', T.ox + 'px');
    T.render(); T.renderOver(); vorhangPlatz();
  }
  T.closePops(); updateToolbar();
}
function schliesseDock() {
  dockArt = null; $('dock').classList.remove('auf'); document.body.classList.remove('dockAuf');
  T.ox = 0; document.documentElement.style.setProperty('--dockW', '0px'); T.render(); T.renderOver(); updateToolbar(); vorhangPlatz();
}
T.zeigeDock = zeigeDock;
function werkzeugePanel() {
  const inst = h('div', { class: 'tiles klein' }, ...INSTR.map(([id, l]) => h('button', { class: 'tile', 'data-inst': id, onclick: () => T.toggleInstrument(id), html: I[id] + `<span>${l === 'Winkel' ? 'Winkelmesser' : l}</span>` })));
  setTimeout(updateToolbar, 0);
  return [h('h3', {}, 'Messen & Zeichnen'), inst, h('p', { class: 'hint' }, 'Antippen blendet ein/aus. Drehen am ↻, Größe mit zwei Fingern oder ↻ kurz antippen.'),
    h('h3', {}, 'Funktionen'), h('div', { class: 'tiles klein' }, h('button', { class: 'tile', onclick: () => T.plotter() }, h('div', { class: 'em' }, '📈'), 'Funktions­plotter')),
    h('h3', {}, 'Wissenschaftlicher Rechner'), T.rechner()];
}
function classroomPanel() {
  const kachel = (em, name, fn, attr) => h('button', { class: 'tile', ...(attr || {}), onclick: fn }, h('div', { class: 'em' }, em), name);
  setTimeout(updateToolbar, 0);
  const C = T.CR || {};
  return [h('h3', {}, 'Tafel'), h('div', { class: 'tiles klein' }, kachel('🎭', 'Vorhang', () => vorhangUmschalten(), { 'data-vorhang': 1 }), kachel('😀', 'Emojis', () => zeigeDock('classroom-stempel'))),
    h('h3', {}, 'Zeit'), h('div', { class: 'tiles klein' }, kachel('⏳', 'Phasentimer', phasenWidget), kachel('⏱', 'Timer / Stoppuhr', timerWidget), kachel('🕘', 'Uhr & Datum', C.uhr)),
    h('h3', {}, 'Klasse führen'), h('div', { class: 'tiles klein' }, kachel('🤫', 'Arbeits­symbole', C.arbeit), kachel('🚦', 'Ampel', C.ampel), kachel('🔊', 'Lautstärke', C.laut)),
    h('h3', {}, 'Mitmachen'), h('div', { class: 'tiles klein' }, kachel('📊', 'Umfrage', C.umfrage), kachel('🏆', 'Punkte­stand', C.punkte)),
    h('h3', {}, 'Zufall & Gruppen'), h('div', { class: 'tiles klein' }, kachel('🎯', 'Namen ziehen', zufallWidget), kachel('👥', 'Gruppen bilden', C.gruppen), kachel('🎲', 'Würfel', wuerfelWidget)),
    h('h3', {}, 'Teilen'), h('div', { class: 'tiles klein' }, kachel('🔳', 'QR-Code', C.qr)),
    h('p', { class: 'hint' }, 'Die Werkzeuge öffnen sich als kleine Fenster auf der Tafel und lassen sich an der Titelleiste verschieben.')];
}
const EMOJIS = [
  ['Lob', ['⭐', '🌟', '✨', '👍', '👏', '🙌', '💪', '💯', '🏆', '🥇', '🥈', '🥉', '🎉', '🎯', '🔥', '🚀', '👑', '🦸', '🌈', '🍀']],
  ['Gesichter', ['😀', '😃', '😊', '🙂', '😎', '🤩', '🥳', '😮', '🤔', '😐', '😕', '🙁', '😢', '😴', '🤫', '🤐', '😡', '🤯', '🙈', '🤝']],
  ['Zeichen', ['✅', '✔️', '❌', '❓', '❗', '‼️', '⚠️', '⛔', '🛑', '➡️', '⬅️', '⬆️', '⬇️', '🔄', '➕', '➖', '✖️', '➗', '🟢', '🔴']],
  ['Schule', ['✏️', '🖊️', '📏', '📐', '📚', '📖', '📝', '📌', '📎', '✂️', '🧮', '🔬', '🧪', '🌍', '🗺️', '⏰', '🔔', '💡', '👀', '👂']],
  ['Natur & Tiere', ['🌞', '🌙', '⛅', '🌧️', '❄️', '🌳', '🌻', '🍎', '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🦁', '🐸', '🐝', '🦋', '🐢']],
  ['Herzen', ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '💖', '💝']]];
function stempelPanel() { // Emojis: auswählen, dann auf die Tafel tippen – jedes Tippen setzt ein Emoji
  const knopf = s => h('button', { class: 'stbtn' + (S.stempel === s && S.tool === 'stempel' ? ' on' : ''), onclick: () => { S.stempel = s; setTool('stempel'); zeigeDock('classroom-stempel'); toast('Emoji gewählt – jetzt auf die Tafel tippen.', 1800); } }, s);
  const gruppen = EMOJIS.flatMap(([titel, liste]) => [h('h3', {}, titel), h('div', { class: 'stempel' }, ...liste.map(knopf))]);
  const gr = h('div', { class: 'row' }, ...[[60, 'klein'], [110, 'mittel'], [180, 'groß'], [300, 'riesig']].map(([v, l]) => h('button', { class: 'big' + ((S.stempelGr || 110) === v ? ' on' : ''), onclick: () => { S.stempelGr = v; zeigeDock('classroom-stempel'); } }, l)));
  return [h('button', { class: 'big', onclick: () => zeigeDock('classroom') }, '← Classroom'), h('h3', {}, 'Größe'), gr, ...gruppen,
    h('p', { class: 'hint' }, 'Solange ein Emoji gewählt ist, setzt jedes Tippen auf die Tafel eins. Zurück zum Schreiben: Stift antippen. Emojis lassen sich mit „Auswahl“ verschieben, vergrößern oder löschen.')];
}
function setTool(id) {
  S.tool = id; if (id !== 'auswahl') S.sel = null; T.overlay.cursor = null;
  updateToolbar(); T.renderOver();
}
function toolClick(id, el) {
  const again = S.tool === id; setTool(id);
  if (id === 'form') formPop(el);
  else if (id === 'radierer' && again) radPop(el);
  else if (id === 'stift' && again) stiftPop(el);
}
function stiftPop(el) {
  const wahl = (art, txt, hint) => h('button', { class: 'big' + (S.stiftArt === art ? ' on' : ''), style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '190px' }, onclick: () => { S.stiftArt = art; T.opts.stiftArt = art; T.saveOpts(); T.closePops(); updateToolbar(); } },
    h('b', {}, txt), h('span', { style: { fontSize: '13px', color: 'var(--muted)' } }, hint));
  openPop(el, h('h4', {}, 'Stiftart'), h('div', { class: 'row' },
    wahl('normal', '✏️ Normaler Stift', 'druckempfindlich, rund'), wahl('kalli', '🖋 Kalligrafie-Feder', 'breite Feder, Schönschrift')));
}

// ---------- Popover ----------
const pop = $('pop');
function openPop(anchor, ...content) {
  pop.innerHTML = ''; pop.append(...content); pop.style.display = 'block';
  const r = anchor.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let x = T.clamp(r.left + r.width / 2 - pw / 2, 10, innerWidth - pw - 10);
  let y = r.top - ph - 12; if (y < 60) y = r.bottom + 12;
  pop.style.left = x + 'px'; pop.style.top = y + 'px';
}
T.closePops = () => { pop.style.display = 'none'; };
document.addEventListener('pointerdown', e => { if (pop.style.display === 'block' && !pop.contains(e.target) && !e.target.closest('#toolbar,#topbar')) T.closePops(); }, true);

function farbPop(el) {
  const fk = curKind() === 'marker' ? 'marker' : 'stift';
  const grid = h('div', { class: 'row', style: { maxWidth: '360px' } });
  for (const c of MEHR) grid.append(h('button', { class: 'sw', style: { background: c, width: '48px', height: '48px' }, onclick: () => { S.farbe[fk] = c; T.closePops(); updateToolbar(); } }));
  const inp = h('input', { type: 'color', value: S.farbe[fk], style: { width: '100%', height: '50px', marginTop: '10px' }, oninput: e => { S.farbe[fk] = e.target.value; updateToolbar(); } });
  openPop(el, h('h4', {}, fk === 'marker' ? 'Markerfarbe' : 'Stiftfarbe'), grid, inp);
}
function formPop(el) {
  const row = h('div', { class: 'row' });
  for (const [id, l] of [['linie', '╱ Linie'], ['pfeil', '➝ Pfeil'], ['rechteck', '▭ Rechteck'], ['dreieck', '△ Dreieck'], ['kreis', '⊙ Kreis'], ['ellipse', '⬭ Ellipse']])
    row.append(h('button', { class: 'big' + (S.form === id ? ' on' : ''), onclick: () => { S.form = id; T.closePops(); } }, l));
  openPop(el, h('h4', {}, 'Form ziehen (Linien rasten bei 45° ein, Kreis: vom Mittelpunkt aus)'), row);
}
function radPop(el) {
  openPop(el, h('h4', {}, 'Radierer'), h('div', { class: 'row' },
    h('button', { class: 'big' + (S.radModus === 'teil' ? ' on' : ''), onclick: () => { S.radModus = 'teil'; T.closePops(); } }, 'Stellen radieren'),
    h('button', { class: 'big' + (S.radModus === 'strich' ? ' on' : ''), onclick: () => { S.radModus = 'strich'; T.closePops(); } }, 'Ganze Striche'),
    h('button', { class: 'big warn', onclick: () => { T.closePops(); seiteLeeren(); } }, '🗑 Seite leeren')));
}
const BG_PREVIEW = { weiss: '#fff', kariert: 'repeating-linear-gradient(0deg,#bcd2e6 0 1px,transparent 1px 8px),repeating-linear-gradient(90deg,#bcd2e6 0 1px,#fff 1px 8px)', liniert: 'repeating-linear-gradient(0deg,#a9c4dc 0 1px,#fff 1px 14px)', lineatur: 'repeating-linear-gradient(0deg,#7fa3c4 0 1px,#eef4fa 1px 9px,#7fa3c4 9px 10px,#fff 10px 22px)', punkte: 'radial-gradient(#9fb3c8 1.2px,#fff 1.4px) 0 0/10px 10px', noten: 'repeating-linear-gradient(0deg,#777 0 1px,#fff 1px 5px)', gruen: '#2d5a3d', gruenkariert: 'repeating-linear-gradient(0deg,rgba(255,255,255,.2) 0 1px,transparent 1px 10px),repeating-linear-gradient(90deg,rgba(255,255,255,.2) 0 1px,#2d5a3d 1px 10px)', schwarz: '#1f2328' };
function seitenPop(el) {
  const bgs = h('div', { class: 'row', style: { maxWidth: '520px' } });
  for (const b of T.HINTERGRUENDE) bgs.append(h('button', { class: 'bgtile' + (T.page().bg === b.id ? ' on' : ''), style: { background: BG_PREVIEW[b.id], color: b.dunkel ? '#fff' : '#223' }, onclick: () => { T.snap(); T.page().bg = b.id; T.page().abstand = null; T.render(); autoInk(); seitenPop(el); } }, b.name));
  const A = T.ABSTAND[T.page().bg], abRow = h('div', { class: 'row', style: { maxWidth: '520px' } });
  if (A) {
    const cur = T.page().abstand || A.std, setze = v => { v = T.clamp(+v || A.std, 1, 60); T.snap(); T.page().abstand = v === A.std ? null : v; T.render(); seitenPop(el); };
    for (const v of A.opts) abRow.append(h('button', { class: 'big' + (v === cur ? ' on' : ''), onclick: () => setze(v) }, T.zahl(v, 1) + ' mm'));
    const inp = h('input', { type: 'text', class: 'feld', value: String(cur).replace('.', ','), inputmode: 'decimal', style: { width: '110px' }, title: 'Eigener Wert in mm' });
    inp.addEventListener('change', () => setze(String(inp.value).replace(',', '.')));
    abRow.append(inp, h('span', { class: 'hint' }, 'mm'));
  }
  const nav = h('div', { class: 'row', style: { maxWidth: '520px', marginBottom: '8px' } });
  S.board.pages.forEach((p, i) => nav.append(h('button', { class: 'big' + (i === S.page ? ' on' : ''), onclick: () => { gotoPage(i); T.closePops(); } }, String(i + 1))));
  openPop(el, h('h4', {}, 'Seiten'), nav, h('div', { class: 'row' },
    h('button', { class: 'big', onclick: () => { T.closePops(); neueSeite(); } }, '＋ Neue Seite'),
    h('button', { class: 'big', onclick: () => { T.closePops(); seiteDuplizieren(); } }, '⧉ Seite kopieren'),
    h('button', { class: 'big', onclick: () => { T.closePops(); T.resetView(); } }, '⌂ Ansicht 100 %'),
    h('button', { class: 'big warn', onclick: () => { T.closePops(); seiteLoeschen(); } }, '🗑 Seite löschen')),
  h('h4', { style: { marginTop: '14px' } }, 'Hintergrund dieser Seite'), bgs,
  A ? h('h4', { style: { marginTop: '14px' } }, A.l + ' (bei 100 % Ansicht echte Maße)') : '', A ? abRow : '');
}
function autoInk() { // Schwarz/Weiß passend zum Hintergrund
  const dark = T.isDark(T.page());
  if (dark && S.farbe.stift === '#1a1a1a') S.farbe.stift = '#ffffff';
  if (!dark && S.farbe.stift === '#ffffff') S.farbe.stift = '#1a1a1a';
  updateToolbar(); T.render();
}

// ---------- Seiten ----------
function gotoPage(i) {
  if (!S.board || i < 0 || i >= S.board.pages.length) return;
  S.page = i; S.sel = null; T.render(); T.renderOver(); updateToolbar(); autoInk(); zoomInfo();
}
T.onPage = () => { updateToolbar(); zoomInfo(); };
function neueSeite() { T.snap(); const bg = T.page().bg, np = T.newPage(bg); np.abstand = T.page().abstand || null; S.board.pages.splice(S.page + 1, 0, np); gotoPage(S.page + 1); toast('Neue Seite ' + (S.page + 1)); }
function seiteDuplizieren() { T.snap(); const p = T.page(); S.board.pages.splice(S.page + 1, 0, { bg: p.bg, abstand: p.abstand || null, items: p.items.map(it => ({ ...it, id: T.uid() })), view: { ...p.view } }); gotoPage(S.page + 1); }
function seiteLoeschen() {
  if (!confirm('Diese Seite löschen? (Rückgängig ist möglich)')) return;
  T.snap(); if (S.board.pages.length === 1) S.board.pages[0] = T.newPage(T.page().bg); else S.board.pages.splice(S.page, 1);
  gotoPage(Math.min(S.page, S.board.pages.length - 1));
}
function wischAnimation() { const w = $('wisch'); w.classList.remove('los'); void w.offsetWidth; w.classList.add('los'); }
// Wischen mit Auswahl: nur Handschrift, nur Bausteine & Bilder oder alles
function tafelWischen(ev) {
  const pg = T.page(), schrift = pg.items.filter(it => it.t === 's').length, objekte = pg.items.length - schrift;
  if (!pg.items.length) { toast('Die Tafel ist schon sauber.'); return; }
  const wische = (filter, text) => { T.closePops(); T.snap(); T.page().items = T.page().items.filter(filter); S.sel = null; wischAnimation();
    setTimeout(() => { T.render(); T.renderOver(); }, 200); toast(text, 5000, [['↶ Zurück', T.undo]]); };
  const knopf = (txt, n, fn) => h('button', { class: 'big', disabled: !n, style: { justifyContent: 'flex-start', textAlign: 'left' }, onclick: fn }, txt, h('span', { class: 'hint', style: { marginLeft: '8px' } }, n ? `(${n})` : '(nichts da)'));
  openPop(ev && ev.currentTarget || $('t_wischen'), h('h4', {}, 'Was soll weggewischt werden?'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch', minWidth: '280px' } },
    knopf('✍ Nur Handschrift', schrift, () => wische(it => it.t !== 's', 'Handschrift gewischt – Bausteine bleiben stehen.')),
    knopf('🧩 Nur Bausteine & Bilder', objekte, () => wische(it => it.t === 's', 'Bausteine und Bilder entfernt – Handschrift bleibt.')),
    h('button', { class: 'big warn', onclick: () => wische(() => false, 'Seite komplett gewischt.') }, '🗑 Alles')));
}
function seiteLeeren() { if (!T.page().items.length) return; T.snap(); T.page().items = []; S.sel = null; T.render(); T.renderOver(); toast('Seite geleert – mit „Zurück“ wiederherstellbar'); }

// ---------- Zoom-Anzeige ----------
function zoomInfo() { if (!S.board) return; $('zoomInfo').textContent = Math.round(T.page().view.z * 100) + ' %'; }
// Navigation: Zoom um die Mitte der sichtbaren Tafel, „Alles zeigen“, „Start“
const tafelMitte = () => [T.ox + (innerWidth - T.ox) / 2, 56 + (innerHeight - 56 - 100) / 2];
T.allesZeigen = () => {
  const pg = T.page(); if (!pg.items.length) { T.resetView(); return; }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of pg.items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  const aw = innerWidth - T.ox - 120, ah = innerHeight - 56 - 140, v = pg.view;
  v.z = T.clamp(Math.min(aw / Math.max(1, x1 - x0), ah / Math.max(1, y1 - y0), 2), 0.03, 8);
  const [cx, cy] = tafelMitte(); v.x = cx - T.ox - (x0 + x1) / 2 * v.z; v.y = cy - (y0 + y1) / 2 * v.z;
  T.render(); T.renderOver(); zoomInfo();
};
$('navAlles').onclick = T.allesZeigen;
$('navHome').onclick = () => T.resetView();
$('navPlus').onclick = () => { const [x, y] = tafelMitte(); T.zoomAt(x, y, 1.25); };
$('navMinus').onclick = () => { const [x, y] = tafelMitte(); T.zoomAt(x, y, 0.8); };
T.onZoom = zoomInfo;
$('zoomInfo').onclick = () => { const [x, y] = tafelMitte(); T.zoomAt(x, y, 1 / T.page().view.z); }; // zurück auf 100 %, Mitte bleibt

// ---------- Auswahl-Leiste ----------
const selbar = $('selbar');
T.placeSelBar = anchor => {
  if (!anchor || !S.sel) { selbar.style.display = 'none'; return; }
  const v = T.page().view, x = (anchor.x0 + anchor.x1) / 2 * v.z + v.x + T.ox, y = anchor.y0 * v.z + v.y;
  const items = T.page().items.filter(it => S.sel.ids.has(it.id)), one = items.length === 1 && items[0].t === 'o' ? items[0] : null;
  const teil = one && S.teil && S.teil.oid === one.id ? S.teil.id : null, Bk = one && T.BAUSTEINE[one.k];
  const key = items.map(i => i.id).join() + (one ? one.k + (one.r ? 'r' : '') : '') + '|' + (teil || '');
  if (selbar.dataset.key !== key) {
    selbar.dataset.key = key; selbar.innerHTML = '';
    const akt = () => T.page().items.find(i => i.id === one.id); // immer die aktuelle Fassung des Bausteins
    const reihe = (cls) => { const r = h('div', { class: 'selrow' + (cls ? ' ' + cls : '') }); selbar.append(r); return r; };
    // 1. Reihe: Feld-Menü (wenn ein Feld angetippt ist) oder Schnellknöpfe des Bausteins
    if (teil && Bk && Bk.teil) {
      const r = reihe('feld'); r.append(h('span', { class: 'sellab' }, 'Feld:'));
      for (const a of Bk.teil(akt().d, teil)) r.append(h('button', { class: a.warn ? 'warn' : '', onclick: () => T.bausteinAendern(akt(), a) }, a.l));
      r.append(h('button', { title: 'Feld-Auswahl aufheben', onclick: () => { S.teil = null; T.renderOver(); } }, '✕'));
    } else if (Bk && Bk.schnell) {
      const r = reihe('schnell');
      for (const a of Bk.schnell) r.append(h('button', { onclick: () => T.bausteinAendern(akt(), a) }, a.l));
      if (Bk.teil) r.append(h('span', { class: 'sellab' }, 'Tipp: ein Feld antippen'));
    }
    const r2 = reihe(), b = (t, fn, title) => r2.append(h('button', { onclick: fn, title }, t));
    if (one && ((Bk && Bk.felder.length) || one.k === 'text' || one.k === 'graph')) b(one.k === 'graph' ? '📈 Im Plotter öffnen' : '✏️ Bearbeiten', () => T.editObj(akt()));
    b('⧉ Kopie', duplicateSel, 'Duplizieren'); b('⬆ Vorne', () => orderSel(1), 'Nach vorne'); b('⬇ Hinten', () => orderSel(-1), 'Nach hinten');
    if (one && one.r) b('⟲ 0°', () => { T.snap(); T.replaceItem({ ...akt(), r: 0 }); T.renderOver(); });
    b('🗑 Löschen', deleteSel);
  }
  selbar.style.display = 'flex';
  const w = selbar.offsetWidth, hh = selbar.offsetHeight;
  let top = y - hh - 70; if (top < 64) top = anchor.y1 * v.z + v.y + 16;
  selbar.style.left = T.clamp(x - w / 2, 8, innerWidth - w - 8) + 'px'; selbar.style.top = T.clamp(top, 64, innerHeight - hh - 90) + 'px';
};
function deleteSel() { if (!S.sel) return; T.snap(); T.page().items = T.page().items.filter(it => !S.sel.ids.has(it.id)); S.sel = null; T.render(); T.renderOver(); }
function duplicateSel() {
  if (!S.sel) return; T.snap(); const ids = [];
  for (const it of T.page().items.filter(i => S.sel.ids.has(i.id))) {
    const c = it.t === 's' ? { ...it, id: T.uid(), p: it.p.map(q => [q[0] + 30, q[1] + 30, q[2]]) } : { ...it, id: T.uid(), x: it.x + 30, y: it.y + 30 };
    T.page().items.push(c); ids.push(c.id);
  }
  T.select(ids); T.render();
}
function orderSel(dir) {
  T.snap(); const pg = T.page(), sel = pg.items.filter(it => S.sel.ids.has(it.id)), rest = pg.items.filter(it => !S.sel.ids.has(it.id));
  pg.items = dir > 0 ? rest.concat(sel) : sel.concat(rest); T.render();
}

// ---------- Dialoge ----------
const modal = $('modal'), dlg = $('dlg');
function openDlg(content, wide) { dlg.innerHTML = ''; dlg.className = 'dlg' + (wide ? ' wide' : ''); dlg.append(...[].concat(content)); modal.style.display = 'flex'; T.closePops(); }
function closeDlg() { modal.style.display = 'none'; dlg.innerHTML = ''; }
T.closeDlg = closeDlg;
modal.addEventListener('pointerdown', e => { if (e.target === modal) closeDlg(); });

function feld(f, val) {
  let inp;
  if (f.typ === 'check') { inp = h('input', { type: 'checkbox' }); inp.checked = !!val; return { el: h('label', { class: 'fld check' }, inp, f.l), get: () => inp.checked }; }
  if (f.typ === 'textarea') inp = h('textarea', {}, val || '');
  else if (f.typ === 'auswahl') { inp = h('select', {}, ...f.opts.map(([v, l]) => h('option', { value: v, selected: v === val }, l))); }
  else if (f.typ === 'farbe') inp = h('input', { type: 'color', value: val || '#ff8a65', style: { height: '50px' } });
  else if (f.typ === 'zahl') inp = h('input', { type: 'text', value: String(val ?? '').replace('.', ','), inputmode: 'decimal' });
  else inp = h('input', { type: 'text', value: val == null ? '' : val });
  const get = () => {
    if (f.typ !== 'zahl') return inp.value;
    let v = parseFloat(String(inp.value).replace(',', '.')); if (isNaN(v)) v = val;
    if (f.min != null) v = Math.max(f.min, v); if (f.max != null) v = Math.min(f.max, v); return v;
  };
  return { el: h('label', { class: 'fld' }, f.l, inp), get };
}
function propDialog(k, d, onOk, titel) {
  const B = T.BAUSTEINE[k], felder = B.felder.map(f => ({ f, ...feld(f, d[f.k]) }));
  const prev = h('img', { class: 'prev' });
  const read = () => { const o = { ...d }; for (const x of felder) o[x.f.k] = x.get(); return o; };
  const upd = () => { prev.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(T.genObj(k, read(), false).svg); };
  const grid = h('div', { class: B.felder.length > 4 ? 'grid2' : '' }, felder.map(x => x.el));
  grid.addEventListener('input', upd); grid.addEventListener('change', upd); upd();
  openDlg([h('h2', {}, titel || B.name), prev, grid, h('div', { class: 'acts' },
    h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { const o = read(); closeDlg(); onOk(o); } }, 'Übernehmen'))]);
}
T.editObj = o => {
  if (o.k === 'text') return T.textDialog(o);
  if (o.k === 'graph') return T.plotter(o.d.plot, o.id);
  if (!T.BAUSTEINE[o.k]) return;
  propDialog(o.k, o.d, d => {
    const g = T.genObj(o.k, d, false), w = o.w, hh = w * g.h / g.w, cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    T.snap(); T.replaceItem({ ...o, d, w, h: hh, x: cx - w / 2, y: cy - hh / 2 }); T.renderOver();
  });
};
// sichtbare Tafelbreite – bei offener Seitenleiste in schmalen Fenstern nicht winzig werden lassen
const platzBreite = () => { const r = T.viewRect(); return Math.max(r.x1 - r.x0, innerWidth * 0.5 / T.page().view.z); };
function placeObj(k, d, at, scale) {
  const g = T.genObj(k, d, false), r = T.viewRect(), maxW = platzBreite() * 0.7, maxH = (r.y1 - r.y0) * 0.7;
  let f = scale || Math.min(1, maxW / g.w, maxH / g.h); const w = g.w * f, hh = g.h * f, [cx, cy] = at || T.viewCenter();
  const o = { t: 'o', id: T.uid(), k, d, x: cx - w / 2, y: cy - hh / 2, w, h: hh, r: 0 };
  return o;
}
function insertObj(k, d, at) { const o = placeObj(k, d, at); T.snap(); T.addItem(o); setTool('auswahl'); T.select([o.id]); return o; }

T.textDialog = (o, wx, wy) => {
  const d = o ? o.d : { text: '', size: 36, c: S.farbe.stift, fett: false };
  const ta = h('textarea', { style: { fontSize: '26px', minHeight: '160px' } }, d.text);
  let size = d.size, fett = d.fett;
  const sizes = h('div', { class: 'row' }, ...[[24, 'klein'], [36, 'normal'], [56, 'groß'], [90, 'riesig']].map(([s, l]) => h('button', { class: 'big' + (s === size ? ' on' : ''), onclick: e => { size = s; [...sizes.children].forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); } }, l)));
  const fb = h('button', { class: 'big' + (fett ? ' on' : ''), onclick: e => { fett = !fett; e.currentTarget.classList.toggle('on', fett); } }, 'B  fett');
  const g = T.gridPx(T.page()); let karo = o ? !!d.karo : !!g;
  const kb = h('button', { class: 'big' + (karo ? ' on' : ''), title: 'Jedes Zeichen in ein Kästchen (wie im Rechenheft)', onclick: e => { karo = !karo; e.currentTarget.classList.toggle('on', karo); } }, '▦ In Kästchen');
  openDlg([h('h2', {}, o ? 'Text bearbeiten' : 'Text einfügen'), h('p', { class: 'hint' }, 'Tipp: Auf dem Smartboard öffnet sich die Bildschirmtastatur über das Tastatursymbol in der Taskleiste. Brüche als 3/4 schreiben.'), ta,
    h('div', { class: 'row', style: { marginTop: '10px' } }, sizes, fb, g || d.karo ? kb : ''),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
      const text = ta.value.replace(/\s+$/, ''); closeDlg(); if (!text) return;
      const nd = { text, size, c: d.c, fett }; if (karo) nd.karo = d.karo || g || 80;
      const m = T.textMetrics(nd), rund = v => nd.karo ? Math.round(v / nd.karo) * nd.karo : v;
      if (o) { const f = karo ? 1 : o.w / T.textMetrics(o.d).w; T.snap(); T.replaceItem({ ...o, d: nd, w: m.w * f, h: m.h * f, x: rund(o.x), y: rund(o.y) }); T.renderOver(); }
      else { const [cx, cy] = wx != null ? [wx + m.w / 2, wy + m.h / 2] : T.viewCenter(); const it = { t: 'o', id: T.uid(), k: 'text', d: nd, x: rund(cx - m.w / 2), y: rund(cy - m.h / 2), w: m.w, h: m.h, r: 0 }; T.snap(); T.addItem(it); }
    } }, 'OK'))]);
  setTimeout(() => ta.focus(), 50);
};

const ladeSkript = src => new Promise((ok, fehler) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fehler; document.head.append(s); });
function skelettEinfuegen(sk) { // Bild + kleine Quellenangabe darunter
  const r = T.viewRect(), f = Math.min(platzBreite() * 0.55 / sk.w, (r.y1 - r.y0) * 0.6 / sk.h), [cx, cy] = T.viewCenter();
  const w = sk.w * f, hh = sk.h * f, x = cx - w / 2, y = cy - hh / 2 - 20 / T.page().view.z;
  const bild = { t: 'o', id: T.uid(), k: 'bild', d: { src: sk.src }, x, y, w, h: hh, r: 0 };
  const d = { text: `Abb.: ${sk.autor}, ${sk.lizenz}, ${sk.quelle}`, size: Math.max(12, 14 / T.page().view.z), c: '#6b7280', fett: false }, m = T.textMetrics(d);
  const k = Math.min(1, w / m.w); // Quellenzeile nie breiter als das Bild
  T.snap(); T.page().items.push(bild, { t: 'o', id: T.uid(), k: 'text', d, x, y: y + hh + 4, w: m.w * k, h: m.h * k, r: 0 });
  T.render(); setTool('auswahl'); T.select([bild.id]);
}
// Einfügen (in der Seitenleiste): Kategorien oben, Kacheln darunter – Antippen setzt den Baustein in die Tafelmitte
let einfKat = 'Mathe', kartenStil = 'politisch', uebTyp = 'gruppen';
function einfuegenPanel() {
  const gruppen = {};
  for (const [k, B] of Object.entries(T.BAUSTEINE)) (gruppen[B.gruppe] = gruppen[B.gruppe] || []).push(k);
  const KAT = [['Medien', '🖼️ Bilder & Text'], ['Körper', '🧊 3D-Körper'], ['Mathe', '➗ Mathe'], ['Sprachen', '💬 Deutsch & Englisch'], ['Sachfächer', '🔬 NaWi, Erdkunde, Geschichte'], ['Karten', '🗺️ Karten'], ['Skelette', '🦴 Skelette'], ['Uebungen', '🎲 Übungen'], ['Diagramme', '📊 Diagramme'], ['Formeln', '📐 Formeln'], ['Werkzeug', '🙈 Abdeckung']];
  const tile = (img, name, fn) => h('button', { class: 'tile', onclick: fn }, img, name);
  const kats = h('div', { class: 'kats' }, ...KAT.map(([id, l]) => h('button', { class: 'kat' + (einfKat === id ? ' on' : ''), onclick: () => { einfKat = id; zeigeDock('einfuegen'); } }, l)));
  let tiles;
  if (einfKat === 'Karten') {
    const stile = h('div', { class: 'kats' }, ...[['politisch', '🗺 Politisch'], ['physisch', '⛰ Physisch'], ['stumm', '◻ Stumm']].map(([v, l]) =>
      h('button', { class: 'kat' + (kartenStil === v ? ' on' : ''), onclick: () => { kartenStil = v; zeigeDock('einfuegen'); } }, l)));
    const kachel = ([id, em]) => h('button', { class: 'tile', onclick: async () => {
      toast('Karte wird geladen …', 1500);
      try { await T.ladeKarte(id); } catch (e) { toast('Kartendaten fehlen (Ordner app/karten).', 4000); return; }
      insertObj('karte', { ...T.BAUSTEINE.karte.def, ...T.KARTEN_STIL_DEF[kartenStil], gebiet: id });
      toast('Eingefügt – oben umschalten: Politisch / Physisch / Stumm, Namen, Flüsse …', 3000);
    } }, h('div', { class: 'em' }, em), T.KARTEN_GEBIETE[id].n);
    const liste = T.KARTEN_LISTE;
    return [kats, h('h3', {}, 'Kartenart'), stile, h('h3', {}, 'Welt & Kontinente'), h('div', { class: 'tiles' }, liste.slice(0, 7).map(kachel)),
      h('h3', {}, 'Deutschland & Bundesländer'), h('div', { class: 'tiles' }, liste.slice(7).map(kachel)),
      h('p', { class: 'hint' }, 'Kartendaten: Natural Earth (naturalearthdata.com, gemeinfrei). Landschaftsnamen in Deutschland: eigene Zusammenstellung.')];
  }
  if (einfKat === 'Uebungen') {
    const U = T.UEBUNGEN, ta = h('textarea', { class: 'feld', style: { width: '100%', minHeight: '170px', fontSize: '18px' } }, U[uebTyp].bsp);
    const typen = h('div', { class: 'kats' }, ...Object.entries(U).map(([k, u]) => h('button', { class: 'kat' + (k === uebTyp ? ' on' : ''), onclick: () => { uebTyp = k; zeigeDock('einfuegen'); } }, u.n)));
    return [kats, h('h3', {}, 'Übungsart'), typen, h('p', { class: 'hint' }, U[uebTyp].hilfe), ta,
      h('div', { class: 'row', style: { margin: '8px 0' } }, h('button', { class: 'big', onclick: () => { ta.value = U[uebTyp].bsp; } }, 'Beispiel'), h('button', { class: 'big prim', onclick: () => T.uebungErzeugen(uebTyp, ta.value) }, '⤴ Auf die Tafel')),
      h('p', { class: 'hint' }, 'Auf der Tafel: Kärtchen mit Finger oder Stift ziehen (rasten in Felder/Lücken ein) bzw. bei Multiple Choice antippen. Dann „✓ Prüfen“ – grün = richtig, rot = falsch. „↺ Mischen“ startet neu, „💡 Lösung“ zeigt die Lösung.')];
  }
  if (einfKat === 'Formeln') {
    const out = [kats];
    for (const [abschnitt, liste] of Object.entries(T.FORMELN)) {
      out.push(h('h3', {}, abschnitt), h('div', { class: 'formeln' }, ...liste.map(([name, text]) => {
        const g = T.genObj('formel', { text, groesse: 30 }, false);
        return h('button', { class: 'formel', title: name, onclick: () => { const d = { ...T.BAUSTEINE.formel.def, text, name }, gg = T.genObj('formel', d, false), k = 1 / T.page().view.z, [cx, cy] = T.viewCenter();
          T.snap(); const it = T.addItem({ t: 'o', k: 'formel', d, x: cx - gg.w * k / 2, y: cy - gg.h * k / 2, w: gg.w * k, h: gg.h * k, r: 0 }); setTool('auswahl'); T.select([it.id]); } },
          h('span', {}, name), h('img', { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(g.svg), alt: text }));
      })));
    }
    out.push(h('p', { class: 'hint' }, 'Antippen setzt die Formel auf die Tafel. Mit „✏️ Bearbeiten“ lässt sie sich ändern – Brüche als {Zähler|Nenner}.'));
    return out;
  }
  if (einfKat === 'Skelette') {
    const box = h('div', { class: 'tiles' }, h('p', { class: 'hint' }, 'Wird geladen …'));
    ladeSkript('app/bilder/skelette.js').then(() => {
      box.innerHTML = '';
      for (const sk of T.SKELETTE) box.append(h('button', { class: 'tile', title: `${sk.quelle} – ${sk.autor}, ${sk.lizenz}`, onclick: () => skelettEinfuegen(sk) }, h('img', { src: sk.src, alt: '' }), sk.n));
    }).catch(() => { box.innerHTML = ''; box.append(h('p', { class: 'hint' }, 'Die Datei app/bilder/skelette.js fehlt.')); });
    return [kats, box, h('p', { class: 'hint' }, 'Abbildungen von Wikimedia Commons, frei lizenziert (überwiegend gemeinfrei). Unter jedem Bild steht die Quelle – beim Hund (CC BY-SA) bitte stehen lassen. Beschriften einfach mit dem Stift.')];
  }
  if (einfKat === 'Medien') tiles = [
    tile(h('div', { class: 'em' }, '🖼️'), 'Bild', () => bildEinfuegen()),
    tile(h('div', { class: 'em' }, '📄'), 'PDF-Seiten', () => pdfEinfuegen()),
    tile(h('div', { class: 'em' }, '🔤'), 'Text', () => T.textDialog(null))];
  else tiles = (gruppen[einfKat] || []).map(k => tile(h('img', { src: T.thumb(k), alt: '' }), T.BAUSTEINE[k].name, () => {
    insertObj(k, { ...T.BAUSTEINE[k].def });
    if (T.BAUSTEINE[k].felder.length) toast('Eingefügt – mit „✏️ Bearbeiten“ anpassen (Maße, Inhalte …)', 2600);
  }));
  return [kats, h('div', { class: 'tiles' }, tiles), einfKat === 'Karten' ? h('p', { class: 'hint' }, 'Die Karten sind selbst gezeichnet und stark vereinfacht.') : ''];
}
async function fileToDataURL(file, max = 1800) {
  const url = URL.createObjectURL(file); const img = new Image(); img.src = url; await img.decode();
  const f = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * f); c.height = Math.round(img.naturalHeight * f);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
  const png = /png|gif|svg/.test(file.type);
  return { src: c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.88), w: c.width, h: c.height };
}
function addBild(src, w, hh, at) {
  const r = T.viewRect(), f = Math.min(1, platzBreite() * 0.6 / w, (r.y1 - r.y0) * 0.6 / hh), [cx, cy] = at || T.viewCenter();
  const o = { t: 'o', id: T.uid(), k: 'bild', d: { src }, x: cx - w * f / 2, y: cy - hh * f / 2, w: w * f, h: hh * f, r: 0 };
  T.snap(); T.addItem(o); setTool('auswahl'); T.select([o.id]);
}
async function bildEinfuegen(file) {
  file = file || await T.pickFile('image/*'); if (!file) return;
  try { const b = await fileToDataURL(file); addBild(b.src, b.w, b.h); } catch (e) { toast('Das Bild konnte nicht gelesen werden.'); }
}
let pdfjs = null;
async function ladePdfJs() {
  if (pdfjs) return pdfjs;
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  await new Promise((res, rej) => { const s = document.createElement('script'); s.src = base + 'pdf.min.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
  try { const code = await (await fetch(base + 'pdf.worker.min.js')).text(); window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }
  catch (e) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js'; }
  return (pdfjs = window.pdfjsLib);
}
async function pdfEinfuegen() {
  const file = await T.pickFile('application/pdf'); if (!file) return;
  toast('PDF wird geladen …', 8000);
  let lib; try { lib = await ladePdfJs(); } catch (e) { toast('Für PDFs wird eine Internetverbindung gebraucht (PDF-Leser wird nachgeladen). Alternativ: PDF-Seite als Bild (Screenshot) einfügen.', 6000); return; }
  try {
    const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise, max = Math.min(pdf.numPages, 30);
    T.snap(); const start = S.page + 1;
    for (let i = 1; i <= max; i++) {
      const pg = await pdf.getPage(i), vp0 = pg.getViewport({ scale: 1 }), sc = 1600 / vp0.width, vp = pg.getViewport({ scale: sc });
      const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: ctx, viewport: vp }).promise;
      const page = T.newPage('weiss'), w = 1200, hh = w * vp.height / vp.width;
      page.items.push({ t: 'o', id: T.uid(), k: 'bild', d: { src: c.toDataURL('image/jpeg', 0.85) }, x: 40, y: 40, w, h: hh, r: 0 });
      const z = Math.min((innerWidth - 40) / (w + 80), (innerHeight - 160) / (hh + 80)); page.view = { x: 20 - 40 * z + 20, y: 70, z };
      S.board.pages.splice(start + i - 1, 0, page);
    }
    gotoPage(start); toast(`${max} PDF-Seite(n) als neue Tafelseiten eingefügt.`);
  } catch (e) { toast('Die PDF-Datei konnte nicht gelesen werden.'); }
}

// Aufgabengenerator
const bruchHTML = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  .replace(/(\d+)\s*\/\s*(\d+)/g, '<span class="fr"><span>$1</span><span>$2</span></span>');
function aufgabenPanel() {
  let typ = T.AUFGABEN[T.opts.aufTyp] ? T.opts.aufTyp : 'plus', jg = T.opts.aufJg || 0, stufe = 1, anz = 8, loes = 'abdeckung', platz = T.opts.platz || 'mittel';
  // Jahrgangsfilter + Liste nach Kategorien (untereinander)
  const typen = h('div', { class: 'aufliste' });
  const zeigeTypen = () => {
    typen.innerHTML = '';
    for (const [kat, titel] of T.AUFGABEN_KAT) {
      const passend = Object.entries(T.AUFGABEN).filter(([, A]) => A.kat === kat && (!jg || (A.jg[0] <= jg && jg <= A.jg[1])));
      if (!passend.length) continue;
      typen.append(h('h4', {}, titel), ...passend.map(([k, A]) => h('button', { class: k === typ ? 'on' : '', 'data-k': k, onclick: () => { typ = k; T.opts.aufTyp = k; T.saveOpts(); typen.querySelectorAll('button').forEach(c => c.classList.toggle('on', c.dataset.k === k)); vorschau(); } },
        h('span', {}, A.name), h('small', {}, 'Jg. ' + (A.jg[0] === A.jg[1] ? A.jg[0] : A.jg[0] + '–' + A.jg[1])))));
    }
  };
  const jgRow = h('div', { class: 'row jgwahl' }, ...[0, 5, 6, 7, 8, 9, 10].map(j => h('button', { class: 'big' + (j === jg ? ' on' : ''), 'data-j': j, onclick: () => { jg = j; T.opts.aufJg = j; T.saveOpts(); [...jgRow.children].forEach(c => c.classList.toggle('on', +c.dataset.j === j)); zeigeTypen(); } }, j ? String(j) : 'Alle')));
  zeigeTypen();
  const sterne = h('div', { class: 'row' }, ...[1, 2, 3].map(s => h('button', { class: 'big' + (s === stufe ? ' on' : ''), 'data-s': s, onclick: () => { stufe = s; [...sterne.children].forEach(c => c.classList.toggle('on', +c.dataset.s === s)); vorschau(); } }, '★'.repeat(s))));
  const anzahl = h('div', { class: 'row' }, ...[4, 6, 8, 10, 12, 16].map(a => h('button', { class: 'big' + (a === anz ? ' on' : ''), 'data-a': a, onclick: () => { anz = a; [...anzahl.children].forEach(c => c.classList.toggle('on', +c.dataset.a === a)); vorschau(); } }, String(a))));
  const lsg = h('select', { class: 'feld', onchange: e => { loes = e.target.value; } }, h('option', { value: 'abdeckung' }, 'Lösungen daneben unter einer Abdeckung'), h('option', { value: 'seite' }, 'Lösungen auf neuer Seite'), h('option', { value: 'keine' }, 'ohne Lösungen'));
  const pre = h('div', { class: 'vorschau' });
  let cur = null;
  const vorschau = () => { cur = T.erzeugeAufgaben(typ, stufe, anz); pre.innerHTML = bruchHTML(cur.titel + '\n' + cur.aufgaben.join('\n') + '\n\nLösungen: ' + cur.loesungen.join('   ')); };
  vorschau();
  const PLATZ = [['wenig', 'wenig'], ['mittel', 'mittel'], ['viel', 'viel (schriftlich)']];
  const platzRow = h('div', { class: 'row' }, ...PLATZ.map(([v, l]) => h('button', { class: 'big' + (v === platz ? ' on' : ''), 'data-p': v, onclick: () => { platz = v; T.opts.platz = v; T.saveOpts(); [...platzRow.children].forEach(c => c.classList.toggle('on', c.dataset.p === v)); } }, l)));
  return [h('h3', {}, 'Jahrgang'), jgRow, h('h3', {}, 'Thema'), typen, h('h3', {}, 'Niveau'), sterne, h('h3', {}, 'Anzahl'), anzahl,
    h('h3', {}, 'Platz zum Rechnen'), platzRow,
    h('label', { class: 'fld' }, 'Lösungen', lsg),
    h('div', { class: 'row', style: { margin: '6px 0' } }, h('button', { class: 'big', onclick: vorschau }, '🎲 Neu würfeln'), h('button', { class: 'big prim', onclick: () => { aufgabenEinfuegen(cur, loes, platz); vorschau(); } }, '⤴ Auf die Tafel')),
    h('h3', {}, 'Vorschau'), pre,
    h('p', { class: 'hint' }, 'Jede Aufgabe ist ein eigenes Element und lässt sich einzeln verschieben. Auf karierten Seiten stehen Zahlen und Zeichen in den Kästchen und rasten beim Verschieben ein.')];
}
// Aufgaben einzeln auf die Tafel – auf karierten Seiten in Kästchenschrift, am Raster ausgerichtet
function aufgabenEinfuegen(a, loes, platz = 'mittel') {
  const PL = { wenig: [1, 3], mittel: [3, 6], viel: [6, 10] }[platz] || [3, 6]; // [freie Kästchenzeilen darunter, freie Kästchen daneben]
  const pg = T.page(), g = T.gridPx(pg), ink = T.isDark(pg) ? '#ffffff' : '#1a1a1a', r = T.viewRect(), u = g || 40;
  const up = v => g ? Math.ceil(v / g - 1e-6) * g : v, snap = v => g ? Math.round(v / g) * g : v;
  const kurz = t => t.replace(/\s{2,}/g, ' ').trim();
  const nurMathe = t => /^[a-z]{1,2}\)\s[0-9xX+\-−·:=()/,.\s]*$/.test(t);
  const obj = (d, x, y) => { const m = T.textMetrics(d); return { t: 'o', id: T.uid(), k: 'text', d, x, y, w: m.w, h: m.h, r: 0 }; };
  const text = (t, x, y, c, fett, gross) => {
    t = kurz(t);
    if (g && t.split('\n').every(nurMathe)) return obj({ text: t, size: g * 0.62, c: c || ink, fett: !!fett, karo: g }, x, y);
    return obj({ text: t, size: gross || (g ? g * 0.55 : 36), c: c || ink, fett: !!fett }, x, y);
  };
  T.snap(); const items = [];
  const x0 = snap(r.x0 + 2 * u), yTop = snap(r.y0 + 1.5 * u);
  const titel = text(a.titel, x0, yTop, '#5b5bd6', true, g ? g * 0.7 : 40); items.push(titel);
  const yStart = up(yTop + titel.h + u * 1.5), proSpalte = Math.ceil(a.aufgaben.length / (a.aufgaben.length > 4 ? 2 : 1));
  const zeile = g || 60; // eine (Kästchen-)Zeile
  let x = x0, y = yStart, colW = 0, maxX = x0 + titel.w;
  a.aufgaben.forEach((t, i) => {
    if (i && i % proSpalte === 0) { x = up(x + colW + PL[1] * u); y = yStart; colW = 0; }
    const o = text(t, x, y); items.push(o); colW = Math.max(colW, o.w); maxX = Math.max(maxX, x + o.w);
    y = up(y + o.h + PL[0] * zeile); // Platz zum Rechnen unter jeder Aufgabe
  });
  maxX = up(maxX + PL[1] * u); // rechts daneben ebenfalls Platz zum Rechnen
  if (a.zeigeGraph && a.graphen) {
    const gr = placeObj('koord', { ...T.BAUSTEINE.koord.def, xmin: -6, xmax: 6, ymin: -6, ymax: 6, einheit: 0.7, ohneTerm: true, funktionen: a.graphen.slice(0, 5).join('\n') }, null, 1);
    gr.x = maxX; gr.y = yStart; items.push(gr); maxX = up(maxX + gr.w + u);
  }
  for (const it of items) pg.items.push(it);
  const lz = a.loesungen.map(kurz).join('\n');
  if (loes === 'abdeckung') {
    const lk = text('Lösungen', maxX, yTop, '#2e7d32', true, g ? g * 0.55 : 32), l = text(lz, maxX, yStart, '#2e7d32');
    pg.items.push(lk, l); items.push(lk, l);
    // Abdeckung über Überschrift und Lösungen (gleiches Seitenverhältnis wie die Vorlage)
    const bx = maxX - 15, by = yTop - 15, bw = Math.max(l.w, lk.w) + 30, bh = l.y + l.h - yTop + 30;
    const ab = placeObj('abdeckung', { text: 'Lösungen – zum Aufdecken verschieben' }, null, 1);
    ab.w = bw; ab.h = bh; ab.x = bx; ab.y = by; pg.items.push(ab); items.push(ab);
  } else if (loes === 'seite') {
    const p = T.newPage(pg.bg); p.abstand = pg.abstand || null;
    const l = text(lz, snap(2 * u), snap(2 * u), '#2e7d32'); p.items.push(l);
    S.board.pages.splice(S.page + 1, 0, p); toast('Lösungen stehen auf Seite ' + (S.page + 2));
  }
  // Ansicht so anpassen, dass alle neuen Aufgaben sichtbar sind
  const bb = items.reduce((b, it) => ({ x0: Math.min(b.x0, it.x), y0: Math.min(b.y0, it.y), x1: Math.max(b.x1, it.x + it.w), y1: Math.max(b.y1, it.y + it.h) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
  if (bb.x0 < r.x0 || bb.y0 < r.y0 || bb.x1 > r.x1 || bb.y1 > r.y1 - 2 * u) {
    const v = pg.view, z = Math.min(v.z, (T.W - T.ox - 60) / (bb.x1 - bb.x0), (T.H - 200) / (bb.y1 - bb.y0));
    v.z = T.clamp(z, 0.1, 8); v.x = 30 - bb.x0 * v.z; v.y = 76 - bb.y0 * v.z; T.onZoom && T.onZoom(); T.renderOver();
  }
  T.render(); updateToolbar();
}

// Winkel genau eingeben (Tippen auf ↻)
T.angleDialog = I => {
  const D = T.INSTR[I.kind]; let deg = Math.round(-I.a * 180 / Math.PI); deg = ((deg % 360) + 360) % 360;
  const inp = h('input', { type: 'text', value: deg, inputmode: 'decimal', style: { fontSize: '30px', width: '160px' } });
  const set = v => { T.setAngleAbout(I, -v * Math.PI / 180, D.center[0], D.center[1]); T.renderOver(); };
  openDlg([h('h2', {}, D.name + ': Winkel und Größe'), h('label', { class: 'fld' }, 'Winkel in Grad (gegen den Uhrzeigersinn)', inp),
    h('div', { class: 'row' }, ...[0, 15, 30, 45, 60, 90, 120, 135, 180, 270].map(v => h('button', { class: 'big', onclick: () => { set(v); closeDlg(); } }, v + '°'))),
    h('h3', {}, 'Größe (auch mit zwei Fingern aufziehen)'),
    h('div', { class: 'row' }, ...[[0.75, '75 %'], [1, '100 %'], [1.5, '150 %'], [2, '200 %'], [3, '300 %']].map(([k, l]) => h('button', { class: 'big' + (Math.abs((I.s || 1) - k) < 0.01 ? ' on' : ''), onclick: () => { T.setScaleAbout(I, k, D.center[0], D.center[1]); T.renderOver(); closeDlg(); } }, l))),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => { const v = parseFloat(String(inp.value).replace(',', '.')); if (!isNaN(v)) set(v); closeDlg(); } }, 'Drehen'))]);
  setTimeout(() => inp.select(), 50);
};

// ---------- Einstellungen ----------
function settingsDialog() {
  const o = T.opts, sel = (k, opts) => h('select', { onchange: e => { o[k] = e.target.value; T.saveOpts(); } }, ...opts.map(([v, l]) => h('option', { value: v, selected: o[k] === v }, l)));
  const chk = (k, l, fn) => { const i = h('input', { type: 'checkbox', onchange: e => { o[k] = e.target.checked; T.saveOpts(); fn && fn(); } }); i.checked = !!o[k]; return h('label', { class: 'fld check' }, i, l); };
  const glatt = h('input', { type: 'range', min: 0, max: 0.8, step: 0.05, value: o.glatt, oninput: e => { o.glatt = +e.target.value; T.saveOpts(); } });
  openDlg([h('h2', {}, 'Einstellungen'),
    h('label', { class: 'fld' }, 'Finger (Berührung ohne Stift)', sel('finger', [['pan', 'verschieben & zoomen (Stift schreibt)'], ['radieren', 'radieren (2 Finger verschieben)'], ['schreiben', 'schreiben wie der Stift (Board unterscheidet nicht)']])),
    chk('palm', 'Handballen / Schwamm (große Berührfläche) radiert'),
    h('label', { class: 'fld' }, 'Druckstärke des Stifts', sel('druck', [['auto', 'automatisch (Druck oder Tempo)'], ['aus', 'aus – immer gleich dick']])),
    h('label', { class: 'fld' }, 'Glättung der Handschrift', glatt),
    chk('leisteOben', 'Werkzeugleiste oben statt unten', () => document.body.classList.toggle('leisteOben', o.leisteOben)),
    h('label', { class: 'fld' }, 'Darstellung', h('select', { onchange: e => T.setThema(e.target.value) }, ...Object.entries(THEMEN).map(([v, [i, l]]) => h('option', { value: v, selected: (o.thema || 'auto') === v }, i + ' ' + l)))),
    h('h3', {}, 'Stift-Test'),
    h('p', { class: 'hint', html: 'Oben rechts steht nach jeder Berührung, was die Tafel meldet: <b>✒ Stift</b>, <b>☝ Finger</b> oder <b>🖱 Maus</b>. Erscheint beim Schreiben mit dem SMART-Stift ein „Screenshot“ mit eigener Ink-Leiste, ist SMART Ink aktiv – siehe Anleitung, Abschnitt „SMART Board“.' }),
    h('h3', {}, 'Ablageordner'),
    h('p', { class: 'hint' }, F.supported ? (F.root ? 'Verbunden: »' + F.name() + '«' : F.pending ? 'Ordner »' + F.name() + '« muss neu bestätigt werden.' : 'Kein Ordner verbunden – Tafeln werden als Datei heruntergeladen.') : 'Dieser Browser kann keine Ordner verbinden – bitte Microsoft Edge verwenden.'),
    F.supported ? h('button', { class: 'big', onclick: async () => { try { await F.connect(); closeDlg(); status(); toast('Ordner verbunden: ' + F.name()); } catch (e) {} } }, '📂 Ordner wählen / ändern') : '',
    h('div', { class: 'acts' }, h('button', { class: 'big prim', onclick: closeDlg }, 'Fertig'))]);
}
T.onPointerInfo = e => {
  const t = { pen: '✒ Stift', touch: '☝ Finger', mouse: '🖱 Maus' }[e.pointerType] || e.pointerType;
  $('stiftInfo').textContent = t + (e.pointerType === 'pen' && e.pressure && e.pressure !== 0.5 ? ' · Druck' : '');
};

// ---------- Tafel-Infos ----------
function infoDialog() {
  const b = S.board;
  const fs = [{ k: 'lehrkraft', l: 'Lehrkraft', typ: 'text' }, { k: 'fach', l: 'Fach', typ: 'auswahl', opts: T.FAECHER.map(f => [f.id, f.icon + ' ' + f.id]).concat(T.FAECHER.some(f => f.id === b.fach) ? [] : [[b.fach, b.fach]]) }, { k: 'titel', l: 'Titel', typ: 'text' }].map(f => ({ f, ...feld(f, b[f.k]) }));
  const datum = h('input', { type: 'date', value: b.datum });
  openDlg([h('h2', {}, 'Tafel-Infos'), ...fs.map(x => x.el), h('label', { class: 'fld' }, 'Datum', datum),
    h('p', { class: 'hint' }, 'Gespeichert wird unter: Ablageordner › Lehrkraft › Fach › „Datum Titel.tafel.json“.'),
    h('div', { class: 'acts' }, h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
      for (const x of fs) b[x.f.k] = String(x.get()).trim() || b[x.f.k]; b.datum = datum.value || b.datum; closeDlg(); T.changed(); topInfo(); speichern();
    } }, 'Übernehmen'))]);
}

// ---------- Speichern ----------
let saving = false, lastSaved = null;
function status() {
  const st = $('status'); if (!S.board) return;
  st.classList.remove('warn');
  if (saving) st.textContent = '… speichert';
  else if (F.root && S.file && !S.dirty) st.textContent = '✓ gespeichert ' + (lastSaved || '');
  else if (F.root) st.textContent = S.dirty ? '● ungespeichert' : '';
  else { st.textContent = F.pending ? '⚠ Ordner bestätigen' : '⚠ kein Ablageordner'; st.classList.add('warn'); }
}
T.onChange = () => { status(); updateToolbar(); clearTimeout(backupT); backupT = setTimeout(backup, 2500); };
let backupT = 0;
async function backup() { if (!S.board) return; try { await T.idbSet('backup', { json: JSON.stringify(S.board), dirty: S.dirty, file: S.file, zeit: Date.now() }); } catch (e) {} }
async function speichern(manuell) {
  if (!S.board || saving) return;
  if (!F.root) {
    if (F.pending && manuell) { try { if (await F.reconnect()) return speichern(true); } catch (e) {} }
    if (manuell) { F.download(S.board); S.dirty = false; status(); backup(); toast('Als Datei heruntergeladen (kein Ablageordner verbunden).'); }
    return;
  }
  saving = true; status();
  try {
    const r = await F.save(S.board, S.file); S.file = r.file; S.dirty = false;
    lastSaved = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    if (r.hinweis === 'konflikt') toast('Die Datei wurde zwischenzeitlich woanders geändert – Ihre Fassung liegt als „(Konflikt)“-Kopie daneben.', 6000);
    else if (manuell) toast('Gespeichert: ' + r.file.teacher + ' › ' + r.file.fach + ' › ' + r.file.name);
    backup();
  } catch (e) { toast('Speichern fehlgeschlagen: ' + (e.message || e), 5000); }
  saving = false; status();
}
setInterval(() => { if (S.board && S.dirty && F.root && S.file && !S.drag && !T.live) speichern(false); }, 20000);
addEventListener('beforeunload', e => { if (S.board && S.dirty) { backup(); e.preventDefault(); e.returnValue = ''; } });

function topInfo() {
  const b = S.board; if (!b) return; $('titel').value = b.titel;
  const f = T.fach(b.fach), [y, m, d] = b.datum.split('-');
  $('ablageInfo').textContent = `${f.icon} ${b.fach} · ${b.lehrkraft} · ${d}.${m}.${y}`; $('ablageInfo').style.background = f.farbe + '22';
  document.title = b.titel + ' – Tafel-App';
}
$('titel').addEventListener('change', e => { if (!S.board) return; S.board.titel = e.target.value.trim() || 'Tafel'; T.changed(); topInfo(); speichern(); });
$('titel').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });

function ladeTafel(board, file) {
  S.board = T.checkBoard(board); S.file = file || null; S.page = 0; S.sel = null; S.dirty = false; S.inst = [];
  T.hist.u.length = 0; T.hist.r.length = 0;
  $('archiv').style.display = 'none'; topInfo(); updateToolbar(); autoInk(); T.render(); T.renderOver(); status(); zoomInfo(); backup();
  T.onBoardLoaded && T.onBoardLoaded();
}
async function neueTafel(lehrkraft, fach, titel) {
  const b = T.newBoard(lehrkraft, fach, titel || 'Tafel ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }));
  if (fach === 'Mathe') b.pages[0].bg = 'kariert';
  if (fach === 'Musik') b.pages[0].bg = 'noten';
  ladeTafel(b, null); S.dirty = true; if (F.root) await speichern(false); status();
}

// ---------- Tafel-Archiv (Startbildschirm) ----------
let archivFach = null;
async function archiv() {
  const A = $('archiv'); A.style.display = 'block'; A.innerHTML = ''; T.closePops();
  const name = T.opts.lehrkraft;
  const kopf = h('div', { class: 'kopf' }, h('h1', {}, '🧑‍🏫 Tafel-App'), h('span', { class: 'spacer' }),
    S.board ? h('button', { class: 'big', onclick: () => { A.style.display = 'none'; } }, '← Zurück zur Tafel') : '');
  A.append(kopf);
  // Schnellstart ganz oben – leere Tafel ohne Lehrkraft/Fach-Auswahl
  A.append(h('button', { class: 'loslegen', onclick: () => neueTafel(T.opts.lehrkraft || 'Lehrkraft', 'Sonstiges', 'Schnelle Tafel') },
    h('span', { class: 'ico' }, '⚡'), h('span', {}, h('b', {}, 'Schnell loslegen'), h('small', {}, 'Leere Tafel öffnen und sofort schreiben'))));
  // Ablage
  const ab = h('div', { class: 'karte' });
  if (F.intern) ab.append(h('p', { class: 'hint' }, '📱 Die Tafeln werden in der App auf diesem Gerät gespeichert (Lehrkraft › Fach). Bitte ab und zu „💾 Sicherung exportieren“ – z. B. auf einen USB-Stick oder in IServ. Mit „📥 Sicherung einspielen“ kommen Tafeln von einem anderen Gerät hierher.'));
  else if (!F.supported) ab.append(h('p', { class: 'hint' }, '⚠ Dieser Browser kann keinen Ablageordner verbinden. Bitte die App über „Tafel starten.bat“ in Microsoft Edge öffnen. Bis dahin werden Tafeln als Datei heruntergeladen.'));
  else if (F.root) ab.append(h('div', { class: 'row' }, h('span', { class: 'hint', style: { flex: 1 } }, '📂 Ablageordner: »' + F.name() + '« (Unterordner: Lehrkraft › Fach)'), h('button', { class: 'big', onclick: async () => { try { await F.connect(); archiv(); } catch (e) {} } }, 'Ordner ändern')));
  else if (F.pending) ab.append(h('div', { class: 'row' }, h('span', { class: 'hint', style: { flex: 1 } }, 'Der Ablageordner »' + F.name() + '« muss nach dem Start einmal bestätigt werden.'), h('button', { class: 'big prim', onclick: async () => { try { await F.reconnect(); } catch (e) {} archiv(); status(); } }, '✓ Ordner freigeben')));
  else ab.append(h('div', { class: 'row' }, h('span', { class: 'hint', style: { flex: 1 } }, 'Noch kein Ablageordner. Wählen Sie einen Ordner, z. B. „Tafeln“ in OneDrive oder im synchronisierten IServ-Ordner. Die App legt darin pro Lehrkraft und Fach Unterordner an.'), h('button', { class: 'big prim', onclick: async () => { try { await F.connect(); archiv(); status(); } catch (e) {} } }, '📂 Ordner wählen')));
  A.append(ab);
  // Wiederherstellen
  try {
    const bk = await T.idbGet('backup');
    if (bk && bk.dirty && (!S.board || JSON.parse(bk.json).id !== S.board.id)) {
      const b = JSON.parse(bk.json);
      A.append(h('div', { class: 'karte warnbox' }, h('div', { class: 'row' }, h('span', { style: { flex: 1, fontSize: '17px' } }, `⚠ Ungesicherte Tafel gefunden: „${b.titel}“ (${b.fach}, ${new Date(bk.zeit).toLocaleString('de-DE')})`),
        h('button', { class: 'big prim', onclick: () => { ladeTafel(b, bk.file); S.dirty = true; status(); speichern(false); } }, 'Wiederherstellen'))));
    }
  } catch (e) {}
  // Lehrkraft
  const lk = h('div', { class: 'karte' }, h('h3', { style: { marginTop: 0 } }, '1. Lehrkraft'));
  const chips = h('div', { class: 'chips' });
  const namen = new Set(await F.teachers().catch(() => [])); if (name) namen.add(name);
  for (const n of [...namen].sort((a, b) => a.localeCompare(b, 'de'))) chips.append(h('button', { class: 'chip' + (n === name ? ' on' : ''), onclick: () => { T.opts.lehrkraft = n; T.saveOpts(); T.onLehrkraft && T.onLehrkraft(); archiv(); } }, n));
  chips.append(h('button', { class: 'chip', onclick: () => { const n = prompt('Name oder Kürzel der Lehrkraft:', ''); if (n && n.trim()) { T.opts.lehrkraft = F.safe(n.trim()); T.saveOpts(); T.onLehrkraft && T.onLehrkraft(); archiv(); } } }, '＋ Neu'));
  lk.append(chips); A.append(lk);
  if (!name) { A.append(h('p', { class: 'hint' }, 'Bitte zuerst eine Lehrkraft wählen oder anlegen.')); A.append(dateiKarte()); return; }
  // Fächer + Liste
  const cols = h('div', { class: 'cols' }), links = h('div', { class: 'karte' }, h('h3', { style: { marginTop: 0 } }, '2. Fach')), rechts = h('div', { class: 'karte' });
  const counts = await F.faecher(name);
  const fg = h('div', { class: 'faecher' });
  const alle = T.FAECHER.map(f => f.id); for (const k of Object.keys(counts)) if (!alle.includes(k)) alle.push(k);
  for (const id of alle) { const f = T.fach(id); fg.append(h('button', { class: 'fach' + (archivFach === id ? ' on' : ''), style: { background: f.farbe }, onclick: () => { archivFach = id; archiv(); } }, h('span', { style: { fontSize: '28px' } }, f.icon), id, counts[id] ? h('span', { class: 'n' }, counts[id] + ' Tafel' + (counts[id] > 1 ? 'n' : '')) : '')); }
  links.append(fg); cols.append(links, rechts); A.append(cols);
  if (!archivFach) rechts.append(h('h3', { style: { marginTop: 0 } }, '3. Tafel'), h('p', { class: 'hint' }, 'Fach antippen – dann neue Tafel anlegen oder eine gespeicherte öffnen.'));
  else {
    rechts.append(h('h3', { style: { marginTop: 0 } }, `3. ${archivFach}: Tafeln`));
    const ti = h('input', { type: 'text', class: 'feld', placeholder: 'Titel, z. B. „Brüche addieren“', style: { flex: 1, minWidth: '200px' } });
    rechts.append(h('div', { class: 'row', style: { marginBottom: '14px' } }, ti, h('button', { class: 'big prim', onclick: () => neueTafel(name, archivFach, ti.value.trim()) }, '＋ Neue Tafel')));
    const liste = h('div', { class: 'liste' });
    const boards = await F.boards(name, archivFach);
    if (!boards.length) liste.append(h('p', { class: 'hint' }, F.root ? 'Noch keine Tafeln in diesem Fach.' : 'Ohne Ablageordner werden hier keine Tafeln angezeigt – „Datei öffnen“ nutzen.'));
    for (const b of boards) {
      const [y, m, d] = (b.datum || '--').split('-');
      const open = async kopie => { try { const r = await F.read(name, archivFach, b.name); if (kopie) { r.board.id = T.uid(); r.board.datum = T.today(); ladeTafel(r.board, null); S.dirty = true; speichern(false); toast('Kopie mit heutigem Datum angelegt.'); } else ladeTafel(r.board, r.file); } catch (e) { toast('Öffnen fehlgeschlagen: ' + e.message); } };
      const loeschen = async () => {
        if (!confirm(`Tafel „${b.titel}“ löschen?\n\nSie kommt in den Papierkorb und kann dort wiederhergestellt werden.`)) return;
        try {
          await F.trash(name, archivFach, b.name);
          if (S.file && S.file.name === b.name && S.file.fach === F.safe(archivFach) && S.file.teacher === F.safe(name)) S.file = null; // offene Tafel nicht still neu anlegen
          toast(`„${b.titel}“ liegt jetzt im Papierkorb.`); archiv();
        } catch (e) { toast('Löschen fehlgeschlagen: ' + e.message, 5000); }
      };
      liste.append(h('div', { class: 'eintrag' }, h('span', { class: 'd' }, d ? `${d}.${m}.${y}` : ''), h('span', { class: 't' }, b.titel),
        h('button', { class: 'big', title: 'Als neue Tafel mit heutigem Datum öffnen', onclick: () => open(true) }, '⧉ Als Vorlage'), h('button', { class: 'big prim', onclick: () => open(false) }, 'Öffnen'),
        h('button', { class: 'big warn', title: 'Tafel löschen (in den Papierkorb)', onclick: loeschen }, '🗑')));
    }
    rechts.append(liste);
    const pk = (await F.trashList(name)).filter(x => x.fach === F.safe(archivFach));
    if (pk.length) {
      const pl = h('div', { class: 'liste', style: { display: 'none', marginTop: '8px' } });
      for (const x of pk) {
        const mm = x.name.match(/^(\d{4})-(\d{2})-(\d{2})\s+(.*?)\.tafel\.json$/);
        pl.append(h('div', { class: 'eintrag alt' }, h('span', { class: 'd' }, mm ? `${mm[3]}.${mm[2]}.${mm[1]}` : ''), h('span', { class: 't' }, mm ? mm[4] : x.name),
          h('button', { class: 'big', onclick: async () => { try { await F.restore(name, x.fach, x.name); toast('Wiederhergestellt.'); archiv(); } catch (e) { toast('Fehlgeschlagen: ' + e.message, 5000); } } }, '↩ Wiederherstellen')));
      }
      rechts.append(h('button', { class: 'big', style: { marginTop: '14px' }, onclick: () => { pl.style.display = pl.style.display === 'none' ? 'flex' : 'none'; } }, `🗑 Papierkorb (${pk.length})`), pl);
    }
  }
  A.append(dateiKarte());
}
function dateiKarte() {
  const oeffnen = async () => {
    try {
      const b = await F.upload(); if (!b) return;
      if (F.istSicherung(b)) {
        if (!F.root) { toast('Zum Einspielen einer Sicherung zuerst einen Ablageordner wählen.', 5000); return; }
        const n = await F.einspielen(b); toast(`Sicherung eingespielt: ${n} Datei(en) neu – vorhandene wurden nicht überschrieben.`, 5000); archiv(); return;
      }
      ladeTafel(b, null); S.dirty = true; toast('Geöffnet. Beim Speichern landet die Tafel in der Ablage.');
    } catch (e) { toast('Diese Datei ist keine Tafel: ' + e.message); }
  };
  return h('div', { class: 'karte' }, h('div', { class: 'row' }, h('span', { class: 'hint', style: { flex: 1, minWidth: '220px' } }, 'Tafel-Datei oder Sicherung von woanders öffnen (z. B. aus IServ oder vom USB-Stick):'),
    h('button', { class: 'big', onclick: oeffnen }, '📂 Datei öffnen / 📥 Sicherung einspielen'),
    F.root ? h('button', { class: 'big', title: 'Alle Tafeln und Notizen in einer Datei sichern', onclick: async () => { try { const n = await F.sicherung(); toast(`Sicherung mit ${n} Datei(en) heruntergeladen.`); } catch (e) { toast('Sicherung fehlgeschlagen: ' + e.message, 5000); } } }, '💾 Sicherung exportieren') : ''));
}

// ---------- Export ----------
function contentRect(pg) {
  if (!pg.items.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of pg.items) { const b = T.bbox(it); x0 = Math.min(x0, b.x0); y0 = Math.min(y0, b.y0); x1 = Math.max(x1, b.x1); y1 = Math.max(y1, b.y1); }
  return { x0: x0 - 40, y0: y0 - 40, x1: x1 + 40, y1: y1 + 40 };
}
async function ensureImages(pg) {
  const dark = T.isDark(pg);
  await Promise.all(pg.items.filter(it => it.t === 'o' && it.k !== 'text').map(o => { const img = T.objImage(o, dark); return img.complete ? null : img.decode().catch(() => {}); }));
}
async function renderPage(pg, maxPx = 3000, useView) {
  await ensureImages(pg);
  let r = contentRect(pg);
  if (!r || useView) { const v = pg.view; r = { x0: -v.x / v.z, y0: -v.y / v.z, x1: (innerWidth - v.x) / v.z, y1: (innerHeight - v.y) / v.z }; }
  const w = r.x1 - r.x0, hh = r.y1 - r.y0, s = Math.min(2, maxPx / Math.max(w, hh));
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(hh * s);
  const ctx = c.getContext('2d'); ctx.setTransform(s, 0, 0, s, -r.x0 * s, -r.y0 * s);
  T.paintPage(ctx, pg, r, 1 / s, { export: true }); return c;
}
function exportPop(el) {
  const name = () => `${F.safe(S.board.titel)}`;
  openPop(el, h('h4', {}, 'Export'), h('div', { class: 'row', style: { flexDirection: 'column', alignItems: 'stretch' } },
    h('button', { class: 'big', onclick: async () => { T.closePops(); const c = await renderPage(T.page()); c.toBlob(b => T.downloadBlob(b, `${name()} – Seite ${S.page + 1}.png`)); } }, '🖼 Diese Seite als PNG'),
    h('button', { class: 'big', onclick: async () => { T.closePops(); const c = await renderPage(T.page(), 3000, true); c.toBlob(b => T.downloadBlob(b, `${name()} – Ausschnitt.png`)); } }, '🖼 Sichtbarer Ausschnitt als PNG'),
    h('button', { class: 'big', onclick: () => { T.closePops(); druckePDF(); } }, '📄 Alle Seiten als PDF (Drucken → „Als PDF speichern“)'),
    h('button', { class: 'big', onclick: () => { T.closePops(); F.download(S.board); } }, '💾 Tafel-Datei herunterladen (.tafel.json)')));
}
async function druckePDF() {
  toast('PDF wird vorbereitet …');
  const d = $('druck'); d.innerHTML = '';
  for (const pg of S.board.pages) { const c = await renderPage(pg, 2200); d.append(h('img', { src: c.toDataURL('image/jpeg', 0.9) })); }
  await Promise.all([...d.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
  window.print(); setTimeout(() => { d.innerHTML = ''; }, 1000);
}

// ---------- Klassen-Werkzeuge (Timer, Zufall, Würfel) ----------
let wz = 15;
function widget(title, body, x, y) {
  const w = h('div', { class: 'widget', style: { left: (x || 120) + 'px', top: (y || 120) + 'px' } });
  const head = h('div', { class: 'wk' }, h('span', {}, title), h('button', { onclick: () => { w.remove(); w.onclose && w.onclose(); } }, '×'));
  w.append(head, h('div', { class: 'wb' }, body)); document.body.append(w); w.style.zIndex = ++wz;
  let d = null;
  head.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON') return; d = [e.clientX - w.offsetLeft, e.clientY - w.offsetTop]; head.setPointerCapture(e.pointerId); w.style.zIndex = ++wz; });
  head.addEventListener('pointermove', e => { if (d) { w.style.left = T.clamp(e.clientX - d[0], 0, innerWidth - 80) + 'px'; w.style.top = T.clamp(e.clientY - d[1], 56, innerHeight - 60) + 'px'; } });
  head.addEventListener('pointerup', () => { d = null; });
  return w;
}
T.widget = (...a) => widget(...a); T.beep = () => beep(); T.addBild = (...a) => addBild(...a); T.setTool = id => setTool(id); // für classroom.js / plotter.js
function beep() { try { const a = new AudioContext(); [0, 0.35, 0.7].forEach(t => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.25, a.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + 0.3); o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.3); }); } catch (e) {} }
// Vorhang: deckt die Tafel ab und lässt sich von jeder Seite Stück für Stück aufziehen
let vorhang = null;
const VH = { l: 0, t: 0, r: 1, b: 1 }; // abgedeckter Bereich als Anteil der Tafelfläche
function vorhangPlatz() {
  if (!vorhang) return;
  const ax = T.ox, ay = 56, aw = innerWidth - T.ox, ah = innerHeight - 56;
  if (VH.r - VH.l < 0.01 || VH.b - VH.t < 0.01) { vorhangUmschalten(false); toast('Vorhang ganz geöffnet.', 1500); return; }
  Object.assign(vorhang.style, { left: ax + VH.l * aw + 'px', top: ay + VH.t * ah + 'px', width: (VH.r - VH.l) * aw + 'px', height: (VH.b - VH.t) * ah + 'px' });
}
T.vorhangPlatz = vorhangPlatz;
function vorhangUmschalten(an) {
  an = an == null ? !vorhang : an;
  if (!an) { if (vorhang) vorhang.remove(); vorhang = null; updateToolbar(); return; }
  if (vorhang) return;
  Object.assign(VH, { l: 0, t: 0, r: 1, b: 1 });
  vorhang = h('div', { id: 'vorhang' });
  const griff = (seite, sym, title) => {
    const g = h('div', { class: 'vgriff ' + seite, title }, h('span', {}, sym));
    let start = null;
    g.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { g.setPointerCapture(e.pointerId); } catch (x) {} start = { x: e.clientX, y: e.clientY, v: { ...VH }, moved: false }; });
    g.addEventListener('pointermove', e => {
      if (!start) return; const dx = (e.clientX - start.x) / (innerWidth - T.ox), dy = (e.clientY - start.y) / (innerHeight - 56);
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) start.moved = true; if (!start.moved) return;
      if (seite === 'oben') VH.t = T.clamp(start.v.t + dy, 0, VH.b);
      if (seite === 'unten') VH.b = T.clamp(start.v.b + dy, VH.t, 1);
      if (seite === 'links') VH.l = T.clamp(start.v.l + dx, 0, VH.r);
      if (seite === 'rechts') VH.r = T.clamp(start.v.r + dx, VH.l, 1);
      vorhangPlatz();
    });
    const ende = () => {
      if (start && !start.moved) { // antippen: ein Stück (10 %) aufziehen
        if (seite === 'oben') VH.t = Math.min(VH.b, VH.t + 0.1); if (seite === 'unten') VH.b = Math.max(VH.t, VH.b - 0.1);
        if (seite === 'links') VH.l = Math.min(VH.r, VH.l + 0.1); if (seite === 'rechts') VH.r = Math.max(VH.l, VH.r - 0.1);
        vorhangPlatz();
      }
      start = null;
    };
    g.addEventListener('pointerup', ende); g.addEventListener('pointercancel', ende);
    return g;
  };
  vorhang.append(griff('oben', '▼', 'Von oben aufziehen (antippen: ein Stück)'), griff('unten', '▲', 'Von unten aufziehen'), griff('links', '▶', 'Von links aufziehen'), griff('rechts', '◀', 'Von rechts aufziehen'),
    h('div', { class: 'vmitte' }, h('button', { class: 'vknopf', title: 'Vorhang wieder ganz schließen', onclick: () => { Object.assign(VH, { l: 0, t: 0, r: 1, b: 1 }); vorhangPlatz(); } }, '↺'),
      h('button', { class: 'vknopf', title: 'Vorhang entfernen', onclick: () => vorhangUmschalten(false) }, '×')));
  vorhang.addEventListener('pointerdown', e => e.stopPropagation());
  document.body.append(vorhang); vorhangPlatz(); updateToolbar();
}
addEventListener('resize', vorhangPlatz);

// Phasentimer: mehrere Phasen laufen nacheinander ab, mit Signal beim Wechsel
const PHASEN_VORLAGEN = {
  'Unterrichtsstunde (45 min)': [['Einstieg', 5], ['Erarbeitung', 20], ['Sicherung', 15], ['Abschluss', 5]],
  'Doppelstunde (90 min)': [['Einstieg', 10], ['Erarbeitung I', 25], ['Pause', 5], ['Erarbeitung II', 25], ['Sicherung', 20], ['Abschluss', 5]],
  'Think – Pair – Share': [['Think: allein', 3], ['Pair: zu zweit', 4], ['Share: Klasse', 5]],
  'Gruppenarbeit': [['Aufgabe lesen', 3], ['Gruppenarbeit', 15], ['Präsentation vorbereiten', 5], ['Präsentation', 10]],
  'Stationenlernen (4 Stationen)': [['Station 1', 8], ['Wechsel', 1], ['Station 2', 8], ['Wechsel', 1], ['Station 3', 8], ['Wechsel', 1], ['Station 4', 8]]
};
const PFARBEN = ['#5b5bd6', '#14b8a6', '#f59e0b', '#ec4899', '#22c55e', '#8b5cf6', '#ef4444', '#0ea5e9'];
function phasenWidget() {
  let phasen; try { phasen = JSON.parse(localStorage.getItem('tafelapp.phasen')); } catch (e) {}
  if (!Array.isArray(phasen) || !phasen.length) phasen = PHASEN_VORLAGEN['Unterrichtsstunde (45 min)'].map(([n, m]) => ({ n, m }));
  const merke = () => { try { localStorage.setItem('tafelapp.phasen', JSON.stringify(phasen)); } catch (e) {} };
  let laeuft = false, pause = false, idx = 0, rest = 0, last = 0, iv = 0, fertig = false;
  const box = h('div', { class: 'phasen' });
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const tick = () => {
    if (pause || fertig) return; const now = performance.now(); rest -= (now - last) / 1000; last = now;
    if (rest <= 0) { beep(); idx++; if (idx >= phasen.length) { fertig = true; clearInterval(iv); } else rest = phasen[idx].m * 60; zeichne(); }
    else lauf();
  };
  let zeitEl = null, balken = null;
  const lauf = () => {
    if (zeitEl) zeitEl.textContent = fmt(rest);
    if (balken) [...balken.children].forEach((s, i) => { const f = s.firstChild; f.style.width = (i < idx ? 100 : i > idx ? 0 : 100 * (1 - rest / (phasen[i].m * 60))) + '%'; });
  };
  const zeichne = () => {
    box.innerHTML = ''; zeitEl = balken = null;
    if (!laeuft) {
      const liste = h('div', { class: 'pliste' });
      phasen.forEach((p, i) => liste.append(h('div', { class: 'prow' },
        h('span', { class: 'pdot', style: { background: PFARBEN[i % PFARBEN.length] } }),
        h('input', { type: 'text', class: 'feld', value: p.n, oninput: e => { p.n = e.target.value; merke(); } }),
        h('input', { type: 'text', class: 'feld pmin', value: String(p.m).replace('.', ','), inputmode: 'decimal', onchange: e => { p.m = Math.max(0.5, parseFloat(String(e.target.value).replace(',', '.')) || 1); merke(); zeichne(); } }),
        h('span', { class: 'hint' }, 'min'),
        h('button', { class: 'pmini', title: 'nach oben', disabled: i === 0, onclick: () => { [phasen[i - 1], phasen[i]] = [phasen[i], phasen[i - 1]]; merke(); zeichne(); } }, '↑'),
        h('button', { class: 'pmini', title: 'Phase löschen', onclick: () => { if (phasen.length > 1) { phasen.splice(i, 1); merke(); zeichne(); } } }, '×'))));
      const summe = phasen.reduce((a, p) => a + p.m, 0);
      const vorlage = h('select', { class: 'feld', onchange: e => { const v = PHASEN_VORLAGEN[e.target.value]; if (v) { phasen = v.map(([n, m]) => ({ n, m })); merke(); zeichne(); } } },
        h('option', { value: '' }, '📋 Vorlage wählen …'), ...Object.keys(PHASEN_VORLAGEN).map(k => h('option', { value: k }, k)));
      box.append(vorlage, liste, h('div', { class: 'row' },
        h('button', { class: 'big', onclick: () => { phasen.push({ n: 'Phase ' + (phasen.length + 1), m: 5 }); merke(); zeichne(); } }, '＋ Phase'),
        h('span', { class: 'hint', style: { flex: 1 } }, 'Gesamt: ' + T.zahl(summe, 1) + ' min'),
        h('button', { class: 'big prim', onclick: () => { laeuft = true; pause = false; fertig = false; idx = 0; rest = phasen[0].m * 60; last = performance.now(); clearInterval(iv); iv = setInterval(tick, 200); zeichne(); } }, '▶ Start')));
      return;
    }
    if (fertig) {
      box.append(h('div', { class: 'pname' }, 'Geschafft! 🎉'), h('div', { class: 'timer ende' }, '00:00'),
        h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'big prim', onclick: () => { laeuft = false; zeichne(); } }, '↺ Zurück zur Planung')));
      return;
    }
    const p = phasen[idx], col = PFARBEN[idx % PFARBEN.length];
    zeitEl = h('div', { class: 'timer', style: { color: col } });
    balken = h('div', { class: 'pbalken' }, ...phasen.map((q, i) => h('div', { class: 'pseg', style: { flex: q.m, background: PFARBEN[i % PFARBEN.length] + '33' }, title: q.n }, h('div', { style: { background: PFARBEN[i % PFARBEN.length] } }))));
    box.append(h('div', { class: 'pname', style: { color: col } }, `${idx + 1}/${phasen.length} · ${p.n}`), zeitEl, balken,
      h('div', { class: 'hint', style: { textAlign: 'center', margin: '6px 0' } }, idx + 1 < phasen.length ? 'Danach: ' + phasen[idx + 1].n + ' (' + T.zahl(phasen[idx + 1].m, 1) + ' min)' : 'Letzte Phase'),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'big', onclick: () => { pause = !pause; last = performance.now(); zeichne(); } }, pause ? '▶ Weiter' : '⏸ Pause'),
        h('button', { class: 'big', onclick: () => { rest += 60; lauf(); } }, '+1 min'),
        h('button', { class: 'big', onclick: () => { rest = 0; last = performance.now(); tick(); } }, '⏭ Nächste'),
        h('button', { class: 'big warn', onclick: () => { clearInterval(iv); laeuft = false; zeichne(); } }, '⏹')));
    lauf();
  };
  zeichne();
  const w = widget('⏳ Phasentimer', [box], Math.max(20, innerWidth - 620), 80);
  w.onclose = () => clearInterval(iv);
}
function timerWidget() {
  let total = 300, rest = 300, run = false, stopp = false, last = 0, iv = 0;
  const disp = h('div', { class: 'timer' }), fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const show = () => { disp.textContent = fmt(rest); disp.classList.toggle('ende', !stopp && rest <= 0); };
  const tick = () => { const now = performance.now(), dt = (now - last) / 1000; last = now; rest += stopp ? dt : -dt; if (!stopp && rest <= 0) { rest = 0; run = false; clearInterval(iv); beep(); startBtn.textContent = '▶ Start'; } show(); };
  const startBtn = h('button', { class: 'big prim', onclick: () => { run = !run; if (run) { if (!stopp && rest <= 0) rest = total; last = performance.now(); iv = setInterval(tick, 200); } else clearInterval(iv); startBtn.textContent = run ? '⏸ Pause' : '▶ Start'; show(); } }, '▶ Start');
  const set = s => { stopp = false; total = rest = s; show(); };
  const w = widget('⏱ Timer', [disp,
    h('div', { class: 'row', style: { justifyContent: 'center', marginBottom: '8px' } }, ...[1, 2, 3, 5, 10, 15, 20].map(m => h('button', { class: 'big', onclick: () => set(m * 60) }, m + ' min'))),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'big', onclick: () => { rest = Math.max(0, rest - 60); show(); } }, '−1'), startBtn, h('button', { class: 'big', onclick: () => { rest += 60; total = Math.max(total, rest); show(); } }, '+1'),
      h('button', { class: 'big', onclick: () => { stopp = false; rest = total; show(); } }, '↺'), h('button', { class: 'big', onclick: () => { stopp = true; rest = 0; show(); } }, 'Stoppuhr'))], innerWidth - 560, 80);
  w.onclose = () => clearInterval(iv); show();
}
// ---------- Namenslisten aus CSV / Excel (.xlsx) – ohne Zusatzbibliothek ----------
async function xlsxZeilen(buf) { // liest das erste Tabellenblatt einer .xlsx-Datei als Zeilen mit Zellen
  const dv = new DataView(buf), u8 = new Uint8Array(buf); let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('keine Excel-Datei (.xlsx)');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const dateien = {};
  for (let i = 0; i < n; i++) {
    const meth = dv.getUint16(p + 10, true), gr = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    dateien[new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl))] = { meth, gr, off }; p += 46 + nl + xl + cl;
  }
  const lies = async name => { const f = dateien[name]; if (!f) return null;
    const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true), roh = u8.subarray(start, start + f.gr);
    if (f.meth === 0) return new TextDecoder().decode(roh);
    return await new Response(new Blob([roh]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text(); };
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const ss = await lies('xl/sharedStrings.xml'), strings = ss ? [...xml(ss).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent).join('')) : [];
  const blatt = Object.keys(dateien).filter(k => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)))[0];
  if (!blatt) throw new Error('kein Tabellenblatt gefunden');
  const spalte = r => { let c = 0; for (const z of r.replace(/\d+/g, '')) c = c * 26 + z.charCodeAt(0) - 64; return c - 1; };
  return [...xml(await lies(blatt)).getElementsByTagName('row')].map(row => { const z = [];
    for (const c of row.getElementsByTagName('c')) { const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
      z[spalte(c.getAttribute('r') || 'A')] = t === 's' ? strings[+v.textContent] || '' : t === 'inlineStr' ? [...c.getElementsByTagName('t')].map(x => x.textContent).join('') : v ? v.textContent : ''; }
    return Array.from(z, x => (x || '').trim()); });
}
function csvZeilen(text) {
  const zeilen = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  const trenner = [';', '\t', ','].find(t => zeilen.slice(0, 5).some(l => l.includes(t))) || ';';
  return zeilen.map(l => { const z = []; let feld = '', q = false;
    for (let i = 0; i < l.length; i++) { const c = l[i];
      if (q) { if (c === '"' && l[i + 1] === '"') { feld += '"'; i++; } else if (c === '"') q = false; else feld += c; }
      else if (c === '"') q = true; else if (c === trenner) { z.push(feld.trim()); feld = ''; } else feld += c; }
    z.push(feld.trim()); return z; });
}
// Zeilen → {Klasse: [Namen]}; erkennt Kopfzeilen wie „Vorname“, „Nachname“, „Name“, „Klasse“
function namenAusZeilen(zeilen, standardKlasse) {
  zeilen = zeilen.filter(z => z.some(Boolean)); if (!zeilen.length) return {};
  const kopf = zeilen[0].map(s => s.toLowerCase()), such = re => kopf.findIndex(s => re.test(s));
  let vn = such(/^vorname|rufname|first ?name/), nn = such(/^nachname|familienname|last ?name|^zuname/), nm = such(/^(schüler(in)?|name|namen|schülername)$/), kl = such(/^klasse|^lerngruppe|^gruppe|^kurs/);
  const mitKopf = vn >= 0 || nn >= 0 || nm >= 0 || kl >= 0, daten = mitKopf ? zeilen.slice(1) : zeilen;
  if (!mitKopf) { // ohne Kopfzeile: zwei Textspalten = Nachname, Vorname (typisch für Exporte), sonst erste gefüllte Spalte
    const zwei = daten.every(z => z.filter(Boolean).length >= 2 && !/\d/.test(z[0] + z[1]));
    if (zwei) { nn = 0; vn = 1; } else nm = -2; }
  const roh = daten.map(z => ({ v: vn >= 0 ? z[vn] || '' : '', n: nn >= 0 ? z[nn] || '' : '', name: nm >= 0 ? z[nm] || '' : nm === -2 ? z.find(Boolean) || '' : '', k: kl >= 0 ? z[kl] || standardKlasse : standardKlasse }));
  const vorn = {}; roh.forEach(r => { if (r.v) vorn[r.k + '|' + r.v] = (vorn[r.k + '|' + r.v] || 0) + 1; });
  const listen = {};
  for (const r of roh) { // Vorname genügt; bei gleichen Vornamen in einer Klasse kommt der Anfangsbuchstabe des Nachnamens dazu
    const name = r.v ? (vorn[r.k + '|' + r.v] > 1 && r.n ? `${r.v} ${r.n[0]}.` : r.v) : r.name || r.n;
    if (name) (listen[r.k] = listen[r.k] || []).push(name);
  }
  return listen;
}
async function namenDatei(datei, standardKlasse) {
  const endung = (datei.name.match(/\.(\w+)$/) || [])[1]?.toLowerCase();
  if (endung === 'xls') throw new Error('Bitte in Excel als .xlsx oder als CSV speichern (alte .xls-Dateien werden nicht unterstützt).');
  let zeilen;
  if (endung === 'xlsx') zeilen = await xlsxZeilen(await datei.arrayBuffer());
  else { const buf = await datei.arrayBuffer(); let t = new TextDecoder('utf-8').decode(buf); if (t.includes('�')) t = new TextDecoder('windows-1252').decode(buf); zeilen = csvZeilen(t); }
  return namenAusZeilen(zeilen, standardKlasse);
}
T.namenAusZeilen = namenAusZeilen; T.csvZeilen = csvZeilen; T.namenDatei = namenDatei; // für Tests

function zufallWidget() {
  let listen = {}; try { listen = JSON.parse(localStorage.getItem('tafelapp.klassen') || '{}'); } catch (e) {}
  const keys = Object.keys(listen); let klasse = keys[0] || '', gezogen = [];
  const out = h('div', { class: 'zname' }, '?'), info = h('div', { class: 'hint', style: { textAlign: 'center' } });
  const sel = h('select', { style: { fontSize: '18px', padding: '8px' }, onchange: e => { klasse = e.target.value; gezogen = []; info.textContent = ''; } }, ...keys.map(k => h('option', { value: k }, k)));
  const ohne = h('input', { type: 'checkbox', checked: true, style: { width: '26px', height: '26px' } });
  const zieh = () => {
    const alle = (listen[klasse] || []); let pool = ohne.checked ? alle.filter(n => !gezogen.includes(n)) : alle;
    if (!alle.length) { out.textContent = 'Liste anlegen ✏️'; return; }
    if (!pool.length) { gezogen = []; pool = alle; }
    let k = 0; const iv = setInterval(() => { out.textContent = pool[Math.floor(Math.random() * pool.length)]; if (++k > 12) { clearInterval(iv); const n = pool[Math.floor(Math.random() * pool.length)]; out.textContent = n; gezogen.push(n); info.textContent = `${gezogen.length} von ${alle.length} gezogen`; } }, 70);
  };
  const edit = () => {
    const name = h('input', { type: 'text', value: klasse || '' }), ta = h('textarea', {}, (listen[klasse] || []).join('\n'));
    const datei = h('input', { type: 'file', accept: '.csv,.txt,.xlsx,.xls', style: { display: 'none' }, onchange: async ev => {
      const f = ev.target.files[0]; if (!f) return;
      try {
        const neu = await namenDatei(f, name.value.trim() || f.name.replace(/\.\w+$/, '')), ks = Object.keys(neu);
        if (!ks.length) { toast('In der Datei wurden keine Namen gefunden.', 4000); return; }
        if (ks.length === 1) { name.value = ks[0]; ta.value = neu[ks[0]].join('\n'); toast(`${neu[ks[0]].length} Namen übernommen – bitte prüfen und speichern.`, 4000); return; }
        if (!confirm(`Die Datei enthält ${ks.length} Klassen (${ks.join(', ')}). Alle als eigene Listen speichern? Gleichnamige Listen werden ersetzt.`)) return;
        Object.assign(listen, neu); try { localStorage.setItem('tafelapp.klassen', JSON.stringify(listen)); } catch (e) {}
        closeDlg(); w.remove(); zufallWidget(); toast(`${ks.length} Klassenlisten gespeichert.`, 3500);
      } catch (e) { toast('Datei nicht lesbar: ' + e.message, 6000); }
      ev.target.value = ''; } });
    openDlg([h('h2', {}, 'Namensliste'), h('p', { class: 'hint' }, 'Die Liste bleibt nur auf diesem Gerät (im Browser) gespeichert. Tipp: Vornamen oder Nummern genügen.'),
      h('div', { class: 'row' }, h('button', { class: 'big', onclick: () => datei.click() }, '📥 Aus Datei (Excel / CSV)'), datei,
        h('span', { class: 'hint', style: { flex: 1, minWidth: '220px' } }, 'Spalten wie „Vorname“, „Nachname“, „Klasse“ werden erkannt. Es werden nur Vornamen übernommen (bei gleichen Vornamen mit Anfangsbuchstaben).')),
      h('label', { class: 'fld' }, 'Klasse / Gruppe', name), h('label', { class: 'fld' }, 'Namen (einer pro Zeile)', ta),
      h('div', { class: 'acts' }, klasse ? h('button', { class: 'big warn', onclick: () => { delete listen[klasse]; localStorage.setItem('tafelapp.klassen', JSON.stringify(listen)); closeDlg(); w.remove(); zufallWidget(); } }, 'Liste löschen') : '',
        h('button', { class: 'big', onclick: closeDlg }, 'Abbrechen'), h('button', { class: 'big prim', onclick: () => {
          const k = name.value.trim() || 'Klasse'; listen[k] = ta.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
          try { localStorage.setItem('tafelapp.klassen', JSON.stringify(listen)); } catch (e) {} closeDlg(); w.remove(); zufallWidget();
        } }, 'Speichern'))]);
  };
  const w = widget('🎯 Zufallsauswahl', [h('div', { class: 'row', style: { justifyContent: 'center' } }, keys.length ? sel : '', h('button', { class: 'big', onclick: edit }, '✏️ Liste')), out, info,
    h('div', { class: 'row', style: { justifyContent: 'center' } }, h('label', { class: 'row' }, ohne, 'ohne Wiederholung'), h('button', { class: 'big prim', onclick: zieh }, '🎲 Ziehen'))], innerWidth - 560, 360);
}
function wuerfelWidget() {
  let anz = 1; const box = h('div', { class: 'wuerfel' });
  const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]] };
  const draw = vals => { box.innerHTML = vals.map(v => `<svg viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#1d2433" stroke-width="5"/>${P[v].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#1d2433"/>`).join('')}</svg>`).join(''); };
  const roll = () => { let k = 0; const iv = setInterval(() => { draw(Array.from({ length: anz }, () => 1 + Math.floor(Math.random() * 6))); if (++k > 9) clearInterval(iv); }, 70); };
  draw([6]);
  widget('🎲 Würfel', [box, h('div', { class: 'row', style: { justifyContent: 'center' } }, ...[1, 2, 3].map(n => h('button', { class: 'big', onclick: () => { anz = n; roll(); } }, n + ' ×')), h('button', { class: 'big prim', onclick: roll }, 'Würfeln'))], 140, 120);
}

// ---------- Tastatur & Einfügen aus Zwischenablage ----------
addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if (e.key === 'Escape') { closeDlg(); T.closePops(); if (S.sel) { S.sel = null; T.renderOver(); } return; }
  if (typing || !S.board || modal.style.display === 'flex') return;
  const c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (c && k === 'z' && !e.shiftKey) { e.preventDefault(); T.undo(); }
  else if (c && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); T.redo(); }
  else if (c && k === 's') { e.preventDefault(); speichern(true); }
  else if (c && k === 'd') { e.preventDefault(); duplicateSel(); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); deleteSel(); }
  else if (e.key === 'Home') T.resetView();
  else if (e.key === 'End') T.allesZeigen();
  else if (e.key === 'PageDown') gotoPage(S.page + 1);
  else if (e.key === 'PageUp') gotoPage(S.page - 1);
});
addEventListener('paste', async e => {
  if (!S.board || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const f = [...(e.clipboardData && e.clipboardData.files || [])].find(x => x.type.startsWith('image/'));
  if (f) { e.preventDefault(); bildEinfuegen(f); }
});
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f || !S.board) return; if (f.type.startsWith('image/')) bildEinfuegen(f); else if (f.name.endsWith('.json')) f.text().then(t => { try { ladeTafel(JSON.parse(t), null); S.dirty = true; } catch (x) { toast('Keine Tafel-Datei.'); } }); });

// ---------- Start ----------
$('bArchiv').onclick = () => { if (S.dirty && F.root) speichern(false); archiv(); };
$('bSave').onclick = () => speichern(true);
$('bExport').onclick = e => exportPop(e.currentTarget);
$('bKlasse').onclick = () => zeigeDock('classroom', true);
$('bSettings').onclick = settingsDialog;
$('ablageInfo').onclick = infoDialog;
$('bFull').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); };

// ---------- Hell / Dunkel ----------
const dunkelMQ = matchMedia('(prefers-color-scheme: dark)');
const THEMEN = { auto: ['🌓', 'Automatisch (wie Windows)'], hell: ['☀️', 'Hell'], dunkel: ['🌙', 'Dunkel'] };
T.setThema = t => {
  T.opts.thema = THEMEN[t] ? t : 'auto'; T.saveOpts();
  const dunkel = T.opts.thema === 'dunkel' || (T.opts.thema === 'auto' && dunkelMQ.matches);
  document.documentElement.dataset.theme = dunkel ? 'dark' : 'light';
  const b = $('bThema'); b.textContent = THEMEN[T.opts.thema][0]; b.title = 'Darstellung: ' + THEMEN[T.opts.thema][1] + ' – antippen zum Wechseln';
};
dunkelMQ.addEventListener('change', () => T.setThema(T.opts.thema));
$('bThema').onclick = () => { const n = { auto: 'hell', hell: 'dunkel', dunkel: 'auto' }[T.opts.thema] || 'auto'; T.setThema(n); toast('Darstellung: ' + THEMEN[n][1], 1500); };

(async function start() {
  T.setThema(T.opts.thema || 'auto');
  document.body.classList.toggle('leisteOben', !!T.opts.leisteOben);
  T.initCanvas(); T.initInput(); buildToolbar();
  await F.init();
  archiv();
})();
})();
