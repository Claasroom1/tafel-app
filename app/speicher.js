// Tafel-App – Ablage: Ordner (File System Access API) mit Rückfall auf Download/Upload
'use strict';
(function () {
const DB = 'tafelapp', ST = 'kv';
function idb() { return new Promise((res, rej) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(ST); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
T.idbGet = async k => { const db = await idb(); return new Promise((res, rej) => { const q = db.transaction(ST).objectStore(ST).get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); };
T.idbSet = async (k, v) => { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction(ST, 'readwrite'); tx.objectStore(ST).put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); };

const F = T.ablage = { root: null, pending: null, supported: !!window.showDirectoryPicker };
F.init = async () => {
  if (!F.supported) { // z. B. Android: kein Ordnerzugriff → Speicher der App auf dem Gerät (gleiche Ordnerstruktur)
    if (navigator.storage && navigator.storage.getDirectory) {
      try { F.root = await navigator.storage.getDirectory(); F.intern = true; if (navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    }
    return;
  }
  try {
    const h = await T.idbGet('root'); if (!h) return;
    const p = await h.queryPermission({ mode: 'readwrite' });
    if (p === 'granted') F.root = h; else F.pending = h;
  } catch (e) {}
};
F.connect = async () => {
  const h = await window.showDirectoryPicker({ id: 'tafelapp', mode: 'readwrite' });
  await T.idbSet('root', h); F.root = h; F.pending = null;
};
F.reconnect = async () => {
  if (!F.pending) { await F.connect(); return true; }
  const p = await F.pending.requestPermission({ mode: 'readwrite' });
  if (p === 'granted') { F.root = F.pending; F.pending = null; return true; }
  return false;
};
F.name = () => (F.root || F.pending || {}).name || '';
F.safe = s => String(s || '').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').replace(/^\.+/, '').trim().slice(0, 80) || 'Tafel';
F.dir = async (parts, create) => { let d = F.root; for (const p of parts) d = await d.getDirectoryHandle(F.safe(p), { create }); return d; };
const IGNORE = /^(app|\..*|_.*)$/i;
F.teachers = async () => {
  const out = []; if (!F.root) return out;
  for await (const [n, h] of F.root.entries()) if (h.kind === 'directory' && !IGNORE.test(n)) out.push(n);
  return out.sort((a, b) => a.localeCompare(b, 'de'));
};
F.faecher = async teacher => {
  const out = {}; if (!F.root) return out;
  try {
    const d = await F.dir([teacher], false);
    for await (const [n, h] of d.entries()) if (h.kind === 'directory' && !IGNORE.test(n)) {
      let c = 0; for await (const [m, x] of h.entries()) if (x.kind === 'file' && m.endsWith('.tafel.json')) c++;
      out[n] = c;
    }
  } catch (e) {}
  return out;
};
F.boards = async (teacher, fach) => {
  const out = []; if (!F.root) return out;
  let d; try { d = await F.dir([teacher, fach], false); } catch (e) { return out; }
  for await (const [n, h] of d.entries()) {
    if (h.kind !== 'file' || !n.endsWith('.tafel.json')) continue;
    const m = n.match(/^(\d{4}-\d{2}-\d{2})\s+(.*?)\.tafel\.json$/);
    let mod = 0; try { mod = (await h.getFile()).lastModified; } catch (e) {}
    out.push({ name: n, datum: m ? m[1] : '', titel: m ? m[2] : n.replace(/\.tafel\.json$/, ''), mod });
  }
  return out.sort((a, b) => b.name.localeCompare(a.name, 'de'));
};
F.read = async (teacher, fach, name) => {
  const d = await F.dir([teacher, fach], false), fh = await d.getFileHandle(name), file = await fh.getFile();
  return { board: JSON.parse(await file.text()), file: { teacher: F.safe(teacher), fach: F.safe(fach), name, lastMod: file.lastModified } };
};
const exists = async (d, n) => { try { await d.getFileHandle(n); return true; } catch (e) { return false; } };
const unique = async (d, base) => { let n = base + '.tafel.json', i = 2; while (await exists(d, n)) n = `${base} (${i++}).tafel.json`; return n; };

// Speichert die Tafel. Fremde Änderungen an der Datei werden nie überschrieben (dann entsteht eine Konfliktkopie).
F.save = async (board, file) => {
  const teacher = F.safe(board.lehrkraft), fach = F.safe(board.fach);
  const d = await F.dir([teacher, fach], true);
  const base = `${board.datum} ${F.safe(board.titel)}`, wanted = base + '.tafel.json';
  let name, removeOld = null, hinweis = '';
  if (file && file.teacher === teacher && file.fach === fach) {
    let cur = null; try { cur = await (await d.getFileHandle(file.name)).getFile(); } catch (e) {}
    if (cur && file.lastMod && cur.lastModified !== file.lastMod) { name = await unique(d, base + ' (Konflikt)'); hinweis = 'konflikt'; }
    else if (file.name === wanted || !cur && !(await exists(d, wanted))) name = wanted;
    else { name = await unique(d, base); if (cur) removeOld = { d, name: file.name }; }
  } else {
    name = await unique(d, base);
    if (file) {
      try {
        const od = await F.dir([file.teacher, file.fach], false), cur = await (await od.getFileHandle(file.name)).getFile();
        if (cur.lastModified === file.lastMod) removeOld = { d: od, name: file.name };
      } catch (e) {}
    }
  }
  const fh = await d.getFileHandle(name, { create: true });
  const w = await fh.createWritable(); await w.write(JSON.stringify(board)); await w.close();
  const lastMod = (await fh.getFile()).lastModified;
  if (removeOld && removeOld.name !== name) { try { await removeOld.d.removeEntry(removeOld.name); } catch (e) {} } // alte Datei nach Umbenennen
  return { file: { teacher, fach, name, lastMod }, hinweis };
};

// Löschen = in den Papierkorb der Lehrkraft verschieben (Lehrkraft › _Papierkorb › Fach), wiederherstellbar
const kopiere = async (vonDir, name, nachDir, zielName) => {
  const text = await (await (await vonDir.getFileHandle(name)).getFile()).text();
  const fh = await nachDir.getFileHandle(zielName, { create: true }), w = await fh.createWritable(); await w.write(text); await w.close();
};
F.trash = async (teacher, fach, name) => {
  const von = await F.dir([teacher, fach], false), nach = await F.dir([teacher, '_Papierkorb', fach], true);
  const base = name.replace(/\.tafel\.json$/, ''); const ziel = (await exists(nach, name)) ? (await unique(nach, base)) : name;
  await kopiere(von, name, nach, ziel); await von.removeEntry(name);
};
F.trashList = async teacher => {
  const out = []; if (!F.root) return out;
  let pk; try { pk = await F.dir([teacher, '_Papierkorb'], false); } catch (e) { return out; }
  for await (const [fach, d] of pk.entries()) if (d.kind === 'directory') for await (const [n, x] of d.entries()) if (x.kind === 'file' && n.endsWith('.tafel.json')) out.push({ fach, name: n });
  return out.sort((a, b) => b.name.localeCompare(a.name, 'de'));
};
F.restore = async (teacher, fach, name) => {
  const von = await F.dir([teacher, '_Papierkorb', fach], false), nach = await F.dir([teacher, fach], true);
  const ziel = (await exists(nach, name)) ? (await unique(nach, name.replace(/\.tafel\.json$/, ''))) : name;
  await kopiere(von, name, nach, ziel); await von.removeEntry(name); return ziel;
};

// Sicherung: alle Tafeln, Notizen usw. der Ablage in einer Datei (zum Übertragen, z. B. per USB-Stick oder IServ)
F.sicherung = async () => {
  const dateien = [];
  const lauf = async (dir, pfad) => {
    for await (const [n, x] of dir.entries()) {
      if (x.kind === 'directory') { if (!pfad.length && IGNORE.test(n) && !n.startsWith('_')) continue; await lauf(x, pfad.concat(n)); }
      else if (n.endsWith('.json') && pfad.length) dateien.push({ pfad, name: n, inhalt: await (await x.getFile()).text() });
    }
  };
  await lauf(F.root, []);
  const blob = new Blob([JSON.stringify({ app: 'Tafel-App-Sicherung', version: 1, erstellt: new Date().toISOString(), dateien })], { type: 'application/json' });
  T.downloadBlob(blob, `Tafel-App Sicherung ${T.today()}.json`);
  return dateien.length;
};
F.einspielen = async bundle => { // vorhandene Dateien werden nie überschrieben – gleichnamige bekommen eine Nummer
  let n = 0;
  for (const f of bundle.dateien || []) {
    if (!Array.isArray(f.pfad) || !f.name || f.pfad.some(p => /[\\/:*?"<>|]|^\.\.?$/.test(p))) continue;
    const d = await F.dir(f.pfad, true);
    let name = f.name;
    if (await exists(d, name)) { const alt = await (await (await d.getFileHandle(name)).getFile()).text(); if (alt === f.inhalt) continue; name = await unique(d, name.replace(/(\.tafel)?\.json$/, '')); if (!f.name.endsWith('.tafel.json')) name = name.replace(/\.tafel\.json$/, '.json'); }
    const w = await (await d.getFileHandle(name, { create: true })).createWritable(); await w.write(f.inhalt); await w.close(); n++;
  }
  return n;
};
F.istSicherung = j => j && j.app === 'Tafel-App-Sicherung' && Array.isArray(j.dateien);

F.download = board => {
  const blob = new Blob([JSON.stringify(board)], { type: 'application/json' });
  T.downloadBlob(blob, `${F.safe(board.lehrkraft)} - ${F.safe(board.fach)} - ${board.datum} ${F.safe(board.titel)}.tafel.json`);
};
T.downloadBlob = (blob, name) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
};
T.pickFile = accept => new Promise(res => {
  const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
  i.onchange = () => res(i.files[0] || null); i.click();
});
F.upload = async () => {
  const f = await T.pickFile('.json,application/json'); if (!f) return null;
  return JSON.parse(await f.text());
};

T.checkBoard = b => {
  if (!b || !Array.isArray(b.pages)) throw new Error('Das ist keine Tafel-Datei.');
  b.pages.forEach(p => { p.items = Array.isArray(p.items) ? p.items : []; p.view = p.view || { x: 0, y: 0, z: 1 }; p.bg = p.bg || 'weiss'; p.items.forEach(it => { it.id = it.id || T.uid(); }); });
  if (!b.pages.length) b.pages.push(T.newPage());
  b.lehrkraft = b.lehrkraft || T.opts.lehrkraft || 'Lehrkraft'; b.fach = b.fach || 'Sonstiges'; b.titel = b.titel || 'Tafel'; b.datum = b.datum || T.today();
  return b;
};
})();
