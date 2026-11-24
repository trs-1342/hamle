import { Link } from 'react-router-dom'
import Tahta from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { BOLUMLER, DERSLER } from '../icerik/dersler'
import { useIlerleme, ILERLEME_VARSAYILAN } from '../lib/kayit'

export default function Dersler() {
  const [ilerleme] = useIlerleme()
  const biten = { ...ILERLEME_VARSAYILAN, ...ilerleme }.dersler
  const sayi = DERSLER.filter((d) => biten[d.id]).length
  const siradaki = DERSLER.find((d) => !biten[d.id])
  return (
    <div>
      <div className="ust-baslik">
        <div className="ust-kucuk">Dersler</div>
        <h1>Temel prensipler</h1>
        <p>Kısa, etkileşimli dersler. Her ders bir fikri anlatır, sonra tahtada sen denersin.</p>
      </div>
      <div className="kart satir" style={{ marginBottom: 26, gap: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="satir" style={{ marginBottom: 8 }}>
            <strong>
              {sayi}/{DERSLER.length} ders tamamlandı
            </strong>
          </div>
          <div className="ilerleme-cubuk">
            <div style={{ width: `${(sayi / DERSLER.length) * 100}%` }} />
          </div>
        </div>
        {siradaki && (
          <Link to={'/dersler/' + siradaki.id} className="dugme birincil">
            {sayi ? 'Devam et' : 'Başla'}: {siradaki.baslik} <Simge ad="ileri" boy={16} />
          </Link>
        )}
      </div>
      {BOLUMLER.map((b) => (
        <section key={b} style={{ marginBottom: 30 }}>
          <h2>{b}</h2>
          <div className="izgara">
            {DERSLER.filter((d) => d.bolum === b).map((d) => {
              const a = d.adimlar.find((x) => x.gorev) ?? d.adimlar[0]
              return (
                <Link key={d.id} to={'/dersler/' + d.id} className="kart kart-link" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14 }}>
                  <div style={{ width: 84, flex: 'none' }}>
                    <Tahta fen={a.fen} kucuk yon={a.fen.split(' ')[1] === 'b' ? 'b' : 'w'} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="satir" style={{ gap: 6, marginBottom: 2 }}>
                      <strong style={{ fontSize: 15.5 }}>{d.baslik}</strong>
                      {biten[d.id] && (
                        <span className="etiket iyi" style={{ padding: '1px 6px' }}>
                          <Simge ad="tamam" boy={12} />
                        </span>
                      )}
                    </div>
                    <div className="soluk" style={{ fontSize: 13.5, lineHeight: 1.4 }}>
                      {d.ozet}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
