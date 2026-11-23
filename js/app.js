/* Mathewolf – Bildschirme und Navigation */
'use strict';
(function (MW) {
  const $ = s => document.querySelector(s);
  const el = MW.el;

  let aktuelleStufe = null, gewaehlteKachel = null, gesagt = new Set();

  const app = MW.app = {
    seite: 'splash',
    zeige(name) {
      document.querySelectorAll('.screen').forEach(s => s.classList.toggle('aktiv', s.id === 's-' + name));
      document.getElementById('app').dataset.seite = name;
      app.seite = name;
      MW.blase.alleWeg();
      // Musik nur auf Start und Auswahl, im Lernmodus ist Ruhe
      MW.audio.musik(name === 'start' || name === 'splash' ? 'start' : name === 'auswahl' ? 'auswahl' : null);
    },
    zurueck() { if (aktuelleStufe) app.zeigeAuswahl(aktuelleStufe); else app.zeigeStart(); },
    zeigeStart, zeigeAuswahl
  };

  function aktualisierePunkte() {
    const g = MW.fmt(MW.speicher.daten.gesamtpunkte);
    $('#gesamt').textContent = g; $('#gesamt2').textContent = g;
  }
  function schalter() {
    $('#t-musik').classList.toggle('aus', !MW.speicher.einstellung('musik'));
    $('#t-effekte').classList.toggle('aus', !MW.speicher.einstellung('effekte'));
  }
  const geschafftIn = stufe => MW.uebungen.filter(u => u.stufe === stufe && MW.speicher.istGeschafft(u.id)).length;
  const anzahlIn = stufe => MW.uebungen.filter(u => u.stufe === stufe).length;

  // ------------------------------------------------------------ Start: Stufen
  function zeigeStart(begruessen) {
    MW.audio.stopp();
    aktualisierePunkte(); schalter();
    const box = $('#stufen'); MW.leeren(box);
    const zuletzt = MW.speicher.einstellung('stufe');
    MW.stufen.forEach(s => {
      const fertig = geschafftIn(s.id), alle = anzahlIn(s.id);
      const balken = el('span.s-balken', el('i', { style: { width: Math.round(100 * fertig / Math.max(1, alle)) + '%' } }));
      const k = el('button.stufe.f-' + s.farbe + (s.id === zuletzt ? '.zuletzt' : ''), { type: 'button', dataset: { stufe: s.id } },
        el('span.s-abzeichen', el('span.bis', { text: 'bis' }), el('span.zahl' + (s.abzeichen.length > 3 ? '.lang' : ''), { text: s.abzeichen })),
        el('span.s-text', el('span.s-name', { text: s.kurz }), el('span.s-raum', { text: 'Zahlen ' + s.raum })),
        el('span.s-stand', el('span', { text: fertig + ' von ' + alle }), balken));
      MW.tipp(k, () => {
        MW.audio.effekt('klick');
        MW.speicher.einstellung('stufe', s.id);
        zeigeAuswahl(s.id, true);
      });
      box.appendChild(k);
    });
    app.zeige('start');
    if (begruessen) MW.audio.sag(['rahmen/begruessung', 'rahmen/stufe_waehlen'], { blase: 'start' });
  }

  // ------------------------------------------------------------ Übungsauswahl
  function zeigeAuswahl(stufe, ansagen) {
    MW.audio.stopp();
    if (!stufe) { zeigeStart(); return; }
    aktuelleStufe = stufe; gewaehlteKachel = null;
    aktualisierePunkte();
    const s = MW.stufe(stufe);
    $('#auswahl-titel').textContent = s.name;
    $('#auswahl-raum').textContent = 'Zahlen ' + s.raum;
    const box = $('#kacheln'); MW.leeren(box);
    MW.uebungen.filter(u => u.stufe === stufe).forEach((u, i) => {
      const k = el('div.kachel.f-' + (u.feld || 'ZO'), { role: 'button', dataset: { id: u.id } },
        el('span.k-nr', { text: String(i + 1) }),
        el('span.k-symbol', { text: u.symbol || '★' }),
        el('span.k-name', { text: u.titel }),
        MW.speicher.istGeschafft(u.id) ? el('span.k-haken', { text: '✓', 'aria-label': 'geschafft' }) : null,
        MW.tipp(el('button.k-start', { type: 'button', text: 'Start ▶' }), () => { MW.audio.effekt('klick'); MW.spiel.starte(u); }));
      k.addEventListener('click', ev => {
        if (ev.target.closest('.k-start')) return;
        waehle(k, u.audio.name, u.id);
      });
      box.appendChild(k);
    });
    const rec = MW.blitz[stufe];
    if (rec) {
      const best = MW.speicher.bestzeit(stufe);
      const k = el('div.kachel.blitz', { role: 'button', dataset: { id: 'blitz-' + stufe } },
        el('span.k-symbol', { text: '⚡' }),
        el('span.k-name', { text: 'Blitzrechnen' }),
        el('span.k-best', { text: best ? 'Bestzeit ' + MW.fmtKomma(best, 1) + ' s' : '10 Aufgaben auf Zeit' }),
        MW.tipp(el('button.k-start', { type: 'button', text: 'Start ▶' }), () => { MW.audio.effekt('klick'); MW.spiel.starteBlitz(stufe); }));
      k.addEventListener('click', ev => { if (ev.target.closest('.k-start')) return; waehle(k, 'blitz/name', 'blitz'); });
      box.appendChild(k);
    }
    app.zeige('auswahl');
    $('#s-auswahl .auswahl-main').scrollTop = 0;
    MW.wolf.pose('zeigt', 'auswahl');
    if (ansagen) MW.audio.sag(['rahmen/stufe_' + stufe, 'rahmen/uebung_waehlen'], { blase: 'auswahl' });
  }
  function waehle(k, nameKey, id) {
    MW.audio.effekt('klick');
    if (gewaehlteKachel && gewaehlteKachel !== k) gewaehlteKachel.classList.remove('gewaehlt');
    gewaehlteKachel = k; k.classList.add('gewaehlt');
    const teile = [nameKey];
    if (!gesagt.has('start')) { teile.push('rahmen/start_tippen'); gesagt.add('start'); }
    MW.audio.sag(teile);
  }

  // ------------------------------------------------------------ Start der App
  document.addEventListener('DOMContentLoaded', () => {
    MW.speicher.laden();
    schalter();
    MW.tipp($('#los'), () => {
      MW.audio.entsperren();
      MW.audio.effekt('klick');
      const stimme = MW.audio.ladeStimme();
      zeigeStart(false);
      Promise.race([stimme, MW.warte(2500)]).then(() => {
        if (app.seite === 'start' && !MW.audio.spricht) MW.audio.sag(['rahmen/begruessung', 'rahmen/stufe_waehlen'], { blase: 'start' });
      });
    });
    // iPadOS verlangt das Freischalten teilweise beim Loslassen des Fingers
    document.addEventListener('touchend', () => { if (MW.audio.ctx && MW.audio.ctx.state !== 'running') MW.audio.entsperren(); }, { passive: true });
    MW.tipp($('#t-musik'), () => { const v = !MW.speicher.einstellung('musik'); MW.speicher.einstellung('musik', v); MW.audio.musik(); schalter(); MW.audio.effekt('klick'); });
    MW.tipp($('#t-effekte'), () => { const v = !MW.speicher.einstellung('effekte'); MW.speicher.einstellung('effekte', v); schalter(); MW.audio.effekt('klick'); });
    document.querySelectorAll('[data-zurueck]').forEach(b => MW.tipp(b, () => { MW.audio.effekt('klick'); zeigeStart(); }));
    // Zoomen und Kontextmenü verhindern (Doppeltipp-Zoom verhindert schon touch-action: manipulation im CSS)
    document.addEventListener('contextmenu', ev => ev.preventDefault());
    document.addEventListener('gesturestart', ev => ev.preventDefault());
    try {
      if ('serviceWorker' in navigator && location.protocol === 'https:') {
        navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Speicher weiter */ });
      }
    } catch (e) { /* z. B. in einer abgeschotteten Vorschau: ohne Offline-Speicher weiter */ }
  });
  // zurück in die App (iPad): Ton wieder anwerfen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (MW.audio.ctx) { try { MW.audio.ctx.resume(); } catch (e) { } }
      MW.audio.musik();
    }
    if (document.visibilityState === 'hidden') { MW.audio.stopp(); MW.audio.pausiereMusik(); }
  });

})(window.MW);
