/* Mathewolf – Zahlenhaus, Zahlenmauer, Rechendreieck (jede Lücke ist ein eigener Prüf-Punkt) */
'use strict';
(function (MW) {
  const el = MW.el, S = MW.svg, B = MW.bild;

  // gemeinsame Teile: Ziffernblock unten, Lücken der Reihe nach
  function feldGruppe(b, onAktiv) { return b.felder({ onAktiv }); }

  // ------------------------------------------------------------ Zahlenhaus
  // a.dach, a.stockwerke: [[links, rechts]], a.luecken: [{stock, seite}] → loesungen
  MW.typen.zahlenhaus = {
    aufbau(a, b) {
      let ersteAktivierung = true;
      const f = feldGruppe(b, fe => {
        if (ersteAktivierung) { ersteAktivierung = false; return; }
        const l = a.luecken[fe.item], st = a.stockwerke[l.stock], bekannt = st[1 - l.seite];
        MW.audio.sag(l.seite === 0 ? ['woerter/wie_viel', 'woerter/plus', bekannt, 'woerter/gleich', a.dach] : [bekannt, 'woerter/plus', 'woerter/wie_viel', 'woerter/gleich', a.dach]);
      });
      const box = el('div.haus-box');
      box.style.setProperty('--stockwerke', a.stockwerke.length);
      const dach = el('div.haus-dach');
      const svg = S('svg', { viewBox: '0 0 420 115', preserveAspectRatio: 'none' });
      svg.appendChild(S('path', { d: 'M8 112 L210 6 L412 112 Z', fill: 'rgba(245,188,72,.12)', stroke: MW.F.linie, 'stroke-width': 4, 'stroke-linejoin': 'round' }));
      dach.appendChild(svg); dach.appendChild(el('div.dachzahl', { text: String(a.dach) }));
      box.appendChild(dach);
      a.stockwerke.forEach((st, s) => {
        const stock = el('div.haus-stock');
        [0, 1].forEach(seite => {
          const z = el('div.haus-zelle');
          const li = a.luecken.findIndex(l => l.stock === s && l.seite === seite);
          if (li >= 0) { const e = el('span'); z.appendChild(e); f.feld(e, { item: li, max: 2, ordnung: li }); }
          else z.appendChild(el('span', { text: String(st[seite]) }));
          stock.appendChild(z);
        });
        box.appendChild(stock);
      });
      b.tafel.appendChild(box);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.ersteOffene());
    },
    hilfe(a, i) {
      const l = a.luecken[i] || a.luecken[0], st = a.stockwerke[l.stock], bekannt = st[1 - l.seite];
      return MW.rechenbild({ typ: 'kombi', teile: [{ typ: 'feld', felder: a.dach > 10 ? 20 : 10, rot: bekannt, blau: a.dach - bekannt, flex: '1.3' }, { typ: 'zeilen', zeilen: [bekannt + ' + ? = ' + a.dach, { text: a.dach + ' − ' + bekannt + ' = ?', farbe: 'gelb' }], flex: '1' }] });
    },
    loesungTeile(a, i) { return ['rahmen/loesung_zahl', a.loesungen[i]]; }
  };

  // ------------------------------------------------------------ Zahlenmauer
  // a.reihen: [[Grundsteine], [..], .., [Deckstein]] (unten → oben), a.luecken: [{r, k}]
  MW.typen.zahlenmauer = {
    aufbau(a, b) {
      const f = feldGruppe(b);
      const box = el('div.mauer');
      box.style.setProperty('--reihen', a.reihen.length);
      a.reihen.forEach((reihe, r) => {
        const zeile = el('div.mauer-reihe');
        reihe.forEach((v, k) => {
          const stein = el('div.stein');
          const li = a.luecken.findIndex(l => l.r === r && l.k === k);
          if (li >= 0) { const e = el('span'); stein.appendChild(e); f.feld(e, { item: li, max: 4, ordnung: li }); }
          else stein.appendChild(el('span', { text: MW.fmt(v) }));
          zeile.appendChild(stein);
        });
        box.appendChild(zeile);
      });
      b.tafel.appendChild(box);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.ersteOffene());
    },
    hilfe(a, i) {
      const l = a.luecken[i] || a.luecken[0];
      const bekannt = (r, k) => { const li = a.luecken.findIndex(x => x.r === r && x.k === k); return li < 0 || (MW.spiel.akt && MW.spiel.akt.erledigt[li]); };
      const z = (r, k) => bekannt(r, k) ? MW.fmt(a.reihen[r][k]) : '?';
      // passende Regel: Stein mit den beiden darunter, oder unterer Stein mit Nachbar und dem darüber
      if (l.r > 0 && bekannt(l.r - 1, l.k) && bekannt(l.r - 1, l.k + 1)) return B.regelMauer(z(l.r - 1, l.k), z(l.r - 1, l.k + 1), '?');
      if (l.r + 1 < a.reihen.length) {
        if (l.k > 0 && bekannt(l.r, l.k - 1) && bekannt(l.r + 1, l.k - 1)) return B.regelMauer(z(l.r, l.k - 1), '?', z(l.r + 1, l.k - 1));
        if (l.k < a.reihen[l.r].length - 1 && bekannt(l.r, l.k + 1) && bekannt(l.r + 1, l.k)) return B.regelMauer('?', z(l.r, l.k + 1), z(l.r + 1, l.k));
      }
      return B.regelMauer('□', '□', '□ + □');
    },
    loesungTeile(a, i) { return ['rahmen/loesung_zahl', a.loesungen[i]]; }
  };

  // ------------------------------------------------------------ Rechendreieck
  // a.innen: [oben, links, rechts], a.aussen: [linke Seite (oben+links), rechte Seite (oben+rechts), unten (links+rechts)]
  // a.luecken: [{art: 'innen'|'aussen', k}]
  const POS = { innen: [[300, 205], [175, 425], [425, 425]], aussen: [[95, 250], [505, 250], [300, 555]] };
  MW.typen.rechendreieck = {
    aufbau(a, b) {
      const f = feldGruppe(b);
      const box = el('div.dreieck');
      const svg = S('svg', { viewBox: '0 0 600 590' });
      svg.appendChild(S('path', { d: 'M300 40 L560 500 L40 500 Z', fill: MW.F.zart, stroke: MW.F.linie, 'stroke-width': 5, 'stroke-linejoin': 'round' }));
      const cx = 300, cy = 347;
      [[170, 270], [430, 270], [300, 500]].forEach(([x, y]) => svg.appendChild(S('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: MW.F.linie, 'stroke-width': 4 })));
      box.appendChild(svg);
      ['innen', 'aussen'].forEach(art => a[art].forEach((v, k) => {
        const p = POS[art][k];
        const feld = el('div.d-feld' + (art === 'aussen' ? '.aussen' : ''), { style: { left: (p[0] / 6) + '%', top: (p[1] / 5.9) + '%' } });
        const li = a.luecken.findIndex(l => l.art === art && l.k === k);
        if (li >= 0) { const e = el('span'); feld.appendChild(e); f.feld(e, { item: li, max: 3, ordnung: li }); }
        else feld.appendChild(el('span', { text: String(v) }));
        box.appendChild(feld);
      }));
      b.tafel.appendChild(box);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.ersteOffene());
    },
    hilfe(a, i) {
      const l = a.luecken[i] || a.luecken[0];
      const NACHBARN = [[0, 1], [0, 2], [1, 2]];   // Außenfeld k = innen[x] + innen[y]
      const bek = (art, k) => { const li = a.luecken.findIndex(x => x.art === art && x.k === k); return li < 0 || (MW.spiel.akt && MW.spiel.akt.erledigt[li]); };
      let zeile = 'Innen + Innen = Außen';
      if (l.art === 'aussen') { const [x, y] = NACHBARN[l.k]; zeile = (bek('innen', x) ? a.innen[x] : '?') + ' + ' + (bek('innen', y) ? a.innen[y] : '?') + ' = ?'; }
      else {
        const k = NACHBARN.findIndex((n, j) => n.indexOf(l.k) >= 0 && bek('aussen', j) && bek('innen', n[0] === l.k ? n[1] : n[0]));
        if (k >= 0) { const anderes = NACHBARN[k][0] === l.k ? NACHBARN[k][1] : NACHBARN[k][0]; zeile = a.aussen[k] + ' − ' + a.innen[anderes] + ' = ?'; }
      }
      return B.zeilen(['Die Zahl außen ist die Summe', 'der beiden Innenfelder daneben.', { text: zeile, farbe: 'gelb' }], { groesse: 34, zeilenhoehe: 50 });
    },
    loesungTeile(a, i) { return ['rahmen/loesung_zahl', a.loesungen[i]]; }
  };

})(window.MW);
