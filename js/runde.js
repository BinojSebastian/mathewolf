/* Mathewolf – Rundenablauf: 3 Runden je Übung, Punkte 2/1/0, Tipp, zweiter Versuch, Lösung, Blitzrechnen */
'use strict';
(function (MW) {
  const $ = s => document.querySelector(s);
  const el = MW.el;

  // ------------------------------------------------------------ Professor Wolf
  // Alle Posen liegen auf derselben Leinwand (Füße an derselben Stelle), so springt er beim Wechsel nicht.
  // Neue Posen einfach unter bilder/wolf/<pose>.webp ablegen und hier eintragen.
  MW.POSEN = {
    winkt: 'bilder/wolf/winkt.webp',          // Begrüßung, Rundenstart
    zeigt: 'bilder/wolf/zeigt.webp',          // Aufgabe, Tipp, Lösung
    daumen: 'bilder/wolf/daumen.webp',        // richtig gelöst
    lacht: 'bilder/wolf/lacht.webp',          // Rundenende, Abschluss
    nachdenklich: 'bilder/wolf/zeigt.webp',   // nach einem Fehler: zeigt auf den Tipp
    jubelt: 'bilder/wolf/lacht.webp',         // wie „lacht", mit Hüpfer
    kreide: 'bilder/wolf/zeigt.webp'
  };
  // Posen vorladen, damit der Wechsel ohne Flackern klappt
  document.addEventListener('DOMContentLoaded', () => Object.values(MW.POSEN).forEach(src => { const i = new Image(); i.src = src; }));
  MW.wolf = {
    pose(name, wo) {
      const bilder = document.querySelectorAll('.wolf-bild' + (wo ? `[data-wolf="${wo}"]` : ''));
      const src = MW.POSEN[name] || MW.POSEN.zeigt;
      bilder.forEach(img => {
        if (img.getAttribute('src') !== src) {
          img.setAttribute('src', src);
          img.classList.remove('neu'); void img.offsetWidth; img.classList.add('neu');
        }
        img.classList.toggle('jubelt', name === 'jubelt' && !MW.bewegungReduziert());
      });
    }
  };
  MW.audio.beiSprechen.push(v => document.querySelectorAll('.screen.aktiv .wolf-bild').forEach(img => img.classList.toggle('spricht', v)));

  // ------------------------------------------------------------ Hilfen
  MW.gleich = function (a, b) {
    if (Array.isArray(a) || Array.isArray(b)) {
      const x = [].concat(a), y = [].concat(b);
      return x.length === y.length && x.every((v, i) => MW.gleich(v, y[i]));
    }
    if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b);
    return a === b;
  };
  MW.loesungVon = (a, i) => a.loesungen ? a.loesungen[i] : a.loesung;

  let lauf = null;     // laufende Übung
  let akt = null;      // aktuelle Aufgabe

  MW.spiel = {
    get lauf() { return lauf; },
    get akt() { return akt; },
    starte, starteBlitz, aufhoeren, frageAufhoeren
  };

  // ------------------------------------------------------------ Fortschritt und Punkte
  function zeigeFortschritt() {
    const box = $('#u-fortschritt'); MW.leeren(box);
    if (!lauf) return;
    if (lauf.blitz) {
      box.appendChild(el('span.text', { text: Math.min(lauf.geloest + 1, 10) + ' von 10' }));
      return;
    }
    const n = lauf.ergebnisse.length;
    const jetzt = lauf.ergebnisse.findIndex(x => x === null);
    if (n <= 14) lauf.ergebnisse.forEach((e, i) => box.appendChild(el('span.punkt' + (e === 2 ? '.zwei' : e === 1 ? '.eins' : e === 0 ? '.null' : '') + (i === jetzt ? '.jetzt' : ''))));
    box.appendChild(el('span.text', { text: (jetzt < 0 ? n : jetzt + 1) + ' von ' + n }));
  }
  function zeigePunkte(neu) {
    const p = $('#t-punkte'); p.textContent = lauf ? MW.fmt(lauf.punkte[lauf.runde - 1] || 0) : '0';
    if (neu) { const box = p.parentNode; box.classList.remove('neu'); void box.offsetWidth; box.classList.add('neu'); }
  }
  function ergebnis(i, p) {
    const idx = akt.itemStart + i;
    lauf.ergebnisse[idx] = p;
    if (p > 0) {
      lauf.punkte[lauf.runde - 1] += p;
      MW.speicher.punkteDazu(p);         // sofort speichern: Wer abbricht, behält seine Punkte
    }
    zeigePunkte(p > 0); zeigeFortschritt();
  }

  // ------------------------------------------------------------ Rechenbild
  function zeigeBild(inhalt, tippText) {
    const rb = $('#rechenbild'); MW.leeren(rb);
    if (!inhalt && !tippText) { rb.hidden = true; tippLage(); return false; }
    if (tippText) rb.appendChild(el('div.rb-tipp', { text: tippText }));
    if (inhalt) rb.appendChild(el('div.rb-bild', inhalt));
    rb.classList.toggle('nur-text', !inhalt);
    rb.hidden = false;
    passeTipp();
    requestAnimationFrame(passeTipp);
    return !!inhalt;
  }
  // Handy quer (flache Karte): Der Tipp steht neben der Aufgabe. Nur ein breites Bild (Zahlenstrahl,
  // Rechenstrich) bleibt unten – und auch das nur, wenn die Aufgabe darüber noch ganz hineinpasst.
  // Handy hochkant (und quer mit Tipp unten): Braucht die Aufgabe weniger Höhe, als sie hat,
  // bekommt der Tipp den Rest – so werden Bild und Text im Tipp größer.
  const mq = q => (window.matchMedia ? window.matchMedia(q) : { matches: false });
  const flachQuer = mq('(max-height: 500px) and (min-aspect-ratio: 1/1)');
  const handyHoch = mq('(max-width: 600px) and (max-aspect-ratio: 1/1)');
  function tippLage() {
    const tafel = $('#tafel'), rb = $('#rechenbild'), ti = $('#tafel-inhalt');
    tafel.classList.remove('tipp-seite');
    rb.classList.remove('rb-neben');
    rb.style.height = '';
    if (rb.hidden || rb.classList.contains('nur-text')) return;   // nur ein Satz: schmaler Streifen unten
    const seite = s => { const v = s.viewBox && s.viewBox.baseVal; return v && v.height ? v.width / v.height : 0; };
    const bild = rb.querySelector('.rb-bild > svg');
    if (flachQuer.matches) {
      const breit = bild && seite(bild) >= 3.2;
      // Ein Bild in der Aufgabe, das Höhe braucht (Geld, Diagramm, Würfel …), bekommt die volle Höhe
      const hochBild = [...ti.querySelectorAll('svg')].some(s => {
        if (s.ownerSVGElement) return false;
        const r = s.getBoundingClientRect(), a = seite(s);
        return a > 0 && a < 2.2 && r.width * r.height > 2500;
      });
      if (!breit || hochBild || ti.scrollHeight > ti.clientHeight + 2) { tafel.classList.add('tipp-seite'); return; }
    } else if (handyHoch.matches) {
      // kleines Bild neben den Tipp-Text – aber nur, wenn der Text daneben noch ganz hineinpasst
      const t = rb.querySelector('.rb-tipp');
      if (bild && t && seite(bild) < 1.9) {
        rb.classList.add('rb-neben');
        if (t.offsetHeight > rb.clientHeight - 14) rb.classList.remove('rb-neben');
      }
    } else return;   // iPad: genug Platz, alles bleibt wie es ist
    // Platz, den die Aufgabe nicht braucht
    const teile = [...ti.children].map(c => c.getBoundingClientRect()).filter(r => r.height > 0);
    if (!teile.length) return;
    const cs = getComputedStyle(ti);
    const innenHoehe = ti.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const belegt = Math.max(...teile.map(r => r.bottom)) - Math.min(...teile.map(r => r.top));
    const frei = innenHoehe - belegt;
    if (frei > 16) { rb.style.height = Math.round(Math.min(rb.offsetHeight + frei - 8, tafel.clientHeight * 0.62)) + 'px'; return; }
    // Umgekehrt: Ragt die Aufgabe heraus (kleines Handy), gibt der Tipp Höhe ab – die Aufgabe geht vor,
    // aber der Tipp-Satz selbst bleibt ganz lesbar (das Bild darf dabei kleiner werden)
    const tippText = rb.querySelector('.rb-tipp');
    const minH = Math.max(76, (tippText ? tippText.offsetHeight : 0) + 20);
    for (let h = rb.offsetHeight, n = 0; ti.scrollHeight > ti.clientHeight + 2 && h > minH && n < 12; n++) {
      h = Math.max(minH, h - 12); rb.style.height = h + 'px';
    }
  }
  function passeTipp() {
    const rb = $('#rechenbild');
    tippLage();
    if (!rb.hidden) MW.passeZeilen(rb);
  }
  // Drehen des Handys oder ein anderes Fenster: Lage und Text des Tipps neu einpassen
  const tafelEl = $('#tafel');
  if (tafelEl && window.ResizeObserver) new ResizeObserver(passeTipp).observe(tafelEl);
  else if (tafelEl) window.addEventListener('resize', passeTipp);
  function hilfeBild(i, tipp) {
    const a = akt.aufgabe, typ = akt.typ;
    // Tipp direkt in der Aufgabe (z. B. markierte Säule im Diagramm) statt als zweites, kleineres Bild
    if (a.bildInSzene && a.bild) {
      const sz = $('#tafel-inhalt .szene'), text = tipp && tipp.length ? MW.audio.anzeige(tipp) : '';
      if (sz) { MW.leeren(sz); sz.appendChild(MW.rechenbild(a.bild)); return zeigeBild(null, text) || !!text; }
    }
    let inhalt = null;
    if (typ.hilfe) inhalt = typ.hilfe(a, i, akt.b);
    else if (a.bild) inhalt = MW.rechenbild(a.bild);
    const text = tipp && tipp.length ? MW.audio.anzeige(tipp) : '';
    return zeigeBild(inhalt, inhalt ? text : '');
  }
  function tippTeile(i) {
    const a = akt.aufgabe, u = lauf.uebung;
    if (akt.typ.tipp) { const t = akt.typ.tipp(a, i, akt.b); if (t) return t; }
    if (a.tipp) return [].concat(a.tipp);
    const tipps = (u.audio && u.audio.tipps) || [];
    if (!tipps.length) return [];
    const k = (lauf.tippZaehler++) % tipps.length;
    return [tipps[k]];
  }

  // ------------------------------------------------------------ Bühne für die Aufgabentypen
  function bauBuehne(a) {
    const b = {
      aufgabe: a, uebung: lauf.uebung, rng: lauf.rng, blitz: lauf.blitz,
      tafel: $('#tafel-inhalt'), eingabe: $('#eingabe'),
      f: null,
      antwort: (i, wert, extra) => antwort(i, wert, extra),
      sag: teile => MW.audio.sag(teile),
      ansage: null,
      felder(opt) {
        this.f = new MW.Felder(Object.assign({ onOK: (item, wert, felder) => antwort(item, wert, felder) }, opt || {}));
        return this.f;
      },
      zeigeBild,
      wolf: p => MW.wolf.pose(p, 'uebung'),
      erledigt: i => akt && akt.erledigt[i],
      versuch: i => akt ? akt.versuche[i] : 0
    };
    return b;
  }

  // ------------------------------------------------------------ Eine Aufgabe zeigen und auf alle Antworten warten
  function zeigeAufgabe(a, itemStart) {
    return new Promise(resolve => {
      const typ = MW.typen[a.typ];
      if (!typ) { console.error('Typ fehlt', a.typ); resolve(); return; }
      const items = a.items || 1;
      MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe')); zeigeBild(null);
      $('#eingabe').classList.toggle('breit', !!a.breit);
      document.getElementById('tafel').classList.toggle('schriftlich-modus', a.typ === 'schriftlich');
      const b = bauBuehne(a);
      akt = { aufgabe: a, typ, b, items, itemStart, versuche: new Array(items).fill(0), erledigt: new Array(items).fill(false), sperre: false, brauchtWeiter: false, fertig: resolve, lauf };
      zeigeFortschritt();
      MW.wolf.pose('zeigt', 'uebung');
      typ.aufbau(a, b);
      b.ansage = a.ansage || null;
      if (lauf.blitz) { if (a.ansage) MW.audio.sag(a.ansage); }
      else if (a.ansage) MW.audio.sag(a.ansage);
    });
  }

  async function antwort(i, wert, extra) {
    if (!akt || akt.sperre || akt.erledigt[i]) return;
    const meins = akt, a = akt.aufgabe, typ = akt.typ, b = akt.b;
    const ok = typ.pruefe ? typ.pruefe(a, i, wert, b, extra) : MW.gleich(wert, MW.loesungVon(a, i));
    if (lauf.blitz) return blitzAntwort(ok, i, wert);
    if (ok) {
      const p = akt.versuche[i] === 0 ? 2 : 1;
      akt.erledigt[i] = true;
      ergebnis(i, p);
      if (typ.richtig) typ.richtig(a, i, b); else if (b.f) b.f.sperren(i, 'richtig');
      MW.audio.effekt('richtig');
      setTimeout(() => MW.audio.effekt('kreide'), 260);
      MW.wolf.pose('daumen', 'uebung');
      const lob = p === 2 ? lauf.rng.pick(MW.LOB) : lauf.rng.pick(MW.LOB2);
      const danach = typ.nachRichtig ? typ.nachRichtig(a, i, b) : [];
      const sprechen = MW.audio.sag([lob].concat(danach || []), { blase: 'uebung', blasenTeile: [lob] });
      pruefeFertig(meins, sprechen, (danach || []).length ? 3500 : 1600);
    } else if (akt.versuche[i] === 0) {
      akt.versuche[i] = 1;
      MW.audio.effekt('falsch');
      MW.wolf.pose('nachdenklich', 'uebung');
      if (typ.falsch) typ.falsch(a, i, wert, b);
      else if (b.f) { b.f.felderVon(i).forEach(f => { f.el.classList.remove('falsch'); void f.el.offsetWidth; f.el.classList.add('falsch'); }); b.f.leere(i); b.f.aktiviere(b.f.felderVon(i).find(f => !f.fest) || null); }
      const tipp = tippTeile(i), satz = lauf.rng.pick(MW.FEHLER);
      hilfeBild(i, tipp);
      MW.audio.sag([satz].concat(tipp), { blase: 'uebung', blasenTeile: [satz] });
    } else {
      akt.erledigt[i] = true;
      ergebnis(i, 0);
      MW.audio.effekt('falsch');
      MW.wolf.pose('zeigt', 'uebung');
      if (typ.loesung) typ.loesung(a, i, b);
      else if (b.f) { const loes = [].concat(MW.loesungVon(a, i)); b.f.felderVon(i).forEach((f, k) => b.f.setze(f, loes[k], 'loesung')); }
      if ($('#rechenbild').hidden) hilfeBild(i);
      akt.brauchtWeiter = true;
      const teile = typ.loesungTeile ? typ.loesungTeile(a, i, b) : ['rahmen/loesung_zahl'].concat(MW.loesungVon(a, i));
      MW.audio.sag(teile, { blase: 'uebung' });
      pruefeFertig(meins, null, 0);
    }
  }

  async function pruefeFertig(meins, sprechen, warteMax) {
    if (akt !== meins) return;
    if (!akt.erledigt.every(Boolean)) {
      if (akt.typ.naechstes) akt.typ.naechstes(akt.aufgabe, akt.b);
      else if (akt.b.f) { const n = akt.b.f.ersteOffene(); if (n) akt.b.f.aktiviere(n); }
      setTimeout(() => { if (akt === meins && !akt.sperre) MW.wolf.pose('zeigt', 'uebung'); }, 1400);
      return;
    }
    akt.sperre = true;
    if (akt.brauchtWeiter) {
      const box = $('#eingabe'); MW.leeren(box);
      box.appendChild(MW.knopf('Weiter ▶', 'blau', () => { MW.audio.stopp(); meins.fertig(); }, 'gross'));
      return;
    }
    const t0 = Date.now();
    await Promise.race([sprechen || Promise.resolve(), MW.warte(warteMax || 1600)]);
    const rest = 900 - (Date.now() - t0);
    if (rest > 0) await MW.warte(rest);
    if (akt === meins) meins.fertig();
  }

  // Hilfe-Taste: Rechenbild sofort zeigen, ohne Punktabzug
  function hilfe() {
    if (!akt || lauf.blitz) return;
    const offen = akt.erledigt.findIndex(x => !x);
    const i = akt.b.f && akt.b.f.aktiv ? akt.b.f.aktiv.item : Math.max(0, offen);
    const t = tippTeile(i);
    const gezeigt = hilfeBild(i, t);
    MW.wolf.pose('nachdenklich', 'uebung');
    if (t.length) MW.audio.sag(t, gezeigt ? {} : { blase: 'uebung' });
    else if (!gezeigt) MW.audio.sag(akt.aufgabe.ansage || []);
  }
  function wiederholen() {
    if (!akt) return;
    const teile = akt.typ.ansage ? akt.typ.ansage(akt.aufgabe, akt.b) : akt.aufgabe.ansage;
    if (teile) MW.audio.sag(teile);
  }

  // ------------------------------------------------------------ Übung mit drei Runden
  async function starte(u, optionen) {
    MW.audio.stopp();
    optionen = optionen || {};
    if (u.parameter && u.parameter.reiheWaehlen && optionen.reihe === undefined) {
      const reihe = await waehleReihe();
      if (reihe === null) return;
      optionen.reihe = reihe;
    }
    const meinLauf = lauf = {
      uebung: u, rng: MW.zufall(optionen.seed), runde: 1, punkte: [0, 0, 0], maxPunkte: [0, 0, 0],
      ergebnisse: [], blitz: false, optionen, tippZaehler: 0, aktiv: true
    };
    MW.app.zeige('uebung');
    $('#u-titel').textContent = u.titel;
    $('#u-uhr').hidden = true; $('#u-hilfe').hidden = false; document.querySelector('.tafel-punkte').hidden = false;
    for (let r = 1; r <= 3; r++) {
      if (lauf !== meinLauf) return;
      lauf.runde = r;
      const gen = MW.generatoren[u.generator];
      const aufgaben = gen(Object.assign({}, u.parameter, optionen), lauf.rng, u, r);
      lauf.ergebnisse = [];
      aufgaben.forEach(a => { for (let k = 0; k < (a.items || 1); k++) lauf.ergebnisse.push(null); });
      lauf.maxPunkte[r - 1] = lauf.ergebnisse.length * 2;
      $('#t-runde').textContent = 'Runde ' + r + ' von 3';
      zeigePunkte(false); zeigeFortschritt();
      // Rundenansage, dann die Übungsansage
      MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe')); zeigeBild(null);
      const punkte3 = el('div.punkte3', [1, 2, 3].map(k => el('span' + (k <= r ? '.an' : ''))));
      $('#tafel-inhalt').appendChild(el('div.bilanz.rundenstart', el('div.symbol', { text: u.symbol || '★' }), el('div.gross', { text: 'Runde ' + r }), punkte3, el('div.klein', { text: u.titel })));
      MW.wolf.pose(r === 1 ? 'winkt' : 'zeigt', 'uebung');
      await MW.audio.sag(['rahmen/runde' + r].concat(r === 1 && u.audio.aufgabe ? [u.audio.aufgabe] : []), { blase: 'uebung' });
      if (lauf !== meinLauf) return;
      let start = 0;
      for (const a of aufgaben) {
        if (lauf !== meinLauf) return;
        await zeigeAufgabe(a, start);
        start += a.items || 1;
      }
      if (lauf !== meinLauf) return;
      akt = null;
      const weiter = await rundenende(r);
      if (lauf !== meinLauf || !weiter) return;
    }
    if (lauf !== meinLauf) return;
    await abschluss();
  }

  function rundenende(r) {
    return new Promise(resolve => {
      const p = lauf.punkte[r - 1], max = lauf.maxPunkte[r - 1];
      MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe')); zeigeBild(null);
      const anteil = max ? p / max : 0;
      const n = anteil === 1 ? 3 : anteil > 0.5 ? 2 : 1;
      $('#tafel-inhalt').appendChild(el('div.bilanz',
        el('div.klein', { text: 'Runde ' + r + ' geschafft' }),
        el('div.sterne', [1, 2, 3].map(k => el('span' + (k <= n ? '.an' : ''), { text: '★' }))),
        el('div.gross', { text: MW.fmt(p) + ' von ' + MW.fmt(max) + ' Punkten' })));
      MW.wolf.pose(anteil > 0.5 ? 'jubelt' : 'daumen', 'uebung');
      MW.audio.effekt(anteil > 0.5 ? 'fanfare' : 'auf');
      const lob = anteil === 1 ? 'rahmen/ende_alle' : anteil > 0.5 ? 'rahmen/ende_gut' : 'rahmen/ende_mut';
      MW.audio.sag(['rahmen/punkte', p, 'woerter/von', max, { pause: 250 }, lob], { blase: 'uebung', blasenTeile: [lob] });
      if (r < 3) $('#eingabe').appendChild(MW.knopf('Runde ' + (r + 1) + ' ▶', 'blau', () => { MW.audio.stopp(); resolve(true); }, 'gross'));
      else $('#eingabe').appendChild(MW.knopf('Weiter ▶', 'blau', () => { MW.audio.stopp(); resolve(true); }, 'gross'));
    });
  }

  function abschluss() {
    return new Promise(resolve => {
      const u = lauf.uebung, summe = lauf.punkte.reduce((x, y) => x + y, 0);
      MW.speicher.geschafft(u.id);
      const gesamt = MW.speicher.daten.gesamtpunkte;
      MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe')); zeigeBild(null);
      const zeilen = lauf.punkte.map((p, i) => el('div.zeile', el('span', { text: 'Runde ' + (i + 1) + ':' }), el('span', { text: MW.fmt(p) })));
      $('#tafel-inhalt').appendChild(el('div.bilanz', zeilen, el('div.strich'),
        el('div.zeile', el('span', { text: 'Zusammen:' }), el('span.gross', { text: MW.fmt(summe) })),
        el('div.zeile', el('span', { text: 'Gesamt:' }), el('span', { text: '★ ' + MW.fmt(gesamt) }))));
      MW.wolf.pose('jubelt', 'uebung');
      MW.audio.effekt('jubel');
      MW.audio.sag(['rahmen/geschafft', 'rahmen/zusammen', summe, 'woerter/punkte', { pause: 300 }, 'rahmen/insgesamt', gesamt, 'woerter/punkte'], { blase: 'uebung', blasenTeile: ['rahmen/geschafft'] });
      $('#eingabe').appendChild(el('div.ok-zeile',
        MW.knopf('Nochmal ↻', 'gelb', () => { MW.audio.stopp(); resolve(); starte(u, { reihe: lauf.optionen.reihe }); }),
        MW.knopf('Fertig ✓', 'blau', () => { MW.audio.stopp(); lauf = null; resolve(); MW.app.zeigeAuswahl(u.stufe); })));
    });
  }

  // ------------------------------------------------------------ Einmaleins: Reihe wählen
  function waehleReihe() {
    return new Promise(resolve => {
      MW.app.zeige('uebung');
      $('#u-titel').textContent = 'Einmaleins'; MW.leeren($('#u-fortschritt'));
      MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe')); zeigeBild(null);
      const ov = $('#overlay'); MW.leeren(ov); ov.hidden = false;
      const reihen = el('div.reihen');
      for (let z = 1; z <= 10; z++) reihen.appendChild(MW.tipp(el('button', { type: 'button', text: z + 'er' }), () => { MW.audio.effekt('klick'); ov.hidden = true; resolve(z); }));
      reihen.appendChild(MW.tipp(el('button.mix', { type: 'button', text: 'Mix' }), () => { MW.audio.effekt('klick'); ov.hidden = true; resolve(0); }));
      ov.appendChild(el('div.reihen-titel', { text: 'Welche Reihe?' }));
      ov.appendChild(reihen);
      ov.appendChild(MW.knopf('Zurück', 'grau', () => { ov.hidden = true; resolve(null); MW.app.zurueck(); }));
      MW.audio.sag(['rahmen/reihe_waehlen']);
    });
  }

  // ------------------------------------------------------------ Blitzrechnen
  async function starteBlitz(stufe, optionen) {
    MW.audio.stopp();
    optionen = optionen || {};
    const rec = MW.blitz[stufe];
    const meinLauf = lauf = { uebung: rec, rng: MW.zufall(optionen.seed), runde: 1, punkte: [0], maxPunkte: [0], ergebnisse: [], blitz: true, geloest: 0, optionen, tippZaehler: 0 };
    MW.app.zeige('uebung');
    $('#u-titel').textContent = 'Blitzrechnen';
    $('#u-hilfe').hidden = true;
    $('#t-runde').textContent = '⚡ Blitzrechnen'; $('#t-punkte').textContent = ''; document.querySelector('.tafel-punkte').hidden = true;
    const uhr = $('#u-uhr'); uhr.hidden = false; uhr.textContent = '0,0';
    MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe')); zeigeBild(null);
    const aufgaben = MW.generatoren[rec.generator](Object.assign({}, rec.parameter), lauf.rng, rec, 1);
    zeigeFortschritt();
    // Countdown
    const ov = $('#overlay'); MW.leeren(ov); ov.hidden = false;
    const best = MW.speicher.bestzeit(stufe);
    ov.appendChild(el('div.reihen-titel', { text: '⚡ Blitzrechnen' }));
    if (best) ov.appendChild(el('div.info', { text: 'Bestzeit: ' + MW.fmtKomma(best, 1) + ' s' }));
    MW.wolf.pose('winkt', 'uebung');
    await MW.audio.sag(['blitz/start'], { blase: 'uebung' });
    if (lauf !== meinLauf) { ov.hidden = true; return; }
    for (const z of [3, 2, 1]) {
      MW.leeren(ov); ov.appendChild(el('div.countdown', { text: String(z) }));
      MW.audio.effekt('tick'); MW.audio.sag([z]);
      await MW.warte(850);
      if (lauf !== meinLauf) { ov.hidden = true; return; }
    }
    MW.leeren(ov); ov.appendChild(el('div.countdown', { text: 'Los!' })); MW.audio.effekt('los'); MW.audio.sag(['blitz/los']);
    await MW.warte(450);
    ov.hidden = true;
    const t0 = performance.now();
    lauf.t0 = t0;
    lauf.uhrTimer = setInterval(() => { uhr.textContent = MW.fmtKomma((performance.now() - t0) / 1000, 1); }, 100);
    for (const a of aufgaben) {
      if (lauf !== meinLauf) return;
      lauf.ergebnisse = [null];
      await zeigeAufgabe(a, 0);
      lauf.geloest++;
    }
    if (lauf !== meinLauf) return;
    clearInterval(lauf.uhrTimer);
    const sek = (performance.now() - t0) / 1000;
    uhr.textContent = MW.fmtKomma(sek, 1);
    akt = null;
    const neu = MW.speicher.neueZeit(stufe, sek);
    const bestNeu = MW.speicher.bestzeit(stufe);
    MW.leeren($('#tafel-inhalt')); MW.leeren($('#eingabe'));
    const ganz = Math.floor(Math.round(sek * 10) / 10), zehntel = Math.round(sek * 10) % 10;
    $('#tafel-inhalt').appendChild(el('div.bilanz',
      el('div', { text: 'Deine Zeit' }),
      el('div.gross', { text: MW.fmtKomma(sek, 1) + ' Sekunden' }),
      neu ? el('div.sterne', { text: '★ Neue Bestzeit! ★' }) : el('div', { text: 'Bestzeit: ' + MW.fmtKomma(bestNeu, 1) + ' s' })));
    MW.wolf.pose(neu ? 'jubelt' : 'lacht', 'uebung');
    MW.audio.effekt(neu ? 'jubel' : 'fanfare');
    const bg = Math.floor(bestNeu), bz = Math.round(bestNeu * 10) % 10;
    MW.audio.sag(['blitz/fertig', ganz, 'woerter/komma', zehntel, 'woerter/sekunden', { pause: 300 }].concat(neu ? ['blitz/bestzeit'] : ['blitz/bestzeit_ist', bg, 'woerter/komma', bz, 'woerter/sekunden']), { blase: 'uebung', blasenTeile: neu ? ['blitz/bestzeit'] : ['blitz/fertig', ganz, 'woerter/komma', zehntel, 'woerter/sekunden'] });
    $('#eingabe').appendChild(el('div.ok-zeile',
      MW.knopf('Nochmal ↻', 'gelb', () => { MW.audio.stopp(); starteBlitz(stufe); }),
      MW.knopf('Fertig ✓', 'blau', () => { MW.audio.stopp(); lauf = null; MW.app.zeigeAuswahl(stufe); })));
  }
  function blitzAntwort(ok, i, wert) {
    const b = akt.b;
    if (ok) {
      akt.erledigt[i] = true; akt.sperre = true;
      if (b.f) b.f.sperren(i, 'richtig');
      MW.audio.effekt('richtig');
      const meins = akt;
      MW.warte(350).then(() => { if (akt === meins) meins.fertig(); });
    } else {
      MW.audio.effekt('blitzfalsch');
      if (b.f) { b.f.felderVon(i).forEach(f => { f.el.classList.remove('falsch'); void f.el.offsetWidth; f.el.classList.add('falsch'); }); b.f.leere(i); b.f.aktiviere(b.f.felderVon(i)[0]); }
      else if (akt.typ.falsch) akt.typ.falsch(akt.aufgabe, i, wert, b);
    }
  }

  // ------------------------------------------------------------ Aufhören
  function frageAufhoeren() {
    const d = $('#dialog'); MW.leeren(d); d.hidden = false;
    MW.audio.sag(['rahmen/aufhoeren']);
    const zu = () => { d.hidden = true; MW.leeren(d); };
    d.appendChild(el('div.dialog-box',
      el('img', { src: MW.POSEN.winkt, alt: '' }),
      el('div.dialog-mitte',
        el('div.dialog-frage', { text: 'Willst du aufhören?' }),
        el('div.dialog-knoepfe',
          MW.tipp(el('button.ja', { type: 'button', 'aria-label': 'Ja, aufhören', text: '✓' }), () => { MW.audio.effekt('klick'); zu(); aufhoeren(); }),
          MW.tipp(el('button.nein', { type: 'button', 'aria-label': 'Nein, weiter üben', text: '✗' }), () => { MW.audio.effekt('klick'); MW.audio.stopp(); zu(); })))));
  }
  function aufhoeren() {
    MW.audio.stopp();
    if (lauf && lauf.uhrTimer) clearInterval(lauf.uhrTimer);
    const stufe = lauf ? lauf.uebung.stufe : null;
    lauf = null; akt = null;
    $('#overlay').hidden = true;
    MW.app.zeigeAuswahl(stufe);
  }

  // Knöpfe der Übungsseite
  document.addEventListener('DOMContentLoaded', () => {
    MW.tipp($('#u-haus'), () => { MW.audio.effekt('klick'); if (lauf && (akt || lauf.blitz)) frageAufhoeren(); else aufhoeren(); });
    MW.tipp($('#u-laut'), () => { MW.audio.effekt('klick'); wiederholen(); });
    MW.tipp($('#u-hilfe'), () => { MW.audio.effekt('klick'); hilfe(); });
  });

})(window.MW);
