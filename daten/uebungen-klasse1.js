/* Mathewolf – Übungen Klasse 1 (Zahlenraum bis 20) */
'use strict';

MW.uebung({
  id: 'K1-01', stufe: 'K1', titel: 'Zahlenhaus', feld: 'MS', symbol: '🏠',
  aufgabenProRunde: 1, eingabe: 'ziffernblock', hilfe: 'plaettchen', generator: 'zahlenhaus',
  parameter: { dachMin: 3, dachMax: 10, mitNull: false },   // ohne Zerlegung mit 0 (Entscheidung der Eltern)
  texte: {
    name: 'Zahlenhaus',
    aufgabe: 'Im Zahlenhaus ergeben die zwei Zahlen in jedem Stockwerk zusammen die Zahl im Dach. Tippe auf ein leeres Feld und rechne.',
    tipps: ['Beide Zahlen im Stockwerk zusammen ergeben die Zahl im Dach.', 'Wie viel fehlt noch bis zur Dachzahl?', 'Schau aufs Bild und zähle die blauen Plättchen.'],
    saetze: { dach: 'Im Dach steht die Zahl' }
  }
});

MW.uebung({
  id: 'K1-02', stufe: 'K1', titel: 'Zahlenstrahl-Schieber', feld: 'ZO', symbol: '📏',
  aufgabenProRunde: 5, eingabe: 'schieber', hilfe: 'zahlenstrahl', generator: 'schieber',
  parameter: { max: 20, raster: 1, lang: 10, mittel: 5, beschriftung: 5 },
  texte: {
    name: 'Zahlenstrahl-Schieber',
    aufgabe: 'Schieb den gelben Regler auf die Zahl, die ich sage. Mit Minus und Plus kannst du genau einstellen. Dann tippe auf OK.',
    tipps: ['Die Zehn steht genau in der Mitte.', 'Lange Striche zeigen die Fünfer und Zehner. Zähle von dort aus weiter.', 'Mit Minus und Plus geht der Regler immer einen Strich weiter.']
  }
});

MW.uebung({
  id: 'K1-03', stufe: 'K1', titel: 'Blitzblick Zwanzigerfeld', feld: 'ZO', symbol: '👀',
  aufgabenProRunde: 5, eingabe: 'ziffernblock', hilfe: 'zwanzigerfeld', generator: 'blitzZwanzig', parameter: {},
  texte: {
    name: 'Blitzblick Zwanzigerfeld',
    aufgabe: 'Die Plättchen sind nur kurz zu sehen. Wie viele sind es? Achte auf die Fünfer.',
    tipps: ['Eine volle Reihe sind zehn. Eine halbe Reihe sind fünf.', 'Schau auf die Fünfer: fünf und noch zwei sind sieben.'],
    saetze: { frage: 'Wie viele Plättchen siehst du?' }
  }
});

MW.uebung({
  id: 'K1-04', stufe: 'K1', titel: 'Größer, kleiner, gleich', feld: 'ZO', symbol: '🐊',
  aufgabenProRunde: 8, eingabe: 'auswahl', hilfe: 'zahlenstrahl', generator: 'vergleich', parameter: { max: 20 },
  texte: {
    name: 'Größer, kleiner, gleich',
    aufgabe: 'Welches Zeichen gehört in die Mitte? Kleiner, größer oder gleich?',
    tipps: ['Das Krokodil frisst immer die größere Zahl. Sein offenes Maul zeigt zur größeren Zahl.', 'Die Spitze zeigt immer zur kleineren Zahl.', 'Schau auf den Zahlenstrahl: Weiter rechts ist größer.']
  }
});

MW.uebung({
  id: 'K1-05', stufe: 'K1', titel: 'Immer 10', feld: 'ZO', symbol: '🔟',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'zehnerfeld', generator: 'ergaenzen', parameter: { ziel: 10 },
  texte: {
    name: 'Immer zehn',
    aufgabe: 'Ergänze bis zehn.',
    tipps: ['Schau aufs Zehnerfeld: Wie viele Felder sind noch frei?', 'Denk an die Zehnerfreunde: Drei und sieben gehören zusammen.']
  }
});

