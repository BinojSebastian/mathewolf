/* Mathewolf – Service Worker: App, Bilder, Schriften und Ton für den Offline-Betrieb speichern.
   Bei jeder Änderung an der App VERSION erhöhen, damit das iPad die neue Fassung lädt. */
const VERSION = 'mathewolf-2.0.1';
const DATEIEN = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/kern.js',
  'js/audio.js',
  'daten/rahmen.js',
  'js/bilder.js',
  'js/eingaben.js',
  'js/typen/basis.js',
  'js/typen/vorschule.js',
  'js/typen/strukturen.js',
  'js/typen/groessen.js',
  'js/typen/raum-daten.js',
  'js/typen/schriftlich.js',
  'js/generatoren/rechnen.js',
  'js/generatoren/vorschule.js',
  'js/generatoren/strukturen.js',
  'js/generatoren/groessen.js',
  'js/generatoren/raum-daten.js',
  'js/generatoren/schriftlich.js',
  'daten/uebungen-vorschule.js',
  'daten/uebungen-klasse1.js',
  'daten/uebungen-klasse2.js',
  'daten/uebungen-klasse3.js',
  'daten/uebungen-klasse4.js',
  'daten/blitzrechnen.js',
  'js/runde.js',
  'js/app.js',
  'bilder/wolf/winkt.webp',
  'bilder/wolf/zeigt.webp',
  'bilder/wolf/daumen.webp',
  'bilder/wolf/lacht.webp',
  'bilder/klasse/szene.webp',
  'bilder/klasse/raum-weich.webp',
  'bilder/icons/icon-180.png',
  'bilder/icons/icon-192.png',
  'bilder/icons/icon-512.png',
  'fonts/fredoka-latin-400-normal.woff2',
  'fonts/fredoka-latin-500-normal.woff2',
  'fonts/fredoka-latin-600-normal.woff2',
  'fonts/fredoka-latin-700-normal.woff2',
  'audio/musik-start.mp3',
  'audio/musik-auswahl.mp3',
  'audio/stimme.json'
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(namen => Promise.all(namen.filter(n => n !== VERSION).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
// Seiten, Skripte und Daten zuerst aus dem Netz (damit Änderungen schnell ankommen), sonst aus dem Speicher.
// Bilder, Schriften und Ton zuerst aus dem Speicher. Stimmenpakete (stimme-<version>.mp3) werden beim ersten Laden gespeichert.
// Musik spielt über <audio>: Safari fragt Teilstücke an (Range) und braucht dann eine 206-Antwort.
async function teilstueck(req) {
  let r = await caches.match(req.url, { ignoreSearch: true });
  if (!r) {
    r = await fetch(req.url);
    if (r.ok) { const c = await caches.open(VERSION); await c.put(req.url, r.clone()); }
  }
  const range = req.headers.get('range');
  if (!range || !r.ok) return r;
  const daten = await r.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const von = m[1] ? parseInt(m[1], 10) : 0, bis = m[2] ? parseInt(m[2], 10) : daten.byteLength - 1;
  return new Response(daten.slice(von, bis + 1), { status: 206, statusText: 'Partial Content', headers: {
    'Content-Type': r.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${von}-${bis}/${daten.byteLength}`,
    'Content-Length': String(bis - von + 1), 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const pfad = new URL(req.url).pathname;
  if (/\/audio\/musik-[a-z]+\.mp3$/.test(pfad)) { ev.respondWith(teilstueck(req).catch(() => fetch(req))); return; }
  const netzZuerst = /\.(html|js|json|css|webmanifest)$/.test(pfad) || pfad.endsWith('/');
  if (netzZuerst) {
    ev.respondWith(fetch(req).then(r => { if (r.ok) { const k = r.clone(); caches.open(VERSION).then(c => c.put(req, k)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then(treffer => treffer || fetch(req).then(r => {
    if (r.ok) { const k = r.clone(); caches.open(VERSION).then(c => c.put(req, k)); }
    return r;
  })));
});
