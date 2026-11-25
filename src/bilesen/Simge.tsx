const YOL: Record<string, string> = {
  ev: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  ders: 'M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zm0 15a2 2 0 0 0 2 2h13v-4M8 7h7M8 11h5',
  acilis: 'M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 9c0 5-6 4-12 6',
  bulmaca:
    'M10 4h4v2a2 2 0 1 0 4 0V4h2v6h-2a2 2 0 1 0 0 4h2v6h-6v-2a2 2 0 1 0-4 0v2H4v-6h2a2 2 0 1 0 0-4H4V4z',
  analiz: 'M3 3v18h18M7 15l4-5 3 3 5-7',
  oyna: 'M9 4h6l-1 4h2l1 3H7l1-3h2zM7 11c0 4 1 6 1 6h8s1-2 1-6M6 17h12v3H6z',
  ayar: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  cevir: 'M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3',
  ileri: 'M9 6l6 6-6 6',
  geri: 'M15 6l-6 6 6 6',
  bas: 'M17 6l-6 6 6 6M7 6v12',
  son: 'M7 6l6 6-6 6M17 6v12',
  ampul: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
  goz: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  yenile: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  geriAl: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  kopya: 'M9 9h11v11H9zM5 15H4V4h11v1',
  yukle: 'M12 15V3M7 8l5-5 5 5M4 15v5h16v-5',
  tamam: 'M5 12l5 5L20 7',
  kapat: 'M6 6l12 12M18 6 6 18',
  ara: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5',
  bayrak: 'M5 21V4M5 4h11l-2 4 2 4H5',
  yildiz: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
  ates: 'M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z',
  motor: 'M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  rapor: 'M8 3h8l4 4v14H4V3zM8 13h8M8 17h5M8 9h3',
  hedef: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  kitap: 'M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z',
  oynat: 'M7 4l12 8-12 8z',
  durdur: 'M7 5h4v14H7zM13 5h4v14h-4z',
  buyut: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  kucult: 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5',
  bilgi: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5M12 8h.01',
}

export default function Simge({ ad, boy = 20, sinif = '' }: { ad: keyof typeof YOL | string; boy?: number; sinif?: string }) {
  return (
    <svg className={'simge ' + sinif} width={boy} height={boy} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={YOL[ad] ?? ''} />
    </svg>
  )
}
