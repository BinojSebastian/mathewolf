/* Mathewolf – Übungen Klasse 4 (Zahlenraum bis 1.000.000, Kerncurriculum: Ende Jahrgang 4) */
'use strict';

MW.uebung({
  id: 'K4-01', stufe: 'K4', titel: 'Zahlenstrahl bis 1.000.000', feld: 'ZO', symbol: '📏',
  aufgabenProRunde: 5, eingabe: 'schieber', hilfe: 'zahlenstrahl', generator: 'schieber',
  parameter: { max: 1000000, raster: 10000, lang: 100000, mittel: 50000, beschriftung: 200000, schrift: 26 },
  texte: {
    name: 'Zahlenstrahl bis eine Million',
    aufgabe: 'Schieb den gelben Regler auf die Zahl, die ich sage. Jeder kleine Strich ist zehntausend mehr.',
    tipps: ['Such zuerst den richtigen Hunderttausender. Die langen Striche zeigen die Hunderttausender.', 'Jeder kleine Strich ist zehntausend mehr.', 'Fünfhunderttausend steht genau in der Mitte.']
  }
});

MW.uebung({
  id: 'K4-02', stufe: 'K4', titel: 'Große Zahlen', feld: 'ZO', symbol: '🔢',
  aufgabenProRunde: 5, eingabe: 'ziffernblock', hilfe: 'stellenwert', generator: 'grosseZahlen', parameter: {},
  texte: {
    name: 'Große Zahlen',
    aufgabe: 'Große Zahlen in der Stellenwerttafel: HT heißt Hunderttausender, ZT Zehntausender und T Tausender.',
    tipps: ['Lies die Zahl in Dreiergruppen: erst die Tausender, dann der Rest.', 'Fehlt eine Stelle? Dann trägst du eine Null ein.'],
    saetze: { trage: 'Trage die Zahl in die Stellenwerttafel ein:', welche: 'Welche Zahl steht in der Stellenwerttafel?' }
  }
});

MW.uebung({
  id: 'K4-03', stufe: 'K4', titel: 'Runden und Überschlagen', feld: 'ZO', symbol: '≈',
  aufgabenProRunde: 6, eingabe: 'ziffernblock', hilfe: 'zahlenstrahl', generator: 'runden', parameter: {},
  texte: {
    name: 'Runden und Überschlagen',
    aufgabe: 'Runde die Zahlen und überschlage.',
    tipps: ['Schau auf die Ziffer rechts neben der Rundungsstelle. Ist sie fünf oder mehr, rundest du auf. Sonst rundest du ab.', 'Beim Überschlag rundest du beide Zahlen auf glatte Hunderter und rechnest dann.'],
    saetze: { runde: 'Runde', ueberschlag: 'Welcher Überschlag passt zu' }
  }
});

MW.uebung({
  id: 'K4-04', stufe: 'K4', titel: 'Schriftlich multiplizieren', feld: 'ZO', symbol: '📝',
  aufgabenProRunde: 3, eingabe: 'schriftlich', hilfe: 'stellenwert', generator: 'schriftlichMal', parameter: {},
  texte: {
    name: 'Schriftlich multiplizieren',
    aufgabe: 'Rechne schriftlich mal. Fang rechts an und denk an den Übertrag.',
    tipps: ['Multipliziere jede Ziffer der oberen Zahl mit dem Faktor, von rechts nach links.', 'Merke dir den Übertrag und rechne ihn bei der nächsten Stelle dazu.', 'Bei zwei Ziffern rechnest du mit jeder Ziffer eine Zeile. Die Zeile endet genau unter dieser Ziffer. Dann addierst du die Zeilen.']
  }
});

MW.uebung({
  id: 'K4-05', stufe: 'K4', titel: 'Schriftlich dividieren', feld: 'ZO', symbol: '📝',
  aufgabenProRunde: 3, eingabe: 'schriftlich', hilfe: 'schritte', generator: 'schriftlichGeteilt', parameter: {},
  texte: {
    name: 'Schriftlich dividieren',
    aufgabe: 'Rechne schriftlich geteilt. Fang links an.',
    tipps: ['Wie oft passt die Zahl in die ersten Ziffern? Schreib das Ergebnis hinter das Gleichheitszeichen.', 'Rechne dann mal, zieh ab und hol die nächste Ziffer herunter.', 'Der Rest beim Abziehen muss immer kleiner sein als die Zahl, durch die du teilst.']
  }
});

