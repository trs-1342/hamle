import { useEffect, useMemo, useRef, useState } from 'react'
import type { Square } from 'chess.js'
import { chessYap, type Renk } from '../lib/satranc'
import { useAyarlar, tasYolu, TAS_OLCEK } from '../lib/kayit'

export type Ok = { from: string; to: string; renk?: 'yesil' | 'mavi' | 'kirmizi' | 'sari' | 'gri'; kalin?: number }

type Props = {
  fen: string
  yon?: Renk
  /** kim oynayabilir: 'w' | 'b' | 'ikisi' (sıradaki) | 'yok' */
  oynar?: Renk | 'ikisi' | 'yok'
  hamle?: (from: string, to: string, terfi?: string) => void
  sonHamle?: [string, string] | null
  oklar?: Ok[]
  /** kare -> renk sınıfı (iyi / kotu / ipucu / vurgu) */
  isaret?: Record<string, string>
  koordinat?: boolean
  kucuk?: boolean
  sinif?: string
}

const DOSYA = 'abcdefgh'
type Tas = { id: number; t: string; sq: string }
let tasSayac = 1

function taslar(fen: string): { t: string; sq: string }[] {
  const out: { t: string; sq: string }[] = []
  const satirlar = fen.split(' ')[0].split('/')
  satirlar.forEach((s, r) => {
    let f = 0
    for (const c of s) {
      if (/\d/.test(c)) f += parseInt(c, 10)
      else {
        const renk = c === c.toUpperCase() ? 'w' : 'b'
        out.push({ t: renk + c.toUpperCase(), sq: DOSYA[f] + (8 - r) })
        f++
      }
    }
  })
  return out
}

/** önceki taş kimliklerini koruyarak eşleştir (kayma animasyonu için) */
function eslestir(onceki: Tas[], yeni: { t: string; sq: string }[]): Tas[] {
  const kalan = [...onceki]
  const out: (Tas | null)[] = yeni.map((p) => {
    const i = kalan.findIndex((o) => o.t === p.t && o.sq === p.sq)
    if (i >= 0) return kalan.splice(i, 1)[0]
    return null
  })
  const uzak = (a: string, b: string) => Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) + Math.abs(+a[1] - +b[1])
  return out.map((o, j) => {
    if (o) return o
    const p = yeni[j]
    let en = -1
    let d = 99
    kalan.forEach((k, i) => {
      if (k.t === p.t && uzak(k.sq, p.sq) < d) {
        d = uzak(k.sq, p.sq)
        en = i
      }
    })
    if (en >= 0) {
      const k = kalan.splice(en, 1)[0]
      return { id: k.id, t: p.t, sq: p.sq }
    }
    return { id: tasSayac++, t: p.t, sq: p.sq }
  })
}

