import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["burger", "overlay"]

  connect() {
    document.addEventListener("turbo:before-visit", this.close.bind(this))

    // Burger spans always white — bypasses any CSS cascade issues
    this.element.querySelectorAll('.navbar__burger span').forEach(span => {
      span.style.background = '#ffffff'
      span.style.backgroundColor = '#ffffff'
    })
  }

  disconnect() {
    document.removeEventListener("turbo:before-visit", this.close.bind(this))
  }

  toggle() {
    const isOpen = this.element.classList.toggle("navbar--open")
    this.overlayTarget.classList.toggle("is-open", isOpen)
    document.body.style.overflow = isOpen ? "hidden" : ""

    if (isOpen) {
      // Inline style wins over any CSS rule (including .navbar--scrolled)
      this.element.style.background = '#000000'
      this.element.style.backgroundColor = '#000000'
    } else {
      // Remove inline styles — CSS scroll-based rules take back control
      this.element.style.background = ''
      this.element.style.backgroundColor = ''
    }
  }

  close() {
    this.element.classList.remove("navbar--open")
    this.overlayTarget.classList.remove("is-open")
    document.body.style.overflow = ""
    // Remove inline styles — CSS scroll-based rules take back control
    this.element.style.background = ''
    this.element.style.backgroundColor = ''
  }
}
