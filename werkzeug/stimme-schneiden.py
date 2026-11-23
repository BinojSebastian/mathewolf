"""Mathewolf – aufgenommene Sprechtexte (z. B. aus ElevenLabs) in einzelne Bausteine schneiden und als Stimmenpaket speichern.

Vorher:  node werkzeug/sprechtexte.js      → werkzeug/sprechtexte/block-01.txt … und liste.json
Dann jeden Block mit derselben Stimme und denselben Einstellungen aufnehmen und als
block-01.mp3, block-02.mp3 … in einen Ordner legen.

Aufruf (Python 3 mit numpy und scipy, dazu ffmpeg):
  python3 werkzeug/stimme-schneiden.py --aufnahmen <Ordner> \
      --referenz <Ordner mit vits-piper-de_DE-thorsten-high> [--whisper <Ordner mit sherpa-onnx-whisper-small>]
  (für --referenz und --whisper: pip install sherpa-onnx; schneller mit pip install numba)

Ergebnis: audio/stimme.json und audio/stimme-<version>.mp3 (alle Bausteine als MP3 hintereinander). Die App spielt diese Bausteine ab;
für Texte ohne Aufnahme liest weiter die iPad-Stimme.

So wird geschnitten:
  1. Mit --referenz (empfohlen): Eine Vergleichsstimme (Piper) spricht denselben Block, Satz für Satz,
     deshalb kennt das Skript dort jede Grenze. Die Aufnahme wird per Zeitverzerrung (DTW über
     Klangmerkmale) an die Vergleichsstimme angelegt; jede Grenze wird so in die Aufnahme übertragen und
     dort auf die leiseste Stelle in der Nähe gelegt. Das klappt auch, wenn die Stimme zwischen den
     Texten kaum Pausen macht (ElevenLabs liest eine Liste oft sehr flüssig).
  2. Ohne Referenz: Pausen suchen; nur wenn die Zahl der Stücke genau zur Zahl der Texte passt.
  Mit --whisper hört eine Spracherkennung jedes Stück ab und meldet Stücke, die anders klingen.
"""
import argparse, difflib, hashlib, json, os, re, subprocess, sys, time
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
RATE = 44100      # Ausgabe
SR = 16000        # Analyse

# ---------------------------------------------------------------- Zahlwörter (für den Textvergleich)
EINER = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
         "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"]
ZEHNER = ["", "zehn", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"]
def wort(n):
    if n < 20: return EINER[n]
    if n < 100:
        z, e = divmod(n, 10)
        return ZEHNER[z] if e == 0 else ("ein" if e == 1 else EINER[e]) + "und" + ZEHNER[z]
    if n < 1000:
        h, r = divmod(n, 100)
        return ("ein" if h == 1 else EINER[h]) + "hundert" + (wort(r) if r else "")
    if n < 1000000:
        t, r = divmod(n, 1000)
        return ("ein" if t == 1 else wort(t)) + "tausend" + (wort(r) if r else "")
    return str(n)
def norm(t):
    t = t.lower().replace("ß", "ss")
    t = re.sub(r"(\d)\.(\d{3})", r"\1\2", t)
    t = re.sub(r"\d+", lambda m: wort(int(m.group())).replace("ß", "ss"), t)
    return re.sub(r"[^a-zäöü]", "", t)
def aehnlich(a, b):
    a, b = norm(a), norm(b)
    if not a or not b: return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()

# ---------------------------------------------------------------- Audio
def lade(pfad, rate=RATE):
    roh = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", pfad, "-ac", "1", "-ar", str(rate), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(roh, dtype=np.float32).copy()
def huelle(x, ms=10, rate=RATE):
    n = int(rate * ms / 1000); k = len(x) // n
    return np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(1) + 1e-12)
def stuecke(x, min_pause):
    """Sprechstücke zwischen Pausen von mindestens min_pause Sekunden: [(von, bis)] in Sekunden"""
    e = huelle(x)
    leise = np.percentile(e, 10)
    thr = max(leise * 3.5, e.max() * 0.012, 1e-4)
    an = e > thr
    out, i, n = [], 0, len(an)
    while i < n:
        if not an[i]: i += 1; continue
        j = i
        while j < n:
            if an[j]: j += 1; continue
            k = j
            while k < n and not an[k]: k += 1
            if (k - j) * 0.01 >= min_pause or k >= n: break
            j = k
        if (j - i) * 0.01 >= 0.06: out.append((i * 0.01, j * 0.01))
        i = j + 1
    return out
def mp3(x, kbps):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    return subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "pipe:0",
                           "-codec:a", "libmp3lame", "-b:a", f"{kbps}k", "-ac", "1", "-write_xing", "0", "-id3v2_version", "0", "-f", "mp3", "pipe:1"],
                          input=pcm, capture_output=True, check=True).stdout
