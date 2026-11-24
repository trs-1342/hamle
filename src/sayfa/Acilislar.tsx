import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chess } from 'chess.js'
import Tahta from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { ONE_CIKAN } from '../icerik/acilislar'
import { acilislar, agac, altHatSayisi, ilkAd, trAd, type Acilis, type Dugum } from '../lib/veri'
import { anahtar, chessYap, numarali, sanFenler, sanOyna, trSan } from '../lib/satranc'
import { hamleSesi } from '../lib/ses'
import { useAyarlar, useIlerleme, ILERLEME_VARSAYILAN } from '../lib/kayit'

type Sekme = 'one' | 'kasif' | 'tum'

export default function Acilislar() {
  const [params, setParams] = useSearchParams()
  const sekme = (params.get('sekme') as Sekme) || 'one'
  const sec = (s: Sekme) => setParams(s === 'one' ? {} : { sekme: s }, { replace: true })
  return (
    <div>
      <div className="ust-baslik">
        <div className="ust-kucuk">Açılışlar</div>
        <h1>Açılış kitaplığı</h1>
        <p>Öne çıkan açılışların fikirlerini öğren, hatları çalış, kâşifle 3.800'den fazla adlı varyantı gez.</p>
      </div>
      <div className="sekmeler" style={{ marginBottom: 22 }}>
        <button className={sekme === 'one' ? 'secili' : ''} onClick={() => sec('one')}>
          Öne çıkanlar
        </button>
        <button className={sekme === 'kasif' ? 'secili' : ''} onClick={() => sec('kasif')}>
          Kâşif
        </button>
        <button className={sekme === 'tum' ? 'secili' : ''} onClick={() => sec('tum')}>
          Tüm açılışlar
        </button>
      </div>
      {sekme === 'one' && <OneCikanlar />}
      {sekme === 'kasif' && <Kasif ilkHat={params.get('hat') || ''} />}
      {sekme === 'tum' && <TumAcilislar />}
    </div>
  )
}

