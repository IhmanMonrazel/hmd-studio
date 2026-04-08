import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["burger"]

  connect() {
    this.overlay = document.querySelector('.navbar__overlay')
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
    this.overlay.classList.toggle("is-open", isOpen)
    document.body.style.overflow = isOpen ? "hidden" : ""

    if (isOpen) {
      // Freeze the scroll controller — remove all scroll-based classes
      this.element.classList.remove("navbar--frosted", "navbar--hidden", "navbar--scrolled")
      // Force black background via inline style so nothing can override it
      this.element.style.background = "#000000"
      this.element.style.backgroundColor = "#000000"
    } else {
      // Restore scroll controller when menu closes
      this.element.style.background = ""
      this.element.style.backgroundColor = ""
      this.element.style.removeProperty('background')
      this.element.style.removeProperty('background-color')
    }
  }

  close() {
    this.element.classList.remove("navbar--open")
    this.overlay.classList.remove("is-open")
    document.body.style.overflow = ""
    this.element.style.background = ""
    this.element.style.backgroundColor = ""
  }
}
