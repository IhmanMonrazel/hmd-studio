/**
 * particle_text_scene.js
 * Particle narrative: chaos → HMD STUDIO → services (3 lines) → SEE OUR WORK
 *
 * Progress 0→1 across 1800vh
 *
 * Acts:
 *   0.00 → 0.08  fade in chaos
 *   0.08 → 0.22  chaos → HMD STUDIO (white→red)
 *   0.22 → 0.32  hold HMD STUDIO (red)
 *   0.32 → 0.42  HMD STUDIO → chaos (red→white)
 *   0.42 → 0.58  chaos → services 3 lines (white→red)
 *   0.58 → 0.70  hold services (red)
 *   0.70 → 0.80  services → chaos (red→white)
 *   0.80 → 0.93  chaos → SEE OUR WORK (white, dolly in)
 *   0.93 → 1.00  hold SEE OUR WORK
 */

const PARTICLE_COUNT = 3500

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function sampleText(text, count, fontSize = 110, scaleX = 8.0, scaleY = 1.4) {
  const W = 1400, H = 220
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${fontSize}px 'Bebas Neue', sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, W / 2, H / 2)
  const px = ctx.getImageData(0, 0, W, H).data
  const bright = []
  for (let i = 0; i < W * H; i++) {
    if (px[i * 4] > 128) bright.push([i % W, Math.floor(i / W)])
  }
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const [bx, by] = bright[Math.floor(Math.random() * bright.length)]
    out[i*3+0] = (bx / W - 0.5) * scaleX
    out[i*3+1] = -(by / H - 0.5) * scaleY
    out[i*3+2] = 0
  }
  return out
}

function sampleTextMultiline(lines, count) {
  const W = 1400, H = 420
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.font = "bold 95px 'Bebas Neue', sans-serif"
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const lineH = H / lines.length
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, lineH * i + lineH / 2)
  })
  const px = ctx.getImageData(0, 0, W, H).data
  const bright = []
  for (let i = 0; i < W * H; i++) {
    if (px[i * 4] > 128) bright.push([i % W, Math.floor(i / W)])
  }
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const [bx, by] = bright[Math.floor(Math.random() * bright.length)]
    out[i*3+0] = (bx / W - 0.5) * 9.0
    out[i*3+1] = -(by / H - 0.5) * 3.5
    out[i*3+2] = 0
  }
  return out
}

function randomSphere(count, radius = 4.5) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random())
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    out[i*3+0] = r * Math.sin(phi) * Math.cos(theta)
    out[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
    out[i*3+2] = r * Math.cos(phi)
  }
  return out
}

// Returns world-space bounding box of a particle buffer
function computeBBox(buffer) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = buffer[i * 3]
    const y = buffer[i * 3 + 1]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return {
    minX, maxX, minY, maxY,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: maxX - minX,
    h: maxY - minY,
  }
}

// Measures rendered pixel width of text at a given font-size using an offscreen canvas
function measureTextPx(text, fontSize) {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  ctx.font = `bold ${fontSize}px 'Bebas Neue', sans-serif`
  return ctx.measureText(text).width
}

const vertexShader = /* glsl */`
  uniform float uOpacity;
  varying float vOpacity;
  void main() {
    vOpacity = uOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float size = 2.5 * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(size, 1.5, 5.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */`
  uniform vec3 uColor;
  varying float vOpacity;
  void main() {
    if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
    gl_FragColor = vec4(uColor, vOpacity);
  }