function OneCikanlar() {
  const [ilerleme] = useIlerleme()
  const cal = { ...ILERLEME_VARSAYILAN, ...ilerleme }.acilislar
  const [renk, setRenk] = useState<'hepsi' | 'w' | 'b'>('hepsi')
  const liste = ONE_CIKAN.filter((a) => renk === 'hepsi' || a.renk === renk)
  const sonFen = (hat: string) => {
    const f = sanFenler(hat.split(' '))
    return f[Math.min(f.length - 1, 8)]
  }
  return (
    <div>
      <div className="sekmeler" style={{ marginBottom: 16 }}>
        <button className={renk === 'hepsi' ? 'secili' : ''} onClick={() => setRenk('hepsi')}>
          Hepsi
        </button>
        <button className={renk === 'w' ? 'secili' : ''} onClick={() => setRenk('w')}>
          Beyazla
        </button>
        <button className={renk === 'b' ? 'secili' : ''} onClick={() => setRenk('b')}>
          Siyahla
        </button>
      </div>
      <div className="izgara" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
        {liste.map((a) => (
          <Link key={a.id} to={'/acilislar/' + a.id} className="kart kart-link" style={{ padding: 12 }}>
            <Tahta fen={sonFen(a.hat)} kucuk yon={a.renk} />
            <div style={{ padding: '12px 4px 2px' }}>
              <div className="satir" style={{ gap: 6, marginBottom: 6 }}>
                <span className="etiket">{a.renk === 'w' ? 'Beyaz' : 'Siyah'}</span>
                <span className="etiket">{a.seviye}</span>
                {cal[a.id] ? <span className="etiket iyi">{cal[a.id]}× çalışıldı</span> : null}
              </div>
              <strong style={{ fontSize: 16, fontFamily: 'var(--baslik)' }}>{a.ad}</strong>
              <div className="soluk" style={{ fontSize: 13, lineHeight: 1.45, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {a.ozet}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Kasif({ ilkHat }: { ilkHat: string }) {
  const [ayar] = useAyarlar()
  const [veri, setVeri] = useState<{ dugum: Dugum[]; harita: Map<string, number>; ac: Acilis[] } | null>(null)
  const [sanlar, setSanlar] = useState<string[]>(() => ilkHat.split(' ').filter(Boolean))
  const [yon, setYon] = useState<'w' | 'b'>('w')
  useEffect(() => {
    Promise.all([agac(), acilislar()]).then(([a, ac]) => setVeri({ ...a, ac }))
  }, [])
  const fenler = useMemo(() => sanFenler(sanlar), [sanlar])
  const fen = fenler[fenler.length - 1]
  const dugumId = veri?.harita.get(anahtar(fen))
  const dugum = dugumId != null ? veri!.dugum[dugumId] : null
  const ad = useMemo(() => {
    if (!veri) return null
    for (let i = fenler.length - 1; i >= 0; i--) {
      const id = veri.harita.get(anahtar(fenler[i]))
      if (id != null && veri.dugum[id].ad >= 0) return veri.ac[veri.dugum[id].ad]
    }
    return null
  }, [veri, fenler])
  const cocuklar = useMemo(() => {
    if (!veri || !dugum) return []
    return dugum.cocuk
      .map((c) => ({ ...c, ad: ilkAd(veri.dugum, c.id), sayi: altHatSayisi(veri.dugum, c.id) }))
      .sort((a, b) => b.sayi - a.sayi)
  }, [veri, dugum])

  const hamle = (from: string, to: string, terfi?: string) => {
    const c = new Chess(fen)
    try {
      const m = c.move({ from, to, promotion: terfi })
      hamleSesi(m.san)
      setSanlar([...sanlar, m.san])
    } catch {
      /* yasal değil */
    }
  }
  const son = sanlar.length ? (() => {
    const c = chessYap(fenler[fenler.length - 2])!
    const m = sanOyna(c, sanlar[sanlar.length - 1])
    return m ? ([m.from, m.to] as [string, string]) : null
  })() : null
  const oklar = cocuklar.slice(0, 4).map((c, i) => ({ from: c.uci.slice(0, 2), to: c.uci.slice(2, 4), renk: (i === 0 ? 'yesil' : 'gri') as 'yesil' | 'gri', kalin: i === 0 ? 0.15 : 0.1 }))

  return (
    <div className="calisma">
      <div>
        <div className="calisma-tahta">
          <div className="tahta-sarmal">
            <Tahta fen={fen} yon={yon} oynar="ikisi" hamle={hamle} sonHamle={son} oklar={oklar} />
          </div>
        </div>
        <div className="tahta-alt">
          <button className="dugme simgeli" onClick={() => setSanlar([])} disabled={!sanlar.length} aria-label="Başa">
            <Simge ad="bas" />
          </button>
          <button className="dugme simgeli" onClick={() => setSanlar(sanlar.slice(0, -1))} disabled={!sanlar.length} aria-label="Geri al">
            <Simge ad="geri" />
          </button>
          <button className="dugme simgeli" onClick={() => setYon(yon === 'w' ? 'b' : 'w')} aria-label="Çevir">
            <Simge ad="cevir" />
          </button>
          <Link className="dugme" to={'/analiz?pgn=' + encodeURIComponent(numarali(sanlar, fenler[0]))}>
            <Simge ad="analiz" boy={16} /> Analizde aç
          </Link>
        </div>
      </div>
      <div className="panel">
        <div className="kart" style={{ padding: 16 }}>
          {ad ? (
            <>
              <div className="satir" style={{ gap: 6, marginBottom: 4 }}>
                <span className="etiket vurgu">{ad.eco}</span>
                {!dugum && <span className="etiket kotu">kitap dışı</span>}
              </div>
              <h3 style={{ margin: 0 }}>{trAd(ad.ad)}</h3>
              {trAd(ad.ad) !== ad.ad && (
                <div className="soluk" style={{ fontSize: 12.5 }}>
                  {ad.ad}
                </div>
              )}
            </>
          ) : (
            <h3 style={{ margin: 0 }}>{sanlar.length ? 'Kitap dışı' : 'Başlangıç konumu'}</h3>
          )}
          <div className="mono soluk" style={{ fontSize: 13, marginTop: 8 }}>
            {sanlar.length ? numarali(sanlar, fenler[0], (s) => trSan(s, ayar.trNotasyon)) : 'Tahtada bir hamle yap ya da aşağıdan seç.'}
          </div>
        </div>
        <div className="kart" style={{ padding: 8 }}>
          <div className="soluk" style={{ fontSize: 12.5, padding: '6px 10px' }}>
            {dugum ? `${cocuklar.length} kitap devamı` : 'Bu konumdan sonra kayıtlı adlı açılış yok.'}
          </div>
          {!veri && <div className="soluk" style={{ padding: 10 }}>Yükleniyor…</div>}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {cocuklar.map((c) => (
              <button
                key={c.uci}
                onClick={() => {
                  hamleSesi(c.san)
                  setSanlar([...sanlar, c.san])
                }}
                className="motor-satir"
                style={{ width: '100%', border: 0, background: 'none', textAlign: 'left' }}
              >
                <span className="mono" style={{ fontWeight: 700, minWidth: 52 }}>
                  {trSan(c.san, ayar.trNotasyon)}
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5 }}>{c.ad >= 0 ? trAd(veri!.ac[c.ad].ad) : '—'}</span>
                <span className="etiket" style={{ fontSize: 11 }}>
                  {c.sayi}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TumAcilislar() {
  const [liste, setListe] = useState<Acilis[] | null>(null)
  const [ara, setAra] = useState('')
  const [harf, setHarf] = useState('')
  const [sinir, setSinir] = useState(60)
  useEffect(() => {
    acilislar().then(setListe)
  }, [])
  const katla = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i')
  const sonuc = useMemo(() => {
    if (!liste) return []
    const k = katla(ara.trim())
    return liste.filter((a) => (!harf || a.eco[0] === harf) && (!k || katla(a.ad + ' ' + trAd(a.ad) + ' ' + a.eco + ' ' + a.pgn).includes(k)))
  }, [liste, ara, harf])
  useEffect(() => setSinir(60), [ara, harf])
  if (!liste) return <div className="yukleniyor">Yükleniyor…</div>
  return (
    <div>
      <div className="satir" style={{ marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <input className="giris" placeholder="Ara: Sicilya, Najdorf, C50, Nf3…" value={ara} onChange={(e) => setAra(e.target.value)} style={{ paddingLeft: 36 }} />
          <span style={{ position: 'absolute', left: 11, top: 10, color: 'var(--soluk2)' }}>
            <Simge ad="ara" boy={18} />
          </span>
        </div>
        <div className="sekmeler">
          {['', 'A', 'B', 'C', 'D', 'E'].map((h) => (
            <button key={h} className={harf === h ? 'secili' : ''} onClick={() => setHarf(h)}>
              {h || 'Hepsi'}
            </button>
          ))}
        </div>
      </div>
      <div className="soluk" style={{ fontSize: 13, marginBottom: 8 }}>
        {sonuc.length} açılış
      </div>
      <div className="kart" style={{ padding: 6 }}>
        {sonuc.slice(0, sinir).map((a) => (
          <Link key={a.i} to={'/acilislar/db-' + a.i} className="motor-satir" style={{ alignItems: 'center' }}>
            <span className="etiket vurgu mono" style={{ minWidth: 46, justifyContent: 'center' }}>
              {a.eco}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{trAd(a.ad)}</div>
              <div className="mono soluk" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.pgn}
              </div>
            </span>
          </Link>
        ))}
        {sonuc.length === 0 && <div className="soluk" style={{ padding: 14 }}>Sonuç yok.</div>}
      </div>
      {sonuc.length > sinir && (
        <button className="dugme" style={{ marginTop: 12 }} onClick={() => setSinir(sinir + 120)}>
          Daha fazla göster
        </button>
      )}
    </div>
  )
}
