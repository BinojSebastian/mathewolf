/* Mathewolf – Schriftliches Rechnen: Rechnung in Kästchen, Stelle für Stelle, Fokus springt weiter */
'use strict';
(function (MW) {
  const el = MW.el;

  // a.raster: { spalten, zeilen: [{ klein, linie, zellen: [null | {t} | {op} | {f: true, loesung, optional, ordnung}] }] }
  MW.typen.schriftlich = {
    aufbau(a, b) {
      const f = b.felder({ alleFelder: true });
      const R = a.raster;
      const grid = el('div.schrift', { style: { gridTemplateColumns: `repeat(${R.spalten}, auto)` } });
      grid.style.setProperty('--spalten', R.spalten);
      grid.style.setProperty('--zeilen', R.zeilen.reduce((n, z) => n + (z.klein || z.kopf ? 0.62 : 1), 0).toFixed(2));
      R.zeilen.forEach(z => {
        z.zellen.forEach((c, k) => {
          const zelle = el('div.zelle' + (z.klein ? '.klein' : '') + (z.kopf ? '.stellenkopf' : ''));
          if (z.linie && (c || z.linieAlle)) zelle.classList.add('linie');
          if (c) {
            if (c.t !== undefined) zelle.appendChild(el('span' + (c.gestrichen ? '.gestrichen' : ''), { text: String(c.t) }));
            else if (c.op) zelle.appendChild(el('span.op', { text: c.op }));
            else if (c.f) {
              const e = el('span'); zelle.appendChild(e);
              const fe = f.feld(e, { item: 0, max: 1, auto: true, ordnung: c.ordnung, optional: !!c.optional });
              fe.loesung = c.loesung;
              if (c.optional) e.classList.add('optional');
            }
          }
          grid.appendChild(zelle);
        });
      });
      b.tafel.appendChild(grid);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.ersteOffene());
    },
    pruefe(a, i, werte, b) { return b.f.liste.filter(x => !x.optional).every(x => x.wert !== '' && Number(x.wert) === x.loesung); },
    falsch(a, i, w, b) {
      // nur falsche Ziffern leeren, richtige bleiben stehen
      b.f.liste.filter(x => !x.optional).forEach(x => {
        if (Number(x.wert) !== x.loesung || x.wert === '') { x.el.classList.remove('falsch'); void x.el.offsetWidth; x.el.classList.add('falsch'); x.wert = ''; b.f.zeige(x); }
      });
      const erste = b.f.liste.filter(x => !x.optional && x.wert === '').sort((p, q) => p.ordnung - q.ordnung)[0];
      b.f.aktiviere(erste || null);
    },
    richtig(a, i, b) { b.f.liste.forEach(x => { x.fest = true; x.el.classList.remove('aktiv'); if (!x.optional) x.el.classList.add('richtig'); }); b.f.aktiv = null; },
    loesung(a, i, b) {
      b.f.liste.forEach(x => {
        if (x.optional) { if (x.loesung !== undefined && x.loesung !== null) b.f.setze(x, x.loesung, 'loesung'); else { x.fest = true; x.el.classList.remove('aktiv'); } return; }
        b.f.setze(x, x.loesung, Number(x.wert) === x.loesung ? 'richtig' : 'loesung');
      });
    },
    hilfe(a) { return MW.rechenbild(a.bild); },
    loesungTeile(a) { return ['rahmen/loesung_zahl', a.ergebnis]; }
  };

  // ------------------------------------------------------------ Raster bauen
  const ziff = n => String(n).split('').map(Number);
  const leer = n => Array(n).fill(null);

  // schriftliche Addition: zahlen (2–3), Ergebnis
  MW.rasterAddition = function (zahlen) {
    const summe = zahlen.reduce((x, y) => x + y, 0);
    const stellen = String(summe).length, N = stellen + 1;
    const zeilen = [];
    const kopf = ['', 'T', 'H', 'Z', 'E'].slice(-(stellen)).map(t => ({ t }));
    zeilen.push({ kopf: true, zellen: [null].concat(kopf) });
    zahlen.forEach((z, k) => {
      const d = ziff(z), zellen = leer(N);
      if (k > 0) zellen[0] = { op: '+' };
      d.forEach((v, j) => { zellen[N - d.length + j] = { t: v }; });
      zeilen.push({ zellen });
    });
    // Überträge (klein, freiwillig)
    const ueb = leer(N), erg = leer(N);
    let carry = 0, ordnung = 0;
    for (let s = 0; s < stellen; s++) {
      const spalte = N - 1 - s;
      if (s > 0) ueb[spalte] = { f: true, optional: true, loesung: carry || null, ordnung: ordnung++ };
      let v = carry; zahlen.forEach(z => { v += Math.floor(z / Math.pow(10, s)) % 10; });
      erg[spalte] = { f: true, loesung: v % 10, ordnung: ordnung++ };
      carry = Math.floor(v / 10);
    }
    zeilen.push({ klein: true, linie: true, linieAlle: true, zellen: ueb });
    zeilen.push({ zellen: erg });
    return { spalten: N, zeilen, ergebnis: summe };
  };

  // schriftliche Subtraktion: verfahren 'abziehen' (Entbündeln) oder 'ergaenzen' (Erweitern)
  MW.rasterSubtraktion = function (a, b, verfahren) {
    const diff = a - b, stellen = String(a).length, N = stellen + 1;
    const zeilen = [];
    zeilen.push({ kopf: true, zellen: [null].concat(['T', 'H', 'Z', 'E'].slice(-stellen).map(t => ({ t }))) });
    const da = ziff(a), db = ziff(b);
    // Hilfszeilen: freiwillige kleine Kästchen
    let ordnung = 0;
    const notiz = leer(N), unter = leer(N), erg = leer(N);
    // Lösungen der Hilfskästchen berechnen
    const aD = da.slice(), bD = Array(stellen - db.length).fill(0).concat(db);
    const neu = aD.slice();   // Ziffern nach dem Entbündeln
    if (verfahren === 'abziehen') {
      for (let s = stellen - 1; s >= 0; s--) {
        if (neu[s] < bD[s]) { let k = s - 1; while (k >= 0 && neu[k] === 0) { neu[k] = 9; k--; } if (k >= 0) neu[k] -= 1; neu[s] += 10; }
      }
    }
    let uebertrag = 0;
    for (let s = 0; s < stellen; s++) {
      const spalte = N - 1 - s, idx = stellen - 1 - s;
      if (verfahren === 'abziehen') {
        if (s > 0) notiz[spalte] = { f: true, optional: true, loesung: neu[idx] !== aD[idx] ? neu[idx] : null, ordnung: 100 + s };
      } else if (s > 0) {
        unter[spalte] = { f: true, optional: true, loesung: uebertrag || null, ordnung: ordnung++ };
      }
      const oben = aD[idx], u = bD[idx] + (verfahren === 'ergaenzen' ? uebertrag : 0);
      let v;
      if (verfahren === 'ergaenzen') { v = oben >= u ? oben - u : oben + 10 - u; uebertrag = oben >= u ? 0 : 1; }
      else v = Math.floor(diff / Math.pow(10, s)) % 10;
      erg[spalte] = { f: true, loesung: v, ordnung: ordnung++ };
    }
    if (verfahren === 'abziehen') zeilen.push({ klein: true, zellen: notiz });
    const zA = leer(N); da.forEach((v, j) => { zA[N - da.length + j] = { t: v }; }); zeilen.push({ zellen: zA });
    const zB = leer(N); zB[0] = { op: '−' }; db.forEach((v, j) => { zB[N - db.length + j] = { t: v }; });
    if (verfahren === 'ergaenzen') { zeilen.push({ zellen: zB }); zeilen.push({ klein: true, linie: true, linieAlle: true, zellen: unter }); }
    else zeilen.push({ zellen: zB, linie: true, linieAlle: true });
    zeilen.push({ zellen: erg });
    return { spalten: N, zeilen, ergebnis: diff };
  };

  // schriftliche Multiplikation (deutsches Normalverfahren: mit der höchsten Stelle des zweiten Faktors beginnen)
  MW.rasterMultiplikation = function (a, b) {
    const da = ziff(a), db = ziff(b), prod = a * b;
    const ausdruck = da.length + 1 + db.length;
    const teil = db.map((d, k) => ({ wert: a * d, ende: da.length + 1 + k }));   // Endspalte (0-basiert im Ausdruck)
    let links = 0;
    teil.forEach(t => { links = Math.min(links, t.ende - String(t.wert).length + 1); });
    if (db.length > 1) links = Math.min(links, ausdruck - String(prod).length);
    const off = -links, N = ausdruck + off;
    const zeilen = [];
    const z0 = leer(N);
    da.forEach((v, j) => { z0[off + j] = { t: v }; });
    z0[off + da.length] = { op: '·' };
    db.forEach((v, j) => { z0[off + da.length + 1 + j] = { t: v }; });
    zeilen.push({ zellen: z0, linie: true, linieAlle: true });
    let ordnung = 0;
    teil.forEach(t => {
      const z = leer(N), d = ziff(t.wert);
      for (let j = d.length - 1; j >= 0; j--) z[off + t.ende - (d.length - 1 - j)] = { f: true, loesung: d[j], ordnung: ordnung++ };
      zeilen.push({ zellen: z });
    });
    if (db.length > 1) {
      zeilen[zeilen.length - 1].linie = true; zeilen[zeilen.length - 1].linieAlle = true;
      const z = leer(N), d = ziff(prod);
      for (let j = d.length - 1; j >= 0; j--) z[N - 1 - (d.length - 1 - j)] = { f: true, loesung: d[j], ordnung: ordnung++ };
      zeilen.push({ zellen: z });
    }
    return { spalten: N, zeilen, ergebnis: prod };
  };

  // schriftliche Division durch eine einstellige Zahl, ohne Rest
  MW.rasterDivision = function (a, d) {
    const da = ziff(a), q = a / d, dq = ziff(q);
    const N = 1 + da.length + 1 + 1 + 1 + dq.length;   // Minus-Spalte, Dividend, :, Divisor, =, Ergebnis
    const zeilen = [];
    const kopf = leer(N);
    da.forEach((v, j) => { kopf[1 + j] = { t: v }; });
    kopf[1 + da.length] = { op: ':' }; kopf[2 + da.length] = { t: d }; kopf[3 + da.length] = { op: '=' };
    let ordnung = 0;
    const qStart = 4 + da.length;
    zeilen.push({ zellen: kopf });
    // Schritte
    let pos = 0, rest = da[0];
    while (rest < d && pos < da.length - 1) { pos++; rest = rest * 10 + da[pos]; }
    let qi = 0;
    while (true) {
      const qd = Math.floor(rest / d), p = qd * d, diff = rest - p;
      kopf[qStart + qi] = { f: true, loesung: qd, ordnung: ordnung++ };
      // Produktzeile, rechtsbündig an Spalte pos
      const zp = leer(N), dp = ziff(p);
      dp.forEach((v, j) => { zp[1 + pos - (dp.length - 1) + j] = { f: true, loesung: v, ordnung: ordnung++ }; });
      zp[1 + pos - dp.length] = { op: '−' };
      zeilen.push({ zellen: zp, linie: true });
      // Differenz (+ heruntergeholte Ziffer)
      const zd = leer(N), dd = ziff(diff);
      const letzte = pos === da.length - 1;
      dd.forEach((v, j) => { zd[1 + pos - (dd.length - 1) + j] = { f: true, loesung: v, ordnung: ordnung++ }; });
      if (!letzte) { zd[1 + pos + 1] = { f: true, loesung: da[pos + 1], ordnung: ordnung++ }; }
      zeilen.push({ zellen: zd });
      qi++;
      if (letzte) break;
      pos++; rest = diff * 10 + da[pos];
    }
    return { spalten: N, zeilen, ergebnis: q };
  };

})(window.MW);
