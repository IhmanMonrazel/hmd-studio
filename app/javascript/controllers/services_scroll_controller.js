import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this.triggers = []
    this._setupEntranceAnimations()
    this._setupMagneticHover()
    this._setupCursor()
  }

  disconnect() {
    this.triggers.forEach(t => t.kill())
    this.triggers = []

    // Remove event listeners
    if (this._itemListeners) {
      this._itemListeners.forEach(({ el, enter, leave, move }) => {
        el.removeEventListener("mouseenter", enter)
        el.removeEventListener("mouseleave", leave)
        el.removeEventListener("mousemove", move)
      })
      this._itemListeners = []
    }

    if (this._s3MoveListener) {
      this.element.removeEventListener("mousemove", this._s3MoveListener)
      this._s3MoveListener = null
    }

    if (this._cursor && this._cursor.parentNode) {
      this._cursor.parentNode.removeChild(this._cursor)
      this._cursor = null
    }
  }

  // ── Entrance animations ──────────────────────────────────────
  _setupEntranceAnimations() {
    const items = Array.from(this.element.querySelectorAll(".s3__item"))

    items.forEach((item) => {
      const name = item.querySelector(".s3__name")
      const num  = item.querySelector(".s3__num")

      if (name) {
        const st = ScrollTrigger.create({
          trigger:       item,
          start:         "top 85%",
          toggleActions: "play none none none",
          once:          true,
          onEnter: () => {
            gsap.from(name, {
              clipPath: "inset(0 0 100% 0)",
              duration: 0.9,
              ease:     "power3.out",
            })
          },
        })
        this.triggers.push(st)
      }

      if (num) {
        const st = ScrollTrigger.create({
          trigger:       item,
          start:         "top 85%",
          toggleActions: "play none none none",
          once:          true,
          onEnter: () => {
            gsap.from(num, {
              clipPath: "inset(0 100% 0 0)",
              duration: 0.7,
              ease:     "power2.out",
              delay:    0.15,
            })
          },
        })
        this.triggers.push(st)
      }
    })
  }

  // ── Magnetic hover ───────────────────────────────────────────
  _setupMagneticHover() {
    this._itemListeners = []
    const items = Array.from(this.element.querySelectorAll(".s3__item"))

    items.forEach((el) => {
      const name = el.querySelector(".s3__name")

      const enter = () => el.classList.add("is-hovered")

      const leave = () => {
        el.classList.remove("is-hovered")
        if (name) name.style.transform = "translate(0px, 0px)"
      }

      const move = (e) => {
        if (!name) return
        const rect = el.getBoundingClientRect()
        const relX = (e.clientX - rect.left)  / rect.width  - 0.5
        const relY = (e.clientY - rect.top)   / rect.height - 0.5
        name.style.transform = `translate(${relX * 20}px, ${relY * 10}px)`
      }

      el.addEventListener("mouseenter", enter)
      el.addEventListener("mouseleave", leave)
      el.addEventListener("mousemove",  move)

      this._itemListeners.push({ el, enter, leave, move })
    })
  }

  // ── Custom cursor ────────────────────────────────────────────
  _setupCursor() {
    const cursor = document.createElement("div")
    cursor.id = "s3-cursor"
    document.body.appendChild(cursor)
    this._cursor = cursor

    let cursorX = 0
    let cursorY = 0
    let targetX = 0
    let targetY = 0
    let rafId   = null

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      cursorX = lerp(cursorX, targetX, 0.12)
      cursorY = lerp(cursorY, targetY, 0.12)
      cursor.style.left = cursorX + "px"
      cursor.style.top  = cursorY + "px"
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    this._s3MoveListener = (e) => {
      targetX = e.clientX
      targetY = e.clientY
    }
    this.element.addEventListener("mousemove", this._s3MoveListener)

    // Show/hide cursor when entering/leaving the s3 section
    this.element.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1"
    })
    this.element.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0"
      cursor.classList.remove("expanded")
    })

    // Expand on item hover
    if (this._itemListeners) {
      this._itemListeners.forEach(({ el }) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("expanded"))
        el.addEventListener("mouseleave", () => cursor.classList.remove("expanded"))
      })
    }

    // Store rafId for cleanup
    this._cursorRaf = rafId
    this._stopCursorRaf = () => cancelAnimationFrame(this._cursorRaf)

    // Override disconnect to also cancel RAF
    const origDisconnect = this.disconnect.bind(this)
    this.disconnect = () => {
      cancelAnimationFrame(this._cursorRaf)
      origDisconnect()
    }
  }
}
