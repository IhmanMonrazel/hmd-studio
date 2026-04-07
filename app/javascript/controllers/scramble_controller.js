import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&"

export default class extends Controller {
  connect() {
    this.hasPlayed = false

    // Parse childNodes to preserve <br> elements as line break markers
    this.segments = []
    this.element.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split text by spaces, keep each word
        node.textContent.trim().split(' ').filter(w => w.length > 0).forEach(word => {
          this.segments.push({ type: 'word', value: word })
        })
      } else if (node.nodeName === 'BR') {
        this.segments.push({ type: 'br' })
      }
    })

    // Rebuild innerHTML with spans per word and real <br> elements
    this.element.innerHTML = this.segments.map(seg => {
      if (seg.type === 'br') return '<br>'
      return `<span class="scramble-word" style="display:inline-block;white-space:nowrap">${seg.value}</span>`
    }).join(' ')

    // Remove the space before a <br> — it creates a gap before the line break
    this.element.innerHTML = this.element.innerHTML.replace(/ <br>/g, '<br>')

    this.wordSpans = Array.from(this.element.querySelectorAll('.scramble-word'))

    ScrollTrigger.create({
      trigger: this.element,
      start: 'top 85%',
      onEnter: () => this.play(),
      once: true
    })
  }

  play() {
    if (this.hasPlayed) return
    this.hasPlayed = true

    this.wordSpans.forEach((span, wordIndex) => {
      const original = span.textContent
      const chars = original.split("")
      let iteration = 0
      const totalIterations = chars.length * 3
      const delay = wordIndex * 80 // stagger each word slightly

      setTimeout(() => {
        const interval = setInterval(() => {
          span.textContent = chars.map((char, i) => {
            if (char === " ") return " "
            if (i < Math.floor(iteration / 3)) return chars[i]
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          }).join("").slice(0, chars.length)

          iteration++
          if (iteration >= totalIterations) {
            clearInterval(interval)
            span.textContent = original
          }
        }, 30)
      }, delay)
    })
  }

  disconnect() {
    ScrollTrigger.getAll()
      .filter(st => st.trigger === this.element)
      .forEach(st => st.kill())
  }
}
