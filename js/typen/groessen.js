/* Mathewolf – Größen: Geld und Zehner/Einer legen, Stellenwerttafel, Bilder für Geld, Preise und Uhr */
'use strict';
(function (MW) {
  const el = MW.el, S = MW.svg, B = MW.bild;

  // ------------------------------------------------------------ Szenen
  // Münzen und Scheine als ein Bild (ab vier Stück in zwei Reihen). Wird der Platz knapp,
  // wird das ganze Bild kleiner – Münzen und Scheine behalten ihre Größen zueinander.
  MW.szenen.geldReihe = function (s) {
    const werte = s.werte, reihen = s.reihen || (werte.length >= 4 ? 2 : 1);
    const proReihe = Math.ceil(werte.length / reihen), LUECKE = 12, H = 86;
    const mass = w => w >= 5 ? { b: 170 * H / 96, h: H } : { b: 78, h: 78 };
    const zeilen = [];
    for (let k = 0; k < werte.length; k += proReihe) zeilen.push(werte.slice(k, k + proReihe));
    const breiten = zeilen.map(z => z.reduce((summe, w) => summe + mass(w).b, 0) + (z.length - 1) * LUECKE);
    const W = Math.ceil(Math.max.apply(null, breiten)) + 8, HH = zeilen.length * H + (zeilen.length - 1) * LUECKE + 8;
    const svg = MW.svg('svg', { viewBox: `0 0 ${W} ${HH}`, preserveAspectRatio: 'xMidYMid meet', style: `width:100%;height:100%;max-width:${W}px;max-height:${HH}px` });
    zeilen.forEach((z, r) => {
      let x = (W - breiten[r]) / 2;
      z.forEach(w => {
        const m = mass(w), stueck = B.geldstueck(w);
        const vb = stueck.getAttribute('viewBox').split(' ').map(Number);
        const g = MW.svg('g', { transform: `translate(${x.toFixed(1)} ${(4 + r * (H + LUECKE) + (H - m.h) / 2).toFixed(1)}) scale(${(m.h / vb[3]).toFixed(4)})` });
        while (stueck.firstChild) g.appendChild(stueck.firstChild);
        svg.appendChild(g);
        x += m.b + LUECKE;
      });
    });
    return svg;
  };
  MW.szenen.preise = function (s) {     // Dinge mit Preisschild – Größen in app.css, sie passen sich der Karte an
    const box = el('div.preise');
    s.dinge.forEach(d => box.appendChild(el('div.preis-ding', el('div.p-symbol', { text: d.symbol }), el('div.p-schild', { text: MW.fmt(d.preis) + '\u00a0€' }))));
    if (s.bezahlt) {
      const g = B.geldstueck(s.bezahlt); g.removeAttribute('style'); g.classList.add('p-geld');
      box.appendChild(el('div.preis-ding', el('div.p-bezahlt', { text: 'bezahlt:' }), g));
    }
    return box;
  };
  MW.szenen.uhr = s => B.uhr(s.h, s.m);
  MW.szenen.zehnerEiner = s => B.zehnerEiner(s.z, s.e);

  // ------------------------------------------------------------ Legen: Teile antippen oder hineinziehen, OK prüft die Summe
  // a.quellen: [{wert, art: 'geld'|'zehner'|'einer'}], a.ziel, a.zielText
  function stueckBild(q, klein) {
    if (q.art === 'geld') { const g = B.geldstueck(q.wert); g.style.height = klein ? (q.wert >= 5 ? '70px' : '62px') : (q.wert >= 5 ? '64px' : '62px'); g.style.width = 'auto'; return g; }
    if (q.art === 'zehner') {
      const svg = MW.svg('svg', { viewBox: '0 0 34 262', style: `height:${klein ? 150 : 96}px;width:auto` });
      for (let k = 0; k < 10; k++) svg.appendChild(S('rect', { x: 4, y: 4 + k * 25.4, width: 26, height: 25, fill: '#8DB8D4', stroke: '#351A12', 'stroke-width': 2.5 }));
      return svg;
    }
    const svg = MW.svg('svg', { viewBox: '0 0 34 34', style: `height:${klein ? 34 : 40}px;width:auto` });
    svg.appendChild(S('rect', { x: 4, y: 4, width: 26, height: 26, fill: '#F5BC48', stroke: '#351A12', 'stroke-width': 2.5 }));
    return svg;
  }
  MW.typen.legen = {
    aufbau(a, b) {
      b.gelegt = [];
      b.tafel.appendChild(el('div.legen-ziel', { text: a.zielText }));
      const feld = el('div.legen-feld');
      b.feld = feld;
      b.tafel.appendChild(feld);
      const zeichne = () => {
        MW.leeren(feld);
        // sortiert anzeigen: große Werte zuerst
        b.gelegt.map((q, k) => ({ q, k })).sort((x, y) => y.q.wert - x.q.wert).forEach(({ q, k }) => {
          const st = el('div.gelegt', { title: 'zurücklegen' });
          st.appendChild(stueckBild(q, true));
          MW.tipp(st, () => { if (b.gesperrt) return; MW.audio.effekt('klick'); b.gelegt.splice(k, 1); zeichne(); });
          feld.appendChild(st);
        });
        ok.disabled = b.gelegt.length === 0 || b.gesperrt;
      };
      b.zeichne = zeichne;
      const quellen = el('div.quellen');
      const knoepfe = a.quellen.map(q => {
        const k = el('button.quelle', { type: 'button', 'aria-label': q.name || String(q.wert) });
        k.appendChild(stueckBild(q, false));
        quellen.appendChild(k);
        return { k, q };
      });
      const dazu = q => { if (b.gesperrt) return; if (b.gelegt.length >= 30) return; b.gelegt.push(q); zeichne(); };
      MW.ziehen({
        teile: knoepfe.map(x => x.k), ablagen: [feld],
        onAblegen: t => { dazu(knoepfe.find(x => x.k === t).q); },
        onAntippen: t => { dazu(knoepfe.find(x => x.k === t).q); return true; }
      });
      const ok = MW.knopf('OK', 'blau', () => b.antwort(0, b.gelegt.map(q => q.wert)));
      const weg = MW.knopf('↺', 'grau', () => { if (!b.gesperrt) { b.gelegt = []; zeichne(); } });
      weg.setAttribute('aria-label', 'Alles zurücklegen'); weg.style.minWidth = '90px';
      b.ok = ok;
      b.eingabe.appendChild(el('div.hinweis-text', { text: a.quellen[0].art === 'geld' ? 'Tippe auf das Geld oder zieh es in das Feld.' : 'Tippe auf Zehner und Einer oder zieh sie in das Feld.' }));
      b.eingabe.appendChild(quellen);
      b.eingabe.appendChild(el('div.ok-zeile', weg, ok));
      zeichne();
    },
    pruefe(a, i, werte) {
      const summe = werte.reduce((x, y) => x + y, 0);
      if (a.maxEiner !== undefined && werte.filter(w => w === 1).length > a.maxEiner) return false;
      return summe === a.ziel;
    },
    falsch(a, i, w, b) { b.feld.classList.remove('wackeln'); void b.feld.offsetWidth; b.feld.classList.add('wackeln'); b.gelegt = []; b.zeichne(); },
    richtig(a, i, b) { b.gesperrt = true; b.feld.classList.add('richtig'); b.ok.disabled = true; },
    loesung(a, i, b) { b.gesperrt = true; b.gelegt = a.zerlegung.map(w => a.quellen.find(q => q.wert === w)); b.zeichne(); b.ok.disabled = true; },
    hilfe(a) { return MW.rechenbild(a.bild); },
    loesungTeile(a) { return ['rahmen/loesung_bild']; }
  };

  // ------------------------------------------------------------ Stellenwerttafel: vorgelesene Zahl Ziffer für Ziffer eintragen
  MW.typen.stellenTafel = {
    aufbau(a, b) {
      const f = b.felder({ alleFelder: true });
      if (a.wortText) b.tafel.appendChild(el('div.frage-text.wort', { text: a.wortText }));
      const tab = el('div.stellen-tafel', { style: { gridTemplateColumns: `repeat(${a.spalten.length}, 1fr)` } });
      a.spalten.forEach(s => tab.appendChild(el('div.st-kopf', { text: s })));
      a.spalten.forEach((s, k) => {
        const z = el('div.st-feld');
        const e = el('span'); z.appendChild(e);
        f.feld(e, { item: 0, max: 1, auto: true, ordnung: k });
        tab.appendChild(z);
      });
      b.tafel.appendChild(tab);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.liste[0]);
    },
    falsch(a, i, w, b) {
      // nur die falschen Ziffern leeren
      const loes = a.loesung;
      b.f.liste.forEach((f, k) => { if (Number(f.wert) !== loes[k]) { f.el.classList.remove('falsch'); void f.el.offsetWidth; f.el.classList.add('falsch'); f.wert = ''; b.f.zeige(f); } });
      b.f.aktiviere(b.f.liste.find(f => f.wert === '') || b.f.liste[0]);
    },
    loesungTeile(a) { return ['rahmen/loesung_zahl', a.zahl]; }
  };

})(window.MW);
