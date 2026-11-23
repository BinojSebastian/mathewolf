# Mathewolf

Mathe üben mit Professor Wolf – Web-App für das iPad, Vorschule bis Klasse 4, nach dem hessischen
Kerncurriculum Mathematik Primarstufe. 5 Stufen × 10 Übungsarten = 50 Übungen, dazu je Stufe ein
Blitzrechnen. Keine Konten, kein Tracking, keine Werbung: Punkte und Bestzeiten bleiben auf dem Gerät.

Version 2.0: Klassenzimmer-Hintergrund, Professor Wolf in fünf Bildern (am Pult, winkt, zeigt,
Daumen hoch, lacht), helle Aufgabenkarten, Sprechblasen, Stimme aus ElevenLabs, Musik nur auf dem
Startbildschirm und bei der Übungsauswahl.

## Online stellen (GitHub Pages)

1. Auf GitHub ein neues **öffentliches** Repository anlegen, z. B. `mathewolf`.
2. **Add file › Upload files**: den *Inhalt* dieses Ordners hineinziehen (nicht den Ordner selbst –
   `index.html` muss oben im Repository liegen), dann **Commit changes**.
3. **Settings › Pages**: Source „Deploy from a branch“, Branch `main`, Ordner `/ (root)`, **Save**.
4. Nach ein bis zwei Minuten läuft die App unter `https://<benutzername>.github.io/mathewolf/`.

## Auf dem iPad einrichten

1. Die Adresse in **Safari** öffnen, auf **Teilen** tippen, dann **Zum Home-Bildschirm**.
2. Mathewolf immer über das Icon starten: Die Home-Bildschirm-App speichert Punkte getrennt von Safari.
3. Nach dem ersten Start läuft die App auch ohne Internet.
4. Werden in den iPad-Einstellungen die Website-Daten gelöscht, sind Punkte und Bestzeiten weg.

## Updates

Neue oder geänderte Dateien hochladen (gleiche Namen werden ersetzt). Bei Änderungen an Bildern oder
Ton in `sw.js` die `VERSION` erhöhen (z. B. `mathewolf-1.0.1`), damit das iPad alles neu lädt. Dann die
App auf dem iPad einmal ganz schließen und neu öffnen.

## Die Stimme von Professor Wolf

Die Stimme ist mit ElevenLabs aufgenommen und steckt in `audio/stimme.json` und
`audio/stimme-<version>.mp3` (595 Bausteine). Fehlt ein Baustein, liest die iPad-Stimme die
betroffene Ansage. Zahlen setzt die App aus Bausteinen zusammen (null bis hundert, Hunderter,
„tausend“, „eine Million“), deshalb klingen auch 345.678 ohne Lücke.

Neu aufnehmen (z. B. andere Stimme oder neue Sätze):

1. `node werkzeug/sprechtexte.js` erzeugt `werkzeug/sprechtexte/block-01.txt` … und `liste.json`.
2. Jeden Block mit **derselben Stimme und denselben Einstellungen** vertonen (Modell „Eleven
   Multilingual v2“), Text unverändert einfügen, als `block-01.mp3` … speichern.
3. Schneiden:
   ```
   pip install sherpa-onnx numba     # numba macht es schneller, geht auch ohne
   python3 werkzeug/stimme-schneiden.py --aufnahmen <Ordner mit den MP3> \
       --referenz <vits-piper-de_DE-thorsten-high> --whisper <sherpa-onnx-whisper-small>
   ```
   Beide Modelle gibt es bei den Releases von k2-fsa/sherpa-onnx (tts-models, asr-models).
   ElevenLabs macht zwischen den Texten kaum Pausen; deshalb spricht eine Vergleichsstimme denselben
   Block, und das Skript legt die Aufnahme per Zeitverzerrung daneben. Whisper hört danach jedes Stück
   ab und meldet die wenigen, die anders klingen.
4. `audio/stimme.json` und die neue `audio/stimme-<version>.mp3` hochladen, die alte Datei löschen.

## Musik

`audio/musik-start.mp3` läuft auf dem Startbildschirm, `audio/musik-auswahl.mp3` bei der
Übungsauswahl; beim Üben ist Ruhe. Zum Tauschen einfach Dateien mit denselben Namen hochladen und in
`sw.js` die `VERSION` erhöhen. Musik und Effekte lassen sich auf dem Startbildschirm ausschalten.

