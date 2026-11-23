/* Mathewolf – Eingabearten: Ziffernblock mit Antwortfeldern, Zahlenkarten, Auswahl, Ziehen, Schieber */
'use strict';
(function (MW) {
  const el = MW.el;

  // ------------------------------------------------------------ Antwortfelder + Ziffernblock
  // Eine Feldgruppe verwaltet alle Lücken einer Aufgabe. Jede Lücke gehört zu einem Prüf-Punkt (item).
  // Mehrere Felder können zu einem Item gehören (z. B. „Ergebnis“ und „Rest“); dann prüft OK alle zusammen.
  class Felder {
    constructor(opt) {
      this.opt = opt || {};
      this.liste = [];
      this.aktiv = null;
      this.okKnopf = null;
      this.onAktiv = this.opt.onAktiv || null;
    }
    feld(elm, opt) {
      opt = opt || {};
      const f = { el: elm, item: opt.item || 0, max: opt.max || 7, wert: '', fest: false, auto: !!opt.auto, ordnung: opt.ordnung === undefined ? this.liste.length : opt.ordnung, klein: !!opt.klein, optional: !!opt.optional };
      elm.classList.add('luecke');
      MW.tipp(elm, () => { if (!f.fest) { MW.audio.effekt('klick'); this.aktiviere(f); } });
      this.liste.push(f);
      return f;
    }
    aktiviere(f) {
      if (this.aktiv) this.aktiv.el.classList.remove('aktiv');
      this.aktiv = f || null;
      if (f) { f.el.classList.add('aktiv'); if (this.onAktiv) this.onAktiv(f); }
      this.aktualisiereOK();
    }
    ersteOffene(nachItem) {
      const offen = this.liste.filter(f => !f.fest && !f.optional).sort((a, b) => a.ordnung - b.ordnung);
      if (nachItem !== undefined) {
        const gleich = offen.find(f => f.item === nachItem && f.wert === '');
        if (gleich) return gleich;
      }
      return offen.find(f => f.wert === '') || offen[0] || null;
    }
    taste(z) {
      const f = this.aktiv;
      if (!f || f.fest) return;
      if (z === 'del') { f.wert = f.wert.slice(0, -1); }
      else {
        if (f.wert.length >= f.max) { if (f.max === 1) f.wert = ''; else return; }
        if (f.wert === '0' && f.max > 1) f.wert = '';
        f.wert += z;
      }
      this.zeige(f);
      if (z !== 'del' && f.auto && f.wert.length >= f.max) {
        // Fokus springt zur nächsten Stelle (schriftliches Rechnen)
        const offen = this.liste.filter(x => !x.fest && x.ordnung > f.ordnung).sort((a, b) => a.ordnung - b.ordnung);
        const naechstes = offen.find(x => x.wert === '' && !x.optional) || offen.find(x => x.wert === '');
        if (naechstes) this.aktiviere(naechstes);
      }
      this.aktualisiereOK();
    }
    zeige(f) { f.el.textContent = f.wert === '' ? '' : (f.max > 3 && f.wert.length > 3 ? MW.fmt(parseInt(f.wert, 10)) : f.wert); }
    setze(f, wert, klasse) {
      f.wert = String(wert); this.zeige(f);
      if (klasse) { f.fest = true; f.el.classList.remove('aktiv'); f.el.classList.add(klasse); }
    }
    leere(item) { this.liste.filter(f => f.item === item && !f.fest).forEach(f => { f.wert = ''; this.zeige(f); }); this.aktualisiereOK(); }
    leereFelder(felder) { felder.forEach(f => { if (!f.fest) { f.wert = ''; this.zeige(f); } }); this.aktualisiereOK(); }
    felderVon(item) { return this.liste.filter(f => f.item === item).sort((a, b) => a.ordnung - b.ordnung); }
    werte(item) { return this.felderVon(item).map(f => f.wert === '' ? null : parseInt(f.wert, 10)); }
    bereit() {
      const f = this.aktiv;
      if (!f || f.fest) return false;
      return f.wert !== '';
    }
    aktualisiereOK() { if (this.okKnopf) this.okKnopf.disabled = !this.bereit(); }
    ok() {
      if (!this.bereit()) return;
      const f = this.aktiv;
      const item = f.item;
      if (this.opt.alleFelder) {
        // erst alle Felder dieser Aufgabe ausfüllen: OK springt zum nächsten leeren Feld
        const leer = this.felderVon(item).filter(x => !x.fest && !x.optional && x.wert === '');
        if (leer.length) {
          const nach = leer.find(x => x.ordnung > f.ordnung) || leer[0];
          this.aktiviere(nach);
          nach.el.classList.remove('wackeln'); void nach.el.offsetWidth; nach.el.classList.add('wackeln');
          return;
        }
      }
      const werte = this.werte(item);
      const felder = this.felderVon(item);
      if (this.opt.onOK) this.opt.onOK(item, felder.length === 1 && !this.opt.alleFelder ? werte[0] : werte, felder);
    }
    sperren(item, klasse) { this.felderVon(item).forEach(f => { f.fest = true; f.el.classList.remove('aktiv'); if (klasse) f.el.classList.add(klasse); }); if (this.aktiv && this.aktiv.fest) this.aktiv = null; this.aktualisiereOK(); }
    alleFest() { return this.liste.filter(f => !f.optional).every(f => f.fest); }
  }
  MW.Felder = Felder;

  MW.ziffernblock = function (felder, opt) {
    opt = opt || {};
    const box = el('div.ziffernblock');
    const tasten = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    tasten.forEach(t => {
      const b = el('button', { type: 'button', 'aria-label': t === 'del' ? 'Löschen' : t === 'ok' ? 'OK' : t });
      if (t === 'del') { b.className = 'loeschen'; b.textContent = '⌫'; }
      else if (t === 'ok') { b.className = 'ok'; b.textContent = 'OK'; felder.okKnopf = b; }
      else b.textContent = t;
      // pointerdown für schnelles Tippen; click nur als Ersatz
      let gedrueckt = false;
      b.addEventListener('pointerdown', ev => { ev.preventDefault(); gedrueckt = true; druecken(); });
      b.addEventListener('click', ev => { ev.preventDefault(); if (!gedrueckt) druecken(); gedrueckt = false; });
      function druecken() {
        if (b.disabled) return;
        MW.audio.effekt('klick');
        if (t === 'ok') felder.ok();
        else felder.taste(t);
        if (opt.onTaste) opt.onTaste(t);
      }
      box.appendChild(b);
    });
    felder.aktualisiereOK();
    return box;
  };

  // ------------------------------------------------------------ Zahlenkarten (Vorschule)
  MW.zahlenkarten = function (von, bis, onWahl) {
    const n = bis - von + 1;
    const box = el('div.karten' + (n === 11 ? '.elf' : ''));
    for (let z = von; z <= bis; z++) {
      const b = el('button.karte', { type: 'button', text: String(z), 'aria-label': String(z) });
      MW.tipp(b, () => { MW.audio.effekt('klick'); onWahl(z, b); });
      box.appendChild(b);
    }
    return box;
  };

  // ------------------------------------------------------------ Auswahl-Kacheln
  // optionen: [{ wert, inhalt: Text oder Element, text: true für Wörter }]
  MW.auswahlKacheln = function (optionen, onWahl, opt) {
    opt = opt || {};
    const spalten = opt.spalten || (optionen.length === 3 ? 3 : 2);
    const box = el('div.auswahl' + (spalten === 3 ? '.drei' : spalten === 1 ? '.spalte' : ''));
    if (opt.breite) box.style.width = opt.breite;
    optionen.forEach(o => {
      const b = el('button.kachel-wahl' + (o.text ? '.text' : ''), { type: 'button' });
      if (o.inhalt instanceof Node) b.appendChild(o.inhalt); else b.textContent = String(o.inhalt);
      if (o.hoehe) b.style.minHeight = o.hoehe + 'px';
      o.el = b;
      MW.tipp(b, () => { if (b.classList.contains('aus')) return; MW.audio.effekt('klick'); onWahl(o.wert, b, o); });
      box.appendChild(b);
    });
    return box;
  };

  MW.knopf = function (text, farbe, fn, extra) {
    const b = el('button.knopf.' + (farbe || 'blau') + (extra ? '.' + extra : ''), { type: 'button', text });
    MW.tipp(b, () => { if (!b.disabled) { MW.audio.effekt('klick'); fn(b); } });
    return b;
  };

  // ------------------------------------------------------------ Ziehen und Ablegen
  // Ein Teil wird mit dem Finger gezogen und rastet in einer Ablage ein. Zusätzlich geht:
  // Teil antippen, dann Ablage antippen (für Kinder, denen Ziehen schwerfällt).
  MW.ziehen = function (opt) {
    // opt: { teile: [el], ablagen: [el], onAblegen(teil, ablage), onAntippen?(teil) }
    let gewaehlt = null;
    const ablagen = opt.ablagen;
    function waehle(t) {
      if (gewaehlt) gewaehlt.classList.remove('gewaehlt-teil');
      gewaehlt = t; if (t) t.classList.add('gewaehlt-teil');
    }
    opt.teile.forEach(t => anmelden(t));
    function anmelden(t) {
      t.classList.add('ziehbar');
      let start = null, geist = null, ueber = null, bewegt = false;
      t.addEventListener('pointerdown', ev => {
        if (t.dataset.fest === '1') return;
        ev.preventDefault();
        start = { x: ev.clientX, y: ev.clientY }; bewegt = false;
        try { t.setPointerCapture(ev.pointerId); } catch (e) { }
      });
      t.addEventListener('pointermove', ev => {
        if (!start) return;
        const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
        if (!bewegt && Math.hypot(dx, dy) < 8) return;
        if (!bewegt) {
          bewegt = true;
          geist = t.cloneNode(true); geist.classList.add('geist'); geist.classList.remove('ziehbar');
          const r = t.getBoundingClientRect();
          geist.style.width = r.width + 'px'; geist.style.height = r.height + 'px';
          document.body.appendChild(geist);
          t.classList.add('zieht'); t.style.opacity = '0.35';
        }
        geist.style.left = ev.clientX + 'px'; geist.style.top = ev.clientY + 'px';
        const z = trefferAblage(ev.clientX, ev.clientY);
        if (z !== ueber) { if (ueber) ueber.classList.remove('ueber'); ueber = z; if (z) z.classList.add('ueber'); }
      });
      const ende = ev => {
        if (!start) return;
        start = null;
        if (ueber) ueber.classList.remove('ueber');
        if (geist) { geist.remove(); geist = null; }
        t.classList.remove('zieht'); t.style.opacity = '';
        if (bewegt) {
          const z = trefferAblage(ev.clientX, ev.clientY);
          if (z) { MW.audio.effekt('klick'); opt.onAblegen(t, z); }
          waehle(null);
        } else {
          // Antippen: auswählen bzw. bei schon gewähltem Teil abwählen
          MW.audio.effekt('klick');
          if (opt.onAntippen && opt.onAntippen(t) === true) return;
          waehle(gewaehlt === t ? null : t);
        }
        ueber = null;
      };
      t.addEventListener('pointerup', ende);
      t.addEventListener('pointercancel', ev => { start = null; if (geist) { geist.remove(); geist = null; } t.classList.remove('zieht'); t.style.opacity = ''; if (ueber) ueber.classList.remove('ueber'); });
    }
    function trefferAblage(x, y) {
      for (const z of ablagen) {
        const r = z.getBoundingClientRect();
        const rand = 14;
        if (x >= r.left - rand && x <= r.right + rand && y >= r.top - rand && y <= r.bottom + rand) return z;
      }
      return null;
    }
    ablagen.forEach(z => {
      z.classList.add('ablage');
      z.addEventListener('click', () => {
        if (gewaehlt && gewaehlt !== z && !z.contains(gewaehlt)) { const t = gewaehlt; waehle(null); MW.audio.effekt('klick'); opt.onAblegen(t, z); }
      });
    });
    return { anmelden, abwaehlen: () => waehle(null), ablagen };
  };

  // ------------------------------------------------------------ Schieber am Zahlenstrahl
  // opt: { min, max, raster, beschriftung: [Zahlen], start, onOK(wert) }
  MW.schieber = function (opt) {
    const W = 1000, H = 230, L = 60, R = W - 60, Y = 120;
    const svg = MW.svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'schieber-svg', style: 'width:100%;height:100%;touch-action:none' });
    const x = v => L + (v - opt.min) / (opt.max - opt.min) * (R - L);
    // Strahl
    svg.appendChild(MW.svg('line', { x1: L - 20, y1: Y, x2: R + 30, y2: Y, stroke: MW.F.linie, 'stroke-width': 5, 'stroke-linecap': 'round' }));
    svg.appendChild(MW.svg('path', { d: `M${R + 30} ${Y - 12} L${R + 48} ${Y} L${R + 30} ${Y + 12} Z`, fill: MW.F.linie }));
    const schritte = Math.round((opt.max - opt.min) / opt.raster);
    for (let i = 0; i <= schritte; i++) {
      const v = opt.min + i * opt.raster;
      const lang = opt.lang && v % opt.lang === 0, mittel = opt.mittel && v % opt.mittel === 0;
      const h = lang ? 34 : mittel ? 24 : 13;
      svg.appendChild(MW.svg('line', { x1: x(v), y1: Y - h, x2: x(v), y2: Y + h, stroke: MW.F.linie, 'stroke-width': lang ? 4.5 : mittel ? 3.5 : 2.2 }));
    }
    const beschrG = MW.svg('g');
    svg.appendChild(beschrG);
    function beschriften(werte, farbe) {
      MW.leeren(beschrG);
      werte.forEach(v => beschrG.appendChild(MW.svg('text', { x: x(v), y: Y + 78, 'text-anchor': 'middle', 'font-size': opt.schrift || 38, fill: farbe || MW.F.tinte, 'font-family': 'Fredoka', 'font-weight': 600, text: MW.fmt(v) })));
    }
    beschriften(opt.beschriftung);
    // Knopf
    let wert = opt.start === undefined ? opt.min : opt.start;
    const knopf = MW.svg('g', { style: 'cursor:grab' });
    knopf.appendChild(MW.svg('path', { d: 'M0 -6 L-30 -46 Q-30 -70 0 -70 Q30 -70 30 -46 Z', fill: '#F5BC48', stroke: '#351A12', 'stroke-width': 4 }));
    knopf.appendChild(MW.svg('circle', { cx: 0, cy: -48, r: 10, fill: '#351A12' }));
    knopf.appendChild(MW.svg('rect', { x: -38, y: -80, width: 76, height: 110, fill: 'transparent' }));
    svg.appendChild(knopf);
    const marke = MW.svg('line', { x1: 0, y1: Y - 4, x2: 0, y2: Y + 40, stroke: '#F5BC48', 'stroke-width': 6, 'stroke-linecap': 'round' });
    svg.appendChild(marke);
    function zeichne() {
      knopf.setAttribute('transform', `translate(${x(wert)},${Y - 4})`);
      marke.setAttribute('x1', x(wert)); marke.setAttribute('x2', x(wert));
    }
    zeichne();
    function ausPunkt(clientX) {
      const r = svg.getBoundingClientRect();
      const sx = (clientX - r.left) / r.width * W;
      let v = opt.min + (sx - L) / (R - L) * (opt.max - opt.min);
      v = Math.round(v / opt.raster) * opt.raster;
      return Math.max(opt.min, Math.min(opt.max, v));
    }
    let zieht = false;
    svg.addEventListener('pointerdown', ev => { if (gesperrt) return; ev.preventDefault(); zieht = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) { } setze(ausPunkt(ev.clientX)); });
    svg.addEventListener('pointermove', ev => { if (zieht) setze(ausPunkt(ev.clientX)); });
    svg.addEventListener('pointerup', () => { zieht = false; });
    svg.addEventListener('pointercancel', () => { zieht = false; });
    let gesperrt = false, letzterTick = -1;
    function setze(v) {
      if (v === wert) return;
      wert = v; zeichne();
      const t = Date.now();
      if (t - letzterTick > 60) { MW.audio.effekt('klick'); letzterTick = t; }
    }
    const fein = el('div.feintasten',
      MW.tipp(el('button', { type: 'button', text: '−', 'aria-label': 'Minus' }), () => { if (!gesperrt) setze(Math.max(opt.min, wert - opt.raster)); }),
      MW.tipp(el('button', { type: 'button', text: '+', 'aria-label': 'Plus' }), () => { if (!gesperrt) setze(Math.min(opt.max, wert + opt.raster)); })
    );
    const ok = MW.knopf('OK', 'blau', () => { if (!gesperrt) opt.onOK(wert); });
    return {
      svg, fein, ok,
      get wert() { return wert; },
      setze: v => { wert = v; zeichne(); },
      sperren: v => { gesperrt = v !== false; ok.disabled = gesperrt; },
      beschriften,
      x,
      markiere(v, farbe) { svg.appendChild(MW.svg('circle', { cx: x(v), cy: Y, r: 12, fill: farbe || MW.F.gruen, stroke: '#351A12', 'stroke-width': 3 })); }
    };
  };

})(window.MW);
