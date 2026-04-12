import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this._onResize = this._setViewportVars.bind(this)
    this._setViewportVars()
    window.addEventListener("resize", this._onResize, { passive: true })

    // Set initial body background — home page starts on black.
    // Restored to CSS default on disconnect so other pages are unaffected.
    gsap.set(document.body, { backgroundColor: "#000000" })

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
          scrub:    0.6,
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

    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())

    gsap.set([
      ".particle-world",
      ".s5",
    ], { clearProps: "all" })

    // Restore body background so other pages inherit their CSS-defined color.
    gsap.set(document.body, { clearProps: "backgroundColor" })
  }

  // ── Viewport custom properties ────────────────────────────
  _setViewportVars() {
    const root = document.documentElement
    root.style.setProperty("--vp-h", `${window.innerHeight}px`)
    root.style.setProperty("--vp-w", `${window.innerWidth}px`)
  }
}