export default function Tahta({ fen, yon = 'w', oynar = 'yok', hamle, sonHamle, oklar = [], isaret = {}, koordinat, kucuk, sinif = '' }: Props) {
  const [ayar] = useAyarlar()
  const kutu = useRef<HTMLDivElement>(null)
  const [secili, setSecili] = useState<string | null>(null)
  const [surukle, setSurukle] = useState<{ sq: string; x: number; y: number; oynadi: boolean } | null>(null)
  const [terfi, setTerfi] = useState<{ from: string; to: string } | null>(null)
  const [cizim, setCizim] = useState<Ok[]>([])
  const sagBas = useRef<string | null>(null)
  const oncedenSecili = useRef(false)
  const onceki = useRef<Tas[]>([])

  const ch = useMemo(() => chessYap(fen), [fen])
  const tasListe = useMemo(() => {
    const t = eslestir(onceki.current, taslar(fen))
    onceki.current = t
    return t
  }, [fen])

  useEffect(() => {
    setSecili(null)
    setTerfi(null)
    setCizim([])
    setSurukle(null)
  }, [fen, yon, oynar])

  const siraRenk = ch?.turn() ?? 'w'
  const oynayabilir = !!hamle && ch != null && oynar !== 'yok' && (oynar === 'ikisi' || oynar === siraRenk) && !ch.isGameOver()

  const yasal = useMemo(() => {
    if (!secili || !ch || !oynayabilir) return []
    return ch.moves({ square: secili as Square, verbose: true })
  }, [secili, ch, oynayabilir])

  const pos = (sq: string) => {
    const f = DOSYA.indexOf(sq[0])
    const r = +sq[1] - 1
    return yon === 'w' ? { c: f, r: 7 - r } : { c: 7 - f, r }
  }
  const kareAl = (x: number, y: number): string | null => {
    const b = kutu.current?.getBoundingClientRect()
    if (!b) return null
    const c = Math.floor(((x - b.left) / b.width) * 8)
    const r = Math.floor(((y - b.top) / b.height) * 8)
    if (c < 0 || c > 7 || r < 0 || r > 7) return null
    return yon === 'w' ? DOSYA[c] + (8 - r) : DOSYA[7 - c] + (r + 1)
  }
  const tasRengi = (sq: string) => {
    const p = ch?.get(sq as Square)
    return p ? p.color : null
  }

  const dene = (from: string, to: string): boolean => {
    if (!ch) return false
    const ms = ch.moves({ square: from as Square, verbose: true }).filter((m) => m.to === to)
    if (!ms.length) return false
    if (ms.some((m) => m.promotion)) {
      setTerfi({ from, to })
      return true
    }
    setSecili(null)
    hamle?.(from, to)
    return true
  }

  const asagi = (e: React.PointerEvent) => {
    if (e.button === 2) {
      sagBas.current = kareAl(e.clientX, e.clientY)
      return
    }
    if (e.button !== 0 || terfi) return
    setCizim([])
    const sq = kareAl(e.clientX, e.clientY)
    if (!sq) return
    if (secili && secili !== sq && yasal.some((m) => m.to === sq)) {
      dene(secili, sq)
      return
    }
    if (oynayabilir && tasRengi(sq) === siraRenk) {
      oncedenSecili.current = secili === sq
      setSecili(sq)
      const b = kutu.current!.getBoundingClientRect()
      setSurukle({ sq, x: e.clientX - b.left, y: e.clientY - b.top, oynadi: false })
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } else setSecili(null)
  }

  const hareket = (e: React.PointerEvent) => {
    if (!surukle) return
    const b = kutu.current!.getBoundingClientRect()
    setSurukle({ ...surukle, x: e.clientX - b.left, y: e.clientY - b.top, oynadi: true })
  }

  const yukari = (e: React.PointerEvent) => {
    if (e.button === 2) {
      const a = sagBas.current
      const b = kareAl(e.clientX, e.clientY)
      sagBas.current = null
      if (!a || !b) return
      setCizim((c) => {
        const i = c.findIndex((o) => o.from === a && o.to === b)
        if (i >= 0) return c.filter((_, j) => j !== i)
        return [...c, { from: a, to: b, renk: e.shiftKey ? 'kirmizi' : e.altKey ? 'mavi' : 'yesil' }]
      })
      return
    }
    if (!surukle) return
    const hedef = kareAl(e.clientX, e.clientY)
    const s = surukle
    setSurukle(null)
    if (!oynayabilir || tasRengi(s.sq) !== siraRenk) return
    if (hedef && hedef !== s.sq) {
      if (!dene(s.sq, hedef)) setSecili(null)
    } else if (hedef === s.sq && oncedenSecili.current && !s.oynadi) setSecili(null)
  }

  const sahKare = useMemo(() => {
    if (!ch || !ch.inCheck()) return null
    const t = ch.turn()
    for (const row of ch.board()) for (const p of row) if (p && p.type === 'k' && p.color === t) return p.square
    return null
  }, [ch])

  const kareler = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const sq = yon === 'w' ? DOSYA[c] + (8 - r) : DOSYA[7 - c] + (r + 1)
      const acik = (c + r) % 2 === 0
      const cls = ['kare', acik ? 'acik' : 'koyu']
      if (sonHamle && (sonHamle[0] === sq || sonHamle[1] === sq)) cls.push('son')
      if (secili === sq) cls.push('secili')
      if (sahKare === sq) cls.push('sah')
      if (isaret[sq]) cls.push('isr-' + isaret[sq])
      const hedef = yasal.find((m) => m.to === sq)
      kareler.push(
        <div key={sq} className={cls.join(' ')}>
          {(koordinat ?? ayar.koordinat) && c === 0 && <span className="koor sira-no">{sq[1]}</span>}
          {(koordinat ?? ayar.koordinat) && r === 7 && <span className="koor dosya-ad">{sq[0]}</span>}
          {hedef && ayar.yasalGoster && <span className={hedef.captured ? 'hedef alma' : 'hedef'} />}
        </div>,
      )
    }

  const tumOklar = [...oklar, ...cizim]
  const merkez = (sq: string) => {
    const p = pos(sq)
    return { x: p.c + 0.5, y: p.r + 0.5 }
  }

  return (
    <div
      ref={kutu}
      className={`tahta tema-${ayar.tahta} ${kucuk ? 'kucuk' : ''} ${oynayabilir ? 'oynanir' : ''} ${sinif}`}
      style={{ ['--tas-olcek' as string]: TAS_OLCEK[ayar.tasBoyut] ?? 1 }}
      onPointerDown={asagi}
      onPointerMove={hareket}
      onPointerUp={yukari}
      onPointerCancel={() => setSurukle(null)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="kareler">{kareler}</div>
      <div className="taslar">
        {tasListe.map((p) => {
          const { c, r } = pos(p.sq)
          const surukleniyor = surukle && surukle.sq === p.sq && surukle.oynadi
          const stil: React.CSSProperties = surukleniyor
            ? { transform: `translate(${surukle!.x}px, ${surukle!.y}px) translate(-50%, -50%) scale(calc(1.12 * var(--tas-olcek, 1)))`, transition: 'none', zIndex: 5 }
            : { transform: `translate(${c * 100}%, ${r * 100}%) scale(var(--tas-olcek, 1))` }
          return <img key={p.id} className={'tas' + (surukleniyor ? ' tutulan' : '')} src={tasYolu(p.t, ayar.taslar)} alt="" draggable={false} style={stil} />
        })}
      </div>
      {tumOklar.length > 0 && (
        <svg className="oklar" viewBox="0 0 8 8">
          {tumOklar.map((o, i) => {
            const a = merkez(o.from)
            const b = merkez(o.to)
            const renk = o.renk ?? 'yesil'
            if (o.from === o.to) return <circle key={i} cx={a.x} cy={a.y} r={0.44} className={'ok-' + renk} fill="none" strokeWidth={0.07} />
            const dx = b.x - a.x
            const dy = b.y - a.y
            const L = Math.hypot(dx, dy)
            const ux = dx / L
            const uy = dy / L
            const k = o.kalin ?? 0.16
            const bas = 0.42
            const ex = b.x - ux * 0.2
            const ey = b.y - uy * 0.2
            const gx = ex - ux * bas
            const gy = ey - uy * bas
            const px = -uy
            const py = ux
            const sx = a.x + ux * 0.25
            const sy = a.y + uy * 0.25
            const pts = [
              [sx + (px * k) / 2, sy + (py * k) / 2],
              [gx + (px * k) / 2, gy + (py * k) / 2],
              [gx + px * k * 1.6, gy + py * k * 1.6],
              [ex, ey],
              [gx - px * k * 1.6, gy - py * k * 1.6],
              [gx - (px * k) / 2, gy - (py * k) / 2],
              [sx - (px * k) / 2, sy - (py * k) / 2],
            ]
            return <polygon key={i} className={'okd-' + renk} points={pts.map((p) => p.join(',')).join(' ')} />
          })}
        </svg>
      )}
      {terfi && (
        <div className="terfi" onPointerDown={(e) => e.stopPropagation()}>
          <div className="terfi-kutu">
            {(['q', 'r', 'b', 'n'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  const f = terfi
                  setTerfi(null)
                  setSecili(null)
                  hamle?.(f.from, f.to, t)
                }}
              >
                <img src={tasYolu(siraRenk + t.toUpperCase(), ayar.taslar)} alt={t} />
              </button>
            ))}
            <button className="terfi-vazgec" onClick={() => setTerfi(null)}>
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
