import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["burger", "overlay"]

  connect() {
    document.addEventListener("turbo:before-visit", this.close.bind(this))
  }

  disconnect() {
    document.removeEventListener("turbo:before-visit", this.close.bind(this))
  }

  toggle() {
    const isOpen = this.element.classList.toggle("navbar--open")
    this.overlayTarget.classList.toggle("is-open", isOpen)
    document.body.style.overflow = isOpen ? "hidden" : ""
  }

  close() {
    this.element.classList.remove("navbar--open")
    this.overlayTarget.classList.remove("is-open")
    document.body.style.overflow = ""
  }
}
