/** dersler: her adım bir konum + açıklama, isteğe bağlı görev */

export type Gorev = {
  /** sırayla: kullanıcı, otomatik yanıt, kullanıcı... ; alternatifler | ile */
  hat: string[]
  ipucu: string
  basari: string
  /** yanlış hamleye özel açıklama (uci -> metin) */
  yanlis?: Record<string, string>
}

export type Adim = {
  metin: string
  fen: string
  oklar?: { u: string; r?: 'yesil' | 'mavi' | 'kirmizi' | 'sari' }[]
  isaret?: Record<string, string>
  gorev?: Gorev
}

export type Ders = { id: string; bolum: string; baslik: string; ozet: string; adimlar: Adim[] }

export const BOLUMLER = ['Temeller', 'Açılış prensipleri', 'Taktikler', 'Oyun sonu']

export const DERSLER: Ders[] = [
  {
    id: 'taslar',
    bolum: 'Temeller',
    baslik: 'Taşlar ve hareketleri',
    ozet: 'Her taşın nasıl gittiğini tahtada gör ve dene.',
    adimlar: [
      {
        metin: 'Satranç 8x8 karelik bir tahtada oynanır. Dikey sütunlara **hat** (a-h), yatay sıralara **sıra** (1-8) denir. Her kare bir harf ve bir sayıyla adlandırılır: e4, d5 gibi.\n\nBeyaz her zaman ilk hamleyi yapar. Amaç rakip şahı **mat** etmektir: şah saldırı altındadır ve kaçacak yeri yoktur.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        isaret: { e4: 'vurgu', d5: 'vurgu' },
      },
      {
        metin: '**Piyon** düz ileri bir kare gider, ilk hamlesinde iki kare gidebilir. Taş alırken ise **çapraz** ileri alır. Geri gidemez.\n\nBeyaz piyonu e2\'den e4\'e oynat.',
        fen: '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1',
        oklar: [{ u: 'e2e4' }],
        gorev: { hat: ['e2e4|e2e3'], ipucu: 'e2\'deki piyonu tut ve iki kare ileri bırak.', basari: 'Piyon ilk hamlesinde iki kare gidebildi.' },
      },
      {
        metin: '**At** "L" biçiminde gider: iki kare bir yöne, bir kare yana. Diğer taşların üstünden atlayabilen tek taştır.\n\nAtla siyah piyonu al.',
        fen: '4k3/8/8/8/5p2/8/6N1/4K3 w - - 0 1',
        gorev: { hat: ['g2f4'], ipucu: 'g2\'deki at f4\'e ulaşabiliyor mu? İki yukarı, bir sola.', basari: 'At L çizerek piyonu aldı.' },
      },
      {
        metin: '**Fil** çapraz gider, istediği kadar. Her fil hep aynı renk karelerde kalır.\n\n**Kale** düz gider: yatay ya da dikey, istediği kadar.\n\nKaleyle siyah atı al.',
        fen: '4k3/8/8/8/1n6/8/8/1R2K3 w - - 0 1',
        oklar: [{ u: 'b1b4' }],
        gorev: { hat: ['b1b4'], ipucu: 'Kale b hattı boyunca yukarı gidebilir.', basari: 'Kale düz giderek atı aldı.' },
      },
      {
        metin: '**Vezir** en güçlü taştır: hem fil hem kale gibi gider. **Şah** her yöne yalnız bir kare gider ve asla saldırı altındaki bir kareye giremez.\n\nVezirle siyah kaleyi al.',
        fen: '4k3/8/8/8/8/2r5/8/Q3K3 w - - 0 1',
        gorev: { hat: ['a1c3'], ipucu: 'Vezir çapraz da gidebilir: a1-b2-c3.', basari: 'Vezir çapraz giderek kaleyi aldı.' },
      },
    ],
  },
  {
    id: 'ozel-hamleler',
    bolum: 'Temeller',
    baslik: 'Rok, terfi ve geçerken alma',
    ozet: 'Satrancın üç özel kuralı.',
    adimlar: [
      {
        metin: '**Rok**, şah ve kalenin birlikte yaptığı tek hamledir: şah kaleye doğru iki kare gider, kale şahın öbür yanına geçer. Şah ve o kale daha önce oynamamış olmalı, aradaki kareler boş olmalı ve şah şahtayken ya da saldırı altındaki bir kareden geçerek rok yapamaz.\n\nKısa rok yap: şahı g1\'e götür.',
        fen: 'r3k2r/pppq1ppp/2npbn2/2b1p3/2B1P3/2NP1N2/PPPQ1PPP/R1B1K2R w KQkq - 0 1',
        oklar: [{ u: 'e1g1' }],
        gorev: { hat: ['e1g1'], ipucu: 'Şahı tutup iki kare sağa bırak.', basari: 'Şah güvende, kale oyuna girdi.' },
      },
      {
        metin: '**Terfi**: son sıraya ulaşan piyon vezir, kale, fil ya da ata dönüşür. Neredeyse her zaman vezir seçilir.\n\nPiyonu a8\'e sür ve vezir yap.',
        fen: '4k3/P7/8/8/8/8/8/4K3 w - - 0 1',
        gorev: { hat: ['a7a8q'], ipucu: 'Piyonu a8\'e götür, çıkan menüden veziri seç.', basari: 'Yeni bir vezirin oldu.' },
      },
      {
        metin: '**Geçerken alma**: rakip piyon ilk hamlesinde iki kare gidip senin piyonunun hemen yanına gelirse, sen onu tek kare gitmiş gibi alabilirsin. Bu hakkı yalnız hemen sonraki hamlede kullanabilirsin.\n\nSiyah az önce d7-d5 oynadı. Geçerken al.',
        fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
        oklar: [{ u: 'e5d6' }],
        gorev: { hat: ['e5d6'], ipucu: 'e5 piyonu d6 karesine çapraz gider, d5 piyonu tahtadan kalkar.', basari: 'd5 piyonu geçerken alındı.' },
      },
    ],
  },
  {
    id: 'taslarin-degeri',
    bolum: 'Temeller',
    baslik: 'Taşların değeri',
    ozet: 'Hangi değişim iyi, hangisi kötü? Kabaca sayarak karar ver.',
    adimlar: [
      {
        metin: 'Taşların yaklaşık değerleri:\n\n**Piyon 1 · At 3 · Fil 3 · Kale 5 · Vezir 9**\n\nŞahın değeri sayılmaz, çünkü kaybedilirse oyun biter. Bu sayılar kesin değildir ama değişim kararlarında çok işe yarar: bir atı verip bir kale almak iyi, kaleyi verip at almak kötüdür.',
        fen: '4k3/8/8/8/3PNBRQ/8/8/4K3 w - - 0 1',
      },
      {
        metin: 'At iki taşa saldırıyor: f6\'daki fil ve c7\'deki kale. Fil g7 piyonuyla korunuyor, kale ise korumasız.\n\nHangisini almalısın?',
        fen: '6k1/2r2pp1/5b1p/3N4/8/8/5PPP/6K1 w - - 0 1',
        gorev: {
          hat: ['d5c7'],
          ipucu: 'Korumasız ve daha değerli olan taşı seç.',
          basari: 'Kale (5) bedavaya geldi. Üstelik siyahın Rc1 mat tehdidi de ortadan kalktı.',
          yanlis: { d5f6: 'Fil alırsan g7 piyonu atını geri alır: 3 ver 3 al. Kale ise bedava.' },
        },
      },
    ],
  },
  {
    id: 'tehdit',
    bolum: 'Temeller',
    baslik: 'Her hamlede üç soru',
    ozet: 'Rakip ne tehdit ediyor? Kazanılan maçların sırrı bu alışkanlık.',
    adimlar: [
      {
        metin: 'Her hamleden önce kendine üç soru sor:\n\n1. **Rakibin son hamlesi ne tehdit ediyor?**\n2. Şah çekebileceğim, taş alabileceğim, saldırabileceğim bir hamle var mı?\n3. Oynamak istediğim hamle bir taşımı korumasız bırakıyor mu?\n\nBu alışkanlık yeni başlayanların kayıplarının çoğunu önler.',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
        oklar: [
          { u: 'h5f7', r: 'kirmizi' },
          { u: 'c4f7', r: 'kirmizi' },
        ],
      },
      {
        metin: 'Beyaz veziri h5\'e çıkardı. Hem vezir hem fil f7\'ye bakıyor: **Qxf7 mat** tehdidi var. Bu "Çoban Matı" denemesidir.\n\nSiyahla tehdidi durdur.',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
        gorev: {
          hat: ['g7g6|d8e7|d8f6'],
          ipucu: 'f7\'yi koru ya da veziri kovala. g6 hem veziri kovalar hem hattı kapatır.',
          basari: 'Tehdit durdu. Beyazın vezirini erken çıkarması ona tempo kaybettirecek.',
          yanlis: { g8f6: 'Doğal görünüyor ama Qxf7 mat! Önce tehdide bak.', b7b6: 'Qxf7 mat olur.', a7a6: 'Qxf7 mat olur.' },
        },
      },
    ],
  },
  {
    id: 'merkez',
    bolum: 'Açılış prensipleri',
    baslik: 'Merkezi kontrol et',
    ozet: 'd4, d5, e4, e5: savaşın kalbi.',
    adimlar: [
      {
        metin: 'Tahtanın ortasındaki dört kare (d4, d5, e4, e5) en değerli karelerdir. Merkezdeki taşlar her yöne etki eder, merkezi tutan taraf rahat oynar.\n\nAt köşede (a1) yalnız 2 kareye, merkezde (e4) 8 kareye gidebilir.',
        fen: '4k3/8/8/8/4N3/8/8/N3K3 w - - 0 1',
        isaret: { d4: 'vurgu', d5: 'vurgu', e4: 'vurgu', e5: 'vurgu' },
      },
      {
        metin: 'İlk hamlede merkeze bir piyon sür. e4 ya da d4 en doğal seçimlerdir: merkezi tutar ve fillerin yolunu açar.',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        gorev: {
          hat: ['e2e4|d2d4'],
          ipucu: 'e ya da d piyonunu iki kare sür.',
          basari: 'Merkezde yer aldın, vezir ve fil için yol açıldı.',
          yanlis: { a2a4: 'Kenar piyonu merkeze etki etmez.', h2h4: 'Kenar piyonu merkeze etki etmez.', g2g4: 'Şahının önünü zayıflatır, merkeze katkısı az.' },
        },
      },
    ],
  },
  {
    id: 'gelisim',
    bolum: 'Açılış prensipleri',
    baslik: 'Taşlarını geliştir',
    ozet: 'Önce atlar ve filler. Her hamle yeni bir taşı oyuna soksun.',
    adimlar: [
      {
        metin: 'Açılışta amaç taşları başlangıç karelerinden çıkarıp etkili karelere koymaktır. Kural olarak:\n\n- Önce atlar, sonra filler.\n- Aynı taşı nedensiz iki kez oynama.\n- Veziri erken çıkarma, küçük taşlar onu kovalarken tempo kazanır.\n\n1.e4 e5 sonrası bir taş geliştir.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        gorev: {
          hat: ['g1f3|b1c3|f1c4'],
          ipucu: 'Nf3 hem gelişir hem e5 piyonuna saldırır.',
          basari: 'İyi! Gelişme hamlesi. Nf3 ayrıca e5\'e saldırır, siyahı yanıt vermeye zorlar.',
          yanlis: { d1h5: 'Vezir erken çıktı. Siyah ...Nc6, ...Nf6 ile gelişirken onu kovalayacak.', d1f3: 'Vezir erken çıktı ve f3 karesini atın elinden aldı.' },
        },
      },
      {
        metin: 'Bu konumda iki taraf da dörder taş geliştirdi. Beyaz rok yapmaya hazır. Gelişimde geride kalan taraf genellikle merkez açılınca sıkıntıya düşer.',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5',
        oklar: [{ u: 'e1g1' }],
      },
    ],
  },
  {
    id: 'sah-guvenligi',
    bolum: 'Açılış prensipleri',
    baslik: 'Şahını güvene al',
    ozet: 'Erken rok, sağlam piyon kalkanı.',
    adimlar: [
      {
        metin: 'Merkez açıldığında şah e1\'de kalırsa saldırıya açık olur. **Rok** şahı kenara, piyonların arkasına taşır ve kaleyi oyuna sokar.\n\nGeliştirdin, şimdi rok yap.',
        fen: 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6',
        gorev: { hat: ['e1g1'], ipucu: 'Şahı g1\'e götür.', basari: 'Şah güvende. Kale f1\'de, e hattına geçmeye hazır.' },
      },
      {
        metin: 'Rok yaptıktan sonra şahın önündeki piyonları (f2, g2, h2) gereksiz yere oynama. Her piyon hamlesi şahın kalkanında bir delik açar.\n\nh3 gibi küçük bir "nefes deliği" ise arka sıra matlarına karşı faydalı olabilir.',
        fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N1P/PP3PP1/RNBQ1RK1 b - - 0 7',
        isaret: { f2: 'iyi', g2: 'iyi', h3: 'vurgu' },
      },
    ],
  },
  {
    id: 'catal',
    bolum: 'Taktikler',
    baslik: 'Çatal',
    ozet: 'Bir taşla aynı anda iki hedefe saldır.',
    adimlar: [
      {
        metin: '**Çatal**, bir taşın aynı anda iki ya da daha fazla rakip taşa saldırmasıdır. Rakip yalnız birini kurtarabilir. Atlar çatal ustasıdır, çünkü saldırısı engellenemez.\n\nŞahı ve veziri aynı anda hedef alan at hamlesini bul.',
        fen: '2q3k1/5ppp/8/3N4/8/8/5PPP/6K1 w - - 0 1',
        gorev: { hat: ['d5e7', 'g8f8', 'e7c8'], ipucu: 'At hangi kareden hem g8\'e hem c8\'e bakar?', basari: 'Şah çekilmek zorundaydı, vezir gitti. Klasik at çatalı.' },
      },
    ],
  },
  {
    id: 'acmaz',
    bolum: 'Taktikler',
    baslik: 'Açmaz',
    ozet: 'Kımıldayamayan taş, kaybedilen taştır.',
    adimlar: [
      {
        metin: '**Açmaz**: bir taş, arkasında daha değerli bir taş (çoğu zaman şah) olduğu için kaçamaz. Arkadaki şahsa açmaz **mutlak**tır: taş yasal olarak bile oynayamaz.\n\nSiyah veziri şaha bağla.',
        fen: '6k1/6pp/8/3q4/8/1P6/5PPP/5BK1 w - - 0 1',
        gorev: {
          hat: ['f1c4', 'd5c4', 'b3c4'],
          ipucu: 'Fil hangi kareden hem d5\'e hem arkasındaki g8\'e bakar? O kare korunuyor mu?',
          basari: 'Vezir kaçamazdı. Fil (3) karşılığında vezir (9) kazandın.',
        },
      },
    ],
  },
  {
    id: 'sis',
    bolum: 'Taktikler',
    baslik: 'Şiş',
    ozet: 'Açmazın tersi: değerli taş kaçar, arkadaki düşer.',
    adimlar: [
      {
        metin: '**Şiş**te değerli taş öndedir. Saldırı altında kaçmak zorunda kalır ve arkasındaki taş alınır. Şahla yapılan şiş çok etkilidir.\n\nŞah çek ve arkadaki veziri kazan.',
        fen: '3q4/8/8/3k4/8/8/6PP/R5K1 w - - 0 1',
        gorev: { hat: ['a1d1', 'd5e4', 'd1d8'], ipucu: 'Şah ve vezir aynı hatta: d hattı.', basari: 'Şah kaçtı, vezir d8\'de düştü.' },
      },
    ],
  },
  {
    id: 'acarak-saldiri',
    bolum: 'Taktikler',
    baslik: 'Açarak saldırı',
    ozet: 'Bir taş çekilir, arkasındaki saldırır.',
    adimlar: [
      {
        metin: 'Bir taş, arkasındaki uzun menzilli taşın (kale, fil, vezir) yolunu kapatıyorsa, çekildiğinde **açarak saldırı** olur. Çekilen taş da başka bir şeye saldırırsa rakip ikisini birden karşılayamaz. Açarak şah en güçlü türüdür.\n\nAtı öyle oyna ki kale şah çeksin ve at da veziri hedef alsın.',
        fen: '4k3/1q3ppp/8/8/4N3/8/5PPP/4R1K1 w - - 0 1',
        oklar: [{ u: 'e1e8', r: 'kirmizi' }],
        gorev: {
          hat: ['e4c5|e4d6', 'e8f8', 'c5b7|d6b7'],
          ipucu: 'At e hattından çekilince kale e8\'e şah çeker. At hangi kareden b7\'ye bakar?',
          basari: 'Siyah şahla uğraşırken vezirini kaybetti.',
          yanlis: { e4f6: 'Çifte şah güçlü ama at f6\'dan b7\'ye bakmıyor. Vezire de saldıran bir kare seç.' },
        },
      },
    ],
  },
  {
    id: 'arka-sira',
    bolum: 'Taktikler',
    baslik: 'Arka sıra matı',
    ozet: 'Kendi piyonlarına sıkışmış şah.',
    adimlar: [
      {
        metin: 'Rok yapmış şahın önündeki piyonlar hiç oynamamışsa şahın kaçacak yeri olmaz. Arka sırayı koruyan taş yoksa tek bir kale ya da vezir mat eder.\n\nMat et.',
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
        gorev: { hat: ['a1a8'], ipucu: 'Kale 8. sıraya ulaşabiliyor mu?', basari: 'Mat! Siyah şahın piyonları kendi kaçış yolunu kapattı.' },
      },
      {
        metin: 'Bu yüzden ileride bir an bulup **h3** (ya da h6) ile şahına "nefes deliği" açmak çoğu zaman iyidir.',
        fen: '6k1/5pp1/7p/8/8/7P/5PP1/R5K1 w - - 0 1',
        isaret: { h7: 'iyi', h2: 'iyi' },
      },
    ],
  },
  {
    id: 'vezir-mat',
    bolum: 'Oyun sonu',
    baslik: 'Vezir ve şahla mat',
    ozet: 'Her oyuncunun bilmesi gereken ilk mat.',
    adimlar: [
      {
        metin: 'Vezir ve şah, tek başına kalmış şahı her zaman mat eder. Yöntem: vezirle rakip şahın alanını adım adım daralt (bir "kutu" kur), şahı kenara it, sonra kendi şahını yaklaştır ve mat et.\n\nVezir, rakip şahtan bir at hamlesi uzakta durursa onu güvenle iter.',
        fen: '8/8/3k4/8/8/2Q5/8/4K3 w - - 0 1',
        oklar: [{ u: 'c3c5' }],
      },
      {
        metin: '**Dikkat: pat!** Rakip şah şahta değilken hiç yasal hamlesi kalmazsa oyun berabere biter. Şahı köşeye sıkıştırdığında ona mutlaka bir kare bırak.\n\nBurada Qf7?? pat olurdu. Mat eden hamleyi bul.',
        fen: '7k/8/6K1/8/8/8/8/5Q2 w - - 0 1',
        gorev: {
          hat: ['f1f8'],
          ipucu: 'Şahın kaçabileceği kareler g7 ve h7: ikisini de şahın kapatıyor. 8. sırada şah çek.',
          basari: 'Mat! Şahın g7 ve h7\'yi tuttu, vezir arka sırayı.',
          yanlis: { f1f7: 'Pat! Siyahın yasal hamlesi kalmadı, berabere.', f1g2: 'Şah değil, siyah h8\'de kalır.' },
        },
      },
    ],
  },
  {
    id: 'kare-kurali',
    bolum: 'Oyun sonu',
    baslik: 'Kare kuralı',
    ozet: 'Şah piyona yetişir mi? Saymadan bil.',
    adimlar: [
      {
        metin: 'Piyondan terfi karesine kadar bir kare (kutu) çiz. Kenarı, piyonun terfiye kalan mesafesi kadardır. Sırası gelen şah bu karenin içine adım atabiliyorsa piyonu yakalar.\n\nBu konumda piyonun karesi a4-d4-d8-a8. Siyah şah dışarıda ama sıra siyahta.',
        fen: '8/8/8/4k3/P7/8/8/7K b - - 0 1',
        isaret: { a4: 'vurgu', b4: 'vurgu', c4: 'vurgu', d4: 'vurgu', d5: 'vurgu', d6: 'vurgu', d7: 'vurgu', d8: 'vurgu' },
      },
      {
        metin: 'Karenin içine gir ve piyonu durdur.',
        fen: '8/8/8/4k3/P7/8/8/7K b - - 0 1',
        gorev: {
          hat: ['e5d5|e5d4|e5d6', 'a4a5', 'd5c6|d5c5|d5d6|d4c5|d4d5|d6c6|d6c5|d6c7|d6d7|d6d5'],
          ipucu: 'd sütunundaki karelerden birine git.',
          basari: 'Şah karenin içinde kaldı, piyon terfi edemeyecek.',
          yanlis: { e5f5: 'Ters yöne gittin, piyon kaçar.', e5f4: 'Ters yöne gittin, piyon kaçar.', e5f6: 'Ters yöne gittin, piyon kaçar.', e5e4: 'Hâlâ karenin dışındasın. Bir sonraki hamlede yine girebilirsin ama şimdi d sütununa geç.', e5e6: 'Hâlâ karenin dışındasın. d sütununa geç.' },
        },
      },
    ],
  },
  {
    id: 'karsi-karsiya',
    bolum: 'Oyun sonu',
    baslik: 'Karşı karşıya gelme',
    ozet: 'Şah ve piyon oyun sonlarının anahtarı.',
    adimlar: [
      {
        metin: 'İki şah aynı hatta, aralarında tek kare varken **karşı karşıya**dır. Bu durumda hamle sırası kimdeyse o geri adım atmak zorunda kalır, öbür şah ilerler.\n\nŞah ve tek piyon oyun sonlarında savunan taraf karşı karşıya gelmeyi tutarsa çoğu zaman beraberliği kurtarır.',
        fen: '8/3k4/8/3K4/4P3/8/8/8 w - - 0 1',
        isaret: { d5: 'vurgu', d7: 'vurgu' },
      },
      {
        metin: 'Siyahla savunuyorsun. Beyaz şah d5\'te, piyonun önüne geçmek istiyor. Tek bir hamle beraberliği kurtarır, diğerleri kaybeder.\n\nBeyaz şahla karşı karşıya gel.',
        fen: '8/4k3/8/3K4/4P3/8/8/8 b - - 0 1',
        gorev: {
          hat: ['e7d7'],
          ipucu: 'Beyaz şahla aynı hatta, aralarında bir kare kalacak şekilde dur.',
          basari: 'Doğru! Beyaz ilerleyemez. e5 gelirse ...Ke7 ile karşı karşıya kalmaya devam et.',
          yanlis: { e7f6: 'Beyaz Kd6 ile öne geçer, piyon terfi eder.', e7e8: 'Beyaz Kd6 ya da Ke6 ile öne geçer.', e7f7: 'Beyaz Kd6 ile öne geçer.', e7d8: 'Beyaz Ke6 ile öne geçer.' },
        },
      },
      {
        metin: 'Şimdi saldıran tarafsın. Kural: şahını piyonun önüne, **altıncı sıraya** çıkarabilirsen (at piyonu dışında) kazanırsın.\n\nŞahını altıncı sıraya çıkar.',
        fen: '4k3/8/8/4K3/4P3/8/8/8 w - - 0 1',
        gorev: {
          hat: ['e5e6|e5f6|e5d6'],
          ipucu: 'd6, e6 ya da f6: piyonun önündeki altıncı sıra kareleri.',
          basari: 'Şahın piyonun önünde. Bu konum her zaman kazanır.',
          yanlis: { e5d5: 'Şah geri çekildi, siyah ...Ke7 ile karşı karşıya gelir.', e5f5: 'Siyah ...Ke7 ile karşı karşıya gelir, berabere.', e5f4: 'Geri çekilme beraberliğe gider.', e5d4: 'Geri çekilme beraberliğe gider.' },
        },
      },
    ],
  },
]

export const dersBul = (id: string) => DERSLER.find((d) => d.id === id)
