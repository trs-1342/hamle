import { useEffect, useRef } from 'react'
import { beyazOlasilik, degerMetni, type Satir } from '../lib/motor'
import { trSan, type Renk } from '../lib/satranc'
import { useAyarlar } from '../lib/kayit'
import Simge from './Simge'

export function DegerCubuk({ satir, yon }: { satir?: { cp?: number; mat?: number }; yon: Renk }) {
  const p = beyazOlasilik(satir)
  const metin = satir ? degerMetni(satir).replace('+', '') : ''
  const beyazUstun = p >= 0.5
  return (
    <div className={'deger-cubuk' + (yon === 'b' ? ' ters' : '')} aria-label={'Değerlendirme ' + metin}>
      <div className="beyaz" style={{ height: `${p * 100}%` }} />
      {satir && (
        <div
          className="deger"
          style={
            (beyazUstun ? yon === 'w' : yon === 'b')
              ? { bottom: 4, color: '#222' }
              : { top: 4, color: '#eee' }
          }
        >
          {metin}
        </div>
      )}
    </div>
  )
}

export type ListeHamle = { san: string; sinif?: string }

export const SINIF_ISARET: Record<string, string> = { enIyi: '', iyi: '', supheli: '?!', hata: '?', buyuk: '??' }

/** iki sütunlu hamle listesi; imlec = gösterilen yarım hamle sayısı */
export function HamleListesi({
  hamleler,
  imlec,
  git,
  ilkSiyah,
  ilkNo = 1,
  bos = 'Henüz hamle yok.',
}: {
  hamleler: ListeHamle[]
  imlec: number
  git: (i: number) => void
  ilkSiyah?: boolean
  ilkNo?: number
  bos?: string
}) {
  const [ayar] = useAyarlar()
  const kutu = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = kutu.current?.querySelector('.aktif') as HTMLElement | null
    if (el && kutu.current) {
      const k = kutu.current
      const ust = el.offsetTop - k.offsetTop
      if (ust < k.scrollTop || ust > k.scrollTop + k.clientHeight - 30) k.scrollTop = ust - k.clientHeight / 2
    }
  }, [imlec])
  const satirlar: React.ReactNode[] = []
  const liste: (ListeHamle | null)[] = ilkSiyah ? [null, ...hamleler] : hamleler
  for (let i = 0; i < liste.length; i += 2) {
    const no = ilkNo + i / 2
    satirlar.push(
      <div key={'n' + i} className="no">
        {no}
      </div>,
    )
    for (const j of [i, i + 1]) {
      const h = liste[j]
      const gercek = ilkSiyah ? j - 1 : j
      if (!h) {
        satirlar.push(<span key={'b' + j} />)
        continue
      }
      satirlar.push(
        <button key={j} className={imlec === gercek + 1 ? 'aktif' : ''} onClick={() => git(gercek + 1)}>
          <span>
            {trSan(h.san, ayar.trNotasyon)}
            {h.sinif && SINIF_ISARET[h.sinif] && <span className={'sinif-isaret sinif-' + h.sinif}>{SINIF_ISARET[h.sinif]}</span>}
          </span>
        </button>,
      )
    }
  }
  return (
    <div className="hamle-liste" ref={kutu}>
      {hamleler.length === 0 ? <div className="bos">{bos}</div> : satirlar}
    </div>
  )
}

export function Gezinti({ imlec, son, git, cevir, ek }: { imlec: number; son: number; git: (i: number) => void; cevir?: () => void; ek?: React.ReactNode }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') git(Math.max(0, imlec - 1))
      else if (e.key === 'ArrowRight') git(Math.min(son, imlec + 1))
      else if (e.key === 'ArrowUp' || e.key === 'Home') git(0)
      else if (e.key === 'ArrowDown' || e.key === 'End') git(son)
      else if (e.key === 'f' && cevir) cevir()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [imlec, son, git, cevir])
  return (
    <div className="tahta-alt">
      <button className="dugme simgeli" onClick={() => git(0)} disabled={imlec === 0} aria-label="Başa">
        <Simge ad="bas" />
      </button>
      <button className="dugme simgeli" onClick={() => git(imlec - 1)} disabled={imlec === 0} aria-label="Geri">
        <Simge ad="geri" />
      </button>
      <button className="dugme simgeli" onClick={() => git(imlec + 1)} disabled={imlec >= son} aria-label="İleri">
        <Simge ad="ileri" />
      </button>
      <button className="dugme simgeli" onClick={() => git(son)} disabled={imlec >= son} aria-label="Sona">
        <Simge ad="son" />
      </button>
      {cevir && (
        <button className="dugme simgeli" onClick={cevir} aria-label="Tahtayı çevir" title="Tahtayı çevir (f)">
          <Simge ad="cevir" />
        </button>
      )}
      {ek}
    </div>
  )
}

export function MotorSatirlari({ satirlar, fen, sanlar, tikla }: { satirlar: Satir[]; fen: string; sanlar: (pv: string[]) => string; tikla?: (uci: string) => void }) {
  return (
    <div>
      {satirlar.map((l) => (
        <div key={l.multipv} className="motor-satir" onClick={() => tikla?.(l.pv[0])} title="Bu hamleyi oyna">
          <span className={'deger' + ((l.mat ?? l.cp ?? 0) < 0 ? ' siyah' : '')}>{degerMetni(l)}</span>
          <span className="pv">{sanlar(l.pv)}</span>
        </div>
      ))}
      {satirlar.length === 0 && (
        <div className="soluk" style={{ fontSize: 13, padding: '6px 10px' }}>
          Hesaplanıyor… {fen ? '' : ''}
        </div>
      )}
    </div>
  )
}
