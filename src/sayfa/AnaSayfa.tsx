import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Tahta from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { DERSLER } from '../icerik/dersler'
import { ONE_CIKAN } from '../icerik/acilislar'
import { bulmacalar, gununBulmacasi, type Bulmaca } from '../lib/veri'
import { useBulmacaKayit, useIlerleme, BULMACA_VARSAYILAN, ILERLEME_VARSAYILAN, oku } from '../lib/kayit'
import { chessYap, uciOyna } from '../lib/satranc'

const VITRIN = [
  { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3', oklar: [{ from: 'c4', to: 'f7', renk: 'kirmizi' as const }], yazi: 'İtalyan Oyunu: fil f7\'ye bakıyor' },
  { fen: '2q3k1/5ppp/8/3N4/8/8/5PPP/6K1 w - - 0 1', oklar: [{ from: 'd5', to: 'e7', renk: 'yesil' as const }, { from: 'e7', to: 'g8', renk: 'kirmizi' as const }, { from: 'e7', to: 'c8', renk: 'kirmizi' as const }], yazi: 'Çatal: at hem şahı hem veziri hedefliyor' },
  { fen: 'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', oklar: [{ from: 'a7', to: 'a6', renk: 'yesil' as const }], yazi: 'Sicilya Najdorf: ...a6' },
  { fen: '8/4k3/8/3K4/4P3/8/8/8 b - - 0 1', oklar: [{ from: 'e7', to: 'd7', renk: 'yesil' as const }], yazi: 'Karşı karşıya gelme ile beraberlik' },
]

