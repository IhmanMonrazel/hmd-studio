import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  static targets = ["resource", "form", "seat", "total"]

  connect() {
    const trigger = { trigger: this.element, start: "top 80%", once: true }

    // Bloc 1 — Resource card: slide from left
    gsap.from(this.resourceTarget, {
      x: -80,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { ...trigger, start: "top 85%" },
    })

    // Bloc 2 — Form: fade in from bottom
    gsap.from(this.formTarget, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: "power3.out",
      scrollTrigger: { ...trigger },
    })

    // Bloc 3 — Seats: stagger pop with bounce
    gsap.from(this.seatTargets, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.06,
      delay: 0.35,
      ease: "back.out(2.2)",
      scrollTrigger: { ...trigger },
    })

    // Bloc 4 — Total: slide from right
    gsap.from(this.totalTarget, {
      x: 80,
      opacity: 0,
      duration: 0.9,
      delay: 0.55,
      ease: "power3.out",
      scrollTrigger: { ...trigger },
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger === this.element || this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }
}
