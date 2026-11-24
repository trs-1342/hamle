import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chess } from 'chess.js'
import Tahta, { type Ok } from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { HamleListesi, Gezinti } from '../bilesen/Ortak'
import { motor } from '../lib/motor'
import { anahtar, BASLANGIC, chessYap, numarali, sonucMetni, uciOyna, type Renk } from '../lib/satranc'
import { hamleSesi, sesler } from '../lib/ses'
import { useKayit } from '../lib/kayit'
import { acilisAdi, trAd, type Acilis } from '../lib/veri'

type H = { san: string; uci: string; fen: string }
type Oyun = { renk: Renk; seviye: number; hamleler: H[]; bitti: string | null; ipucuSayisi: number }

const SEVIYE = [
  { ad: 'Çaylak', skill: 0, derinlik: 1, sure: 60 },
  { ad: 'Acemi', skill: 2, derinlik: 2, sure: 120 },
  { ad: 'Başlangıç', skill: 4, derinlik: 3, sure: 200 },
  { ad: 'Orta', skill: 7, derinlik: 5, sure: 300 },
  { ad: 'İyi', skill: 10, derinlik: 8, sure: 500 },
  { ad: 'Güçlü', skill: 13, derinlik: 11, sure: 700 },
  { ad: 'Usta', skill: 17, derinlik: 14, sure: 1000 },
  { ad: 'Tam güç', skill: 20, derinlik: 20, sure: 1500 },
]

