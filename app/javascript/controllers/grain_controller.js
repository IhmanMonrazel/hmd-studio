import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'hmd-grain'
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99997;
      opacity: 0.09;
      mix-blend-mode: screen;
    `
    document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.rafId = null
    this.resize()
    this.onResize = this.resize.bind(this)
    window.addEventListener('resize', this.onResize)
    this.animate()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  animate() {
    const { width, height } = this.canvas
    const imageData = this.ctx.createImageData(width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }

    this.ctx.putImageData(imageData, 0, 0)
    this.rafId = requestAnimationFrame(this.animate.bind(this))
  }

  disconnect() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.onResize)
    const el = document.getElementById('hmd-grain')
    if (el) el.remove()
  }
}
