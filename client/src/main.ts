import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    Wie damals schon bekannt war:
    <blockquote>
        "You gonne be my HUBSCHRAUBERLANDEPLATZ?"
    </blockquote>
    <div>
        - Johann Lafer, ca. 2018, koloriert
    </div>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
