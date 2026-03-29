import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  static targets = ["block"]

  connect() {
    // Chaque bloc fade in + translateY depuis le bas, stagger 0.3s
    gsap.from(this.blockTargets, {
      opacity: 0,
      y: 50,
      duration: 0.85,
      stagger: 0.3,
      ease: "power3.out",
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