## Aufbau

| Datei/Ordner | Inhalt |
| --- | --- |
| `index.html`, `css/app.css` | Seite und Gestaltung (Farben aus dem Style Guide) |
| `js/kern.js` | Zufall mit Startwert, Zahlwörter, Speicher (`mathewolf.v1`), Hilfen |
| `js/audio.js` | Stimme (Bausteine ohne Lücke, iPad-Stimme als Notlösung), Sprechblasen, Musik je Bildschirm, Effekte |
| `js/runde.js` | Rundenablauf, Punkte 2/1/0, Tipp, Lösung, Blitzrechnen, Posen von Professor Wolf |
| `js/app.js` | Start, Stufen- und Übungsauswahl |
| `js/eingaben.js` | Ziffernblock, Zahlenkarten, Auswahl, Ziehen, Schieber |
| `js/bilder.js` | Rechenbilder (Zwanzigerfeld, Hunderterfeld, Rechenstrich, Punktefeld, Stellenwerttafel, Geld, Uhr …) |
| `js/typen/` | Aufgabentypen (wie eine Aufgabe aussieht und geprüft wird) |
| `js/generatoren/` | Aufgabengeneratoren (Zufallszahlen nach festen Regeln) |
| `daten/uebungen-*.js` | **die 50 Übungen**: Titel, Anzahl je Runde, Parameter, alle Sätze und Tipps |
| `daten/blitzrechnen.js`, `daten/rahmen.js` | Blitzrechnen und alle übrigen Sätze (Begrüßung, Lob …) |
| `bilder/wolf/` | Posen von Professor Wolf (WebP, alle auf derselben Leinwand, Füße an derselben Stelle) |
| `bilder/klasse/` | Professor Wolf am Pult (`szene.webp`) und das weichgezeichnete Klassenzimmer |
| `audio/` | Musik (Start, Auswahl) und die Stimme |
| `werkzeug/` | Test der Generatoren, Sprechtexte, Stimme schneiden |

## Übungen ändern

Jede Übung ist ein Datensatz in `daten/uebungen-*.js`, z. B.:

```js
MW.uebung({
  id: 'K1-07', stufe: 'K1', titel: 'Plus und Minus bis 20', feld: 'ZO', symbol: '🧮',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'zwanzigerfeld', generator: 'plusMinus',
  parameter: { max: 20, zehnerUebergang: true, operationen: ['+', '−'] },
  texte: { name: '…', aufgabe: '…', tipps: ['…', '…'] }
});
```

Zahlenräume, Anzahl je Runde und Texte lassen sich dort ändern, ohne den App-Kern anzufassen.
Das Verfahren der schriftlichen Subtraktion steht in `daten/uebungen-klasse3.js` bei K3-05
(`verfahren: 'abziehen'` oder `'ergaenzen'`).

## Prüfen

```
node werkzeug/test-generatoren.js        # je Übung 1.000 Runden × 3 ohne Regelverstoß
```

Geprüft werden Anzahl, Dopplungen, Tauschaufgaben, triviale Aufgaben, Zahlenraum, negative Zahlen,
aufgehende Geteilt-Aufgaben, eindeutige Lücken (Zahlenmauer, Rechendreieck), Auswahl-Antworten und
ob alle Sprechtexte vorhanden sind.

## Bilder von Professor Wolf

`bilder/klasse/szene.webp` (am Pult) ist der Startbildschirm, `bilder/klasse/raum-weich.webp` der
Hintergrund. Die Posen `winkt`, `zeigt`, `daumen`, `lacht` sind freigestellt und liegen auf derselben
Leinwand (887 × 1100 Pixel, Füße bei 42 % der Breite), damit Professor Wolf beim Wechsel nicht springt.
Welche Pose wann kommt, steht in `js/runde.js` bei `MW.POSEN`. Für eine neue Pose (z. B. nachdenklich)
genügt ein Bild auf weißem Hintergrund im selben Stil – freistellen und einsetzen geht dann schnell.

Lizenzen: siehe `LIZENZEN.txt`. Entscheidungen und Abweichungen von der Produktbeschreibung:
`ENTSCHEIDUNGEN.md`.
