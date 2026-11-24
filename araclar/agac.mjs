// açılış ağacı: her konum için düğüm [fenAnahtar, adIndeksi, [[san, uci, çocukId]...]]
import { Chess } from 'chess.js'
import fs from 'fs'
const ac = JSON.parse(fs.readFileSync('public/veri/acilislar.json','utf8'))
const key = f => f.split(' ').slice(0,4).join(' ')
const nodes = [], idx = new Map()
const node = k => { if(!idx.has(k)){ idx.set(k,nodes.length); nodes.push([k,-1,[]]) } return idx.get(k) }
const ch = new Chess(); node(key(ch.fen()))
ac.forEach((a,i)=>{
  ch.reset(); let cur = node(key(ch.fen()))
  const sans = a[2].replace(/\d+\.\s*/g,'').trim().split(/\s+/)
  for(const s of sans){
    const m = ch.move(s); const k = key(ch.fen()); const id = node(k)
    const kids = nodes[cur][2]
    if(!kids.some(c=>c[2]===id)) kids.push([m.san, m.from+m.to+(m.promotion||''), id])
    cur = id
  }
  // aynı konuma birden çok ad düşerse en kısa/ilk olanı tut
  if(nodes[cur][1]===-1) nodes[cur][1]=i
})
fs.writeFileSync('public/veri/acilis-agaci.json', JSON.stringify(nodes))
console.log(nodes.length, 'düğüm', nodes.filter(n=>n[1]>=0).length, 'adlı')
