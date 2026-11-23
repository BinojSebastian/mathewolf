/* Mathewolf – Generatoren der Vorschule */
'use strict';
(function (MW) {
  const G = MW.generatoren, B = MW.bild;

  MW.DINGE = [
    { s: '🍎', k: 'aepfel' }, { s: '⭐', k: 'sterne' }, { s: '🐟', k: 'fische' }, { s: '🌼', k: 'blumen' },
    { s: '🐞', k: 'kaefer' }, { s: '🚗', k: 'autos' }, { s: '⚽', k: 'baelle' }, { s: '🦆', k: 'enten' },
    { s: '🍓', k: 'erdbeeren' }, { s: '🎈', k: 'ballons' }
  ];
  const FARBEN = ['#E8705A', '#5691B7', '#F5BC48', '#6DB07A', '#B07CC6'];

  MW.szenen.wuerfel = s => B.wuerfel(s.n);
  MW.szenen.finger = s => B.finger(s.n);
  // Menge aus Gegenständen in Fünferreihen (auf hellem Grund, für Auswahl-Kacheln)
  MW.szenen.menge = function (s) {
    const svg = B.box(330, s.n > 5 ? 150 : 82);
    for (let k = 0; k < s.n; k++) {
      const c = k % 5, r = Math.floor(k / 5);
      svg.appendChild(B.emoji(36 + c * 64, 40 + r * 70, s.symbol, 52));
    }
    return svg;
  };

  // ------------------------------------------------------------ V-01 Wie viele?
  G.zaehlen = function (p, rng, u) {
    const dinge = rng.shuffle(MW.DINGE);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const n = r.int(1, 10), d = dinge[i % dinge.length];
      return {
        typ: 'zaehlen', symbol: d.s, loesung: n, schluessel: 'n' + n,
        positionen: B.verteilt(d.s, n, r, { breite: 800, hoehe: 560, groesse: 92 }),
        ansage: [MW.satz(u, d.k)], bild: { typ: 'feld', felder: 10, rot: n }
      };
    });
  };

  // ------------------------------------------------------------ V-02 Blitzblick (Würfel- oder Fingerbild)
  G.blitzblick = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const art = i % 2 === 0 ? 'wuerfel' : 'finger';
      const n = r.int(1, 6);
      const falsche = MW.ablenker(n, r, 2, { min: 1, max: 6 });
      return {
        typ: 'blitzblick', bild: { typ: 'szene', name: art, n }, dauer: 2000, loesung: n, schluessel: art + n,
        optionen: r.shuffle([n].concat(falsche)), eingabeArt: 'auswahl',
        frage: [MW.satz(u, art)], hilfeBild: { typ: 'kombi', teile: [{ typ: 'szene', name: art, n }, { typ: 'feld', felder: 10, rot: n }] }
      };
    }, { pruefe: (a, out) => out.filter(x => x.loesung === a.loesung).length < 2 });
  };

  // ------------------------------------------------------------ V-03 Mehr oder weniger?
  G.mengenVergleich = function (p, rng, u) {
    let gleich = 0;
    const dinge = rng.shuffle(MW.DINGE);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      let links = r.int(1, 9), rechts = r.int(1, 9);
      if (i === 2 && gleich === 0) rechts = links;
      else if (links === rechts) return null;
      if (links === rechts) gleich++;
      const frage = r.chance(0.5) ? 'mehr' : 'weniger';
      const loesung = links === rechts ? 'gleich' : (frage === 'mehr') === (links > rechts) ? 'links' : 'rechts';
      return {
        typ: 'mengenVergleich', links, rechts, symbol: dinge[i % dinge.length].s, loesung, schluessel: links + '|' + rechts,
        ansage: [MW.satz(u, frage)]
      };
    });
  };

  // ------------------------------------------------------------ V-04 Zahl und Menge
  G.zahlMenge = function (p, rng, u) {
    const dinge = rng.shuffle(MW.DINGE);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const n = r.int(1, 10), sym = dinge[i % dinge.length].s;
      const falsche = MW.ablenker(n, r, 2, { min: 1, max: 10 });
      const optionen = r.shuffle([n].concat(falsche)).map(k => ({ wert: k, bild: { typ: 'szene', name: 'menge', n: k, symbol: sym }, hoehe: 120 }));
      return {
        typ: 'auswahl', anzeige: { typ: 'term', teile: [{ z: n }] }, optionen, spalten: 1, loesung: n, schluessel: 'm' + n,
        ansage: [MW.satz(u, 'frage'), n], bild: { typ: 'feld', felder: 10, rot: n }
      };
    });
  };

  // ------------------------------------------------------------ V-05 Zahlenreihe
  G.zahlenreihe = function (p, rng, u) {
    const max = p.max || 10;
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const s = r.int(1, max - 4), g = r.int(0, 4);
      const reihe = [0, 1, 2, 3, 4].map(k => k === g ? null : s + k);
      const ansage = [];
      reihe.forEach(z => ansage.push(z === null ? { pause: 700 } : z));
      return {
        typ: 'zahlenreihe', reihe, max, loesung: s + g, schluessel: s + '/' + g, ansage,
        bild: { typ: 'zahlenstrahl', min: 0, max, schritt: 1, beschriftung: Array.from({ length: max + 1 }, (_, k) => k), marken: reihe.map((z, k) => ({ wert: s + k, text: z === null ? '?' : undefined, farbe: z === null ? '#C27803' : '#5691B7' })) }
      };
    });
  };

  // ------------------------------------------------------------ V-06 Formen finden
  G.formen = function (p, rng, u) {
    const ziele = rng.shuffle(['kreis', 'dreieck', 'viereck']);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const ziel = ziele[i % 3];
      const zielFormen = ziel === 'viereck' ? ['quadrat', 'rechteck'] : [ziel];
      const andere = ['kreis', 'dreieck', 'quadrat', 'rechteck', 'stern'].filter(f => zielFormen.indexOf(f) < 0 && !(ziel === 'viereck' && f === 'rechteck'));
      const nZiel = r.int(3, 5), nAndere = 10 - nZiel;
      const liste = [];
      for (let k = 0; k < nZiel; k++) liste.push(r.pick(zielFormen));
      for (let k = 0; k < nAndere; k++) liste.push(r.pick(andere));
      const zellen = r.shuffle(Array.from({ length: 15 }, (_, k) => k)).slice(0, 10);
      const formen = r.shuffle(liste).map((form, k) => {
        const c = zellen[k] % 5, z = Math.floor(zellen[k] / 5);
        return { form, x: 82 + c * 164 + (r() - 0.5) * 34, y: 78 + z * 152 + (r() - 0.5) * 30, gr: r.int(62, 92), farbe: r.pick(FARBEN), drehung: form === 'kreis' ? 0 : r.int(-25, 25) };
      });
      const loesung = formen.map((f, k) => zielFormen.indexOf(f.form) >= 0 ? k : -1).filter(k => k >= 0);
      return { typ: 'formen', ziel, formen, loesung, schluessel: ziel + r(), ansage: [MW.satz(u, ziel)], tipp: [MW.satz(u, 'tipp_' + ziel)] };
    });
  };

  // ------------------------------------------------------------ V-07 Muster fortsetzen
  G.muster = function (p, rng, u) {
    const ARTEN = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2], AABB: [0, 0, 1, 1] };
    const FORMEN = ['kreis', 'quadrat', 'dreieck', 'stern'];
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const art = r.pick(Object.keys(ARTEN)), einheit = ARTEN[art];
      // Elemente: verschiedene Farbe und/oder Form
      const nachFarbe = r.chance(0.5);
      const farben = r.shuffle(FARBEN), formen = r.shuffle(FORMEN);
      const el = k => nachFarbe ? { form: formen[0], farbe: farben[k] } : { form: formen[k], farbe: farben[k] };
      const laenge = einheit.length * (einheit.length >= 3 ? 2 : 3) + r.int(0, einheit.length - 1);
      const reihe = Array.from({ length: laenge }, (_, k) => el(einheit[k % einheit.length]));
      const naechstes = einheit[laenge % einheit.length];
      const anzahl = Math.max.apply(null, einheit) + 1;
      const kandidaten = Array.from({ length: anzahl }, (_, k) => k);
      const optionenIdx = r.shuffle(kandidaten.concat([anzahl]));   // ein zusätzliches, nicht passendes Teil
      const optionen = optionenIdx.map(k => el(k));
      return { typ: 'muster', reihe, optionen, loesung: optionenIdx.indexOf(naechstes), einheit: einheit.length, schluessel: art + nachFarbe + farben[0] + laenge, ansage: [MW.satz(u, 'frage')] };
    });
  };

  // ------------------------------------------------------------ V-08 Wo ist was?
  const LAGEN = {
    tisch: {
      auf: { pos: [410, 205], zone: [270, 150, 280, 100] }, unter: { pos: [410, 372], zone: [300, 285, 220, 130] },
      links: { pos: [150, 378], zone: [40, 300, 210, 120] }, rechts: { pos: [680, 378], zone: [570, 300, 210, 120] },
      ueber: { pos: [410, 80], zone: [300, 20, 220, 130], schwebt: true }
    },
    kiste: {
      kiste_auf: { pos: [410, 205], zone: [300, 150, 220, 100] }, kiste_vor: { pos: [410, 392], zone: [320, 340, 180, 90], vorne: true },
      kiste_hinter: { pos: [410, 238], zone: [340, 180, 140, 75], hinten: true },
      kiste_links: { pos: [180, 378], zone: [60, 300, 210, 120] }, kiste_rechts: { pos: [640, 378], zone: [550, 300, 210, 120] }
    },
    zwei: {
      zwischen: { pos: [410, 378], zone: [310, 300, 200, 120] }, auf_links: { pos: [225, 228], zone: [150, 180, 150, 90] },
      auf_rechts: { pos: [595, 228], zone: [520, 180, 150, 90] }, ganz_links: { pos: [80, 378], zone: [20, 300, 120, 120] }
    }
  };
  const LAGE_DINGE = ['🧸', '⚽', '📕', '🐱', '🍎', '🎁', '🦆', '🚗', '🐶', '🌵'];
  const SCHWEBEND = ['🎈', '🦋', '🐦'];
  G.lage = function (p, rng, u) {
    const fragen = { tisch: ['auf', 'unter', 'links', 'rechts', 'ueber'], kiste: ['kiste_auf', 'kiste_vor', 'kiste_hinter', 'kiste_links', 'kiste_rechts'], zwei: ['zwischen'] };
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const ort = i === 4 ? 'zwei' : r.pick(['tisch', 'kiste']);
      const frage = r.pick(fragen[ort]);
      // „auf der Kiste“ und „hinter der Kiste“ nie zusammen – beides sieht man oben an der Kiste
      const andere = Object.keys(LAGEN[ort]).filter(k => k !== frage && k !== 'kiste_hinter' && !(frage === 'kiste_hinter' && k === 'kiste_auf'));
      const lagen = [frage].concat(r.shuffle(andere).slice(0, r.int(2, 3)));
      const symbole = r.shuffle(LAGE_DINGE);
      const dinge = r.shuffle(lagen).map((l, k) => {
        const L = LAGEN[ort][l];
        return { lage: l, x: L.pos[0], y: L.pos[1], gr: 74, symbol: L.schwebt ? r.pick(SCHWEBEND) : symbole[k], hinten: !!L.hinten };
      });
      return { typ: 'lage', ort, dinge, loesung: dinge.findIndex(d => d.lage === frage), zone: LAGEN[ort][frage].zone, schluessel: ort + frage + dinge.map(d => d.symbol).join(''), ansage: [MW.satz(u, frage)] };
    }, { pruefe: (a, out) => out.filter(x => x.ansage[0] === a.ansage[0]).length < 1 });
  };

  // ------------------------------------------------------------ V-09 Der Größe nach
  G.ordnen = function (p, rng, u) {
    const anzahlen = rng.shuffle([3, 4, 5]);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const art = i % 2 === 0 ? 'stifte' : 'tuerme';
      const n = anzahlen[i % 3];
      const groessen = r.shuffle(Array.from({ length: art === 'stifte' ? 7 : 6 }, (_, k) => k + 1)).slice(0, n);
      let start = r.shuffle(Array.from({ length: n }, (_, k) => k));
      if (start.every((k, j) => j === 0 || groessen[start[j - 1]] < groessen[k])) start = start.reverse();
      return { typ: 'ordnen', art, groessen, start, farben: r.shuffle(FARBEN.concat(FARBEN)).slice(0, n), loesung: groessen.slice().sort((x, y) => x - y), schluessel: art + groessen.join(','), ansage: [MW.satz(u, art)] };
    });
  };

  // ------------------------------------------------------------ V-10 Dazu und weg
  G.geschichte = function (p, rng, u) {
    const s = k => MW.satz(u, k);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const thema = i % 2 === 0 ? 'voegel' : 'aepfel';
      const art = r.chance(0.5) ? 'dazu' : 'weg';
      let start, aend;
      if (art === 'dazu') { start = r.int(1, 8); aend = r.int(1, 10 - start); }
      else { start = r.int(2, 10); aend = r.int(1, start - 1); }
      const erg = art === 'dazu' ? start + aend : start - aend;
      let teil1, teil2, frage;
      if (thema === 'voegel') {
        teil1 = start === 1 ? [s('ein_vogel')] : [start, s('voegel_sitzen')];
        teil2 = art === 'dazu' ? (aend === 1 ? [s('einer_dazu')] : [aend, s('fliegen_dazu')]) : (aend === 1 ? [s('einer_weg')] : [aend, s('fliegen_weg')]);
        frage = [s('frage_voegel')];
      } else {
        teil1 = start === 1 ? [s('ein_apfel')] : [start, s('aepfel_liegen')];
        teil2 = art === 'dazu' ? (aend === 1 ? [s('einer_kommt')] : [aend, s('kommen_dazu')]) : (aend === 1 ? [s('einen_heraus')] : [aend, s('nehme_heraus')]);
        frage = [s('frage_aepfel')];
      }
      return {
        typ: 'geschichte', thema, art, start, aenderung: aend, loesung: erg, schluessel: thema + art + start + '/' + aend,
        teil1, teil2, frage, bild: art === 'dazu' ? { typ: 'feld', felder: 10, rot: start, blau: aend } : { typ: 'feld', felder: 10, rot: start, weg: aend }
      };
    });
  };

  // ------------------------------------------------------------ Blitzrechnen Vorschule: Anzahlen auf einen Blick
  G.blitzV = function (p, rng, u) {
    return MW.runde(10, rng, (r, i) => {
      const art = ['wuerfel', 'finger', 'fuenfer'][i % 3];
      const n = art === 'wuerfel' ? r.int(1, 6) : r.int(1, 10);
      const szene = art === 'fuenfer' ? { typ: 'feld', felder: 10, rot: n } : { typ: 'szene', name: art, n };
      return { typ: 'bildzahl', szene, frage: 'Wie viele?', loesung: n, schluessel: art + n, ansage: [MW.satz(u, 'wieviele')] };
    });
  };

  // ------------------------------------------------------------ K1-03 Blitzblick Zwanzigerfeld
  G.blitzZwanzig = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const n = r.int(3, 20);
      return { typ: 'blitzblick', bild: { typ: 'feld', felder: 20, rot: n }, dauer: 1800, loesung: n, schluessel: 'z' + n, eingabeArt: 'ziffern', frage: [MW.satz(u, 'frage')], hilfeBild: { typ: 'feld', felder: 20, rot: n } };
    });
  };

})(window.MW);
