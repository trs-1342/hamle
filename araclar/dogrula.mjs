// içerik doğrulama: açılış hatları ve ders görevleri yasal mı, motor ne diyor?
// çalıştır: node --experimental-strip-types araclar/dogrula.mjs [--motor]
import { Chess } from 'chess.js'
import { spawn } from 'child_process'
import { ONE_CIKAN } from '../src/icerik/acilislar.ts'
import { DERSLER } from '../src/icerik/dersler.ts'

let hata = 0
const bildir = (m) => {
  hata++
  console.log('HATA:', m)
}

function hatOyna(hat, ad) {
  const ch = new Chess()
  for (const s of hat.split(' ')) {
    try {
      ch.move(s)
    } catch {
      bildir(`${ad}: ${s} yasal değil (${ch.fen()})`)
      return null
    }
  }
  return ch
}

for (const a of ONE_CIKAN) {
  hatOyna(a.hat, a.ad)
  for (const v of a.varyantlar) {
    const ch = hatOyna(v.hat, a.ad + ' / ' + v.ad)
    if (ch && v.hat.endsWith('#') && !ch.isCheckmate()) bildir(`${v.ad}: mat değil`)
  }
}

const uciOyna = (ch, u) => {
  try {
    return ch.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
  } catch {
    return null
  }
}

const motorKonumlar = []
for (const d of DERSLER) {
  d.adimlar.forEach((a, i) => {
    let ch
    try {
      ch = new Chess(a.fen)
    } catch (e) {
      bildir(`${d.id}#${i}: FEN geçersiz ${a.fen} ${e.message}`)
      return
    }
    if (!a.gorev) return
    // tüm dalları dene
    const gez = (fen, j) => {
      if (j >= a.gorev.hat.length) return
      const alts = a.gorev.hat[j].split('|')
      if (j % 2 === 0) motorKonumlar.push({ ad: `${d.id}#${i}.${j}`, fen, kabul: alts })
      let biri = false
      for (const u of alts) {
        const c = new Chess(fen)
        if (uciOyna(c, u)) {
          biri = true
          gez(c.fen(), j + 1)
        } else if (j % 2 === 1) bildir(`${d.id}#${i}: otomatik yanıt ${u} yasal değil (${fen})`)
      }
      if (!biri) bildir(`${d.id}#${i}.${j}: hiçbir seçenek yasal değil (${alts}) ${fen}`)
    }
    gez(ch.fen(), 0)
  })
}

console.log('yasallık denetimi bitti, hata:', hata)

if (process.argv.includes('--motor')) {
  const sf = spawn('node', ['node_modules/stockfish/bin/stockfish-18-lite-single.js'])
  let tampon = ''
  let bekleyen = null
  sf.stdout.on('data', (b) => {
    tampon += b.toString()
    const satirlar = tampon.split('\n')
    tampon = satirlar.pop()
    for (const s of satirlar) bekleyen?.(s)
  })
  const gonder = (s) => sf.stdin.write(s + '\n')
  const ara = (fen) =>
    new Promise((res) => {
      const sat = {}
      bekleyen = (s) => {
        if (s.startsWith('info') && s.includes(' pv ')) {
          const t = s.split(' ')
          const mp = t[t.indexOf('multipv') + 1]
          const sk = t.indexOf('score')
          sat[mp] = { d: t[sk + 1] + ' ' + t[sk + 2], u: t[t.indexOf('pv') + 1] }
        }
        if (s.startsWith('bestmove')) res(Object.values(sat))
      }
      gonder('setoption name MultiPV value 5')
      gonder('position fen ' + fen)
      gonder('go depth 20')
    })
  gonder('uci')
  for (const k of motorKonumlar) {
    const l = await ara(k.fen)
    const s = l.map((x) => `${k.kabul.includes(x.u) ? '*' : ' '}${x.u} ${x.d}`).join(' | ')
    const enIyiKabul = k.kabul.includes(l[0]?.u)
    console.log(enIyiKabul ? 'tamam' : 'BAK  ', k.ad, '→', s)
  }
  sf.kill()
}
process.exit(hata ? 1 : 0)
