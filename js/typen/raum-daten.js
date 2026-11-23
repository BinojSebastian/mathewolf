/* Mathewolf – Raum und Form, Daten und Zufall: Spiegelbilder, Körper, Umfang/Fläche, Diagramme, Zufall */
'use strict';
(function (MW) {
  const el = MW.el, S = MW.svg, B = MW.bild;
  const K = MW.F.linie;

  // ------------------------------------------------------------ K2-10 Spiegelbilder: Kästchen antippen, dann OK
  function rasterSvg(a, zelle) {
    const w = a.spalten * zelle + 20, h = a.zeilen * zelle + 20;
    const svg = B.box(w, h, { class: 'raster-svg' });
    for (let r = 0; r < a.zeilen; r++) for (let c = 0; c < a.spalten; c++)
      svg.appendChild(S('rect', { x: 10 + c * zelle, y: 10 + r * zelle, width: zelle, height: zelle, fill: 'none', stroke: K, 'stroke-width': 1.5, opacity: 0.55 }));
    return svg;
  }
  MW.typen.spiegel = {
    aufbau(a, b) {
      const z = 64, svg = rasterSvg(a, z), mitte = a.spalten / 2;
      b.gewaehlt = new Set(); b.rechtecke = {};
      a.links.forEach(k => { const [r, c] = k.split(',').map(Number); svg.appendChild(S('rect', { x: 10 + c * z + 3, y: 10 + r * z + 3, width: z - 6, height: z - 6, rx: 6, fill: MW.F.blau })); });
      for (let r = 0; r < a.zeilen; r++) for (let c = mitte; c < a.spalten; c++) {
        const key = r + ',' + c;
        const rect = S('rect', { x: 10 + c * z + 3, y: 10 + r * z + 3, width: z - 6, height: z - 6, rx: 6, fill: MW.F.zart, class: 'zelle-tipp' });
        rect.addEventListener('click', () => {
          if (b.gesperrt) return;
          MW.audio.effekt('klick');
          if (b.gewaehlt.has(key)) { b.gewaehlt.delete(key); rect.setAttribute('fill', MW.F.zart); }
          else { b.gewaehlt.add(key); rect.setAttribute('fill', '#F5BC48'); }
          ok.disabled = b.gewaehlt.size === 0;
        });
        b.rechtecke[key] = rect;
        svg.appendChild(rect);
      }
      svg.appendChild(S('line', { x1: 10 + mitte * z, y1: 2, x2: 10 + mitte * z, y2: a.zeilen * z + 18, stroke: MW.F.rot, 'stroke-width': 7, 'stroke-linecap': 'round' }));
      b.svg = svg;
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      const ok = MW.knopf('OK', 'blau', () => b.antwort(0, Array.from(b.gewaehlt).sort()));
      ok.disabled = true; b.ok = ok;
      b.eingabe.appendChild(el('div', { style: { fontSize: '24px', textAlign: 'center', maxWidth: '300px' }, text: 'Tippe die Kästchen rechts vom Spiegel an.' }));
      b.eingabe.appendChild(ok);
    },
    pruefe: (a, i, wert) => MW.gleich(wert, a.loesung),
    falsch(a, i, w, b) { b.gewaehlt.forEach(k => b.rechtecke[k].setAttribute('fill', MW.F.zart)); b.gewaehlt.clear(); b.ok.disabled = true; },
    richtig(a, i, b) { b.gesperrt = true; b.ok.disabled = true; a.loesung.forEach(k => b.rechtecke[k].setAttribute('fill', MW.F.gruen)); },
    loesung(a, i, b) {
      b.gesperrt = true; b.ok.disabled = true;
      Object.keys(b.rechtecke).forEach(k => b.rechtecke[k].setAttribute('fill', a.loesung.indexOf(k) >= 0 ? MW.F.gruen : MW.F.zart));
    },
    hilfe(a) {
      const z = 46, svg = rasterSvg(a, z), mitte = a.spalten / 2;
      a.links.forEach(k => { const [r, c] = k.split(',').map(Number); svg.appendChild(S('rect', { x: 10 + c * z + 3, y: 10 + r * z + 3, width: z - 6, height: z - 6, rx: 5, fill: MW.F.blau })); });
      for (let c = 0; c < a.spalten; c++) {
        const d = c < mitte ? mitte - c : c - mitte + 1;
        svg.appendChild(B.text(10 + c * z + z / 2, 10 + a.zeilen * z - z / 2, String(d), { groesse: 22, farbe: MW.F.gelbText }));
      }
      svg.appendChild(S('line', { x1: 10 + mitte * z, y1: 2, x2: 10 + mitte * z, y2: a.zeilen * z + 18, stroke: MW.F.rot, 'stroke-width': 6 }));
      return svg;
    },
    loesungTeile: () => ['rahmen/loesung_bild']
  };

  // ------------------------------------------------------------ K3-10 Körper (Zeichnungen)
  MW.szenen.koerper = function (s) {
    const svg = B.box(420, 360);
    const st = { stroke: K, 'stroke-width': 4, 'stroke-linejoin': 'round' };
    const f1 = 'rgba(86,145,183,.42)', f2 = 'rgba(86,145,183,.26)', f3 = 'rgba(86,145,183,.14)';
    const ecken = [];
    const poly = (pts, fill) => { svg.appendChild(S('path', Object.assign({ d: 'M' + pts.map(p => p.join(' ')).join(' L') + ' Z', fill }, st))); };
    const gestrichelt = (a, b) => svg.appendChild(S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: K, 'stroke-width': 3, 'stroke-dasharray': '9 8', opacity: 0.7 }));
    if (s.art === 'wuerfel' || s.art === 'quader') {
      const w = s.art === 'wuerfel' ? 170 : 230, h = s.art === 'wuerfel' ? 170 : 130, dx = 70, dy = -55;
      const x0 = 210 - (w + dx) / 2, y0 = 300;
      const A = [x0, y0], Bp = [x0 + w, y0], C = [x0 + w, y0 - h], D = [x0, y0 - h];
      const E = [D[0] + dx, D[1] + dy], F = [C[0] + dx, C[1] + dy], Gp = [Bp[0] + dx, Bp[1] + dy], H = [A[0] + dx, A[1] + dy];
      gestrichelt(A, H); gestrichelt(H, E); gestrichelt(H, Gp);
      poly([A, Bp, C, D], f1); poly([D, C, F, E], f2); poly([Bp, Gp, F, C], f3);
      ecken.push(A, Bp, C, D, E, F, Gp, H);
    } else if (s.art === 'pyramide') {
      const A = [100, 290], Bp = [290, 290], C = [340, 240], D = [150, 240], T = [215, 50];
      gestrichelt(A, D); gestrichelt(D, C); gestrichelt(D, T);
      poly([A, Bp, T], f1); poly([Bp, C, T], f2);
      ecken.push(A, Bp, C, D, T);
    } else if (s.art === 'kugel') {
      svg.appendChild(S('circle', Object.assign({ cx: 210, cy: 180, r: 130, fill: f2 }, st)));
      svg.appendChild(S('ellipse', { cx: 210, cy: 180, rx: 130, ry: 34, fill: 'none', stroke: K, 'stroke-width': 3, 'stroke-dasharray': '9 8', opacity: 0.7 }));
      svg.appendChild(S('ellipse', { cx: 160, cy: 120, rx: 30, ry: 18, fill: 'rgba(255,255,255,.25)' }));
    } else if (s.art === 'zylinder') {
      svg.appendChild(S('path', Object.assign({ d: 'M110 80 L110 280 A100 30 0 0 0 310 280 L310 80', fill: f2 }, st)));
      svg.appendChild(S('ellipse', Object.assign({ cx: 210, cy: 80, rx: 100, ry: 30, fill: f1 }, st)));
      svg.appendChild(S('path', { d: 'M110 280 A100 30 0 0 1 310 280', fill: 'none', stroke: K, 'stroke-width': 3, 'stroke-dasharray': '9 8', opacity: 0.7 }));
    } else if (s.art === 'kegel') {
      svg.appendChild(S('path', Object.assign({ d: 'M210 40 L310 285 A100 30 0 0 1 110 285 Z', fill: f2 }, st)));
      svg.appendChild(S('path', { d: 'M110 285 A100 30 0 0 1 310 285', fill: 'none', stroke: K, 'stroke-width': 3, 'stroke-dasharray': '9 8', opacity: 0.7 }));
    }
    if (s.ecken) ecken.forEach((p, k) => { svg.appendChild(S('circle', { cx: p[0], cy: p[1], r: 13, fill: '#F5BC48' })); svg.appendChild(B.text(p[0], p[1] + 1, String(k + 1), { groesse: 15, farbe: '#351A12' })); });
    return svg;
  };

  // ------------------------------------------------------------ K4-08 Figur auf dem Kästchenraster
  MW.szenen.figur = function (s) {
    const z = s.zelle || 52, svg = rasterSvg({ zeilen: s.zeilen, spalten: s.spalten }, z);
    const gesetzt = new Set(s.zellen);
    s.zellen.forEach(k => {
      const [r, c] = k.split(',').map(Number);
      svg.appendChild(S('rect', { x: 10 + c * z, y: 10 + r * z, width: z, height: z, fill: 'rgba(86,145,183,.30)' }));
    });
    if (s.reihen) {   // Kästchen je Reihe zählen
      const proReihe = {};
      s.zellen.forEach(k => { const [r] = k.split(',').map(Number); proReihe[r] = (proReihe[r] || 0) + 1; });
      Object.keys(proReihe).forEach(r => svg.appendChild(B.text(10 + s.spalten * z - 26, 10 + r * z + z / 2, String(proReihe[r]), { groesse: 26, farbe: MW.F.gelbText })));
    }
    // Umriss: jede Kante zwischen Figur und außen
    s.zellen.forEach(k => {
      const [r, c] = k.split(',').map(Number);
      const x = 10 + c * z, y = 10 + r * z;
      [[-1, 0, x, y, x + z, y], [1, 0, x, y + z, x + z, y + z], [0, -1, x, y, x, y + z], [0, 1, x + z, y, x + z, y + z]].forEach(([dr, dc, x1, y1, x2, y2]) => {
        if (gesetzt.has((r + dr) + ',' + (c + dc))) return;
        svg.appendChild(S('line', { x1, y1, x2, y2, stroke: K, 'stroke-width': 5, 'stroke-linecap': 'round' }));
        if (s.zaehleUmfang) svg.appendChild(S('circle', { cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, r: 5, fill: MW.F.gelbText }));
      });
    });
    return svg;
  };

  // ------------------------------------------------------------ K4-09 Diagramme
  MW.szenen.diagramm = function (s) {
    const n = s.werte.length;
    if (s.art === 'strich') {   // Strichliste
      const svg = B.box(760, 70 * n + 30);
      s.werte.forEach((v, k) => {
        const y = 20 + k * 70;
        const hell = s.markiert && s.markiert.indexOf(k) >= 0;
        if (hell) svg.appendChild(S('rect', { x: 8, y: y - 4, width: 744, height: 64, rx: 12, fill: 'rgba(245,188,72,.2)' }));
        svg.appendChild(B.emoji(50, y + 28, s.symbole[k], 46));
        svg.appendChild(S('line', { x1: 96, y1: y - 6, x2: 96, y2: y + 62, stroke: K, 'stroke-width': 3 }));
        for (let i = 0; i < v; i++) {
          const gruppe = Math.floor(i / 5), pos = i % 5, x = 125 + gruppe * 92 + pos * 16;
          if (pos < 4) svg.appendChild(S('line', { x1: x, y1: y + 6, x2: x, y2: y + 52, stroke: K, 'stroke-width': 5, 'stroke-linecap': 'round' }));
          else svg.appendChild(S('line', { x1: x - 70, y1: y + 46, x2: x + 4, y2: y + 12, stroke: K, 'stroke-width': 5, 'stroke-linecap': 'round' }));
        }
      });
      return svg;
    }
    const W = 760, H = 420, L = 70, R = W - 20, T = 20, Bt = H - 80;
    const svg = B.box(W, H);
    const max = s.max, schritt = s.schritt;
    const y = v => Bt - v / max * (Bt - T);
    for (let v = 0; v <= max; v += schritt) {
      svg.appendChild(S('line', { x1: L, y1: y(v), x2: R, y2: y(v), stroke: K, 'stroke-width': v === 0 ? 4 : 1.5, opacity: v === 0 ? 1 : 0.4 }));
      svg.appendChild(B.text(L - 18, y(v), String(v), { groesse: 22, anker: 'end' }));
    }
    svg.appendChild(S('line', { x1: L, y1: T - 10, x2: L, y2: Bt, stroke: K, 'stroke-width': 4 }));
    const bw = (R - L) / n;
    s.werte.forEach((v, k) => {
      const x = L + k * bw + bw * 0.22, w = bw * 0.56;
      const hell = s.markiert && s.markiert.indexOf(k) >= 0;
      svg.appendChild(S('rect', { x, y: y(v), width: w, height: Bt - y(v), fill: hell ? '#F5BC48' : ['#7FB2D6', '#EE9A8A', '#8FCB9F', '#F5BC48', '#C4A6E0'][k % 5], stroke: K, 'stroke-width': 3 }));
      if (hell) svg.appendChild(S('line', { x1: L, y1: y(v), x2: x, y2: y(v), stroke: '#F5BC48', 'stroke-width': 4, 'stroke-dasharray': '10 7' }));
      svg.appendChild(B.emoji(x + w / 2, Bt + 40, s.symbole[k], 44));
    });
    return svg;
  };

  // ------------------------------------------------------------ K4-10 Zufall: Glücksrad, Würfel, Säckchen
  const FARBE = { rot: '#E8705A', blau: '#5691B7', gelb: '#F5BC48', gruen: '#6DB07A' };
  function rad(svg, cx, cy, r, felder, markiert) {
    const n = felder.length;
    felder.forEach((f, k) => {
      const a1 = k / n * 2 * Math.PI - Math.PI / 2, a2 = (k + 1) / n * 2 * Math.PI - Math.PI / 2;
      const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)], p2 = [cx + r * Math.cos(a2), cy + r * Math.sin(a2)];
      svg.appendChild(S('path', { d: `M${cx} ${cy} L${p1[0]} ${p1[1]} A${r} ${r} 0 ${n === 1 ? 1 : 0} 1 ${p2[0]} ${p2[1]} Z`, fill: FARBE[f], stroke: markiert && markiert === f ? MW.F.gelbText : K, 'stroke-width': markiert && markiert === f ? 8 : 3 }));
    });
    if (n === 1) svg.appendChild(S('circle', { cx, cy, r, fill: FARBE[felder[0]], stroke: K, 'stroke-width': 3 }));
    svg.appendChild(S('circle', { cx, cy, r: 12, fill: K }));
    svg.appendChild(S('path', { d: `M${cx} ${cy - r - 26} l-14 -22 h28 Z`, fill: K, transform: `rotate(180 ${cx} ${cy - r - 26})` }));
  }
  MW.szenen.zufall = function (s) {
    if (s.art === 'rad') { const svg = B.box(400, 400); rad(svg, 200, 215, 160, s.felder, s.markiert); return svg; }
    if (s.art === 'zweiRaeder') {
      const svg = B.box(800, 400);
      rad(svg, 200, 215, 150, s.links, s.markiert); rad(svg, 600, 215, 150, s.rechts, s.markiert);
      return svg;
    }
    if (s.art === 'wuerfel') { const d = el('div', { style: { height: '100%', aspectRatio: '1' } }); d.appendChild(B.wuerfel(s.zeigt || 5)); return d; }
    // Säckchen mit Kugeln
    const svg = B.box(420, 400);
    svg.appendChild(S('path', { d: 'M110 140 Q70 380 210 385 Q350 380 310 140 Z', fill: 'rgba(192,138,90,.55)', stroke: K, 'stroke-width': 4 }));
    svg.appendChild(S('path', { d: 'M120 140 Q210 110 300 140', fill: 'none', stroke: K, 'stroke-width': 4 }));
    s.kugeln.forEach((f, k) => {
      const c = k % 4, r = Math.floor(k / 4);
      svg.appendChild(S('circle', { cx: 150 + c * 40 + (r % 2) * 18, cy: 330 - r * 40, r: 18, fill: FARBE[f], stroke: s.markiert === f ? MW.F.gelbText : '#351A12', 'stroke-width': s.markiert === f ? 6 : 2 }));
    });
    return svg;
  };

})(window.MW);
