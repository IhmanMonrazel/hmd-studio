import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

export default class extends Controller {
  connect() {
    this.overlay = document.getElementById('hmd-transition')
    this.label = document.getElementById('hmd-transition-label')

    // Overlay starts off-screen and non-blocking on every page load.
    // animateOut() is NOT called here — the overlay is already hidden.
    gsap.set(this.overlay, { y: '-100vh', pointerEvents: 'none' })
    gsap.set(this.label, { opacity: 0 })

    // Intercept all internal link clicks
    this.onLinkClick = this.handleLinkClick.bind(this)
    document.addEventListener('click', this.onLinkClick, { capture: true })
  }

  handleLinkClick(e) {
    const link = e.target.closest('a[href]')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
    if (link.target === '_blank') return
    if (e.ctrlKey || e.metaKey || e.shiftKey) return
    if (href === window.location.pathname) return

    e.preventDefault()
    e.stopPropagation()

    this.animateIn(() => {
      window.location.href = href
    })
  }

  animateIn(callback) {
    gsap.timeline({ onComplete: callback })
      .set(this.overlay, { y: '-100vh', pointerEvents: 'all' })
      .to(this.overlay, { y: '0vh', duration: 0.4, ease: 'power3.inOut' })
      .to(this.label, { opacity: 1, duration: 0.2, ease: 'power2.out' }, '-=0.15')
  }

  animateOut() {
    gsap.timeline()
      .to(this.label, { opacity: 0, duration: 0.15, ease: 'power2.in' })
      .to(this.overlay, { y: '100vh', duration: 0.35, ease: 'power3.inOut' }, '-=0.05')
      .set(this.overlay, { pointerEvents: 'none' })
      .set(this.overlay, { y: '-100vh' })
  }

  disconnect() {
    document.removeEventListener('click', this.onLinkClick, { capture: true })
  }
}
