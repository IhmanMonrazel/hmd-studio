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

/**
 * Create a Three.js texture plane that renders text in red Bebas Neue.
 * The plane dimensions match exactly the world-space bounds of the
 * corresponding particle text state.
 * scaleX and scaleY must match the values used in sampleText/sampleTextMultiline.
 */
function makeTextPlane(THREE, text, scaleX, scaleY, fontSize, isMultiline, lines) {
  const W = 1400
  const H = isMultiline ? 420 : 220

  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // Transparent background
  ctx.clearRect(0, 0, W, H)

  // Red text
  ctx.fillStyle = '#CC0000'
  ctx.font = `bold ${fontSize}px 'Bebas Neue', sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (isMultiline && lines) {
    const lineH = H / lines.length
    lines.forEach((line, i) => {
      ctx.fillText(line, W / 2, lineH * i + lineH / 2)
    })
  } else {
    ctx.fillText(text, W / 2, H / 2)
  }

  const texture = new THREE.CanvasTexture(c)
  texture.needsUpdate = true

  // Plane dimensions match world-space particle bounds exactly
  const planeW = scaleX
  const planeH = scaleY

  const geometry = new THREE.PlaneGeometry(planeW, planeH)
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
  // Each plane uses EXACTLY the same scaleX/scaleY as sampleText
  const planeHmd = makeTextPlane(
    THREE, 'HMD STUDIO', 7.5, 1.3, 120, false, null
  )
  const planeServices = makeTextPlane(
    THREE, null, 9.0, 3.5, 95, true,
    ['01 — ART DIRECTION', '02 — WEB DEVELOPMENT', '03 — VISUAL IDENTITY']
  )
  const planeSee = makeTextPlane(
    THREE, 'SEE OUR WORK', 8.5, 1.4, 110, false, null
  )

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
    // HMD: particles fully formed at 0.22, hold until 0.32, disperse by 0.42
    // Plane visible: 0.24 → 0.40 (after particles settle, before they scatter)

    // HMD plane — particles fade out as plane fades in, return as plane fades out
    const hmdPlaneOpacity = crossfade(0.24, 0.40, p)
    setPlaneOpacity(planeHmd, hmdPlaneOpacity)

    // Services plane
    const servicesPlaneOpacity = crossfade(0.60, 0.78, p)
    setPlaneOpacity(planeServices, servicesPlaneOpacity)

    // SEE OUR WORK plane
    const seePlaneOpacity = crossfade(0.91, 1.04, p)
    setPlaneOpacity(planeSee, seePlaneOpacity)

    // Particle opacity: reduce when any plane is visible
    // Max plane opacity drives particle fade — particles disappear as text appears
    const maxPlaneOpacity = Math.max(hmdPlaneOpacity, servicesPlaneOpacity, seePlaneOpacity)
    material.uniforms.uOpacity.value = Math.max(
      material.uniforms.uOpacity.value * (1 - maxPlaneOpacity),
      p < 0.08 ? smoothstep(0, 0.08, p) : 0
    )

    // When a plane is fully visible (opacity = 1), particles are invisible
    // When plane fades out, particles fade back in naturally via the phase logic above
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    geometry.dispose()
    material.dispose()
    planeHmd.geometry.dispose(); planeHmd.material.dispose()
    planeServices.geometry.dispose(); planeServices.material.dispose()
    planeSee.geometry.dispose(); planeSee.material.dispose()
    renderer.dispose()
  }

  return { updateScroll, destroy }
}
