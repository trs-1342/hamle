import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Chess } from 'chess.js'
import Tahta from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { Gezinti, HamleListesi } from '../bilesen/Ortak'
import { oneCikanBul, type OneCikan } from '../icerik/acilislar'
import { acilislar, trAd, type Acilis } from '../lib/veri'
import { numarali, pgnSanlar, sanFenler, sanOyna, uciOyna, type Renk } from '../lib/satranc'
import { hamleSesi, sesler } from '../lib/ses'
import { useIlerleme, ILERLEME_VARSAYILAN } from '../lib/kayit'

type Kip = 'incele' | 'calis'

export default function AcilisDetay() {
  const { id = '' } = useParams()
  const one = oneCikanBul(id)
  const [db, setDb] = useState<Acilis | null | undefined>(undefined)
  useEffect(() => {
    if (one || !id.startsWith('db-')) return setDb(null)
    const i = parseInt(id.slice(3), 10)
    acilislar()
      .then((l) => setDb(l[i] ?? null))
      .catch(() => setDb(null))
  }, [id, one])

  if (one) return <Detay key={id} one={one} />
  if (db === undefined) return <div className="yukleniyor">Yükleniyor…</div>
  if (!db)
    return (
      <div className="yukleniyor">
        Açılış bulunamadı. <Link to="/acilislar">Açılışlara dön</Link>
      </div>
    )
  return <Detay key={id} db={db} />
}