MW.uebung({
  id: 'K1-06', stufe: 'K1', titel: 'Plus und Minus bis 10', feld: 'ZO', symbol: '➕',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'zehnerfeld', generator: 'plusMinus', parameter: { max: 10, zehnerUebergang: false, operationen: ['+', '−'] },
  texte: {
    name: 'Plus und Minus bis zehn',
    aufgabe: 'Rechne plus und minus bis zehn.',
    tipps: ['Bei Plus wird es mehr, bei Minus wird es weniger.', 'Schau aufs Bild und zähle die Plättchen.', 'Bei Minus zählst du nur die Plättchen, die nicht durchgestrichen sind.']
  }
});

MW.uebung({
  id: 'K1-07', stufe: 'K1', titel: 'Plus und Minus bis 20', feld: 'ZO', symbol: '🧮',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'zwanzigerfeld', generator: 'plusMinus', parameter: { max: 20, zehnerUebergang: true, operationen: ['+', '−'] },
  texte: {
    name: 'Plus und Minus bis zwanzig',
    aufgabe: 'Rechne über die Zehn.',
    tipps: ['Rechne erst bis zur Zehn, dann weiter.', 'Zerlege die zweite Zahl: Acht plus fünf ist acht plus zwei plus drei.', 'Schau aufs Zwanzigerfeld: Erst die obere Reihe voll machen.']
  }
});

MW.uebung({
  id: 'K1-08', stufe: 'K1', titel: 'Verdoppeln und Halbieren', feld: 'ZO', symbol: '🪞',
  aufgabenProRunde: 8, eingabe: 'ziffernblock', hilfe: 'zwanzigerfeld', generator: 'verdoppeln', parameter: { max: 20 },
  texte: {
    name: 'Verdoppeln und Halbieren',
    aufgabe: 'Verdopple oder halbiere die Zahl.',
    tipps: ['Verdoppeln heißt: die gleiche Zahl noch einmal dazu.', 'Halbieren heißt: gerecht in zwei gleiche Teile teilen.', 'Schau aufs Bild: Beide Teile sind gleich groß.']
  }
});

MW.uebung({
  id: 'K1-09', stufe: 'K1', titel: 'Zahlenmauer', feld: 'MS', symbol: '🧱',
  aufgabenProRunde: 3, eingabe: 'ziffernblock', hilfe: 'regel', generator: 'zahlenmauer', parameter: { grundsteine: 3, max: 20 },
  texte: {
    name: 'Zahlenmauer',
    aufgabe: 'In der Zahlenmauer ergeben zwei Nachbarsteine zusammen den Stein darüber. Tippe auf ein leeres Feld.',
    tipps: ['Zwei Nachbarsteine zusammen ergeben den Stein darüber.', 'Fehlt unten ein Stein? Dann rechne minus: oben minus den anderen Stein.', 'Fang dort an, wo du schon zwei Zahlen kennst.'],
    saetze: { los: 'Hier ist eine neue Zahlenmauer.' }
  }
});

MW.uebung({
  id: 'K1-10', stufe: 'K1', titel: 'Geld bis 20 €', feld: 'GM', symbol: '💶',
  aufgabenProRunde: 5, eingabe: 'ziehen', hilfe: 'geld', generator: 'geld', parameter: { max: 20, min: 3, werte: [1, 2, 5, 10, 20] },
  texte: {
    name: 'Geld bis zwanzig Euro',
    aufgabe: 'Rechne mit Euro. Lege genau den Betrag oder zähle das Geld zusammen.',
    tipps: ['Fang mit dem größten Schein an.', 'Zähle das Geld zusammen: erst die Scheine, dann die Münzen.', 'Ein Fünf-Euro-Schein ist so viel wie fünf Ein-Euro-Münzen.'],
    saetze: { wieviel: 'Wie viel Geld ist das?' }
  }
});
