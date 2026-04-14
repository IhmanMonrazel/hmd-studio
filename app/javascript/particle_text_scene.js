/**
 * particle_text_scene.js
 * Particles + Three.js texture planes for pixel-perfect text overlay.
 * The text plane is positioned in the same 3D space as particles.
 */

const PARTICLE_COUNT = 3500

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function sampleText(text, count, fontSize, scaleX, scaleY, canvasW, canvasH, textY) {
  canvasW = canvasW || 1400
  canvasH = canvasH || 220
  textY   = textY   || canvasH / 2
  const c = document.createElement('canvas')
  c.width = canvasW; c.height = canvasH
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvasW, canvasH)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${fontSize}px 'Bebas Neue', sans-serif`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, canvasW / 2, textY)
  const px = ctx.getImageData(0, 0, canvasW, canvasH).data
  const bright = []
  for (let i = 0; i < canvasW * canvasH; i++) {
    if (px[i * 4] > 128) bright.push([i % canvasW, Math.floor(i / canvasW)])
  }
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const [bx, by] = bright[Math.floor(Math.random() * bright.length)]
    out[i*3+0] = (bx / canvasW - 0.5) * scaleX
    out[i*3+1] = -(by / canvasH - 0.5) * scaleY
    out[i*3+2] = 0
  }
  return out
}

function sampleTextMultiline(lines, count) {
  const W = 1400, H = 580
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.font = "bold 95px 'Bebas Neue', sans-serif"
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  // Match EXACTLY the Y positions used in makeTextPlane for planeServices
  const titleYPositions = [80, 250, 420]
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, titleYPositions[i])
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
    out[i*3+1] = -(by / H - 0.5) * 4.2
    out[i*3+2] = 0
  }
  return out
}

function randomSphere(count, radius = 4.5) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Mix of three distributions for more organic chaos:
    // 60% wide sphere, 25% tight cluster, 15% flat disc
    const rand = Math.random()

    if (rand < 0.60) {
      // Wide sphere — particles fly far
      const r = (radius + Math.random() * 2.5) * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      out[i*3+0] = r * Math.sin(phi) * Math.cos(theta)
      out[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      out[i*3+2] = r * Math.cos(phi) * 0.6 // flatten Z slightly
    } else if (rand < 0.85) {
      // Tight cluster near center — gives density variation
      const r = Math.random() * 1.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      out[i*3+0] = r * Math.sin(phi) * Math.cos(theta)
      out[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      out[i*3+2] = r * Math.cos(phi)
    } else {
      // Flat horizontal disc — particles streak sideways
      const r = radius * (0.5 + Math.random() * 1.5)
      const theta = Math.random() * Math.PI * 2
      out[i*3+0] = r * Math.cos(theta)
      out[i*3+1] = (Math.random() - 0.5) * 1.2
      out[i*3+2] = r * Math.sin(theta) * 0.3
    }
  }
  return out
}

function explodeFrom(sourcePositions, count, spread = 5.0) {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Start from the source text position
    const sx = sourcePositions[i*3+0]
    const sy = sourcePositions[i*3+1]
    const sz = sourcePositions[i*3+2]

    // Add large random offset — particles fly away from text
    const rand = Math.random()
    if (rand < 0.60) {
      const r = spread * (0.5 + Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      out[i*3+0] = sx + r * Math.sin(phi) * Math.cos(theta)
      out[i*3+1] = sy + r * Math.sin(phi) * Math.sin(theta)
      out[i*3+2] = sz + r * Math.cos(phi) * 0.6
    } else if (rand < 0.85) {
      out[i*3+0] = sx + (Math.random() - 0.5) * spread * 0.5
      out[i*3+1] = sy + (Math.random() - 0.5) * spread * 0.5
      out[i*3+2] = sz + (Math.random() - 0.5) * spread * 0.3
    } else {
      const r = spread * (0.8 + Math.random() * 0.8)
      const theta = Math.random() * Math.PI * 2
      out[i*3+0] = sx + r * Math.cos(theta)
      out[i*3+1] = sy + (Math.random() - 0.5) * 1.2
      out[i*3+2] = sz + r * Math.sin(theta) * 0.3
    }
  }
  return out
}

/**
 * Create a Three.js texture plane from a config object.
 * Each line is positioned manually by its y value on the canvas.
 * scaleX/scaleY must match the values used in sampleText/sampleTextMultiline.
 */
function makeTextPlane(THREE, config) {
  const {
    lines,           // array of {text, fontSize, color, y, font, align}
    canvasW,
    canvasH,
    scaleX,
    scaleY,
  } = config

  const c = document.createElement('canvas')
  c.width = canvasW; c.height = canvasH
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, canvasW, canvasH)

  lines.forEach(({ text, fontSize, color, y, font, align }) => {
    ctx.fillStyle = color || '#CC0000'
    ctx.font = font || `bold ${fontSize}px 'Bebas Neue', sans-serif`
    ctx.textAlign = align || 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvasW / 2, y)
  })

  const texture = new THREE.CanvasTexture(c)
  texture.needsUpdate = true

  const geometry = new THREE.PlaneGeometry(scaleX, scaleY)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, 0.01) // slightly in front of particles
  return mesh
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

  const scene = new THREE.Scene()

  // ── Particle states ──────────────────────────────────────
  // Text states computed first so chaos buffers can be derived from them
  const posHmd      = sampleText('HMD STUDIO', PARTICLE_COUNT, 120, 7.5, 1.9, 1400, 320, 110)
  const posServices = sampleTextMultiline(
    ['01 — ART DIRECTION', '02 — WEB DEVELOPMENT', '03 — VISUAL IDENTITY'],
    PARTICLE_COUNT
  )
  const posSee      = sampleText('SEE OUR WORK', PARTICLE_COUNT, 110, 8.5, 1.7, 1400, 280, 110)

  const states = {
    chaos1:   randomSphere(PARTICLE_COUNT, 4.5),          // initial chaos — no source text
    hmd:      posHmd,
    chaos2:   explodeFrom(posHmd,      PARTICLE_COUNT, 5.0), // explodes from HMD STUDIO
    services: posServices,
    chaos3:   explodeFrom(posServices, PARTICLE_COUNT, 5.0), // explodes from services
    see:      posSee,
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

  // ── Text planes ──────────────────────────────────────────
  // scaleX/scaleY must match sampleText/sampleTextMultiline exactly
  const planeHmd = makeTextPlane(THREE, {
    canvasW: 1400, canvasH: 320,
    scaleX: 7.5, scaleY: 1.9,
    lines: [
      { text: 'HMD STUDIO', fontSize: 120, color: '#CC0000', y: 110 },
      {
        text: 'Editorial web studio for brands that refuse to be forgettable.',
        fontSize: 22,
        color: 'rgba(204,0,0,0.6)',
        font: "300 22px 'DM Serif Display', serif",
        y: 210
      },
      {
        text: 'Branding — Web — Art Direction',
        fontSize: 14,
        color: 'rgba(204,0,0,0.4)',
        font: "400 14px 'Courier New', monospace",
        y: 270
      },
    ]
  })

  const planeServices = makeTextPlane(THREE, {
    canvasW: 1400, canvasH: 580,
    scaleX: 9.0, scaleY: 4.2,
    lines: [
      { text: '01 — ART DIRECTION',    fontSize: 95, color: '#CC0000', y: 80  },
      { text: 'For brands that want a point of view, not a template.',
        fontSize: 20, color: 'rgba(204,0,0,0.55)',
        font: "italic 20px 'DM Serif Display', serif", y: 140 },
      { text: '02 — WEB DEVELOPMENT',  fontSize: 95, color: '#CC0000', y: 250 },
      { text: 'Editorial interfaces built to last and convert.',
        fontSize: 20, color: 'rgba(204,0,0,0.55)',
        font: "italic 20px 'DM Serif Display', serif", y: 310 },
      { text: '03 — VISUAL IDENTITY',  fontSize: 95, color: '#CC0000', y: 420 },
      { text: 'Systems that hold their ground at any scale.',
        fontSize: 20, color: 'rgba(204,0,0,0.55)',
        font: "italic 20px 'DM Serif Display', serif", y: 480 },
    ]
  })

  const planeSee = makeTextPlane(THREE, {
    canvasW: 1400, canvasH: 280,
    scaleX: 8.5, scaleY: 1.7,
    lines: [
      { text: 'SEE OUR WORK', fontSize: 110, color: '#ffffff', y: 110 },
    ]
  })

  scene.add(planeHmd)
  scene.add(planeServices)
  scene.add(planeSee)

  // ── Resize ───────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(() => {
    const rw = canvas.parentElement?.clientWidth || window.innerWidth
    const rh = window.innerHeight
    renderer.setSize(rw, rh, false)
    camera.aspect = rw / rh
    camera.updateProjectionMatrix()
  })
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

  // ── Click overlay for SEE OUR WORK ───────────────────────
  const clickOverlay = document.createElement('a')
  clickOverlay.href = '/work'
  clickOverlay.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 20;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
  `
  if (canvas.parentElement) {
    canvas.parentElement.style.position = 'relative'
    canvas.parentElement.appendChild(clickOverlay)
  }

  // ── RAF ──────────────────────────────────────────────────
  let rafId = null, _dirty = true
  const tick = () => {
    rafId = requestAnimationFrame(tick)
    if (_dirty) { renderer.render(scene, camera); _dirty = false }
  }
  tick()

  // ── Helpers ──────────────────────────────────────────────
  function lerp(from, to, t) {
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      posCurrent[i] = from[i] + (to[i] - from[i]) * t
    }
    posAttr.needsUpdate = true
  }

  function setColor(from, to, t) {
    material.uniforms.uColor.value.lerpVectors(from, to, t)
  }

  function setPlaneOpacity(plane, opacity) {
    plane.material.opacity = Math.max(0, Math.min(1, opacity))
  }

  // Crossfade: ramps 0→1 at [start, start+window], holds, ramps 1→0 at [end-window, end]
  function crossfade(start, end, p, window = 0.04) {
    if (p <= start) return 0
    if (p <= start + window) return smoothstep(start, start + window, p)
    if (p <= end - window) return 1
    if (p <= end) return 1 - smoothstep(end - window, end, p)
    return 0
  }

  // ── updateScroll ─────────────────────────────────────────
  function updateScroll(progress) {
    _dirty = true
    const p = progress
    camera.position.z = 5.0

    // Particle phases
    if (p < 0.08) {
      material.uniforms.uOpacity.value = smoothstep(0, 0.08, p)
      setColor(WHITE, WHITE, 0)
      lerp(states.chaos1, states.chaos1, 0)
    } else if (p < 0.22) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.08, 0.22, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos1, states.hmd, t)
    } else if (p < 0.32) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.hmd, states.hmd, 1)
    } else if (p < 0.42) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.32, 0.42, p)
      setColor(RED, WHITE, t)
      lerp(states.hmd, states.chaos2, t)
    } else if (p < 0.58) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.42, 0.58, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos2, states.services, t)
    } else if (p < 0.70) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.services, states.services, 1)
    } else if (p < 0.80) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.70, 0.80, p)
      setColor(RED, WHITE, t)
      lerp(states.services, states.chaos3, t)
    } else if (p < 0.93) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.80, 0.93, p)
      setColor(WHITE, WHITE, 0)
      lerp(states.chaos3, states.see, t)
      camera.position.z = 5.0 - t * 0.8
    } else {
      material.uniforms.uOpacity.value = 1.0
      setColor(WHITE, WHITE, 0)
      lerp(states.see, states.see, 1)
      camera.position.z = 4.2
    }

    // Text plane crossfades
    const hmdPlaneOpacity      = crossfade(0.24, 0.40, p)
    const servicesPlaneOpacity = crossfade(0.60, 0.78, p)
    const seePlaneOpacity      = crossfade(0.91, 1.04, p)

    setPlaneOpacity(planeHmd,      hmdPlaneOpacity)
    setPlaneOpacity(planeServices, servicesPlaneOpacity)
    setPlaneOpacity(planeSee,      seePlaneOpacity)

    // Enable click overlay only when SEE OUR WORK plane is sufficiently visible
    if (seePlaneOpacity > 0.5) {
      clickOverlay.style.pointerEvents = 'auto'
      clickOverlay.style.cursor = 'pointer'
    } else {
      clickOverlay.style.pointerEvents = 'none'
    }

    // Particle opacity: inverse of whichever plane is currently visible
    // When plane is fully visible → particles fully hidden
    // When no plane visible → particles at full opacity (driven by phase logic above)
    const dominantPlane = Math.max(hmdPlaneOpacity, servicesPlaneOpacity, seePlaneOpacity)
    if (dominantPlane > 0) {
      material.uniforms.uOpacity.value = Math.max(0, 1.0 - dominantPlane)
    }
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    geometry.dispose()
    material.dispose()
    planeHmd.geometry.dispose(); planeHmd.material.dispose()
    planeServices.geometry.dispose(); planeServices.material.dispose()
    planeSee.geometry.dispose(); planeSee.material.dispose()
    if (clickOverlay.parentElement) clickOverlay.parentElement.removeChild(clickOverlay)
    renderer.dispose()
  }

  return { updateScroll, destroy }
}
