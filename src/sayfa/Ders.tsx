import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Chess } from 'chess.js'
import Tahta from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import Metin from '../bilesen/Metin'
import { DERSLER, dersBul } from '../icerik/dersler'
import { chessYap, sira, uciOyna } from '../lib/satranc'
import { hamleSesi, sesler } from '../lib/ses'
import { useIlerleme, ILERLEME_VARSAYILAN } from '../lib/kayit'

type Durum = 'bekliyor' | 'yanlis' | 'tamam'

export default function Ders() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const ders = dersBul(id)
  const [ilerleme, setIlerleme] = useIlerleme()
  const [adimNo, setAdimNo] = useState(0)
  const [fen, setFen] = useState('')
  const [j, setJ] = useState(0)
  const [durum, setDurum] = useState<Durum>('bekliyor')
  const [mesaj, setMesaj] = useState('')
  const [sonHamle, setSonHamle] = useState<[string, string] | null>(null)
  const [isaret, setIsaret] = useState<Record<string, string>>({})
  const [ipucuAcik, setIpucuAcik] = useState(false)
  const zaman = useRef<number[]>([])

  const adim = ders?.adimlar[adimNo]

  useEffect(() => {
    zaman.current.forEach(clearTimeout)
    zaman.current = []
    if (!adim) return
    setFen(adim.fen)
    setJ(0)
    setDurum('bekliyor')
    setMesaj('')
    setSonHamle(null)
    setIsaret(adim.isaret ?? {})
    setIpucuAcik(false)
  }, [adim])

  useEffect(() => () => zaman.current.forEach(clearTimeout), [])
  useEffect(() => setAdimNo(0), [id])

  if (!ders || !adim) {
    return (
      <div className="yukleniyor">
        Ders bulunamadı. <Link to="/dersler">Derslere dön</Link>
      </div>
    )
  }

  const gorev = adim.gorev
  const oyuncu = sira(adim.fen)
  const bitti = !gorev || durum === 'tamam'
  const son = adimNo === ders.adimlar.length - 1
  const dersSira = DERSLER.findIndex((d) => d.id === ders.id)
  const sonraki = DERSLER[dersSira + 1]
  const tamamlandi = !!{ ...ILERLEME_VARSAYILAN, ...ilerleme }.dersler[ders.id]

  const hamle = (from: string, to: string, terfi?: string) => {
    if (!gorev || durum === 'tamam') return
    const c = new Chess(fen)
    const m = uciOyna(c, from + to + (terfi || ''))
    if (!m) return
    const uci = m.from + m.to + (m.promotion || '')
    const kabul = gorev.hat[j].split('|')
    if (!kabul.includes(uci) && !c.isCheckmate()) {
      sesler.yanlis()
      setFen(c.fen())
      setSonHamle([m.from, m.to])
      setIsaret({ [m.to]: 'kotu' })
      setDurum('yanlis')
      setMesaj(gorev.yanlis?.[uci] ?? 'Bu hamle değil. Tekrar dene.')
      const geri = fen
      zaman.current.push(
        window.setTimeout(() => {
          setFen(geri)
          setSonHamle(null)
          setIsaret({})
        }, 900),
      )
      return
    }
    hamleSesi(m.san)
    setFen(c.fen())
    setSonHamle([m.from, m.to])
    setIsaret({ [m.to]: 'iyi' })
    setMesaj('')
    setIpucuAcik(false)
    const yeniJ = j + 1
    if (yeniJ >= gorev.hat.length || c.isCheckmate()) {
      setDurum('tamam')
      setJ(gorev.hat.length)
      sesler.dogru()
      return
    }
    setDurum('bekliyor')
    setJ(yeniJ)
    zaman.current.push(
      window.setTimeout(() => {
        const c2 = new Chess(c.fen())
        let r = null
        for (const u of gorev.hat[yeniJ].split('|')) {
          r = uciOyna(c2, u)
          if (r) break
        }
        if (!r) return
        hamleSesi(r.san)
        setFen(c2.fen())
        setSonHamle([r.from, r.to])
        setIsaret({})
        if (yeniJ + 1 >= gorev.hat.length) {
          setDurum('tamam')
          sesler.dogru()
        }
        setJ(yeniJ + 1)
      }, 550),
    )
  }

  const bitir = () => {
    setIlerleme((p) => ({ ...ILERLEME_VARSAYILAN, ...p, dersler: { ...(p?.dersler ?? {}), [ders.id]: Date.now() } }))
    sesler.bitti()
    if (sonraki) nav('/dersler/' + sonraki.id)
    else nav('/dersler')
  }

  const ipucuGoster = () => {
    if (!gorev) return
    setIpucuAcik(true)
    const u = gorev.hat[j]?.split('|')[0]
    if (u) setIsaret({ [u.slice(0, 2)]: 'ipucu' })
  }

  const oynanabilir = gorev && durum !== 'tamam' && j % 2 === 0 && chessYap(fen)?.turn() === oyuncu

  return (
    <div>
      <div className="satir" style={{ marginBottom: 14 }}>
        <Link to="/dersler" className="dugme hayalet kucuk">
          <Simge ad="geri" boy={15} /> Dersler
        </Link>
        <span className="soluk" style={{ fontSize: 13 }}>
          {ders.bolum}
        </span>
        {tamamlandi && <span className="etiket iyi">tamamlandı</span>}
      </div>
      <div className="calisma">
        <div>
          <div className="calisma-tahta">
            <div className="tahta-sarmal">
              <Tahta
                fen={fen || adim.fen}
                yon={oyuncu}
                oynar={oynanabilir ? oyuncu : 'yok'}
                hamle={hamle}
                sonHamle={sonHamle}
                isaret={isaret}
                oklar={!gorev || durum === 'tamam' ? (adim.oklar ?? []).map((o) => ({ from: o.u.slice(0, 2), to: o.u.slice(2, 4), renk: o.r ?? 'yesil' })) : ipucuAcik ? [] : (adim.oklar ?? []).filter((o) => o.r).map((o) => ({ from: o.u.slice(0, 2), to: o.u.slice(2, 4), renk: o.r ?? 'yesil' }))}
              />
            </div>
          </div>
        </div>
        <div className="panel">
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', marginBottom: 10 }}>{ders.baslik}</h1>
            <div className="satir" style={{ gap: 5 }}>
              {ders.adimlar.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Adım ${i + 1}`}
                  onClick={() => i <= adimNo && setAdimNo(i)}
                  style={{
                    width: 28,
                    height: 6,
                    borderRadius: 99,
                    border: 0,
                    padding: 0,
                    cursor: i <= adimNo ? 'pointer' : 'default',
                    background: i < adimNo ? 'var(--vurgu)' : i === adimNo ? 'var(--metin)' : 'var(--yuzey3)',
                  }}
                />
              ))}
              <span className="soluk" style={{ fontSize: 12.5, marginLeft: 6 }}>
                {adimNo + 1}/{ders.adimlar.length}
              </span>
            </div>
          </div>
          <div className="kart yuksel" key={adimNo} style={{ fontSize: 15.5 }}>
            <Metin metin={adim.metin} />
            {gorev && (
              <div style={{ marginTop: 6 }}>
                {durum === 'tamam' ? (
                  <div className="bildirim iyi">
                    <Simge ad="tamam" />
                    <div>{gorev.basari}</div>
                  </div>
                ) : durum === 'yanlis' && mesaj ? (
                  <div className="bildirim kotu">{mesaj}</div>
                ) : j > 0 ? (
                  <div className="bildirim">Doğru. Devam et.</div>
                ) : (
                  <div className="bildirim vurgu" style={{ alignItems: 'center' }}>
                    <img src={`/piece/${oyuncu}K.svg`} width={22} alt="" />
                    <div style={{ flex: 1 }}>{oyuncu === 'w' ? 'Beyaz' : 'Siyah'} oynar. Tahtada hamleni yap.</div>
                  </div>
                )}
                {ipucuAcik && durum !== 'tamam' && (
                  <div className="soluk" style={{ fontSize: 13.5, marginTop: 8 }}>
                    İpucu: {gorev.ipucu}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="satir">
            <button className="dugme" onClick={() => setAdimNo(adimNo - 1)} disabled={adimNo === 0}>
              <Simge ad="geri" boy={16} /> Geri
            </button>
            {gorev && durum !== 'tamam' && (
              <button className="dugme hayalet" onClick={ipucuGoster}>
                <Simge ad="ampul" boy={16} /> İpucu
              </button>
            )}
            {gorev && (durum !== 'bekliyor' || j > 0) && (
              <button
                className="dugme hayalet"
                onClick={() => {
                  zaman.current.forEach(clearTimeout)
                  zaman.current = []
                  setFen(adim.fen)
                  setJ(0)
                  setDurum('bekliyor')
                  setMesaj('')
                  setSonHamle(null)
                  setIsaret(adim.isaret ?? {})
                }}
              >
                <Simge ad="yenile" boy={16} /> Baştan
              </button>
            )}
            <div className="bosluk" />
            {!son ? (
              <button className="dugme birincil" onClick={() => setAdimNo(adimNo + 1)} disabled={!bitti}>
                İleri <Simge ad="ileri" boy={16} />
              </button>
            ) : (
              <button className="dugme birincil" onClick={bitir} disabled={!bitti}>
                {sonraki ? 'Bitir ve sonraki ders' : 'Dersi bitir'} <Simge ad="tamam" boy={16} />
              </button>
            )}
          </div>
          {gorev && !bitti && (
            <div className="soluk" style={{ fontSize: 12.5 }}>
              İlerlemek için görevi tamamla ya da ipucu al.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
