import { Controller } from "@hotwired/stimulus"
import * as THREE from "three"

export default class extends Controller {
  connect() {
    this.rafId = null
    this.clock = new THREE.Clock()
    this.mouse = { x: 0, y: 0 }
    this.targetRotY = 0
    this.currentRotY = 0

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    this.element.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    this.camera.position.set(0, 0, 5.5)

    this.buildBust()
    this.buildScanLine()
    this.buildTrackingPoints()
    this.buildParticles()

    this.onMouseMove = (e) => {
      const r = this.element.getBoundingClientRect()
      this.mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      this.mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    this.onMouseLeave = () => { this.mouse.x = 0; this.mouse.y = 0 }
    this.element.addEventListener('mousemove', this.onMouseMove)
    this.element.addEventListener('mouseleave', this.onMouseLeave)

    this.resizeObserver = new ResizeObserver(() => this.handleResize())
    this.resizeObserver.observe(this.element)
    this.handleResize()

    this.animate()
  }

  disconnect() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    if (this.resizeObserver) this.resizeObserver.disconnect()
    this.element.removeEventListener('mousemove', this.onMouseMove)
    this.element.removeEventListener('mouseleave', this.onMouseLeave)
    this.renderer.dispose()
  }

  handleResize() {
    const w = this.element.offsetWidth
    const h = this.element.offsetHeight
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  buildBust() {
    // --- HEAD: high-res sphere deformed to human skull shape ---
    const geo = new THREE.SphereGeometry(1, 48, 36)
    const pos = geo.attributes.position

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i)
      let y = pos.getY(i)
      let z = pos.getZ(i)

      // Normalize to get spherical coords
      const r = Math.sqrt(x*x + y*y + z*z)
      const theta = Math.acos(y / r)   // polar angle from top
      const phi = Math.atan2(z, x)     // azimuthal

      // Skull shape deformations
      // 1. Flatten back of head
      const backFlatten = z < 0 ? 1.0 - Math.abs(z) * 0.18 : 1.0
      // 2. Widen at cheeks (theta ~= PI*0.55)
      const cheekBulge = 1.0 + Math.exp(-Math.pow(theta - Math.PI*0.55, 2) * 18) * 0.12
      // 3. Narrow at temples
      const templePinch = Math.abs(phi) > Math.PI*0.35 && Math.abs(phi) < Math.PI*0.65
        ? 1.0 - Math.exp(-Math.pow(Math.abs(x) - 0.85, 2) * 12) * 0.08
        : 1.0
      // 4. Jaw narrowing (bottom of head)
      const jawNarrow = theta > Math.PI*0.72
        ? 1.0 - (theta - Math.PI*0.72) * 0.55
        : 1.0
      // 5. Chin protrusion
      const chinProtrude = theta > Math.PI*0.78 && Math.abs(phi) < 0.4
        ? 1.0 + Math.exp(-Math.pow(theta - Math.PI*0.85, 2)*30) * 0.12
        : 1.0
      // 6. Forehead slight flattening
      const foreheadFlat = theta < Math.PI*0.28 && z > 0
        ? 1.0 - (Math.PI*0.28 - theta) * 0.25
        : 1.0
      // 7. Nose area protrusion (front, mid face)
      const noseProtrude = z > 0.6 && theta > Math.PI*0.4 && theta < Math.PI*0.62
        && Math.abs(x) < 0.22
        ? 1.0 + Math.exp(-Math.pow(theta - Math.PI*0.51, 2)*40) * 0.18
          * Math.exp(-x*x*20) : 1.0
      // 8. Eye socket indentations
      const eyeSocketL = Math.exp(-(Math.pow(x+0.32,2)+Math.pow(y-0.12,2))*22
        +Math.pow(z-0.75,2)*8) * 0.09
      const eyeSocketR = Math.exp(-(Math.pow(x-0.32,2)+Math.pow(y-0.12,2))*22
        +Math.pow(z-0.75,2)*8) * 0.09
      // 9. Brow ridge
      const browRidge = z > 0.55 && theta > Math.PI*0.32 && theta < Math.PI*0.42
        && Math.abs(x) < 0.55
        ? Math.exp(-Math.pow(theta - Math.PI*0.37, 2)*60) * 0.07 : 0.0
      // 10. Lip area slight protrusion
      const lipProtrude = z > 0.55 && theta > Math.PI*0.63 && theta < Math.PI*0.73
        && Math.abs(x) < 0.28
        ? Math.exp(-Math.pow(theta - Math.PI*0.68, 2)*50) * 0.08 : 0.0

      const scale = backFlatten * cheekBulge * templePinch * jawNarrow
        * chinProtrude * foreheadFlat * noseProtrude
        - eyeSocketL - eyeSocketR + browRidge + lipProtrude

      // Vertical stretch: head taller than wide
      x *= scale * 0.88
      y *= scale * 1.12
      z *= scale

      pos.setXYZ(i, x, y, z)
    }
    geo.computeVertexNormals()

