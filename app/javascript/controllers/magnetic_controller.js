import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

export default class extends Controller {
  connect() {
    // Skip on touch devices — mousemove on tap causes stuck drift
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    this.onMouseMove  = this.handleMouseMove.bind(this)
    this.onMouseLeave = this.handleMouseLeave.bind(this)

    this.element.addEventListener('mousemove',  this.onMouseMove)
    this.element.addEventListener('mouseleave', this.onMouseLeave)
  }

  handleMouseMove(e) {
    const rect = this.element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * 0.35
    const deltaY = (e.clientY - centerY) * 0.35

    gsap.to(this.element, {
      x: deltaX,
      y: deltaY,
      duration: 0.4,
      ease: 'power2.out'
    })
  }

  handleMouseLeave() {
    gsap.to(this.element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)'
    })
  }

  disconnect() {
    this.element.removeEventListener('mousemove',  this.onMouseMove)
    this.element.removeEventListener('mouseleave', this.onMouseLeave)
    gsap.set(this.element, { x: 0, y: 0 })
  }
}
