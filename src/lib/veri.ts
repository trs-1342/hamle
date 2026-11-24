import { anahtar, chessYap, sanOyna } from './satranc'

export type Acilis = { eco: string; ad: string; pgn: string; i: number }
export type Dugum = { k: string; ad: number; cocuk: { san: string; uci: string; id: number }[] }
export type Bulmaca = { id: string; fen: string; hamleler: string[]; puan: number; temalar: string[] }

let acP: Promise<Acilis[]> | null = null
let agacP: Promise<{ dugum: Dugum[]; harita: Map<string, number> }> | null = null
let bulP: Promise<Bulmaca[]> | null = null

const al = async <T,>(u: string): Promise<T> => {
  const r = await fetch(u)
  if (!r.ok) throw new Error(u + ' yüklenemedi')
  return r.json()
}

export function acilislar(): Promise<Acilis[]> {
  acP ??= al<[string, string, string][]>('/veri/acilislar.json').then((a) => a.map(([eco, ad, pgn], i) => ({ eco, ad, pgn, i })))
  acP.catch(() => (acP = null))
  return acP
}

export function agac() {
  agacP ??= al<[string, number, [string, string, number][]][]>('/veri/acilis-agaci.json').then((a) => {
    const dugum: Dugum[] = a.map(([k, ad, c]) => ({ k, ad, cocuk: c.map(([san, uci, id]) => ({ san, uci, id })) }))
    const harita = new Map<string, number>()
    dugum.forEach((d, i) => harita.set(d.k, i))
    return { dugum, harita }
  })
  agacP.catch(() => (agacP = null))
  return agacP
}

export function bulmacalar(): Promise<Bulmaca[]> {
  bulP ??= al<[string, string, string, number, string][]>('/veri/bulmacalar.json').then((a) =>
    a.map(([id, fen, h, puan, t]) => ({ id, fen, hamleler: h.split(' '), puan, temalar: t.split(' ') })),
  )
  bulP.catch(() => (bulP = null))
  return bulP
}

/** fen dizisindeki en derin adlı açılışı bul (geçişleri de yakalar) */
export async function acilisAdi(fenler: string[]): Promise<Acilis | null> {
  const [{ dugum, harita }, ac] = await Promise.all([agac(), acilislar()])
  for (let i = fenler.length - 1; i >= 0; i--) {
    const id = harita.get(anahtar(fenler[i]))
    if (id != null && dugum[id].ad >= 0) return ac[dugum[id].ad]
  }
  return null
}

/** bir açılış hattının ilk konumdan itibaren sonuna kadar fen dizisi */
export function hatFenleri(sanlar: string[]): string[] {
  const ch = chessYap()!
  const out = [ch.fen()]
  for (const s of sanlar) {
    if (!sanOyna(ch, s)) break
    out.push(ch.fen())
  }
  return out
}

/** bir düğümün altındaki adlı hat sayısı (önbellekli) */
const altSay = new Map<number, number>()
export function altHatSayisi(dugum: Dugum[], id: number, gorulen = new Set<number>()): number {
  if (altSay.has(id)) return altSay.get(id)!
  if (gorulen.has(id)) return 0
  gorulen.add(id)
  let n = dugum[id].ad >= 0 ? 1 : 0
  for (const c of dugum[id].cocuk) n += altHatSayisi(dugum, c.id, gorulen)
  altSay.set(id, n)
  return n
}

/** düğümden aşağı inip ilk rastlanan adı bul (çocuk hamle etiketi için) */
export function ilkAd(dugum: Dugum[], id: number, derinlik = 0): number {
  if (dugum[id].ad >= 0) return dugum[id].ad
  if (derinlik > 6) return -1
  for (const c of dugum[id].cocuk) {
    const a = ilkAd(dugum, c.id, derinlik + 1)
    if (a >= 0) return a
  }
  return -1
}

