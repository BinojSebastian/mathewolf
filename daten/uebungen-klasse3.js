/* Mathewolf – Übungen Klasse 3 (Zahlenraum bis 1.000) */
'use strict';

MW.uebung({
  id: 'K3-01', stufe: 'K3', titel: 'Zahlenstrahl bis 1.000', feld: 'ZO', symbol: '📏',
  aufgabenProRunde: 5, eingabe: 'schieber', hilfe: 'zahlenstrahl', generator: 'schieber',
  parameter: { max: 1000, raster: 10, lang: 100, mittel: 50, beschriftung: 100, schrift: 28 },
  texte: {
    name: 'Zahlenstrahl bis tausend',
    aufgabe: 'Schieb den gelben Regler auf die Zahl, die ich sage. Jeder kleine Strich ist zehn mehr.',
    tipps: ['Such zuerst den richtigen Hunderter. Die langen Striche zeigen die Hunderter.', 'Jeder kleine Strich ist zehn mehr.', 'Der mittlere Strich zwischen zwei Hundertern ist die Fünfzig.']
  }
});

MW.uebung({
  id: 'K3-02', stufe: 'K3', titel: 'Stellenwerttafel', feld: 'ZO', symbol: '🔢',
  aufgabenProRunde: 5, eingabe: 'ziffernblock', hilfe: 'stellenwert', generator: 'stellenwert', parameter: {},
  texte: {
    name: 'Stellenwerttafel',
    aufgabe: 'Hunderter, Zehner und Einer: Jede Ziffer hat ihren Platz.',
    tipps: ['Die erste Ziffer sagt dir, wie viele Hunderter es sind.', 'Fehlt eine Stelle? Dann schreibst du eine Null.', 'Schau in die Stellenwerttafel: H heißt Hunderter, Z Zehner und E Einer.'],
    saetze: { zahl: 'Welche Zahl ist das?', zerlege: 'Zerlege die Zahl', einer: 'Einer.' }
  }
});

MW.uebung({
  id: 'K3-03', stufe: 'K3', titel: 'Plus und Minus bis 1.000', feld: 'ZO', symbol: '➕',
  aufgabenProRunde: 6, eingabe: 'ziffernblock', hilfe: 'rechenstrich', generator: 'plusMinus', parameter: { max: 1000, operationen: ['+', '−'] },
  texte: {
    name: 'Plus und Minus bis tausend',
    aufgabe: 'Rechne im Kopf oder in Schritten.',
    tipps: ['Rechne in Schritten: erst die Hunderter, dann die Zehner, dann die Einer.', 'Schau auf den Rechenstrich: ein Sprung für jede Stelle.', 'Bei glatten Zehnern hilft dir das kleine Einspluseins: vierhundertfünfzig plus zweihundertachtzig ist wie fünfundvierzig plus achtundzwanzig Zehner.']
  }
});

MW.uebung({
  id: 'K3-04', stufe: 'K3', titel: 'Schriftlich addieren', feld: 'ZO', symbol: '📝',
  aufgabenProRunde: 3, eingabe: 'schriftlich', hilfe: 'stellenwert', generator: 'schriftlichPlus', parameter: {},
  texte: {
    name: 'Schriftlich addieren',
    aufgabe: 'Rechne schriftlich. Fang ganz rechts bei den Einern an. Die kleinen Kästchen sind für den Übertrag.',
    tipps: ['Rechne Stelle für Stelle von rechts: erst Einer, dann Zehner, dann Hunderter.', 'Ist eine Stelle zehn oder mehr? Schreib die Einer hin und den Übertrag klein in die nächste Spalte.', 'Vergiss nicht, den Übertrag mitzurechnen.']
  }
});

MW.uebung({
  id: 'K3-05', stufe: 'K3', titel: 'Schriftlich subtrahieren', feld: 'ZO', symbol: '📝',
  aufgabenProRunde: 3, eingabe: 'schriftlich', hilfe: 'stellenwert', generator: 'schriftlichMinus',
  // Verfahren: 'abziehen' (Abziehen mit Entbündeln) oder 'ergaenzen' (Ergänzen mit Erweitern) – wie in der Schule
  parameter: { verfahren: 'abziehen' },
  texte: {
    name: 'Schriftlich subtrahieren',
    aufgabe: 'Rechne schriftlich minus. Fang ganz rechts bei den Einern an.',
    tipps: ['Rechne von oben nach unten: obere Ziffer minus untere Ziffer.', 'Geht es nicht? Dann entbündle: Nimm einen Zehner und mach daraus zehn Einer. Oben wird die Ziffer eins kleiner.', 'Hast du entbündelt? Dann rechnest du in der nächsten Spalte mit der kleineren Ziffer.'],
    saetze: {
      // Tipps für das Ergänzungsverfahren (werden genutzt, wenn verfahren: 'ergaenzen')
      ergaenzen_tipp1: 'Rechne von unten nach oben: Wie viel fehlt von der unteren bis zur oberen Ziffer?',
      ergaenzen_tipp2: 'Ist die obere Ziffer kleiner? Dann ergänze bis zur Zahl mit einer Zehn davor und schreib den Übertrag klein unter die nächste Spalte.',
      ergaenzen_tipp3: 'Rechne den Übertrag in der nächsten Spalte unten dazu.'
    }
  }
});

