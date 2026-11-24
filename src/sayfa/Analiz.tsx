import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import Tahta, { type Ok } from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { DegerCubuk, Gezinti, HamleListesi, MotorSatirlari } from '../bilesen/Ortak'
import { Modal } from '../bilesen/AyarlarModal'
import { motor, cpSayi, type Satir } from '../lib/motor'
import { anahtar, BASLANGIC, chessYap, numarali, pvSan, sonucMetni, trSan, uciOyna, type Renk } from '../lib/satranc'
import { acilisAdi, trAd, type Acilis } from '../lib/veri'
import { hamleSesi } from '../lib/ses'
import { useAyarlar, useKayit } from '../lib/kayit'

type H = { san: string; uci: string; fen: string }
type Rapor = { degerler: number[]; siniflar: string[]; dogruluk: { w: number; b: number }; sayilar: Record<Renk, Record<string, number>> }

const kazanma = (cp: number) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)

function pgnYukle(metin: string): { ilk: string; hamleler: H[] } | null {
  const m = metin.trim()
  if (!m) return null
  const fenCh = chessYap(m)
  if (fenCh && m.split('/').length === 8) return { ilk: fenCh.fen(), hamleler: [] }
  try {
    const ch = new Chess()
    ch.loadPgn(m)
    const gecmis = ch.history({ verbose: true })
    const ilk = gecmis.length ? gecmis[0].before : ch.fen()
    return { ilk, hamleler: gecmis.map((x) => ({ san: x.san, uci: x.from + x.to + (x.promotion || ''), fen: x.after })) }
  } catch {
    // düz hamle listesi dene
    const ch = new Chess()
    const out: H[] = []
    for (const s of m.replace(/\d+\.(\.\.)?/g, ' ').split(/\s+/).filter(Boolean)) {
      if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(s)) break
      try {
        const x = ch.move(s)
        out.push({ san: x.san, uci: x.from + x.to + (x.promotion || ''), fen: x.after })
      } catch {
        return null
      }
    }
    return out.length ? { ilk: BASLANGIC, hamleler: out } : null
  }
}

