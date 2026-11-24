/* Mathewolf – Rechenbilder und Zeichnungen (SVG, Kreide auf der Tafel oder dunkel auf hellem Grund) */
'use strict';
(function (MW) {
  const S = MW.svg;
  const B = MW.bild = {};

  // Seit Version 2 liegen alle Bilder auf der hellen Karte: Kreide-Farben = dunkle Linien, kräftige Füllungen
  const KREIDE = { linie: MW.F.linie, text: MW.F.tinte, rot: '#E2705B', blau: '#5691B7', gelb: '#F5BC48', gruen: '#3F8F5B', leer: '#FFFFFF', dunkel: MW.F.tinte, gelbText: MW.F.gelbText, akzent: MW.F.akzent };
  const HELL = { linie: '#351A12', text: '#351A12', rot: '#D9604A', blau: '#5691B7', gelb: '#F5BC48', gruen: '#3F8F5B', leer: '#FFFFFF', dunkel: '#FFFFFF', gelbText: MW.F.gelbText, akzent: MW.F.akzent };
  B.farben = hell => hell ? HELL : KREIDE;

  B.box = function (w, h, attrs) {
    return S('svg', Object.assign({ viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet', style: 'width:100%;height:100%' }, attrs || {}));
  };
  B.text = function (x, y, txt, opt) {
    opt = opt || {};
    return S('text', { x, y, 'text-anchor': opt.anker || 'middle', 'dominant-baseline': opt.basis || 'central', 'font-family': 'Fredoka, sans-serif', 'font-weight': opt.gewicht || 600, 'font-size': opt.groesse || 32, fill: opt.farbe || KREIDE.text, text: txt });
  };

  // ------------------------------------------------------------ Plättchen in Fünferstruktur (bis 10, bzw. 20)
  // opt: { rot, blau, weg (durchgestrichen, von hinten), hell, felder: 10|20, rahmen: true }
  B.feld = function (opt) {
    const F = B.farben(opt.hell);
    const felder = opt.felder || 10, proReihe = felder === 20 ? 10 : 5, reihen = felder / proReihe;
    const z = 60, gap = 16;
    const w = proReihe * z + (proReihe > 5 ? gap : 0) + 20, h = reihen * z + 20;
    const svg = B.box(w, h);
    const rot = opt.rot || 0, blau = opt.blau || 0, weg = opt.weg || 0, n = rot + blau;
    for (let i = 0; i < felder; i++) {
      const r = Math.floor(i / proReihe), c = i % proReihe;
      const x = 10 + c * z + (c >= 5 ? gap : 0), y = 10 + r * z;
      if (opt.rahmen !== false) svg.appendChild(S('rect', { x, y, width: z, height: z, fill: 'none', stroke: F.linie, 'stroke-width': 3, opacity: 0.75 }));
      if (opt.zweiReihen) {   // rot oben, blau unten – gleich lang wie im Spiegel
        const farbe = r === 0 ? (c < rot ? F.rot : null) : (c < blau ? F.blau : null);
        if (farbe) svg.appendChild(S('circle', { cx: x + z / 2, cy: y + z / 2, r: z * 0.36, fill: farbe, stroke: F.linie, 'stroke-width': 2 }));
        continue;
      }
      if (i < n) {
        const farbe = i < rot ? F.rot : F.blau;
        svg.appendChild(S('circle', { cx: x + z / 2, cy: y + z / 2, r: z * 0.36, fill: farbe, stroke: F.linie, 'stroke-width': 2 }));
        if (i >= n - weg) svg.appendChild(S('path', { d: `M${x + 12} ${y + 12} L${x + z - 12} ${y + z - 12} M${x + z - 12} ${y + 12} L${x + 12} ${y + z - 12}`, stroke: F.linie, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      }
    }
    return svg;
  };

  // freie Plättchen in Fünfergruppen (für Mengen bis 20)
  B.plaettchen = function (n, opt) {
    opt = opt || {};
    if (n <= 10) return B.feld(Object.assign({}, opt, { felder: 10, rot: opt.rot === undefined ? n : opt.rot, blau: opt.blau || 0 }));
    return B.feld(Object.assign({}, opt, { felder: 20, rot: opt.rot === undefined ? n : opt.rot, blau: opt.blau || 0 }));
  };

  // ------------------------------------------------------------ Hunderterfeld
  B.hunderterfeld = function (opt) {
    const F = B.farben(opt.hell);
    const z = 30, gap = 10, w = 10 * z + gap + 20, h = 10 * z + gap + 20;
    const svg = B.box(w, h);
    const rot = opt.rot || 0, blau = opt.blau || 0;
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10), c = i % 10;
      const x = 10 + c * z + (c >= 5 ? gap : 0), y = 10 + r * z + (r >= 5 ? gap : 0);
      svg.appendChild(S('rect', { x, y, width: z, height: z, fill: 'none', stroke: F.linie, 'stroke-width': 1.5, opacity: 0.6 }));
      if (i < rot + blau) svg.appendChild(S('circle', { cx: x + z / 2, cy: y + z / 2, r: z * 0.36, fill: i < rot ? F.rot : F.blau }));
    }
    return svg;
  };

  // ------------------------------------------------------------ Zehnerstangen und Einerwürfel
  B.zehnerEiner = function (z, e, opt) {
    opt = opt || {};
    const F = B.farben(opt.hell);
    const u = 26, stab = u * 10;
    const w = Math.max(1, z) * (u + 14) + (e ? 3 * (u + 6) + 30 : 0) + 20, h = stab + 20;
    const svg = B.box(w, h);
    for (let i = 0; i < z; i++) {
      const x = 10 + i * (u + 14);
      for (let k = 0; k < 10; k++) svg.appendChild(S('rect', { x, y: 10 + k * u, width: u, height: u, fill: F.blau, stroke: F.linie, 'stroke-width': 2 }));
    }
    const ex = 10 + z * (u + 14) + 20;
    for (let k = 0; k < e; k++) {
      const c = k % 3, r = Math.floor(k / 3);
      svg.appendChild(S('rect', { x: ex + c * (u + 6), y: 10 + stab - (r + 1) * (u + 6), width: u, height: u, fill: F.gelb, stroke: F.linie, 'stroke-width': 2 }));
    }
    return svg;
  };

  // ------------------------------------------------------------ Zahlenstrahl mit Marken
  // opt: { min, max, schritt, lang, beschriftung: [..], marken: [{wert, farbe, text}], bogen: [{von, bis, text}] }
  B.zahlenstrahl = function (opt) {
    const F = B.farben(opt.hell);
    const W = 1000, H = opt.hoehe || 200, L = 50, R = W - 60, Y = H - 80;
    const svg = B.box(W, H);
    const x = v => L + (v - opt.min) / (opt.max - opt.min) * (R - L);
    svg.appendChild(S('line', { x1: L - 20, y1: Y, x2: R + 30, y2: Y, stroke: F.linie, 'stroke-width': 4 }));
    svg.appendChild(S('path', { d: `M${R + 30} ${Y - 10} L${R + 45} ${Y} L${R + 30} ${Y + 10} Z`, fill: F.linie }));
    const schritt = opt.schritt || 1;
    for (let v = opt.min; v <= opt.max + 1e-9; v += schritt) {
      const lang = opt.lang && v % opt.lang === 0, mittel = opt.mittel && v % opt.mittel === 0;
      const h = lang ? 26 : mittel ? 18 : 10;
      svg.appendChild(S('line', { x1: x(v), y1: Y - h, x2: x(v), y2: Y + h, stroke: F.linie, 'stroke-width': lang ? 4 : 2.5 }));
    }
    (opt.beschriftung || []).forEach(v => svg.appendChild(B.text(x(v), Y + 52, MW.fmt(v), { groesse: Math.max(opt.schrift || 34, 30), farbe: F.text })));
    (opt.bogen || []).forEach((b, i) => {
      const x1 = x(b.von), x2 = x(b.bis), mx = (x1 + x2) / 2, hoch = Math.min(90, 30 + Math.abs(x2 - x1) * 0.35);
      svg.appendChild(S('path', { d: `M${x1} ${Y - 6} Q${mx} ${Y - hoch * 1.6} ${x2} ${Y - 6}`, fill: 'none', stroke: b.farbe || F.akzent, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      svg.appendChild(S('path', { d: `M${x2} ${Y - 6} l${x2 > x1 ? -14 : 14} -10 M${x2} ${Y - 6} l${x2 > x1 ? -3 : 3} -16`, stroke: b.farbe || F.akzent, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      if (b.text) svg.appendChild(B.text(mx, Y - hoch * 0.8 - 22, b.text, { groesse: 28, farbe: b.farbe || F.gelbText }));
    });
    (opt.marken || []).forEach(m => {
      svg.appendChild(S('circle', { cx: x(m.wert), cy: Y, r: 11, fill: m.farbe || F.gelb, stroke: F.linie, 'stroke-width': 3 }));
      if (m.text !== undefined) svg.appendChild(B.text(x(m.wert), Y - 40, m.text, { groesse: 32, farbe: m.farbe || F.gelbText }));
    });
    return svg;
  };

  // ------------------------------------------------------------ Rechenstrich (leerer Zahlenstrahl mit Sprüngen)
  // schritte: [{ plus: 30 }, { plus: 5 }] bzw. minus
  B.rechenstrich = function (start, schritte, opt) {
    opt = opt || {};
    const F = B.farben(opt.hell);
    const W = 1000, H = 240, Y = 172;
    const svg = B.box(W, H);
    const punkte = [start]; let v = start;
    schritte.forEach(s => { v += s; punkte.push(v); });
    const L = 70, R = W - 70;
    // jede Sprungweite bekommt Platz nach 1 + log10(Betrag): große Sprünge breiter, kleine trotzdem gut lesbar
    const gew = schritte.map(s => 1 + Math.log10(Math.max(1, Math.abs(s))));
    const summe = gew.reduce((a, b) => a + b, 0) || 1;
    const minus = schritte.length && schritte[0] < 0;
    const pos = [0]; gew.forEach(g => pos.push(pos[pos.length - 1] + g / summe));
    const xi = i => minus ? R - pos[i] * (R - L) : L + pos[i] * (R - L);
    const x = w => xi(Math.max(0, punkte.indexOf(w)));
    svg.appendChild(S('line', { x1: 20, y1: Y, x2: W - 20, y2: Y, stroke: F.linie, 'stroke-width': 4 }));
    punkte.forEach((p, i) => {
      svg.appendChild(S('line', { x1: x(p), y1: Y - 14, x2: x(p), y2: Y + 14, stroke: F.linie, 'stroke-width': 4 }));
      const letzter = i === punkte.length - 1;
      svg.appendChild(B.text(x(p), Y + 44, letzter && !opt.zeigeZiel ? '?' : MW.fmt(p), { groesse: 38, farbe: letzter ? F.gelbText : F.text }));
    });
    for (let i = 0; i < schritte.length; i++) {
      const x1 = x(punkte[i]), x2 = x(punkte[i + 1]), mx = (x1 + x2) / 2, hoch = 70 + (i % 2) * 18;
      svg.appendChild(S('path', { d: `M${x1} ${Y - 8} Q${mx} ${Y - hoch * 1.5} ${x2} ${Y - 8}`, fill: 'none', stroke: F.akzent, 'stroke-width': 4 }));
      const d = x2 > x1 ? -1 : 1;
      svg.appendChild(S('path', { d: `M${x2} ${Y - 8} l${d * 15} -8 M${x2} ${Y - 8} l${d * 2} -17`, stroke: F.akzent, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      svg.appendChild(B.text(mx, Y - hoch * 0.75 - 22, (schritte[i] > 0 ? '+' : '−') + MW.fmt(Math.abs(schritte[i])), { groesse: 38, farbe: F.gelbText }));
    }
    return svg;
  };

  // ------------------------------------------------------------ Punktefeld für Malaufgaben
  // reihen × spalten; opt.rest: zusätzliche einzelne Punkte; opt.markiert: Anzahl Reihen in Gelb
  B.punktefeld = function (reihen, spalten, opt) {
    opt = opt || {};
    const F = B.farben(opt.hell);
    const z = Math.min(44, 440 / Math.max(reihen, spalten)), gap = z * 0.45;
    const rest = opt.rest || 0;
    const w = spalten * z + (spalten > 5 ? gap : 0) + 40 + (rest ? z * 1.5 : 0), h = reihen * z + (reihen > 5 ? gap : 0) + 30 + (rest ? z * 1.3 : 0);
    const svg = B.box(w, h);
    for (let r = 0; r < reihen; r++) for (let c = 0; c < spalten; c++) {
      const x = 20 + c * z + (c >= 5 ? gap : 0) + z / 2, y = 15 + r * z + (r >= 5 ? gap : 0) + z / 2;
      svg.appendChild(S('circle', { cx: x, cy: y, r: z * 0.34, fill: opt.markiert && r < opt.markiert ? F.gelb : (r % 2 ? F.blau : F.rot) }));
    }
    for (let i = 0; i < rest; i++) {
      const y = 15 + reihen * z + (reihen > 5 ? gap : 0) + z * 0.75;
      svg.appendChild(S('circle', { cx: 20 + i * z + z / 2, cy: y, r: z * 0.34, fill: 'none', stroke: F.akzent, 'stroke-width': 4 }));
    }
    return svg;
  };

  // ------------------------------------------------------------ Stellenwerttafel
  // spalten: ['H','Z','E']; werte: Ziffern oder null; opt.plaettchen: Plättchen statt Ziffern
  B.stellenwerttafel = function (spalten, werte, opt) {
    opt = opt || {};
    const F = B.farben(opt.hell);
    const sw = opt.plaettchen ? 150 : 100, kopf = 56, zeile = opt.plaettchen ? 170 : 90;
    const w = spalten.length * sw + 20, h = kopf + zeile + 20;
    const svg = B.box(w, h);
    spalten.forEach((s, i) => {
      const x = 10 + i * sw;
      svg.appendChild(S('rect', { x, y: 10, width: sw, height: kopf + zeile, fill: 'none', stroke: F.linie, 'stroke-width': 3 }));
      svg.appendChild(S('line', { x1: x, y1: 10 + kopf, x2: x + sw, y2: 10 + kopf, stroke: F.linie, 'stroke-width': 3 }));
      svg.appendChild(B.text(x + sw / 2, 10 + kopf / 2, s, { groesse: 30, farbe: opt.markiere === i ? F.gelbText : F.text }));
      const v = werte[i];
      if (v === null || v === undefined) return;
      if (opt.plaettchen) {
        for (let k = 0; k < v; k++) {
          const c = k % 3, r = Math.floor(k / 3);
          svg.appendChild(S('circle', { cx: x + 30 + c * 45, cy: 10 + kopf + 26 + r * 42, r: 15, fill: [F.rot, F.blau, F.gelb, F.gruen, F.rot, F.blau][i % 6] }));
        }
      } else {
        svg.appendChild(B.text(x + sw / 2, 10 + kopf + zeile / 2, String(v), { groesse: 52, farbe: opt.markiere === i ? F.gelbText : F.text }));
      }
    });
    return svg;
  };

  // ------------------------------------------------------------ Geld (Münzen und Scheine, vereinfacht wie Spielgeld)
  const SCHEIN = { 5: '#B9B9A8', 10: '#E58F7E', 20: '#8FB3DA', 50: '#E9B46B', 100: '#8FC79A' };
  B.geldstueck = function (wert, opt) {
    opt = opt || {};
    if (wert >= 5) {
      const svg = B.box(170, 96);
      svg.appendChild(S('rect', { x: 4, y: 4, width: 162, height: 88, rx: 10, fill: SCHEIN[wert] || '#ccc', stroke: '#351A12', 'stroke-width': 3 }));
      svg.appendChild(S('rect', { x: 14, y: 14, width: 142, height: 68, rx: 6, fill: 'none', stroke: 'rgba(53,26,18,.35)', 'stroke-width': 2 }));
      svg.appendChild(S('circle', { cx: 52, cy: 48, r: 22, fill: 'rgba(255,255,255,.45)' }));
      svg.appendChild(B.text(112, 50, wert + ' €', { groesse: 34, farbe: '#351A12' }));
      return svg;
    }
    const svg = B.box(100, 100);
    if (wert === 1 || wert === 2) {
      const aussen = wert === 2 ? '#E0B24A' : '#C9CCD1', innen = wert === 2 ? '#C9CCD1' : '#E0B24A';
      svg.appendChild(S('circle', { cx: 50, cy: 50, r: 46, fill: aussen, stroke: '#351A12', 'stroke-width': 3 }));
      svg.appendChild(S('circle', { cx: 50, cy: 50, r: 31, fill: innen, stroke: 'rgba(53,26,18,.4)', 'stroke-width': 2 }));
      svg.appendChild(B.text(50, 52, wert + '€', { groesse: 26, farbe: '#351A12' }));
    } else {   // Cent-Münzen
      const r = wert >= 10 ? 38 : 32;
      svg.appendChild(S('circle', { cx: 50, cy: 50, r, fill: wert >= 10 ? '#E0B24A' : '#D08A5A', stroke: '#351A12', 'stroke-width': 3 }));
      svg.appendChild(B.text(50, 52, wert + ' ct', { groesse: 22, farbe: '#351A12' }));
    }
    return svg;
  };

  // ------------------------------------------------------------ Uhr
  B.uhr = function (h, m, opt) {
    opt = opt || {};
    const svg = B.box(320, 320);
    const c = 160;
    svg.appendChild(S('circle', { cx: c, cy: c, r: 148, fill: '#FFFDF6', stroke: '#9B6437', 'stroke-width': 12 }));
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * 2 * Math.PI, gross = i % 5 === 0;
      const r1 = gross ? 118 : 128, r2 = 136;
      svg.appendChild(S('line', { x1: c + r1 * Math.sin(a), y1: c - r1 * Math.cos(a), x2: c + r2 * Math.sin(a), y2: c - r2 * Math.cos(a), stroke: '#351A12', 'stroke-width': gross ? 4 : 1.5 }));
    }
    for (let i = 1; i <= 12; i++) {
      const a = i / 12 * 2 * Math.PI;
      svg.appendChild(B.text(c + 96 * Math.sin(a), c - 96 * Math.cos(a) + 2, String(i), { groesse: 30, farbe: '#351A12' }));
    }
    if (opt.minuten) [[0, '0'], [15, '15'], [30, '30'], [45, '45']].forEach(([mm, t]) => {
      const a = mm / 60 * 2 * Math.PI;
      svg.appendChild(B.text(c + 172 * Math.sin(a) * 0.82, c - 172 * Math.cos(a) * 0.82, t, { groesse: 20, farbe: '#5691B7' }));
    });
    if (opt.sektor) {   // „Viertel nach“, „halb“ farbig
      const a2 = m / 60 * 2 * Math.PI;
      svg.appendChild(S('path', { d: `M${c} ${c} L${c} ${c - 110} A110 110 0 ${m > 30 ? 1 : 0} 1 ${c + 110 * Math.sin(a2)} ${c - 110 * Math.cos(a2)} Z`, fill: 'rgba(245,188,72,.35)' }));
    }
    const ah = ((h % 12) + m / 60) / 12 * 2 * Math.PI, am = m / 60 * 2 * Math.PI;
    svg.appendChild(S('line', { x1: c, y1: c, x2: c + 70 * Math.sin(ah), y2: c - 70 * Math.cos(ah), stroke: '#351A12', 'stroke-width': 12, 'stroke-linecap': 'round' }));
    svg.appendChild(S('line', { x1: c, y1: c, x2: c + 112 * Math.sin(am), y2: c - 112 * Math.cos(am), stroke: '#5691B7', 'stroke-width': 7, 'stroke-linecap': 'round' }));
    svg.appendChild(S('circle', { cx: c, cy: c, r: 10, fill: '#351A12' }));
    return svg;
  };

  // ------------------------------------------------------------ Text in mehreren Zeilen
  // Echter Text statt SVG: Er bricht auf schmalen Handys um und bleibt lesbar.
  // MW.passeZeilen() verkleinert ihn nur, wenn er sonst nicht in die Fläche passt.
  B.zeilen = function (zeilen, opt) {
    opt = opt || {};
    const box = MW.el('div.zeilen-bild');
    box.style.setProperty('--gr', ((opt.groesse || 40) / 40).toFixed(3));
    // Zahl und Einheit sowie „=“ und Zahl nie trennen
    const fest = t => String(t).replace(/(\d) (?=(?:€|ct|km|cm|mm|kg|m|g)(?![A-Za-zÄÖÜäöüß]))/g, '$1 ').replace(/= /g, '= ');
    zeilen.forEach(z => {
      const o = typeof z === 'object' ? z : { text: z };
      box.appendChild(MW.el('div.zz' + (o.farbe ? '.' + o.farbe : ''), { text: fest(o.text) }));
    });
    return box;
  };
  MW.passeZeilen = function (wurzel) {
    if (!wurzel) return;
    const passe = z => {
      z.style.fontSize = '';
      let gr = parseFloat(getComputedStyle(z).fontSize);
      for (let n = 0; n < 24 && gr > 11 && (z.scrollHeight > z.clientHeight + 1 || z.scrollWidth > z.clientWidth + 1); n++) {
        gr = Math.max(11, gr * 0.9);
        z.style.fontSize = gr.toFixed(1) + 'px';
      }
      return gr;
    };
    wurzel.querySelectorAll('.zeilen-bild').forEach(z => {
      z.classList.remove('zwei');
      [...z.children].forEach(c => { c.hidden = false; });
      if (!z.clientHeight) return;
      const voll = parseFloat(getComputedStyle(z).fontSize);
      const gr = passe(z);
      // Viele kurze Zeilen auf flacher Fläche (Handy): zweispaltig ist oft größer lesbar
      if (gr < voll * 0.85 && z.children.length >= 4) {
        z.classList.add('zwei');
        if (passe(z) <= gr) { z.classList.remove('zwei'); passe(z); }
      }
      // Passt es selbst klein nicht (sehr kleines Handy), lieber hintere Zeilen weglassen als Text abschneiden
      const zz = [...z.children];
      for (let k = zz.length - 1; k > 0 && z.scrollHeight > z.clientHeight + 1; k--) zz[k].hidden = true;
    });
  };

  // ------------------------------------------------------------ Würfelbild
  B.wuerfelAugen = n => ({
    1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
  }[n] || []);
  B.wuerfel = function (n, opt) {
    opt = opt || {};
    const svg = B.box(200, 200);
    svg.appendChild(S('rect', { x: 12, y: 12, width: 176, height: 176, rx: 34, fill: '#FFFDF6', stroke: '#351A12', 'stroke-width': 6 }));
    B.wuerfelAugen(n).forEach(([dx, dy]) => svg.appendChild(S('circle', { cx: 100 + dx * 48, cy: 100 + dy * 48, r: 17, fill: opt.farbe || '#351A12' })));
    return svg;
  };

  // ------------------------------------------------------------ Fingerbild (Zählen mit dem Daumen beginnend)
  function hand(svg, ox, finger, spiegel) {
    const g = S('g', { transform: `translate(${ox},0)` + (spiegel ? ' translate(170,0) scale(-1,1)' : '') });
    const haut = '#F6D3B3', rand = '#351A12';
    // Finger: Zeige-, Mittel-, Ring-, kleiner Finger
    const fx = [52, 82, 112, 140], lang = [118, 128, 120, 98];
    for (let i = 0; i < 4; i++) {
      const auf = finger > i + 1;  // Daumen zählt zuerst
      const l = auf ? lang[i] : 34;
      g.appendChild(S('rect', { x: fx[i] - 13, y: 176 - l - 8, width: 26, height: l + 30, rx: 13, fill: haut, stroke: rand, 'stroke-width': 4 }));
    }
    // Handfläche
    g.appendChild(S('rect', { x: 32, y: 150, width: 126, height: 110, rx: 34, fill: haut, stroke: rand, 'stroke-width': 4 }));
    // Daumen
    const daumenAuf = finger >= 1;
    g.appendChild(S('rect', { x: daumenAuf ? 4 : 26, y: daumenAuf ? 120 : 170, width: 26, height: daumenAuf ? 86 : 50, rx: 13, fill: haut, stroke: rand, 'stroke-width': 4, transform: daumenAuf ? 'rotate(-28 17 200)' : 'rotate(-60 40 190)' }));
    g.appendChild(S('rect', { x: 36, y: 154, width: 118, height: 30, rx: 10, fill: haut }));
    svg.appendChild(g);
  }
  B.finger = function (n) {
    const zwei = n > 5;
    const svg = B.box(zwei ? 380 : 190, 270);
    hand(svg, 10, Math.min(5, n), false);
    if (zwei) hand(svg, 196, n - 5, true);
    return svg;
  };

  // ------------------------------------------------------------ Gegenstände (Emoji) verteilt in einem Feld ohne Überlappung
  B.verteilt = function (symbol, n, rng, opt) {
    opt = opt || {};
    const W = opt.breite || 600, H = opt.hoehe || 360, g = opt.groesse || 70;
    const spalten = Math.max(1, Math.floor(W / (g * 1.25))), reihen = Math.max(1, Math.floor(H / (g * 1.2)));
    const plaetze = [];
    for (let r = 0; r < reihen; r++) for (let c = 0; c < spalten; c++) plaetze.push([c, r]);
    const wahl = rng.shuffle(plaetze).slice(0, n);
    const cw = W / spalten, ch = H / reihen;
    return wahl.map(([c, r]) => ({
      x: c * cw + cw / 2 + (rng() - 0.5) * (cw - g) * 0.7,
      y: r * ch + ch / 2 + (rng() - 0.5) * (ch - g) * 0.7,
      symbol, groesse: g
    }));
  };
  B.emoji = function (x, y, symbol, groesse, attrs) {
    return S('text', Object.assign({ x, y, 'font-size': groesse, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: symbol, style: 'font-family: "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }, attrs || {}));
  };

  // ------------------------------------------------------------ Regelbild (z. B. Zahlenmauer: zwei Steine ergeben den darüber)
  B.regelMauer = function (a, b, c) {
    const svg = B.box(420, 220);
    const stein = (x, y, t, farbe) => {
      svg.appendChild(S('rect', { x, y, width: 130, height: 70, rx: 8, fill: 'none', stroke: farbe || KREIDE.linie, 'stroke-width': 4 }));
      svg.appendChild(B.text(x + 65, y + 37, t, { groesse: 36, farbe: farbe || KREIDE.text }));
    };
    stein(145, 20, c, KREIDE.gelbText); stein(80, 110, a); stein(210, 110, b);
    svg.appendChild(B.text(210, 145, '+', { groesse: 40, farbe: KREIDE.gelbText }));
    return svg;
  };

})(window.MW);
