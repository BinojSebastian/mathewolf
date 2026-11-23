/* Mathewolf – Generatoren für Rechenaufgaben (Plus, Minus, Mal, Geteilt, Ergänzen, Vergleichen, Zahlenstrahl, Runden) */
'use strict';
(function (MW) {
  const G = MW.generatoren;
  const OPWORT = { '+': 'woerter/plus', '−': 'woerter/minus', '·': 'woerter/mal', ':': 'woerter/geteilt_durch' };

  // Rechnung „a op b = □“ als Aufgabe
  MW.rechnung = function (a, op, b, erg, opt) {
    opt = opt || {};
    const auf = {
      typ: 'term',
      teile: [{ z: a }, { o: op }, { z: b }, { o: '=' }, { l: 0 }],
      loesung: erg,
      ansage: [a, OPWORT[op], b],
      schluessel: a + op + b,
      bild: opt.bild || null,
      groesse: opt.groesse
    };
    if (op === '+' || op === '·') auf.tauschSchluessel = Math.min(a, b) + op + Math.max(a, b);
    if (op === '+' || op === '−') auf.trivial = (b === 0 || (op === '+' && a === 0));
    if (op === '·') auf.trivial = (a <= 1 || b <= 1);
    if (op === ':') auf.trivial = (b === 1 || erg === 1);
    return auf;
  };
  MW.OPWORT = OPWORT;

  // Rechenstrich-Sprünge: zweite Zahl in Stellenwerte zerlegen
  function spruenge(b, minus) {
    const teile = [];
    let rest = b;
    [100000, 10000, 1000, 100, 10, 1].forEach(s => { const t = Math.floor(rest / s) * s; if (t > 0) { teile.push(minus ? -t : t); rest -= t; } });
    return teile;
  }
  MW.spruenge = spruenge;
  // Klasse 2: erst die Zehner, dann über den Zehner in zwei Schritten (87 + 8 → 87 + 3 + 5)
  function zehnerSpruenge(a, b, minus) {
    const z = Math.floor(b / 10) * 10, e = b % 10, out = [];
    if (z) out.push(minus ? -z : z);
    const zwischen = minus ? a - z : a + z;
    if (e) {
      const bisZehner = minus ? zwischen % 10 : (10 - zwischen % 10) % 10;
      if (bisZehner > 0 && bisZehner < e) { out.push(minus ? -bisZehner : bisZehner); out.push(minus ? -(e - bisZehner) : e - bisZehner); }
      else out.push(minus ? -e : e);
    }
    return out;
  }

  // ------------------------------------------------------------ Plus und Minus
  // parameter: { max, zehnerUebergang: true|false|'gemischt', operationen, art: 'zehner' (K3) }
  G.plusMinus = function (p, rng, u) {
    const ops = p.operationen || ['+', '−'];
    const n = u.aufgabenProRunde;
    return MW.runde(n, rng, (r, i) => erzeugePlusMinus(p, r, ops.length === 1 ? ops[0] : (i % 2 === 0 ? '+' : '−'), i));
  };
  function erzeugePlusMinus(p, r, op, i) {
    const max = p.max;
    let a, b;
    if (max <= 10) {
      if (op === '+') { a = r.int(0, 10); b = r.int(0, 10 - a); }
      else { a = r.int(1, 10); b = r.int(0, a); }
      const bild = op === '+' ? { typ: 'feld', felder: 10, rot: a, blau: b } : { typ: 'feld', felder: 10, rot: a, weg: b };
      const erg = op === '+' ? a + b : a - b;
      return MW.rechnung(a, op, b, erg, { bild });
    }
    if (max <= 20) {
      // mit Zehnerübergang
      if (op === '+') { a = r.int(2, 9); b = r.int(11 - a, 9); }
      else { a = r.int(11, 18); b = r.int(Math.max((a % 10) + 1, a - 9), 9); }
      const erg = op === '+' ? a + b : a - b;
      const bild = op === '+' ? { typ: 'feld', felder: 20, rot: a, blau: b } : { typ: 'feld', felder: 20, rot: a, weg: b };
      return MW.rechnung(a, op, b, erg, { bild });
    }
    if (max <= 100) {
      const ueber = i % 2 === 0;   // abwechselnd mit und ohne Zehnerübergang
      for (let v = 0; v < 200; v++) {
        if (op === '+') {
          a = r.int(11, 88); b = r.int(3, 99 - a);
          if (b < 10 && r.chance(0.5)) continue;
          if (((a % 10) + (b % 10) >= 10) !== ueber) continue;
          if (a + b > 100) continue;
        } else {
          a = r.int(21, 99); b = r.int(3, a - 1);
          if (((a % 10) < (b % 10)) !== ueber) continue;
        }
        break;
      }
      const erg = op === '+' ? a + b : a - b;
      return MW.rechnung(a, op, b, erg, { bild: { typ: 'rechenstrich', start: a, schritte: zehnerSpruenge(a, b, op === '−') } });
    }
    // bis 1.000: glatte Zehner oder dreistellig ± zweistellig
    const glatt = i % 2 === 0;
    for (let v = 0; v < 200; v++) {
      if (op === '+') {
        if (glatt) { a = r.int(11, 89) * 10; b = r.int(2, Math.min(90, 99 - a / 10)) * 10; }
        else { a = r.int(101, 899); b = r.int(12, 99); }
        if (a + b > 1000 || b % 100 === 0) continue;
      } else {
        if (glatt) { a = r.int(20, 99) * 10; b = r.int(2, a / 10 - 1) * 10; }
        else { a = r.int(201, 999); b = r.int(12, 99); }
        if (b % 100 === 0) continue;
      }
      break;
    }
    const erg = op === '+' ? a + b : a - b;
    return MW.rechnung(a, op, b, erg, { bild: { typ: 'rechenstrich', start: a, schritte: spruenge(b, op === '−') }, groesse: 'mittel' });
  }
  MW.erzeugePlusMinus = erzeugePlusMinus;

  // ------------------------------------------------------------ Ergänzen (Immer 10, Immer 100, Blitz bis 1.000)
  G.ergaenzen = function (p, rng, u) {
    const ziel = p.ziel;
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => ergaenze(ziel, r, i, p));
  };
  function ergaenze(ziel, r, i, p) {
    let a;
    if (ziel === 10) a = r.int(0, 10);
    else if (ziel === 100) a = r.chance(0.8) ? r.int(1, 99) : r.int(1, 9) * 10;
    else a = (p && p.schritt ? r.int(1, ziel / p.schritt - 1) * p.schritt : r.int(1, ziel - 1));
    const b = ziel - a;
    const vorn = ziel === 10 && i % 3 === 2;   // manchmal ist die erste Zahl gesucht
    const auf = {
      typ: 'term',
      teile: vorn ? [{ l: 0 }, { o: '+' }, { z: b }, { o: '=' }, { z: ziel }] : [{ z: a }, { o: '+' }, { l: 0 }, { o: '=' }, { z: ziel }],
      loesung: vorn ? a : b,
      ansage: vorn ? ['woerter/wie_viel', 'woerter/plus', b, 'woerter/gleich', ziel] : [a, 'woerter/plus', 'woerter/wie_viel', 'woerter/gleich', ziel],
      schluessel: (vorn ? '?+' + b : a + '+?') + '=' + ziel,
      trivial: a === 0 || a === ziel,
      bild: ziel === 10 ? { typ: 'feld', felder: 10, rot: vorn ? b : a } : ziel === 100 ? { typ: 'hunderter', rot: vorn ? b : a } : { typ: 'rechenstrich', start: vorn ? b : a, schritte: [ziel - (vorn ? b : a)] }
    };
    return auf;
  }
  MW.ergaenze = ergaenze;

  // ------------------------------------------------------------ Verdoppeln und Halbieren
  G.verdoppeln = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => verdopple(r, i, p.max || 20));
  };
  function verdopple(r, i, max) {
    if (i % 2 === 0) {
      const n = r.int(1, max / 2);
      return { typ: 'term', teile: [{ z: n }, { o: '+' }, { z: n }, { o: '=' }, { l: 0 }], loesung: 2 * n, ansage: [n, 'woerter/plus', n], schluessel: 'd' + n, bild: { typ: 'feld', felder: 20, rot: n, blau: n, zweiReihen: true } };
    }
    const m = r.int(1, max / 2) * 2;
    return { typ: 'term', teile: [{ t: 'die Hälfte von' }, { z: m }, { o: '=' }, { l: 0 }], loesung: m / 2, ansage: ['woerter/die_haelfte_von', m], schluessel: 'h' + m, bild: { typ: 'feld', felder: 20, rot: m / 2, blau: m / 2, zweiReihen: true }, groesse: 'mittel' };
  }
  MW.verdopple = verdopple;

  // ------------------------------------------------------------ Einmaleins und Geteilt
  G.einmaleins = function (p, rng, u) {
    const reihe = p.reihe || 0;
    return MW.runde(u.aufgabenProRunde, rng, r => einmal(r, reihe), { maxTrivial: reihe === 1 ? 99 : 1 });
  };
  function einmal(r, reihe) {
    const a = r.int(1, 10), b = reihe ? reihe : r.int(1, 10);
    return MW.rechnung(a, '·', b, a * b, { bild: { typ: 'punktefeld', reihen: a, spalten: b } });
  }
  MW.einmal = einmal;
  G.geteilt = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, r => geteilt(r));
  };
  function geteilt(r) {
    const d = r.int(2, 10), q = r.int(1, 10);
    return MW.rechnung(q * d, ':', d, q, { bild: { typ: 'punktefeld', reihen: q, spalten: d } });
  }
  MW.geteiltAufgabe = geteilt;

  // Mal und geteilt mit Zehnerzahlen: 7 · 40, 280 : 4
  G.zehnerMal = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => zehnerMal(r, i));
  };
  function zehnerMal(r, i) {
    const a = r.int(2, 9), z = r.int(2, 9), b = z * 10;
    if (i % 2 === 0) {
      const tausch = r.chance(0.5);
      const t = tausch ? MW.rechnung(b, '·', a, a * b) : MW.rechnung(a, '·', b, a * b);
      t.bild = { typ: 'kombi', teile: [{ typ: 'punktefeld', reihen: a, spalten: z, flex: '1' }, { typ: 'zeilen', zeilen: [MW.fmt(a) + ' · ' + z + ' = ' + (a * z), { text: MW.fmt(a) + ' · ' + b + ' = ?', farbe: 'gelb' }], flex: '1.4' }] };
      return t;
    }
    const t = MW.rechnung(a * b, ':', a, b);
    t.bild = { typ: 'kombi', teile: [{ typ: 'punktefeld', reihen: a, spalten: z, flex: '1' }, { typ: 'zeilen', zeilen: [(a * z) + ' : ' + a + ' = ' + z, { text: MW.fmt(a * b) + ' : ' + a + ' = ?', farbe: 'gelb' }], flex: '1.4' }] };
    return t;
  }
  MW.zehnerMalAufgabe = zehnerMal;

  // Teilen mit Rest: 47 : 6 = 7 R 5
  G.teilenMitRest = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const d = r.int(2, 9), q = r.int(2, 10), rest = r.int(1, d - 1);
      const n = q * d + rest;
      if (n > 100) return null;
      return {
        typ: 'term', mehrfeld: true,
        teile: [{ z: n }, { o: ':' }, { z: d }, { o: '=' }, { l: 0 }, { t: 'Rest' }, { l: 0, max: 2 }],
        loesung: [q, rest], ansage: [n, 'woerter/geteilt_durch', d], loesungAnsage: [q, 'woerter/rest', rest], groesse: 'mittel',
        schluessel: n + ':' + d, bild: { typ: 'punktefeld', reihen: q, spalten: d, rest }
      };
    });
  };

  // ------------------------------------------------------------ Größer, kleiner, gleich
  G.vergleich = function (p, rng, u) {
    let gleich = 0;
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      let a = r.int(0, p.max), b;
      if (i === 3 && gleich === 0) b = a; else { b = r.int(0, p.max); if (b === a) b = (a + r.int(1, 5)) % (p.max + 1); }
      if (a === b) gleich++;
      const zeichen = a < b ? '<' : a > b ? '>' : '=';
      const wort = a < b ? 'woerter/ist_kleiner_als' : a > b ? 'woerter/ist_groesser_als' : 'woerter/ist_gleich';
      return {
        typ: 'auswahl',
        anzeige: { typ: 'term', teile: [{ z: a }, { frage: true }, { z: b }] },
        optionen: [{ wert: '<', inhalt: '<' }, { wert: '=', inhalt: '=' }, { wert: '>', inhalt: '>' }],
        spalten: 3, loesung: zeichen,
        ansage: [a, { pause: 350 }, b],
        nachRichtig: [a, wort, b], loesungAnsage: [a, wort, b],
        schluessel: a + '?' + b,
        bild: { typ: 'zahlenstrahl', min: 0, max: p.max, schritt: 1, lang: 10, mittel: 5, beschriftung: [0, 5, 10, 15, 20], marken: [{ wert: a, text: String(a), farbe: '#D9604A' }, { wert: b, text: String(b), farbe: '#3B6F93' }] }
      };
    });
  };

  // ------------------------------------------------------------ Zahlenstrahl-Schieber
  // parameter: { max, raster, lang, mittel, beschriftung: Schritt der Beschriftung }
  G.schieber = function (p, rng, u) {
    const beschr = [];
    for (let v = 0; v <= p.max; v += p.beschriftung) beschr.push(v);
    let leicht = 0;
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const schritte = p.max / p.raster;
      const k = r.int(1, schritte - 1), ziel = k * p.raster;
      const istBeschriftet = ziel % p.beschriftung === 0;
      if (istBeschriftet && leicht >= 1) return null;
      if (p.mittel && ziel % p.mittel === 0 && !istBeschriftet && r.chance(0.5)) return null;
      if (istBeschriftet) leicht++;
      // Hilfe: Ausschnitt um die gesuchte Zahl, jeder Strich beschriftet
      const lo = Math.floor(ziel / p.lang) * p.lang, hi = lo + p.lang;
      const beschrH = [];
      const schrittH = p.lang / 10;
      for (let v = lo; v <= hi; v += schrittH) beschrH.push(v);
      return {
        typ: 'schieber', min: 0, max: p.max, raster: p.raster, lang: p.lang, mittel: p.mittel, beschriftung: beschr, schrift: p.schrift,
        loesung: ziel, ansage: ['woerter/stell_ein', ziel], schluessel: 'z' + ziel,
        bild: { typ: 'zahlenstrahl', min: lo, max: hi, schritt: schrittH, lang: p.lang, mittel: p.lang / 2, beschriftung: p.max >= 100000 ? [lo, lo + p.lang / 2, hi] : beschrH, schrift: p.max >= 1000 ? 30 : 34 }
      };
    });
  };

  // ------------------------------------------------------------ Runden und Überschlagen (Klasse 4)
  G.runden = function (p, rng, u) {
    const stellen = [10, 100, 1000];
    const wortStelle = { 10: 'woerter/zehner', 100: 'woerter/hunderter', 1000: 'woerter/tausender' };
    const textStelle = { 10: 'auf Zehner', 100: 'auf Hunderter', 1000: 'auf Tausender' };
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      if (i % 3 !== 2) {
        const s = stellen[i % 3 === 0 ? r.int(0, 2) : r.int(1, 2)];
        const n = r.int(1001, 99999);
        if (n % s === 0) return null;
        const erg = Math.round(n / s) * s;   // ab 5 aufrunden
        const lo = Math.floor(n / s) * s, hi = lo + s;
        return {
          typ: 'term', teile: [{ z: n }, { o: '≈' }, { l: 0, max: 6 }], frage: 'Runde ' + textStelle[s] + '.', groesse: 'mittel',
          loesung: erg, ansage: ['uebungen/k4_03_runde', n, 'woerter/auf', wortStelle[s]], schluessel: n + '~' + s,
          bild: { typ: 'zahlenstrahl', min: lo, max: hi, schritt: s / 10, lang: s, mittel: s / 2, beschriftung: [lo, lo + s / 2, hi], schrift: 28, marken: [{ wert: n, text: MW.fmt(n), farbe: '#C27803' }] }
        };
      }
      // Überschlag wählen
      const op = r.pick(['+', '−']);
      let a = r.int(120, 880), b = r.int(110, 880);
      if (op === '−' && b > a) { const t = a; a = b; b = t; }
      if (a % 100 === 0 || b % 100 === 0 || Math.abs(a - b) < 60) return null;
      const ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100;
      const opts = [[ra, rb], [ra + 100, rb], [ra, rb - 100], [ra - 100, rb + 100], [ra + 100, rb + 100]].filter(x => x[0] > 0 && x[1] > 0 && (op === '+' || x[0] > x[1]));
      const falsche = rng.shuffle(opts.slice(1)).slice(0, 2);
      const optionen = rng.shuffle([opts[0]].concat(falsche)).map(x => ({ wert: x.join(op), inhalt: MW.fmt(x[0]) + ' ' + op + ' ' + MW.fmt(x[1]), text: true }));
      return {
        typ: 'auswahl', anzeige: { typ: 'term', teile: [{ z: a }, { o: op }, { z: b }], groesse: 'mittel' }, frage: 'Welcher Überschlag passt?',
        optionen, spalten: 1, loesung: opts[0].join(op), ansage: ['uebungen/k4_03_ueberschlag', a, MW.OPWORT[op], b], schluessel: a + op + b,
        bild: { typ: 'zeilen', zeilen: [MW.fmt(a) + ' ≈ ' + MW.fmt(ra), MW.fmt(b) + ' ≈ ' + MW.fmt(rb)] }
      };
    });
  };

  // ------------------------------------------------------------ Blitzrechnen Klasse 1–4 (10 Aufgaben, Ziffernblock)
  const blitzRunde = (rng, erzeuge) => MW.runde(10, rng, erzeuge).map(a => Object.assign(a, { typ: 'term', bild: null, groesse: a.groesse || undefined }));
  G.blitzK1 = function (p, rng) {
    return blitzRunde(rng, (r, i) => {
      const art = i % 3;
      if (art === 0) return erzeugePlusMinus({ max: 10 }, r, r.chance(0.5) ? '+' : '−', i);
      if (art === 1) return ergaenze(10, r, 0, {});
      const n = r.int(1, 10);
      return { typ: 'term', teile: [{ z: n }, { o: '+' }, { z: n }, { o: '=' }, { l: 0 }], loesung: 2 * n, ansage: [n, 'woerter/plus', n], schluessel: 'd' + n };
    });
  };
  G.blitzK2 = function (p, rng) {
    return blitzRunde(rng, (r, i) => {
      if (i % 2 === 0) return einmal(r, 0);
      const op = r.chance(0.5) ? '+' : '−';
      let a = r.int(1, 9) * 10, b = r.int(1, 9) * 10;
      if (op === '+' && a + b > 100) return null;
      if (op === '−' && b > a) { const t = a; a = b; b = t; }
      return MW.rechnung(a, op, b, op === '+' ? a + b : a - b);
    });
  };
  G.blitzK3 = function (p, rng) {
    return blitzRunde(rng, (r, i) => {
      const art = i % 3;
      if (art === 0) return geteilt(r);
      if (art === 1) { const a = r.int(2, 9), b = r.int(2, 9) * 10; return r.chance(0.5) ? MW.rechnung(a, '·', b, a * b) : MW.rechnung(b, '·', a, a * b); }
      return ergaenze(1000, r, 0, { schritt: 100 });
    });
  };
  G.blitzK4 = function (p, rng) {
    return blitzRunde(rng, (r, i) => {
      const art = i % 4;
      if (art === 3) return einmal(r, 0);
      if (art === 0) { const a = r.int(1, 9) * 1000, b = r.int(1, 9) * 500; return a + b > 20000 ? null : Object.assign(MW.rechnung(a, '+', b, a + b), { groesse: 'mittel' }); }
      if (art === 1) { const a = r.int(4, 19) * 500, b = r.int(1, 7) * 500; return b >= a ? null : Object.assign(MW.rechnung(a, '−', b, a - b), { groesse: 'mittel' }); }
      const a = r.int(2, 9) * 100, b = r.int(2, 9);
      return MW.rechnung(a, '·', b, a * b);
    });
  };

})(window.MW);