MW.uebung({
  id: 'K4-06', stufe: 'K4', titel: 'Größen mit Komma', feld: 'GM', symbol: '⚖️',
  aufgabenProRunde: 6, eingabe: 'ziffernblock', hilfe: 'umrechnung', generator: 'komma', parameter: {},
  texte: {
    name: 'Größen mit Komma',
    aufgabe: 'Rechne die Größen in die kleinere Einheit um. Das Komma trennt die große von der kleinen Einheit.',
    tipps: ['Ein Euro hat hundert Cent.', 'Ein Kilometer hat tausend Meter, ein Kilogramm hat tausend Gramm.', 'Eine Stunde hat sechzig Minuten. Eine halbe Stunde sind dreißig Minuten.'],
    saetze: {
      halbe: 'Eine halbe Stunde sind wie viele Minuten?', viertel: 'Eine Viertelstunde sind wie viele Minuten?',
      dreiviertel: 'Eine Dreiviertelstunde sind wie viele Minuten?', eineinhalb: 'Eineinhalb Stunden sind wie viele Minuten?'
    }
  }
});

MW.uebung({
  id: 'K4-07', stufe: 'K4', titel: 'Sachaufgaben', feld: 'ZO', symbol: '📖',
  aufgabenProRunde: 3, eingabe: 'ziffernblock', hilfe: 'rechnung', generator: 'sachaufgaben', parameter: {},
  texte: {
    name: 'Sachaufgaben',
    aufgabe: 'Hör gut zu. Was weißt du schon, was ist gefragt?',
    tipps: ['Überlege: Was weißt du schon? Was wird gefragt?', 'Welche Rechenart passt: plus, minus, mal oder geteilt?', 'Mach einen Überschlag: Kann dein Ergebnis stimmen?'],
    saetze: {
      t1a: 'Lena kauft ein Buch für', t1b: 'und ein Spiel für', t1c: 'Wie viel bezahlt sie zusammen?',
      t2a: 'Tom bezahlt mit', t2b: 'Sein Einkauf kostet', t2c: 'Wie viel Geld bekommt er zurück?',
      t3a: 'Ein Heft kostet', t3b: 'Mia kauft', t3c: 'Hefte.', t3d: 'Wie viel muss sie bezahlen?',
      t4a: 'Ein Zug fährt', t4b: 'Dann fährt er noch', t4c: 'Wie viele Kilometer fährt er insgesamt?',
      t5a: 'Bonbons werden gerecht verteilt.', t5b: 'Es sind', t5c: 'Kinder.', t5d: 'Wie viele Bonbons bekommt jedes Kind?',
      t6a: 'Ein Bus hat', t6b: 'Plätze.', t6c: 'Kinder sitzen schon darin.', t6d: 'Wie viele Plätze sind noch frei?',
      t7a: 'Eine Fahrt dauert', t7b: 'Wie viele Minuten sind das?',
      t8a: 'Die Pause dauert', t8b: 'Danach haben die Kinder', t8c: 'Minuten Sport.', t8d: 'Wie viele Minuten sind das zusammen?'
    }
  }
});

MW.uebung({
  id: 'K4-08', stufe: 'K4', titel: 'Umfang und Fläche', feld: 'RF', symbol: '🟩',
  aufgabenProRunde: 4, eingabe: 'ziffernblock', hilfe: 'zaehlhilfe', generator: 'flaeche', parameter: {},
  texte: {
    name: 'Umfang und Fläche',
    aufgabe: 'Der Umfang ist der Weg einmal um die Figur herum. Die Fläche sind alle Kästchen innen.',
    tipps: ['Für den Umfang gehst du einmal ganz um die Figur herum und zählst jede Kästchenseite.', 'Für die Fläche zählst du alle Kästchen. Bei einem Rechteck rechnest du Länge mal Breite.'],
    saetze: { umfang: 'Wie groß ist der Umfang? Zähle die Kästchenlängen am Rand.', flaeche: 'Wie groß ist die Fläche? Zähle die Kästchen.' }
  }
});

