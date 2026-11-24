import { Chess, type Move } from 'chess.js'

export const BASLANGIC = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
export type Renk = 'w' | 'b'

/** konum anahtarı: taşlar + sıra + rok + geçerken alma */
export const anahtar = (fen: string) => fen.split(' ').slice(0, 4).join(' ')
export const sira = (fen: string) => (fen.split(' ')[1] === 'b' ? 'b' : 'w') as Renk
export const karsi = (r: Renk): Renk => (r === 'w' ? 'b' : 'w')

export function chessYap(fen?: string): Chess | null {
  try {
    return fen ? new Chess(fen) : new Chess()
  } catch {
    return null
  }
}

export function uciOyna(ch: Chess, uci: string): Move | null {
  try {
    return ch.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined })
  } catch {
    return null
  }
}

export function sanOyna(ch: Chess, san: string): Move | null {
  try {
    return ch.move(san)
  } catch {
    return null
  }
}

export const moveUci = (m: { from: string; to: string; promotion?: string }) => m.from + m.to + (m.promotion || '')

/** uci listesini SAN listesine çevir (pv gösterimi için) */
export function pvSan(fen: string, pv: string[], sinir = 12): string[] {
  const ch = chessYap(fen)
  if (!ch) return []
  const out: string[] = []
  for (const u of pv.slice(0, sinir)) {
    const m = uciOyna(ch, u)
    if (!m) break
    out.push(m.san)
  }
  return out
}

/** "1. e4 e5 2. Nf3" gibi biçimli dizi */
export function numarali(sanlar: string[], ilkFen: string, cevir: (s: string) => string = (s) => s): string {
  const p = ilkFen.split(' ')
  let no = parseInt(p[5] || '1', 10)
  let beyaz = p[1] !== 'b'
  const parca: string[] = []
  sanlar.forEach((s, i) => {
    if (beyaz) parca.push(`${no}. ${cevir(s)}`)
    else parca.push(i === 0 ? `${no}... ${cevir(s)}` : cevir(s))
    if (!beyaz) no++
    beyaz = !beyaz
  })
  return parca.join(' ')
}

/** pgn dizisini (lichess tsv biçimi) SAN listesine çevir */
export const pgnSanlar = (pgn: string) =>
  pgn
    .replace(/\d+\.(\.\.)?\s*/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

/** sanlardan fen dizisi (ilk konum dahil) */
export function sanFenler(sanlar: string[], ilk = BASLANGIC): string[] {
  const ch = chessYap(ilk)
  if (!ch) return [ilk]
  const out = [ch.fen()]
  for (const s of sanlar) {
    if (!sanOyna(ch, s)) break
    out.push(ch.fen())
  }
  return out
}

/** türkçe taş harfleri ile SAN: N→A, B→F, R→K, Q→V, K→Ş */
const TR: Record<string, string> = { N: 'A', B: 'F', R: 'K', Q: 'V', K: 'Ş' }
export const trSan = (san: string, acik: boolean) => (acik ? san.replace(/[NBRQK]/g, (c) => TR[c]) : san)

export const TAS_AD: Record<string, string> = { p: 'piyon', n: 'at', b: 'fil', r: 'kale', q: 'vezir', k: 'şah' }

export function sonucMetni(ch: Chess): string | null {
  if (ch.isCheckmate()) return ch.turn() === 'w' ? 'Mat. Siyah kazandı.' : 'Mat. Beyaz kazandı.'
  if (ch.isStalemate()) return 'Pat. Berabere.'
  if (ch.isThreefoldRepetition()) return 'Üç kez tekrar. Berabere.'
  if (ch.isInsufficientMaterial()) return 'Yetersiz taş. Berabere.'
  if (ch.isDraw()) return '50 hamle kuralı. Berabere.'
  return null
}
