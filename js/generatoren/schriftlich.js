/* Mathewolf – Generatoren für schriftliches Rechnen (Klasse 3 und 4) */
'use strict';
(function (MW) {
  const G = MW.generatoren;
  const ST = ['H', 'Z', 'E'];

  // K3-04 schriftlich addieren: 2–3 Zahlen, mit Übertrag, Ergebnis bis 1.000
  G.schriftlichPlus = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const drei = i === 2;
      const zahlen = drei ? [r.int(101, 499), r.int(21, 299), r.int(11, 199)] : [r.int(101, 699), r.int(101, 399)];
      const summe = zahlen.reduce((a, b) => a + b, 0);
      if (summe >= 1000) return null;
      // mindestens ein Übertrag
      const e = zahlen.reduce((a, b) => a + b % 10, 0), z = zahlen.reduce((a, b) => a + Math.floor(b / 10) % 10, 0);
      if (e < 10 && z < 10) return null;
      const raster = MW.rasterAddition(zahlen);
      return { typ: 'schriftlich', raster, ergebnis: summe, loesung: summe, schluessel: zahlen.join('+'), ansage: zahlen.reduce((acc, zz, k) => acc.concat(k ? ['woerter/plus', zz] : [zz]), []), bild: { typ: 'zeilen', zeilen: ['E  →  Z  →  H', { text: 'Übertrag klein in die nächste Spalte', farbe: 'gelb' }], groesse: 34 } };
    });
  };

  // K3-05 schriftlich subtrahieren: dreistellig mit Übertrag
  G.schriftlichMinus = function (p, rng, u) {
    const verfahren = p.verfahren || 'abziehen';
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const a = r.int(300, 999), b = r.int(102, a - 100);
      const diff = a - b;
      if (diff < 100) return null;
      const uebertrag = (a % 10) < (b % 10) || (Math.floor(a / 10) % 10) < (Math.floor(b / 10) % 10);
      if (!uebertrag) return null;
      if (i === 2 && Math.floor(a / 10) % 10 !== 0 && r.chance(0.6)) return null;   // gern auch mit Null in der Mitte
      const raster = MW.rasterSubtraktion(a, b, verfahren);
      return { typ: 'schriftlich', raster, ergebnis: diff, loesung: diff, schluessel: a + '-' + b, ansage: [a, 'woerter/minus', b], tipp: verfahren === 'ergaenzen' ? [MW.satz(u, 'ergaenzen_tipp' + (1 + i % 3))] : null, bild: { typ: 'zeilen', zeilen: verfahren === 'ergaenzen' ? ['von unten nach oben ergänzen', { text: 'Übertrag klein unter die nächste Spalte', farbe: 'gelb' }] : ['oben minus unten', { text: 'geht nicht? → entbündeln', farbe: 'gelb' }], groesse: 34 } };
    });
  };

  // K4-04 schriftlich multiplizieren: ein- oder zweistelliger Faktor
  G.schriftlichMal = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, (r, i) => {
      const zwei = i > 0;
      const a = zwei ? r.int(112, 989) : r.int(1012, 9876), b = zwei ? r.int(12, 89) : r.int(3, 9);
      if (b % 10 === 0 || String(b).indexOf('1') === 0 && b < 20 && r.chance(0.5)) return null;
      const prod = a * b;
      if (prod > 1000000) return null;
      const raster = MW.rasterMultiplikation(a, b);
      const teile = String(b).split('').map((d, k) => MW.fmt(a) + ' · ' + d + ' = ?');
      return { typ: 'schriftlich', raster, ergebnis: prod, loesung: prod, schluessel: a + '*' + b, ansage: [a, 'woerter/mal', b], bild: { typ: 'zeilen', zeilen: teile.concat(zwei ? [{ text: 'dann beide Zeilen addieren', farbe: 'gelb' }] : []), groesse: 36 } };
    });
  };

  // K4-05 schriftlich dividieren durch eine einstellige Zahl, ohne Rest
  G.schriftlichGeteilt = function (p, rng, u) {
    return MW.runde(u.aufgabenProRunde, rng, r => {
      const d = r.int(3, 9), q = r.int(112, 999);
      const a = d * q;
      if (a < 1000 || a > 9999) return null;
      if (String(q).indexOf('0') >= 0) return null;
      // keine Zwischen-Differenz 0 (sonst entstünde eine führende Null)
      const da = String(a).split('').map(Number);
      let pos = 0, rest = da[0];
      while (rest < d) { pos++; rest = rest * 10 + da[pos]; }
      let ok = true;
      while (pos < da.length - 1) { const diff = rest % d; if (diff === 0) { ok = false; break; } pos++; rest = diff * 10 + da[pos]; }
      if (!ok) return null;
      const raster = MW.rasterDivision(a, d);
      return { typ: 'schriftlich', raster, ergebnis: q, loesung: q, schluessel: a + ':' + d, ansage: [a, 'woerter/geteilt_durch', d], bild: { typ: 'zeilen', zeilen: ['1. Wie oft passt ' + d + ' hinein?', '2. Mal rechnen und abziehen.', '3. Nächste Ziffer herunterholen.'], groesse: 34 } };
    });
  };

})(window.MW);
