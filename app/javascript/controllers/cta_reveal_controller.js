import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    const title = this.element.querySelector(".s7__title")
    if (!title) return

    // Split titre en mots
    const words = title.textContent.trim().split(" ")
    title.innerHTML = words
      .map(w => `<span class="s7__word" style="display:inline-block">${w}</span>`)
      .join(" ")

    const spans = title.querySelectorAll(".s7__word")
    gsap.set(spans, { opacity: 0, y: 20 })

    ScrollTrigger.create({
      trigger: title,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(spans, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1,
        })
      },
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }
}
