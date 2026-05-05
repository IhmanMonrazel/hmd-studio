import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this._onResize = this._setViewportVars.bind(this)
    this._setViewportVars()
    window.addEventListener("resize", this._onResize, { passive: true })

    // ── Overlay fade (transparent on load, fades in after S1) ─
    this._onScroll = this._updateOverlay.bind(this)
    window.addEventListener("scroll", this._onScroll, { passive: true })
    this._updateOverlay()

    // ── Particle world (S2 + S3 + S4) ────────────────────────
    import('../particle_text_scene').then(({ initParticleTextScene }) => {
      const canvas = document.getElementById('particle-canvas')
      if (!canvas) return
      const worldEl = document.getElementById('particle-world')
      if (!worldEl) return
      initParticleTextScene(canvas).then(particleScene => {
        this._particles = particleScene
        ScrollTrigger.create({
          trigger:  worldEl,
          start:    'top top',
          end:      'bottom top',
          scrub:    1.5,
          onUpdate: self => {
            if (this._particles) this._particles.updateScroll(self.progress)
          },
        })
      })
    })
  }

  disconnect() {
    if (this._particles) { this._particles.destroy(); this._particles = null }

    window.removeEventListener("resize", this._onResize)
    window.removeEventListener("scroll", this._onScroll)
    document.body.style.removeProperty("--overlay-opacity")

    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())

    gsap.set([
      ".particle-world",
      ".s5",
    ], { clearProps: "all" })
  }

  // ── Overlay opacity — holds BASE through S1, rises to MAX after S1 ──
  _updateOverlay() {
    const BASE = 0.55
    const MAX  = 0.80
    const s1 = this.element.querySelector(".s1")
    const threshold = s1 ? s1.offsetHeight : window.innerHeight
    const progress = Math.max(0, Math.min(1, (window.scrollY - threshold) / 300))
    document.body.style.setProperty("--overlay-opacity", BASE + progress * (MAX - BASE))
  }

  // ── Viewport custom properties ────────────────────────────
  _setViewportVars() {
    const root = document.documentElement
    root.style.setProperty("--vp-h", `${window.innerHeight}px`)
    root.style.setProperty("--vp-w", `${window.innerWidth}px`)
  }
}
