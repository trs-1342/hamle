import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chess } from 'chess.js'
import Tahta from '../bilesen/Tahta'
import Simge from '../bilesen/Simge'
import { bulmacalar, type Bulmaca as B } from '../lib/veri'
import { chessYap, uciOyna, type Renk } from '../lib/satranc'
import { hamleSesi, sesler } from '../lib/ses'
import { useBulmacaKayit, BULMACA_VARSAYILAN } from '../lib/kayit'
import { TEMA, TEMA_GRUP } from '../icerik/temalar'

type Durum = 'hazir' | 'oynaniyor' | 'yanlis' | 'cozuldu' | 'gosterildi'

const ZORLUK = [
  { ad: 'Kolay', fark: -250 },
  { ad: 'Normal', fark: 0 },
  { ad: 'Zor', fark: 250 },
]

export default function Bulmaca() {
  const [params, setParams] = useSearchParams()
  const [liste, setListe] = useState<B[] | null>(null)
  const [hata, setHata] = useState(false)
  const [k, setK] = useBulmacaKayit()
  const kayit = { ...BULMACA_VARSAYILAN, ...k }
  const [tema, setTema] = useState<string | null>(params.get('tema'))
  const [zorluk, setZorluk] = useState(1)
  const [b, setB] = useState<B | null>(null)
  const [fen, setFen] = useState('')
  const [adim, setAdim] = useState(0)
  const [durum, setDurum] = useState<Durum>('hazir')
  const [sonHamle, setSonHamle] = useState<[string, string] | null>(null)
  const [isaret, setIsaret] = useState<Record<string, string>>({})
  const [ipucu, setIpucu] = useState(0)
  const [sonuc, setSonuc] = useState<{ ok: boolean; degisim: number } | null>(null)
  const [temaAcik, setTemaAcik] = useState(false)
  const [hataVar, setHataVar] = useState(false)
  const [ipucuKullanildi, setIpucuKullanildi] = useState(false)
  const zaman = useRef<number[]>([])

  const temizle = () => {
    zaman.current.forEach(clearTimeout)
    zaman.current = []
  }
  const sonra = (f: () => void, ms: number) => zaman.current.push(window.setTimeout(f, ms))
  useEffect(() => temizle, [])

  useEffect(() => {
    bulmacalar()
      .then(setListe)
      .catch(() => setHata(true))
  }, [])

  const baslat = useCallback((p: B) => {
    temizle()
    setB(p)
    setFen(p.fen)
    setAdim(0)
    setDurum('hazir')
    setSonHamle(null)
    setIsaret({})
    setIpucu(0)
    setSonuc(null)
    setHataVar(false)
    setIpucuKullanildi(false)
    sonra(() => {
      const c = new Chess(p.fen)
      const m = uciOyna(c, p.hamleler[0])
      if (!m) return
      hamleSesi(m.san)
      setFen(c.fen())
      setSonHamle([m.from, m.to])
      setAdim(1)
      setDurum('oynaniyor')
    }, 650)
  }, [])

  const sec = useCallback(
    (l: B[]) => {
      const goruldu = new Set(kayit.goruldu)
      const hedef = kayit.puan + ZORLUK[zorluk].fark
      let aday = l.filter((x) => !goruldu.has(x.id) && (!tema || x.temalar.includes(tema)))
      if (!aday.length) aday = l.filter((x) => !tema || x.temalar.includes(tema))
      for (const genis of [120, 250, 450, 800, 5000]) {
        const y = aday.filter((x) => Math.abs(x.puan - hedef) <= genis)
        if (y.length) {
          baslat(y[Math.floor(Math.random() * y.length)])
          return
        }
      }
    },
    [kayit.puan, kayit.goruldu, tema, zorluk, baslat],
  )

  // ilk bulmaca
  useEffect(() => {
    if (!liste || b) return
    const id = params.get('id')
    const p = id ? liste.find((x) => x.id === id) : null
    if (p) baslat(p)
    else sec(liste)
    if (id) setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liste])

  const oyuncu: Renk = useMemo(() => (b ? (b.fen.split(' ')[1] === 'w' ? 'b' : 'w') : 'w'), [b])

  const kaydet = (ok: boolean, puanli: boolean) => {
    if (!b) return
    const K = kayit.denenen < 20 ? 40 : 24
    const beklenen = 1 / (1 + Math.pow(10, (b.puan - kayit.puan) / 400))
    const degisim = puanli ? Math.round(K * ((ok ? 1 : 0) - beklenen)) : 0
    const seri = puanli ? (ok ? kayit.seri + 1 : 0) : kayit.seri
    setK({
      ...kayit,
      puan: Math.max(400, kayit.puan + degisim),
      cozulen: kayit.cozulen + (ok ? 1 : 0),
      denenen: kayit.denenen + 1,
      seri,
      enIyiSeri: Math.max(kayit.enIyiSeri, seri),
      gecmis: [{ id: b.id, ok, puan: degisim }, ...kayit.gecmis].slice(0, 30),
      goruldu: [...kayit.goruldu.slice(-3000), b.id],
    })
    setSonuc({ ok, degisim })
  }

  const hamle = (from: string, to: string, terfi?: string) => {
    if (!b || durum !== 'oynaniyor') return
    const c = new Chess(fen)
    const m = uciOyna(c, from + to + (terfi || ''))
    if (!m) return
    const beklenen = b.hamleler[adim]
    const dogru = m.from + m.to + (m.promotion || '') === beklenen || c.isCheckmate()
    setIsaret({})
    if (!dogru) {
      sesler.yanlis()
      setFen(c.fen())
      setSonHamle([m.from, m.to])
      setIsaret({ [m.to]: 'kotu' })
      setDurum('yanlis')
      setHataVar(true)
      if (!sonuc) kaydet(false, !ipucuKullanildi)
      const geriFen = fen
      sonra(() => {
        setFen(geriFen)
        setIsaret({})
        setSonHamle(null)
        setDurum('oynaniyor')
      }, 700)
      return
    }
    hamleSesi(m.san)
    setHataVar(false)
    setFen(c.fen())
    setSonHamle([m.from, m.to])
    setIsaret({ [m.to]: 'iyi' })
    const yeniAdim = adim + 1
    if (yeniAdim >= b.hamleler.length || c.isCheckmate()) {
      setAdim(yeniAdim)
      setDurum('cozuldu')
      sesler.dogru()
      if (!sonuc) kaydet(true, !ipucuKullanildi)
      return
    }
    setDurum('oynaniyor')
    setIpucu(0)
    setAdim(yeniAdim)
    sonra(() => {
      const c2 = new Chess(c.fen())
      const r = uciOyna(c2, b.hamleler[yeniAdim])
      if (!r) return
      hamleSesi(r.san)
      setFen(c2.fen())
      setSonHamle([r.from, r.to])
      setIsaret({})
      setAdim(yeniAdim + 1)
    }, 450)
  }

  const ipucuVer = () => {
    if (!b || durum === 'cozuldu' || durum === 'gosterildi') return
    const u = b.hamleler[adim]
    if (!u) return
    setIpucuKullanildi(true)
    if (ipucu === 0) {
      setIsaret({ [u.slice(0, 2)]: 'ipucu' })
      setIpucu(1)
    } else {
      setIsaret({ [u.slice(0, 2)]: 'ipucu', [u.slice(2, 4)]: 'ipucu' })
      setIpucu(2)
    }
  }

  const coz = () => {
    if (!b) return
    temizle()
    if (!sonuc) kaydet(false, true)
    setDurum('gosterildi')
    setIsaret({})
    // yanlış hamle tahtadayken bile doğru konumdan başla
    let c = chessYap(b.fen)!
    for (let k = 0; k < adim; k++) uciOyna(c, b.hamleler[k])
    setFen(c.fen())
    let i = adim
    // önce tahtayı bulmacanın şu anki doğru konumuna getir
    const adimla = () => {
      if (i >= b.hamleler.length) return
      const m = uciOyna(c, b.hamleler[i])
      if (!m) return
      hamleSesi(m.san)
      setFen(c.fen())
      setSonHamle([m.from, m.to])
      i++
      c = new Chess(c.fen())
      sonra(adimla, 650)
    }
    sonra(adimla, 200)
  }

  const analizUrl = b ? `/analiz?fen=${encodeURIComponent(b.fen)}&yon=${oyuncu}` : '/analiz'

  if (hata) return <div className="yukleniyor">Bulmacalar yüklenemedi. Bağlantını kontrol edip sayfayı yenile.</div>
  if (!liste || !b) return <div className="yukleniyor">Bulmacalar yükleniyor…</div>

  const siraMetni = oyuncu === 'w' ? 'Beyaz' : 'Siyah'
  const matTema = b.temalar.find((t) => t.startsWith('mateIn'))

  return (
    <div>
      <div className="calisma">
        <div>
          <div className="calisma-tahta">
            <div className="tahta-sarmal">
              <Tahta fen={fen} yon={oyuncu} oynar={durum === 'oynaniyor' ? oyuncu : 'yok'} hamle={hamle} sonHamle={sonHamle} isaret={isaret} />
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="kart" style={{ padding: 16 }}>
            <div className="satir" style={{ alignItems: 'baseline' }}>
              <div>
                <div className="soluk" style={{ fontSize: 12.5 }}>
                  Bulmaca puanın
                </div>
                <div style={{ fontFamily: 'var(--baslik)', fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
                  {kayit.puan}
                  {sonuc && sonuc.degisim !== 0 && (
                    <span style={{ fontSize: 16, marginLeft: 8, color: sonuc.degisim > 0 ? 'var(--iyi)' : 'var(--kotu)' }}>
                      {sonuc.degisim > 0 ? '+' : ''}
                      {sonuc.degisim}
                    </span>
                  )}
                </div>
              </div>
              <div className="bosluk" />
              <div style={{ textAlign: 'right', fontSize: 13 }}>
                <div>
                  <Simge ad="ates" boy={14} /> seri <strong>{kayit.seri}</strong>
                </div>
                <div className="soluk">
                  {kayit.cozulen}/{kayit.denenen} çözüldü
                </div>
              </div>
            </div>
            {kayit.gecmis.length > 0 && (
              <div className="satir" style={{ gap: 4, marginTop: 10 }}>
                {kayit.gecmis.slice(0, 20).map((g, i) => (
                  <span key={i} title={g.ok ? 'Çözüldü' : 'Kaçırıldı'} style={{ width: 12, height: 12, borderRadius: 3, background: g.ok ? 'var(--iyi)' : 'var(--kotu)', opacity: 1 - i * 0.035 }} />
                ))}
              </div>
            )}
          </div>

          <div className={'bildirim ' + (durum === 'cozuldu' ? 'iyi' : durum === 'yanlis' || hataVar ? 'kotu' : durum === 'gosterildi' ? 'vurgu' : '')} style={{ alignItems: 'center' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                flex: 'none',
                background: oyuncu === 'w' ? '#f2efe9' : '#222',
                border: '1px solid var(--cizgi2)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <img src={`/piece/${oyuncu}K.svg`} width={26} alt="" />
            </div>
            <div style={{ flex: 1 }}>
              {durum === 'hazir' && <strong>Rakip oynuyor…</strong>}
              {durum === 'oynaniyor' && (
                <>
                  <strong>{hataVar ? 'Bu değil. Tekrar dene.' : adim <= 1 ? `${siraMetni} oynar. En iyi hamleyi bul.` : 'Doğru! Devam et.'}</strong>
                  <div className="soluk" style={{ fontSize: 13 }}>
                    {matTema ? (TEMA[matTema]?.ad ?? matTema.replace('mateIn', '') + ' hamlede mat') + ' var.' : 'Kazandıran hamleyi ara: şah, alma, tehdit.'}
                  </div>
                </>
              )}
              {durum === 'yanlis' && (
                <>
                  <strong>Bu değil.</strong>
                  <div style={{ fontSize: 13 }}>Tekrar dene ya da çözümü gör.</div>
                </>
              )}
              {durum === 'cozuldu' && (
                <>
                  <strong>{sonuc?.ok ? 'Çözdün!' : 'Sonunda buldun.'}</strong>
                  <div style={{ fontSize: 13 }}>{sonuc?.ok && sonuc.degisim === 0 ? 'İpucu kullandığın için puan değişmedi.' : 'Sıradakine geç.'}</div>
                </>
              )}
              {durum === 'gosterildi' && <strong>Çözüm gösteriliyor.</strong>}
            </div>
          </div>

          <div className="satir">
            {durum === 'cozuldu' || durum === 'gosterildi' ? (
              <button className="dugme birincil" onClick={() => sec(liste)} style={{ flex: 1 }}>
                Sonraki bulmaca <Simge ad="ileri" boy={16} />
              </button>
            ) : (
              <>
                <button className="dugme" onClick={ipucuVer} disabled={durum === 'hazir'}>
                  <Simge ad="ampul" boy={16} /> İpucu
                </button>
                <button className="dugme" onClick={coz} disabled={durum === 'hazir'}>
                  <Simge ad="goz" boy={16} /> Çözümü göster
                </button>
                <button className="dugme hayalet" onClick={() => sec(liste)}>
                  Atla
                </button>
              </>
            )}
          </div>

          {(durum === 'cozuldu' || durum === 'gosterildi') && (
            <div className="kart yuksel" style={{ padding: 14, fontSize: 13.5 }}>
              <div className="satir" style={{ marginBottom: 8 }}>
                <span className="soluk">Bulmaca puanı</span>
                <strong className="mono">{b.puan}</strong>
                <div className="bosluk" />
                <Link to={analizUrl} className="dugme kucuk">
                  <Simge ad="analiz" boy={15} /> Analiz et
                </Link>
              </div>
              <div className="satir" style={{ gap: 6 }}>
                {b.temalar
                  .filter((t) => TEMA[t] && !['short', 'long', 'veryLong', 'oneMove', 'crushing', 'advantage', 'master', 'masterVsMaster', 'mate'].includes(t))
                  .map((t) => (
                    <span key={t} className="etiket" title={TEMA[t].aciklama}>
                      {TEMA[t].ad}
                    </span>
                  ))}
              </div>
              <div className="soluk" style={{ fontSize: 12, marginTop: 8 }}>
                Kaynak: lichess.org bulmaca veritabanı, #{b.id}
              </div>
            </div>
          )}

          <div className="kart" style={{ padding: 14 }}>
            <div className="satir" style={{ marginBottom: 10 }}>
              <strong>Ayar</strong>
              <div className="bosluk" />
              <div className="sekmeler">
                {ZORLUK.map((z, i) => (
                  <button key={z.ad} className={zorluk === i ? 'secili' : ''} onClick={() => setZorluk(i)}>
                    {z.ad}
                  </button>
                ))}
              </div>
            </div>
            <button className="dugme kucuk" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => setTemaAcik(!temaAcik)}>
              <span>Tema: {tema ? TEMA[tema]?.ad : 'Karışık'}</span>
              <Simge ad={temaAcik ? 'geri' : 'ileri'} boy={15} />
            </button>
            {temaAcik && (
              <div className="yuksel" style={{ marginTop: 10 }}>
                <button
                  className={'etiket' + (!tema ? ' vurgu' : '')}
                  style={{ cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => {
                    setTema(null)
                    setTemaAcik(false)
                  }}
                >
                  Karışık
                </button>
                {TEMA_GRUP.map((g) => (
                  <div key={g.ad} style={{ marginBottom: 8 }}>
                    <div className="soluk" style={{ fontSize: 12, marginBottom: 4 }}>
                      {g.ad}
                    </div>
                    <div className="satir" style={{ gap: 5 }}>
                      {g.temalar.map((t) => (
                        <button
                          key={t}
                          title={TEMA[t].aciklama}
                          className={'etiket' + (tema === t ? ' vurgu' : '')}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setTema(t)
                            setTemaAcik(false)
                          }}
                        >
                          {TEMA[t].ad}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(tema || zorluk !== 1) && (
              <button className="dugme kucuk hayalet" style={{ marginTop: 8 }} onClick={() => sec(liste)}>
                Bu ayarla yeni bulmaca
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
