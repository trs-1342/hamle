/** Stockfish 18 lite (tek iş parçacığı, wasm) için sıralı iş kuyruğu */

export type Satir = {
  multipv: number
  derinlik: number
  /** beyazın gözünden santipiyon */
  cp?: number
  /** beyazın gözünden mat sayısı (+ beyaz mat eder) */
  mat?: number
  pv: string[]
}

export type AramaSecenek = {
  fen: string
  derinlik?: number
  sure?: number
  multipv?: number
  seviye?: number
  sonsuz?: boolean
}

export type AramaSonuc = { enIyi: string; satirlar: Satir[] }

type Dinleyici = (s: string) => void

class Motor {
  private w: Worker | null = null
  private hazir: Promise<void> | null = null
  private dinle = new Set<Dinleyici>()
  private mesgul: Promise<void> = Promise.resolve()
  private aktif = false
  private sayac = 0
  hata = false

  baslat(): Promise<void> {
    if (this.hazir) return this.hazir
    this.hazir = new Promise((res, rej) => {
      try {
        this.w = new Worker('/engine/stockfish-18-lite-single.js')
      } catch (e) {
        this.hata = true
        rej(e)
        return
      }
      this.w.onmessage = (e) => {
        const s = String(e.data)
        this.dinle.forEach((f) => f(s))
      }
      this.w.onerror = () => {
        this.hata = true
        rej(new Error('motor yüklenemedi'))
      }
      const f = (s: string) => {
        if (s === 'readyok') {
          this.dinle.delete(f)
          res()
        }
      }
      this.dinle.add(f)
      this.gonder('uci')
      this.gonder('setoption name Hash value 32')
      this.gonder('isready')
    })
    return this.hazir
  }

  private gonder(s: string) {
    this.w?.postMessage(s)
  }

  /** önceki aramayı durdurur, yenisini başlatır. başka arama araya girerse null döner */
  async ara(o: AramaSecenek, satirCb?: (l: Satir, hepsi: Satir[]) => void): Promise<AramaSonuc | null> {
    const token = ++this.sayac
    await this.baslat()
    if (token !== this.sayac) return null
    if (this.aktif) this.gonder('stop')
    const onceki = this.mesgul
    let bitir!: () => void
    this.mesgul = new Promise((r) => (bitir = r))
    await onceki
    if (token !== this.sayac) {
      bitir()
      return null
    }
    this.aktif = true
    const beyaz = o.fen.split(' ')[1] !== 'b'
    const satirlar: Satir[] = []
    return new Promise((res) => {
      const f = (s: string) => {
        if (s.startsWith('info ') && s.includes(' pv ') && !s.includes('bound')) {
          const l = cozumle(s, beyaz)
          if (!l) return
          satirlar[l.multipv - 1] = l
          if (token === this.sayac) satirCb?.(l, satirlar.filter(Boolean))
        } else if (s.startsWith('bestmove')) {
          this.dinle.delete(f)
          this.aktif = false
          bitir()
          res(token === this.sayac ? { enIyi: s.split(' ')[1], satirlar: satirlar.filter(Boolean) } : null)
        }
      }
      this.dinle.add(f)
      this.gonder(`setoption name MultiPV value ${o.multipv ?? 1}`)
      this.gonder(`setoption name Skill Level value ${o.seviye ?? 20}`)
      this.gonder('position fen ' + o.fen)
      if (o.sonsuz) this.gonder('go infinite')
      else if (o.derinlik && o.sure) this.gonder(`go depth ${o.derinlik} movetime ${o.sure}`)
      else if (o.derinlik) this.gonder(`go depth ${o.derinlik}`)
      else this.gonder(`go movetime ${o.sure ?? 1000}`)
    })
  }

  dur() {
    this.sayac++
    if (this.aktif) this.gonder('stop')
  }

  yeniOyun() {
    if (this.w) this.gonder('ucinewgame')
  }
}

function cozumle(s: string, beyaz: boolean): Satir | null {
  const t = s.split(' ')
  const al = (k: string) => {
    const i = t.indexOf(k)
    return i >= 0 ? t[i + 1] : undefined
  }
  const d = al('depth')
  const pvI = t.indexOf('pv')
  if (!d || pvI < 0) return null
  const sk = t.indexOf('score')
  if (sk < 0) return null
  const tur = t[sk + 1]
  const v = parseInt(t[sk + 2], 10)
  const isaret = beyaz ? 1 : -1
  return {
    multipv: parseInt(al('multipv') || '1', 10),
    derinlik: parseInt(d, 10),
    cp: tur === 'cp' ? v * isaret : undefined,
    mat: tur === 'mate' ? v * isaret : undefined,
    pv: t.slice(pvI + 1),
  }
}

export const motor = new Motor()

/** değerlendirmeyi metne çevir (beyazın gözünden) */
export function degerMetni(l?: { cp?: number; mat?: number }): string {
  if (!l) return '…'
  if (l.mat != null) return (l.mat > 0 ? '+' : l.mat < 0 ? '-' : '') + 'M' + Math.abs(l.mat)
  const c = (l.cp ?? 0) / 100
  return (c > 0 ? '+' : '') + c.toFixed(1)
}

/** beyazın kazanma olasılığı 0..1 (lichess formülüne yakın) */
export function beyazOlasilik(l?: { cp?: number; mat?: number }): number {
  if (!l) return 0.5
  if (l.mat != null) return l.mat > 0 ? 1 : l.mat < 0 ? 0 : 0.5
  const cp = Math.max(-1500, Math.min(1500, l.cp ?? 0))
  return 1 / (1 + Math.exp(-0.00368208 * cp))
}

/** mat değerini sayıya (cp) dönüştür */
export function cpSayi(l?: { cp?: number; mat?: number }): number {
  if (!l) return 0
  if (l.mat != null) return l.mat > 0 ? 10000 - l.mat * 10 : l.mat < 0 ? -10000 - l.mat * 10 : 0
  return l.cp ?? 0
}