    // Wireframe
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xCC0000,
      transparent: true,
      opacity: 0.55,
    })
    const wireGeo = new THREE.WireframeGeometry(geo)
    this.headWire = new THREE.LineSegments(wireGeo, wireMat)

    // Points on surface
    const pointsMat = new THREE.PointsMaterial({
      color: 0xFF3300,
      size: 0.022,
      transparent: true,
      opacity: 0.7,
    })
    this.headPoints = new THREE.Points(geo, pointsMat)

    // Group for head
    this.headGroup = new THREE.Group()
    this.headGroup.add(this.headWire)
    this.headGroup.add(this.headPoints)
    this.headGroup.position.y = 0.3

    // --- NECK ---
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.55, 16, 3, true)
    const neckWireGeo = new THREE.WireframeGeometry(neckGeo)
    const neckWire = new THREE.LineSegments(neckWireGeo, new THREE.LineBasicMaterial({
      color: 0xAA0000, transparent: true, opacity: 0.35
    }))
    neckWire.position.y = -0.95
    this.headGroup.add(neckWire)

    // --- SHOULDERS ---
    const shoulderPts = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      const x = (t - 0.5) * 3.2
      const y = -1.25 + Math.sin(t * Math.PI) * 0.3 - Math.abs(x) * 0.05
      const zOff = Math.cos(t * Math.PI) * 0.3
      shoulderPts.push(new THREE.Vector3(x, y, zOff))
    }
    // Front shoulder curve
    const shoulderCurve = new THREE.CatmullRomCurve3(shoulderPts)
    const shoulderGeo = new THREE.BufferGeometry().setFromPoints(
      shoulderCurve.getPoints(80)
    )
    const shoulderMat = new THREE.LineBasicMaterial({
      color: 0xAA0000, transparent: true, opacity: 0.4
    })
    this.headGroup.add(new THREE.Line(shoulderGeo, shoulderMat))

    // Chest vertical lines
    for (let i = -3; i <= 3; i++) {
      const chestGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * 0.28, -1.18, 0.1 - Math.abs(i)*0.06),
        new THREE.Vector3(i * 0.32, -1.55, 0.05 - Math.abs(i)*0.08),
      ])
      this.headGroup.add(new THREE.Line(chestGeo,
        new THREE.LineBasicMaterial({ color: 0x880000, transparent: true, opacity: 0.25 })
      ))
    }

    this.bustGroup = new THREE.Group()
    this.bustGroup.add(this.headGroup)
    this.scene.add(this.bustGroup)
  }

  buildScanLine() {
    // Horizontal scan plane that moves up/down through the head
    const scanGeo = new THREE.PlaneGeometry(2.2, 0.012)
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0xFF2200,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.scanPlane = new THREE.Mesh(scanGeo, scanMat)
    this.scanPlane.position.z = 0.0
    this.headGroup.add(this.scanPlane)

    // Scan glow trail
    const trailGeo = new THREE.PlaneGeometry(2.0, 0.08)
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0xCC0000,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    this.scanTrail = new THREE.Mesh(trailGeo, trailMat)
    this.headGroup.add(this.scanTrail)

    this.scanY = 1.2
    this.scanDir = -1
  }

  buildTrackingPoints() {
    // Feature tracking markers (cross + bracket overlays via sprites)
    this.trackMarkers = []
    const features = [
      { x: -0.30, y:  0.14, z: 0.72, label: 'EYE_L' },
      { x:  0.30, y:  0.14, z: 0.72, label: 'EYE_R' },
      { x:  0.00, y: -0.02, z: 0.82, label: 'NOSE'  },
      { x:  0.00, y: -0.26, z: 0.72, label: 'MOUTH' },
      { x: -0.60, y:  0.05, z: 0.52, label: 'CHK_L' },
      { x:  0.60, y:  0.05, z: 0.52, label: 'CHK_R' },
      { x:  0.00, y:  0.34, z: 0.70, label: 'BROW'  },
      { x:  0.00, y: -0.50, z: 0.62, label: 'CHIN'  },
    ]

    features.forEach((f, idx) => {
      // Ring marker
      const ringGeo = new THREE.RingGeometry(0.025, 0.035, 12)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xFF4400, transparent: true, opacity: 0.0,
        side: THREE.DoubleSide, depthWrite: false
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.set(f.x, f.y, f.z + 0.3)
      ring.userData = { phase: idx * 0.8, label: f.label, baseZ: f.z }
      this.headGroup.add(ring)
      this.trackMarkers.push(ring)
    })
  }

  buildParticles() {
    // Floating ambient particles around bust
    const count = 120
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 3.5
      positions[i*3+1] = (Math.random() - 0.5) * 3.0
      positions[i*3+2] = (Math.random() - 0.5) * 2.0
    }
    const partGeo = new THREE.BufferGeometry()
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const partMat = new THREE.PointsMaterial({
      color: 0xCC0000, size: 0.015,
      transparent: true, opacity: 0.35
    })
    this.particles = new THREE.Points(partGeo, partMat)
    this.scene.add(this.particles)
    this.particlePositions = positions
    this.particleCount = count
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate())
    const t = this.clock.getElapsedTime()

    // Levitation
    this.bustGroup.position.y = Math.sin(t * 0.55) * 0.06
      + Math.sin(t * 0.83) * 0.03

    // Slow auto-rotation + mouse influence
    this.targetRotY = this.mouse.x * 0.25
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.04
    this.bustGroup.rotation.y = t * 0.012 + this.currentRotY
    this.bustGroup.rotation.x = this.mouse.y * -0.08

    // Scan line animation
    this.scanY += this.scanDir * 0.018
    if (this.scanY < -1.25) { this.scanDir = 1; this.scanY = -1.25 }
    if (this.scanY > 1.25)  { this.scanDir = -1; this.scanY = 1.25 }
    this.scanPlane.position.y = this.scanY
    this.scanTrail.position.y = this.scanY - this.scanDir * 0.04
    // Pulse scan opacity
    this.scanPlane.material.opacity = 0.5 + Math.sin(t * 4) * 0.2
    this.scanTrail.material.opacity = 0.08 + Math.sin(t * 4) * 0.04

    // Wireframe pulse
    this.headWire.material.opacity = 0.4 + Math.sin(t * 1.2) * 0.12

    // Tracking markers pulse
    this.trackMarkers.forEach(m => {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.0 + m.userData.phase))
      m.material.opacity = pulse * 0.85
      const s = 0.85 + pulse * 0.3
      m.scale.set(s, s, 1)
    })

    // Particles drift
    for (let i = 0; i < this.particleCount; i++) {
      this.particlePositions[i*3+1] += Math.sin(t * 0.4 + i) * 0.0008
      this.particlePositions[i*3]   += Math.cos(t * 0.3 + i * 0.7) * 0.0005
    }
    this.particles.geometry.attributes.position.needsUpdate = true
    this.particles.rotation.y = t * 0.02

    this.renderer.render(this.scene, this.camera)
  }
}