`

export async function initParticleTextScene(canvas) {
  const THREE = await import('three')

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  const w = canvas.parentElement?.clientWidth || window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h, false)

  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
  camera.position.set(0, 0, 5)

  // Projects a world-space point to CSS pixel coordinates
  function worldToScreen(x, y, z) {
    const vec = new THREE.Vector3(x, y, z)
    vec.project(camera)
    return {
      x: (vec.x * 0.5 + 0.5) * window.innerWidth,
      y: (-vec.y * 0.5 + 0.5) * window.innerHeight,
    }
  }

  const scene = new THREE.Scene()

  // ── Text states ──────────────────────────────────────────
  const states = {
    chaos1:   randomSphere(PARTICLE_COUNT, 4.5),
    hmd:      sampleText('HMD STUDIO', PARTICLE_COUNT, 120, 7.5, 1.3),
    chaos2:   randomSphere(PARTICLE_COUNT, 4.5),
    services: sampleTextMultiline(
      ['01 — ART DIRECTION', '02 — WEB DEVELOPMENT', '03 — VISUAL IDENTITY'],
      PARTICLE_COUNT
    ),
    chaos3:   randomSphere(PARTICLE_COUNT, 4.5),
    see:      sampleText('SEE OUR WORK', PARTICLE_COUNT, 110, 8.5, 1.4),
  }

  // World-space bounding boxes — computed once from particle positions
  const bboxes = {
    hmd:      computeBBox(states.hmd),
    services: computeBBox(states.services),
    see:      computeBBox(states.see),
  }

  const posCurrent = new Float32Array(states.chaos1)
  const geometry = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(posCurrent, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('position', posAttr)

  const WHITE = new THREE.Vector3(1, 1, 1)
  const RED   = new THREE.Vector3(0.8, 0, 0)

  const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader,
    uniforms: {
      uOpacity: { value: 0.0 },
      uColor:   { value: WHITE.clone() },
    },
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })

  scene.add(new THREE.Points(geometry, material))

  const overlayHmd      = document.getElementById('pw-hmd')
  const overlayServices = document.getElementById('pw-services')
  const overlaySee      = document.getElementById('pw-see')

  function setOverlay(el, opacity) {
    if (el) el.style.opacity = opacity
  }

  // ── Overlay positioning ───────────────────────────────────
  // Positions a single-line overlay (HMD STUDIO / SEE OUR WORK) by
  // projecting the particle bounding box into screen space, then
  // calculating the font-size that makes the HTML text fill the same width.
  function positionSingleLine(el, bbox, text) {
    if (!el) return
    const content = el.querySelector('.pw-overlay__text')
    if (!content) return
    const center = worldToScreen(bbox.cx, bbox.cy, 0)
    const left   = worldToScreen(bbox.minX, bbox.cy, 0)
    const right  = worldToScreen(bbox.maxX, bbox.cy, 0)
    const pixelW = Math.abs(right.x - left.x)
    // Scale font-size so text fills the projected particle width exactly
    const refSize = 200
    const refPx   = measureTextPx(text, refSize)
    const fontSize = refSize * pixelW / refPx
    content.style.position  = 'absolute'
    content.style.left      = center.x + 'px'
    content.style.top       = center.y + 'px'
    content.style.transform = 'translate(-50%, -50%)'
    content.style.fontSize  = fontSize + 'px'
    content.style.whiteSpace = 'nowrap'
  }

  // Positions the services overlay (3-line layout) using the full particle
  // bounding box. Font-size is derived from the longest particle line width.
  function positionServices(el, bbox) {
    if (!el) return
    const container = el.querySelector('.pw-overlay__services')
    if (!container) return
    const center = worldToScreen(bbox.cx, bbox.cy, 0)
    const left   = worldToScreen(bbox.minX, bbox.cy, 0)
    const right  = worldToScreen(bbox.maxX, bbox.cy, 0)
    const pixelW = Math.abs(right.x - left.x)
    // Longest particle line determines the reference width
    const refSize    = 200
    const longestPx  = measureTextPx('02 — WEB DEVELOPMENT', refSize)
    const fontSize   = refSize * pixelW / longestPx
    const numSize    = Math.max(9, fontSize * 0.1)
    container.style.position  = 'absolute'
    container.style.left      = center.x + 'px'
    container.style.top       = center.y + 'px'
    container.style.transform = 'translate(-50%, -50%)'
    container.style.width     = pixelW + 'px'
    container.style.padding   = '0'
    el.querySelectorAll('.pw-overlay__service-name').forEach(n => {
      n.style.fontSize = fontSize + 'px'
    })
    el.querySelectorAll('.pw-overlay__num').forEach(n => {
      n.style.fontSize = numSize + 'px'
    })
  }

  function applyOverlayPositions() {
    positionSingleLine(overlayHmd, bboxes.hmd, 'HMD STUDIO')
    positionServices(overlayServices, bboxes.services)
    positionSingleLine(overlaySee, bboxes.see, 'SEE OUR WORK')
  }

  applyOverlayPositions()

  const resizeObserver = new ResizeObserver(() => {
    const rw = canvas.parentElement?.clientWidth || window.innerWidth
    const rh = window.innerHeight
    renderer.setSize(rw, rh, false)
    camera.aspect = rw / rh
    camera.updateProjectionMatrix()
    applyOverlayPositions()
  })
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

  let rafId = null, _dirty = true
  const tick = () => {
    rafId = requestAnimationFrame(tick)
    if (_dirty) { renderer.render(scene, camera); _dirty = false }
  }
  tick()

  function lerp(from, to, t) {
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      posCurrent[i] = from[i] + (to[i] - from[i]) * t
    }
    posAttr.needsUpdate = true
  }

  function setColor(from, to, t) {
    material.uniforms.uColor.value.lerpVectors(from, to, t)
  }

  function updateScroll(progress) {
    _dirty = true
    const p = progress
    camera.position.z = 5.0

    // Helper: crossfade opacity — ramps 0→1 over [start, start+0.04]
    // and 1→0 over [end-0.04, end]
    function overlayOpacity(start, end) {
      if (p < start) return 0
      if (p < start + 0.04) return smoothstep(start, start + 0.04, p)
      if (p < end - 0.04) return 1
      if (p < end) return 1 - smoothstep(end - 0.04, end, p)
      return 0
    }

    // Particle phases (unchanged logic)
    if (p < 0.08) {
      material.uniforms.uOpacity.value = smoothstep(0, 0.08, p)
      setColor(WHITE, WHITE, 0)
      lerp(states.chaos1, states.chaos1, 0)
    }
    else if (p < 0.22) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.08, 0.22, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos1, states.hmd, t)
    }
    else if (p < 0.32) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.hmd, states.hmd, 1)
    }
    else if (p < 0.42) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.32, 0.42, p)
      setColor(RED, WHITE, t)
      lerp(states.hmd, states.chaos2, t)
    }
    else if (p < 0.58) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.42, 0.58, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos2, states.services, t)
    }
    else if (p < 0.70) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.services, states.services, 1)
    }
    else if (p < 0.80) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.70, 0.80, p)
      setColor(RED, WHITE, t)
      lerp(states.services, states.chaos3, t)
    }
    else if (p < 0.93) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.80, 0.93, p)
      setColor(WHITE, WHITE, 0)
      lerp(states.chaos3, states.see, t)
      camera.position.z = 5.0 - t * 0.8
    }
    else {
      material.uniforms.uOpacity.value = 1.0
      setColor(WHITE, WHITE, 0)
      lerp(states.see, states.see, 1)
      camera.position.z = 4.2
    }

    // Overlay crossfades
    // HMD STUDIO: particles form 0.08→0.22, hold 0.22→0.32, disperse 0.32→0.42
    // Overlay visible during hold: 0.20 → 0.38
    setOverlay(overlayHmd, overlayOpacity(0.20, 0.38))

    // SERVICES: particles form 0.42→0.58, hold 0.58→0.70, disperse 0.70→0.80
    // Overlay visible during hold: 0.56 → 0.74
    setOverlay(overlayServices, overlayOpacity(0.56, 0.74))

    // SEE OUR WORK: particles form 0.80→0.93, hold 0.93→1.00
    // Overlay visible from 0.91 onwards
    setOverlay(overlaySee, overlayOpacity(0.91, 1.04))
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    geometry.dispose(); material.dispose(); renderer.dispose()
  }

  return { updateScroll, destroy }
}
