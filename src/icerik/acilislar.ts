/** öne çıkan açılışlar: türkçe açıklama, fikirler, tuzaklar */

export type Varyant = { ad: string; hat: string; not: string; tuzak?: boolean }
export type OneCikan = {
  id: string
  ad: string
  eco: string
  renk: 'w' | 'b'
  seviye: 'Başlangıç' | 'Orta' | 'İleri'
  hat: string
  ozet: string
  fikirler: string[]
  dikkat: string[]
  varyantlar: Varyant[]
}

export const ONE_CIKAN: OneCikan[] = [
  {
    id: 'italyan',
    ad: 'İtalyan Oyunu',
    eco: 'C50',
    renk: 'w',
    seviye: 'Başlangıç',
    hat: 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O',
    ozet: 'Beyaz filini c4\'e çıkarıp f7 karesine bakar, hızlı gelişir ve sakin bir merkez kurar. Yeni başlayanlar için en doğal açılışlardan biri.',
    fikirler: [
      'Fil c4\'ten f7\'yi hedefler. f7 siyahın en zayıf karesidir, başta yalnız şah onu korur.',
      'c3 ile d4 hamlesine hazırlan. Merkezi ne zaman açacağına sen karar ver.',
      'Rok yap, sonra Re1, Nbd2-f1-g3 ile taşlarını yavaşça şah kanadına yönelt.',
      'Bb3 ve h3 küçük ama faydalı hamlelerdir: filini değişimden korur, Bg4 açmazını önler.',
    ],
    dikkat: [
      'Erken Ng5 ile f7\'ye saldırmak ancak siyah Nf6 oynadıysa (İki At Savunması) anlamlıdır.',
      'Siyah ...d5 ile merkezi açarsa filin c4\'te açıkta kalabilir.',
    ],
    varyantlar: [
      { ad: 'Giuoco Pianissimo', hat: 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O', not: 'Ana hat: sakin, manevra dolu, iki taraf da rahat.' },
      { ad: 'Evans Gambiti', hat: 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4', not: 'Beyaz bir piyon verip hızlı gelişme ve merkez kazanır. Saldırgan oyuncular için.' },
      { ad: 'Legal tuzağı', hat: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#', not: 'Açmaz sanılan at kaçar, vezir feda edilir ve küçük taşlar mat eder. Açmazın her zaman tam olmadığını gösterir.', tuzak: true },
    ],
  },
  {
    id: 'ispanyol',
    ad: 'İspanyol Açılışı (Ruy Lopez)',
    eco: 'C60',
    renk: 'w',
    seviye: 'Orta',
    hat: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3',
    ozet: 'Beyaz, e5 piyonunu koruyan c6 atına baskı yapar. Yüzyıllardır en üst düzeyde oynanan, derin stratejik bir açılış.',
    fikirler: [
      'Bb5 hemen taş kazanmaz, uzun vadeli baskı kurar. Bxc6 ve Nxe5 tehdidi ancak d4 sonrası gerçek olur.',
      'c3 ve d4 ile güçlü bir piyon merkezi kur.',
      'Fil a4 ve b3 üzerinden çapraza geri çekilir, oradan f7\'ye bakmaya devam eder.',
      'h3, siyahın Bg4 ile atını bağlamasını önler.',
    ],
    dikkat: [
      'Erken Bxc6 ve Nxe5 iyi değildir: siyah ...Qd4 ya da ...Qg5 ile piyonu geri alır.',
      'Noah\'ın Gemisi tuzağı: fil a4-b3\'te kalırsa ...c5-c4 ile hapsedilebilir.',
    ],
    varyantlar: [
      { ad: 'Kapalı ana hat', hat: 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3', not: 'Klasik, uzun manevra savaşları.' },
      { ad: 'Berlin Savunması', hat: 'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8', not: 'Vezirler erken değişir. Siyah için çok sağlam, "Berlin Duvarı".' },
      { ad: 'Değişim varyantı', hat: 'e4 e5 Nf3 Nc6 Bb5 a6 Bxc6 dxc6 O-O', not: 'Beyaz çift fili verir ama siyahın piyon yapısını bozar. Oyun sonunda beyaz şah kanadı çoğunluğuyla rahattır.' },
    ],
  },
  {
    id: 'iskoc',
    ad: 'İskoç Oyunu',
    eco: 'C45',
    renk: 'w',
    seviye: 'Başlangıç',
    hat: 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4',
    ozet: 'Beyaz merkezi hemen açar. Açık oyun, net planlar ve hızlı gelişme. Kuramı İspanyol\'dan çok daha az.',
    fikirler: [
      'd4 ile merkezi erkenden aç, taşlarını açık hatlara yerleştir.',
      'd4\'teki at çok merkezîdir. Siyah ...Bc5 ile ona baskı yaparsa Be3 ya da Nb3 düşün.',
      'Nxc6 ve e5 ile siyahın atını geri iterek alan kazan.',
    ],
    dikkat: ['Vezirini d4\'te erken almak (4.Qxd4) atın ...Nc6 ile tempo kazanmasına izin verir. Atla almak daha iyidir.'],
    varyantlar: [
      { ad: 'Mieses varyantı', hat: 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5 c4', not: 'Ana hat, beyaz alanda üstün.' },
      { ad: 'Klasik (4...Bc5)', hat: 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7', not: 'Siyah d4 atına baskı yapar, beyaz sağlam savunur.' },
    ],
  },
  {
    id: 'londra',
    ad: 'Londra Sistemi',
    eco: 'D02',
    renk: 'w',
    seviye: 'Başlangıç',
    hat: 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3',
    ozet: 'Beyaz hemen hemen her savunmaya karşı aynı düzeni kurar: d4, Bf4, e3, Nf3, c3, Nbd2, Bd3. Az ezber, sağlam yapı.',
    fikirler: [
      'Fili e3\'ten önce f4\'e çıkar, yoksa piyon zincirinin içinde kalır.',
      'c3-d4-e3 üçgeni çok sağlamdır, merkez kolay kırılmaz.',
      'Ne5 ve f4 ile şah kanadında saldırı kurulabilir.',
      'Siyah ...Bd6 ile filini değiştirmek isterse Bg3 ile karşıla.',
    ],
    dikkat: ['Siyah ...c5 ve ...Qb6 ile b2\'ye baskı yaparsa Qb3 ya da Qc1 ile savun, b2 piyonunu unutma.'],
    varyantlar: [
      { ad: 'Ana düzen', hat: 'd4 d5 Bf4 Nf6 e3 e6 Nf3 c5 c3 Nc6 Nbd2 Bd6 Bg3 O-O Bd3', not: 'Standart Londra kurulumu.' },
      { ad: '...Qb6 baskısı', hat: 'd4 d5 Bf4 c5 e3 Nc6 c3 Qb6 Qb3', not: 'b2\'yi vezir değişimini önererek savun.' },
    ],
  },
  {
    id: 'vezir-gambiti',
    ad: 'Vezir Gambiti',
    eco: 'D06',
    renk: 'w',
    seviye: 'Orta',
    hat: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7 Rc1',
    ozet: 'Beyaz c4 ile siyahın d5 piyonunu sorgular. Gerçek bir gambit değildir: piyon çoğu zaman geri alınır. Konumsal satrancın temeli.',
    fikirler: [
      'c4, d5\'e baskı yapar, siyahın merkezini zayıflatmaya çalışır.',
      'Bg5 ile f6 atını bağla, d5 üzerindeki baskıyı artır.',
      'Azınlık saldırısı: b4-b5 ile siyahın vezir kanadında zayıflık yarat.',
    ],
    dikkat: ['Fil tuzağı (Elephant Trap): beyaz d5\'teki piyonu açmazdaki atı unutarak alırsa taş kaybeder.'],
    varyantlar: [
      { ad: 'Vezir Gambiti Reddi', hat: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7 Rc1', not: 'En klasik yapı.' },
      { ad: 'Vezir Gambiti Kabulü', hat: 'd4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6', not: 'Siyah piyonu alır, beyaz merkezle ve hızlı gelişmeyle geri alır.' },
      { ad: 'Fil tuzağı', hat: 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8 Bb4+ Qd2 Bxd2+ Kxd2 Kxd8', not: 'f6 atı açmazda sanılır ama değil. Beyaz vezir için iki taş verir ve bir taş eksik kalır.', tuzak: true },
    ],
  },
  {
    id: 'ingiliz',
    ad: 'İngiliz Açılışı',
    eco: 'A20',
    renk: 'w',
    seviye: 'Orta',
    hat: 'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6 O-O',
    ozet: 'Beyaz merkeze yandan, c piyonuyla bakar. Esnek, konumsal; çoğu zaman ters Sicilya gibi oynanır.',
    fikirler: [
      'g3 ve Bg2 ile uzun çaprazı kontrol et, d5 ve b7 kareleri baskı altında.',
      'Vezir kanadında b4-b5 ile alan kazan.',
      'Merkezi ancak taşlar hazır olunca d4 ile aç.',
    ],
    dikkat: ['Siyah ...d5 ile merkezi alırsa cxd5 ve Bg2 baskısıyla hemen yanıt ver.'],
    varyantlar: [
      { ad: 'Ters Sicilya', hat: 'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6 Nf3 Nc6 O-O', not: 'Beyaz bir tempo fazlasıyla Sicilya yapısı.' },
      { ad: 'Simetrik', hat: 'c4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7', not: 'İki taraf da aynı düzeni kurar, ince tempo savaşı.' },
    ],
  },
  {
    id: 'sicilya',
    ad: 'Sicilya Savunması',
    eco: 'B20',
    renk: 'b',
    seviye: 'Orta',
    hat: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6',
    ozet: 'e4\'e karşı en popüler ve en savaşçı yanıt. Siyah merkezi yandan, c piyonuyla karşılar ve dengesiz konumlarda kazanmak için oynar.',
    fikirler: [
      'c piyonu d4 ile değişince siyah yarı açık c hattı ve fazladan bir merkez piyonu kazanır.',
      'Siyah vezir kanadında (...b5, ...Rc8) saldırır, beyaz genellikle şah kanadında.',
      'Najdorf\'taki ...a6, b5 karesini kontrol eder ve ...e5 ya da ...e6 için esneklik bırakır.',
    ],
    dikkat: [
      'Kuramı çok geniştir. Önce yapıyı ve planları öğren, ezber sonra gelir.',
      'Gelişimi geciktirirsen beyazın hızlı saldırıları (f4-f5, g4-g5) tehlikeli olur.',
    ],
    varyantlar: [
      { ad: 'Najdorf', hat: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', not: 'Fischer ve Kasparov\'un silahı. Esnek ve keskin.' },
      { ad: 'Dragon', hat: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6', not: 'Fil g7\'den uzun çaprazı tarar. İki taraf da şaha saldırır.' },
      { ad: 'Alapin (2.c3)', hat: 'e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3', not: 'Beyaz keskin kuramdan kaçar, sade bir merkez kurar.' },
    ],
  },
  {
    id: 'fransiz',
    ad: 'Fransız Savunması',
    eco: 'C00',
    renk: 'b',
    seviye: 'Başlangıç',
    hat: 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6',
    ozet: 'Siyah önce e6 ile d5\'i hazırlar. Sağlam bir piyon zinciri kurar ve beyazın merkezine ...c5 ile tabandan saldırır.',
    fikirler: [
      'Piyon zincirine tabandan saldır: d4 piyonu ...c5 ile, e5 piyonu ...f6 ile hedeflenir.',
      'c8 fili "kötü fil"dir, kendi piyonlarının arkasında kalır. ...b6 ve ...Ba6 ile değiştirmeyi düşün.',
      'İlerleme varyantında ...Qb6 ve ...Nc6 ile d4\'e baskı kur.',
    ],
    dikkat: ['Şah kanadında rok yaptıysan beyazın Bd3, Qg4 ya da Bxh7+ fedasına dikkat et.'],
    varyantlar: [
      { ad: 'İlerleme varyantı', hat: 'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6', not: 'Beyaz alan kazanır, siyah d4\'e baskı yapar.' },
      { ad: 'Değişim varyantı', hat: 'e4 e6 d4 d5 exd5 exd5 Nf3 Nf6 Bd3 Bd6 O-O O-O', not: 'Simetrik ve sakin. Siyahın kötü fili serbest kalır.' },
      { ad: 'Winawer', hat: 'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3', not: 'Keskin: siyah beyazın piyon yapısını bozar.' },
    ],
  },
  {
    id: 'caro-kann',
    ad: 'Caro-Kann Savunması',
    eco: 'B10',
    renk: 'b',
    seviye: 'Başlangıç',
    hat: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7',
    ozet: 'Siyah c6 ile d5\'i destekler. Fransız\'a benzer ama c8 fili piyon zincirinden önce dışarı çıkabilir. Sağlam ve güvenli.',
    fikirler: [
      'Fil f5\'e çıkar, sonra ...e6 ile zincir kurulur. Kötü fil sorunu yoktur.',
      'Piyon yapısı çok sağlamdır, oyun sonları siyah için genellikle rahattır.',
      'Gelişimi tamamla: ...Nd7, ...Ngf6, ...e6, ...Be7, ...O-O.',
    ],
    dikkat: ['Fil f5\'teyken b7 korumasız kalabilir, Qb3 tehditlerine dikkat et.'],
    varyantlar: [
      { ad: 'Klasik', hat: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7', not: 'Ana hat.' },
      { ad: 'İlerleme varyantı', hat: 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5', not: 'Fil zincirin dışına çıktıktan sonra ...c5 ile merkeze saldır.' },
    ],
  },
  {
    id: 'iskandinav',
    ad: 'İskandinav Savunması',
    eco: 'B01',
    renk: 'b',
    seviye: 'Başlangıç',
    hat: 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5',
    ozet: 'Siyah ilk hamlede merkezi sorgular. Vezir erken çıkar ama a5\'te güvenli bir yer bulur. Ezberi az, planı net.',
    fikirler: [
      'Vezir a5\'te hem güvende hem de a5-e1 çaprazıyla açmaz fırsatı arar.',
      '...c6, ...Bf5, ...e6 ile Caro-Kann\'a benzer sağlam bir yapı kur.',
      'Alternatif: 2...Nf6 ile piyonu atla geri al.',
    ],
    dikkat: ['Vezir başka karelere giderse Nc3, Nb5, Bf4 gibi hamlelerle tempo kaybedersin.'],
    varyantlar: [
      { ad: 'Ana hat (...Qa5)', hat: 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5', not: 'Sağlam ve öğretici.' },
      { ad: 'Modern (2...Nf6)', hat: 'e4 d5 exd5 Nf6 d4 Nxd5 Nf3 g6', not: 'Piyon atla alınır, vezir saklanır.' },
    ],
  },
  {
    id: 'iki-at',
    ad: 'İki At Savunması',
    eco: 'C55',
    renk: 'b',
    seviye: 'Orta',
    hat: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O',
    ozet: 'İtalyan\'a karşı siyah fili değil atı çıkarır ve e4\'e saldırır. Hem sakin hem de çok keskin hatlara yol açabilir.',
    fikirler: [
      'Nf6 hemen e4\'e baskı yapar, beyazı karar vermeye zorlar.',
      '4.Ng5\'e karşı 4...d5 doğru yanıttır. Sonra 5...Na5 ile fili kovala.',
    ],
    dikkat: [
      'Kızarmış Ciğer (Fried Liver): 5...Nxd5 alırsan beyaz Nxf7 ile şahını açığa çıkarır. 5...Na5 oyna.',
    ],
    varyantlar: [
      { ad: 'Sakin hat (4.d3)', hat: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O', not: 'Modern ana hat, İtalyan yapısına benzer.' },
      { ad: '4.Ng5 ve doğru savunma', hat: 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6', not: 'Siyah bir piyon verir ama hızlı gelişir ve fili kovalar.' },
      { ad: 'Kızarmış Ciğer tuzağı', hat: 'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3', not: 'Siyahın şahı merkeze çekilir ve saldırı altında kalır. 5...Nxd5 hatadır.', tuzak: true },
    ],
  },
  {
    id: 'slav',
    ad: 'Slav Savunması',
    eco: 'D10',
    renk: 'b',
    seviye: 'Orta',
    hat: 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4',
    ozet: 'Vezir Gambiti\'ne karşı siyah d5\'i c6 ile destekler. c8 fili kapanmaz, yapı çok sağlamdır.',
    fikirler: [
      'Fil f5 ya da g4\'e çıkmadan önce ...e6 oynama.',
      '...dxc4 sonrası piyonu ...b5 ile tutmaya çalışma, gelişmeye odaklan.',
    ],
    dikkat: ['Erken ...Bf5 sonrası Qb3 ile b7 ve d5\'e çift saldırıya dikkat et.'],
    varyantlar: [
      { ad: 'Ana hat', hat: 'd4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4', not: 'Klasik Slav.' },
      { ad: 'Değişim', hat: 'd4 d5 c4 c6 cxd5 cxd5 Nc3 Nf6 Bf4 Nc6 e3', not: 'Simetrik yapı, beraberliğe yakın ama ince.' },
    ],
  },
  {
    id: 'sah-hint',
    ad: 'Şah Hint Savunması',
    eco: 'E60',
    renk: 'b',
    seviye: 'İleri',
    hat: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7',
    ozet: 'Siyah merkezi beyaza bırakır, sonra ...e5 ya da ...c5 ile ona saldırır. Dinamik, karşı saldırıya dayalı.',
    fikirler: [
      'Fil g7\'den uzun çaprazı tarar, merkez açılınca çok güçlenir.',
      'Kapalı merkezde siyah ...f5 ile şah kanadında saldırır, beyaz vezir kanadında c5 ile.',
    ],
    dikkat: ['Merkez erken açılırsa d6 piyonu zayıf kalabilir.'],
    varyantlar: [
      { ad: 'Klasik', hat: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6 d5 Ne7', not: 'İki kanatta yarış.' },
      { ad: 'Sämisch', hat: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f3 O-O Be3', not: 'Beyaz e4\'ü sağlamlaştırır, uzun rok ve g4-h4 saldırısı.' },
    ],
  },
  {
    id: 'nimzo-hint',
    ad: 'Nimzo-Hint Savunması',
    eco: 'E20',
    renk: 'b',
    seviye: 'İleri',
    hat: 'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O',
    ozet: 'Siyah c3 atını bağlayarak e4 karesini kontrol eder. Gerekirse fili ata verip beyazın piyon yapısını bozar.',
    fikirler: [
      'Bb4 açmazı e4 hamlesini zorlaştırır.',
      '...Bxc3 sonrası beyazın çift c piyonları hedef olur.',
    ],
    dikkat: ['Fili kolay verme: beyaz çift fil avantajını açık konumlarda kullanır.'],
    varyantlar: [
      { ad: 'Rubinstein (4.e3)', hat: 'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O', not: 'En sağlam beyaz düzeni.' },
      { ad: 'Klasik (4.Qc2)', hat: 'd4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3', not: 'Beyaz piyon yapısını bozdurmaz, çift fili alır.' },
    ],
  },
  {
    id: 'sah-gambiti',
    ad: 'Şah Gambiti',
    eco: 'C30',
    renk: 'w',
    seviye: 'Orta',
    hat: 'e4 e5 f4 exf4 Nf3 g5 h4 g4 Ne5',
    ozet: '19. yüzyılın romantik açılışı. Beyaz f piyonunu verip f hattını açar ve hızla saldırır. Riskli ama çok öğretici.',
    fikirler: [
      'f4 piyonu verilirse f hattı açılır, beyaz kale ve fille f7\'ye yüklenir.',
      'Merkezi d4 ile kur, rok yapıp f hattını kullan.',
    ],
    dikkat: ['Şahın erken açılır: ...Qh4+ şahlarına dikkat. Nf3 bu yüzden önemlidir.'],
    varyantlar: [
      { ad: 'Kabul, Kieseritzky', hat: 'e4 e5 f4 exf4 Nf3 g5 h4 g4 Ne5', not: 'Keskin ana hat.' },
      { ad: 'Ret (2...Bc5)', hat: 'e4 e5 f4 Bc5 Nf3 d6 c3', not: 'Siyah g1-a7 çaprazıyla beyazın rokunu zorlaştırır.' },
    ],
  },
  {
    id: 'pirc',
    ad: 'Pirc Savunması',
    eco: 'B07',
    renk: 'b',
    seviye: 'Orta',
    hat: 'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6',
    ozet: 'Siyah merkezi beyaza bırakır, fili g7\'ye yerleştirir ve uygun anda ...e5 ya da ...c5 ile karşı vurur.',
    fikirler: [
      'Esnek düzen: önce gelişme ve rok, merkez kararı sonra.',
      '...e5 ya da ...c5 ile beyazın merkezini sorgula.',
    ],
    dikkat: ['Beyaz f4 ve e5 ile hızlı saldırırsa (Avusturya saldırısı) zamanında ...c5 ile karşılık ver.'],
    varyantlar: [
      { ad: 'Klasik', hat: 'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6', not: 'Sakin ana hat.' },
      { ad: 'Avusturya saldırısı', hat: 'e4 d6 d4 Nf6 Nc3 g6 f4 Bg7 Nf3 c5', not: 'Beyaz büyük merkez kurar, siyah hemen ...c5 ile vurur.' },
    ],
  },
]

export const oneCikanBul = (id: string) => ONE_CIKAN.find((a) => a.id === id)
