import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    const items = [
      this.element.querySelector(".ab-approach__label"),
      ...this.element.querySelectorAll(".ab-approach__block"),
    ].filter(Boolean)

    items.forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 40 })

      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.12,
          })
        },
      })
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }
}