def aufbereiten(x):
    """Stille abschneiden (mit kleinem Rand), Lautstärke angleichen, weiche Ränder"""
    if len(x) == 0: return x
    e = huelle(x, 5)
    thr = max(e.max() * 0.03, 1e-4)
    laut = np.where(e > thr)[0]
    if len(laut): x = x[max(0, laut[0] * int(RATE * 0.005) - int(RATE * 0.02)): min(len(x), (laut[-1] + 1) * int(RATE * 0.005) + int(RATE * 0.05))]
    rms = np.sqrt((x ** 2).mean() + 1e-12)
    x = x * min(0.1 / rms, 0.9 / (np.abs(x).max() + 1e-9))      # etwa −20 dBFS, Spitze unter −1 dB
    r = min(len(x) // 4, int(RATE * 0.008))
    if r > 0: x[:r] *= np.linspace(0, 1, r); x[-r:] *= np.linspace(1, 0, r)
    return x.astype(np.float32)

# ---------------------------------------------------------------- Klangmerkmale und Zeitverzerrung (DTW)
def _melbank(n_fft=400, n_mel=40):
    f = lambda hz: 2595 * np.log10(1 + hz / 700); fi = lambda m: 700 * (10 ** (m / 2595) - 1)
    bins = np.floor((n_fft + 1) * fi(np.linspace(f(60), f(7600), n_mel + 2)) / SR).astype(int)
    fb = np.zeros((n_mel, n_fft // 2 + 1), np.float32)
    for k in range(1, n_mel + 1):
        a, b, c = bins[k - 1], bins[k], bins[k + 1]
        for j in range(a, b): fb[k - 1, j] = (j - a) / max(1, b - a)
        for j in range(b, c): fb[k - 1, j] = (c - j) / max(1, c - b)
    return fb
_MEL = None
def merkmale(x, hop=320):
    """13 MFCC + Energie (+ Deltas), 50 Bilder je Sekunde, je Aufnahme normiert"""
    global _MEL
    from scipy.fft import dct
    if _MEL is None: _MEL = _melbank()
    n_fft = 400; win = np.hanning(n_fft).astype(np.float32)
    n = 1 + (len(x) - n_fft) // hop
    fr = x[np.arange(n_fft)[None, :] + hop * np.arange(n)[:, None]] * win
    lm = np.log((np.abs(np.fft.rfft(fr, axis=1)) ** 2) @ _MEL.T + 1e-8)
    f = np.hstack([dct(lm, type=2, axis=1, norm='ortho')[:, 1:14], lm.mean(1, keepdims=True) * 0.5])
    f = (f - f.mean(0)) / (f.std(0) + 1e-6)
    d = np.vstack([f[1:2] - f[0:1], (f[2:] - f[:-2]) / 2, f[-1:] - f[-2:-1]])
    return np.hstack([f, 0.6 * d]).astype(np.float32)

def _dtw_py(A, B, w):
    N, M = A.shape[0], B.shape[0]
    na = np.linalg.norm(A, axis=1) + 1e-9; nb = np.linalg.norm(B, axis=1) + 1e-9
    D = np.full((N + 1, M + 1), np.inf); D[0, 0] = 0; S = np.zeros((N + 1, M + 1), np.int8)
    for i in range(1, N + 1):
        c = i * M / N; lo, hi = max(1, int(c - w)), min(M, int(c + w))
        kosten = 1 - (B[lo - 1:hi] @ A[i - 1]) / (nb[lo - 1:hi] * na[i - 1])
        for k, j in enumerate(range(lo, hi + 1)):
            d0, d1, d2 = D[i - 1, j - 1], D[i - 1, j] + 0.15, D[i, j - 1] + 0.15
            if d0 <= d1 and d0 <= d2: D[i, j] = kosten[k] + d0
            elif d1 <= d2: D[i, j] = kosten[k] + d1; S[i, j] = 1
            else: D[i, j] = kosten[k] + d2; S[i, j] = 2
    return _pfad(S, N, M), D[N, M]
def _pfad(S, N, M):
    pi, pj, i, j = [], [], N, M
    while i > 0 and j > 0:
        pi.append(i - 1); pj.append(j - 1)
        s = S[i, j]
        if s == 0: i -= 1; j -= 1
        elif s == 1: i -= 1
        else: j -= 1
    return np.array(pi[::-1]), np.array(pj[::-1])
try:
    from numba import njit
    @njit(cache=True)
    def _dtw_nb(A, B, w):
        N, M = A.shape[0], B.shape[0]
        D = np.full((N + 1, M + 1), 1e18); D[0, 0] = 0.0
        S = np.zeros((N + 1, M + 1), np.int8)
        na = np.sqrt((A * A).sum(1)) + 1e-9; nb = np.sqrt((B * B).sum(1)) + 1e-9
        for i in range(1, N + 1):
            c = (i * M) / N
            lo = max(1, int(c - w)); hi = min(M, int(c + w))
            for j in range(lo, hi + 1):
                s = 0.0
                for k in range(A.shape[1]): s += A[i - 1, k] * B[j - 1, k]
                cost = 1.0 - s / (na[i - 1] * nb[j - 1])
                d0 = D[i - 1, j - 1]; d1 = D[i - 1, j] + 0.15; d2 = D[i, j - 1] + 0.15
                if d0 <= d1 and d0 <= d2: D[i, j] = cost + d0
                elif d1 <= d2: D[i, j] = cost + d1; S[i, j] = 1
                else: D[i, j] = cost + d2; S[i, j] = 2
        return S, D[N, M]
    def dtw(A, B, w):
        S, d = _dtw_nb(A, B, w)
        return _pfad(S, A.shape[0], B.shape[0]), d
except ImportError:
    dtw = _dtw_py

class Referenz:
    """Vergleichsstimme (Piper über sherpa-onnx): spricht jeden Text einzeln, Grenzen sind bekannt"""
    def __init__(self, ordner):
        import sherpa_onnx
        modell = [f for f in os.listdir(ordner) if f.endswith('.onnx')][0]
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=os.path.join(ordner, modell), tokens=os.path.join(ordner, 'tokens.txt'),
                                                       data_dir=os.path.join(ordner, 'espeak-ng-data'), noise_scale=0.5, noise_scale_w=0.5),
            num_threads=os.cpu_count() or 1, provider='cpu'), max_num_sentences=1)
        self.tts = sherpa_onnx.OfflineTts(cfg)
    def sprich(self, texte, pause=0.22):
        teile, grenzen, t = [], [], 0.0
        for tx in texte:
            a = self.tts.generate(tx, sid=0, speed=1.0)
            y = np.array(a.samples, np.float32)
            y = np.interp(np.arange(0, len(y), a.sample_rate / SR), np.arange(len(y)), y).astype(np.float32)
            laut = np.where(np.abs(y) > np.abs(y).max() * 0.02)[0]
            if len(laut): y = y[max(0, laut[0] - 80): laut[-1] + 160]
            grenzen.append((t, t + len(y) / SR)); t += len(y) / SR
            teile += [y, np.zeros(int(pause * SR), np.float32)]; t += pause
        return np.concatenate(teile), grenzen

