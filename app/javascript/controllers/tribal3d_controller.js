import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { size: { type: Number, default: 360 }, cameraZ: { type: Number, default: 5.5 } }

  async connect() {
    const size    = this.sizeValue
    const cameraZ = this.cameraZValue

    this._wrap = document.createElement("div")
    Object.assign(this._wrap.style, {
      position:      "absolute",
      bottom:        "40px",
      right:         "40px",
      width:         size + "px",
      height:        size + "px",
      pointerEvents: "none",
      opacity:       "0.85",
      zIndex:        "2",
    })

    this._canvas = document.createElement("canvas")
    this._wrap.appendChild(this._canvas)
    this.element.appendChild(this._wrap)

    const { initTribal3D } = await import("../about_tribal_3d")
    this._destroyThree = initTribal3D(this._canvas, { size, cameraZ })
  }

  disconnect() {
    if (this._destroyThree) this._destroyThree()
    if (this._wrap)         this._wrap.remove()
  }
}
