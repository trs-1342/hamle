import { oku, AYAR_VARSAYILAN, type Ayarlar } from './kayit'

let ctx: AudioContext | null = null

function ton(frek: number, sure: number, ses = 0.12, tur: OscillatorType = 'triangle', gecikme = 0) {
  try {
    ctx ??= new AudioContext()
    const t = ctx.currentTime + gecikme
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = tur
    o.frequency.setValueAtTime(frek, t)
    o.frequency.exponentialRampToValueAtTime(frek * 0.6, t + sure)
    g.gain.setValueAtTime(ses, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure)
    o.connect(g).connect(ctx.destination)
    o.start(t)
    o.stop(t + sure)
  } catch {
    /* ses desteklenmiyor */
  }
}

const acik = () => ({ ...AYAR_VARSAYILAN, ...oku<Partial<Ayarlar>>('ayarlar', {}) }).ses

export const sesler = {
  hamle: () => acik() && ton(520, 0.07, 0.1),
  alma: () => acik() && (ton(300, 0.09, 0.14, 'square'), ton(180, 0.08, 0.08, 'triangle', 0.02)),
  sah: () => acik() && (ton(880, 0.08, 0.08), ton(660, 0.1, 0.08, 'triangle', 0.07)),
  dogru: () => acik() && (ton(660, 0.09, 0.08, 'sine'), ton(990, 0.14, 0.08, 'sine', 0.08)),
  yanlis: () => acik() && ton(160, 0.22, 0.1, 'sawtooth'),
  bitti: () => acik() && (ton(523, 0.12, 0.08, 'sine'), ton(659, 0.12, 0.08, 'sine', 0.1), ton(784, 0.2, 0.08, 'sine', 0.2)),
}

export function hamleSesi(san: string) {
  if (san.includes('+') || san.includes('#')) sesler.sah()
  else if (san.includes('x')) sesler.alma()
  else sesler.hamle()
}
