/* Mathewolf – Übungen der Vorschule (Zahlenraum bis 10, BEP Hessen)
   Jede Übung ist ein Datensatz. Texte unter „texte“ werden vorgelesen (Audio-Schlüssel uebungen/<id>_…). */
'use strict';

MW.uebung({
  id: 'V-01', stufe: 'V', titel: 'Wie viele?', feld: 'ZO', symbol: '🍎',
  aufgabenProRunde: 5, eingabe: 'zahlenkarten', hilfe: 'plaettchen', generator: 'zaehlen', parameter: {},
  texte: {
    name: 'Wie viele?',
    aufgabe: 'Zähle genau und tippe die richtige Zahl an. Du kannst die Dinge antippen, dann zähle ich mit.',
    tipps: ['Tippe jedes Ding einmal an. Ich zähle mit!', 'Zähle langsam, eins nach dem anderen.', 'Schau aufs Bild: Eine volle Reihe sind fünf Plättchen.'],
    saetze: {
      aepfel: 'Wie viele Äpfel siehst du?', sterne: 'Wie viele Sterne siehst du?', fische: 'Wie viele Fische siehst du?',
      blumen: 'Wie viele Blumen siehst du?', kaefer: 'Wie viele Marienkäfer siehst du?', autos: 'Wie viele Autos siehst du?',
      baelle: 'Wie viele Bälle siehst du?', enten: 'Wie viele Enten siehst du?', erdbeeren: 'Wie viele Erdbeeren siehst du?',
      ballons: 'Wie viele Luftballons siehst du?'
    }
  }
});

MW.uebung({
  id: 'V-02', stufe: 'V', titel: 'Blitzblick', feld: 'ZO', symbol: '🎲',
  aufgabenProRunde: 5, eingabe: 'auswahl', hilfe: 'wuerfelbild', generator: 'blitzblick', parameter: {},
  texte: {
    name: 'Blitzblick',
    aufgabe: 'Schau genau hin! Das Bild ist nur ganz kurz zu sehen.',
    tipps: ['Du kannst das Bild nochmal anschauen. Tippe auf das Auge.', 'Beim Würfel helfen dir die Muster: Die Fünf sieht aus wie ein Kreuz mit einem Punkt in der Mitte.', 'Eine ganze Hand hat fünf Finger.'],
    saetze: { wuerfel: 'Wie viele Punkte hat der Würfel?', finger: 'Wie viele Finger siehst du?' }
  }
});

MW.uebung({
  id: 'V-03', stufe: 'V', titel: 'Mehr oder weniger?', feld: 'ZO', symbol: '⚖️',
  aufgabenProRunde: 5, eingabe: 'antippen', hilfe: 'zuordnen', generator: 'mengenVergleich', parameter: {},
  texte: {
    name: 'Mehr oder weniger?',
    aufgabe: 'Vergleiche die beiden Gruppen. Tippe die richtige Gruppe an. Sind es gleich viele, tippe auf das Gleich-Zeichen.',
    tipps: ['Verbinde immer eins von links mit eins von rechts. Wo bleibt etwas übrig?', 'Zähle beide Gruppen und vergleiche die Zahlen.'],
    saetze: { mehr: 'Wo sind mehr? Oder sind es gleich viele?', weniger: 'Wo sind weniger? Oder sind es gleich viele?' }
  }
});

MW.uebung({
  id: 'V-04', stufe: 'V', titel: 'Zahl und Menge', feld: 'ZO', symbol: '🔢',
  aufgabenProRunde: 5, eingabe: 'auswahl', hilfe: 'plaettchen', generator: 'zahlMenge', parameter: {},
  texte: {
    name: 'Zahl und Menge',
    aufgabe: 'Finde das Bild, das zur Zahl passt.',
    tipps: ['Zähle in jedem Bild nach.', 'Schau aufs Bild: Eine volle Reihe sind fünf Plättchen.'],
    saetze: { frage: 'Welches Bild passt zu dieser Zahl:' }
  }
});

MW.uebung({
  id: 'V-05', stufe: 'V', titel: 'Zahlenreihe', feld: 'ZO', symbol: '➡️',
  aufgabenProRunde: 5, eingabe: 'zahlenkarten', hilfe: 'zahlenstrahl', generator: 'zahlenreihe', parameter: { max: 10 },
  texte: {
    name: 'Zahlenreihe',
    aufgabe: 'Welche Zahl fehlt in der Reihe?',
    tipps: ['Zähle von vorne. Welche Zahl kommt als Nächstes?', 'Schau auf den Zahlenstrahl. Da stehen alle Zahlen der Reihe nach.']
  }
});

