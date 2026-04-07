import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this.panels = Array.from(this.element.querySelectorAll('.s3__panel'))
    this.sticky = this.element.querySelector('.s3__sticky')
    this.setupScroll()
  }

  setupScroll() {
    const totalPanels = this.panels.length

    ScrollTrigger.create({
      trigger: this.element,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress
        const floatIndex = progress * totalPanels

        this.panels.forEach((panel, i) => {
          const distance = floatIndex - i - 0.5
          const absDistance = Math.abs(distance)

          if (absDistance > 1.0) {
            gsap.set(panel, { opacity: 0, y: distance < 0 ? -120 : 120, scale: 0.92, pointerEvents: 'none' })
            return
          }

          const opacity = gsap.utils.clamp(0, 1, 1 - absDistance * 1.2)
          const scale = gsap.utils.clamp(0.92, 1, 1 - absDistance * 0.06)
          const y = distance * 120

          gsap.set(panel, {
            opacity,
            scale,
            y,
            pointerEvents: absDistance < 0.3 ? 'auto' : 'none'
          })
        })
      }
    })
  }

  disconnect() {
    ScrollTrigger.getAll().forEach(st => st.kill())
  }
}