MW.uebung({
  id: 'K3-06', stufe: 'K3', titel: 'Mal und geteilt mit Zehnerzahlen', feld: 'ZO', symbol: '✖️',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'punktefeld', generator: 'zehnerMal', parameter: {},
  texte: {
    name: 'Mal und geteilt mit Zehnerzahlen',
    aufgabe: 'Rechne mit Zehnerzahlen. Das Einmaleins hilft dir.',
    tipps: ['Rechne erst die Aufgabe ohne die Null. Dann hängst du die Null wieder an.', 'Denk in Zehnern: Vierzig sind vier Zehner.']
  }
});

MW.uebung({
  id: 'K3-07', stufe: 'K3', titel: 'Teilen mit Rest', feld: 'ZO', symbol: '🍬',
  aufgabenProRunde: 6, eingabe: 'ziffernblock', hilfe: 'punktefeld', generator: 'teilenMitRest', parameter: {},
  texte: {
    name: 'Teilen mit Rest',
    aufgabe: 'Teile und schreibe den Rest auf. Der Rest ist immer kleiner als die Zahl, durch die du teilst.',
    tipps: ['Such die größte Malaufgabe mit der zweiten Zahl, die noch hineinpasst.', 'Der Rest ist das, was übrig bleibt. Er muss kleiner sein als die Zahl, durch die du teilst.']
  }
});

MW.uebung({
  id: 'K3-08', stufe: 'K3', titel: 'Zahlenmauer bis 1.000', feld: 'MS', symbol: '🧱',
  aufgabenProRunde: 3, eingabe: 'ziffernblock', hilfe: 'regel', generator: 'zahlenmauer', parameter: { grundsteine: 4, max: 1000, minStein: 20, maxStein: 200 },
  texte: {
    name: 'Zahlenmauer bis tausend',
    aufgabe: 'Zwei Nachbarsteine ergeben zusammen den Stein darüber. Tippe auf ein leeres Feld.',
    tipps: ['Zwei Nachbarsteine zusammen ergeben den Stein darüber.', 'Fehlt unten ein Stein? Dann rechne minus: oben minus den anderen Stein.', 'Fang dort an, wo du schon zwei Zahlen kennst.'],
    saetze: { los: 'Hier ist eine neue Zahlenmauer.' }
  }
});

MW.uebung({
  id: 'K3-09', stufe: 'K3', titel: 'Längen und Gewichte', feld: 'GM', symbol: '📐',
  aufgabenProRunde: 6, eingabe: 'ziffernblock', hilfe: 'umrechnung', generator: 'einheiten', parameter: {},
  texte: {
    name: 'Längen und Gewichte',
    aufgabe: 'Rechne Längen und Gewichte um.',
    tipps: ['Ein Meter hat hundert Zentimeter. Ein Zentimeter hat zehn Millimeter.', 'Ein Kilometer hat tausend Meter. Ein Kilogramm hat tausend Gramm.', 'Rechne beide Angaben in die gleiche Einheit um, dann kannst du vergleichen.'],
    saetze: { laenger: 'Was ist länger:', schwerer: 'Was ist schwerer:' }
  }
});

MW.uebung({
  id: 'K3-10', stufe: 'K3', titel: 'Körper erkennen', feld: 'RF', symbol: '🧊',
  aufgabenProRunde: 5, eingabe: 'auswahl', hilfe: 'koerper', generator: 'koerper', parameter: {},
  texte: {
    name: 'Körper erkennen',
    aufgabe: 'Schau dir den Körper genau an.',
    tipps: [],
    saetze: {
      name: 'Wie heißt dieser Körper?',
      ecken_wuerfel: 'Wie viele Ecken hat der Würfel?', ecken_quader: 'Wie viele Ecken hat der Quader?', ecken_pyramide: 'Wie viele Ecken hat die Pyramide?',
      flaechen_wuerfel: 'Wie viele Flächen hat der Würfel?', flaechen_quader: 'Wie viele Flächen hat der Quader?', flaechen_pyramide: 'Wie viele Flächen hat die Pyramide?',
      ist_wuerfel: 'Das ist ein Würfel.', ist_quader: 'Das ist ein Quader.', ist_pyramide: 'Das ist eine Pyramide.',
      ist_kugel: 'Das ist eine Kugel.', ist_zylinder: 'Das ist ein Zylinder.', ist_kegel: 'Das ist ein Kegel.',
      tipp_wuerfel: 'Ein Würfel hat sechs gleich große Quadrate als Flächen.', tipp_quader: 'Ein Quader sieht aus wie ein Schuhkarton.',
      tipp_pyramide: 'Eine Pyramide hat unten ein Viereck und läuft oben spitz zu.', tipp_kugel: 'Eine Kugel ist rund wie ein Ball.',
      tipp_zylinder: 'Ein Zylinder sieht aus wie eine Dose.', tipp_kegel: 'Ein Kegel sieht aus wie eine Eistüte: unten rund, oben spitz.',
      tipp_ecken: 'Zähle die Ecken oben und unten getrennt und rechne dann zusammen.',
      tipp_flaechen: 'Zähle so: oben, unten, vorne, hinten, links und rechts.'
    }
  }
});
