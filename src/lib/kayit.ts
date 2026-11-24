import { useCallback, useEffect, useState } from 'react'

const ON = 'hamle:'
const OLAY = 'hamle-kayit'

export function oku<T>(k: string, v: T): T {
  try {
    const s = localStorage.getItem(ON + k)
    return s == null ? v : (JSON.parse(s) as T)
  } catch {
    return v
  }
}

export function yaz<T>(k: string, v: T) {
  try {
    localStorage.setItem(ON + k, JSON.stringify(v))
  } catch {
    /* depolama yoksa yalnız bellekte kalır */
  }
  window.dispatchEvent(new CustomEvent(OLAY, { detail: k }))
}

export function hepsiniSil() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(ON) && k !== ON + 'tema' && k !== ON + 'ayarlar')
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* yok */
  }
  window.dispatchEvent(new CustomEvent(OLAY, { detail: '*' }))
}

/** localStorage'a bağlı durum; aynı anahtarı kullanan bileşenler eşitlenir */
export function useKayit<T>(k: string, v: T): [T, (x: T | ((p: T) => T)) => void] {
  const [d, setD] = useState<T>(() => oku(k, v))
  useEffect(() => {
    const f = (e: Event) => {
      const det = (e as CustomEvent).detail
      if (det === k || det === '*') setD(oku(k, v))
    }
    window.addEventListener(OLAY, f)
    return () => window.removeEventListener(OLAY, f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k])
  const set = useCallback(
    (x: T | ((p: T) => T)) => {
      const yeni = typeof x === 'function' ? (x as (p: T) => T)(oku(k, v)) : x
      yaz(k, yeni)
      setD(yeni)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [k],
  )
  return [d, set]
}

export type Ayarlar = {
  tahta: 'ceviz' | 'cimen' | 'deniz' | 'gri'
  koordinat: boolean
  ses: boolean
  yasalGoster: boolean
  trNotasyon: boolean
}
export const AYAR_VARSAYILAN: Ayarlar = { tahta: 'ceviz', koordinat: true, ses: true, yasalGoster: true, trNotasyon: false }

export function useAyarlar() {
  const [a, setA] = useKayit<Partial<Ayarlar>>('ayarlar', AYAR_VARSAYILAN)
  return [{ ...AYAR_VARSAYILAN, ...a } as Ayarlar, setA] as const
}

/** ilerleme kayıtları */
export type Ilerleme = {
  dersler: Record<string, number> // ders id -> tamamlanma zamanı
  acilislar: Record<string, number> // açılış anahtarı -> başarılı çalışma sayısı
}
export const ILERLEME_VARSAYILAN: Ilerleme = { dersler: {}, acilislar: {} }
export const useIlerleme = () => useKayit<Ilerleme>('ilerleme', ILERLEME_VARSAYILAN)

export type BulmacaKayit = {
  puan: number
  cozulen: number
  denenen: number
  seri: number
  enIyiSeri: number
  gecmis: { id: string; ok: boolean; puan: number }[]
  goruldu: string[]
}
export const BULMACA_VARSAYILAN: BulmacaKayit = { puan: 1200, cozulen: 0, denenen: 0, seri: 0, enIyiSeri: 0, gecmis: [], goruldu: [] }
export const useBulmacaKayit = () => useKayit<BulmacaKayit>('bulmaca', BULMACA_VARSAYILAN)
