import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import Simge from './bilesen/Simge'
import AyarlarModal from './bilesen/AyarlarModal'
import AnaSayfa from './sayfa/AnaSayfa'

const Dersler = lazy(() => import('./sayfa/Dersler'))
const Ders = lazy(() => import('./sayfa/Ders'))
const Acilislar = lazy(() => import('./sayfa/Acilislar'))
const AcilisDetay = lazy(() => import('./sayfa/AcilisDetay'))
const Bulmaca = lazy(() => import('./sayfa/Bulmaca'))
const Analiz = lazy(() => import('./sayfa/Analiz'))
const Oyna = lazy(() => import('./sayfa/Oyna'))
const Hakkinda = lazy(() => import('./sayfa/Hakkinda'))

const MENU = [
  { yol: '/', ad: 'Ana sayfa', kisa: 'Ana', simge: 'ev' },
  { yol: '/dersler', ad: 'Dersler', kisa: 'Dersler', simge: 'ders' },
  { yol: '/acilislar', ad: 'Açılışlar', kisa: 'Açılış', simge: 'acilis' },
  { yol: '/bulmaca', ad: 'Bulmacalar', kisa: 'Bulmaca', simge: 'bulmaca' },
  { yol: '/analiz', ad: 'Analiz', kisa: 'Analiz', simge: 'analiz' },
  { yol: '/oyna', ad: 'Oyna', kisa: 'Oyna', simge: 'oyna' },
]

function Logo() {
  return (
    <Link to="/" className="logo">
      <span className="logo-isaret">
        <img src="/piece/wN.svg" alt="" />
      </span>
      Hamle
    </Link>
  )
}

export default function App() {
  const [ayar, setAyar] = useState(false)
  return (
    <BrowserRouter>
      <div className="uygulama">
        <aside className="yan">
          <Logo />
          {MENU.map((m) => (
            <NavLink key={m.yol} to={m.yol} end={m.yol === '/'}>
              <Simge ad={m.simge} />
              {m.ad}
            </NavLink>
          ))}
          <div className="ara-bosluk" />
          <button className="menu-dugme" onClick={() => setAyar(true)}>
            <Simge ad="ayar" />
            Ayarlar
          </button>
          <NavLink to="/hakkinda">
            <Simge ad="bilgi" />
            Hakkında
          </NavLink>
          <div className="yan-alt">İlerlemen bu cihazda saklanır.</div>
        </aside>
        <header className="ust-cubuk">
          <Logo />
          <div className="satir">
            <Link to="/hakkinda" className="dugme hayalet simgeli" aria-label="Hakkında">
              <Simge ad="bilgi" />
            </Link>
            <button className="dugme hayalet simgeli" onClick={() => setAyar(true)} aria-label="Ayarlar">
              <Simge ad="ayar" />
            </button>
          </div>
        </header>
        <main className="ana">
          <Suspense fallback={<div className="yukleniyor">Yükleniyor…</div>}>
            <Routes>
              <Route path="/" element={<AnaSayfa />} />
              <Route path="/dersler" element={<Dersler />} />
              <Route path="/dersler/:id" element={<Ders />} />
              <Route path="/acilislar" element={<Acilislar />} />
              <Route path="/acilislar/:id" element={<AcilisDetay />} />
              <Route path="/bulmaca" element={<Bulmaca />} />
              <Route path="/analiz" element={<Analiz />} />
              <Route path="/oyna" element={<Oyna />} />
              <Route path="/hakkinda" element={<Hakkinda />} />
              <Route
                path="*"
                element={
                  <div className="yukleniyor">
                    <h2>Bu sayfa yok.</h2>
                    <Link className="dugme" to="/">
                      Ana sayfaya dön
                    </Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <nav className="alt-cubuk">
          {MENU.map((m) => (
            <NavLink key={m.yol} to={m.yol} end={m.yol === '/'}>
              <Simge ad={m.simge} boy={21} />
              {m.kisa}
            </NavLink>
          ))}
        </nav>
      </div>
      {ayar && <AyarlarModal kapat={() => setAyar(false)} />}
    </BrowserRouter>
  )
}
