/* Mathewolf – Übungen Klasse 2 (Zahlenraum bis 100, Kerncurriculum: Schwerpunkt Jahrgang 2) */
'use strict';

MW.uebung({
  id: 'K2-01', stufe: 'K2', titel: 'Zahlenstrahl bis 100', feld: 'ZO', symbol: '📏',
  aufgabenProRunde: 5, eingabe: 'schieber', hilfe: 'zahlenstrahl', generator: 'schieber',
  parameter: { max: 100, raster: 1, lang: 10, mittel: 5, beschriftung: 10, schrift: 30 },
  texte: {
    name: 'Zahlenstrahl bis hundert',
    aufgabe: 'Schieb den gelben Regler auf die Zahl, die ich sage. Mit Minus und Plus kannst du genau einstellen.',
    tipps: ['Such zuerst den richtigen Zehner. Dann zähle die kleinen Striche weiter.', 'Der mittlere Strich zwischen zwei Zehnern ist die Fünf.', 'Mit Minus und Plus geht der Regler immer einen Strich weiter.']
  }
});

MW.uebung({
  id: 'K2-02', stufe: 'K2', titel: 'Zehner und Einer', feld: 'ZO', symbol: '🟦',
  aufgabenProRunde: 5, eingabe: 'ziffernblock', hilfe: 'stellenwert', generator: 'zehnerEiner', parameter: {},
  texte: {
    name: 'Zehner und Einer',
    aufgabe: 'Ein Zehnerstab hat zehn Würfel. Lies die Zahl ab oder lege sie selbst.',
    tipps: ['Zähle zuerst die Zehnerstäbe, dann die Einerwürfel.', 'Die Zehner stehen vorne, die Einer hinten: vier Zehner und sieben Einer sind siebenundvierzig.', 'Zehn Einerwürfel kannst du gegen einen Zehnerstab tauschen.'],
    saetze: { lies: 'Welche Zahl ist das?', lege: 'Lege die Zahl' }
  }
});

MW.uebung({
  id: 'K2-03', stufe: 'K2', titel: 'Immer 100', feld: 'ZO', symbol: '💯',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'hunderterfeld', generator: 'ergaenzen', parameter: { ziel: 100 },
  texte: {
    name: 'Immer hundert',
    aufgabe: 'Ergänze bis hundert.',
    tipps: ['Ergänze erst bis zum nächsten Zehner, dann bis hundert.', 'Zähle die freien Felder im Hunderterfeld: erst die einzelnen, dann die ganzen Zehnerreihen.']
  }
});

MW.uebung({
  id: 'K2-04', stufe: 'K2', titel: 'Plus und Minus bis 100', feld: 'ZO', symbol: '➕',
  aufgabenProRunde: 6, eingabe: 'ziffernblock', hilfe: 'rechenstrich', generator: 'plusMinus', parameter: { max: 100, zehnerUebergang: 'gemischt', operationen: ['+', '−'] },
  texte: {
    name: 'Plus und Minus bis hundert',
    aufgabe: 'Rechne plus und minus bis hundert.',
    tipps: ['Rechne in Schritten: erst die Zehner, dann die Einer.', 'Schau auf den Rechenstrich: erst der große Sprung, dann der kleine.', 'Bei Minus springst du auf dem Rechenstrich nach links.']
  }
});

MW.uebung({
  id: 'K2-05', stufe: 'K2', titel: 'Einmaleins', feld: 'ZO', symbol: '✖️',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'punktefeld', generator: 'einmaleins', parameter: { reiheWaehlen: true },
  texte: {
    name: 'Einmaleins',
    aufgabe: 'Rechne die Malaufgaben.',
    tipps: ['Mal heißt: die gleiche Zahl immer wieder dazu.', 'Nutze eine leichte Aufgabe: Zweimal, fünfmal oder zehnmal kennst du sicher.', 'Schau aufs Punktefeld und zähle die Reihen.']
  }
});

