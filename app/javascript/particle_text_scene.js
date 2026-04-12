/**
 * particle_text_scene.js
 * Unified scroll-driven particle scene covering S2 → S3 → S4
 * Progress 0→1 maps across 900vh
 *
 * Acts:
 *   0.00 → 0.12  fade in chaos
 *   0.12 → 0.30  chaos → "HMD STUDIO"        (S2)
 *   0.30 → 0.42  hold "HMD STUDIO"
 *   0.42 → 0.55  "HMD STUDIO" → chaos
 *   0.55 → 0.70  chaos → "SEE OUR WORK"      (S3 transition / S4)
 *   0.70 → 0.82  hold "SEE OUR WORK", dolly in
 *   0.82 → 1.00  stable "SEE OUR WORK"
 */

const PARTICLE_COUNT = 3000

function smoothstep(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function sampleText(text, count, scaleX = 8.0, scaleY = 1.5) {
  const W = 1200, H = 200
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.font = "bold 110px 'Bebas Neue', sans-serif"
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, 600, 100)
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

function randomSphere(count, radius = 4.0) {
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
    float size = 2.0 * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(size, 1.0, 4.0);
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

  // ── Particle position states ─────────────────────────────
  const posA = randomSphere(PARTICLE_COUNT, 4.0)                      // chaos
  const posB = sampleText('HMD STUDIO', PARTICLE_COUNT, 7.0, 1.2)    // S2
  const posC = sampleText('SEE OUR WORK', PARTICLE_COUNT, 8.0, 1.5)  // S4
  const posD = randomSphere(PARTICLE_COUNT, 4.0)                      // chaos between B and C

  const posCurrent = new Float32Array(posA)

  const geometry = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(posCurrent, 3)
  posAttr.setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('position', posAttr)

  const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader,
    uniforms: {
      uOpacity: { value: 0.0 },
      uColor:   { value: new THREE.Vector3(1, 1, 1) },
    },
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })

  scene.add(new THREE.Points(geometry, material))

  // ── Overlay references ───────────────────────────────────
  const overlayS2 = document.getElementById('pw-s2')
  const overlayS3 = document.getElementById('pw-s3')

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

  // ── Lerp helper ──────────────────────────────────────────
  function lerpBuffers(from, to, t) {
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      posCurrent[i] = from[i] + (to[i] - from[i]) * t
    }
    posAttr.needsUpdate = true
  }

  // ── updateScroll ─────────────────────────────────────────
  function updateScroll(progress) {
    _dirty = true

    // Phase 0 — 0.00 → 0.12: fade in from chaos
    if (progress < 0.12) {
      material.uniforms.uOpacity.value = smoothstep(0, 0.12, progress)
      lerpBuffers(posA, posA, 0)
    }

    // Phase 1 — 0.12 → 0.30: chaos → HMD STUDIO
    if (progress >= 0.12 && progress < 0.30) {
      material.uniforms.uOpacity.value = 1.0
      lerpBuffers(posA, posB, smoothstep(0.12, 0.30, progress))
    }

    // Phase 2 — 0.30 → 0.42: hold HMD STUDIO
    if (progress >= 0.30 && progress < 0.42) {
      material.uniforms.uOpacity.value = 1.0
      lerpBuffers(posB, posB, 1)
    }

    // Phase 3 — 0.42 → 0.55: HMD STUDIO → chaos
    if (progress >= 0.42 && progress < 0.55) {
      material.uniforms.uOpacity.value = 1.0
      lerpBuffers(posB, posD, smoothstep(0.42, 0.55, progress))
    }

    // Phase 4 — 0.55 → 0.70: chaos → SEE OUR WORK
    if (progress >= 0.55 && progress < 0.70) {
      material.uniforms.uOpacity.value = 1.0
      lerpBuffers(posD, posC, smoothstep(0.55, 0.70, progress))
    }

    // Phase 5 — 0.70 → 0.82: hold SEE OUR WORK, dolly in
    if (progress >= 0.70 && progress < 0.82) {
      material.uniforms.uOpacity.value = 1.0
      lerpBuffers(posC, posC, 1)
      camera.position.z = 5.0 - smoothstep(0.70, 0.82, progress) * 0.8
    }

    // Phase 6 — 0.82 → 1.00: stable
    if (progress >= 0.82) {
      material.uniforms.uOpacity.value = 1.0
      camera.position.z = 4.2
    }

    // Overlay visibility
    if (overlayS2) {
      if (progress >= 0.12 && progress < 0.45) {
        overlayS2.classList.add('is-visible')
      } else {
        overlayS2.classList.remove('is-visible')
      }
    }
    if (overlayS3) {
      if (progress >= 0.45 && progress < 0.72) {
        overlayS3.classList.add('is-visible')
      } else {
        overlayS3.classList.remove('is-visible')
      }
    }
  }

  function destroy() {
    if (rafId) cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    geometry.dispose(); material.dispose(); renderer.dispose()
  }

  return { updateScroll, destroy }
}
