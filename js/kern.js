/* Mathewolf – Kern: Namensraum, Zufall, Zahlen, Speicher, Hilfsfunktionen */
'use strict';
window.MW = window.MW || {};
(function (MW) {

  MW.VERSION = '2.0.0';

  // ---------------------------------------------------------------- Farben für Bilder auf der hellen Karte
  MW.F = {
    tinte: '#351A12', linie: '#4E3C34',
    zart: 'rgba(53,26,18,.05)', zart2: 'rgba(53,26,18,.10)', zart3: 'rgba(53,26,18,.22)',
    gelb: '#F5BC48', gelbText: '#B8770B', akzent: '#D98C0B',
    blau: '#5691B7', blauText: '#3B6F93',
    rot: '#D9604A', gruen: '#3F8F5B'
  };

  // ---------------------------------------------------------------- Zufall
  // mulberry32: kleiner, schneller Zufallsgenerator mit Startwert (für reproduzierbare Tests)
  MW.zufall = function (seed) {
    let s = (seed === undefined || seed === null) ? ((Date.now() ^ Math.floor(Math.random() * 4294967296)) >>> 0) : (seed >>> 0);
    const r = function () {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (a, b) => a + Math.floor(r() * (b - a + 1));            // a ≤ x ≤ b
    r.pick = arr => arr[Math.floor(r() * arr.length)];
    r.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    r.chance = p => r() < p;
    r.sample = (arr, n) => r.shuffle(arr).slice(0, n);
    return r;
  };

  // ---------------------------------------------------------------- Register
  MW.uebungen = [];            // alle Übungen (Datensätze aus daten/*.js)
  MW.blitz = {};               // Blitzrechnen je Stufe
  MW.generatoren = {};         // name → function(parameter, rng, uebung) → [aufgaben]
  MW.typen = {};               // Aufgabentyp → { aufbau(aufgabe, b), … }
  MW.texte = {};               // Audio-Schlüssel → Text (Sprechtexte)
  MW.uebung = rec => { MW.uebungen.push(rec); MW.sammleTexte(rec); return rec; };
  MW.blitzrechnen = rec => { MW.blitz[rec.stufe] = rec; MW.sammleTexte(rec); return rec; };
  MW.text = (key, text) => { MW.texte[key] = text; return key; };
  MW.textListe = obj => { Object.keys(obj).forEach(k => { MW.texte[k] = obj[k]; }); };

  // Texte einer Übung als Audio-Bausteine registrieren: uebungen/<id>_<name>
  MW.audioPrefix = id => 'uebungen/' + id.toLowerCase().replace('-', '_');
  MW.sammleTexte = function (rec) {
    const p = MW.audioPrefix(rec.id);
    const t = rec.texte || {};
    rec.audio = rec.audio || {};
    if (t.name) rec.audio.name = MW.text(p + '_name', t.name);
    if (t.aufgabe) rec.audio.aufgabe = MW.text(p + '_aufgabe', t.aufgabe);
    rec.audio.tipps = (t.tipps || []).map((s, i) => MW.text(p + '_tipp' + (i + 1), s));
    rec.audio.saetze = {};
    Object.keys(t.saetze || {}).forEach(k => { rec.audio.saetze[k] = MW.text(p + '_' + k, t.saetze[k]); });
  };
  // Satz einer Übung: MW.satz(uebung, 'aepfel') → Audio-Schlüssel
  MW.satz = (u, k) => {
    const key = u.audio && u.audio.saetze && u.audio.saetze[k];
    if (!key) console.warn('Satz fehlt', u.id, k);
    return key || null;
  };

  MW.stufen = [
    { id: 'V',  name: 'Vorschule', kurz: 'Vorschule', raum: 'bis 10',        abzeichen: '10',    farbe: 'gelb' },
    { id: 'K1', name: 'Klasse 1',  kurz: 'Klasse 1',  raum: 'bis 20',        abzeichen: '20',    farbe: 'blau' },
    { id: 'K2', name: 'Klasse 2',  kurz: 'Klasse 2',  raum: 'bis 100',       abzeichen: '100',   farbe: 'gruen' },
    { id: 'K3', name: 'Klasse 3',  kurz: 'Klasse 3',  raum: 'bis 1.000',     abzeichen: '1000',  farbe: 'braun' },
    { id: 'K4', name: 'Klasse 4',  kurz: 'Klasse 4',  raum: 'bis 1.000.000', abzeichen: '1 Mio', farbe: 'lila' }
  ];
  MW.stufe = id => MW.stufen.find(s => s.id === id);

  // ---------------------------------------------------------------- Zahlen
  const EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
    'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const ZEHNER = ['', 'zehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  const HUNDERTER = ['', 'einhundert', 'zweihundert', 'dreihundert', 'vierhundert', 'fünfhundert', 'sechshundert', 'siebenhundert', 'achthundert', 'neunhundert'];

  MW.wort100 = function (n) {          // 0 … 100 als Wort
    if (n === 100) return 'hundert';
    if (n < 20) return EINER[n];
    const z = Math.floor(n / 10), e = n % 10;
    return e === 0 ? ZEHNER[z] : (e === 1 ? 'ein' : EINER[e]) + 'und' + ZEHNER[z];
  };
  const pad3 = n => String(n).padStart(3, '0');

  // Zahl → Audio-Bausteine (ohne hörbare Pause hintereinander abzuspielen)
  function unter1000(n, vorTausend) {  // 1 … 999
    if (n === 1 && vorTausend) return ['zahlen/ein'];
    if (n <= 100) return ['zahlen/' + pad3(n)];
    const h = Math.floor(n / 100), r = n % 100, out = ['zahlen/h' + h];
    if (r === 1) out.push(vorTausend ? 'zahlen/ein' : 'zahlen/001');
    else if (r > 0) out.push('zahlen/' + pad3(r));
    return out;
  }
  MW.zahlBausteine = function (n) {
    n = Math.round(n);
    if (n < 0) return ['woerter/minus'].concat(MW.zahlBausteine(-n));
    if (n === 1000000) return ['zahlen/million'];
    if (n <= 100) return ['zahlen/' + pad3(n)];
    if (n > 1000000) return MW.zahlBausteine(Math.floor(n / 1000000)).concat(['zahlen/million']).concat(n % 1000000 ? MW.zahlBausteine(n % 1000000) : []);
    const t = Math.floor(n / 1000), r = n % 1000, out = [];
    if (t > 0) { out.push.apply(out, unter1000(t, true)); out.push('zahlen/tausend'); }
    if (r > 0) out.push.apply(out, unter1000(r, false));
    return out;
  };

  // Texte der Zahlen-Bausteine
  (function () {
    for (let i = 0; i <= 100; i++) MW.texte['zahlen/' + pad3(i)] = MW.wort100(i);
    for (let h = 1; h <= 9; h++) MW.texte['zahlen/h' + h] = HUNDERTER[h];
    MW.texte['zahlen/tausend'] = 'tausend';
    MW.texte['zahlen/ein'] = 'ein';
    MW.texte['zahlen/million'] = 'eine Million';
  })();

  MW.zahlWort = n => MW.zahlBausteine(n).map(k => MW.texte[k]).join('').replace('einemillion', 'eine Million');
  MW.zahlWortTrenn = n => MW.zahlBausteine(n).map(k => MW.texte[k]).join('\u00AD');   // weiche Trennstellen für lange Wörter

  // Anzeige mit Tausenderpunkt wie in der Grundschule: 1.250, 4.536, 1.000.000
  MW.fmt = function (n) {
    const neg = n < 0; n = Math.abs(n);
    const s = String(Math.round(n));
    const out = s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s;
    return (neg ? '−' : '') + out;
  };
  MW.fmtKomma = (n, stellen) => n.toFixed(stellen).replace('.', ',');

  // ---------------------------------------------------------------- Speicher
  const KEY = 'mathewolf.v1';
  const leer = () => ({ gesamtpunkte: 0, geschafft: [], bestzeiten: {}, einstellungen: { musik: true, effekte: true, stufe: null } });
  MW.speicher = {
    daten: leer(),
    laden() {
      try {
        const roh = localStorage.getItem(KEY);
        if (roh) {
          const d = JSON.parse(roh), l = leer();
          this.daten = Object.assign(l, d);
          this.daten.einstellungen = Object.assign(l.einstellungen, d.einstellungen || {});
          if (!Array.isArray(this.daten.geschafft)) this.daten.geschafft = [];
        }
      } catch (e) { this.daten = leer(); }
      return this.daten;
    },
    sichern() { try { localStorage.setItem(KEY, JSON.stringify(this.daten)); } catch (e) { /* privat/voll: ohne Speichern weiter */ } },
    punkteDazu(n) { this.daten.gesamtpunkte += n; this.sichern(); },
    geschafft(id) { if (this.daten.geschafft.indexOf(id) < 0) { this.daten.geschafft.push(id); this.sichern(); } },
    istGeschafft(id) { return this.daten.geschafft.indexOf(id) >= 0; },
    bestzeit(stufe) { return this.daten.bestzeiten[stufe] || null; },
    neueZeit(stufe, sek) {
      const alt = this.daten.bestzeiten[stufe];
      const rund = Math.round(sek * 10) / 10;
      if (!alt || rund < alt) { this.daten.bestzeiten[stufe] = rund; this.sichern(); return true; }
      return false;
    },
    einstellung(k, v) { if (v === undefined) return this.daten.einstellungen[k]; this.daten.einstellungen[k] = v; this.sichern(); }
  };

  // ---------------------------------------------------------------- DOM-Hilfen
  const istKind = x => (typeof Node !== 'undefined' && x instanceof Node) || Array.isArray(x) || typeof x === 'string' || typeof x === 'number';
  MW.el = function (tag, attrs) {
    const parts = tag.split('.');
    const e = document.createElement(parts[0] || 'div');
    if (parts.length > 1) e.className = parts.slice(1).join(' ');
    let ab = 2;
    if (attrs !== undefined && attrs !== null && istKind(attrs)) { ab = 1; attrs = null; }   // zweites Argument ist schon ein Kind
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(e.dataset, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (let i = ab; i < arguments.length; i++) MW.anhaengen(e, arguments[i]);
    return e;
  };
  MW.anhaengen = function (e, kid) {
    if (kid === null || kid === undefined || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(k => MW.anhaengen(e, k)); return; }
    e.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
  };
  const SVGNS = 'http://www.w3.org/2000/svg';
  MW.svg = function (tag, attrs) {
    const e = document.createElementNS(SVGNS, tag);
    let ab = 2;
    if (attrs !== undefined && attrs !== null && istKind(attrs)) { ab = 1; attrs = null; }
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (let i = ab; i < arguments.length; i++) MW.anhaengen(e, arguments[i]);
    return e;
  };
  MW.leeren = e => { while (e && e.firstChild) e.removeChild(e.firstChild); return e; };
  MW.zeitFaktor = 1;   // nur für automatische Tests kleiner
  MW.warte = ms => new Promise(r => setTimeout(r, ms * MW.zeitFaktor));
  MW.bewegungReduziert = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  // Ein Ereignis für Fingertipp und Maus, ohne 300-ms-Verzögerung und ohne Doppelauslösung
  MW.tipp = function (e, fn) {
    e.addEventListener('click', ev => { ev.preventDefault(); fn(ev); });
    return e;
  };

  // ---------------------------------------------------------------- Regeln für Runden
  // Baut eine Runde aus einer Erzeugerfunktion und prüft die Regeln aus der Spezifikation:
  // keine Aufgabe doppelt, höchstens eine Tauschaufgabe, höchstens eine triviale Aufgabe.
  MW.runde = function (anzahl, rng, erzeuge, opt) {
    opt = opt || {};
    const out = [], keys = new Set(), tausch = new Set();
    let tauschPaare = 0, trivial = 0, versuche = 0;
    while (out.length < anzahl && versuche < 4000) {
      versuche++;
      const a = erzeuge(rng, out.length, out);
      if (!a) continue;
      const k = a.schluessel || JSON.stringify(a.loesung) + '|' + (a.ansicht || '');
      if (keys.has(k)) continue;
      if (a.tauschSchluessel && tausch.has(a.tauschSchluessel)) {
        if (tauschPaare >= (opt.maxTausch === undefined ? 1 : opt.maxTausch)) continue;
      }
      if (a.trivial && trivial >= (opt.maxTrivial === undefined ? 1 : opt.maxTrivial)) continue;
      if (opt.pruefe && !opt.pruefe(a, out)) continue;
      if (a.tauschSchluessel && tausch.has(a.tauschSchluessel)) tauschPaare++;
      if (a.tauschSchluessel) tausch.add(a.tauschSchluessel);
      if (a.trivial) trivial++;
      keys.add(k);
      a.schluessel = k;
      out.push(a);
    }
    if (out.length < anzahl) console.warn('Runde unvollständig', anzahl, out.length);
    return out;
  };

  // plausible falsche Antworten für Auswahl-Aufgaben (± 1, ± 10, Zahlendreher)
  MW.ablenker = function (richtig, rng, anzahl, opt) {
    opt = opt || {};
    const min = opt.min === undefined ? 0 : opt.min, max = opt.max === undefined ? Infinity : opt.max;
    const kandidaten = new Set();
    const add = v => { if (v !== richtig && v >= min && v <= max && Number.isInteger(v)) kandidaten.add(v); };
    [1, -1, 2, -2, 10, -10].forEach(d => add(richtig + d));
    const s = String(richtig);
    if (s.length === 2 && s[0] !== s[1] && s[1] !== '0') add(parseInt(s[1] + s[0], 10));
    (opt.extra || []).forEach(add);
    let liste = rng.shuffle(Array.from(kandidaten));
    // nahe Werte bevorzugen
    liste.sort((a, b) => Math.abs(a - richtig) - Math.abs(b - richtig) + (rng() - 0.5) * 3);
    let i = 3;
    while (liste.length < anzahl && i < 50) { add(richtig + i); add(richtig - i); liste = Array.from(kandidaten); i++; }
    return rng.shuffle(liste.slice(0, Math.max(anzahl + 1, 4))).slice(0, anzahl);
  };

})(window.MW);