export default function AnaSayfa() {
  const [bk] = useBulmacaKayit()
  const b = { ...BULMACA_VARSAYILAN, ...bk }
  const [il] = useIlerleme()
  const ilerleme = { ...ILERLEME_VARSAYILAN, ...il }
  const [gunun, setGunun] = useState<Bulmaca | null>(null)
  const [vitrin, setVitrin] = useState(0)
  const dersSayi = DERSLER.filter((d) => ilerleme.dersler[d.id]).length
  const acilisSayi = Object.keys(ilerleme.acilislar).length
  const siradakiDers = DERSLER.find((d) => !ilerleme.dersler[d.id])
  const oyunVar = !!oku<{ bitti: string | null } | null>('oyun', null)

  useEffect(() => {
    bulmacalar()
      .then((l) => setGunun(gununBulmacasi(l)))
      .catch(() => {})
  }, [])
  useEffect(() => {
    const t = setInterval(() => setVitrin((v) => (v + 1) % VITRIN.length), 4500)
    return () => clearInterval(t)
  }, [])

  // günün bulmacası: rakibin ilk hamlesi oynanmış hâli
  const gununFen = (() => {
    if (!gunun) return null
    const c = chessYap(gunun.fen)
    if (!c) return null
    uciOyna(c, gunun.hamleler[0])
    return c.fen()
  })()

  const v = VITRIN[vitrin]
  const yeni = dersSayi === 0 && b.denenen === 0

  return (
    <div>
      <section className="kahraman">
        <div className="kahraman-metin">
          <div className="ust-kucuk">Hamle</div>
          <h1 className="kahraman-baslik">
            Satrancı ezberleyerek değil, <span>anlayarak</span> öğren.
          </h1>
          <p className="soluk" style={{ fontSize: 17, maxWidth: 520 }}>
            Temel prensipler, açılış fikirleri, binlerce bulmaca ve Stockfish analizi. Ücretsiz, reklamsız, telefonda da çalışır.
          </p>
          <div className="satir" style={{ marginTop: 22, gap: 10 }}>
            {yeni ? (
              <Link to="/dersler/taslar" className="dugme birincil" style={{ padding: '12px 20px' }}>
                İlk derse başla <Simge ad="ileri" boy={17} />
              </Link>
            ) : (
              <Link to={siradakiDers ? '/dersler/' + siradakiDers.id : '/bulmaca'} className="dugme birincil" style={{ padding: '12px 20px' }}>
                {siradakiDers ? 'Kaldığın yerden devam et' : 'Bulmaca çöz'} <Simge ad="ileri" boy={17} />
              </Link>
            )}
            <Link to="/bulmaca" className="dugme" style={{ padding: '12px 20px' }}>
              <Simge ad="bulmaca" boy={17} /> Bulmaca çöz
            </Link>
          </div>
        </div>
        <div className="kahraman-tahta">
          <Tahta fen={v.fen} oklar={v.oklar} yon={v.fen.split(' ')[1] === 'b' && vitrin === 3 ? 'b' : 'w'} koordinat={false} />
          <div className="soluk" style={{ fontSize: 13, textAlign: 'center', marginTop: 10 }}>
            {v.yazi}
          </div>
        </div>
      </section>

      <section className="istatistik">
        <Link to="/bulmaca" className="kart kart-link">
          <div className="soluk">Bulmaca puanı</div>
          <div className="sayi">{b.puan}</div>
          <div className="soluk kucuk-yazi">
            {b.cozulen} çözüldü · en iyi seri {b.enIyiSeri}
          </div>
        </Link>
        <Link to="/dersler" className="kart kart-link">
          <div className="soluk">Dersler</div>
          <div className="sayi">
            {dersSayi}
            <small>/{DERSLER.length}</small>
          </div>
          <div className="ilerleme-cubuk" style={{ marginTop: 8 }}>
            <div style={{ width: `${(dersSayi / DERSLER.length) * 100}%` }} />
          </div>
        </Link>
        <Link to="/acilislar" className="kart kart-link">
          <div className="soluk">Çalışılan açılış</div>
          <div className="sayi">{acilisSayi}</div>
          <div className="soluk kucuk-yazi">{ONE_CIKAN.length} öne çıkan, 3.800+ varyant</div>
        </Link>
        <Link to="/oyna" className="kart kart-link">
          <div className="soluk">Bilgisayara karşı</div>
          <div className="sayi" style={{ fontSize: 22, marginTop: 6 }}>
            {oyunVar ? 'Oyuna dön' : '8 seviye'}
          </div>
          <div className="soluk kucuk-yazi">çaylaktan tam güce</div>
        </Link>
      </section>

      <section className="ana-izgara">
        {gunun && gununFen && (
          <Link to={'/bulmaca?id=' + gunun.id} className="kart kart-link gunun">
            <div className="satir" style={{ marginBottom: 12 }}>
              <Simge ad="yildiz" />
              <strong>Günün bulmacası</strong>
              <div className="bosluk" />
              <span className="etiket mono">{gunun.puan}</span>
            </div>
            <Tahta fen={gununFen} kucuk yon={gununFen.split(' ')[1] as 'w' | 'b'} />
            <div className="soluk" style={{ fontSize: 13.5, marginTop: 10 }}>
              {gununFen.split(' ')[1] === 'w' ? 'Beyaz' : 'Siyah'} oynar ve kazanır.
            </div>
          </Link>
        )}
        <div className="yol">
          <h2>Nereden başlamalı?</h2>
          {[
            { no: 1, yol: '/dersler', ad: 'Temel prensipler', alt: 'Taşların değeri, merkez, gelişim, şah güvenliği ve temel taktikler.', simge: 'ders' },
            { no: 2, yol: '/acilislar', ad: 'Bir açılış seç', alt: 'Beyazla bir, siyahla iki açılış yeter. Fikirlerini öğren, hattı çalış.', simge: 'acilis' },
            { no: 3, yol: '/bulmaca', ad: 'Her gün bulmaca', alt: 'Taktik görüş tekrarla gelişir. Puanına göre zorlaşan bulmacalar.', simge: 'bulmaca' },
            { no: 4, yol: '/oyna', ad: 'Oyna ve analiz et', alt: 'Oyun bitince rapor al: hangi hamle hata, en iyisi neydi?', simge: 'analiz' },
          ].map((a) => (
            <Link key={a.no} to={a.yol} className="yol-adim">
              <span className="yol-no">{a.no}</span>
              <span style={{ flex: 1 }}>
                <strong>{a.ad}</strong>
                <span className="soluk" style={{ display: 'block', fontSize: 13.5 }}>
                  {a.alt}
                </span>
              </span>
              <Simge ad="ileri" boy={18} sinif="soluk" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
