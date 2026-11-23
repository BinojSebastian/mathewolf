# Mathewolf – Entscheidungen

Was in der Umsetzung festgelegt wurde, wo die Produktbeschreibung offen war, und wo bewusst abgewichen wurde.

## Version 2.0 (22.11.2026): neue Aufmachung, echte Stimme, eigene Musik

| Punkt | Entscheidung |
| --- | --- |
| Lernmodus | **Helle Karte** statt grüner Tafel: weiße Karte mit runden Ecken über dem weichgezeichneten Klassenzimmer. Zahlen dunkel, Rechenzeichen in Schlaublau, Lücken mit blauem Rahmen, richtig grün, Lösung rot. |
| Professor Wolf | Startbildschirm und Stufenwahl: am Pult (Bild der Eltern). Beim Üben steht er neben der Karte: winkt (Rundenstart), zeigt (Aufgabe, Tipp, Lösung), Daumen hoch (richtig), lacht (Rundenende, mit Hüpfer bei mehr als der Hälfte der Punkte). Bei der Übungsauswahl zeigt er von rechts unten auf die Kacheln. |
| Sprechblasen | Was Professor Wolf sagt, steht kurz in einer Sprechblase: Begrüßung, Stufenansage, Rundenstart mit Aufgabe, Lob, Fehler-Satz, Lösung, Rundenende. Der Tipp steht zusätzlich über dem Rechenbild. So geht es auch bei ausgeschaltetem Ton. |
| Musik | Zwei Stücke der Eltern: „Running Late Again“ auf dem Startbildschirm, „Three Cups of Coffee“ bei der Übungsauswahl (Reihenfolge wie hochgeladen). Beim Üben keine Musik. Weiche Übergänge, leiser während Professor Wolf spricht. Gestreamt statt ganz im Speicher. |
| Stimme | ElevenLabs-Aufnahmen der Eltern (Starter-Tarif oder höher, daher keine Namensnennung in der App). ElevenLabs macht zwischen den Texten kaum Pausen, deshalb schneidet `werkzeug/stimme-schneiden.py` jetzt mit einer Vergleichsstimme und Zeitverzerrung; alle 595 Bausteine geschnitten, Whisper meldet nur 2 kurze Wörter („elf“, „Uhr“) als abweichend gehört. Zur Begrüßung wartet die App höchstens 2,5 Sekunden auf das Stimmenpaket. |
| iPad-Lage | Quer und hoch gleich wichtig: im Querformat Wolf links, Karte Mitte, Eingabe rechts; im Hochformat Karte oben, Eingabe unten, Wolf unten links. Geprüft auch auf iPad mini und iPad Pro 12,9″. |
| Stufenfarben | Vorschule Mathe-Gelb, Klasse 1 Schlaublau, Klasse 3 Tweed-Braun; dazu für Klasse 2 ein Salbeigrün und für Klasse 4 ein Lila, damit sich alle fünf Stufen klar unterscheiden. Jede Stufe zeigt „x von 10 geschafft“. |
| Übungskacheln | Symbolfeld eingefärbt nach Leitidee: Zahlen und Operationen blau, Muster und Strukturen gelb, Größen und Messen braun, Raum und Form grün, Daten und Zufall lila. |

## Mit den Eltern geklärt

| Punkt | Entscheidung |
| --- | --- |
| Stimme | Die Eltern vertonen die Sprechtexte selbst mit ElevenLabs. Bis dahin liest die iPad-Stimme. Werkzeuge: `werkzeug/sprechtexte.js` (Texte in Blöcken) und `werkzeug/stimme-schneiden.py` (Aufnahmen schneiden). |
| Schriftliche Subtraktion | Noch offen, welches Verfahren die Klasse lernt. Voreingestellt: **Abziehen mit Entbündeln**; umstellbar in `daten/uebungen-klasse3.js` (`verfahren: 'ergaenzen'` für Ergänzen mit Erweitern). Das Ergebnis wird in beiden Fällen gleich geprüft; Tipps und Hilfskästchen passen sich an. |
| Zahlenhaus | **Ohne** Zerlegungen mit 0 (also 1 + 6 bis 6 + 1). Umstellbar mit `mitNull: true` bei K1-01. |
| Übergabe | Als ZIP zum Hochladen auf GitHub Pages. |

## Technik

| Punkt | Umsetzung |
| --- | --- |
| Audio-Dateien | Statt rund 600 Einzeldateien ein Paket `audio/stimme-<version>.mp3` mit Verzeichnis `audio/stimme.json` (wie beim Lese-Meister): ein Download, sicher offline. Die Schlüssel folgen der Beschreibung: `zahlen/045`, `woerter/plus`, `uebungen/k1_07_aufgabe`, `rahmen/…`. Gleiche Sätze werden nur einmal aufgenommen. |
| Zahlen sprechen | Bausteine 0–100, „einhundert“ bis „neunhundert“, „tausend“, „ein“ (für eintausend) und „eine Million“; Stille wird beim Laden abgeschnitten, Bausteine einer Zahl werden mit 12 ms Überblendung aneinandergesetzt. |
| Musik | Version 1: eigene Melodie; seit Version 2 die Stücke der Eltern (siehe oben). |
| Effekte | Direkt in der App mit Web Audio erzeugt (Klick, Kreide, richtig, sanfter Fehlerton, Fanfare, Jubel) – keine Dateien nötig. |
| Stumm-Schalter | Die App spielt Ton auch bei eingeschaltetem Stumm-Schalter des iPads (Audio-Session „playback“). |
| Punkte | Werden sofort nach jeder richtigen Antwort gespeichert; wer abbricht, behält sie (wie beschrieben). Nach drei Runden rechnet die Tafel zusammen und zeigt den Gesamtstand. |
| Generator-Test | `node werkzeug/test-generatoren.js`: 1.000 × 3 Runden je Übung und Blitzrechnen, rund 935.000 Aufgaben, keine Regelverstöße. |

