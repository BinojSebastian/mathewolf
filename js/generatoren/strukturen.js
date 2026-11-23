/* Mathewolf – Generatoren für Zahlenhaus, Zahlenmauer und Rechendreieck (Lücken immer eindeutig lösbar) */
'use strict';
(function (MW) {
  const G = MW.generatoren;

  // ------------------------------------------------------------ Zahlenhaus: ein Haus pro Runde
  G.zahlenhaus = function (p, rng, u, runde) {
    if (!rng._daecher) rng._daecher = rng.shuffle(Array.from({ length: p.dachMax - p.dachMin + 1 }, (_, k) => p.dachMin + k));
    const dach = rng._daecher[((runde || 1) - 1) % rng._daecher.length];
    const stockwerke = [];
    for (let l = p.mitNull ? 0 : 1; l <= (p.mitNull ? dach : dach - 1); l++) stockwerke.push([l, dach - l]);
    const luecken = stockwerke.map((st, s) => ({ stock: s, seite: rng.int(0, 1) }));
    return [{
      typ: 'zahlenhaus', dach, stockwerke, luecken, items: luecken.length,
      loesungen: luecken.map(l => stockwerke[l.stock][l.seite]), schluessel: 'haus' + dach,
      ansage: [MW.satz(u, 'dach'), dach]
    }];
  };

  // ------------------------------------------------------------ Zahlenmauer
  function mauerAus(grund) {
    const reihen = [grund.slice()];
    while (reihen[reihen.length - 1].length > 1) {
      const r = reihen[reihen.length - 1];
      reihen.push(r.slice(1).map((v, k) => r[k] + v));
    }
    return reihen;
  }
  // Schritt für Schritt lösbar? (dann ist die Lösung auch eindeutig)
  MW.mauerLoesbar = function (reihen, luecken) {
    const bek = reihen.map((r, ri) => r.map((v, k) => !luecken.some(l => l.r === ri && l.k === k)));
    let geaendert = true;
    while (geaendert) {
      geaendert = false;
      for (let r = 1; r < reihen.length; r++) for (let k = 0; k < reihen[r].length; k++) {
        const o = bek[r][k], a = bek[r - 1][k], c = bek[r - 1][k + 1];
        if (!o && a && c) { bek[r][k] = true; geaendert = true; }
        if (o && a && !c) { bek[r - 1][k + 1] = true; geaendert = true; }
        if (o && !a && c) { bek[r - 1][k] = true; geaendert = true; }
      }
    }
    return bek.every(r => r.every(Boolean));
  };
  G.zahlenmauer = function (p, rng, u) {
    const n = p.grundsteine, max = p.max;
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      let grund;
      if (n === 3) {
        grund = [r.int(1, 8), r.int(1, 6), r.int(1, 8)];
      } else {
        const g = () => r.int(p.minStein || 20, p.maxStein || 220);
        grund = [g(), g(), g(), g()];
        if (r.chance(0.5)) grund = grund.map(v => Math.round(v / 10) * 10 || 10);
      }
      const reihen = mauerAus(grund);
      const deck = reihen[reihen.length - 1][0];
      if (deck > max || deck < (n === 3 ? 9 : 300)) return null;
      const alle = [];
      reihen.forEach((rr, ri) => rr.forEach((v, k) => alle.push({ r: ri, k })));
      const anzahl = n === 3 ? r.int(1, 3) : r.int(2, 4);
      for (let v = 0; v < 60; v++) {
        const luecken = r.shuffle(alle).slice(0, anzahl);
        // mindestens eine Lücke unten oder in der Mitte, damit auch minus gerechnet wird
        if (i % 2 === 1 && !luecken.some(l => l.r < reihen.length - 1)) continue;
        if (!MW.mauerLoesbar(reihen, luecken)) continue;
        luecken.sort((x, y) => y.r - x.r || x.k - y.k);
        return { typ: 'zahlenmauer', reihen, luecken, items: luecken.length, loesungen: luecken.map(l => reihen[l.r][l.k]), schluessel: grund.join(','), ansage: [MW.satz(u, 'los')] };
      }
      return null;
    });
  };

  // ------------------------------------------------------------ Rechendreieck
  const NACHBARN = [[0, 1], [0, 2], [1, 2]];
  MW.dreieckLoesbar = function (luecken) {
    const bek = { innen: [true, true, true], aussen: [true, true, true] };
    luecken.forEach(l => { bek[l.art][l.k] = false; });
    let geaendert = true;
    while (geaendert) {
      geaendert = false;
      NACHBARN.forEach(([x, y], k) => {
        const a = bek.innen[x], c = bek.innen[y], o = bek.aussen[k];
        if (!o && a && c) { bek.aussen[k] = true; geaendert = true; }
        if (o && a && !c) { bek.innen[y] = true; geaendert = true; }
        if (o && !a && c) { bek.innen[x] = true; geaendert = true; }
      });
    }
    return bek.innen.every(Boolean) && bek.aussen.every(Boolean);
  };
  G.rechendreieck = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const innen = [r.int(5, 50), r.int(5, 50), r.int(5, 50)];
      const aussen = NACHBARN.map(([x, y]) => innen[x] + innen[y]);
      if (Math.max.apply(null, aussen) > p.max) return null;
      const alle = [0, 1, 2].map(k => ({ art: 'innen', k })).concat([0, 1, 2].map(k => ({ art: 'aussen', k })));
      const anzahl = r.int(2, 3);
      for (let v = 0; v < 60; v++) {
        const luecken = r.shuffle(alle).slice(0, anzahl);
        if (i === 0 && !luecken.every(l => l.art === 'aussen')) continue;    // erstes Dreieck: nur außen rechnen
        if (i > 0 && !luecken.some(l => l.art === 'innen')) continue;        // danach auch innen
        if (!MW.dreieckLoesbar(luecken)) continue;
        return { typ: 'rechendreieck', innen, aussen, luecken, items: luecken.length, loesungen: luecken.map(l => (l.art === 'innen' ? innen : aussen)[l.k]), schluessel: innen.join(','), ansage: [MW.satz(u, 'los')] };
      }
      return null;
    });
  };

})(window.MW);
