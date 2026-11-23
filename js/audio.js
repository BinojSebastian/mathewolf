/* Mathewolf – Ton: aufgenommene Stimme (Bausteine), iPad-Stimme als Notlösung, Musik und Effekte */
'use strict';
(function (MW) {

  const A = MW.audio = {
    ctx: null,
    index: {},          // Schlüssel → [Position, Länge] im Stimmenpaket
    bin: null,          // ArrayBuffer des Stimmenpakets
    puffer: new Map(),  // Schlüssel → { buf, von, bis } (dekodiert, Stille abgeschnitten)
    laeuft: null,       // aktuelle Ansage { quellen, timer, resolve }
    spricht: false,
    beiSprechen: [],    // Rückrufe (true/false) – Wolf bewegt sich, Musik wird leiser
    musikGain: null, effektGain: null, sprachGain: null,
    musikStueck: null,  // 'start' | 'auswahl' | null – im Lernmodus läuft keine Musik
    stimmeGeladen: false
  };

  // ------------------------------------------------------------ Entsperren (nach erster Berührung)
  A.entsperren = function () {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';   // Stumm-Schalter des iPads übergehen
    } catch (e) { /* ältere Geräte */ }
    if (!A.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        A.ctx = new AC();
        A.musikGain = A.ctx.createGain(); A.musikGain.gain.value = 0; A.musikGain.connect(A.ctx.destination);
        A.effektGain = A.ctx.createGain(); A.effektGain.gain.value = 0.9; A.effektGain.connect(A.ctx.destination);
        A.sprachGain = A.ctx.createGain(); A.sprachGain.gain.value = 1; A.sprachGain.connect(A.ctx.destination);
      }
    }
    if (A.ctx && A.ctx.state !== 'running') { try { A.ctx.resume(); } catch (e) { } }
    if (A.ctx) {   // stiller Puffer – manche iPads brauchen das zum Freischalten
      const b = A.ctx.createBuffer(1, 1, 22050), s = A.ctx.createBufferSource();
      s.buffer = b; s.connect(A.ctx.destination); try { s.start(0); } catch (e) { }
    }
    if ('speechSynthesis' in window) {
      try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); } catch (e) { }
    }
  };

  // ------------------------------------------------------------ Stimmenpaket laden
  A.ladeStimme = async function () {
    try {
      const r = await fetch('audio/stimme.json', { cache: 'no-cache' });
      if (!r.ok) return false;
      const j = await r.json();
      if (!j || !j.datei || !j.eintraege || !Object.keys(j.eintraege).length) return false;
      const b = await fetch('audio/' + j.datei);
      if (!b.ok) return false;
      A.bin = await b.arrayBuffer();
      A.index = j.eintraege;
      A.stimmeGeladen = true;
      vorladen();
      return true;
    } catch (e) { return false; }
  };
  A.hat = key => !!(A.bin && A.index[key]);

  function dekodiere(arraybuf) {
    return new Promise((res, rej) => {
      try {
        const p = A.ctx.decodeAudioData(arraybuf, res, rej);
        if (p && p.then) p.then(res, rej);
      } catch (e) { rej(e); }
    });
  }
  // Stille am Anfang und Ende finden, damit Bausteine ohne Lücke aneinanderpassen
  function grenzen(buf) {
    const x = buf.getChannelData(0), sr = buf.sampleRate, n = x.length;
    let peak = 0;
    for (let i = 0; i < n; i += 2) { const v = Math.abs(x[i]); if (v > peak) peak = v; }
    const thr = Math.max(0.006, peak * 0.05);
    let a = 0, b = n - 1;
    while (a < n && Math.abs(x[a]) < thr) a++;
    while (b > a && Math.abs(x[b]) < thr) b--;
    const von = Math.max(0, a / sr - 0.012), bis = Math.min(buf.duration, b / sr + 0.035);
    return { von, bis: Math.max(bis, von + 0.05) };
  }
  A.lade = async function (key) {
    if (A.puffer.has(key)) return A.puffer.get(key);
    if (!A.hat(key) || !A.ctx) return null;
    const [pos, len] = A.index[key];
    try {
      const buf = await dekodiere(A.bin.slice(pos, pos + len));
      const g = grenzen(buf);
      const e = { buf, von: g.von, bis: g.bis };
      A.puffer.set(key, e);
      return e;
    } catch (e) { return null; }
  };
  // häufige Bausteine im Hintergrund dekodieren
  function vorladen() {
    if (!A.ctx) return;
    const keys = Object.keys(A.index).filter(k => /^(zahlen|woerter)\//.test(k));
    let i = 0;
    const schritt = () => {
      const batch = keys.slice(i, i + 8); i += 8;
      Promise.all(batch.map(A.lade)).then(() => { if (i < keys.length) setTimeout(schritt, 30); });
    };
    setTimeout(schritt, 400);
  }

  // ------------------------------------------------------------ Teile einer Ansage
  // Teile: 'schluessel', Zahl, { zahl }, { pause: ms }, { uhr: [h, m] }, { euro: [euro, cent] }, { komma: [ganz, nachkomma] }
  A.zerlege = function (teile) {
    const out = [];
    (teile || []).forEach(t => {
      if (t === null || t === undefined || t === '') return;
      if (typeof t === 'number') { MW.zahlBausteine(t).forEach((k, i) => out.push({ key: k, join: i > 0 })); return; }
      if (typeof t === 'string') { out.push({ key: t }); return; }
      if (t.pause) { out.push({ pause: t.pause }); return; }
      if (t.zahl !== undefined) { MW.zahlBausteine(t.zahl).forEach((k, i) => out.push({ key: k, join: i > 0 })); return; }
      if (t.uhr) { A.zerlege(MW.uhrTeile(t.uhr[0], t.uhr[1])).forEach(s => out.push(s)); return; }
      if (t.euro) { A.zerlege(MW.euroTeile(t.euro[0], t.euro[1])).forEach(s => out.push(s)); return; }
      if (t.komma) { A.zerlege([t.komma[0], 'woerter/komma'].concat(String(t.komma[1]).split('').map(Number))).forEach(s => out.push(s)); return; }
      if (t.key) { out.push({ key: t.key }); return; }
    });
    return out;
  };
  A.text = function (teile) {
    let s = '';
    A.zerlege(teile).forEach(seg => {
      if (seg.pause) { s += ' … '; return; }
      const t = MW.texte[seg.key] || '';
      s += (seg.join || !s ? '' : ' ') + t;
    });
    return s.replace(/\s+/g, ' ').replace('einemillion', 'eine Million').trim();
  };

  // Text für die Sprechblase: Zahlen als Ziffern, Bausteine zu Sätzen verbunden
  A.anzeige = function (teile) {
    const out = [];
    (teile || []).forEach(t => {
      if (t === null || t === undefined || t === '') return;
      if (typeof t === 'number') { out.push({ s: MW.fmt(t), zahl: true }); return; }
      if (typeof t === 'string') { const s = (MW.texte[t] || '').trim(); if (s) out.push({ s }); return; }
      if (t.pause) return;
      if (t.zahl !== undefined) { out.push({ s: MW.fmt(t.zahl), zahl: true }); return; }
      if (t.uhr) { out.push({ s: t.uhr[0] + ':' + String(t.uhr[1]).padStart(2, '0') + ' Uhr', zahl: true }); return; }
      if (t.euro) { out.push({ s: t.euro[0] + (t.euro[1] ? ',' + String(t.euro[1]).padStart(2, '0') : '') + ' €', zahl: true }); return; }
      if (t.komma) { out.push({ s: t.komma[0] + ',' + t.komma[1], zahl: true }); return; }
      if (t.key) { const s = (MW.texte[t.key] || '').trim(); if (s) out.push({ s }); }
    });
    // „12 Komma 4" → „12,4"
    for (let i = 1; i < out.length - 1; i++) {
      if (/^komma\.?$/i.test(out[i].s) && out[i - 1].zahl && out[i + 1].zahl) { out[i - 1].s += ',' + out[i + 1].s; out.splice(i, 2); i--; }
    }
    const einWort = s => !/\s/.test(s.replace(/[.!?:]$/, ''));
    let txt = '';
    out.forEach((teil, i) => {
      let s = teil.s;
      const n = out[i + 1];
      if (n) {
        const neuerSatz = !n.zahl && !einWort(n.s) && /^[A-ZÄÖÜ]/.test(n.s);
        if (!neuerSatz && /\.$/.test(s)) s = s.slice(0, -1);       // „von." mitten im Satz
        if (neuerSatz && !/[.!?:…]$/.test(s)) s += '.';
      } else if (!/[.!?:…]$/.test(s)) s += '.';
      txt += (txt ? ' ' : '') + s;
    });
    return txt.replace(/\s+([,.!?:])/g, '$1').trim();
  };

  // ------------------------------------------------------------ Sprechen
  function setzeSprechen(v) {
    if (A.spricht === v) return;
    A.spricht = v;
    A.beiSprechen.forEach(f => { try { f(v); } catch (e) { } });
    if (A.ctx && A.musikGain) {
      A.musikGain.gain.cancelScheduledValues(A.ctx.currentTime);
      A.musikGain.gain.setTargetAtTime(v ? MUSIK_LEISE : MUSIK_LAUT, A.ctx.currentTime, 0.15);
    }
  }
  A.stopp = function () {
    const l = A.laeuft;
    A.laeuft = null;
    if (l) {
      (l.quellen || []).forEach(q => { try { q.stop(); } catch (e) { } });
      if (l.timer) clearTimeout(l.timer);
      if (l.resolve) l.resolve(false);
    }
    if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) { } }
    setzeSprechen(false);
  };

  // Sagt eine Ansage. Gibt ein Promise zurück, das nach dem Ende (true) oder beim Abbruch (false) erfüllt wird.
  // opt.blase: 'start' | 'uebung' – den Text zusätzlich in der Sprechblase zeigen (opt.blasenTeile: nur diese Teile)
  A.sag = function (teile, opt) {
    opt = opt || {};
    A.stopp();
    const segs = A.zerlege(teile);
    if (!segs.length) return Promise.resolve(true);
    const nr = opt.blase ? MW.blase.zeige(A.anzeige(opt.blasenTeile || teile), opt.blase) : 0;
    const alleDa = A.ctx && segs.every(s => s.pause || A.hat(s.key));
    const p = alleDa ? spieleAufnahmen(segs, opt) : sprichMitGeraet(A.text(teile), opt);
    if (nr) p.then(() => MW.blase.weg(nr, opt.blase));
    return p;
  };

  // ------------------------------------------------------------ Sprechblase
  let blasenNr = 0;
  MW.blase = {
    zeige(text, wo) {
      const b = document.querySelector('.sprechblase[data-blase="' + wo + '"]');
      if (!b || !text) return 0;
      b.textContent = text; b.hidden = false;
      b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
      b._seit = Date.now(); b._lesen = Math.min(7000, 1400 + text.length * 45);   // mindestens so lange zum Lesen
      return (b._nr = ++blasenNr);
    },
    weg(nr, wo) {
      const b = document.querySelector('.sprechblase[data-blase="' + wo + '"]');
      if (!b || (nr && b._nr !== nr)) return;
      const rest = Math.max(700, (b._lesen || 0) - (Date.now() - (b._seit || 0)));
      setTimeout(() => { if (!nr || b._nr === nr) b.hidden = true; }, nr ? rest : 0);
    },
    alleWeg() { document.querySelectorAll('.sprechblase').forEach(b => { b._nr = ++blasenNr; b.hidden = true; }); }
  };

  async function spieleAufnahmen(segs, opt) {
    const eintrag = { quellen: [], timer: null, resolve: null };
    A.laeuft = eintrag;
    const puffer = await Promise.all(segs.map(s => s.pause ? null : A.lade(s.key)));
    if (A.laeuft !== eintrag) return false;
    if (puffer.some((p, i) => !segs[i].pause && !p)) { A.laeuft = null; return sprichMitGeraet(A.text(segs.map(s => s.pause ? { pause: s.pause } : s.key)), opt); }
    if (A.ctx.state !== 'running') { try { await A.ctx.resume(); } catch (e) { } }
    return new Promise(resolve => {
      eintrag.resolve = resolve;
      let t = A.ctx.currentTime + 0.04;
      const fade = 0.008;
      segs.forEach((s, i) => {
        if (s.pause) { t += s.pause / 1000; return; }
        const p = puffer[i];
        if (i > 0 && !segs[i - 1].pause) t += s.join ? -0.012 : 0.07;
        const dauer = p.bis - p.von;
        const q = A.ctx.createBufferSource(); q.buffer = p.buf;
        const g = A.ctx.createGain();
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + fade);
        g.gain.setValueAtTime(1, t + dauer - fade); g.gain.linearRampToValueAtTime(0, t + dauer);
        q.connect(g); g.connect(A.sprachGain);
        q.start(t, p.von, dauer);
        eintrag.quellen.push(q);
        t += dauer;
      });
      setzeSprechen(true);
      const ms = Math.max(50, (t - A.ctx.currentTime) * 1000);
      eintrag.timer = setTimeout(() => {
        if (A.laeuft === eintrag) { A.laeuft = null; setzeSprechen(false); }
        resolve(true);
      }, ms + 30);
    });
  }

  // iPad-Stimme (nur Notlösung, wenn eine Aufnahme fehlt)
  let geraeteStimme = null;
  function waehleStimme() {
    if (!('speechSynthesis' in window)) return null;
    const v = window.speechSynthesis.getVoices() || [];
    const de = v.filter(x => /^de(-|_|$)/i.test(x.lang));
    if (!de.length) return null;
    const maennlich = /(markus|martin|yannick|viktor|helmut|stefan|klaus|thomas|hans|daniel)/i;
    return de.find(x => maennlich.test(x.name) && x.localService) || de.find(x => maennlich.test(x.name)) ||
      de.find(x => /de-DE/i.test(x.lang) && x.default) || de.find(x => /de-DE/i.test(x.lang)) || de[0];
  }
  if ('speechSynthesis' in window) {
    try {
      geraeteStimme = waehleStimme();
      window.speechSynthesis.addEventListener('voiceschanged', () => { geraeteStimme = waehleStimme(); });
    } catch (e) { }
  }
  function sprichMitGeraet(text, opt) {
    const eintrag = { quellen: [], timer: null, resolve: null };
    A.laeuft = eintrag;
    return new Promise(resolve => {
      eintrag.resolve = resolve;
      const fertig = ok => {
        if (eintrag.timer) clearTimeout(eintrag.timer);
        if (A.laeuft === eintrag) { A.laeuft = null; setzeSprechen(false); }
        resolve(ok);
      };
      if (!('speechSynthesis' in window) || !text) {
        // ohne Sprachausgabe: wenigstens eine passende Wartezeit
        setzeSprechen(true);
        eintrag.timer = setTimeout(() => fertig(true), Math.min(4000, 400 + text.length * 45));
        return;
      }
      try {
        const u = new SpeechSynthesisUtterance(text.replace(/ … /g, ', '));
        u.lang = 'de-DE'; u.rate = 0.92; u.pitch = 0.95;
        if (!geraeteStimme) geraeteStimme = waehleStimme();
        if (geraeteStimme) u.voice = geraeteStimme;
        u.onend = () => fertig(true);
        u.onerror = () => fertig(false);
        setzeSprechen(true);
        window.speechSynthesis.speak(u);
        // Sicherheitsnetz: Safari meldet das Ende nicht immer
        eintrag.timer = setTimeout(() => fertig(true), 2500 + text.length * 110);
      } catch (e) { fertig(false); }
    });
  }

  // ------------------------------------------------------------ Musik: Stück 1 auf dem Startbildschirm, Stück 2 bei der Übungsauswahl
  // Gestreamt über <audio> (wenig Speicher), Lautstärke über Web Audio (iPad: element.volume geht nicht).
  const MUSIK = { start: 'audio/musik-start.mp3', auswahl: 'audio/musik-auswahl.mp3' };
  const MUSIK_LAUT = 0.34, MUSIK_LEISE = 0.10;
  const stuecke = {};
  function stueck(name) {
    if (stuecke[name]) return stuecke[name];
    const el = new Audio();
    el.src = MUSIK[name]; el.loop = true; el.preload = 'auto';
    el.setAttribute('playsinline', '');
    const s = { el, gain: null, timer: null };
    try {
      const q = A.ctx.createMediaElementSource(el);
      s.gain = A.ctx.createGain(); s.gain.gain.value = 0;
      q.connect(s.gain); s.gain.connect(A.musikGain);
    } catch (e) { s.gain = null; el.volume = 0.3; }
    return (stuecke[name] = s);
  }
  function blende(s, an) {
    if (s.timer) { clearTimeout(s.timer); s.timer = null; }
    if (s.gain) {
      s.gain.gain.cancelScheduledValues(A.ctx.currentTime);
      s.gain.gain.setTargetAtTime(an ? 1 : 0, A.ctx.currentTime, an ? 0.35 : 0.22);
    }
    if (an) { const p = s.el.play(); if (p && p.catch) p.catch(() => { }); }
    else s.timer = setTimeout(() => { try { s.el.pause(); } catch (e) { } }, s.gain ? 1200 : 0);
  }
  A.pausiereMusik = function () { Object.keys(stuecke).forEach(n => { try { stuecke[n].el.pause(); } catch (e) { } }); };
  // A.musik('start' | 'auswahl' | null); ohne Angabe: Einstellung (an/aus) neu anwenden
  A.musik = function (name) {
    if (name !== undefined) A.musikStueck = name;
    if (!A.ctx) return;
    const an = !!MW.speicher.einstellung('musik');
    A.musikGain.gain.cancelScheduledValues(A.ctx.currentTime);
    A.musikGain.gain.setTargetAtTime(A.spricht ? MUSIK_LEISE : MUSIK_LAUT, A.ctx.currentTime, 0.2);
    Object.keys(MUSIK).forEach(n => {
      const soll = an && A.musikStueck === n;
      if (soll) blende(stueck(n), true);
      else if (stuecke[n]) blende(stuecke[n], false);
    });
  };

  // ------------------------------------------------------------ Effekte (mit Web Audio erzeugt, keine Dateien)
  function ton(freq, start, dauer, opt) {
    opt = opt || {};
    const c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = opt.typ || 'sine';
    o.frequency.setValueAtTime(freq, start);
    if (opt.bis) o.frequency.exponentialRampToValueAtTime(opt.bis, start + dauer);
    const v = opt.laut || 0.2;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(v, start + (opt.an || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0008, start + dauer);
    o.connect(g); g.connect(opt.ziel || A.effektGain);
    o.start(start); o.stop(start + dauer + 0.02);
  }
  function rauschen(start, dauer, freq, laut) {
    const c = A.ctx, n = Math.floor(c.sampleRate * dauer), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 37));
    const q = c.createBufferSource(); q.buffer = b;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.3;
    const g = c.createGain();
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(laut, start + 0.01);
    g.gain.setValueAtTime(laut, start + dauer * 0.7); g.gain.linearRampToValueAtTime(0, start + dauer);
    q.connect(f); f.connect(g); g.connect(A.effektGain);
    q.start(start); q.stop(start + dauer + 0.02);
  }
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  A.effekt = function (name) {
    if (!A.ctx || !MW.speicher.einstellung('effekte')) return;
    if (A.ctx.state !== 'running') { try { A.ctx.resume(); } catch (e) { } }
    const t = A.ctx.currentTime + 0.01;
    switch (name) {
      case 'klick': ton(1250, t, 0.05, { laut: 0.08, typ: 'triangle' }); break;
      case 'richtig': ton(NOTE(84), t, 0.35, { laut: 0.16, typ: 'triangle' }); ton(NOTE(91), t + 0.09, 0.5, { laut: 0.14, typ: 'triangle' }); break;
      case 'falsch': ton(NOTE(57), t, 0.22, { laut: 0.16, typ: 'triangle' }); ton(NOTE(53), t + 0.16, 0.32, { laut: 0.14, typ: 'triangle' }); break;
      case 'blitzfalsch': ton(NOTE(50), t, 0.18, { laut: 0.15, typ: 'triangle' }); break;
      case 'kreide': for (let i = 0; i < 3; i++) rauschen(t + i * 0.11 + Math.random() * 0.02, 0.07 + Math.random() * 0.03, 3800 + Math.random() * 1200, 0.22); break;
      case 'tick': ton(NOTE(76), t, 0.12, { laut: 0.12, typ: 'sine' }); break;
      case 'los': ton(NOTE(84), t, 0.3, { laut: 0.16, typ: 'triangle' }); ton(NOTE(88), t, 0.3, { laut: 0.1, typ: 'sine' }); break;
      case 'fanfare': [72, 76, 79, 84].forEach((n, i) => ton(NOTE(n), t + i * 0.1, 0.3, { laut: 0.13, typ: 'triangle' }));
        [72, 76, 79, 84].forEach(n => ton(NOTE(n), t + 0.42, 0.9, { laut: 0.07, typ: 'triangle' })); break;
      case 'jubel': [72, 74, 76, 79, 81, 84, 86, 88].forEach((n, i) => ton(NOTE(n), t + i * 0.06, 0.35, { laut: 0.11, typ: 'triangle' }));
        [96, 100, 103].forEach((n, i) => ton(NOTE(n), t + 0.5 + i * 0.05, 0.7, { laut: 0.05, typ: 'sine' })); break;
      case 'auf': ton(NOTE(79), t, 0.12, { laut: 0.08, typ: 'sine' }); ton(NOTE(84), t + 0.06, 0.18, { laut: 0.08, typ: 'sine' }); break;
      default: break;
    }
  };

  // ------------------------------------------------------------ Sprech-Hilfen für Uhrzeit und Geld
  MW.uhrTeile = function (h, m) {   // umgangssprachlich: halb vier, Viertel nach drei
    const h12 = ((h + 11) % 12) + 1, naechste = (h12 % 12) + 1;
    const stunde = x => x === 1 ? 'zahlen/001' : x;
    if (m === 0) return [x1(h12), 'woerter/uhr'];
    if (m === 15) return ['woerter/viertel_nach', stunde(h12)];
    if (m === 30) return ['woerter/halb', stunde(naechste)];
    if (m === 45) return ['woerter/viertel_vor', stunde(naechste)];
    return [h12, 'woerter/uhr', m];
    function x1(x) { return x === 1 ? 'zahlen/ein' : x; }
  };
  MW.euroTeile = function (euro, cent) {
    const t = [];
    if (euro > 0) { t.push(euro === 1 ? 'zahlen/ein' : euro); t.push('woerter/euro'); }
    if (cent > 0) { t.push(cent); if (euro === 0) t.push('woerter/cent'); }
    if (!t.length) t.push(0, 'woerter/euro');
    return t;
  };

})(window.MW);