/** ad → url parçası */
export const kisaAd = (s: string) =>
  s
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** açılış adlarını türkçeleştir (yaygın olanlar) */
const SOZLUK: [RegExp, string][] = [
  [/\bSicilian Defense\b/g, 'Sicilya Savunması'],
  [/\bFrench Defense\b/g, 'Fransız Savunması'],
  [/\bCaro-Kann Defense\b/g, 'Caro-Kann Savunması'],
  [/\bItalian Game\b/g, 'İtalyan Oyunu'],
  [/\bRuy Lopez\b/g, 'İspanyol Açılışı (Ruy Lopez)'],
  [/\bQueen's Gambit Declined\b/g, 'Vezir Gambiti Reddi'],
  [/\bQueen's Gambit Accepted\b/g, 'Vezir Gambiti Kabulü'],
  [/\bQueen's Gambit\b/g, 'Vezir Gambiti'],
  [/\bKing's Gambit Accepted\b/g, 'Şah Gambiti Kabulü'],
  [/\bKing's Gambit Declined\b/g, 'Şah Gambiti Reddi'],
  [/\bKing's Gambit\b/g, 'Şah Gambiti'],
  [/\bKing's Indian Defense\b/g, 'Şah Hint Savunması'],
  [/\bKing's Indian Attack\b/g, 'Şah Hint Saldırısı'],
  [/\bQueen's Indian Defense\b/g, 'Vezir Hint Savunması'],
  [/\bNimzo-Indian Defense\b/g, 'Nimzo-Hint Savunması'],
  [/\bGrünfeld Defense\b/g, 'Grünfeld Savunması'],
  [/\bSlav Defense\b/g, 'Slav Savunması'],
  [/\bSemi-Slav Defense\b/g, 'Yarı Slav Savunması'],
  [/\bEnglish Opening\b/g, 'İngiliz Açılışı'],
  [/\bScandinavian Defense\b/g, 'İskandinav Savunması'],
  [/\bPirc Defense\b/g, 'Pirc Savunması'],
  [/\bModern Defense\b/g, 'Modern Savunma'],
  [/\bAlekhine Defense\b/g, 'Alekhine Savunması'],
  [/\bDutch Defense\b/g, 'Hollanda Savunması'],
  [/\bLondon System\b/g, 'Londra Sistemi'],
  [/\bScotch Game\b/g, 'İskoç Oyunu'],
  [/\bPetrov's Defense\b/g, 'Petrov Savunması'],
  [/\bRussian Game\b/g, 'Rus Oyunu (Petrov)'],
  [/\bVienna Game\b/g, 'Viyana Oyunu'],
  [/\bFour Knights Game\b/g, 'Dört At Oyunu'],
  [/\bThree Knights Opening\b/g, 'Üç At Açılışı'],
  [/\bPhilidor Defense\b/g, 'Philidor Savunması'],
  [/\bBenoni Defense\b/g, 'Benoni Savunması'],
  [/\bBenko Gambit\b/g, 'Benko Gambiti'],
  [/\bCatalan Opening\b/g, 'Katalan Açılışı'],
  [/\bReti Opening\b/g, 'Réti Açılışı'],
  [/\bBird Opening\b/g, 'Bird Açılışı'],
  [/\bEvans Gambit\b/g, 'Evans Gambiti'],
  [/\bDanish Gambit\b/g, 'Danimarka Gambiti'],
  [/\bBishop's Opening\b/g, 'Fil Açılışı'],
  [/\bCenter Game\b/g, 'Merkez Oyunu'],
  [/\bKing's Pawn Game\b/g, 'Şah Piyonu Oyunu'],
  [/\bQueen's Pawn Game\b/g, 'Vezir Piyonu Oyunu'],
  [/\bTwo Knights Defense\b/g, 'İki At Savunması'],
  [/\bGiuoco Piano\b/g, 'Giuoco Piano'],
  [/\bDefense\b/g, 'Savunması'],
  [/\bOpening\b/g, 'Açılışı'],
  [/\bGambit\b/g, 'Gambiti'],
  [/\bAttack\b/g, 'Saldırısı'],
  [/\bVariations\b/g, 'Varyantları'],
  [/\bVariation\b/g, 'Varyantı'],
  [/\bLine\b/g, 'Hattı'],
  [/\bAccepted\b/g, 'Kabul'],
  [/\bDeclined\b/g, 'Ret'],
  [/\bSystem\b/g, 'Sistemi'],
  [/\bMain Line\b/g, 'Ana Hat'],
  [/\bExchange\b/g, 'Değişim'],
  [/\bAdvance\b/g, 'İlerleme'],
]
export function trAd(ad: string): string {
  let s = ad
  for (const [r, t] of SOZLUK) s = s.replace(r, t)
  return s
}

/** günün bulmacası: tarihe göre belirli */
export function gununBulmacasi(liste: Bulmaca[]): Bulmaca | null {
  const uygun = liste.filter((b) => b.puan >= 1300 && b.puan <= 1900)
  if (!uygun.length) return null
  const d = new Date()
  const g = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate()
  const h = (g * 2654435761) >>> 0
  return uygun[h % uygun.length]
}

