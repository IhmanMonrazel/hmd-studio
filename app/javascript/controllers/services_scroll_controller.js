import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this.triggers = []
    this._setupEntranceAnimations()
    this._setupMagneticHover()
    ScrollTrigger.refresh()
  }

  disconnect() {
    this.triggers.forEach(t => t.kill())
    this.triggers = []

    // Remove event listeners
    if (this._itemListeners) {
      this._itemListeners.forEach(({ el, enter, leave, move }) => {
        el.removeEventListener("mouseenter", enter)
        el.removeEventListener("mouseleave", leave)
        el.removeEventListener("mousemove", move)
      })
      this._itemListeners = []
    }
  }

  // ── Entrance animations ──────────────────────────────────────
  _setupEntranceAnimations() {
    const items = Array.from(this.element.querySelectorAll(".s3__item"))

    items.forEach((item) => {
      const name = item.querySelector(".s3__name")
      const num  = item.querySelector(".s3__num")

      if (name) {
        const animName = gsap.from(name, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.9,
          ease:     "power3.out",
          scrollTrigger: {
            trigger:       item,
            start:         "top 90%",
            toggleActions: "play none none none",
            once:          true,
          },
        })
        if (animName.scrollTrigger) this.triggers.push(animName.scrollTrigger)
      }

      if (num) {
        const animNum = gsap.from(num, {
          clipPath: "inset(0 100% 0 0)",
          duration: 0.7,
          ease:     "power2.out",
          delay:    0.15,
          scrollTrigger: {
            trigger:       item,
            start:         "top 90%",
            toggleActions: "play none none none",
            once:          true,
          },
        })
        if (animNum.scrollTrigger) this.triggers.push(animNum.scrollTrigger)
      }
    })
  }

  // ── Magnetic hover ───────────────────────────────────────────
  _setupMagneticHover() {
    if (window.matchMedia('(hover: none)').matches) return
    this._itemListeners = []
    const items = Array.from(this.element.querySelectorAll(".s3__item"))

    items.forEach((el) => {
      const name = el.querySelector(".s3__name")

      const enter = () => el.classList.add("is-hovered")

      const leave = () => {
        el.classList.remove("is-hovered")
        if (name) name.style.transform = "translate(0px, 0px)"
      }

      const move = (e) => {
        if (!name) return
        const rect = el.getBoundingClientRect()
        const relX = (e.clientX - rect.left)  / rect.width  - 0.5
        const relY = (e.clientY - rect.top)   / rect.height - 0.5
        name.style.transform = `translate(${relX * 20}px, ${relY * 10}px)`
      }

      el.addEventListener("mouseenter", enter)
      el.addEventListener("mouseleave", leave)
      el.addEventListener("mousemove",  move)

      this._itemListeners.push({ el, enter, leave, move })
    })
  }
}