function Detay({ one, db }: { one?: OneCikan; db?: Acilis }) {
  const [varyantNo, setVaryantNo] = useState(-1)
  const anaHat = one ? one.hat : db!.pgn
  const hatMetni = one && varyantNo >= 0 ? one.varyantlar[varyantNo].hat : anaHat
  const sanlar = useMemo(() => (one ? hatMetni.split(' ') : pgnSanlar(hatMetni)), [hatMetni, one])
  const fenler = useMemo(() => sanFenler(sanlar), [sanlar])
  const [imlecHam, setImlec] = useState(fenler.length - 1)
  const imlec = Math.min(imlecHam, fenler.length - 1)
  const [yon, setYon] = useState<Renk>(one?.renk ?? (sanlar.length % 2 === 1 ? 'w' : 'b'))
  const [kip, setKip] = useState<Kip>('incele')
  const ad = one ? one.ad : trAd(db!.ad)
  const anahtarId = one ? one.id : 'db-' + db!.i

  useEffect(() => setImlec(fenler.length - 1), [fenler])

  const sonHamle = useMemo(() => {
    if (imlec === 0) return null
    const c = new Chess(fenler[imlec - 1])
    const m = sanOyna(c, sanlar[imlec - 1])
    return m ? ([m.from, m.to] as [string, string]) : null
  }, [imlec, fenler, sanlar])

  const varyant = one && varyantNo >= 0 ? one.varyantlar[varyantNo] : null

  return (
    <div>
      <div className="satir" style={{ marginBottom: 14 }}>
        <Link to={one ? '/acilislar' : '/acilislar?sekme=tum'} className="dugme hayalet kucuk">
          <Simge ad="geri" boy={15} /> Açılışlar
        </Link>
      </div>
      <div className="calisma">
        <div>
          {kip === 'incele' ? (
            <>
              <div className="calisma-tahta">
                <div className="tahta-sarmal">
                  <Tahta fen={fenler[imlec]} yon={yon} sonHamle={sonHamle} />
                </div>
              </div>
              <Gezinti imlec={imlec} son={fenler.length - 1} git={(i) => setImlec(Math.max(0, Math.min(fenler.length - 1, i)))} cevir={() => setYon(yon === 'w' ? 'b' : 'w')} />
            </>
          ) : (
            <Calisma key={hatMetni} sanlar={sanlar} renk={yon} bitince={() => {}} anahtarId={anahtarId} />
          )}
        </div>
        <div className="panel">
          <div>
            <div className="satir" style={{ gap: 6, marginBottom: 8 }}>
              <span className="etiket vurgu">{one?.eco ?? db!.eco}</span>
              {one && <span className="etiket">{one.renk === 'w' ? 'Beyazla oynanır' : 'Siyahla oynanır'}</span>}
              {one && <span className="etiket">{one.seviye}</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: 4 }}>{ad}</h1>
            {db && trAd(db.ad) !== db.ad && <div className="soluk">{db.ad}</div>}
          </div>
          <div className="sekmeler">
            <button className={kip === 'incele' ? 'secili' : ''} onClick={() => setKip('incele')}>
              <Simge ad="goz" boy={15} /> İncele
            </button>
            <button className={kip === 'calis' ? 'secili' : ''} onClick={() => setKip('calis')}>
              <Simge ad="hedef" boy={15} /> Çalış
            </button>
          </div>
          {one && (
            <div className="satir" style={{ gap: 6 }}>
              <button className={'etiket' + (varyantNo < 0 ? ' vurgu' : '')} style={{ cursor: 'pointer' }} onClick={() => setVaryantNo(-1)}>
                Ana hat
              </button>
              {one.varyantlar.map((v, i) => (
                <button key={i} className={'etiket' + (varyantNo === i ? ' vurgu' : v.tuzak ? ' kotu' : '')} style={{ cursor: 'pointer' }} onClick={() => setVaryantNo(i)}>
                  {v.tuzak ? 'Tuzak: ' : ''}
                  {v.ad}
                </button>
              ))}
            </div>
          )}
          {varyant && <div className={'bildirim ' + (varyant.tuzak ? 'kotu' : 'vurgu')}>{varyant.not}</div>}
          {kip === 'incele' && (
            <HamleListesi hamleler={sanlar.map((s) => ({ san: s }))} imlec={imlec} git={(i) => setImlec(i)} />
          )}
          {one && kip === 'incele' && (
            <>
              <div className="kart">
                <p style={{ marginBottom: 14 }}>{one.ozet}</p>
                <h3>Ana fikirler</h3>
                <ul style={{ paddingLeft: 18, margin: '0 0 14px' }}>
                  {one.fikirler.map((f, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {f}
                    </li>
                  ))}
                </ul>
                <h3>Dikkat</h3>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {one.dikkat.map((f, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <div className="satir">
            <Link className="dugme kucuk" to={'/analiz?pgn=' + encodeURIComponent(numarali(sanlar.slice(0, kip === 'incele' ? imlec : sanlar.length), fenler[0])) + '&yon=' + yon}>
              <Simge ad="analiz" boy={15} /> Analizde aç
            </Link>
            <Link className="dugme kucuk" to={'/acilislar?sekme=kasif&hat=' + encodeURIComponent(sanlar.join(' '))}>
              <Simge ad="acilis" boy={15} /> Kâşifte devam et
            </Link>
            {!one && kip === 'calis' && (
              <button className="dugme kucuk" onClick={() => setYon(yon === 'w' ? 'b' : 'w')}>
                <Simge ad="cevir" boy={15} /> Renk değiştir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** açılış çalışma: kullanıcı kendi rengini oynar, karşı tarafı uygulama oynar */
function Calisma({ sanlar, renk, anahtarId }: { sanlar: string[]; renk: Renk; bitince: () => void; anahtarId: string }) {
  const [, setIlerleme] = useIlerleme()
  const fenler = useMemo(() => sanFenler(sanlar), [sanlar])
  const [i, setI] = useState(0)
  const [fen, setFen] = useState(fenler[0])
  const [hata, setHata] = useState(0)
  const [toplamHata, setToplamHata] = useState(0)
  const [mesaj, setMesaj] = useState<{ tur: 'iyi' | 'kotu' | 'vurgu'; m: string } | null>(null)
  const [sonHamle, setSonHamle] = useState<[string, string] | null>(null)
  const [isaret, setIsaret] = useState<Record<string, string>>({})
  const [bitti, setBitti] = useState(false)
  const zaman = useRef<number[]>([])
  const temizle = () => {
    zaman.current.forEach(clearTimeout)
    zaman.current = []
  }
  useEffect(() => temizle, [])

  const siraBende = (k: number) => (fenler[k]?.split(' ')[1] ?? 'w') === renk

  const rakipOyna = (k: number) => {
    if (k >= sanlar.length) return bitir()
    zaman.current.push(
      window.setTimeout(() => {
        const c = new Chess(fenler[k])
        const m = sanOyna(c, sanlar[k])
        if (!m) return
        hamleSesi(m.san)
        setFen(c.fen())
        setSonHamle([m.from, m.to])
        setIsaret({})
        setI(k + 1)
        if (k + 1 >= sanlar.length) bitir()
      }, 500),
    )
  }

  const baslat = () => {
    temizle()
    setI(0)
    setFen(fenler[0])
    setHata(0)
    setToplamHata(0)
    setMesaj(null)
    setSonHamle(null)
    setIsaret({})
    setBitti(false)
    if (!siraBende(0)) rakipOyna(0)
  }

  useEffect(() => {
    baslat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanlar, renk])

  const bitir = () => {
    setBitti(true)
    sesler.bitti()
    setIlerleme((p) => {
      const q = { ...ILERLEME_VARSAYILAN, ...p }
      return { ...q, acilislar: { ...q.acilislar, [anahtarId]: (q.acilislar[anahtarId] || 0) + 1 } }
    })
  }

  const hamle = (from: string, to: string, terfi?: string) => {
    if (bitti || !siraBende(i)) return
    const beklenenC = new Chess(fenler[i])
    const beklenen = sanOyna(beklenenC, sanlar[i])
    const c = new Chess(fenler[i])
    const m = uciOyna(c, from + to + (terfi || ''))
    if (!m || !beklenen) return
    if (m.san !== beklenen.san) {
      sesler.yanlis()
      const h = hata + 1
      setHata(h)
      setToplamHata(toplamHata + 1)
      setFen(c.fen())
      setSonHamle([m.from, m.to])
      setIsaret({ [m.to]: 'kotu' })
      setMesaj({ tur: 'kotu', m: h >= 2 ? `Bu hatta ${beklenen.san} oynanır. Gösterilen hamleyi yap.` : `${m.san} bu hatta yok. Tekrar dene.` })
      zaman.current.push(
        window.setTimeout(() => {
          setFen(fenler[i])
          setSonHamle(null)
          setIsaret(h >= 2 ? { [beklenen.from]: 'ipucu', [beklenen.to]: 'ipucu' } : {})
        }, 700),
      )
      return
    }
    hamleSesi(m.san)
    setHata(0)
    setFen(c.fen())
    setSonHamle([m.from, m.to])
    setIsaret({})
    setMesaj({ tur: 'iyi', m: 'Doğru.' })
    setI(i + 1)
    rakipOyna(i + 1)
  }

  const kalan = sanlar.filter((_, k) => siraBende(k)).length
  const yapilan = sanlar.slice(0, i).filter((_, k) => siraBende(k)).length

  return (
    <div>
      <div className="calisma-tahta">
        <div className="tahta-sarmal">
          <Tahta fen={fen} yon={renk} oynar={!bitti && siraBende(i) ? renk : 'yok'} hamle={hamle} sonHamle={sonHamle} isaret={isaret} />
        </div>
      </div>
      <div style={{ marginTop: 12 }} className="panel">
        <div className="ilerleme-cubuk">
          <div style={{ width: `${(yapilan / Math.max(1, kalan)) * 100}%` }} />
        </div>
        {bitti ? (
          <div className="bildirim iyi yuksel" style={{ alignItems: 'center' }}>
            <Simge ad="tamam" />
            <div style={{ flex: 1 }}>
              <strong>Hat tamam!</strong> {toplamHata === 0 ? 'Hiç hata yapmadın.' : `${toplamHata} hata. Bir kez daha dene, ezberin otursun.`}
            </div>
            <button className="dugme kucuk" onClick={baslat}>
              <Simge ad="yenile" boy={15} /> Tekrar
            </button>
          </div>
        ) : mesaj ? (
          <div className={'bildirim ' + mesaj.tur}>{mesaj.m}</div>
        ) : (
          <div className="bildirim vurgu">{renk === 'w' ? 'Beyaz' : 'Siyah'} taşlarla hattı tahtada oyna. Rakibin hamlelerini uygulama yapar.</div>
        )}
      </div>
    </div>
  )
}
