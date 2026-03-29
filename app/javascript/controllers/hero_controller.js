import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

export default class extends Controller {
  connect() {
    const reveals = this.element.querySelectorAll(".js-reveal")
    gsap.from(reveals, {
      y: 60,
      opacity: 0,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.15,
      delay: 0.1,
    })
  }
}
