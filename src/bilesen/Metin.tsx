/** çok basit biçim: **kalın**, paragraf (boş satır), "- " liste, "1. " sıralı liste */
function satirIci(s: string, k: string) {
  const parca = s.split(/(\*\*[^*]+\*\*)/g)
  return parca.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={k + i}>{p.slice(2, -2)}</strong> : <span key={k + i}>{p}</span>))
}

export default function Metin({ metin }: { metin: string }) {
  const bloklar = metin.split(/\n\n+/)
  return (
    <div className="metin">
      {bloklar.map((b, i) => {
        const satirlar = b.split('\n')
        if (satirlar.every((s) => s.startsWith('- ')))
          return (
            <ul key={i}>
              {satirlar.map((s, j) => (
                <li key={j}>{satirIci(s.slice(2), `${i}-${j}-`)}</li>
              ))}
            </ul>
          )
        if (satirlar.every((s) => /^\d+\. /.test(s)))
          return (
            <ol key={i}>
              {satirlar.map((s, j) => (
                <li key={j}>{satirIci(s.replace(/^\d+\. /, ''), `${i}-${j}-`)}</li>
              ))}
            </ol>
          )
        return <p key={i}>{satirIci(b, `${i}-`)}</p>
      })}
    </div>
  )
}