def schnitte_mit_referenz(x16, texte, ref):
    """Schnittpunkte (Sekunden) zwischen den Texten über die Zeitverzerrung zur Vergleichsstimme"""
    y, grenzen = ref.sprich(texte)
    fa, fb = merkmale(x16), merkmale(y)
    (pi, pj), _ = dtw(fa, fb, int(max(len(fa), len(fb)) * 0.12))
    abb = np.full(len(fb), -1.0)
    for i, j in zip(pi, pj):
        if abb[j] < 0: abb[j] = i
    for j in range(1, len(abb)):
        if abb[j] < 0: abb[j] = abb[j - 1]
    zeit = lambda tr: abb[min(len(abb) - 1, int(tr * 50))] / 50.0
    e = huelle(x16, 10, SR)
    schnitte = [0.0]
    for k in range(len(texte) - 1):
        a, b = zeit(grenzen[k][1]), zeit(grenzen[k + 1][0])
        lo = int(max(schnitte[-1] + 0.1, min(a, b) - 0.25) * 100); hi = max(int((max(a, b) + 0.25) * 100), lo + 1)
        f = e[lo:hi]
        if len(f) > 5: f = np.convolve(f, np.ones(5) / 5, mode='same')
        schnitte.append((lo + int(np.argmin(f))) / 100)
    schnitte.append(len(x16) / SR)
    return [(schnitte[k], schnitte[k + 1]) for k in range(len(texte))]

