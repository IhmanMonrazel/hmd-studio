import * as THREE from "three"

const TEXTURE_URL =
  "https://res.cloudinary.com/dtlybacjm/image/upload/v1774622660/GFS_Didot_8_ovxbjk.png"

export function initTribal3D(canvas, { size = 360, cameraZ = 5.5 } = {}) {
  const W = size
  const H = size

  // ── Renderer ─────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  // ── Scene & Camera ────────────────────────────────────────
  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
  camera.position.set(0, 0, cameraZ)

  // ── Lumières douces ───────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.8))
  const dir = new THREE.DirectionalLight(0xffffff, 0.6)
  dir.position.set(2, 3, 4)
  scene.add(dir)

  // ── Groupe pivot (rotation auto + souris) ─────────────────
  const group = new THREE.Group()
  scene.add(group)

  // ── Plan texturé — image tribale ──────────────────────────
  const loader  = new THREE.TextureLoader()
  const texture = loader.load(TEXTURE_URL)
  texture.colorSpace = THREE.SRGBColorSpace

  const planeGeo = new THREE.PlaneGeometry(4, 4)
  const planeMat = new THREE.MeshStandardMaterial({
    map:         texture,
    side:        THREE.DoubleSide,
    transparent: true,
    opacity:     0.45,
    alphaTest:   0.1,
  })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  group.add(plane)

  // ── État souris (lerp) ────────────────────────────────────
  const mouse  = { x: 0, y: 0 }
  const target = { x: 0, y: 0 }

  function onMouseMove(e) {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }
  window.addEventListener("mousemove", onMouseMove)

  // ── Boucle d'animation ────────────────────────────────────
  let rafId
  const clock = new THREE.Clock()

  function animate() {
    rafId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    // Rotation auto lente
    group.rotation.y = t * 0.18
    group.rotation.x = Math.sin(t * 0.12) * 0.15

    // Lerp souris → inclinaison légère supplémentaire
    target.x += (mouse.x - target.x) * 0.04
    target.y += (mouse.y - target.y) * 0.04
    group.rotation.y += target.x * 0.25
    group.rotation.x += target.y * 0.15

    renderer.render(scene, camera)
  }
  animate()

  // ── Nettoyage ─────────────────────────────────────────────
  return function destroy() {
    cancelAnimationFrame(rafId)
    window.removeEventListener("mousemove", onMouseMove)
    renderer.dispose()
    planeGeo.dispose()
    planeMat.dispose()
    texture.dispose()
  }
}
