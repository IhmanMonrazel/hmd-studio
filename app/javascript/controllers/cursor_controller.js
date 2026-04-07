import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.cursor = document.getElementById('hmd-cursor')
    this.dot    = document.getElementById('hmd-cursor-dot')
    this.ring   = document.getElementById('hmd-cursor-ring')

    this.mouseX = 0
    this.mouseY = 0
    this.ringX  = 0
    this.ringY  = 0
    this.rafId  = null

    // Reduced-motion: ring snaps instantly instead of lagging
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.onMouseMove  = this.handleMouseMove.bind(this)
    this.onMouseOver  = this.handleMouseOver.bind(this)
    this.onMouseOut   = this.handleMouseOut.bind(this)
    this.onMouseLeave = this.handleMouseLeave.bind(this)
    this.onMouseEnter = this.handleMouseEnter.bind(this)

    document.addEventListener('mousemove',  this.onMouseMove)
    document.addEventListener('mouseover',  this.onMouseOver)
    document.addEventListener('mouseout',   this.onMouseOut)
    document.addEventListener('mouseleave', this.onMouseLeave)
    document.addEventListener('mouseenter', this.onMouseEnter)

    this.loop()
  }

  handleMouseMove(e) {
    this.mouseX = e.clientX
    this.mouseY = e.clientY

    this.dot.style.left = e.clientX + 'px'
    this.dot.style.top  = e.clientY + 'px'
  }

  handleMouseOver(e) {
    if (e.target.closest('a, button, [data-cursor-hover], input, textarea, select, label')) {
      document.body.classList.add('cursor--hover')
    }
  }

  handleMouseOut(e) {
    if (!e.relatedTarget?.closest('a, button, [data-cursor-hover], input, textarea, select, label')) {
      document.body.classList.remove('cursor--hover')
    }
  }

  handleMouseLeave() {
    document.body.classList.add('cursor--hidden')
  }

  handleMouseEnter() {
    document.body.classList.remove('cursor--hidden')
  }

  loop() {
    // lerp = 1 when reduced motion: ring follows dot exactly, no lag
    const lerp = this.reducedMotion ? 1 : 0.12
    this.ringX += (this.mouseX - this.ringX) * lerp
    this.ringY += (this.mouseY - this.ringY) * lerp
    this.ring.style.left = this.ringX + 'px'
    this.ring.style.top  = this.ringY + 'px'
    this.rafId = requestAnimationFrame(this.loop.bind(this))
  }

  disconnect() {
    document.removeEventListener('mousemove',  this.onMouseMove)
    document.removeEventListener('mouseover',  this.onMouseOver)
    document.removeEventListener('mouseout',   this.onMouseOut)
    document.removeEventListener('mouseleave', this.onMouseLeave)
    document.removeEventListener('mouseenter', this.onMouseEnter)
    if (this.rafId) cancelAnimationFrame(this.rafId)
  }
}
