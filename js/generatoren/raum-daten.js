/* Mathewolf – Generatoren: Spiegelbilder, Körper, Umfang und Fläche, Diagramme, Zufall */
'use strict';
(function (MW) {
  const G = MW.generatoren;

  // ------------------------------------------------------------ K2-10 Spiegelbilder
  G.spiegel = function (p, rng, u) {
    const Z = p.zeilen || 6, SP = p.spalten || 8, M = SP / 2;
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const groesse = r.int(5, 9);
      const start = [r.int(0, Z - 1), M - 1];
      const zellen = new Set([start.join(',')]);
      let versuche = 0;
      while (zellen.size < groesse && versuche < 400) {
        versuche++;
        const [zr, zc] = r.pick(Array.from(zellen)).split(',').map(Number);
        const [dr, dc] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        const nr = zr + dr, nc = zc + dc;
        if (nr < 0 || nr >= Z || nc < 0 || nc >= M) continue;
        zellen.add(nr + ',' + nc);
      }
      const links = Array.from(zellen);
      const loesung = links.map(k => { const [zr, zc] = k.split(',').map(Number); return zr + ',' + (SP - 1 - zc); }).sort();
      return { typ: 'spiegel', zeilen: Z, spalten: SP, links, loesung, schluessel: links.slice().sort().join('|'), ansage: [MW.satz(u, 'los')] };
    });
  };

  // ------------------------------------------------------------ K3-10 Körper erkennen
  const KOERPER = {
    wuerfel: { name: 'Würfel', ecken: 8, flaechen: 6 }, quader: { name: 'Quader', ecken: 8, flaechen: 6 },
    pyramide: { name: 'Pyramide', ecken: 5, flaechen: 5 }, kugel: { name: 'Kugel' }, zylinder: { name: 'Zylinder' }, kegel: { name: 'Kegel' }
  };
  G.koerper = function (p, rng, u) {
    const arten = Object.keys(KOERPER);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const frage = i % 5 === 1 ? 'ecken' : i % 5 === 3 ? 'flaechen' : 'name';
      const art = frage === 'name' ? r.pick(arten) : r.pick(['wuerfel', 'quader', 'pyramide']);
      const k = KOERPER[art];
      if (frage === 'name') {
        const optionen = r.shuffle([art].concat(r.sample(arten.filter(a => a !== art), 3))).map(a => ({ wert: a, inhalt: KOERPER[a].name, text: true }));
        return {
          typ: 'auswahl', szene: { typ: 'szene', name: 'koerper', art }, optionen, spalten: 2, loesung: art, schluessel: 'n' + art,
          ansage: [MW.satz(u, 'name')], nachRichtig: [MW.satz(u, 'ist_' + art)], loesungAnsage: [MW.satz(u, 'ist_' + art)],
          tipp: [MW.satz(u, 'tipp_' + art)]
        };
      }
      const richtig = k[frage];
      const optionen = r.shuffle([richtig].concat(MW.ablenker(richtig, r, 3, { min: 3, max: 12 }))).map(v => ({ wert: v, inhalt: String(v) }));
      return {
        typ: 'auswahl', szene: { typ: 'szene', name: 'koerper', art }, optionen, spalten: 2, loesung: richtig, schluessel: frage + art,
        frage: 'Wie viele ' + (frage === 'ecken' ? 'Ecken' : 'Flächen') + ' hat ' + (art === 'pyramide' ? 'die ' : 'der ') + k.name + '?',
        ansage: [MW.satz(u, frage + '_' + art)], loesungAnsage: [richtig],
        bildInSzene: frage === 'ecken',
        bild: frage === 'ecken' ? { typ: 'szene', name: 'koerper', art, ecken: true } : { typ: 'zeilen', zeilen: art === 'pyramide' ? ['eine Fläche unten', 'und rundherum die Seiten'] : ['oben, unten,', 'vorne, hinten,', 'links, rechts'], groesse: 38 },
        tipp: [MW.satz(u, frage === 'ecken' ? 'tipp_ecken' : 'tipp_flaechen')]
      };
    });
  };
  // Artikel: „die Pyramide“
  MW.KOERPER = KOERPER;

  // ------------------------------------------------------------ K4-08 Umfang und Fläche
  G.flaeche = function (p, rng, u) {
    const Z = 7, SP = 10;
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const w = r.int(3, 7), h = r.int(2, 5);
      const r0 = r.int(0, Z - h), c0 = r.int(0, SP - w);
      let zellen = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) zellen.push((r0 + y) + ',' + (c0 + x));
      let form = 'rechteck';
      if (i >= 2 && w >= 3 && h >= 3) {   // L-Form: eine Ecke wegnehmen
        const cw = r.int(1, w - 2), ch = r.int(1, h - 2), ecke = r.int(0, 3);
        zellen = zellen.filter(k => {
          const [y, x] = k.split(',').map(Number), ly = y - r0, lx = x - c0;
          const inX = ecke % 2 === 0 ? lx < cw : lx >= w - cw, inY = ecke < 2 ? ly < ch : ly >= h - ch;
          return !(inX && inY);
        });
        form = 'L';
      }
      const set = new Set(zellen);
      let umfang = 0;
      zellen.forEach(k => { const [y, x] = k.split(',').map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dy, dx]) => { if (!set.has((y + dy) + ',' + (x + dx))) umfang++; }); });
      const frageUmfang = i % 2 === 0;
      return {
        typ: 'term', szene: { typ: 'szene', name: 'figur', zeilen: Z, spalten: SP, zellen },
        frage: frageUmfang ? 'Wie groß ist der Umfang?' : 'Wie groß ist die Fläche?',
        teile: [{ l: 0 }, { t: frageUmfang ? 'Kästchenlängen' : 'Kästchen' }], loesung: frageUmfang ? umfang : zellen.length,
        schluessel: (frageUmfang ? 'u' : 'f') + zellen.join('|'), ansage: [MW.satz(u, frageUmfang ? 'umfang' : 'flaeche')], groesse: 'klein',
        bildInSzene: true, bild: { typ: 'szene', name: 'figur', zeilen: Z, spalten: SP, zellen, zaehleUmfang: frageUmfang, reihen: !frageUmfang, zelle: 40 }, form
      };
    });
  };

  // ------------------------------------------------------------ K4-09 Diagramme lesen
  const THEMEN = {
    obst: { titel: 'Lieblingsobst der Klasse 4b', symbole: ['🍎', '🍌', '🍐', '🍒', '🍇'], namen: ['aepfel', 'bananen', 'birnen', 'kirschen', 'trauben'], text: ['Äpfel', 'Bananen', 'Birnen', 'Kirschen', 'Trauben'] },
    tier: { titel: 'Welches Haustier wünschst du dir?', symbole: ['🐶', '🐱', '🐰', '🐟', '🐦'], namen: ['hunde', 'katzen', 'kaninchen', 'fische', 'voegel'], text: ['Hunde', 'Katzen', 'Kaninchen', 'Fische', 'Vögel'] }
  };
  G.diagramm = function (p, rng, u) {
    const s = k => MW.satz(u, k);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const thema = i % 2 === 0 ? 'obst' : 'tier', T = THEMEN[thema];
      const art = i === 1 || i === 3 ? 'strich' : 'saeule';
      const n = r.int(4, 5);
      const werte = r.shuffle(Array.from({ length: 16 }, (_, k) => k + 2)).slice(0, n);
      const szene = { typ: 'szene', name: 'diagramm', art, werte, symbole: T.symbole.slice(0, n), max: 20, schritt: 2 };
      const frage = ['wert', 'mehr', 'meiste', 'summe'][i % 4];
      const name = k => s('n_' + T.namen[k]);
      const markiert = ks => Object.assign({}, szene, { markiert: ks });
      // Tipp und Lösung markieren die Säulen bzw. Zeilen direkt im Diagramm der Aufgabe (bildInSzene)
      if (frage === 'wert') {
        const k = r.int(0, n - 1);
        return { typ: 'term', szene, frage: (thema === 'obst' ? 'Wie viele Kinder mögen am liebsten ' : 'Wie viele Kinder wünschen sich ') + T.text[k] + '?', teile: [{ l: 0 }], loesung: werte[k], schluessel: 'w' + werte.join(), ansage: [s(thema + '_wert'), name(k)], bildInSzene: true, bild: markiert([k]), groesse: 'klein' };
      }
      if (frage === 'mehr') {
        const [a, b] = r.sample(Array.from({ length: n }, (_, k) => k), 2).sort((x, y) => werte[y] - werte[x]);
        if (werte[a] === werte[b]) return null;
        return { typ: 'term', szene, frage: (thema === 'obst' ? 'Wie viele Kinder mehr mögen ' : 'Wie viele Kinder mehr wünschen sich ') + T.text[a] + ' als ' + T.text[b] + '?', teile: [{ l: 0 }], loesung: werte[a] - werte[b], schluessel: 'm' + werte.join(), ansage: [s(thema + '_mehr'), name(a), 'woerter/als', name(b)], bildInSzene: true, bild: markiert([a, b]), groesse: 'klein' };
      }
      if (frage === 'meiste') {
        const max = Math.max.apply(null, werte), k = werte.indexOf(max);
        const optionen = T.symbole.slice(0, n).map((sy, j) => ({ wert: j, inhalt: sy })).slice(0, 4);
        if (k >= 4) return null;
        return { typ: 'auswahl', szene, frage: thema === 'obst' ? 'Welches Obst mögen die meisten Kinder?' : 'Welches Haustier wünschen sich die meisten Kinder?', optionen, spalten: 2, loesung: k, schluessel: 'x' + werte.join(), ansage: [s(thema + '_meiste')], nachRichtig: [name(k)], loesungAnsage: [name(k)], bildInSzene: true, bild: markiert([k]) };
      }
      const summe = werte.reduce((x, y) => x + y, 0);
      return { typ: 'term', szene, frage: 'Wie viele Kinder wurden insgesamt gefragt?', teile: [{ l: 0 }], loesung: summe, schluessel: 's' + werte.join(), ansage: [s('summe')], bildInSzene: true, bild: markiert(werte.map((_, k) => k)), groesse: 'klein' };
    });
  };

  // ------------------------------------------------------------ K4-10 Zufall
  const FARBEN = ['rot', 'blau', 'gelb', 'gruen'];
  const SMU = [{ wert: 'sicher', inhalt: 'sicher', text: true }, { wert: 'moeglich', inhalt: 'möglich', text: true }, { wert: 'unmoeglich', inhalt: 'unmöglich', text: true }];
  const FTEXT = { rot: 'Rot', blau: 'Blau', gelb: 'Gelb', gruen: 'Grün' };
  const FADJ = { rot: 'rote', blau: 'blaue', gelb: 'gelbe', gruen: 'grüne' };
  G.zufall = function (p, rng, u) {
    const s = k => MW.satz(u, k);
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const art = ['rad', 'wuerfel', 'kugeln', 'vergleich', 'rad'][i % 5];
      const ergebnis = r.pick(['sicher', 'moeglich', 'unmoeglich']);
      if (art === 'rad' || art === 'kugeln') {
        const farbe = r.pick(FARBEN), n = art === 'rad' ? r.pick([4, 6, 8]) : r.int(6, 10);
        const andere = FARBEN.filter(f => f !== farbe);
        let liste;
        if (ergebnis === 'sicher') liste = Array(n).fill(farbe);
        else if (ergebnis === 'unmoeglich') liste = Array.from({ length: n }, () => r.pick(andere));
        else { const k = r.int(1, n - 1); liste = r.shuffle(Array(k).fill(farbe).concat(Array.from({ length: n - k }, () => r.pick(andere)))); }
        const szene = art === 'rad' ? { typ: 'szene', name: 'zufall', art: 'rad', felder: liste } : { typ: 'szene', name: 'zufall', art: 'kugeln', kugeln: liste };
        const frage = art === 'rad' ? 'Bleibt das Glücksrad auf ' + FTEXT[farbe] + ' stehen?' : 'Ziehst du eine ' + FADJ[farbe] + ' Kugel?';
        return {
          typ: 'auswahl', szene, frage: frage + ' Sicher, möglich oder unmöglich?', optionen: SMU, spalten: 1, loesung: ergebnis, schluessel: art + farbe + liste.join(''),
          ansage: [s('frage'), s((art === 'rad' ? 'rad_' : 'kugel_') + farbe)], nachRichtig: [s('ist_' + ergebnis)], loesungAnsage: [s('ist_' + ergebnis)],
          bildInSzene: true, bild: Object.assign({}, szene, { markiert: farbe })
        };
      }
      if (art === 'wuerfel') {
        const EREIGNIS = { sicher: ['klein'], moeglich: ['sechs', 'gerade', 'eins'], unmoeglich: ['sieben', 'null'] };
        const TEXT = { klein: 'eine Zahl kleiner als 7', sechs: 'eine 6', gerade: 'eine gerade Zahl', eins: 'eine 1', sieben: 'eine 7', null: 'eine 0' };
        const e = r.pick(EREIGNIS[ergebnis]);
        return {
          typ: 'auswahl', szene: { typ: 'szene', name: 'zufall', art: 'wuerfel', zeigt: r.int(1, 6) }, frage: 'Du würfelst ' + TEXT[e] + '. Sicher, möglich oder unmöglich?',
          optionen: SMU, spalten: 1, loesung: ergebnis, schluessel: 'w' + e, ansage: [s('frage'), s('wuerfel_' + e)], nachRichtig: [s('ist_' + ergebnis)], loesungAnsage: [s('ist_' + ergebnis)],
          bild: { typ: 'zeilen', zeilen: ['Ein Würfel hat die Zahlen', { text: '1  2  3  4  5  6', farbe: 'gelb' }], groesse: 40 }
        };
      }
      // Vergleich zweier Glücksräder
      const farbe = r.pick(FARBEN), andere = FARBEN.filter(f => f !== farbe);
      const n1 = r.pick([4, 6, 8]), n2 = r.pick([4, 6, 8]);
      const k1 = r.int(1, n1 - 1), k2 = r.int(1, n2 - 1);
      const a1 = k1 / n1, a2 = k2 / n2;
      const loesung = a1 > a2 ? 'links' : a2 > a1 ? 'rechts' : 'gleich';
      const rad = (n, k) => r.shuffle(Array(k).fill(farbe).concat(Array.from({ length: n - k }, () => r.pick(andere))));
      const szene = { typ: 'szene', name: 'zufall', art: 'zweiRaeder', links: rad(n1, k1), rechts: rad(n2, k2) };
      return {
        typ: 'auswahl', szene, frage: 'Wo ist die Chance auf ' + FTEXT[farbe] + ' größer?',
        optionen: [{ wert: 'links', inhalt: '◀ linkes Rad', text: true }, { wert: 'rechts', inhalt: 'rechtes Rad ▶', text: true }, { wert: 'gleich', inhalt: 'gleich groß', text: true }],
        spalten: 1, loesung, schluessel: 'v' + n1 + k1 + n2 + k2, ansage: [s('vergleich_' + farbe)],
        bildInSzene: true, bild: Object.assign({}, szene, { markiert: farbe }), tipp: [s('tipp_vergleich')]
      };
    });
  };

})(window.MW);
