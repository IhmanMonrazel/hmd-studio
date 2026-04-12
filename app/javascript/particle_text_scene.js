/**
 * particle_text_scene.js
 * Full particle narrative: chaos → HMD STUDIO → 01 ART DIRECTION →
 * 02 WEB DEVELOPMENT → 03 VISUAL IDENTITY → SEE OUR WORK
 *
 * Progress 0→1 across 1000vh
 *
 * Acts:
 *   0.00 → 0.08  fade in chaos (white)
 *   0.08 → 0.20  chaos → HMD STUDIO (white→red)
 *   0.20 → 0.28  hold HMD STUDIO (red)
 *   0.28 → 0.36  HMD STUDIO → chaos (red→white)
 *   0.36 → 0.46  chaos → 01 ART DIRECTION (white→red)
 *   0.46 → 0.52  hold 01 ART DIRECTION (red)
 *   0.52 → 0.58  01 ART DIRECTION → chaos (red→white)
 *   0.58 → 0.66  chaos → 02 WEB DEVELOPMENT (white→red)
 *   0.66 → 0.72  hold (red)
 *   0.72 → 0.78  → chaos (red→white)
 *   0.78 → 0.86  chaos → 03 VISUAL IDENTITY (white→red)
 *   0.86 → 0.90  hold (red)
 *   0.90 → 0.94  → chaos (red→white)
 *   0.94 → 1.00  chaos → SEE OUR WORK (white, dolly in)
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

  // ── Text states ──────────────────────────────────────────
  const states = {
    chaos1: randomSphere(PARTICLE_COUNT, 4.5),
    hmd:    sampleText('HMD STUDIO', PARTICLE_COUNT, 120, 7.5, 1.3),
    chaos2: randomSphere(PARTICLE_COUNT, 4.5),
    art:    sampleText('01 — ART DIRECTION', PARTICLE_COUNT, 95, 9.0, 1.2),
    chaos3: randomSphere(PARTICLE_COUNT, 4.5),
    web:    sampleText('02 — WEB DEVELOPMENT', PARTICLE_COUNT, 85, 9.0, 1.2),
    chaos4: randomSphere(PARTICLE_COUNT, 4.5),
    vis:    sampleText('03 — VISUAL IDENTITY', PARTICLE_COUNT, 95, 9.0, 1.2),
    chaos5: randomSphere(PARTICLE_COUNT, 4.5),
    see:    sampleText('SEE OUR WORK', PARTICLE_COUNT, 110, 8.5, 1.4),
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

  const resizeObserver = new ResizeObserver(() => {
    const rw = canvas.parentElement?.clientWidth || window.innerWidth
    const rh = window.innerHeight
    renderer.setSize(rw, rh, false)
    camera.aspect = rw / rh
    camera.updateProjectionMatrix()
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

    // Reset camera z unless overridden below
    camera.position.z = 5.0

    // 0.00 → 0.08 — fade in chaos
    if (p < 0.08) {
      material.uniforms.uOpacity.value = smoothstep(0, 0.08, p)
      setColor(WHITE, WHITE, 0)
      lerp(states.chaos1, states.chaos1, 0)
    }
    // 0.08 → 0.20 — chaos → HMD STUDIO (white→red)
    else if (p < 0.20) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.08, 0.20, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos1, states.hmd, t)
    }
    // 0.20 → 0.28 — hold HMD STUDIO (red)
    else if (p < 0.28) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.hmd, states.hmd, 1)
    }
    // 0.28 → 0.36 — HMD STUDIO → chaos (red→white)
    else if (p < 0.36) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.28, 0.36, p)
      setColor(RED, WHITE, t)
      lerp(states.hmd, states.chaos2, t)
    }
    // 0.36 → 0.46 — chaos → 01 ART DIRECTION (white→red)
    else if (p < 0.46) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.36, 0.46, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos2, states.art, t)
    }
    // 0.46 → 0.52 — hold ART DIRECTION (red)
    else if (p < 0.52) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.art, states.art, 1)
    }
    // 0.52 → 0.58 — ART DIRECTION → chaos (red→white)
    else if (p < 0.58) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.52, 0.58, p)
      setColor(RED, WHITE, t)
      lerp(states.art, states.chaos3, t)
    }
    // 0.58 → 0.66 — chaos → 02 WEB DEVELOPMENT (white→red)
    else if (p < 0.66) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.58, 0.66, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos3, states.web, t)
    }
    // 0.66 → 0.72 — hold WEB DEVELOPMENT (red)
    else if (p < 0.72) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.web, states.web, 1)
    }
    // 0.72 → 0.78 — WEB DEVELOPMENT → chaos (red→white)
    else if (p < 0.78) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.72, 0.78, p)
      setColor(RED, WHITE, t)
      lerp(states.web, states.chaos4, t)
    }
    // 0.78 → 0.86 — chaos → 03 VISUAL IDENTITY (white→red)
    else if (p < 0.86) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.78, 0.86, p)
      setColor(WHITE, RED, t)
      lerp(states.chaos4, states.vis, t)
    }
    // 0.86 → 0.90 — hold VISUAL IDENTITY (red)
    else if (p < 0.90) {
      material.uniforms.uOpacity.value = 1.0
      setColor(RED, RED, 0)
      lerp(states.vis, states.vis, 1)
    }
    // 0.90 → 0.94 — VISUAL IDENTITY → chaos (red→white)
    else if (p < 0.94) {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.90, 0.94, p)
      setColor(RED, WHITE, t)
      lerp(states.vis, states.chaos5, t)
    }
    // 0.94 → 1.00 — chaos → SEE OUR WORK (white, dolly in)
    else {
      material.uniforms.uOpacity.value = 1.0
      const t = smoothstep(0.94, 1.00, p)
      setColor(WHITE, WHITE, 0)
      lerp(states.chaos5, states.see, t)
      camera.position.z = 5.0 - t * 0.8
    }
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    geometry.dispose(); material.dispose(); renderer.dispose()
  }

  return { updateScroll, destroy }
}
