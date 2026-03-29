import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  static targets = ["line"]

  connect() {
    // État initial — toutes les lignes invisibles
    gsap.set(this.lineTargets, { opacity: 0, y: 6 })

    // Impression thermique ligne par ligne au scroll
    gsap.to(this.lineTargets, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      stagger: 0.08,
      ease: "none",
      scrollTrigger: {
        trigger: this.element,
        start: "top 80%",
        once: true,
      },
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger === this.element || this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }
}
