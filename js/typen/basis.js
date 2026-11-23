/* Mathewolf – Grundtypen: Rechnung mit Lücken, Auswahl, Zahlenkarten, Bild + Ziffernblock, Zahlenstrahl-Schieber */
'use strict';
(function (MW) {
  const el = MW.el, B = MW.bild;

  // ------------------------------------------------------------ Rechenbilder nach Beschreibung
  MW.rechenbild = function (s) {
    if (!s) return null;
    if (s instanceof Node) return s;
    if (typeof s === 'function') return s();
    switch (s.typ) {
      case 'feld': return B.feld(s);
      case 'plaettchen': return B.plaettchen(s.n, s);
      case 'hunderter': return B.hunderterfeld(s);
      case 'zehnerEiner': return B.zehnerEiner(s.z, s.e, s);
      case 'zahlenstrahl': return B.zahlenstrahl(s);
      case 'rechenstrich': return B.rechenstrich(s.start, s.schritte, s);
      case 'punktefeld': return B.punktefeld(s.reihen, s.spalten, s);
      case 'stellenwert': return B.stellenwerttafel(s.spalten, s.werte, s);
      case 'zeilen': return B.zeilen(s.zeilen, s);
      case 'mauerRegel': return B.regelMauer(s.a, s.b, s.c);
      case 'uhr': { const d = el('div', { style: { height: '100%', aspectRatio: '1' } }); d.appendChild(B.uhr(s.h, s.m, { minuten: true, sektor: s.m > 0 })); return d; }
      case 'kombi': {
        const d = el('div', { style: { display: 'flex', gap: '18px', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' } });
        s.teile.forEach(t => { const w = el('div', { style: { flex: t.flex || '1', height: '100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } }); w.appendChild(MW.rechenbild(t)); d.appendChild(w); });
        return d;
      }
      case 'szene': return MW.szenen[s.name](s);
      case 'term': {   // Rechnung nur zum Anschauen, {frage: true} ist ein Kästchen mit Fragezeichen
        const box = el('div.term' + (s.groesse ? '.' + s.groesse : ''));
        s.teile.forEach(t => {
          if (t.z !== undefined) box.appendChild(el('span.zahl', { text: MW.fmt(t.z) }));
          else if (t.zt !== undefined) box.appendChild(el('span.zahl', { text: t.zt }));
          else if (t.o) box.appendChild(el('span.op', { text: t.o }));
          else if (t.t) box.appendChild(el('span.text', { text: t.t }));
          else if (t.frage) box.appendChild(el('span.luecke.aktiv', { text: '?' }));
        });
        return box;
      }
      default: return null;
    }
  };
  MW.szenen = {};   // Zeichnungen für die Tafel: name → function(daten) → Element

  // Zahl der Stellen für ein Antwortfeld
  const stellen = v => Math.min(7, Math.max(2, String(Math.abs(v)).length + 1));

  // ------------------------------------------------------------ Rechnung mit Lücken (Ziffernblock)
  // a.teile: [{z: 8}, {o: '+'}, {z: 5}, {o: '='}, {l: 0}] – {l: item} ist eine Lücke, {t: 'Rest'} ein Wort
  // a.mehrfeld: alle Lücken gehören zu einem Prüf-Punkt (z. B. Ergebnis und Rest)
  MW.typen.term = {
    aufbau(a, b) {
      const f = b.felder({ alleFelder: !!a.mehrfeld });
      if (a.szene) { const s = el('div.szene', { style: { flex: '1 1 0' } }); s.appendChild(MW.rechenbild(a.szene)); b.tafel.appendChild(s); }
      if (a.geschichte) b.tafel.appendChild(el('div.geschichte', { html: a.geschichte }));
      if (a.frage) b.tafel.appendChild(el('div.frage-text', { text: a.frage }));
      const box = el('div.term' + (a.groesse ? '.' + a.groesse : ''));
      let feldNr = 0;
      a.teile.forEach(t => {
        if (t.z !== undefined) box.appendChild(el('span.zahl', { text: MW.fmt(t.z) }));
        else if (t.zt !== undefined) box.appendChild(el('span.zahl', { text: t.zt }));
        else if (t.o) box.appendChild(el('span.op', { text: t.o }));
        else if (t.t) box.appendChild(el('span.text', { text: t.t }));
        else if (t.l !== undefined) {
          const e = el('span'); box.appendChild(e);
          const loes = a.mehrfeld ? [].concat(a.loesung)[feldNr] : MW.loesungVon(a, t.l);
          const max = t.max || stellen(loes);
          f.feld(e, { item: a.mehrfeld ? 0 : t.l, max, ordnung: feldNr, auto: !!a.mehrfeld && max === 1 });
          feldNr++;
        }
      });
      b.tafel.appendChild(box);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.ersteOffene());
    },
    loesungTeile(a, i) {
      if (a.loesungAnsage) return ['rahmen/loesung_zahl'].concat(a.loesungAnsage);
      return ['rahmen/loesung_zahl'].concat(a.mehrfeld ? a.loesungAnsage || [].concat(a.loesung) : [MW.loesungVon(a, i)]);
    },
    nachRichtig(a) { return a.nachRichtig || []; }
  };

  // ------------------------------------------------------------ Auswahl: Bild/Frage auf der Tafel, 2–4 Kacheln
  // a.szene: Rechenbild-Beschreibung für die Tafel; a.frage: Text; a.optionen: [{wert, inhalt|bild, text}]
  MW.typen.auswahl = {
    aufbau(a, b) {
      if (a.szene) { const s = el('div.szene'); s.appendChild(MW.rechenbild(a.szene)); b.tafel.appendChild(s); }
      if (a.anzeige) b.tafel.appendChild(MW.rechenbild(a.anzeige));
      if (a.frage) b.tafel.appendChild(el('div.frage-text', { text: a.frage }));
      const opts = a.optionen.map(o => Object.assign({}, o, { inhalt: o.bild ? MW.rechenbild(o.bild) : o.inhalt }));
      b.optionen = opts;
      b.eingabe.appendChild(MW.auswahlKacheln(opts, (wert, knopf) => { b.zuletzt = knopf; b.antwort(0, wert); }, { spalten: a.spalten }));
    },
    richtig(a, i, b) { if (b.zuletzt) b.zuletzt.classList.add('richtig'); b.optionen.forEach(o => { if (o.el !== b.zuletzt) o.el.classList.add('aus'); }); },
    falsch(a, i, wert, b) { if (b.zuletzt) { b.zuletzt.classList.add('falsch'); b.zuletzt.classList.add('aus'); } },
    loesung(a, i, b) { b.optionen.forEach(o => { if (MW.gleich(o.wert, a.loesung)) o.el.classList.add('loesung'); else o.el.classList.add('aus'); }); },
    loesungTeile(a) { return a.loesungAnsage ? ['rahmen/loesung_bild'].concat(a.loesungAnsage) : ['rahmen/loesung_bild']; },
    nachRichtig(a) { return a.nachRichtig || []; }
  };

  // ------------------------------------------------------------ Zahlenkarten (Vorschule): Bild auf der Tafel, Karte antippen
  MW.typen.karten = {
    aufbau(a, b) {
      if (a.szene) { const s = el('div.szene'); s.appendChild(MW.rechenbild(a.szene)); b.tafel.appendChild(s); }
      if (a.frage) b.tafel.appendChild(el('div.frage-text', { text: a.frage }));
      b.eingabe.appendChild(MW.zahlenkarten(a.von === undefined ? 1 : a.von, a.bis || 10, (z, knopf) => { b.zuletzt = knopf; b.antwort(0, z); }));
    },
    falsch(a, i, wert, b) { if (b.zuletzt) { b.zuletzt.classList.add('wackeln'); setTimeout(() => b.zuletzt && b.zuletzt.classList.remove('wackeln'), 450); } },
    richtig(a, i, b) { if (b.zuletzt) b.zuletzt.style.background = '#E8F4EC'; },
    loesung(a, i, b) {
      b.eingabe.querySelectorAll('.karte').forEach(k => { if (Number(k.textContent) === a.loesung) { k.style.background = '#E8F4EC'; k.style.outline = '5px solid #3F8F5B'; } else k.style.opacity = '.35'; });
    },
    loesungTeile(a) { return ['rahmen/loesung_zahl', a.loesung]; },
    nachRichtig(a) { return a.nachRichtig || []; }
  };

  // ------------------------------------------------------------ Bild + Ziffernblock (z. B. Blitzrechnen Vorschule)
  MW.typen.bildzahl = {
    aufbau(a, b) {
      const f = b.felder();
      if (a.szene) { const s = el('div.szene'); s.appendChild(MW.rechenbild(a.szene)); b.tafel.appendChild(s); }
      const box = el('div.term.mittel');
      if (a.frage) box.appendChild(el('span.text', { text: a.frage }));
      const e = el('span'); box.appendChild(e);
      f.feld(e, { item: 0, max: stellen(a.loesung) });
      b.tafel.appendChild(box);
      b.eingabe.appendChild(MW.ziffernblock(f));
      f.aktiviere(f.liste[0]);
    },
    loesungTeile(a) { return ['rahmen/loesung_zahl', a.loesung]; }
  };

  // ------------------------------------------------------------ Zahlenstrahl-Schieber
  // a.min, a.max, a.raster, a.lang, a.mittel, a.beschriftung, a.loesung
  MW.typen.schieber = {
    aufbau(a, b) {
      b.tafel.appendChild(el('div.term.mittel', el('span.zahl.kreide-g', { text: MW.fmt(a.loesung) })));
      const s = MW.schieber({ min: a.min, max: a.max, raster: a.raster, lang: a.lang, mittel: a.mittel, beschriftung: a.beschriftung, start: a.start, schrift: a.schrift, onOK: v => b.antwort(0, v) });
      b.schieber = s;
      const feld = el('div.szene', { style: { flex: '0 0 auto', height: '48%', width: '100%' } });
      feld.appendChild(s.svg);
      b.tafel.appendChild(feld);
      b.eingabe.appendChild(el('div.schieber-feld', s.fein, s.ok));
    },
    falsch(a, i, wert, b) { b.schieber.svg.classList.remove('wackeln'); void b.schieber.svg.offsetWidth; b.schieber.svg.classList.add('wackeln'); },
    richtig(a, i, b) { b.schieber.sperren(); b.schieber.markiere(a.loesung, MW.F.gruen); },
    loesung(a, i, b) { b.schieber.sperren(); b.schieber.setze(a.loesung); b.schieber.markiere(a.loesung, MW.F.rot); b.schieber.beschriften(a.beschriftung.concat([a.loesung]).filter((v, k, arr) => arr.indexOf(v) === k)); },
    loesungTeile(a) { return ['rahmen/loesung_zahl', a.loesung]; },
    hilfe(a) { return MW.rechenbild(a.bild); }
  };

})(window.MW);