export default function Analiz() {
  const [ayar] = useAyarlar()
  const [params, setParams] = useSearchParams()
  const [kayit, setKayit] = useKayit<{ ilk: string; ana: H[] } | null>('analiz', null)
  const [ilk, setIlk] = useState(BASLANGIC)
  const [ana, setAna] = useState<H[]>([])
  const [varyant, setVaryant] = useState<{ kok: number; hamleler: H[] } | null>(null)
  const [imlec, setImlec] = useState(0)
  const [yon, setYon] = useState<Renk>('w')
  const [motorAcik, setMotorAcik] = useState(true)
  const [satirlar, setSatirlar] = useState<Satir[]>([])
  const [ice, setIce] = useState(false)
  const [iceMetin, setIceMetin] = useState('')
  const [iceHata, setIceHata] = useState('')
  const [acilis, setAcilis] = useState<Acilis | null>(null)
  const [rapor, setRapor] = useState<Rapor | null>(null)
  const [raporIlerleme, setRaporIlerleme] = useState<number | null>(null)
  const [kopyalandi, setKopyalandi] = useState('')
  const raporNo = useRef(0)
  const raporCalisiyor = useRef(false)
  /** süren raporu geçersiz kıl (hat değişti, sıfırlandı, sayfadan çıkıldı) */
  const raporuIptal = () => {
    raporNo.current++
    if (raporCalisiyor.current) {
      raporCalisiyor.current = false
      motor.dur()
      setRaporIlerleme(null)
      setMotorAcik(true)
    }
  }
  useEffect(
    () => () => {
      raporNo.current++
      motor.dur()
    },
    [],
  )

  // ilk yükleme: url > kayıt
  useEffect(() => {
    const fen = params.get('fen')
    const pgn = params.get('pgn')
    const renk = params.get('yon')
    if (pgn || fen) {
      const y = pgn ? pgnYukle(pgn) : null
      const f = fen && chessYap(fen) ? fen : null
      if (y && f && y.hamleler.length === 0) yukle(f, [])
      else if (y) yukle(y.ilk, y.hamleler, y.hamleler.length)
      else if (f) yukle(f, [])
      if (renk === 'b' || renk === 'w') setYon(renk)
      setParams({}, { replace: true })
    } else if (kayit) yukle(kayit.ilk, kayit.ana, kayit.ana.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function yukle(fen: string, hamleler: H[], im = 0) {
    raporuIptal()
    setIlk(fen)
    setAna(hamleler)
    setVaryant(null)
    setImlec(im)
    setRapor(null)
  }

  useEffect(() => {
    setKayit(ana.length || ilk !== BASLANGIC ? { ilk, ana } : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ilk, ana])

  const hat = useMemo(() => (varyant ? [...ana.slice(0, varyant.kok), ...varyant.hamleler] : ana), [ana, varyant])
  const fen = imlec === 0 ? ilk : hat[imlec - 1]?.fen ?? ilk
  const ch = useMemo(() => chessYap(fen), [fen])
  const tekrar = useMemo(() => {
    const k = anahtar(fen)
    return [ilk, ...hat.slice(0, imlec).map((h) => h.fen)].filter((f) => anahtar(f) === k).length
  }, [fen, ilk, hat, imlec])
  const bitis = ch ? (sonucMetni(ch) ?? (tekrar >= 3 ? 'Üç kez tekrar. Berabere.' : null)) : null

  // açılış adı
  useEffect(() => {
    if (ilk !== BASLANGIC) return setAcilis(null)
    let iptal = false
    acilisAdi([ilk, ...hat.slice(0, imlec).map((h) => h.fen)]).then((a) => !iptal && setAcilis(a)).catch(() => {})
    return () => {
      iptal = true
    }
  }, [hat, imlec, ilk])

  // motor
  useEffect(() => {
    setSatirlar([])
    if (!motorAcik || !ch || ch.isGameOver() || tekrar >= 3 || raporIlerleme != null) return
    motor.ara({ fen, derinlik: 22, multipv: 3 }, (_l, hepsi) => setSatirlar([...hepsi])).catch(() => {})
    return () => motor.dur()
  }, [fen, motorAcik, ch, raporIlerleme, tekrar])

  const hamleYap = useCallback(
    (from: string, to: string, terfi?: string) => {
      if (!ch) return
      const c = new Chess(ch.fen())
      const m = uciOyna(c, from + to + (terfi || ''))
      if (!m) return
      hamleSesi(m.san)
      const h: H = { san: m.san, uci: m.from + m.to + (m.promotion || ''), fen: c.fen() }
      if (hat[imlec]?.uci === h.uci) return setImlec(imlec + 1)
      if (!varyant) {
        if (imlec === ana.length) {
          raporuIptal()
          setAna([...ana, h])
          setRapor(null)
        } else setVaryant({ kok: imlec, hamleler: [h] })
      } else if (imlec >= varyant.kok) setVaryant({ kok: varyant.kok, hamleler: [...varyant.hamleler.slice(0, imlec - varyant.kok), h] })
      else setVaryant({ kok: imlec, hamleler: [h] })
      setImlec(imlec + 1)
    },
    [ch, hat, imlec, ana, varyant],
  )

  const git = useCallback((i: number) => setImlec(Math.max(0, Math.min(hat.length, i))), [hat.length])
  const cevir = useCallback(() => setYon((y) => (y === 'w' ? 'b' : 'w')), [])

  const oklar: Ok[] = useMemo(() => {
    if (!motorAcik || !satirlar[0]?.pv[0]) return []
    const out: Ok[] = []
    satirlar.slice(0, 2).forEach((l, i) => {
      const u = l.pv[0]
      if (u) out.push({ from: u.slice(0, 2), to: u.slice(2, 4), renk: i === 0 ? 'mavi' : 'gri', kalin: i === 0 ? 0.17 : 0.12 })
    })
    return out
  }, [satirlar, motorAcik])

  const son = imlec > 0 ? hat[imlec - 1] : null
  const sanCevir = (s: string) => trSan(s, ayar.trNotasyon)

  const pgnMetni = () => {
    const sanlar = ana.map((h) => h.san)
    const bas = ilk !== BASLANGIC ? `[SetUp "1"]\n[FEN "${ilk}"]\n\n` : ''
    return bas + numarali(sanlar, ilk)
  }
  const kopyala = async (metin: string, ne: string) => {
    try {
      await navigator.clipboard.writeText(metin)
      setKopyalandi(ne)
      setTimeout(() => setKopyalandi(''), 1500)
    } catch {
      setKopyalandi('kopyalanamadı')
    }
  }

  async function raporYap() {
    if (ana.length < 2) return
    const no = ++raporNo.current
    raporCalisiyor.current = true
    setMotorAcik(false)
    motor.dur()
    setRaporIlerleme(0)
    await new Promise((r) => setTimeout(r, 60))
    if (no !== raporNo.current) return
    const fenler = [ilk, ...ana.map((h) => h.fen)]
    // geçmişi koruyarak üç kez tekrarı yakala
    const tekrarSay = (i: number) => fenler.slice(0, i + 1).filter((f) => anahtar(f) === anahtar(fenler[i])).length
    const degerler: number[] = []
    const enIyiler: string[] = []
    for (let i = 0; i < fenler.length; i++) {
      if (no !== raporNo.current) return
      const c = chessYap(fenler[i])!
      if (c.isCheckmate()) {
        degerler.push(c.turn() === 'w' ? -10000 : 10000)
        enIyiler.push('')
      } else if (c.isGameOver() || tekrarSay(i) >= 3) {
        degerler.push(0)
        enIyiler.push('')
      } else {
        const s = await motor.ara({ fen: fenler[i], derinlik: 13 })
        if (no !== raporNo.current) return
        if (!s) {
          raporuIptal()
          return
        }
        degerler.push(cpSayi(s.satirlar[0]))
        enIyiler.push(s.enIyi)
      }
      setRaporIlerleme((i + 1) / fenler.length)
    }
    const siniflar: string[] = []
    const kayip: Record<Renk, number[]> = { w: [], b: [] }
    const sayilar: Record<Renk, Record<string, number>> = { w: {}, b: {} }
    ana.forEach((h, i) => {
      const r: Renk = fenler[i].split(' ')[1] === 'b' ? 'b' : 'w'
      const once = r === 'w' ? kazanma(degerler[i]) : 100 - kazanma(degerler[i])
      const sonra = r === 'w' ? kazanma(degerler[i + 1]) : 100 - kazanma(degerler[i + 1])
      const d = Math.max(0, once - sonra)
      kayip[r].push(d)
      let s = 'iyi'
      if (h.uci === enIyiler[i]) s = 'enIyi'
      else if (d >= 30) s = 'buyuk'
      else if (d >= 20) s = 'hata'
      else if (d >= 10) s = 'supheli'
      siniflar.push(s)
      sayilar[r][s] = (sayilar[r][s] || 0) + 1
    })
    const acc = (l: number[]) => (l.length ? l.map((d) => Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * d) - 3.1669))).reduce((a, b) => a + b, 0) / l.length : 0)
    if (no !== raporNo.current) return
    raporCalisiyor.current = false
    setRapor({ degerler, siniflar, dogruluk: { w: acc(kayip.w), b: acc(kayip.b) }, sayilar })
    setRaporIlerleme(null)
    setMotorAcik(true)
  }

  const listeHamleler = hat.map((h, i) => ({ san: h.san, sinif: !varyant || i < varyant.kok ? rapor?.siniflar[i] : undefined }))
  const ilkSiyah = ilk.split(' ')[1] === 'b'
  const ilkNo = parseInt(ilk.split(' ')[5] || '1', 10)

  return (
    <div>
      <div className="ust-baslik">
        <div className="ust-kucuk">Analiz</div>
        <h1>Konumu incele</h1>
        <p>Hamle oyna, oyun yapıştır ya da FEN gir. Stockfish en iyi üç devamı gösterir. Oyun raporu her hamleyi değerlendirir.</p>
      </div>
      <div className="calisma">
        <div>
          <div className="calisma-tahta">
            {motorAcik && <DegerCubuk satir={bitis && ch?.isCheckmate() ? { mat: ch.turn() === 'w' ? -1 : 1 } : satirlar[0]} yon={yon} />}
            <div className="tahta-sarmal">
              <Tahta fen={fen} yon={yon} oynar="ikisi" hamle={hamleYap} sonHamle={son ? [son.uci.slice(0, 2), son.uci.slice(2, 4)] : null} oklar={oklar} />
            </div>
          </div>
          <Gezinti imlec={imlec} son={hat.length} git={git} cevir={cevir} />
        </div>
        <div className="panel">
          <div className="kart" style={{ padding: 14 }}>
            <div className="satir" style={{ marginBottom: 8 }}>
              <button className={'anahtar' + (motorAcik ? ' acik' : '')} onClick={() => setMotorAcik(!motorAcik)} role="switch" aria-checked={motorAcik} disabled={raporIlerleme != null} />
              <strong>Stockfish 18</strong>
              <div className="bosluk" />
              {motorAcik && satirlar[0] && <span className="etiket mono">derinlik {satirlar[0].derinlik}</span>}
            </div>
            {bitis ? (
              <div className="bildirim vurgu">{bitis}</div>
            ) : motorAcik ? (
              <MotorSatirlari satirlar={satirlar} fen={fen} sanlar={(pv) => numarali(pvSan(fen, pv, 10), fen, sanCevir)} tikla={(u) => u && hamleYap(u.slice(0, 2), u.slice(2, 4), u[4])} />
            ) : (
              <div className="soluk" style={{ fontSize: 13 }}>
                {raporIlerleme != null ? 'Oyun raporu hazırlanıyor…' : 'Motor kapalı.'}
              </div>
            )}
          </div>

          {acilis && (
            <div className="satir" style={{ fontSize: 13.5 }}>
              <span className="etiket vurgu">{acilis.eco}</span>
              <span style={{ fontWeight: 600 }}>{trAd(acilis.ad)}</span>
            </div>
          )}

          {varyant && (
            <div className="bildirim vurgu" style={{ alignItems: 'center', fontSize: 13.5 }}>
              <div style={{ flex: 1 }}>Varyant inceliyorsun. Ana hat korunuyor.</div>
              <button
                className="dugme kucuk"
                onClick={() => {
                  setImlec(Math.min(imlec, varyant.kok))
                  setVaryant(null)
                }}
              >
                Ana hatta dön
              </button>
              <button
                className="dugme kucuk hayalet"
                onClick={() => {
                  raporuIptal()
                  setAna(hat)
                  setVaryant(null)
                  setRapor(null)
                }}
              >
                Ana hat yap
              </button>
            </div>
          )}

          <HamleListesi hamleler={listeHamleler} imlec={imlec} git={git} ilkSiyah={ilkSiyah} ilkNo={ilkNo} bos="Tahtada bir hamle oyna ya da oyun içe aktar." />

          <div className="satir">
            <button className="dugme kucuk" onClick={() => setIce(true)}>
              <Simge ad="yukle" boy={16} /> İçe aktar
            </button>
            <button className="dugme kucuk" onClick={() => kopyala(pgnMetni(), 'PGN')} disabled={!ana.length}>
              <Simge ad="kopya" boy={16} /> PGN
            </button>
            <button className="dugme kucuk" onClick={() => kopyala(fen, 'FEN')}>
              <Simge ad="kopya" boy={16} /> FEN
            </button>
            <button
              className="dugme kucuk hayalet"
              onClick={() => {
                yukle(BASLANGIC, [])
              }}
            >
              <Simge ad="yenile" boy={16} /> Sıfırla
            </button>
            {kopyalandi && <span className="etiket iyi">{kopyalandi === 'kopyalanamadı' ? kopyalandi : kopyalandi + ' kopyalandı'}</span>}
          </div>

          <div className="kart" style={{ padding: 14 }}>
            <div className="satir" style={{ marginBottom: rapor || raporIlerleme != null ? 10 : 0 }}>
              <Simge ad="rapor" />
              <strong>Oyun raporu</strong>
              <div className="bosluk" />
              {raporIlerleme == null ? (
                <button className="dugme kucuk birincil" onClick={raporYap} disabled={ana.length < 2}>
                  {rapor ? 'Yenile' : 'Hazırla'}
                </button>
              ) : (
                <button
                  className="dugme kucuk"
                  onClick={() => {
                    raporuIptal()
                  }}
                >
                  Durdur
                </button>
              )}
            </div>
            {raporIlerleme != null && (
              <div className="ilerleme-cubuk">
                <div style={{ width: `${raporIlerleme * 100}%` }} />
              </div>
            )}
            {!rapor && raporIlerleme == null && (
              <div className="soluk" style={{ fontSize: 13, marginTop: 6 }}>
                Ana hattaki her hamleyi değerlendirir: en iyi, şüpheli (?!), hata (?), büyük hata (??).
              </div>
            )}
            {rapor && <RaporGoster rapor={rapor} imlec={imlec} git={git} />}
          </div>
          <div className="soluk" style={{ fontSize: 12.5 }}>
            İpucu: sağ tıkla sürükleyerek ok çiz. Klavyede ← → ile gez, f ile çevir. <Link to="/oyna" style={{ color: 'var(--vurgu)' }}>Bilgisayara karşı oyna →</Link>
          </div>
        </div>
      </div>

      {ice && (
        <Modal kapat={() => setIce(false)} baslik="Oyun ya da konum içe aktar">
          <p className="soluk" style={{ fontSize: 14 }}>
            PGN, hamle listesi (1. e4 e5 2. Nf3) ya da FEN yapıştır.
          </p>
          <textarea className="giris" value={iceMetin} onChange={(e) => setIceMetin(e.target.value)} placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6" autoFocus />
          {iceHata && (
            <div className="bildirim kotu" style={{ marginTop: 10 }}>
              {iceHata}
            </div>
          )}
          <div className="satir" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
            <button className="dugme hayalet" onClick={() => setIce(false)}>
              Vazgeç
            </button>
            <button
              className="dugme birincil"
              onClick={() => {
                const y = pgnYukle(iceMetin)
                if (!y) return setIceHata('Okunamadı. PGN ya da FEN biçimini kontrol et.')
                yukle(y.ilk, y.hamleler, 0)
                setIce(false)
                setIceMetin('')
                setIceHata('')
                if (y.ilk.split(' ')[1] === 'b' && !y.hamleler.length) setYon('b')
              }}
            >
              Yükle
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RaporGoster({ rapor, imlec, git }: { rapor: Rapor; imlec: number; git: (i: number) => void }) {
  const n = rapor.degerler.length
  const g = 300
  const y = 70
  const nokta = rapor.degerler.map((d, i) => {
    const p = kazanma(Math.max(-1500, Math.min(1500, d))) / 100
    return [n > 1 ? (i / (n - 1)) * g : 0, y - p * y] as const
  })
  const yol = `M0,${y} ` + nokta.map(([a, b]) => `L${a.toFixed(1)},${b.toFixed(1)}`).join(' ') + ` L${g},${y} Z`
  const AD: [string, string][] = [
    ['enIyi', 'En iyi'],
    ['supheli', 'Şüpheli'],
    ['hata', 'Hata'],
    ['buyuk', 'Büyük hata'],
  ]
  return (
    <div>
      <svg
        viewBox={`0 0 ${g} ${y}`}
        style={{ width: '100%', height: 80, background: '#2a2a2a', borderRadius: 8, cursor: 'pointer', display: 'block' }}
        preserveAspectRatio="none"
        onClick={(e) => {
          const b = (e.currentTarget as SVGElement).getBoundingClientRect()
          git(Math.round(((e.clientX - b.left) / b.width) * (n - 1)))
        }}
      >
        <path d={yol} fill="#f2efe9" />
        <line x1={0} x2={g} y1={y / 2} y2={y / 2} stroke="#888" strokeWidth={0.5} strokeDasharray="3 3" />
        {n > 1 && <line x1={(imlec / (n - 1)) * g} x2={(imlec / (n - 1)) * g} y1={0} y2={y} stroke="var(--vurgu)" strokeWidth={1.5} />}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 16px', marginTop: 12, fontSize: 13.5 }}>
        <span />
        <strong>Beyaz</strong>
        <strong>Siyah</strong>
        <span className="soluk">Doğruluk</span>
        <span className="mono">%{rapor.dogruluk.w.toFixed(0)}</span>
        <span className="mono">%{rapor.dogruluk.b.toFixed(0)}</span>
        {AD.map(([k, ad]) => (
          <div key={k} style={{ display: 'contents' }}>
            <span className={'sinif-' + k}>{ad}</span>
            <span className="mono">{rapor.sayilar.w[k] || 0}</span>
            <span className="mono">{rapor.sayilar.b[k] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
