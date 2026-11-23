/* Mathewolf – Generatoren für Größen und Stellenwerte: Geld, Zehner/Einer, Uhrzeit, Stellenwerttafel, Einheiten, Komma, Sachaufgaben */
'use strict';
(function (MW) {
  const G = MW.generatoren;
  const menge = (n, key) => n === 1 ? ['zahlen/ein', key] : [n, key];

  // Zerlegung in möglichst wenige Münzen und Scheine
  function zerlege(betrag, werte) {
    const out = [];
    werte.slice().sort((a, b) => b - a).forEach(w => { while (betrag >= w) { out.push(w); betrag -= w; } });
    return out;
  }
  const geldText = liste => liste.map(w => w + ' €').join(' + ');
  const DINGE_PREIS = [['🧸', 'Teddy'], ['⚽', 'Ball'], ['📕', 'Buch'], ['🎨', 'Malkasten'], ['🚂', 'Zug'], ['🧩', 'Puzzle'], ['🎒', 'Rucksack'], ['🪁', 'Drachen'], ['🛹', 'Skateboard'], ['🎲', 'Spiel']];

  // ------------------------------------------------------------ Geld bis 20 € (K1-10)
  G.geld = function (p, rng, u) {
    const werte = p.werte;
    const quellen = werte.map(w => ({ wert: w, art: 'geld', name: w + ' Euro' }));
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      if (i % 2 === 0) {
        const ziel = r.int(p.min || 3, p.max);
        const z = zerlege(ziel, werte);
        if (z.length < 2) return null;
        return {
          typ: 'legen', quellen, ziel, zielText: 'Lege ' + ziel + ' €', zerlegung: z, schluessel: 'l' + ziel,
          ansage: ['woerter/lege_genau', ziel, 'woerter/euro'],
          bild: { typ: 'kombi', teile: [{ typ: 'szene', name: 'geldReihe', werte: z, flex: '1.4' }, { typ: 'zeilen', zeilen: [ziel + ' €', { text: '= ' + geldText(z), farbe: 'gelb' }], flex: '1' }] }
        };
      }
      const anzahl = r.int(2, 5), liste = [];
      for (let k = 0; k < anzahl; k++) liste.push(r.pick(werte));
      liste.sort((a, b) => b - a);
      const summe = liste.reduce((a, b) => a + b, 0);
      if (summe > p.max) return null;
      const spr = [];
      liste.reduce((acc, w) => { spr.push(w); return acc + w; }, 0);
      return {
        typ: 'term', szene: { typ: 'szene', name: 'geldReihe', werte: liste }, frage: 'Wie viel Geld ist das?',
        teile: [{ l: 0 }, { t: '€' }], loesung: summe, schluessel: 'z' + liste.join(','), ansage: [MW.satz(u, 'wieviel')],
        bild: { typ: 'rechenstrich', start: 0, schritte: spr }, groesse: 'mittel'
      };
    });
  };

  // ------------------------------------------------------------ Geld bis 100 € (K2-09): legen, zwei Preise, Wechselgeld
  G.geld100 = function (p, rng, u) {
    const werte = p.werte;
    const quellen = werte.map(w => ({ wert: w, art: 'geld', name: w + ' Euro' }));
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const art = ['legen', 'plus', 'wechsel', 'plus', 'wechsel'][i % 5];
      if (art === 'legen') {
        const ziel = r.int(21, 99), z = zerlege(ziel, werte);
        return {
          typ: 'legen', quellen, ziel, zielText: 'Lege ' + ziel + ' €', zerlegung: z, schluessel: 'l' + ziel,
          ansage: ['woerter/lege_genau', ziel, 'woerter/euro'],
          bild: { typ: 'kombi', teile: [{ typ: 'szene', name: 'geldReihe', werte: z, flex: '1.5' }, { typ: 'zeilen', zeilen: [ziel + ' €', { text: '= ' + geldText(z), farbe: 'gelb' }], groesse: 30, flex: '1' }] }
        };
      }
      const dinge = r.sample(DINGE_PREIS, 2);
      if (art === 'plus') {
        const a = r.int(11, 59), b = r.int(8, 99 - a);
        if (a + b > 100) return null;
        return {
          typ: 'term', szene: { typ: 'szene', name: 'preise', dinge: [{ symbol: dinge[0][0], preis: a }, { symbol: dinge[1][0], preis: b }] },
          frage: 'Wie viel kostet beides zusammen?', teile: [{ l: 0 }, { t: '€' }], loesung: a + b, schluessel: 'p' + a + '+' + b,
          ansage: [MW.satz(u, 'zusammen')], groesse: 'mittel',
          bild: { typ: 'kombi', teile: [{ typ: 'zeilen', zeilen: [{ text: a + ' € + ' + b + ' € = ?', farbe: 'gelb' }], flex: '1' }, { typ: 'rechenstrich', start: a, schritte: MW.spruenge(b, false), flex: '1.6' }] }
        };
      }
      const bezahlt = r.pick([20, 50, 100]), preis = r.int(Math.max(3, bezahlt / 2 - 10), bezahlt - 2);
      if (preis % 10 === 0) return null;
      return {
        typ: 'term', szene: { typ: 'szene', name: 'preise', dinge: [{ symbol: dinge[0][0], preis }], bezahlt },
        frage: 'Wie viel Geld bekommst du zurück?', teile: [{ l: 0 }, { t: '€' }], loesung: bezahlt - preis, schluessel: 'w' + bezahlt + '-' + preis,
        ansage: [MW.satz(u, 'bezahlt'), bezahlt, 'woerter/euro', MW.satz(u, 'zurueck')], groesse: 'mittel',
        bild: { typ: 'kombi', teile: [{ typ: 'zeilen', zeilen: [{ text: bezahlt + ' € − ' + preis + ' € = ?', farbe: 'gelb' }, 'oder ergänzen:'], flex: '1' }, { typ: 'rechenstrich', start: preis, schritte: [Math.ceil(preis / 10) * 10 - preis, bezahlt - Math.ceil(preis / 10) * 10].filter(x => x > 0), flex: '1.6' }] }
      };
    });
  };

  // ------------------------------------------------------------ Zehner und Einer (K2-02)
  G.zehnerEiner = function (p, rng, u) {
    const quellen = [{ wert: 10, art: 'zehner', name: 'Zehnerstab' }, { wert: 1, art: 'einer', name: 'Einerwürfel' }];
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const n = r.int(11, 99);
      if (n % 10 === 0 && r.chance(0.7)) return null;
      const z = Math.floor(n / 10), e = n % 10;
      const bild = { typ: 'stellenwert', spalten: ['Z', 'E'], werte: [z, e], plaettchen: true };
      if (i % 2 === 0) {
        return { typ: 'term', szene: { typ: 'szene', name: 'zehnerEiner', z, e }, teile: [{ l: 0 }], loesung: n, schluessel: 'lies' + n, ansage: [MW.satz(u, 'lies')], bild, groesse: 'mittel' };
      }
      const zerlegung = []; for (let k = 0; k < z; k++) zerlegung.push(10); for (let k = 0; k < e; k++) zerlegung.push(1);
      return { typ: 'legen', quellen, ziel: n, zielText: 'Lege ' + n, maxEiner: 9, zerlegung, schluessel: 'lege' + n, ansage: [MW.satz(u, 'lege'), n], bild };
    });
  };

  // ------------------------------------------------------------ Uhrzeit (K2-08)
  const uhrText = (h, m) => h + ':' + String(m).padStart(2, '0');
  const norm = h => ((h + 11) % 12) + 1;
  G.uhr = function (p, rng, u) {
    const minuten = [0, 30, 15, 45, 0];
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const h = r.int(1, 12), m = minuten[i % minuten.length];
      const falsch = new Map();
      const add = (hh, mm) => { const t = uhrText(norm(hh), mm); if (t !== uhrText(h, m)) falsch.set(t, [norm(hh), mm]); };
      if (m === 30) { add(h + 1, 30); add(h, 0); add(h + 1, 0); }
      if (m === 15) { add(h, 45); add(h + 1, 15); add(3, h * 5 % 60 === 0 ? 0 : h * 5 % 60); }
      if (m === 45) { add(h, 15); add(h + 1, 45); add(h + 1, 15); }
      if (m === 0) { add(12, (h * 5) % 60); add(h + 1, 0); add(h - 1, 0); }
      const optionen = r.shuffle([[h, m]].concat(r.sample(Array.from(falsch.values()), 3))).map(([hh, mm]) => ({ wert: uhrText(hh, mm), inhalt: uhrText(hh, mm) }));
      return {
        typ: 'auswahl', szene: { typ: 'szene', name: 'uhr', h, m }, optionen, spalten: 2, loesung: uhrText(h, m), schluessel: uhrText(h, m),
        ansage: [MW.satz(u, 'frage')], nachRichtig: [{ uhr: [h, m] }], loesungAnsage: [{ uhr: [h, m] }], bild: { typ: 'uhr', h, m }
      };
    });
  };

  // ------------------------------------------------------------ Stellenwerttafel H Z E (K3-02)
  G.stellenwert = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const h = r.int(1, 9), z = r.chance(0.2) ? 0 : r.int(0, 9), e = r.chance(0.2) ? 0 : r.int(0, 9);
      const n = h * 100 + z * 10 + e;
      if (i % 2 === 0) {
        return { typ: 'term', szene: { typ: 'stellenwert', spalten: ['H', 'Z', 'E'], werte: [h, z, e], plaettchen: true }, teile: [{ l: 0 }], frage: 'Welche Zahl ist das?', loesung: n, schluessel: 'z' + n, ansage: [MW.satz(u, 'zahl')], bild: { typ: 'kombi', teile: [{ typ: 'stellenwert', spalten: ['H', 'Z', 'E'], werte: ['?', '?', '?'], flex: '1' }, { typ: 'zeilen', zeilen: ['Zähle die Plättchen', 'in jeder Spalte.', { text: 'Leere Spalte = 0', farbe: 'gelb' }], groesse: 34, flex: '1.2' }] }, groesse: 'mittel' };
      }
      return {
        typ: 'term', mehrfeld: true, groesse: 'klein',
        teile: [{ z: n }, { o: '=' }, { l: 0, max: 1 }, { t: 'H' }, { o: '+' }, { l: 0, max: 1 }, { t: 'Z' }, { o: '+' }, { l: 0, max: 1 }, { t: 'E' }],
        loesung: [h, z, e], loesungAnsage: [h, 'woerter/hunderter', z, 'woerter/zehner', e, MW.satz(u, 'einer')], schluessel: 'x' + n,
        ansage: [MW.satz(u, 'zerlege'), n], bild: { typ: 'stellenwert', spalten: ['H', 'Z', 'E'], werte: [null, null, null] }
      };
    });
  };

  // ------------------------------------------------------------ Große Zahlen (K4-02)
  G.grosseZahlen = function (p, rng, u) {
    const SP = ['HT', 'ZT', 'T', 'H', 'Z', 'E'];
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const ziffern = [r.int(1, 9)].concat([0, 0, 0, 0, 0].map(() => r.chance(0.22) ? 0 : r.int(0, 9)));
      const n = parseInt(ziffern.join(''), 10);
      const t = Math.floor(n / 1000), rest = n % 1000;
      if (i % 2 === 0) {
        return {
          typ: 'stellenTafel', spalten: SP, loesung: ziffern, zahl: n, schluessel: 's' + n, wortText: MW.zahlWortTrenn(n),
          ansage: [MW.satz(u, 'trage'), n],
          bild: { typ: 'zeilen', zeilen: ['erst die Tausender:', MW.zahlWort(t) + '-tausend', 'dann der Rest:', (rest ? MW.zahlWort(rest) : 'null'), { text: 'Fehlt eine Stelle? Dann schreib 0.', farbe: 'gelb' }], groesse: 30 }
        };
      }
      return {
        typ: 'term', szene: { typ: 'stellenwert', spalten: SP, werte: ziffern }, teile: [{ l: 0, max: 6 }], loesung: n, schluessel: 'l' + n, groesse: 'mittel',
        frage: 'Welche Zahl ist das?', ansage: [MW.satz(u, 'welche')],
        bild: { typ: 'zeilen', zeilen: ['Lies erst die drei Tausender-Stellen,', 'dann die anderen drei.', { text: ziffern.slice(0, 3).join('') + ' Tausend  |  ' + ziffern.slice(3).join(''), farbe: 'gelb' }], groesse: 32 }
      };
    });
  };

  // ------------------------------------------------------------ Längen und Gewichte (K3-09)
  const EINH = {
    m: ['woerter/meter', 'm'], cm: ['woerter/zentimeter', 'cm'], mm: ['woerter/millimeter', 'mm'], km: ['woerter/kilometer', 'km'], g: ['woerter/gramm', 'g'], kg: ['woerter/kilogramm', 'kg']
  };
  const UMRECHNUNG = { 'm-cm': 100, 'km-m': 1000, 'cm-mm': 10, 'kg-g': 1000 };
  const LEISTE = ['1 km = 1.000 m', '1 m = 100 cm', '1 cm = 10 mm', '1 kg = 1.000 g'];
  const leiste = paar => ({ typ: 'zeilen', zeilen: LEISTE.map(z => z.indexOf(paar.split('-')[0] + ' =') === 2 ? { text: z, farbe: 'gelb' } : z), groesse: 36, zeilenhoehe: 52 });
  G.einheiten = function (p, rng, u) {
    // Zahlenraum bis 1.000: km und kg nur als „1 km = 1.000 m“ bzw. im Vergleich mit Zahlen bis 1.000
    const PAARE = ['m-cm', 'cm-mm', 'm-cm', 'cm-mm', 'km-m', 'kg-g'];
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const paar = r.pick(PAARE), f = UMRECHNUNG[paar];
      const [gross, klein] = paar.split('-');
      const tausend = f === 1000;
      const art = i % 3;
      if (art === 0) {   // groß → klein
        const n = tausend ? 1 : r.int(2, 9);
        return { typ: 'term', teile: [{ z: n }, { t: EINH[gross][1] }, { o: '=' }, { l: 0 }, { t: EINH[klein][1] }], loesung: n * f, schluessel: n + paar, ansage: menge(n, EINH[gross][0]).concat(['woerter/sind_wie_viel', EINH[klein][0]]), bild: leiste(paar), groesse: 'mittel' };
      }
      if (art === 1) {   // gemischt oder klein → groß
        if (paar === 'm-cm' && r.chance(0.6)) {
          const n = r.int(1, 8), rest = r.int(1, 9) * 10 + (r.chance(0.3) ? r.int(1, 9) : 0);
          return { typ: 'term', teile: [{ z: n }, { t: 'm' }, { z: rest }, { t: 'cm' }, { o: '=' }, { l: 0 }, { t: 'cm' }], loesung: n * f + rest, schluessel: n + paar + rest, ansage: menge(n, EINH.m[0]).concat([rest, EINH.cm[0], 'woerter/sind_wie_viel', EINH.cm[0]]), bild: leiste(paar), groesse: 'klein' };
        }
        const n = tausend ? 1 : r.int(2, 9);
        return { typ: 'term', teile: [{ z: n * f }, { t: EINH[klein][1] }, { o: '=' }, { l: 0 }, { t: EINH[gross][1] }], loesung: n, schluessel: n * f + paar + 'r', ansage: [n * f, EINH[klein][0], 'woerter/sind_wie_viel', EINH[gross][0]], bild: leiste(paar), groesse: 'mittel' };
      }
      // vergleichen
      const laenge = paar !== 'kg-g';
      const n = tausend ? 1 : r.int(1, 5);
      let a = tausend ? r.pick([500, 750, 900, 950, 990, 1000]) : n * f + r.pick([-1, 1, 0, 1, -1]) * r.int(1, 4) * (f / 10);
      if (a <= 0 || a > 1000) return null;
      const gl = a === n * f;
      const opts = [{ wert: 'klein', inhalt: MW.fmt(a) + ' ' + EINH[klein][1], text: true }, { wert: 'gross', inhalt: n + ' ' + EINH[gross][1], text: true }, { wert: 'gleich', inhalt: laenge ? 'gleich lang' : 'gleich schwer', text: true }];
      const loesung = gl ? 'gleich' : a > n * f ? 'klein' : 'gross';
      return {
        typ: 'auswahl', frage: laenge ? 'Was ist länger?' : 'Was ist schwerer?', optionen: opts, spalten: 1, loesung, schluessel: 'v' + a + paar + n,
        anzeige: { typ: 'term', teile: [{ z: a }, { t: EINH[klein][1] }, { t: 'oder' }, { z: n }, { t: EINH[gross][1] }], groesse: 'mittel' },
        ansage: [MW.satz(u, laenge ? 'laenger' : 'schwerer'), a, EINH[klein][0], 'woerter/oder'].concat(menge(n, EINH[gross][0])), bild: leiste(paar)
      };
    });
  };

  // ------------------------------------------------------------ Größen mit Komma (K4-06)
  G.komma = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const art = ['euro', 'km', 'zeit', 'kg', 'm', 'zeit'][i % 6];
      if (art === 'euro') {
        const e = r.int(1, 9), c = r.pick([5, 10, 20, 25, 30, 40, 50, 60, 75, 80, 90, 95]);
        return { typ: 'term', teile: [{ zt: e + ',' + String(c).padStart(2, '0') }, { t: '€' }, { o: '=' }, { l: 0 }, { t: 'ct' }], loesung: e * 100 + c, schluessel: 'e' + e + c, ansage: menge(e, 'woerter/euro').concat([c, 'woerter/sind_wie_viel', 'woerter/cent']), bild: { typ: 'zeilen', zeilen: [{ text: '1 € = 100 ct', farbe: 'gelb' }, e + ',' + String(c).padStart(2, '0') + ' € = ' + e + ' € und ' + c + ' ct'] }, groesse: 'mittel' };
      }
      if (art === 'km' || art === 'kg') {
        const a = r.int(1, 9), d = r.int(1, 9), zwei = r.chance(0.35), d2 = zwei ? r.int(1, 9) : 0;
        const text = a + ',' + d + (zwei ? d2 : ''), wert = a * 1000 + d * 100 + d2 * 10;
        const gross = art === 'km' ? 'km' : 'kg', klein = art === 'km' ? 'm' : 'g';
        return { typ: 'term', teile: [{ zt: text }, { t: gross }, { o: '=' }, { l: 0, max: 5 }, { t: klein }], loesung: wert, schluessel: art + text, ansage: [{ komma: [a, String(d) + (zwei ? d2 : '')] }, EINH[gross][0], 'woerter/sind_wie_viel', EINH[klein][0]], bild: { typ: 'zeilen', zeilen: [{ text: '1 ' + gross + ' = 1.000 ' + klein, farbe: 'gelb' }, '0,1 ' + gross + ' = 100 ' + klein, '0,01 ' + gross + ' = 10 ' + klein] }, groesse: 'mittel' };
      }
      if (art === 'm') {
        const a = r.int(1, 9), c = r.int(1, 99);
        const text = a + ',' + String(c).padStart(2, '0');
        return { typ: 'term', teile: [{ zt: text }, { t: 'm' }, { o: '=' }, { l: 0 }, { t: 'cm' }], loesung: a * 100 + c, schluessel: 'm' + text, ansage: [{ komma: [a, String(c).padStart(2, '0')] }, 'woerter/meter', 'woerter/sind_wie_viel', 'woerter/zentimeter'], bild: { typ: 'zeilen', zeilen: [{ text: '1 m = 100 cm', farbe: 'gelb' }, text + ' m = ' + a + ' m und ' + c + ' cm'] }, groesse: 'mittel' };
      }
      const zeiten = [['halbe', 'eine halbe Stunde', 30], ['viertel', 'eine Viertelstunde', 15], ['dreiviertel', 'eine Dreiviertelstunde', 45], ['eineinhalb', 'eineinhalb Stunden', 90], ['zwei', '2 h', 120], ['drei', '3 h', 180]];
      const z = r.pick(zeiten);
      const ansage = z[0] === 'zwei' || z[0] === 'drei' ? [z[0] === 'zwei' ? 2 : 3, 'woerter/stunden', 'woerter/sind_wie_viel', 'woerter/minuten'] : [MW.satz(u, z[0])];
      return { typ: 'term', teile: [{ t: z[1] }, { o: '=' }, { l: 0 }, { t: 'min' }], loesung: z[2], schluessel: 't' + z[0], ansage, bild: { typ: 'zeilen', zeilen: [{ text: '1 h = 60 min', farbe: 'gelb' }, 'eine halbe Stunde = 30 min', 'eine Viertelstunde = 15 min'] }, groesse: 'klein' };
    });
  };

  // ------------------------------------------------------------ Sachaufgaben (K4-07)
  G.sachaufgaben = function (p, rng, u) {
    const s = k => MW.satz(u, k);
    const VORLAGEN = [
      r => { const a = r.int(12, 48), b = r.int(15, 60); return { html: `Lena kauft ein Buch für <b>${a} €</b> und ein Spiel für <b>${b} €</b>. Wie viel bezahlt sie zusammen?`, ansage: [s('t1a'), a, 'woerter/euro', s('t1b'), b, 'woerter/euro', s('t1c')], loesung: a + b, einheit: '€', rechnung: `${a} € + ${b} € = ?` }; },
      r => { const z = r.pick([50, 100, 200]), a = r.int(Math.round(z * 0.3), z - 3); return { html: `Tom bezahlt mit <b>${z} €</b>. Sein Einkauf kostet <b>${a} €</b>. Wie viel Geld bekommt er zurück?`, ansage: [s('t2a'), z, 'woerter/euro', s('t2b'), a, 'woerter/euro', s('t2c')], loesung: z - a, einheit: '€', rechnung: `${z} € − ${a} € = ?` }; },
      r => { const a = r.int(2, 9), k = r.int(3, 9); return { html: `Ein Heft kostet <b>${a} €</b>. Mia kauft <b>${k}</b> Hefte. Wie viel muss sie bezahlen?`, ansage: [s('t3a'), a, 'woerter/euro', s('t3b'), k, s('t3c'), s('t3d')], loesung: a * k, einheit: '€', rechnung: `${k} · ${a} € = ?` }; },
      r => { const a = r.int(120, 480), b = r.int(110, 480); return { html: `Ein Zug fährt <b>${a} km</b>. Dann fährt er noch <b>${b} km</b>. Wie viele Kilometer fährt er insgesamt?`, ansage: [s('t4a'), a, 'woerter/kilometer', s('t4b'), b, 'woerter/kilometer', s('t4c')], loesung: a + b, einheit: 'km', rechnung: `${a} km + ${b} km = ?` }; },
      r => { const n = r.int(3, 9), q = r.int(4, 12), m = n * q; return { html: `<b>${m}</b> Bonbons werden gerecht verteilt. Es sind <b>${n}</b> Kinder. Wie viele Bonbons bekommt jedes Kind?`, ansage: [m, s('t5a'), s('t5b'), n, s('t5c'), s('t5d')], loesung: q, einheit: 'Stück', rechnung: `${m} : ${n} = ?` }; },
      r => { const a = r.int(40, 80), b = r.int(12, a - 5); return { html: `Ein Bus hat <b>${a}</b> Plätze. <b>${b}</b> Kinder sitzen schon darin. Wie viele Plätze sind noch frei?`, ansage: [s('t6a'), a, s('t6b'), b, s('t6c'), s('t6d')], loesung: a - b, einheit: 'Plätze', rechnung: `${a} − ${b} = ?` }; },
      r => { const h = r.int(2, 5); return { html: `Eine Fahrt dauert <b>${h} Stunden</b>. Wie viele Minuten sind das?`, ansage: [s('t7a'), h, 'woerter/stunden', s('t7b')], loesung: h * 60, einheit: 'min', rechnung: `${h} · 60 min = ?` }; },
      r => { const a = r.int(10, 25), b = r.int(30, 60); return { html: `Die Pause dauert <b>${a} Minuten</b>. Danach haben die Kinder <b>${b} Minuten</b> Sport. Wie viele Minuten sind das zusammen?`, ansage: [s('t8a'), a, 'woerter/minuten', s('t8b'), b, s('t8c'), s('t8d')], loesung: a + b, einheit: 'min', rechnung: `${a} min + ${b} min = ?` }; }
    ];
    if (!rng._vorlagen) rng._vorlagen = rng.shuffle(VORLAGEN.map((_, k) => k));
    let zeiger = 0;
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const k = rng._vorlagen.shift(); rng._vorlagen.push(k); zeiger++;
      const v = VORLAGEN[k](r);
      return {
        typ: 'term', geschichte: v.html, teile: [{ l: 0, max: 4 }, { t: v.einheit }], loesung: v.loesung, ansage: v.ansage, schluessel: 'v' + k,
        bild: { typ: 'zeilen', zeilen: ['Rechne so:', { text: v.rechnung, farbe: 'gelb' }], groesse: 40 }, groesse: 'mittel'
      };
    });
  };

  MW.zerlegeGeld = zerlege;
})(window.MW);
