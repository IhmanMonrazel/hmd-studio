import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  static targets = ["title", "metaItem", "description", "votes"]

  connect() {
    const trigger = { trigger: this.element, start: "top 80%", once: true }

    // Titre — slide depuis la gauche
    gsap.from(this.titleTarget, {
      x: -50,
      opacity: 0,
      duration: 0.7,
      delay: 0.2,
      ease: "power3.out",
      scrollTrigger: trigger,
    })

    // Localisation / date / heure — fade in échelonné
    gsap.from(this.metaItemTargets, {
      y: 16,
      opacity: 0,
      duration: 0.55,
      stagger: 0.1,
      delay: 0.4,
      ease: "power2.out",
      scrollTrigger: trigger,
    })

    // Description — fade in depuis le bas
    gsap.from(this.descriptionTarget, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 0.7,
      ease: "power2.out",
      scrollTrigger: trigger,
    })

    // Boutons vote — pop avec rebond
    gsap.from(this.votesTarget.querySelectorAll("button"), {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      stagger: 0.12,
      delay: 0.9,
      ease: "back.out(2.5)",
      scrollTrigger: trigger,
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger === this.element || this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }
}
