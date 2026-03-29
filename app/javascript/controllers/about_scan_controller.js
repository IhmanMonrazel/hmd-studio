import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  static targets = ["label", "progressBar", "dataLine"]

  connect() {
    const bar   = this.progressBarTarget
    const lines = this.dataLineTargets
    const total = lines.length

    // ── Clignotement "SCANNING..." ──────────────────────
    gsap.to(this.labelTarget, {
      opacity: 0.3,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "power1.inOut",
    })

    // ── Lignes de données : stagger rapide au scroll ────
    gsap.from(lines, {
      opacity: 0,
      x: -18,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out",
      scrollTrigger: {
        trigger: this.element,
        start: "top 60%",
        end:   "top 20%",
        once:  true,
      },
    })

    // ── Barre de progression : scrub sur toute la section
    ScrollTrigger.create({
      trigger: this.element,
      start: "top 80%",
      end:   "bottom 80%",
      onUpdate: (self) => {
        bar.style.width = `${self.progress * 100}%`
      },
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }
}