## Bilder

- Seit Version 2 die Bilder der Eltern: Wolf am Pult, Klassenzimmer, vier Posen (freigestellt, gemeinsame Leinwand). Das App-Icon zeigt den Kopf aus „winkt“ auf Mathe-Gelb.
- Noch ohne eigenes Bild: nachdenklich (nach einem Fehler) → zeigt, Kreide → zeigt.
- Gegenstände in Aufgaben (Äpfel, Vögel, Teddy …) sind Emojis des iPads; Formen, Münzen, Scheine (vereinfacht wie Spielgeld), Uhr, Körper und Rechenbilder sind eigene Zeichnungen.

## Übungen – Festlegungen im Detail

| Übung | Festlegung |
| --- | --- |
| Alle | Jede Aufgabe wird vorgelesen; das Kind darf schon während der Ansage antworten. Rechenbilder helfen, verraten aber das Ergebnis nicht direkt (z. B. „?“ am Ende des Rechenstrichs). |
| Lücken-Übungen | Zahlenhaus, Zahlenmauer, Rechendreieck: jede Lücke ist ein Punkt in der Fortschrittsanzeige. Die Rundenlänge hängt daher von der Aufgabe ab (Zahlenhaus mit Dach 3: 2 Lücken, Dach 10: 9 Lücken). Lücken sind immer Schritt für Schritt lösbar und damit eindeutig. |
| V-01 Wie viele? | Dinge lassen sich antippen; Professor Wolf zählt mit. |
| V-02, K1-03 Blitzblick | Bild 2 bzw. 1,8 Sekunden sichtbar, „Nochmal zeigen“ beliebig oft. Fingerbilder zählen mit dem Daumen beginnend. |
| V-05 Zahlenreihe | Zahlenraum bis 10 (Parameter `max: 20` möglich). |
| V-08 Wo ist was? | Szenen mit Tisch, Kiste oder zwei Kisten; „auf“ und „hinter“ der Kiste kommen nie gleichzeitig vor. |
| K1-02 … K4-01 Schieber | Der Regler zeigt keine Zahl an; beschriftet sind nur die großen Striche. |
| K1-10, K2-09 Geld | Geld antippen oder ins Feld ziehen; nur ganze Euro. Wechselgeld- und Preis-Aufgaben ohne vorgegebene Rechnung (das Kind wählt die Rechenart). |
| K2-02 Zehner und Einer | Beim Legen zählt nur die Bündelung mit höchstens 9 Einern. |
| K2-05 Einmaleins | Vor dem Start Reihe 1–10 oder „Mix“; „3 · 7“ heißt drei Siebener. In der Einerreihe gilt die Regel „höchstens eine triviale Aufgabe“ nicht. |
| K2-08 Uhrzeit | Antworten als Digitalzeit (3:15); nach der Antwort sagt Professor Wolf die Uhrzeit umgangssprachlich („Viertel nach drei“). |
| K3-04 … K4-05 schriftlich | Ergebnis Stelle für Stelle, Fokus springt weiter; kleine Kästchen für Überträge bzw. Entbündeln sind freiwillig und werden nicht bewertet. Nach einem Fehler werden nur die falschen Ziffern geleert. |
| K4-04 multiplizieren | Deutsches Normalverfahren: zuerst mit der Zehnerziffer des zweiten Faktors, jede Zeile endet unter ihrer Ziffer, dann addieren. |
| K4-05 dividieren | Schreibweise mit Minuszeichen und Strichen; heruntergeholte Ziffern schreibt das Kind selbst. Ohne Null im Ergebnis und ohne Zwischenergebnis 0 (sonst entstünden Schreibweisen, die Schulen unterschiedlich handhaben). |
| K3-09 Längen und Gewichte | Zahlenraum bis 1.000: Kilometer und Kilogramm nur als „1 km = 1.000 m“ und in Vergleichen. |
| K4-02 Große Zahlen | Die vorgelesene Zahl steht zusätzlich als Wort an der Tafel (falls der Ton aus ist). |
| K4-03 Runden | Zahlen von 1.001 bis 99.999; ab 5 wird aufgerundet. |
| K3-10 Körper erkennen | Kegel, Kugel und Zylinder werden nur benannt, Ecken und Flächen nur bei Würfel, Quader und Pyramide gefragt (bei runden Körpern zählen Schulen unterschiedlich). |
| Blitzrechnen Vorschule | Das Bild bleibt stehen, Eingabe per Ziffernblock (auch 10). |

## Offen

- Optional: eine Pose „nachdenklich“ für Fehler.
- In `LIZENZEN.txt` Stimme (Name) und Herkunft/Lizenz der Musik eintragen.
- Abgleich von Begriffen, Rechenbildern und Zahlenräumen mit „Das Mathebuch“ (Mildenberger), z. B. anhand von Fotos einzelner Seiten.
- Verfahren der schriftlichen Subtraktion bestätigen, sobald die Klasse es lernt.
- Neue Fassung des hessischen Kerncurriculums Mathematik prüfen, sobald sie erscheint (die aktuelle Verordnung gilt bis 31.12.2026).
