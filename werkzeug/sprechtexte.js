/* Mathewolf – Sprechtexte für die Aufnahme (z. B. mit ElevenLabs) zusammenstellen
   Aufruf:  node werkzeug/sprechtexte.js [maxZeichenProBlock, Standard 2400]
   Ergebnis in werkzeug/sprechtexte/:
     block-01.txt … block-NN.txt   genau diesen Text in ElevenLabs einfügen (eine Datei = eine Aufnahme)
     liste.json                     welcher Text in welchem Block an welcher Stelle steht (für das Schneiden)
     uebersicht.md                  alle Texte zum Nachlesen
   Gleiche Texte werden nur einmal aufgenommen. Zwischen zwei Texten steht eine Leerzeile: Dort macht die Stimme
   eine Pause, und daran schneidet werkzeug/stimme-schneiden.py die Aufnahme später in einzelne Bausteine.
   (Keine <break>-Tags: Die würden bei ElevenLabs als Zeichen mitgezählt und kosten Guthaben.) */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.join(__dirname, '..');
const MAX = parseInt(process.argv[2] || '2400', 10);
const TRENNER = '\n\n';   // Leerzeile zwischen zwei Texten

const ctx = { console, Math, JSON, Date, setTimeout, clearTimeout, Promise, Set, Map, Array, Object, String, Number, performance: { now: () => Date.now() } };
ctx.window = ctx; ctx.document = { addEventListener() { }, querySelectorAll() { return []; }, querySelector() { return null; } }; ctx.navigator = {};
vm.createContext(ctx);
const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
Array.from(html.matchAll(/<script src="([^"]+)"/g)).map(m => m[1]).forEach(s => vm.runInContext(fs.readFileSync(path.join(APP, s), 'utf8'), ctx, { filename: s }));
const MW = ctx.MW;

// Reihenfolge: Zahlen, Rechenwörter, Rahmen, Lob, Blitzrechnen, dann die Übungen der Reihe nach
const gruppen = [
  ['Zahlen', k => k.startsWith('zahlen/')],
  ['Rechen- und Größenwörter', k => k.startsWith('woerter/')],
  ['Rahmen und Lob', k => k.startsWith('rahmen/') || k.startsWith('lob/') || k.startsWith('blitz/')]
];
const alle = Object.keys(MW.texte);
const ordnung = [];
gruppen.forEach(([name, f]) => alle.filter(f).forEach(k => ordnung.push({ gruppe: name, key: k })));
MW.uebungen.concat(Object.values(MW.blitz)).forEach(u => {
  const p = MW.audioPrefix(u.id) + '_';
  alle.filter(k => k.startsWith(p)).forEach(k => ordnung.push({ gruppe: u.id + ' ' + u.titel, key: k }));
});
const fehlt = alle.filter(k => !ordnung.some(o => o.key === k));
fehlt.forEach(k => ordnung.push({ gruppe: 'Sonstiges', key: k }));

// Zahlen in der natürlichen Reihenfolge (0 … 100, Hunderter, tausend, ein, eine Million)
const rang = k => {
  const m = k.match(/^zahlen\/(\d{3})$/); if (m) return parseInt(m[1], 10);
  const h = k.match(/^zahlen\/h(\d)$/); if (h) return 100 + parseInt(h[1], 10);
  return { 'zahlen/tausend': 200, 'zahlen/ein': 201, 'zahlen/million': 202 }[k] || 0;
};
ordnung.sort((a, b) => (a.key.startsWith('zahlen/') && b.key.startsWith('zahlen/')) ? rang(a.key) - rang(b.key) : 0);

// Texte für die Stimme: Zahlen bekommen einen Punkt, damit sie deutlich und vollständig gesprochen werden
const sprechText = k => {
  let t = MW.texte[k].trim();
  if (!/[.!?:,]$/.test(t)) t += '.';
  return t;
};
const eindeutig = new Map();   // Text → Liste der Schlüssel
ordnung.forEach(o => { const t = sprechText(o.key); if (!eindeutig.has(t)) eindeutig.set(t, { text: t, keys: [], gruppe: o.gruppe }); eindeutig.get(t).keys.push(o.key); });

// Prüfungen
const probleme = [];
eindeutig.forEach(e => { if (/\d/.test(e.text)) probleme.push('Ziffer im Sprechtext: ' + e.text); if (/[€%&@#]/.test(e.text)) probleme.push('Sonderzeichen: ' + e.text); });

// Blöcke bilden
const bloecke = []; let akt = null;
eindeutig.forEach(e => {
  const laenge = e.text.length + TRENNER.length;
  if (!akt || akt.zeichen + laenge > MAX) { akt = { nr: bloecke.length + 1, eintraege: [], zeichen: 0 }; bloecke.push(akt); }
  akt.eintraege.push(e); akt.zeichen += laenge;
});

const ziel = path.join(__dirname, 'sprechtexte');
fs.mkdirSync(ziel, { recursive: true });
fs.readdirSync(ziel).filter(f => /^block-\d+\.txt$/.test(f)).forEach(f => fs.unlinkSync(path.join(ziel, f)));
const liste = [];
let md = '# Mathewolf – Sprechtexte\n\nJede Zeile ist ein Baustein. Gleiche Texte werden nur einmal aufgenommen.\n';
bloecke.forEach(b => {
  const name = 'block-' + String(b.nr).padStart(2, '0');
  const text = b.eintraege.map(e => e.text).join(TRENNER) + '\n';
  fs.writeFileSync(path.join(ziel, name + '.txt'), text);
  md += `\n## ${name} (${b.eintraege.length} Texte, ${text.length} Zeichen)\n\n`;
  b.eintraege.forEach((e, i) => {
    liste.push({ block: b.nr, nr: i + 1, text: e.text, keys: e.keys });
    md += `${i + 1}. ${e.text}  \`${e.keys.join(', ')}\`\n`;
  });
});
fs.writeFileSync(path.join(ziel, 'liste.json'), JSON.stringify({ erstellt: new Date().toISOString().slice(0, 10), bloecke: bloecke.length, texte: liste }, null, 1));
fs.writeFileSync(path.join(ziel, 'uebersicht.md'), md);

const zeichen = bloecke.reduce((s, b) => s + b.eintraege.reduce((x, e) => x + e.text.length, 0), 0);
console.log(`${alle.length} Audio-Schlüssel · ${eindeutig.size} verschiedene Texte · ${bloecke.length} Blöcke · ${zeichen.toLocaleString('de-DE')} Zeichen Text (ohne Pausen)`);
if (probleme.length) { console.log('Hinweise:'); probleme.forEach(p => console.log('  ' + p)); }
