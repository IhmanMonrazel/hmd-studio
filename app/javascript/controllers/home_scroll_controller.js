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

    // ── S4 cloud video — scroll-scrubbed ──────────────────────
    // gsap.to(video, { currentTime }) is the official GSAP pattern
    // for scroll-scrubbed video. More reliable than manual onUpdate.
    const cloudVideo = document.querySelector(".s4__cloud-video")
    console.log("[debug] cloudVideo element:", cloudVideo)
    console.log("[debug] cloudVideo readyState:", cloudVideo?.readyState)
    console.log("[debug] cloudVideo src:", cloudVideo?.currentSrc)
    if (cloudVideo) {
      cloudVideo.pause()
      cloudVideo.currentTime = 0

      const initCloudScrub = () => {
        console.log("[debug] initCloudScrub fired, duration:", cloudVideo.duration)
        cloudVideo.currentTime = 0
        cloudVideo.pause()
        const duration = cloudVideo.duration
        if (!duration || isNaN(duration)) {
          console.warn("[home-scroll] cloud video: invalid duration", duration)
          return
        }
        console.log("[home-scroll] cloud video ready, duration:", duration)

        gsap.to(cloudVideo, {
          currentTime: duration,
          ease: "none",
          scrollTrigger: {
            trigger:         ".s4",
            start:           "top 50%",
            end:             "top -20%",
            scrub:           0.2,
            immediateRender: false,
            onEnter:  () => console.log("[home-scroll] s4 entered"),
            onUpdate: (self) => {
              console.log("[debug] onUpdate progress:", self.progress.toFixed(3), "currentTime:", cloudVideo.currentTime.toFixed(3))
              console.log("[home-scroll] s4 progress:", self.progress.toFixed(2))
            },
          },
        })
        console.log("[debug] ScrollTrigger created for cloud video")

        // Pin frame 0 until scroll begins — prevents last-frame flash.
        cloudVideo.currentTime = 0
        console.log("[home-scroll] cloud video ScrollTrigger created")
      }

      if (cloudVideo.readyState >= 1) {
        initCloudScrub()
      } else {
        cloudVideo.addEventListener("loadedmetadata", initCloudScrub, { once: true })
      }
    }

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
      ".s2", ".s2__content",
      ".s3", ".s3__item",
      ".s4", ".s4__cloud-wrap", ".s4__cloud-video",
      ".s5", ".s5__block",
      ".s6", ".s6__title",
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
    this._bodyBgTriggers()
    this._s2toS3()
    this._s3toS4()
    this._s4toS5()
    this._s5toS6()
  }

  // ── Body background color — scroll-linked transitions ─────
  // One ScrollTrigger per section: no pin, no scrub.
  // onEnter fires scrolling down, onEnterBack fires scrolling up.
  // Default start "top 60%". s4 uses "top 80%" so body turns black
  // before the video container scrolls into view.
  _bodyBgTriggers() {
    const sections = [
      { selector: ".s1", color: "#000000" },
      { selector: ".s2", color: "#000000" },
      { selector: ".s3", color: "#1a1a1a" },
      { selector: ".s4", color: "#000000", start: "top 80%" },
      { selector: ".s5", color: "#cc0000" },
      { selector: ".s6", color: "#000000" },
    ]

    sections.forEach(({ selector, color, start = "top 60%" }) => {
      const el = this.element.querySelector(selector)
      if (!el) return

      ScrollTrigger.create({
        trigger: el,
        start,
        end:     "bottom 40%",
        onEnter: () => {
          gsap.to(document.body, { backgroundColor: color, duration: 0.8, ease: "power2.inOut" })
          console.log(`[home-scroll] body bg → ${color} (${selector})`)
        },
        onEnterBack: () => {
          gsap.to(document.body, { backgroundColor: color, duration: 0.8, ease: "power2.inOut" })
          console.log(`[home-scroll] body bg ← ${color} (${selector})`)
        },
      })
    })
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
  // s3 parallaxes up. s4 fades in once on enter.
  _s3toS4() {
    const s3 = this.element.querySelector(".s3")
    const s4 = this.element.querySelector(".s4")
    if (!s4) return

    if (s3) {
      gsap.timeline({
        scrollTrigger: { trigger: s4, start: "top 85%", end: "top 0%", scrub: 1.5 },
      }).to(s3, { y: "-15%", ease: "none" })
    }

    // Fade s4 in from opacity 0 when it enters the viewport — fires once.
    gsap.set(s4, { opacity: 0 })
    ScrollTrigger.create({
      trigger: s4,
      start:   "top 80%",
      once:    true,
      onEnter: () => {
        gsap.to(s4, { opacity: 1, duration: 1.2, ease: "power2.out" })
      },
    })
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