export default function Oyna() {
  const nav = useNavigate()
  const [oyun, setOyun] = useKayit<Oyun | null>('oyun', null)
  const [kur, setKur] = useState<{ renk: Renk | 'rastgele'; seviye: number }>({ renk: 'w', seviye: 3 })
  const [imlec, setImlec] = useState<number | null>(null)
  const [dusunuyor, setDusunuyor] = useState(false)
  const [ipucu, setIpucu] = useState<Ok | null>(null)
  const [acilis, setAcilis] = useState<Acilis | null>(null)
  const oyunRef = useRef(oyun)
  oyunRef.current = oyun

  const hamleler = useMemo(() => oyun?.hamleler ?? [], [oyun])
  const sonFen = hamleler.length ? hamleler[hamleler.length - 1].fen : BASLANGIC
  const gosterIm = imlec ?? hamleler.length
  const fen = gosterIm === 0 ? BASLANGIC : hamleler[gosterIm - 1].fen
  const canli = gosterIm === hamleler.length
  const ch = useMemo(() => chessYap(sonFen)!, [sonFen])

  const ekle = useCallback(
    (h: H) => {
      const o = oyunRef.current
      if (!o) return
      const c = chessYap(h.fen)!
      const tekrar = [BASLANGIC, ...o.hamleler.map((x) => x.fen), h.fen].filter((f) => anahtar(f) === anahtar(h.fen)).length
      const bitti = sonucMetni(c) ?? (tekrar >= 3 ? 'Üç kez tekrar. Berabere.' : null)
      hamleSesi(h.san)
      if (bitti) setTimeout(() => sesler.bitti(), 250)
      setOyun({ ...o, hamleler: [...o.hamleler, h], bitti })
      setImlec(null)
      setIpucu(null)
    },
    [setOyun],
  )

  // motor sırası
  const oyunVar = !!oyun
  const oyunBitti = oyun?.bitti ?? null
  const oyunRenk = oyun?.renk
  const oyunSeviye = oyun?.seviye ?? 1
  useEffect(() => {
    if (!oyunVar || oyunBitti || ch.turn() === oyunRenk) return
    const s = SEVIYE[oyunSeviye - 1]
    let iptal = false
    setDusunuyor(true)
    const bas = Date.now()
    motor
      .ara({ fen: sonFen, seviye: s.skill, derinlik: s.derinlik, sure: s.sure })
      .then((r) => {
        if (iptal || !r) return
        const bekle = Math.max(0, 450 - (Date.now() - bas))
        setTimeout(() => {
          if (iptal) return
          const c = new Chess(sonFen)
          const m = uciOyna(c, r.enIyi)
          setDusunuyor(false)
          if (m) ekle({ san: m.san, uci: m.from + m.to + (m.promotion || ''), fen: c.fen() })
        }, bekle)
      })
      .catch(() => setDusunuyor(false))
    return () => {
      iptal = true
      motor.dur()
      setDusunuyor(false)
    }
  }, [oyunVar, oyunBitti, oyunRenk, oyunSeviye, sonFen, ch, ekle])

  useEffect(() => {
    let iptal = false
    acilisAdi([BASLANGIC, ...hamleler.slice(0, 24).map((h) => h.fen)]).then((a) => !iptal && setAcilis(a)).catch(() => {})
    return () => {
      iptal = true
    }
  }, [hamleler])

  const oyuncuHamle = (from: string, to: string, terfi?: string) => {
    if (!oyun || oyun.bitti || !canli) return
    const c = new Chess(sonFen)
    const m = uciOyna(c, from + to + (terfi || ''))
    if (m) ekle({ san: m.san, uci: m.from + m.to + (m.promotion || ''), fen: c.fen() })
  }

  const geriAl = () => {
    if (!oyun) return
    motor.dur()
    // sıra yeniden oyuncuya gelene dek geri al
    const siraKim = (l: H[]) => (l.length ? l[l.length - 1].fen : BASLANGIC).split(' ')[1]
    let h = oyun.hamleler
    do h = h.slice(0, -1)
    while (h.length && siraKim(h) !== oyun.renk)
    setOyun({ ...oyun, hamleler: h, bitti: null })
    setImlec(null)
    setIpucu(null)
  }

  const ipucuAl = async () => {
    if (!oyun || oyun.bitti) return
    const istekFen = sonFen
    const r = await motor.ara({ fen: istekFen, derinlik: 14 }).catch(() => null)
    const g = oyunRef.current
    // bu arada hamle yapıldıysa ya da oyun bittiyse sonucu at
    const guncelFen = g?.hamleler.length ? g.hamleler[g.hamleler.length - 1].fen : BASLANGIC
    if (!r || !g || g.bitti || guncelFen !== istekFen) return
    setIpucu({ from: r.enIyi.slice(0, 2), to: r.enIyi.slice(2, 4), renk: 'mavi' })
    setOyun((p) => (p ? { ...p, ipucuSayisi: p.ipucuSayisi + 1 } : p))
  }

  const analizeGit = () => {
    const pgn = numarali(
      hamleler.map((h) => h.san),
      BASLANGIC,
    )
    nav('/analiz?pgn=' + encodeURIComponent(pgn) + '&yon=' + (oyun?.renk ?? 'w'))
  }

  if (!oyun) {
    return (
      <div>
        <div className="ust-baslik">
          <div className="ust-kucuk">Oyna</div>
          <h1>Bilgisayara karşı oyna</h1>
          <p>Seviyeni seç, öğrendiklerini dene. Oyun bitince tek tıkla analize aktar ve hatalarını gör.</p>
        </div>
        <div className="kart" style={{ maxWidth: 560 }}>
          <h3>Rengin</h3>
          <div className="sekmeler" style={{ marginBottom: 18 }}>
            {(
              [
                ['w', 'Beyaz'],
                ['rastgele', 'Rastgele'],
                ['b', 'Siyah'],
              ] as const
            ).map(([k, ad]) => (
              <button key={k} className={kur.renk === k ? 'secili' : ''} onClick={() => setKur({ ...kur, renk: k })}>
                {ad}
              </button>
            ))}
          </div>
          <h3>Seviye</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {SEVIYE.map((s, i) => (
              <button key={i} className={'dugme' + (kur.seviye === i + 1 ? ' secili' : '')} style={{ flexDirection: 'column', gap: 0, padding: '10px 4px' }} onClick={() => setKur({ ...kur, seviye: i + 1 })}>
                <span style={{ fontSize: 18, fontFamily: 'var(--baslik)' }}>{i + 1}</span>
                <span style={{ fontSize: 11.5, fontWeight: 500 }}>{s.ad}</span>
              </button>
            ))}
          </div>
          <button
            className="dugme birincil"
            style={{ width: '100%', padding: 12 }}
            onClick={() => {
              const renk: Renk = kur.renk === 'rastgele' ? (Math.random() < 0.5 ? 'w' : 'b') : kur.renk
              motor.yeniOyun()
              setOyun({ renk, seviye: kur.seviye, hamleler: [], bitti: null, ipucuSayisi: 0 })
              setImlec(null)
            }}
          >
            <Simge ad="oynat" boy={18} /> Oyunu başlat
          </button>
        </div>
      </div>
    )
  }

  const son = gosterIm > 0 ? hamleler[gosterIm - 1] : null
  const seviye = SEVIYE[oyun.seviye - 1]
  const sira: Renk = ch.turn()

  return (
    <div>
      <div className="calisma">
        <div>
          <div className="oyuncu-serit">
            <span>
              <span className="renk-nokta" style={{ background: oyun.renk === 'w' ? '#222' : '#f2efe9' }} />
              Stockfish · {oyun.seviye}. seviye ({seviye.ad})
            </span>
            {dusunuyor && <span className="etiket">düşünüyor…</span>}
          </div>
          <div className="calisma-tahta">
            <div className="tahta-sarmal">
              <Tahta
                fen={fen}
                yon={oyun.renk}
                oynar={canli && !oyun.bitti ? oyun.renk : 'yok'}
                hamle={oyuncuHamle}
                sonHamle={son ? [son.uci.slice(0, 2), son.uci.slice(2, 4)] : null}
                oklar={ipucu && canli ? [ipucu] : []}
              />
            </div>
          </div>
          <div className="oyuncu-serit">
            <span>
              <span className="renk-nokta" style={{ background: oyun.renk === 'w' ? '#f2efe9' : '#222' }} />
              Sen
            </span>
            {!oyun.bitti && sira === oyun.renk && canli && <span className="etiket vurgu">sıra sende</span>}
          </div>
          <Gezinti imlec={gosterIm} son={hamleler.length} git={(i) => setImlec(i >= hamleler.length ? null : Math.max(0, i))} />
        </div>
        <div className="panel">
          {oyun.bitti && (
            <div className="kart yuksel" style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: 6 }}>{oyun.bitti}</h2>
              <p className="soluk" style={{ fontSize: 14 }}>
                {hamleler.length} yarım hamle{oyun.ipucuSayisi ? `, ${oyun.ipucuSayisi} ipucu` : ''}.
              </p>
              <div className="satir" style={{ justifyContent: 'center' }}>
                <button className="dugme birincil" onClick={analizeGit}>
                  <Simge ad="analiz" boy={16} /> Analiz et
                </button>
                <button className="dugme" onClick={() => setOyun(null)}>
                  Yeni oyun
                </button>
              </div>
            </div>
          )}
          {acilis && (
            <div className="satir" style={{ fontSize: 13.5 }}>
              <span className="etiket vurgu">{acilis.eco}</span>
              <span style={{ fontWeight: 600 }}>{trAd(acilis.ad)}</span>
            </div>
          )}
          <HamleListesi hamleler={hamleler} imlec={gosterIm} git={(i) => setImlec(i >= hamleler.length ? null : i)} bos="İlk hamle senin. İyi oyunlar." />
          {!oyun.bitti && (
            <div className="satir">
              <button className="dugme kucuk" onClick={ipucuAl} disabled={sira !== oyun.renk || dusunuyor}>
                <Simge ad="ampul" boy={16} /> İpucu
              </button>
              <button className="dugme kucuk" onClick={geriAl} disabled={hamleler.length === 0}>
                <Simge ad="geriAl" boy={16} /> Geri al
              </button>
              <button
                className="dugme kucuk"
                onClick={() => {
                  motor.dur()
                  sesler.bitti()
                  setOyun({ ...oyun, bitti: oyun.renk === 'w' ? 'Teslim oldun. Siyah kazandı.' : 'Teslim oldun. Beyaz kazandı.' })
                }}
              >
                <Simge ad="bayrak" boy={16} /> Teslim ol
              </button>
              <div className="bosluk" />
              <button
                className="dugme kucuk hayalet"
                onClick={() => {
                  motor.dur()
                  setOyun(null)
                }}
              >
                Bırak
              </button>
            </div>
          )}
          <div className="kart" style={{ padding: 14, fontSize: 13.5 }}>
            <strong>Unutma</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--soluk)' }}>
              <li>Her hamleden önce: rakip ne tehdit ediyor?</li>
              <li>Taşlarını geliştir, şahını rok ile güvene al.</li>
              <li>Karşılıksız taş bırakma, taş alıyorsan karşılığına bak.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
