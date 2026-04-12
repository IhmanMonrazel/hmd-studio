/**
 * particle_text_scene.js
 * Scroll-driven particle text scene for the S4 section.
 * Exports: initParticleTextScene(canvas) → { updateScroll(progress), destroy() }
 */

const PARTICLE_COUNT = 4000

// ── Smoothstep helper ─────────────────────────────────────────────────────────
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

// ── Sample text pixels from an offscreen canvas ───────────────────────────────
function sampleTextPositions(count) {
  const W = 1200
  const H = 200

  const offscreen = document.createElement('canvas')
  offscreen.width  = W
  offscreen.height = H
  const ctx = offscreen.getContext('2d')

  // Fill black background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, W, H)

  // Draw text
  ctx.fillStyle = '#ffffff'
  ctx.font = "bold 110px 'Bebas Neue', sans-serif"
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SEE OUR WORK', 600, 100)

  // Read pixel data
  const imageData = ctx.getImageData(0, 0, W, H)
  const pixels    = imageData.data

  // Collect bright pixel coordinates
  const brightPixels = []
  for (let i = 0; i < W * H; i++) {
    const r = pixels[i * 4]
    if (r > 128) {
      const px = i % W
      const py = Math.floor(i / W)
      brightPixels.push([px, py])
    }
  }

  // Randomly pick exactly `count` positions (with replacement if needed)
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * brightPixels.length)
    const [px, py] = brightPixels[idx]
    // Map canvas coords → Three.js world space
    positions[i * 3 + 0] = (px / W - 0.5) * 8.0
    positions[i * 3 + 1] = -(py / H - 0.5) * 1.5
    positions[i * 3 + 2] = 0
  }

  return positions
}

// ── Vertex shader ─────────────────────────────────────────────────────────────
const vertexShader = /* glsl */`
  uniform float uOpacity;
  varying float vOpacity;

  void main() {
    vOpacity = uOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float size = 2.0 * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(size, 1.0, 4.0);
    gl_Position  = projectionMatrix * mvPosition;
  }
`

// ── Fragment shader ───────────────────────────────────────────────────────────
const fragmentShader = /* glsl */`
  uniform vec3  uColor;
  varying float vOpacity;

  void main() {
    // Circular point
    vec2  coord = gl_PointCoord - vec2(0.5);
    float dist  = length(coord);
    if (dist > 0.5) discard;

    gl_FragColor = vec4(uColor, vOpacity);
  }
`

// ── Main export ───────────────────────────────────────────────────────────────
export async function initParticleTextScene(canvas) {
  // Dynamic import — keeps bundle lean
  const THREE = await import('three')

  // ── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  const w = canvas.parentElement?.clientWidth  || window.innerWidth
  const h = window.innerHeight
  renderer.setSize(w, h, false)

  // ── Camera ─────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
  camera.position.set(0, 0, 5)

  // ── Scene ──────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene()

  // ── Particle buffers ───────────────────────────────────────────────────────
  // STATE A — chaos: random scatter in sphere radius 4.0
  const posA = new Float32Array(PARTICLE_COUNT * 3)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Uniform point-in-sphere sampling
    const r     = 4.0 * Math.cbrt(Math.random())
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)
    posA[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    posA[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    posA[i * 3 + 2] = r * Math.cos(phi)
  }

  // STATE B — text positions
  const posB = sampleTextPositions(PARTICLE_COUNT)

  // Current interpolated buffer
  const posCurrent = new Float32Array(posA)

  // ── Geometry ───────────────────────────────────────────────────────────────
  const geometry = new THREE.BufferGeometry()
  const posAttr  = new THREE.BufferAttribute(posCurrent, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('position', posAttr)

  // ── Material ───────────────────────────────────────────────────────────────
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uOpacity: { value: 0.0 },
      uColor:   { value: new THREE.Vector3(1.0, 1.0, 1.0) },
    },
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
    transparent: true,
  })

  // ── Points object ──────────────────────────────────────────────────────────
  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // ── Resize handling ────────────────────────────────────────────────────────
  const resizeObserver = new ResizeObserver(() => {
    const rw = canvas.parentElement?.clientWidth || window.innerWidth
    const rh = window.innerHeight
    renderer.setSize(rw, rh, false)
    camera.aspect = rw / rh
    camera.updateProjectionMatrix()
  })
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

  // ── Animation loop ─────────────────────────────────────────────────────────
  let rafId = null
  let _dirty = true

  const tick = () => {
    rafId = requestAnimationFrame(tick)
    if (_dirty) {
      renderer.render(scene, camera)
      _dirty = false
    }
  }
  tick()

  // ── updateScroll ──────────────────────────────────────────────────────────
  function updateScroll(progress) {
    _dirty = true
    // Phase 1 — 0.00 → 0.15: fade in, stay in chaos
    if (progress < 0.15) {
      material.uniforms.uOpacity.value = smoothstep(0, 0.15, progress)
    }

    // Phase 2 — 0.15 → 0.65: particles travel chaos → text
    if (progress >= 0.15 && progress < 0.65) {
      material.uniforms.uOpacity.value = 1.0

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particleStart  = 0.15 + (i / PARTICLE_COUNT) * 0.25
        const particleEnd    = particleStart + 0.25
        const t              = smoothstep(particleStart, particleEnd, progress)

        posCurrent[i * 3 + 0] = posA[i * 3 + 0] + (posB[i * 3 + 0] - posA[i * 3 + 0]) * t
        posCurrent[i * 3 + 1] = posA[i * 3 + 1] + (posB[i * 3 + 1] - posA[i * 3 + 1]) * t
        posCurrent[i * 3 + 2] = posA[i * 3 + 2] + (posB[i * 3 + 2] - posA[i * 3 + 2]) * t
      }
      posAttr.needsUpdate = true
    }

    // Phase 3 — 0.65 → 0.85: hold text, camera dolly in
    if (progress >= 0.65 && progress < 0.85) {
      material.uniforms.uOpacity.value = 1.0
      // Ensure all particles are at text positions
      if (progress < 0.66) {
        posCurrent.set(posB)
        posAttr.needsUpdate = true
      }
      const dollyT = smoothstep(0.65, 0.85, progress)
      camera.position.z = 5.0 - dollyT * 0.8  // 5.0 → 4.2
    }

    // Phase 4 — 0.85 → 1.00: stable
    if (progress >= 0.85) {
      material.uniforms.uOpacity.value = 1.0
      camera.position.z = 4.2
    }

  }

  // ── destroy ───────────────────────────────────────────────────────────────
  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }

  return { updateScroll, destroy }
}