MW.uebung({
  id: 'K2-06', stufe: 'K2', titel: 'Geteilt durch', feld: 'ZO', symbol: '➗',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'punktefeld', generator: 'geteilt', parameter: {},
  texte: {
    name: 'Geteilt durch',
    aufgabe: 'Rechne die Geteiltaufgaben. Die Malaufgabe hilft dir.',
    tipps: ['Denk an die Umkehraufgabe: Wie viel mal die zweite Zahl ergibt die erste Zahl?', 'Teile die Punkte gerecht in Reihen auf. Wie viele Reihen sind es?']
  }
});

MW.uebung({
  id: 'K2-07', stufe: 'K2', titel: 'Rechendreieck', feld: 'MS', symbol: '🔺',
  aufgabenProRunde: 3, eingabe: 'ziffernblock', hilfe: 'regel', generator: 'rechendreieck', parameter: { max: 100 },
  texte: {
    name: 'Rechendreieck',
    aufgabe: 'Im Rechendreieck ergeben zwei Innenfelder zusammen die Zahl außen daneben. Tippe auf ein leeres Feld.',
    tipps: ['Die Zahl außen ist die Summe der beiden Innenfelder daneben.', 'Fehlt innen eine Zahl? Dann rechne: außen minus das andere Innenfeld.'],
    saetze: { los: 'Hier ist ein neues Rechendreieck.' }
  }
});

MW.uebung({
  id: 'K2-08', stufe: 'K2', titel: 'Uhrzeit', feld: 'GM', symbol: '🕒',
  aufgabenProRunde: 5, eingabe: 'auswahl', hilfe: 'uhr', generator: 'uhr', parameter: {},
  texte: {
    name: 'Uhrzeit',
    aufgabe: 'Lies die Uhr. Der kurze Zeiger zeigt die Stunde, der lange Zeiger die Minuten.',
    tipps: ['Der kurze Zeiger zeigt die Stunde, der lange Zeiger die Minuten.', 'Zeigt der lange Zeiger nach unten auf die Sechs, ist es halb.', 'Halb vier heißt: eine halbe Stunde vor vier Uhr.'],
    saetze: { frage: 'Wie spät ist es?' }
  }
});

MW.uebung({
  id: 'K2-09', stufe: 'K2', titel: 'Geld bis 100 €', feld: 'GM', symbol: '💶',
  aufgabenProRunde: 5, eingabe: 'ziehen', hilfe: 'geld', generator: 'geld100', parameter: { werte: [1, 2, 5, 10, 20, 50] },
  texte: {
    name: 'Geld bis hundert Euro',
    aufgabe: 'Rechne mit Euro: Geld legen, Preise zusammenrechnen und Wechselgeld.',
    tipps: ['Rechne erst die Zehner zusammen, dann die Einer.', 'Beim Wechselgeld rechnest du: bezahlt minus Preis. Oder du ergänzt vom Preis bis zum bezahlten Geld.', 'Fang beim Legen mit dem größten Schein an.'],
    saetze: { zusammen: 'Wie viel kostet beides zusammen?', bezahlt: 'Du bezahlst mit', zurueck: 'Wie viel Geld bekommst du zurück?' }
  }
});

MW.uebung({
  id: 'K2-10', stufe: 'K2', titel: 'Spiegelbilder', feld: 'RF', symbol: '🦋',
  aufgabenProRunde: 3, eingabe: 'kaestchen', hilfe: 'spiegel', generator: 'spiegel', parameter: { zeilen: 6, spalten: 8 },
  texte: {
    name: 'Spiegelbilder',
    aufgabe: 'Ergänze die Figur. Die rote Linie ist der Spiegel. Tippe die Kästchen an und dann auf OK.',
    tipps: ['Zähle die Kästchen vom Spiegel aus: Links zwei weg heißt rechts auch zwei weg.', 'Jedes Kästchen hat einen Zwilling auf der anderen Seite, gleich weit vom Spiegel entfernt.'],
    saetze: { los: 'Ergänze das Spiegelbild.' }
  }
});
