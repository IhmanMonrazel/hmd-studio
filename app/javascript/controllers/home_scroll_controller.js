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

    this._init()

    // ── S4 particle text scene ────────────────────────────────
    import('../particle_text_scene').then(({ initParticleTextScene }) => {
      const canvas = document.getElementById('particle-canvas')
      if (!canvas) return

      const sceneEl = this.element.querySelector('.s4-scene')
      if (!sceneEl) return

      initParticleTextScene(canvas).then(particleScene => {
        this._particles = particleScene

        ScrollTrigger.create({
          trigger:  sceneEl,
          start:    'top top',
          end:      'bottom top',
          scrub:    1.2,
          onUpdate: self => {
            if (this._particles) this._particles.updateScroll(self.progress)
          },
          onLeave: () => {
            const btn = document.getElementById('s4-btn')
            if (btn) {
              btn.classList.remove('s4-btn--visible')
              btn.style.opacity = '0'
              btn.style.pointerEvents = 'none'
            }
          },
          onLeaveBack: () => {
            const btn = document.getElementById('s4-btn')
            if (btn) {
              btn.classList.remove('s4-btn--visible')
              btn.style.opacity = '0'
              btn.style.pointerEvents = 'none'
            }
          },
          onEnterBack: () => {
            const btn = document.getElementById('s4-btn')
            if (btn) {
              btn.style.opacity = ''
              btn.style.pointerEvents = ''
            }
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
      ".s2", ".s2__content",
      ".s3", ".s3__item",
      ".s4-scene",
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

  // ── Init all transitions ───────────────────────────────────
  _init() {
    this._s2toS3()
    this._s3toS4()
  }

  // ── S2 → S3 ───────────────────────────────────────────────
  // s2 content parallaxes up as s3 enters.
  // s3 items stagger in from y = half their rendered height.
  _s2toS3() {
    const s2Content = this.element.querySelector(".s2__content")
    const s3        = this.element.querySelector(".s3")
    const s3Items   = this.element.querySelectorAll(".s3__item")
    if (!s3) return

    if (s2Content) {
      gsap.timeline({
        scrollTrigger: { trigger: s3, start: "top 85%", end: "top 0%", scrub: 1.5 },
      }).to(s2Content, { y: -80, ease: "none" })
    }

    if (s3Items.length) {
      const itemH = s3Items[0].offsetHeight || 80
      const yOff  = Math.min(Math.max(itemH * 0.5, 40), 80)

      s3Items.forEach((item, i) => {
        gsap.set(item, { opacity: 0, y: yOff })

        ScrollTrigger.create({
          trigger: s3,
          start:   "top 75%",
          once:    true,
          onEnter: () => {
            gsap.to(item, {
              opacity:  1,
              y:        0,
              duration: 0.9,
              ease:     "power3.out",
              delay:    i * 0.15,
            })
          },
        })
      })
    }
  }

  // ── S3 → S4 ───────────────────────────────────────────────
  // s3 parallaxes up as s4-scene enters.
  _s3toS4() {
    const s3 = this.element.querySelector(".s3")
    const s4 = this.element.querySelector(".s4-scene")
    if (!s4) return

    if (s3) {
      gsap.timeline({
        scrollTrigger: { trigger: s4, start: "top 85%", end: "top 0%", scrub: 1.5 },
      }).to(s3, { y: "-15%", ease: "none" })
    }
  }


}