# ---------------------------------------------------------------- Spracherkennung (Prüfung)
class Ohr:
    def __init__(self, ordner):
        import sherpa_onnx
        self.rec = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=os.path.join(ordner, "small-encoder.int8.onnx"), decoder=os.path.join(ordner, "small-decoder.int8.onnx"),
            tokens=os.path.join(ordner, "small-tokens.txt"), language="de", num_threads=max(1, os.cpu_count() or 1))
    def hoere(self, x, rate=RATE):
        y = x if rate == SR else np.interp(np.arange(0, len(x), rate / SR), np.arange(len(x)), x).astype(np.float32)
        s = self.rec.create_stream()
        s.accept_waveform(SR, np.concatenate([np.zeros(6000, np.float32), y, np.zeros(9000, np.float32)]))
        self.rec.decode_stream(s)
        return s.result.text.strip()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--app", default=os.path.join(HIER, ".."))
    ap.add_argument("--aufnahmen", required=True)
    ap.add_argument("--referenz", default="", help="Ordner der Piper-Stimme (z. B. vits-piper-de_DE-thorsten-high)")
    ap.add_argument("--whisper", default="")
    ap.add_argument("--kbps", type=int, default=64)
    ap.add_argument("--bericht", default="", help="JSON-Datei mit allen Schnitten und Prüfnoten")
    a = ap.parse_args()
    liste = json.load(open(os.path.join(HIER, "sprechtexte", "liste.json"), encoding="utf-8"))
    nach_block = {}
    for t in liste["texte"]: nach_block.setdefault(t["block"], []).append(t)
    dateien = sorted(f for f in os.listdir(a.aufnahmen) if re.search(r"\.(mp3|wav|m4a|aac|ogg|flac)$", f, re.I))
    benannt = {int(m.group(1)): f for f in dateien for m in [re.search(r"block[-_ ]?(\d+)", f, re.I)] if m}
    if not benannt:
        print("Hinweis: Die Dateien heißen nicht block-01 … – nehme die alphabetische Reihenfolge.")
        benannt = {k + 1: f for k, f in enumerate(dateien)}
    ref = Referenz(a.referenz) if a.referenz else None
    ohr = Ohr(a.whisper) if a.whisper else None
    eintraege, teile_bin, pos, unsicher, fehlen, bericht = {}, [], 0, [], [], []
    for b, texte in sorted(nach_block.items()):
        if b not in benannt: fehlen.append(b); continue
        pfad = os.path.join(a.aufnahmen, benannt[b])
        x = lade(pfad)
        N = len(texte)
        if ref:
            st = schnitte_mit_referenz(lade(pfad, SR), [t["text"] for t in texte], ref); art = "mit Vergleichsstimme"
        else:
            st = None
            for p in [0.55, 0.5, 0.6, 0.45, 0.65, 0.4, 0.7, 0.35, 0.75, 0.8, 0.3, 0.9]:
                kand = stuecke(x, p)
                if len(kand) == N: st = kand; break
            if st is None:
                print(f"✗ Block {b}: Pausen passen nicht zu den {N} Texten – bitte mit --referenz aufrufen."); fehlen.append(b); continue
            art = "nach Pausen"
        for t, (s, e) in zip(texte, st):
            roh = x[max(0, int(s * RATE)):int(e * RATE)]
            stueck = aufbereiten(roh.copy())
            note, gehoert = None, ""
            if ohr:
                gehoert = ohr.hoere(roh)
                note = aehnlich(t["text"], gehoert)
                if note < 0.6: unsicher.append((round(note, 2), b, t["text"], gehoert))
            daten = mp3(stueck, a.kbps)
            for k in t["keys"]: eintraege[k] = [pos, len(daten)]
            teile_bin.append(daten); pos += len(daten)
            bericht.append({"block": b, "text": t["text"], "von": round(s, 2), "bis": round(e, 2), "gehoert": gehoert, "note": note})
        print(f"Block {b}: {N} Texte geschnitten ({art})", flush=True)
    paket = b"".join(teile_bin)
    version = hashlib.sha1(paket).hexdigest()[:10]
    ziel = os.path.join(a.app, "audio")
    for f in os.listdir(ziel):
        if re.match(r"stimme-[0-9a-f]+\.(bin|mp3)$", f): os.remove(os.path.join(ziel, f))
    datei = f"stimme-{version}.mp3"
    open(os.path.join(ziel, datei), "wb").write(paket)
    json.dump({"erstellt": time.strftime("%Y-%m-%d"), "datei": datei, "version": version, "eintraege": eintraege},
              open(os.path.join(ziel, "stimme.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    if a.bericht: json.dump(bericht, open(a.bericht, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"fertig: {len(eintraege)} Bausteine, {len(paket) / 1e6:.1f} MB → audio/{datei}")
    if fehlen: print("✗ ohne Aufnahme: Block " + ", ".join(map(str, fehlen)))
    if unsicher:
        print(f"{len(unsicher)} Stücke klingen anders als erwartet (bitte anhören):")
        for note, b, t, g in sorted(unsicher)[:60]: print(f"  {note:.2f}  Block {b}: „{t}“ → gehört: „{g}“")

if __name__ == "__main__":
    main()
