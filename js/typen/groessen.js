/* Mathewolf – Größen: Geld und Zehner/Einer legen, Stellenwerttafel, Bilder für Geld, Preise und Uhr */
'use strict';
(function (MW) {
  const el = MW.el, S = MW.svg, B = MW.bild;

  // ------------------------------------------------------------ Szenen
  MW.szenen.geldReihe = function (s) {   // Münzen und Scheine nebeneinander
    const box = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: '8px' } });
    s.werte.forEach(w => { const d = el('div', { style: { height: w >= 5 ? '86px' : '78px', display: 'flex' } }); const g = B.geldstueck(w); g.style.width = 'auto'; g.style.height = '100%'; d.appendChild(g); box.appendChild(d); });
    return box;
  };
  MW.szenen.preise = function (s) {     // Dinge mit Preisschild
    const box = el('div', { style: { display: 'flex', gap: '28px', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' } });
    s.dinge.forEach(d => box.appendChild(el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
      el('div', { style: { fontSize: '76px', lineHeight: '1' }, text: d.symbol }),
      el('div', { style: { background: '#F5BC48', color: '#351A12', borderRadius: '12px', padding: '2px 14px', fontSize: '32px', fontWeight: '600' }, text: MW.fmt(d.preis) + ' €' }))));
    if (s.bezahlt) {
      const g = B.geldstueck(s.bezahlt); g.style.width = 'auto'; g.style.height = '86px';
      box.appendChild(el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, el('div', { style: { fontSize: '24px' }, text: 'bezahlt:' }), g));
    }
    return box;
  };
  MW.szenen.uhr = function (s) { const d = el('div', { style: { height: '100%', aspectRatio: '1', maxWidth: '100%' } }); d.appendChild(B.uhr(s.h, s.m)); return d; };
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
      b.eingabe.appendChild(el('div', { style: { fontSize: '22px', textAlign: 'center' }, text: a.quellen[0].art === 'geld' ? 'Tippe auf das Geld oder zieh es in das Feld.' : 'Tippe auf Zehner und Einer oder zieh sie in das Feld.' }));
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
      if (a.wortText) b.tafel.appendChild(el('div.frage-text', { text: a.wortText, style: { fontSize: '26px', opacity: '.85' } }));
      const tab = el('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${a.spalten.length}, 1fr)`, border: '4px solid ' + MW.F.linie, borderRadius: '10px', fontSize: 'clamp(28px, 8cqmin, 56px)', fontWeight: '600' } });
      a.spalten.forEach((s, k) => tab.appendChild(el('div', { text: s, style: { padding: '6px 18px', textAlign: 'center', borderBottom: '4px solid ' + MW.F.linie, borderLeft: k ? '3px solid ' + MW.F.linie : 'none', color: MW.F.blauText, fontSize: '.7em' } })));
      a.spalten.forEach((s, k) => {
        const z = el('div', { style: { padding: '10px 10px', display: 'flex', justifyContent: 'center', borderLeft: k ? '3px solid ' + MW.F.linie : 'none' } });
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
