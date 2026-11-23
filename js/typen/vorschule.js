/* Mathewolf – Aufgabentypen der Vorschule */
'use strict';
(function (MW) {
  const el = MW.el, S = MW.svg, B = MW.bild;
  const aktuell = b => MW.spiel.akt && MW.spiel.akt.b === b;

  // ------------------------------------------------------------ V-01 Wie viele? – Dinge antippen zum Mitzählen, Karte wählen
  MW.typen.zaehlen = {
    aufbau(a, b) {
      const svg = B.box(800, 560);
      let gezaehlt = 0;
      a.positionen.forEach(p => {
        const g = S('g', { style: 'cursor:pointer' });
        g.appendChild(S('circle', { cx: p.x, cy: p.y, r: p.groesse * 0.62, fill: 'transparent' }));
        g.appendChild(B.emoji(p.x, p.y, a.symbol, p.groesse));
        g.addEventListener('click', () => {
          if (g.dataset.n) return;
          gezaehlt++; g.dataset.n = gezaehlt;
          g.appendChild(S('circle', { cx: p.x + p.groesse * 0.42, cy: p.y - p.groesse * 0.42, r: 19, fill: '#F5BC48', stroke: '#351A12', 'stroke-width': 3 }));
          g.appendChild(B.text(p.x + p.groesse * 0.42, p.y - p.groesse * 0.42 + 1, String(gezaehlt), { groesse: 24, farbe: '#351A12' }));
          MW.audio.effekt('klick'); MW.audio.sag([gezaehlt]);
        });
        svg.appendChild(g);
      });
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      b.eingabe.appendChild(MW.zahlenkarten(1, 10, (z, k) => { b.zuletzt = k; b.antwort(0, z); }));
    },
    falsch: (a, i, w, b) => MW.typen.karten.falsch(a, i, w, b),
    richtig: (a, i, b) => MW.typen.karten.richtig(a, i, b),
    loesung: (a, i, b) => MW.typen.karten.loesung(a, i, b),
    loesungTeile: a => ['rahmen/loesung_zahl', a.loesung]
  };

  // ------------------------------------------------------------ Blitzblick: Bild kurz zeigen (V-02 Auswahl, K1-03 Ziffernblock)
  MW.typen.blitzblick = {
    aufbau(a, b) {
      const buehne = el('div.szene');
      const decke = el('div', { style: { fontSize: '90px', opacity: '.6' }, text: '👀' });
      buehne.appendChild(decke);
      b.tafel.appendChild(buehne);
      const zeige = async () => {
        MW.leeren(buehne);
        const bild = MW.rechenbild(a.bild);
        buehne.appendChild(bild);
        await MW.warte(a.dauer || 2000);
        if (!aktuell(b) || b.dauerhaft) return;
        MW.leeren(buehne); buehne.appendChild(el('div', { style: { fontSize: '90px', opacity: '.6' }, text: '❓' }));
      };
      b.zeige = zeige;
      b.buehne = buehne;
      const nochmal = MW.knopf('👁 Nochmal zeigen', 'gelb', () => zeige(), 'hinweis-knopf');
      if (a.eingabeArt === 'ziffern') {
        const f = b.felder();
        const box = el('div.term.mittel', el('span.text', { text: 'Anzahl:' }));
        const e = el('span'); box.appendChild(e); f.feld(e, { item: 0, max: 2 });
        b.tafel.appendChild(box);
        b.eingabe.appendChild(nochmal);
        b.eingabe.appendChild(MW.ziffernblock(f));
        f.aktiviere(f.liste[0]);
      } else {
        b.eingabe.appendChild(nochmal);
        const opts = a.optionen.map(o => ({ wert: o, inhalt: String(o) }));
        b.optionen = opts;
        b.eingabe.appendChild(MW.auswahlKacheln(opts, (w, k) => { b.zuletzt = k; b.antwort(0, w); }, { spalten: opts.length === 3 ? 3 : 2 }));
      }
      (async () => {
        await MW.audio.sag(a.frage);
        if (!aktuell(b)) return;
        await MW.warte(200);
        if (aktuell(b)) zeige();
      })();
    },
    ansage: a => a.frage,
    falsch(a, i, w, b) { if (b.f) { b.f.leere(0); b.f.aktiviere(b.f.liste[0]); } else MW.typen.auswahl.falsch(a, i, w, b); },
    richtig(a, i, b) { if (b.f) b.f.sperren(0, 'richtig'); else MW.typen.auswahl.richtig(a, i, b); b.dauerhaft = true; MW.leeren(b.buehne); b.buehne.appendChild(MW.rechenbild(a.bild)); },
    loesung(a, i, b) {
      if (b.f) b.f.setze(b.f.liste[0], a.loesung, 'loesung'); else MW.typen.auswahl.loesung(a, i, b);
      b.dauerhaft = true; MW.leeren(b.buehne); b.buehne.appendChild(MW.rechenbild(a.bild));
    },
    hilfe(a, i, b) { return MW.rechenbild(a.hilfeBild || a.bild); },
    loesungTeile: a => ['rahmen/loesung_zahl', a.loesung]
  };

  // ------------------------------------------------------------ V-03 Mehr oder weniger? – Gruppe antippen, dann OK
  MW.typen.mengenVergleich = {
    aufbau(a, b) {
      const svg = B.box(820, 440);
      const gruppe = (ox, n, seite) => {
        const g = S('g', { style: 'cursor:pointer' });
        const rahmen = S('rect', { x: ox, y: 20, width: 330, height: 400, rx: 26, fill: MW.F.zart, stroke: MW.F.linie, 'stroke-width': 4, 'stroke-dasharray': '14 10' });
        g.appendChild(rahmen);
        for (let k = 0; k < n; k++) {
          const c = k % 3, r = Math.floor(k / 3);
          g.appendChild(B.emoji(ox + 70 + c * 95, 75 + r * 88, a.symbol, 64));
        }
        g.addEventListener('click', () => waehle(seite));
        svg.appendChild(g);
        return rahmen;
      };
      const links = gruppe(20, a.links, 'links'), rechts = gruppe(470, a.rechts, 'rechts');
      const gl = S('g', { style: 'cursor:pointer' });
      const glKreis = S('circle', { cx: 410, cy: 220, r: 46, fill: MW.F.zart, stroke: MW.F.linie, 'stroke-width': 4 });
      gl.appendChild(glKreis); gl.appendChild(B.text(410, 222, '=', { groesse: 64 }));
      gl.addEventListener('click', () => waehle('gleich'));
      svg.appendChild(gl);
      const rahmen = { links, rechts, gleich: glKreis };
      b.rahmen = rahmen;
      const ok = MW.knopf('OK', 'blau', () => { if (b.wahl) b.antwort(0, b.wahl); });
      ok.disabled = true;
      function waehle(seite) {
        if (b.gesperrt) return;
        MW.audio.effekt('klick');
        b.wahl = seite;
        Object.keys(rahmen).forEach(k => { rahmen[k].setAttribute('stroke', k === seite ? '#F5BC48' : MW.F.linie); rahmen[k].setAttribute('stroke-width', k === seite ? 9 : 4); });
        ok.disabled = false;
      }
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      b.eingabe.appendChild(el('div', { style: { fontSize: '24px', textAlign: 'center', maxWidth: '300px' }, text: 'Tippe eine Gruppe an oder das Gleich-Zeichen.' }));
      b.eingabe.appendChild(ok);
    },
    falsch(a, i, w, b) { const r = b.rahmen[w]; if (r) { r.setAttribute('stroke', MW.F.linie); r.setAttribute('stroke-width', 4); } b.wahl = null; b.eingabe.querySelector('.knopf').disabled = true; },
    richtig(a, i, b) { b.gesperrt = true; const r = b.rahmen[a.loesung]; r.setAttribute('stroke', MW.F.gruen); r.setAttribute('stroke-width', 10); },
    loesung(a, i, b) { b.gesperrt = true; Object.keys(b.rahmen).forEach(k => { b.rahmen[k].setAttribute('stroke', k === a.loesung ? MW.F.gruen : MW.F.zart3); b.rahmen[k].setAttribute('stroke-width', k === a.loesung ? 10 : 3); }); },
    hilfe(a) {
      // eins zu eins zuordnen: zwei Reihen untereinander
      const n = Math.max(a.links, a.rechts), svg = B.box(70 * n + 140, 200);
      for (let k = 0; k < a.links; k++) svg.appendChild(S('circle', { cx: 110 + k * 70, cy: 55, r: 24, fill: MW.F.rot }));
      for (let k = 0; k < a.rechts; k++) svg.appendChild(S('circle', { cx: 110 + k * 70, cy: 145, r: 24, fill: MW.F.blau }));
      for (let k = 0; k < Math.min(a.links, a.rechts); k++) svg.appendChild(S('line', { x1: 110 + k * 70, y1: 80, x2: 110 + k * 70, y2: 120, stroke: MW.F.linie, 'stroke-width': 4 }));
      svg.appendChild(B.text(40, 55, 'L', { groesse: 34 })); svg.appendChild(B.text(40, 145, 'R', { groesse: 34 }));
      return svg;
    },
    loesungTeile: () => ['rahmen/loesung_bild']
  };

  // ------------------------------------------------------------ V-05 Zahlenreihe – fehlende Zahl
  MW.typen.zahlenreihe = {
    aufbau(a, b) {
      const svg = B.box(860, 240);
      b.zellen = [];
      a.reihe.forEach((z, k) => {
        const x = 20 + k * 168;
        svg.appendChild(S('rect', { x, y: 40, width: 148, height: 150, rx: 18, fill: MW.F.zart, stroke: z === null ? '#F5BC48' : MW.F.linie, 'stroke-width': z === null ? 6 : 4, 'stroke-dasharray': z === null ? '14 10' : 'none' }));
        const t = B.text(x + 74, 118, z === null ? '?' : String(z), { groesse: 84, farbe: z === null ? MW.F.gelbText : MW.F.tinte });
        svg.appendChild(t);
        if (z === null) b.luecke = t;
      });
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      b.eingabe.appendChild(MW.zahlenkarten(1, a.max, (z, k) => { b.zuletzt = k; b.antwort(0, z); }));
    },
    falsch: (a, i, w, b) => MW.typen.karten.falsch(a, i, w, b),
    richtig(a, i, b) { MW.typen.karten.richtig(a, i, b); b.luecke.textContent = String(a.loesung); b.luecke.setAttribute('fill', MW.F.gruen); },
    loesung(a, i, b) { MW.typen.karten.loesung(a, i, b); b.luecke.textContent = String(a.loesung); b.luecke.setAttribute('fill', MW.F.rot); },
    loesungTeile: a => ['rahmen/loesung_zahl', a.loesung]
  };

  // ------------------------------------------------------------ V-06 Formen finden – alle passenden antippen, dann OK
  MW.formSVG = function (form, x, y, gr, farbe, drehung, attrs) {
    const st = Object.assign({ fill: farbe, stroke: '#351A12', 'stroke-width': 4, 'stroke-linejoin': 'round' }, attrs || {});
    if (form === 'kreis') return S('circle', Object.assign({ cx: x, cy: y, r: gr / 2 }, st));
    if (form === 'quadrat') return S('rect', Object.assign({ x: x - gr / 2, y: y - gr / 2, width: gr, height: gr, transform: `rotate(${drehung || 0} ${x} ${y})` }, st));
    if (form === 'rechteck') return S('rect', Object.assign({ x: x - gr * 0.65, y: y - gr * 0.36, width: gr * 1.3, height: gr * 0.72, transform: `rotate(${drehung || 0} ${x} ${y})` }, st));
    if (form === 'dreieck') { const h = gr * 0.9; return S('path', Object.assign({ d: `M${x} ${y - h * 0.6} L${x + gr * 0.58} ${y + h * 0.42} L${x - gr * 0.58} ${y + h * 0.42} Z`, transform: `rotate(${drehung || 0} ${x} ${y})` }, st)); }
    if (form === 'stern') {
      let d = ''; for (let k = 0; k < 10; k++) { const r = k % 2 ? gr * 0.24 : gr * 0.55, w = Math.PI / 5 * k - Math.PI / 2; d += (k ? 'L' : 'M') + (x + r * Math.cos(w)).toFixed(1) + ' ' + (y + r * Math.sin(w)).toFixed(1); }
      return S('path', Object.assign({ d: d + 'Z' }, st));
    }
    return null;
  };
  MW.typen.formen = {
    aufbau(a, b) {
      const svg = B.box(820, 460);
      b.gewaehlt = new Set(); b.formEls = [];
      a.formen.forEach((f, k) => {
        const g = S('g', { style: 'cursor:pointer' });
        const form = MW.formSVG(f.form, f.x, f.y, f.gr, f.farbe, f.drehung);
        const ring = S('circle', { cx: f.x, cy: f.y, r: f.gr * 0.78, fill: 'none', stroke: '#F5BC48', 'stroke-width': 7, opacity: 0, 'stroke-dasharray': '10 7' });
        g.appendChild(S('circle', { cx: f.x, cy: f.y, r: f.gr * 0.7, fill: 'transparent' }));
        g.appendChild(form); g.appendChild(ring);
        g.addEventListener('click', () => {
          if (b.gesperrt) return;
          MW.audio.effekt('klick');
          if (b.gewaehlt.has(k)) { b.gewaehlt.delete(k); ring.setAttribute('opacity', 0); }
          else { b.gewaehlt.add(k); ring.setAttribute('opacity', 1); }
          ok.disabled = b.gewaehlt.size === 0;
        });
        b.formEls.push({ ring, f });
        svg.appendChild(g);
      });
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      const ok = MW.knopf('OK', 'blau', () => b.antwort(0, Array.from(b.gewaehlt).sort((x, y) => x - y)));
      ok.disabled = true; b.ok = ok;
      b.eingabe.appendChild(ok);
    },
    pruefe: (a, i, wert) => MW.gleich(wert, a.loesung),
    falsch(a, i, w, b) { b.gewaehlt.clear(); b.formEls.forEach(x => x.ring.setAttribute('opacity', 0)); b.ok.disabled = true; },
    richtig(a, i, b) { b.gesperrt = true; b.formEls.forEach((x, k) => { if (a.loesung.indexOf(k) >= 0) { x.ring.setAttribute('stroke', MW.F.gruen); x.ring.setAttribute('opacity', 1); x.ring.removeAttribute('stroke-dasharray'); } }); b.ok.disabled = true; },
    loesung(a, i, b) { b.gesperrt = true; b.formEls.forEach((x, k) => { const ja = a.loesung.indexOf(k) >= 0; x.ring.setAttribute('stroke', ja ? MW.F.gruen : MW.F.linie); x.ring.setAttribute('opacity', ja ? 1 : 0); x.ring.removeAttribute('stroke-dasharray'); }); b.ok.disabled = true; },
    hilfe(a) {
      const svg = B.box(760, 220);
      const zeigeEcken = (form, x, punkte) => {
        svg.appendChild(MW.formSVG(form, x, 110, 140, MW.F.zart2, 0, { stroke: MW.F.linie }));
        punkte.forEach(([px, py], k) => { svg.appendChild(S('circle', { cx: px, cy: py, r: 13, fill: '#F5BC48' })); svg.appendChild(B.text(px, py + 1, String(k + 1), { groesse: 18, farbe: '#351A12' })); });
      };
      if (a.ziel === 'kreis') { svg.appendChild(MW.formSVG('kreis', 380, 110, 170, MW.F.zart2, 0, { stroke: MW.F.linie })); svg.appendChild(B.text(600, 110, 'keine Ecken', { groesse: 32, farbe: MW.F.gelbText })); }
      else if (a.ziel === 'dreieck') { zeigeEcken('dreieck', 300, [[300, 34], [381, 169], [219, 169]]); svg.appendChild(B.text(560, 110, '3 Ecken', { groesse: 40, farbe: MW.F.gelbText })); }
      else { zeigeEcken('quadrat', 190, [[120, 40], [260, 40], [260, 180], [120, 180]]); zeigeEcken('rechteck', 420, [[329, 60], [511, 60], [511, 160], [329, 160]]); svg.appendChild(B.text(650, 110, '4 Ecken', { groesse: 40, farbe: MW.F.gelbText })); }
      return svg;
    },
    loesungTeile: () => ['rahmen/loesung_bild']
  };

  // ------------------------------------------------------------ V-07 Muster fortsetzen – Teil in die Lücke ziehen
  MW.typen.muster = {
    aufbau(a, b) {
      const n = a.reihe.length + 1, w = Math.min(130, 860 / n);
      const svg = B.box(n * w + 20, Math.max(140, w * 1.25));
      const my = Math.max(140, w * 1.25) / 2;
      a.reihe.forEach((t, k) => svg.appendChild(MW.formSVG(t.form, 10 + k * w + w / 2, my, w * 0.8, t.farbe)));
      const lx = 10 + a.reihe.length * w;
      b.slotRect = S('rect', { x: lx + 4, y: my - w * 0.5, width: w - 8, height: w, rx: 14, fill: MW.F.zart, stroke: '#F5BC48', 'stroke-width': 5, 'stroke-dasharray': '12 8' });
      svg.appendChild(b.slotRect);
      b.slotG = S('g'); svg.appendChild(b.slotG);
      b.slotXY = [lx + w / 2, my, w * 0.8];
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      b.musterSvg = svg;
      // Teile zum Ziehen
      const box = el('div', { style: { display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center' } });
      b.teile = a.optionen.map((o, k) => {
        const t = el('div', { style: { width: '104px', height: '104px', background: '#fff', borderRadius: '22px', boxShadow: '0 5px 0 #9E9592', display: 'flex', alignItems: 'center', justifyContent: 'center' }, dataset: { k } });
        const sv = B.box(100, 100); sv.appendChild(MW.formSVG(o.form, 50, 52, 66, o.farbe)); t.appendChild(sv);
        box.appendChild(t);
        return t;
      });
      b.eingabe.appendChild(el('div', { style: { fontSize: '24px', textAlign: 'center' }, text: 'Zieh das passende Teil in die Lücke.' }));
      b.eingabe.appendChild(box);
      // Ablage ist die Lücke auf der Tafel (als HTML-Element über dem SVG gemessen)
      const ablage = el('div', { style: { position: 'absolute', pointerEvents: 'none' } });
      s.style.position = 'relative'; s.appendChild(ablage);
      const passeAblage = () => {
        const r = b.slotRect.getBoundingClientRect(), rs = s.getBoundingClientRect();
        Object.assign(ablage.style, { left: (r.left - rs.left) + 'px', top: (r.top - rs.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
      };
      requestAnimationFrame(passeAblage); setTimeout(passeAblage, 300);
      function legeIn(k) {
        MW.leeren(b.slotG);
        const o = a.optionen[k];
        b.slotG.appendChild(MW.formSVG(o.form, b.slotXY[0], b.slotXY[1], b.slotXY[2], o.farbe));
      }
      b.legeIn = legeIn;
      const nimm = t => {
        if (b.gesperrt || t.dataset.fest === '1') return;
        const k = Number(t.dataset.k); b.zuletzt = t; legeIn(k); b.antwort(0, k);
      };
      // Ziehen in die Lücke – oder einfach antippen (es gibt nur eine Lücke)
      MW.ziehen({ teile: b.teile, ablagen: [ablage], onAblegen: t => nimm(t), onAntippen: t => { nimm(t); return true; } });
    },
    falsch(a, i, w, b) { MW.leeren(b.slotG); if (b.zuletzt) { b.zuletzt.style.opacity = '.35'; b.zuletzt.dataset.fest = '1'; } },
    richtig(a, i, b) { b.gesperrt = true; b.slotRect.setAttribute('stroke', MW.F.gruen); b.slotRect.removeAttribute('stroke-dasharray'); b.teile.forEach(t => { t.dataset.fest = '1'; }); },
    loesung(a, i, b) { b.legeIn(a.loesung); b.slotRect.setAttribute('stroke', MW.F.rot); b.teile.forEach(t => { t.dataset.fest = '1'; }); },
    hilfe(a) {
      const w = 90, n = a.reihe.length, svg = B.box(n * w + 40, 170);
      a.reihe.forEach((t, k) => svg.appendChild(MW.formSVG(t.form, 20 + k * w + w / 2, 85, w * 0.55, t.farbe)));
      for (let k = 0; k + a.einheit <= n; k += a.einheit) svg.appendChild(S('rect', { x: 20 + k * w + 4, y: 25, width: a.einheit * w - 8, height: 120, rx: 16, fill: 'none', stroke: '#F5BC48', 'stroke-width': 4 }));
      return svg;
    },
    loesungTeile: () => ['rahmen/loesung_bild']
  };
  // ------------------------------------------------------------ V-08 Wo ist was? – Ding antippen, dann OK
  MW.typen.lage = {
    aufbau(a, b) {
      const svg = B.box(820, 470);
      MW.szenen.lageHintergrund(svg, a);
      b.marker = [];
      a.dinge.forEach((d, k) => {
        const g = S('g', { style: 'cursor:pointer' });
        if (d.hinten) g.setAttribute('opacity', 0.98);
        const ring = S('circle', { cx: d.x, cy: d.y, r: d.gr * 0.66, fill: 'transparent', stroke: '#F5BC48', 'stroke-width': 7, opacity: 0 });
        g.appendChild(ring);
        g.appendChild(B.emoji(d.x, d.y, d.symbol, d.gr));
        g.addEventListener('click', () => {
          if (b.gesperrt) return;
          MW.audio.effekt('klick');
          b.wahl = k; b.marker.forEach((r, j) => r.setAttribute('opacity', j === k ? 1 : 0)); ok.disabled = false;
        });
        b.marker.push(ring);
        (d.hinten ? svg.querySelector('.hinten') : svg.querySelector('.vorne')).appendChild(g);
      });
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      const ok = MW.knopf('OK', 'blau', () => { if (b.wahl !== undefined) b.antwort(0, b.wahl); });
      ok.disabled = true; b.ok = ok;
      b.eingabe.appendChild(ok);
    },
    falsch(a, i, w, b) { b.marker.forEach(r => r.setAttribute('opacity', 0)); b.wahl = undefined; b.ok.disabled = true; },
    richtig(a, i, b) { b.gesperrt = true; b.marker[a.loesung].setAttribute('stroke', MW.F.gruen); b.ok.disabled = true; },
    loesung(a, i, b) { b.gesperrt = true; b.marker.forEach((r, j) => { r.setAttribute('opacity', j === a.loesung ? 1 : 0); r.setAttribute('stroke', MW.F.gruen); }); b.ok.disabled = true; },
    hilfe(a) {
      const svg = B.box(820, 470);
      MW.szenen.lageHintergrund(svg, a);
      const z = a.zone;
      svg.appendChild(S('rect', { x: z[0], y: z[1], width: z[2], height: z[3], rx: 20, fill: 'rgba(245,188,72,.18)', stroke: '#F5BC48', 'stroke-width': 5, 'stroke-dasharray': '14 9' }));
      return svg;
    },
    loesungTeile: () => ['rahmen/loesung_bild']
  };
  // Hintergrund: Tisch oder zwei Kisten (Kreidezeichnung)
  MW.szenen.lageHintergrund = function (svg, a) {
    const k = MW.F.linie;
    svg.appendChild(S('line', { x1: 20, y1: 420, x2: 800, y2: 420, stroke: k, 'stroke-width': 4, opacity: 0.6 }));
    const hinten = S('g', { class: 'hinten' }); svg.appendChild(hinten);
    if (a.ort === 'tisch') {
      svg.appendChild(S('rect', { x: 250, y: 250, width: 320, height: 26, rx: 6, fill: '#9B6437', stroke: k, 'stroke-width': 4 }));
      svg.appendChild(S('rect', { x: 275, y: 276, width: 22, height: 144, fill: '#9B6437', stroke: k, 'stroke-width': 4 }));
      svg.appendChild(S('rect', { x: 523, y: 276, width: 22, height: 144, fill: '#9B6437', stroke: k, 'stroke-width': 4 }));
    } else if (a.ort === 'kiste') {
      svg.appendChild(S('rect', { x: 290, y: 250, width: 240, height: 170, rx: 8, fill: '#C08A5A', stroke: k, 'stroke-width': 4 }));
      svg.appendChild(S('line', { x1: 290, y1: 300, x2: 530, y2: 300, stroke: '#6F4424', 'stroke-width': 4 }));
    } else {   // zwei Kisten
      [[150, 270], [520, 270]].forEach(([x, y]) => {
        svg.appendChild(S('rect', { x, y, width: 150, height: 150, rx: 8, fill: '#C08A5A', stroke: k, 'stroke-width': 4 }));
        svg.appendChild(S('line', { x1: x, y1: y + 40, x2: x + 150, y2: y + 40, stroke: '#6F4424', 'stroke-width': 4 }));
      });
    }
    const vorne = S('g', { class: 'vorne' }); svg.appendChild(vorne);
  };

  // ------------------------------------------------------------ V-09 Der Größe nach – durch Ziehen tauschen, dann OK
  MW.typen.ordnen = {
    aufbau(a, b) {
      b.ordnung = a.start.slice();   // Indizes der Dinge an den Plätzen
      const huelle = el('div.szene');
      const box = el('div', { style: { display: 'flex', flexDirection: a.art === 'stifte' ? 'column' : 'row', gap: a.art === 'stifte' ? '14px' : '18px', alignItems: a.art === 'stifte' ? 'flex-start' : 'flex-end', justifyContent: 'center', padding: '6px 10px' } });
      huelle.appendChild(box);
      b.box = box;
      b.tafel.appendChild(huelle);
      const ok = MW.knopf('OK', 'blau', () => b.antwort(0, b.ordnung.map(k => a.groessen[k])));
      b.ok = ok;
      zeichne();
      function zeichne() {
        MW.leeren(box);
        b.plaetze = b.ordnung.map((k, platz) => {
          const g = a.groessen[k];
          const p = el('div', { dataset: { platz }, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', padding: '4px' } });
          p.appendChild(a.art === 'stifte' ? stift(g, a.farben[k]) : turm(g, a.farben[k]));
          box.appendChild(p);
          return p;
        });
        b.zieh = MW.ziehen({
          teile: b.plaetze, ablagen: b.plaetze,
          onAblegen: (t, z) => { tausche(Number(t.dataset.platz), Number(z.dataset.platz)); },
          onAntippen: t => {
            if (b.gesperrt) return true;
            const p = Number(t.dataset.platz);
            if (b.erster === undefined) { b.erster = p; t.style.outline = '5px dashed #F5BC48'; return true; }
            const e = b.erster; b.erster = undefined; tausche(e, p); return true;
          }
        });
      }
      function tausche(x, y) {
        if (b.gesperrt || x === y) { zeichne(); return; }
        const t = b.ordnung[x]; b.ordnung[x] = b.ordnung[y]; b.ordnung[y] = t; zeichne();
      }
      b.zeichne = zeichne;
      function stift(laenge, farbe) {
        const w = 60 + laenge * 62, svg = MW.svg('svg', { viewBox: `0 0 ${w + 20} 60`, width: (w + 20) * 0.78, height: 60 * 0.78 + 6 });
        svg.appendChild(S('rect', { x: 4, y: 12, width: w - 40, height: 36, rx: 6, fill: farbe, stroke: '#351A12', 'stroke-width': 3 }));
        svg.appendChild(S('path', { d: `M${w - 36} 12 L${w + 8} 30 L${w - 36} 48 Z`, fill: '#F6D3B3', stroke: '#351A12', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
        svg.appendChild(S('path', { d: `M${w - 6} 26 L${w + 8} 30 L${w - 6} 34 Z`, fill: farbe }));
        return svg;
      }
      function turm(hoehe, farbe) {
        const svg = MW.svg('svg', { viewBox: `0 0 80 ${hoehe * 44 + 8}`, width: 76, height: (hoehe * 44 + 8) * 0.95 });
        for (let k = 0; k < hoehe; k++) svg.appendChild(S('rect', { x: 4, y: 4 + k * 44, width: 72, height: 42, rx: 6, fill: farbe, stroke: '#351A12', 'stroke-width': 3 }));
        return svg;
      }
      b.eingabe.appendChild(el('div', { style: { fontSize: '24px', textAlign: 'center', maxWidth: '320px' }, text: 'Zieh ein Teil auf ein anderes, dann tauschen sie die Plätze.' }));
      b.eingabe.appendChild(ok);
    },
    pruefe(a, i, wert) { return MW.gleich(wert, wert.slice().sort((x, y) => x - y)); },
    falsch(a, i, w, b) { b.box.classList.remove('wackeln'); void b.box.offsetWidth; b.box.classList.add('wackeln'); },
    richtig(a, i, b) { b.gesperrt = true; b.ok.disabled = true; b.plaetze.forEach(p => { p.style.outline = '4px solid ' + MW.F.gruen; }); },
    loesung(a, i, b) {
      b.gesperrt = true; b.ok.disabled = true;
      b.ordnung = a.groessen.map((g, k) => k).sort((x, y) => a.groessen[x] - a.groessen[y]);
      b.zeichne(); b.plaetze.forEach(p => { p.style.outline = '4px solid ' + MW.F.rot; });
    },
    hilfe(a) {
      return MW.bild.zeilen([a.art === 'stifte' ? 'Der kürzeste Stift kommt nach oben.' : 'Der kleinste Turm kommt nach links.', { text: 'Vergleiche immer zwei.', farbe: 'gelb' }], { groesse: 36 });
    },
    loesungTeile: () => ['rahmen/loesung_bild']
  };

  // ------------------------------------------------------------ V-10 Dazu und weg – Bildgeschichte, Karte 0–10
  MW.typen.geschichte = {
    aufbau(a, b) {
      const svg = B.box(820, 470);
      const k = MW.F.linie;
      if (a.thema === 'voegel') {
        svg.appendChild(S('path', { d: 'M30 300 Q400 270 790 300', stroke: '#9B6437', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }));
        svg.appendChild(S('path', { d: 'M640 290 q30 -40 70 -40', stroke: '#9B6437', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }));
      } else {
        svg.appendChild(S('path', { d: 'M180 300 L640 300 L590 440 L230 440 Z', fill: '#C08A5A', stroke: k, 'stroke-width': 4 }));
        svg.appendChild(S('path', { d: 'M260 300 Q410 170 560 300', fill: 'none', stroke: '#C08A5A', 'stroke-width': 12 }));
      }
      const plaetze = [];
      const n = a.start + (a.art === 'dazu' ? a.aenderung : 0);
      for (let i = 0; i < n; i++) {
        if (a.thema === 'voegel') plaetze.push([70 + i * 75, 258]);
        else { const c = i % 5, r = Math.floor(i / 5); plaetze.push([275 + c * 68, 274 - r * 56]); }
      }
      const symbol = a.thema === 'voegel' ? '🐦' : '🍎';
      const dinge = plaetze.map(([x, y], i) => {
        const t = B.emoji(x, y, symbol, a.thema === 'voegel' ? 64 : 60);
        t.style.transition = 'transform .9s ease, opacity .9s ease';
        svg.appendChild(t);
        return t;
      });
      const s = el('div.szene'); s.appendChild(svg); b.tafel.appendChild(s);
      const neu = a.art === 'dazu' ? dinge.slice(a.start) : [];
      const weg = a.art === 'weg' ? dinge.slice(a.start - a.aenderung, a.start) : [];
      neu.forEach(t => { t.style.opacity = '0'; t.style.transform = 'translate(260px,-220px)'; });
      b.zeigeAenderung = () => {
        neu.forEach(t => { t.style.opacity = '1'; t.style.transform = 'none'; });
        weg.forEach(t => { t.style.transform = a.thema === 'voegel' ? 'translate(-200px,-260px)' : 'translate(0,-240px)'; t.style.opacity = '0'; });
      };
      b.eingabe.appendChild(MW.zahlenkarten(0, 10, (z, kn) => { b.zuletzt = kn; b.antwort(0, z); }));
      (async () => {
        await MW.audio.sag(a.teil1);
        if (!aktuell(b)) return;
        b.zeigeAenderung();
        await MW.audio.sag(a.teil2);
        if (!aktuell(b)) return;
        MW.audio.sag(a.frage);
      })();
    },
    ansage: a => a.teil1.concat(a.teil2, a.frage),
    falsch: (a, i, w, b) => MW.typen.karten.falsch(a, i, w, b),
    richtig: (a, i, b) => MW.typen.karten.richtig(a, i, b),
    loesung: (a, i, b) => MW.typen.karten.loesung(a, i, b),
    loesungTeile: a => ['rahmen/loesung_zahl', a.loesung]
  };

})(window.MW);
