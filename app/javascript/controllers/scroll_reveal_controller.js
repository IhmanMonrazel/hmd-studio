import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default class extends Controller {
  connect() {
    this._initReveals()
    this._initStagger()
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(t => t.vars?.id?.startsWith("sr-"))
      .forEach(t => t.kill())
  }

  _initReveals() {
    const items = this.element.querySelectorAll(".js-reveal")
    items.forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          id: `sr-reveal-${i}-${Date.now()}`,
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0,
        immediateRender: false,
      })
    })
  }

  _initStagger() {
    const groups = this.element.querySelectorAll(".js-stagger")
    groups.forEach((group, gi) => {
      const children = group.children
      gsap.from(children, {
        scrollTrigger: {
          trigger: group,
          start: "top 85%",
          id: `sr-stagger-${gi}-${Date.now()}`,
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        immediateRender: false,
      })
    })
  }
}
