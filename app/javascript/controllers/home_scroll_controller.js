import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    // Set viewport custom properties for use in CSS and JS calculations
    this._onResize = this._setViewportVars.bind(this)
    this._setViewportVars()
    window.addEventListener("resize", this._onResize, { passive: true })

    this._buildSeq()
    this._init()

    console.log("[home-scroll] initialized", {
      vw: window.innerWidth,
      vh: window.innerHeight,
    })
  }

  disconnect() {
    window.removeEventListener("resize", this._onResize)

    ScrollTrigger.getAll()
      .filter(t => t.trigger && this.element.contains(t.trigger))
      .forEach(t => t.kill())

    gsap.set([
      ".s1", ".s1__media",
      ".s2", ".s2__content",
      ".s3", ".s3__item",
      ".s4", ".s4__image",
      ".s5", ".s5__block",
      ".s6", ".s6__title",
    ], { clearProps: "all" })

    this._teardownSeq()
  }

  // ── Viewport custom properties ────────────────────────────
  // Sets --vp-h and --vp-w so CSS and JS share the same runtime values
  _setViewportVars() {
    const root = document.documentElement
    root.style.setProperty("--vp-h", `${window.innerHeight}px`)
    root.style.setProperty("--vp-w", `${window.innerWidth}px`)
  }

  // ── DOM: wrap s1 + s2 in sticky sequence ──────────────────
  _buildSeq() {
    const s1 = this.element.querySelector(".s1")
    const s2 = this.element.querySelector(".s2")
    if (!s1 || !s2) return

    const seq = document.createElement("div")
    seq.className = "s1-s2-sequence"
    this.element.insertBefore(seq, s1)
    seq.appendChild(s1)
    seq.appendChild(s2)
    this._seq = seq

    console.log("[home-scroll] s1-s2-sequence built — height: 300vh")
  }

  _teardownSeq() {
    if (!this._seq) return
    const parent = this._seq.parentNode
    while (this._seq.firstChild) parent.insertBefore(this._seq.firstChild, this._seq)
    this._seq.remove()
    this._seq = null
  }

  // ── Init all transitions ───────────────────────────────────
  _init() {
    this._s1toS2()
    this._s2toS3()
    this._s3toS4()
    this._s4toS5()
    this._s5toS6()
  }

  // ── S1 → S2 ───────────────────────────────────────────────
  // Hero fades + scales down; s2 slides up from 100vh.
  // Scale end: 0.88 — derived from s2 occupying 100dvh,
  // giving the video a slight depth recession without distortion.
  _s1toS2() {
    const seq = this._seq
    const s1  = seq?.querySelector(".s1")
    const s2  = seq?.querySelector(".s2")
    if (!seq || !s1 || !s2) return

    s1.style.position = "sticky"
    s1.style.top      = "0"
    s1.style.zIndex   = "1"

    gsap.set(s2, { y: "100vh", position: "relative", zIndex: 2 })

    // Scale end: ratio = s2 min-height (100dvh) / viewport height = 1.
    // A 12% shrink (0.88) reads as natural depth recession.
    const scaleEnd = 0.88
    console.log("[home-scroll] s1→s2 — video scale end:", scaleEnd)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: seq,
        start:   "top top",
        end:     "bottom bottom",
        scrub:   1.5,
      },
    })

    const media = s1.querySelector(".s1__media")
    if (media) tl.to(media, { scale: scaleEnd, ease: "none" }, 0)
    tl.to(s1, { opacity: 0, ease: "none" }, 0)
    tl.to(s2, { y: "0vh",  ease: "none" }, 0)
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
      // y offset = half the item's rendered height, clamped to [40, 80]
      const itemH  = s3Items[0].offsetHeight || 80
      const yOff   = Math.min(Math.max(itemH * 0.5, 40), 80)
      console.log("[home-scroll] s2→s3 — item height:", itemH, "y offset:", yOff)

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
  // s3 parallaxes up. s4 image zooms from 1.12 → 1.
  // 1.12 chosen so the zoom covers the full section height
  // delta without visible edge bleed at any viewport ratio.
  _s3toS4() {
    const s3      = this.element.querySelector(".s3")
    const s4      = this.element.querySelector(".s4")
    const s4Image = this.element.querySelector(".s4__image")
    if (!s4) return

    if (s3) {
      gsap.timeline({
        scrollTrigger: { trigger: s4, start: "top 85%", end: "top 0%", scrub: 1.5 },
      }).to(s3, { y: "-15%", ease: "none" })
    }

    if (s4Image) {
      const initScale = 1.12
      console.log("[home-scroll] s3→s4 — s4 image initial scale:", initScale)

      gsap.set(s4Image, { scale: initScale })
      gsap.timeline({
        scrollTrigger: { trigger: s4, start: "top 90%", end: "top 10%", scrub: 1.5 },
      }).to(s4Image, { scale: 1, ease: "none" })
    }
  }

  // ── S4 → S5 ───────────────────────────────────────────────
  // s4 parallaxes up. s5 blocks slide in:
  //   block 1 from left  (x = -30% of block width, clamped)
  //   block 2 from below (y = 40% of block height, clamped)
  //   block 3 from right (x = +30% of block width, clamped)
  _s4toS5() {
    const s4    = this.element.querySelector(".s4")
    const s5    = this.element.querySelector(".s5")
    const s5Blk = this.element.querySelectorAll(".s5__block")
    if (!s5 || !s5Blk.length) return

    if (s4) {
      gsap.timeline({
        scrollTrigger: { trigger: s5, start: "top 85%", end: "top 0%", scrub: 1.5 },
      }).to(s4, { y: "-10%", ease: "none" })
    }

    const blkW = s5Blk[0]?.offsetWidth  || 280
    const blkH = s5Blk[1]?.offsetHeight || 160
    const xOff = Math.min(Math.round(blkW * 0.3), 100)
    const yOff = Math.min(Math.round(blkH * 0.4), 80)
    console.log("[home-scroll] s4→s5 — block dims:", { blkW, blkH }, "offsets:", { xOff, yOff })

    const offsets = [
      { x: -xOff, y: 0    },
      { x: 0,     y: yOff },
      { x:  xOff, y: 0    },
    ]

    s5Blk.forEach((block, i) => {
      const { x, y } = offsets[i] ?? { x: 0, y: 40 }
      gsap.set(block, { opacity: 0, x, y })

      ScrollTrigger.create({
        trigger: s5,
        start:   "top 70%",
        once:    true,
        onEnter: () => {
          gsap.to(block, {
            opacity:  1,
            x:        0,
            y:        0,
            duration: 0.9,
            ease:     "power3.out",
            delay:    i * 0.15,
          })
        },
      })
    })
  }

  // ── S5 → S6 ───────────────────────────────────────────────
  // s5 fades out. s6 title scales from 1.35 → 1.
  // 1.35 derived from title clamp max (11rem ≈ 176px at 1440px vw);
  // starting at 238px reads as a confident zoom-in settle.
  _s5toS6() {
    const s5      = this.element.querySelector(".s5")
    const s6      = this.element.querySelector(".s6")
    const s6Title = this.element.querySelector(".s6__title")
    if (!s6) return

    if (s5) {
      gsap.timeline({
        scrollTrigger: { trigger: s6, start: "top 85%", end: "top 0%", scrub: 1.5 },
      }).to(s5, { opacity: 0, ease: "none" })
    }

    if (s6Title) {
      const initScale = 1.35
      console.log("[home-scroll] s5→s6 — s6 title initial scale:", initScale)

      gsap.set(s6Title, { scale: initScale, opacity: 0, transformOrigin: "left center" })
      gsap.timeline({
        scrollTrigger: { trigger: s6, start: "top 80%", end: "top 15%", scrub: 1.5 },
      }).to(s6Title, { scale: 1, opacity: 1, ease: "none" })
    }
  }
}
