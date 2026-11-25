import { useState } from 'react'
import { useAyarlar, useKayit, hepsiniSil, tasYolu, TAS_TAKIMLARI, type Ayarlar } from '../lib/kayit'
import Simge from './Simge'

export function Modal({ kapat, children, baslik }: { kapat: () => void; children: React.ReactNode; baslik: string }) {
  return (
    <div className="modal-arka" onPointerDown={(e) => e.target === e.currentTarget && kapat()}>
      <div className="modal" role="dialog" aria-label={baslik}>
        <div className="satir" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>{baslik}</h2>
          <div className="bosluk" />
          <button className="dugme hayalet simgeli" onClick={kapat} aria-label="Kapat">
            <Simge ad="kapat" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Anahtar({ acik, degis }: { acik: boolean; degis: (v: boolean) => void }) {
  return <button className={'anahtar' + (acik ? ' acik' : '')} onClick={() => degis(!acik)} role="switch" aria-checked={acik} />
}

const TAHTALAR: { k: Ayarlar['tahta']; ad: string }[] = [
  { k: 'ceviz', ad: 'Ceviz' },
  { k: 'cimen', ad: 'Çimen' },
  { k: 'deniz', ad: 'Deniz' },
  { k: 'gri', ad: 'Gri' },
]

export default function AyarlarModal({ kapat }: { kapat: () => void }) {
  const [a, setA] = useAyarlar()
  const [tema, setTema] = useKayit<'sistem' | 'acik' | 'koyu'>('tema', 'sistem')
  const [sifirOnay, setSifirOnay] = useState(false)
  const degis = <K extends keyof Ayarlar>(k: K, v: Ayarlar[K]) => setA({ ...a, [k]: v })
  const temaYap = (t: 'sistem' | 'acik' | 'koyu') => {
    setTema(t)
    if (t === 'sistem') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = t
  }
  const satir = (ad: string, alt: string, el: React.ReactNode) => (
    <div className="satir" style={{ padding: '10px 0', borderBottom: '1px solid var(--cizgi)', flexWrap: 'nowrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{ad}</div>
        <div className="soluk" style={{ fontSize: 13 }}>
          {alt}
        </div>
      </div>
      {el}
    </div>
  )
  return (
    <Modal kapat={kapat} baslik="Ayarlar">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Tahta</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {TAHTALAR.map((t) => (
          <button
            key={t.k}
            onClick={() => degis('tahta', t.k)}
            style={{ border: `2px solid ${a.tahta === t.k ? 'var(--vurgu)' : 'transparent'}`, borderRadius: 10, padding: 2, background: 'none', cursor: 'pointer' }}
          >
            <div className={`tahta tema-${t.k} kucuk`} style={{ boxShadow: 'none', borderRadius: 7 }}>
              <div className="kareler">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className={'kare ' + ((Math.floor(i / 4) + i) % 2 === 0 ? 'acik' : 'koyu')} style={{ gridColumn: 'span 2', gridRow: 'span 2' }} />
                ))}
              </div>
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{t.ad}</div>
          </button>
        ))}
      </div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Taşlar</div>
      <div className="takim-sec">
        {TAS_TAKIMLARI.map((t) => (
          <button key={t.k} className={a.taslar === t.k ? 'secili' : ''} onClick={() => degis('taslar', t.k)}>
            <div>
              <img src={tasYolu('wN', t.k)} alt="" />
              <img src={tasYolu('bQ', t.k)} alt="" />
            </div>
            {t.ad}
          </button>
        ))}
      </div>
      {satir(
        'Taş boyutu',
        'Küçük ekranlarda büyük taşlar daha rahat',
        <div className="sekmeler">
          {(
            [
              ['normal', 'Normal'],
              ['buyuk', 'Büyük'],
              ['cokbuyuk', 'Çok büyük'],
            ] as const
          ).map(([k, ad]) => (
            <button key={k} className={a.tasBoyut === k ? 'secili' : ''} onClick={() => degis('tasBoyut', k)}>
              {ad}
            </button>
          ))}
        </div>,
      )}
      {satir(
        'Görünüm',
        'Açık, koyu ya da cihazınla aynı',
        <div className="sekmeler">
          {(['sistem', 'acik', 'koyu'] as const).map((t) => (
            <button key={t} className={tema === t ? 'secili' : ''} onClick={() => temaYap(t)}>
              {t === 'sistem' ? 'Sistem' : t === 'acik' ? 'Açık' : 'Koyu'}
            </button>
          ))}
        </div>,
      )}
      {satir('Koordinatlar', 'Tahta kenarında a-h ve 1-8', <Anahtar acik={a.koordinat} degis={(v) => degis('koordinat', v)} />)}
      {satir('Yasal hamleleri göster', 'Taş seçince gidebileceği kareler', <Anahtar acik={a.yasalGoster} degis={(v) => degis('yasalGoster', v)} />)}
      {satir('Ses', 'Hamle ve doğru/yanlış sesleri', <Anahtar acik={a.ses} degis={(v) => degis('ses', v)} />)}
      {satir('Türkçe notasyon', 'At=A, Fil=F, Kale=K, Vezir=V, Şah=Ş', <Anahtar acik={a.trNotasyon} degis={(v) => degis('trNotasyon', v)} />)}
      <div style={{ marginTop: 18 }}>
        {!sifirOnay ? (
          <button className="dugme kucuk" onClick={() => setSifirOnay(true)}>
            İlerlemeyi sıfırla
          </button>
        ) : (
          <div className="bildirim kotu">
            <div style={{ flex: 1 }}>Dersler, açılış çalışmaları, bulmaca puanı ve kayıtlı oyun silinecek. Emin misin?</div>
            <button
              className="dugme kucuk"
              onClick={() => {
                hepsiniSil()
                setSifirOnay(false)
              }}
            >
              Sil
            </button>
            <button className="dugme kucuk hayalet" onClick={() => setSifirOnay(false)}>
              Vazgeç
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
