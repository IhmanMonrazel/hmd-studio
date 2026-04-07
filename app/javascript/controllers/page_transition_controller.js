import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

export default class extends Controller {
  connect() {
    this.overlay = document.getElementById('hmd-transition')
    this.label = document.getElementById('hmd-transition-label')

    this._animating = false

    this.onTurboClick = this.handleTurboClick.bind(this)
    this.onTurboBeforeRender = this.handleTurboBeforeRender.bind(this)
    this.onTurboRender = this.handleTurboRender.bind(this)

    document.addEventListener('turbo:click', this.onTurboClick)
    document.addEventListener('turbo:before-render', this.onTurboBeforeRender)
    document.addEventListener('turbo:render', this.onTurboRender)

    // Only animate out on the very first page load, not on every Turbo navigation
    if (!window._hmdTransitionReady) {
      window._hmdTransitionReady = true
      this.animateOut()
    }
  }

  handleTurboClick() {
    if (this._animating) return
    this._animating = true
    this.animateIn()
  }

  handleTurboBeforeRender(e) {
    e.preventDefault()
    setTimeout(() => e.detail.resume(), 400)
  }

  handleTurboRender(e) {
    // Ignore Turbo cache previews — only react to real server renders
    if (e.detail && e.detail.renderMethod === 'replace' && document.documentElement.hasAttribute('data-turbo-preview')) return
    this._animating = false
    this.animateOut()
  }

  animateIn() {
    gsap.timeline()
      .set(this.overlay, { pointerEvents: 'all' })
      .to(this.overlay, {
        y: '0vh',
        duration: 0.4,
        ease: 'power3.inOut'
      })
      .to(this.label, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out'
      }, '-=0.15')
  }

  animateOut() {
    gsap.timeline()
      .to(this.label, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in'
      })
      .to(this.overlay, {
        y: '100vh',
        duration: 0.35,
        ease: 'power3.inOut'
      }, '-=0.05')
      .set(this.overlay, { pointerEvents: 'none' })
      // Reset to off-screen top, ready for next navigation
      .set(this.overlay, { y: '-100vh' })
  }

  disconnect() {
    document.removeEventListener('turbo:click',         this.onTurboClick)
    document.removeEventListener('turbo:before-render', this.onTurboBeforeRender)
    document.removeEventListener('turbo:render',        this.onTurboRender)
  }
}
