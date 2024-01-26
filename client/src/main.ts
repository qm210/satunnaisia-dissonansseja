import './style.css'
import Alpine from "alpinejs";

// Wait for alpine to be instantiated before processing
document.addEventListener("alpine:init", () => {
  Alpine.data("quotes", () => ({
    title: "Johann Lafer",
    showNav: false,
    handleNav() {
      this.showNav = !this.showNav;
    },
  }));
});

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

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
