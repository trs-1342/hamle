export default function Hakkinda() {
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="ust-baslik">
        <div className="ust-kucuk">Hakkında</div>
        <h1>Hamle</h1>
        <p>Satranç öğrenmek isteyenler için ücretsiz, reklamsız bir çalışma alanı. Hesap gerekmez, ilerlemen bu cihazın tarayıcısında saklanır.</p>
      </div>
      <div className="kart" style={{ marginBottom: 16 }}>
        <h3>Telefona kur</h3>
        <p className="soluk" style={{ margin: 0 }}>
          Hamle bir web uygulamasıdır. Telefonda tarayıcı menüsünden <strong>Ana ekrana ekle</strong> (iPhone: Paylaş → Ana Ekrana Ekle) seçince uygulama gibi açılır ve bir kez yüklendikten sonra internetsiz de çalışır.
        </p>
      </div>
      <div className="kart" style={{ marginBottom: 16 }}>
        <h3>Kaynaklar ve lisanslar</h3>
        <ul style={{ paddingLeft: 18, margin: 0, color: 'var(--soluk)' }}>
          <li>
            Analiz motoru: <a href="https://github.com/nmrugg/stockfish.js" target="_blank" rel="noreferrer">Stockfish.js</a> (Stockfish 18, GPLv3). Lisans metni: <a href="/engine/Copying.txt">Copying.txt</a>. Kaynak kodu bağlantıdaki depodadır.
          </li>
          <li>
            Bulmacalar: <a href="https://database.lichess.org/#puzzles" target="_blank" rel="noreferrer">lichess.org bulmaca veritabanı</a> (CC0).
          </li>
          <li>
            Açılış adları: <a href="https://github.com/lichess-org/chess-openings" target="_blank" rel="noreferrer">lichess-org/chess-openings</a> (CC0).
          </li>
          <li>
            Taş görselleri: Colin M.L. Burnett, "cburnett" takımı (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>).
          </li>
          <li>Kurallar: chess.js (BSD-2).</li>
        </ul>
      </div>
      <div className="kart">
        <h3>Klavye</h3>
        <ul style={{ paddingLeft: 18, margin: 0, color: 'var(--soluk)' }}>
          <li>← → hamleler arasında gez, ↑ ↓ başa ve sona git.</li>
          <li>f tahtayı çevirir.</li>
          <li>Sağ tıkla sürükleyerek ok çiz, tek karede sağ tıkla halka koy (Shift: kırmızı, Alt: mavi).</li>
        </ul>
      </div>
    </div>
  )
}
