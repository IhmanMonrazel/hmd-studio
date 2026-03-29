import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this._init()
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())
  }

  _init() {
    // ── S2 : titre depuis la gauche, image depuis la droite ──
    const s2Title = this.element.querySelector(".s2__title")
    const s2Image = this.element.querySelector(".s2__image-wrap")
    if (s2Title) {
      gsap.from(s2Title, {
        x: -40, opacity: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: s2Title, start: "top 85%", once: true }
      })
    }
    if (s2Image) {
      gsap.from(s2Image, {
        x: 40, opacity: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: s2Image, start: "top 85%", once: true }
      })
    }

    // ── S3 : cellules en stagger (fade) ──────────────────────
    ScrollTrigger.batch(this.element.querySelectorAll(".s3__cell"), {
      start: "top 85%",
      once: true,
      onEnter: batch => gsap.from(batch, {
        y: 40, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.15
      })
    })

    // ── S3 : effet 3D rotateX au scroll (scrub) ───────────────
    const s3Grid  = this.element.querySelector(".s3__grid")
    const s3Cells = this.element.querySelectorAll(".s3__cell")
    if (s3Grid && s3Cells.length) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: s3Grid,
          start:   "top 90%",
          end:     "top 20%",
          scrub:   true,
        }
      })
      tl.from(s3Cells, {
        rotateX: 8,
        ease:    "none",
        stagger: 0.05,
      })
    }

    // ── S4 : colonnes en stagger ──────────────────────────────
    ScrollTrigger.batch(this.element.querySelectorAll(".s4__col"), {
      start: "top 85%",
      once: true,
      onEnter: batch => gsap.from(batch, {
        y: 30, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.2
      })
    })

    // ── S5 : image scale + fade ───────────────────────────────
    const s5Image = this.element.querySelector(".s5__image")
    if (s5Image) {
      gsap.from(s5Image, {
        scale: 1.03, opacity: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: s5Image, start: "top 85%", once: true }
      })
    }

    // ── S6 : titre puis blocs ─────────────────────────────────
    const s6Title = this.element.querySelector(".s6 .s6__title")
    if (s6Title) {
      gsap.from(s6Title, {
        y: 50, opacity: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: s6Title, start: "top 85%", once: true }
      })
    }
    ScrollTrigger.batch(this.element.querySelectorAll(".s6__block"), {
      start: "top 85%",
      once: true,
      onEnter: batch => gsap.from(batch, {
        y: 30, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.2
      })
    })

    // ── S7 : titre mot par mot en stagger ─────────────────────
    const s7Title = this.element.querySelector(".s7__title")
    if (s7Title) {
      const words = s7Title.textContent.trim().split(" ")
      s7Title.innerHTML = words
        .map(w => `<span class="s7__word" style="display:inline-block;will-change:transform,opacity">${w}</span>`)
        .join(" ")
      gsap.from(s7Title.querySelectorAll(".s7__word"), {
        y: 20, opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.1,
        scrollTrigger: { trigger: s7Title, start: "top 85%", once: true }
      })
    }
  }
}
