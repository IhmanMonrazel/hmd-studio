import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this._buildSeq()
    this._init()
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())
    gsap.set([
      ".hero-video", ".s2", ".s2__title", ".s2__image-wrap",
      ".s3__cell", ".s3__grid", ".s4__col", ".s5__image",
      ".s6 .s6__title", ".s6__block", ".s7__title", ".s6",
    ], { clearProps: "all" })
    this._teardownSeq()
  }

  // ── DOM : wrapper hero + S2 ──────────────────────────────
  _buildSeq() {
    const hero = this.element.querySelector(".hero-video")
    const s2   = this.element.querySelector(".s2")
    if (!hero || !s2) return

    const seq = document.createElement("div")
    seq.className = "hero-s2-sequence"
    this.element.insertBefore(seq, hero)
    seq.appendChild(hero)
    seq.appendChild(s2)
    this._seq = seq
  }

  _teardownSeq() {
    if (!this._seq) return
    const parent = this._seq.parentNode
    while (this._seq.firstChild) parent.insertBefore(this._seq.firstChild, this._seq)
    this._seq.remove()
    this._seq = null
  }

  // ── Init ─────────────────────────────────────────────────
  _init() {
    this._heroToS2()
    this._s2toS3()
    this._s3toS4()
    this._s4toS5()
    this._s5toS6()
    this._s6toS7()
  }

  // ── HERO → S2 ────────────────────────────────────────────
  _heroToS2() {
    const seq  = this._seq
    const hero = seq?.querySelector(".hero-video")
    const s2   = seq?.querySelector(".s2")
    if (!seq || !hero || !s2) return

    hero.style.position = "sticky"
    hero.style.top      = "0"
    hero.style.zIndex   = "1"

    gsap.set(s2, { y: "100vh", position: "relative", zIndex: 2 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: seq,
        start:   "top top",
        end:     "bottom bottom",
        scrub:   1.5,
      }
    })

    const media = hero.querySelector(".hero-video__media")
    if (media) tl.to(media, { scale: 0.85, ease: "none" }, 0)
    tl.to(hero, { opacity: 0, ease: "none" }, 0)
    tl.to(s2,   { y: "0vh",  ease: "none" }, 0)
  }

  // ── S2 → S3 ──────────────────────────────────────────────
  _s2toS3() {
    const s3      = this.element.querySelector(".s3")
    const s2Title = this.element.querySelector(".s2__title")
    const s2Image = this.element.querySelector(".s2__image-wrap")
    const s3Cells = this.element.querySelectorAll(".s3__cell")
    if (!s3) return

    if (s2Title) {
      gsap.timeline({
        scrollTrigger: { trigger: s3, start: "top 85%", end: "top 0%", scrub: 1.5 }
      }).to(s2Title, { y: -60, ease: "none" })
    }

    if (s2Image) {
      gsap.timeline({
        scrollTrigger: { trigger: s3, start: "top 85%", end: "top 0%", scrub: 1.5 }
      }).to(s2Image, { y: -80, ease: "none" })
    }

    if (s3Cells.length) {
      gsap.set(s3Cells, { scaleY: 0, transformOrigin: "bottom center" })
      gsap.timeline({
        scrollTrigger: { trigger: s3, start: "top 85%", end: "center 30%", scrub: 1.5 }
      }).to(s3Cells, { scaleY: 1, ease: "none", stagger: 0.1 })
    }
  }

  // ── S3 → S4 ──────────────────────────────────────────────
  _s3toS4() {
    const s3Grid = this.element.querySelector(".s3__grid")
    const s4     = this.element.querySelector(".s4")
    const s4Cols = this.element.querySelectorAll(".s4__col")
    if (!s4) return

    if (s3Grid) {
      gsap.timeline({
        scrollTrigger: { trigger: s4, start: "top 85%", end: "top 0%", scrub: 1.5 }
      }).to(s3Grid, { y: "-20%", ease: "none" })
    }

    if (s4Cols.length >= 3) {
      gsap.set(s4Cols[0], { x: -100, opacity: 0 })
      gsap.set(s4Cols[1], { y: 40,   opacity: 0 })
      gsap.set(s4Cols[2], { x: 100,  opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: s4, start: "top 80%", end: "top 10%", scrub: 1.5 }
      })
      tl.to(s4Cols[0], { x: 0, opacity: 1, ease: "none" }, 0)
      tl.to(s4Cols[1], { y: 0, opacity: 1, ease: "none" }, 0.05)
      tl.to(s4Cols[2], { x: 0, opacity: 1, ease: "none" }, 0.1)
    }
  }

  // ── S4 → S5 ──────────────────────────────────────────────
  _s4toS5() {
    const s5      = this.element.querySelector(".s5")
    const s5Image = this.element.querySelector(".s5__image")
    if (!s5 || !s5Image) return

    gsap.set(s5Image, { scale: 1.2 })
    gsap.timeline({
      scrollTrigger: { trigger: s5, start: "top 90%", end: "top 10%", scrub: 1.5 }
    }).to(s5Image, { scale: 1, ease: "none" })
  }

  // ── S5 → S6 ──────────────────────────────────────────────
  _s5toS6() {
    const s6      = this.element.querySelector(".s6")
    const s5Image = this.element.querySelector(".s5__image")
    const s6Title = this.element.querySelector(".s6 .s6__title")
    const s6Blk   = this.element.querySelectorAll(".s6__block")
    if (!s6) return

    if (s5Image) {
      gsap.timeline({
        scrollTrigger: { trigger: s6, start: "top 80%", end: "top 0%", scrub: 1.5 }
      }).to(s5Image, { y: "-15%", ease: "none" })
    }

    if (s6Title) {
      gsap.set(s6Title, { y: 60, opacity: 0 })
      gsap.timeline({
        scrollTrigger: { trigger: s6, start: "top 75%", end: "top 15%", scrub: 1.5 }
      }).to(s6Title, { y: 0, opacity: 1, ease: "none" })
    }

    if (s6Blk.length) {
      gsap.set(s6Blk, { x: 60, opacity: 0 })
      gsap.timeline({
        scrollTrigger: { trigger: s6, start: "top 60%", end: "bottom 60%", scrub: 1.5 }
      }).to(s6Blk, { x: 0, opacity: 1, ease: "none", stagger: 0.15 })
    }
  }

  // ── S6 → S7 ──────────────────────────────────────────────
  _s6toS7() {
    const s7      = this.element.querySelector(".s7")
    const s7Title = this.element.querySelector(".s7__title")
    const s6      = this.element.querySelector(".s6")
    if (!s7) return

    if (s7Title) {
      gsap.set(s7Title, { scale: 1.5, opacity: 0, transformOrigin: "left center" })
      gsap.timeline({
        scrollTrigger: { trigger: s7, start: "top 80%", end: "top 15%", scrub: 1.5 }
      }).to(s7Title, { scale: 1, opacity: 1, ease: "none" })
    }

    if (s6) {
      gsap.timeline({
        scrollTrigger: { trigger: s7, start: "top 80%", end: "top 0%", scrub: 1.5 }
      }).to(s6, { y: "-10%", ease: "none" })
    }
  }
}
