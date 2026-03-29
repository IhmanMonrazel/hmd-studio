import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this._lastY = window.scrollY
    this._onScroll = this._handleScroll.bind(this)
    window.addEventListener("scroll", this._onScroll, { passive: true })
  }

  disconnect() {
    window.removeEventListener("scroll", this._onScroll)
  }

  _handleScroll() {
    const y  = window.scrollY
    const el = this.element

    if (y < 50) {
      // En haut de page — fond transparent
      el.classList.remove("navbar--hidden", "navbar--frosted")
    } else if (y > this._lastY) {
      // Scroll vers le bas — masquer
      el.classList.add("navbar--hidden")
      el.classList.remove("navbar--frosted")
    } else {
      // Scroll vers le haut — réapparaître avec fond flouté
      el.classList.remove("navbar--hidden")
      el.classList.add("navbar--frosted")
    }

    this._lastY = y
  }
}