MW.uebung({
  id: 'V-06', stufe: 'V', titel: 'Formen finden', feld: 'RF', symbol: '🔺',
  aufgabenProRunde: 3, eingabe: 'antippen', hilfe: 'form', generator: 'formen', parameter: {},
  texte: {
    name: 'Formen finden',
    aufgabe: 'Tippe alle passenden Formen an. Dann tippe auf OK.',
    tipps: [],
    saetze: {
      kreis: 'Tippe alle Kreise an!', dreieck: 'Tippe alle Dreiecke an!', viereck: 'Tippe alle Vierecke an!',
      tipp_kreis: 'Ein Kreis ist ganz rund und hat keine Ecken.',
      tipp_dreieck: 'Ein Dreieck hat drei Ecken. Zähle die Ecken!',
      tipp_viereck: 'Ein Viereck hat vier Ecken. Auch lange Rechtecke sind Vierecke.'
    }
  }
});

MW.uebung({
  id: 'V-07', stufe: 'V', titel: 'Muster fortsetzen', feld: 'MS', symbol: '🔴',
  aufgabenProRunde: 5, eingabe: 'ziehen', hilfe: 'muster', generator: 'muster', parameter: {},
  texte: {
    name: 'Muster fortsetzen',
    aufgabe: 'Wie geht das Muster weiter? Zieh das passende Teil in die Lücke.',
    tipps: ['Sprich das Muster leise mit: rot, blau, rot, blau. Was kommt dann?', 'Suche das Stück, das sich immer wiederholt.'],
    saetze: { frage: 'Was kommt als Nächstes?' }
  }
});

MW.uebung({
  id: 'V-08', stufe: 'V', titel: 'Wo ist was?', feld: 'RF', symbol: '📦',
  aufgabenProRunde: 5, eingabe: 'antippen', hilfe: 'bereich', generator: 'lage', parameter: {},
  texte: {
    name: 'Wo ist was?',
    aufgabe: 'Hör genau zu und tippe das richtige Ding an. Dann tippe auf OK.',
    tipps: ['Schau auf den gelben Bereich. Dort ist das Ding, das ich suche.', 'Links und rechts: Halte deine Hände hoch. Die linke Hand macht mit Daumen und Zeigefinger ein L.'],
    saetze: {
      auf: 'Was liegt auf dem Tisch?', unter: 'Was liegt unter dem Tisch?', links: 'Was ist links neben dem Tisch?',
      rechts: 'Was ist rechts neben dem Tisch?', ueber: 'Was schwebt über dem Tisch?',
      kiste_auf: 'Was liegt auf der Kiste?', kiste_vor: 'Was steht vor der Kiste?', kiste_hinter: 'Was versteckt sich hinter der Kiste?',
      kiste_links: 'Was ist links neben der Kiste?', kiste_rechts: 'Was ist rechts neben der Kiste?',
      zwischen: 'Was liegt zwischen den beiden Kisten?'
    }
  }
});

MW.uebung({
  id: 'V-09', stufe: 'V', titel: 'Der Größe nach', feld: 'GM', symbol: '✏️',
  aufgabenProRunde: 3, eingabe: 'ziehen', hilfe: 'vergleichen', generator: 'ordnen', parameter: {},
  texte: {
    name: 'Der Größe nach',
    aufgabe: 'Ordne der Größe nach. Zieh ein Teil auf ein anderes, dann tauschen sie die Plätze. Zum Schluss tippe auf OK.',
    tipps: ['Such zuerst den kleinsten und stell ihn an den Anfang.', 'Vergleiche immer zwei nebeneinander: Welcher ist größer?'],
    saetze: { stifte: 'Ordne die Stifte. Der kürzeste kommt nach oben, der längste nach unten.', tuerme: 'Ordne die Türme. Der kleinste kommt nach links, der größte nach rechts.' }
  }
});

MW.uebung({
  id: 'V-10', stufe: 'V', titel: 'Dazu und weg', feld: 'ZO', symbol: '🐦',
  aufgabenProRunde: 5, eingabe: 'zahlenkarten', hilfe: 'plaettchen', generator: 'geschichte', parameter: {},
  texte: {
    name: 'Dazu und weg',
    aufgabe: 'Hör gut zu und schau genau hin. Wie viele sind es am Ende?',
    tipps: ['Dazu heißt: Es werden mehr. Weg heißt: Es werden weniger.', 'Zähle am Ende alle, die noch da sind.'],
    saetze: {
      voegel_sitzen: 'Vögel sitzen auf dem Ast.', ein_vogel: 'Ein Vogel sitzt auf dem Ast.',
      fliegen_dazu: 'fliegen dazu.', einer_dazu: 'Einer fliegt dazu.', fliegen_weg: 'fliegen weg.', einer_weg: 'Einer fliegt weg.',
      frage_voegel: 'Wie viele Vögel sitzen jetzt auf dem Ast?',
      aepfel_liegen: 'Äpfel liegen im Korb.', ein_apfel: 'Ein Apfel liegt im Korb.',
      kommen_dazu: 'kommen dazu.', einer_kommt: 'Einer kommt dazu.', nehme_heraus: 'nehme ich heraus.', einen_heraus: 'Einen nehme ich heraus.',
      frage_aepfel: 'Wie viele Äpfel liegen jetzt im Korb?'
    }
  }
});
