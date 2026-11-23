/* Mathewolf – automatischer Test der Aufgabengeneratoren
   Aufruf:  node werkzeug/test-generatoren.js [Runden je Übung, Standard 1000]
   Prüft je Übung und Blitzrechnen: Anzahl der Aufgaben, keine Dopplungen, höchstens eine Tauschaufgabe,
   höchstens eine triviale Aufgabe, Zahlenraum, keine negativen Zahlen, Geteilt geht auf, Lücken eindeutig,
   Auswahl hat 2–4 verschiedene Antworten mit genau einer richtigen, alle Sprechtexte vorhanden. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.join(__dirname, '..');
const RUNDEN = parseInt(process.argv[2] || '1000', 10);

// minimale Browser-Umgebung zum Laden der Skripte
const ctx = { console, Math, JSON, Date, setTimeout, clearTimeout, Promise, Set, Map, Array, Object, String, Number, performance: { now: () => Date.now() } };
ctx.window = ctx;
ctx.document = { addEventListener() { }, querySelectorAll() { return []; }, querySelector() { return null; } };
ctx.navigator = {};
vm.createContext(ctx);
const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
const skripte = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map(m => m[1]);
skripte.forEach(s => vm.runInContext(fs.readFileSync(path.join(APP, s), 'utf8'), ctx, { filename: s }));
const MW = ctx.MW;

const RAUM = { V: 20, K1: 20, K2: 100, K3: 1000, K4: 1000000 };
let fehler = 0;
const gruppen = new Map();
const melde = (u, seed, text) => {
  fehler++;
  const k = u.id + ': ' + text.replace(/-?\d+([.,]\d+)?/g, '#');
  if (!gruppen.has(k)) gruppen.set(k, { n: 0, beispiel: `Startwert ${seed}: ${text}` });
  gruppen.get(k).n++;
};

function zahlenIn(a) {
  const z = [];
  (a.teile || []).forEach(t => { if (t.z !== undefined) z.push(t.z); });
  [].concat(a.loesung === undefined ? [] : a.loesung).forEach(v => { if (typeof v === 'number') z.push(v); });
  (a.loesungen || []).forEach(v => z.push(v));
  return z;
}
function sprechKeys(teile, out) {
  (teile || []).forEach(t => {
    if (typeof t === 'string') out.push(t);
    else if (t && typeof t === 'object' && !Array.isArray(t)) { if (t.key) out.push(t.key); }
  });
  return out;
}
function pruefeAufgabe(u, a, seed, raum) {
  if (!MW.typen[a.typ]) melde(u, seed, 'unbekannter Typ ' + a.typ);
  const zahlen = zahlenIn(a);
  zahlen.forEach(z => {
    if (z < 0) melde(u, seed, 'negative Zahl ' + z);
    if (z > raum && !(u.stufe === 'K4' && u.id === 'K4-07')) melde(u, seed, 'Zahl außerhalb des Zahlenraums: ' + z);
  });
  // Rechnung stimmt?
  if (a.typ === 'term' && a.teile && !a.mehrfeld) {
    const t = a.teile;
    if (t.length === 5 && t[0].z !== undefined && t[1].o && t[2].z !== undefined && t[3].o === '=' && t[4].l !== undefined) {
      const x = t[0].z, y = t[2].z, op = t[1].o;
      const erg = op === '+' ? x + y : op === '−' ? x - y : op === '·' ? x * y : op === ':' ? x / y : null;
      if (erg !== null && erg !== a.loesung) melde(u, seed, `falsches Ergebnis ${x} ${op} ${y} ≠ ${a.loesung}`);
      if (op === ':' && !Number.isInteger(erg)) melde(u, seed, 'Geteilt geht nicht auf');
    }
  }
  if (a.mehrfeld && u.id === 'K3-07') {
    const n = a.teile[0].z, d = a.teile[2].z, [q, r] = a.loesung;
    if (q * d + r !== n || r >= d || r < 0) melde(u, seed, 'Teilen mit Rest falsch');
  }
  if (a.typ === 'auswahl' || (a.typ === 'blitzblick' && a.optionen)) {
    const werte = (a.optionen || []).map(o => (typeof o === 'object' ? JSON.stringify(o.wert) : JSON.stringify(o)));
    if (werte.length < 2 || werte.length > 4) melde(u, seed, 'Auswahl hat ' + werte.length + ' Antworten');
    if (new Set(werte).size !== werte.length) melde(u, seed, 'Auswahl hat doppelte Antworten');
    const richtig = werte.filter(w => w === JSON.stringify(a.loesung)).length;
    if (richtig !== 1) melde(u, seed, 'Auswahl: richtige Antwort ' + richtig + '-mal vorhanden');
  }
  if (a.typ === 'zahlenmauer') {
    if (!MW.mauerLoesbar(a.reihen, a.luecken)) melde(u, seed, 'Zahlenmauer nicht eindeutig');
    a.reihen.forEach((r, ri) => { if (ri > 0) r.forEach((v, k) => { if (v !== a.reihen[ri - 1][k] + a.reihen[ri - 1][k + 1]) melde(u, seed, 'Mauer falsch gerechnet'); }); });
  }
  if (a.typ === 'rechendreieck') {
    if (!MW.dreieckLoesbar(a.luecken)) melde(u, seed, 'Rechendreieck nicht eindeutig');
    const N = [[0, 1], [0, 2], [1, 2]];
    N.forEach(([x, y], k) => { if (a.aussen[k] !== a.innen[x] + a.innen[y]) melde(u, seed, 'Rechendreieck falsch'); });
  }
  if (a.typ === 'zahlenhaus') {
    a.stockwerke.forEach(st => { if (st[0] + st[1] !== a.dach) melde(u, seed, 'Zahlenhaus falsch'); if (!u.parameter.mitNull && (st[0] === 0 || st[1] === 0)) melde(u, seed, 'Zahlenhaus mit 0'); });
    if (a.luecken.length !== a.stockwerke.length) melde(u, seed, 'Zahlenhaus: nicht in jedem Stockwerk eine Lücke');
  }
  if (a.typ === 'schriftlich') {
    const felder = [];
    a.raster.zeilen.forEach(z => z.zellen.forEach(c => { if (c && c.f && !c.optional) felder.push(c); }));
    if (!felder.length) melde(u, seed, 'schriftlich ohne Felder');
    felder.forEach(c => { if (!(c.loesung >= 0 && c.loesung <= 9)) melde(u, seed, 'Feld mit ungültiger Ziffer ' + c.loesung); });
    const ord = felder.map(c => c.ordnung);
    if (new Set(ord).size !== ord.length) melde(u, seed, 'schriftlich: doppelte Reihenfolge');
  }
  // Sprechtexte vorhanden?
  const keys = [];
  ['ansage', 'tipp', 'nachRichtig', 'loesungAnsage', 'frage', 'teil1', 'teil2'].forEach(k => { if (Array.isArray(a[k])) sprechKeys(a[k], keys); });
  keys.forEach(k => { if (!MW.texte[k]) melde(u, seed, 'Sprechtext fehlt: ' + k); });
  if (!a.ansage && !a.frage && !a.teil1) melde(u, seed, 'keine Ansage');
}

function pruefeRunde(u, liste, seed, erwartet, opt) {
  if (liste.length !== erwartet) melde(u, seed, `${liste.length} statt ${erwartet} Aufgaben`);
  const keys = liste.map(a => a.schluessel);
  if (new Set(keys).size !== keys.length) melde(u, seed, 'doppelte Aufgabe in einer Runde');
  const tausch = {};
  liste.forEach(a => { if (a.tauschSchluessel) tausch[a.tauschSchluessel] = (tausch[a.tauschSchluessel] || 0) + 1; });
  if (Object.values(tausch).filter(n => n > 1).length > 1) melde(u, seed, 'mehr als eine Tauschaufgabe');
  const trivial = liste.filter(a => a.trivial).length;
  if (trivial > (opt && opt.maxTrivial || 1)) melde(u, seed, trivial + ' triviale Aufgaben');
}

let anzahlAufgaben = 0;
const t0 = Date.now();
MW.uebungen.forEach(u => {
  const varianten = u.parameter.reiheWaehlen ? [0, 1, 2, 5, 7, 10] : [undefined];
  varianten.forEach(reihe => {
    for (let seed = 1; seed <= RUNDEN; seed++) {
      const rng = MW.zufall(seed);
      for (let r = 1; r <= 3; r++) {
        const p = Object.assign({}, u.parameter, reihe === undefined ? {} : { reihe });
        let liste;
        try { liste = MW.generatoren[u.generator](p, rng, u, r); } catch (e) { melde(u, seed, 'Absturz: ' + e.message); break; }
        const erwartet = u.aufgabenProRunde;
        pruefeRunde(u, liste, seed, erwartet, { maxTrivial: reihe === 1 ? 99 : 1 });
        liste.forEach(a => { pruefeAufgabe(u, a, seed, RAUM[u.stufe]); anzahlAufgaben++; });
      }
    }
  });
});
Object.keys(MW.blitz).forEach(st => {
  const u = MW.blitz[st];
  for (let seed = 1; seed <= RUNDEN; seed++) {
    const liste = MW.generatoren[u.generator](u.parameter, MW.zufall(seed), u, 1);
    pruefeRunde(u, liste, seed, 10);
    liste.forEach(a => {
      if (a.typ !== 'term' && a.typ !== 'bildzahl') melde(u, seed, 'Blitzrechnen ohne Ziffernblock: ' + a.typ);
      pruefeAufgabe(u, a, seed, RAUM[st]); anzahlAufgaben++;
    });
  }
});

// alle Sprechtexte der Übungen vorhanden?
MW.uebungen.forEach(u => {
  if (!u.audio.name || !u.audio.aufgabe) melde(u, 0, 'Name oder Aufgabensatz fehlt');
  if (!MW.typen) melde(u, 0, '');
});
console.log(`${MW.uebungen.length} Übungen + ${Object.keys(MW.blitz).length} Blitzrechen-Modi · ${RUNDEN} × 3 Runden je Übung · ${anzahlAufgaben.toLocaleString('de-DE')} Aufgaben geprüft in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
gruppen.forEach((g, k) => console.log(`✗ ${k}  (${g.n}×, z. B. ${g.beispiel})`));
console.log(fehler ? `✗ ${fehler} Regelverstöße` : '✓ keine Regelverstöße');
process.exit(fehler ? 1 : 0);