MW.uebung({
  id: 'K4-09', stufe: 'K4', titel: 'Diagramme lesen', feld: 'DZ', symbol: '📊',
  aufgabenProRunde: 4, eingabe: 'ziffernblock', hilfe: 'markierung', generator: 'diagramm', parameter: {},
  texte: {
    name: 'Diagramme lesen',
    aufgabe: 'Lies das Diagramm genau ab.',
    tipps: ['Fahre mit dem Finger von der Säule nach links zur Zahl.', 'Bei der Strichliste ist jedes Bündel fünf.', 'Für den Unterschied rechnest du die größere Zahl minus die kleinere.'],
    saetze: {
      obst_wert: 'Wie viele Kinder mögen am liebsten', tier_wert: 'Wie viele Kinder wünschen sich',
      obst_mehr: 'Wie viele Kinder mehr mögen am liebsten', tier_mehr: 'Wie viele Kinder mehr wünschen sich',
      obst_meiste: 'Welches Obst mögen die meisten Kinder?', tier_meiste: 'Welches Haustier wünschen sich die meisten Kinder?',
      summe: 'Wie viele Kinder wurden insgesamt gefragt?',
      n_aepfel: 'Äpfel', n_bananen: 'Bananen', n_birnen: 'Birnen', n_kirschen: 'Kirschen', n_trauben: 'Trauben',
      n_hunde: 'Hunde', n_katzen: 'Katzen', n_kaninchen: 'Kaninchen', n_fische: 'Fische', n_voegel: 'Vögel'
    }
  }
});

MW.uebung({
  id: 'K4-10', stufe: 'K4', titel: 'Zufall', feld: 'DZ', symbol: '🎡',
  aufgabenProRunde: 5, eingabe: 'auswahl', hilfe: 'markierung', generator: 'zufall', parameter: {},
  texte: {
    name: 'Zufall',
    aufgabe: 'Sicher, möglich oder unmöglich? Überlege genau.',
    tipps: ['Sicher heißt: Es passiert auf jeden Fall. Unmöglich heißt: Es kann nie passieren.', 'Möglich heißt: Es kann passieren, muss aber nicht.'],
    saetze: {
      frage: 'Ist es sicher, möglich oder unmöglich,',
      rad_rot: 'dass das Glücksrad auf Rot stehen bleibt?', rad_blau: 'dass das Glücksrad auf Blau stehen bleibt?',
      rad_gelb: 'dass das Glücksrad auf Gelb stehen bleibt?', rad_gruen: 'dass das Glücksrad auf Grün stehen bleibt?',
      kugel_rot: 'eine rote Kugel zu ziehen?', kugel_blau: 'eine blaue Kugel zu ziehen?', kugel_gelb: 'eine gelbe Kugel zu ziehen?', kugel_gruen: 'eine grüne Kugel zu ziehen?',
      wuerfel_klein: 'eine Zahl kleiner als sieben zu würfeln?', wuerfel_sechs: 'eine Sechs zu würfeln?', wuerfel_gerade: 'eine gerade Zahl zu würfeln?',
      wuerfel_eins: 'eine Eins zu würfeln?', wuerfel_sieben: 'eine Sieben zu würfeln?', wuerfel_null: 'eine Null zu würfeln?',
      vergleich_rot: 'Bei welchem Glücksrad ist die Chance größer, auf Rot zu landen?', vergleich_blau: 'Bei welchem Glücksrad ist die Chance größer, auf Blau zu landen?',
      vergleich_gelb: 'Bei welchem Glücksrad ist die Chance größer, auf Gelb zu landen?', vergleich_gruen: 'Bei welchem Glücksrad ist die Chance größer, auf Grün zu landen?',
      ist_sicher: 'Das ist sicher.', ist_moeglich: 'Das ist möglich.', ist_unmoeglich: 'Das ist unmöglich.',
      tipp_vergleich: 'Vergleiche, welcher Teil des Rades diese Farbe hat. Je größer der Teil, desto größer die Chance.'
    }
  }
});
