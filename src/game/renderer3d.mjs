import * as THREE from 'three';

// Lightweight WebGL scene. The Canvas 2D game remains the fallback when WebGL is unavailable.
export function create3DRenderer(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#112f3d');
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 13.5, 19.5);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  Object.assign(renderer.domElement.style, { position: 'absolute', pointerEvents: 'none', zIndex: '1', display: 'block' });
  canvas.insertAdjacentElement('afterend', renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3d6976, 2.2));
  const sunlight = new THREE.DirectionalLight(0xffffff, 1.8);
  sunlight.position.set(-4, 12, 8);
  scene.add(sunlight);
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 36), mat('#123d48'));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.04;
  scene.add(ground);
  const court = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 13.4), mat('#23866c'));
  court.rotation.x = -Math.PI / 2;
  scene.add(court);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xe9fff4 });
  function line(x1, z1, x2, z2, width = 0.045) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.015, length), lineMat);
    mesh.position.set((x1 + x2) / 2, 0.014, (z1 + z2) / 2);
    mesh.rotation.y = Math.atan2(x2 - x1, z2 - z1);
    scene.add(mesh);
  }
  for (const x of [-3.05, 3.05]) line(x, -6.7, x, 6.7);
  for (const z of [-6.7, 6.7, -1.98, 1.98]) line(-3.05, z, 3.05, z);
  line(0, -6.7, 0, -1.98);
  line(0, 1.98, 0, 6.7);
  // Singles sidelines are 2.59 m from the centre line.
  for (const x of [-2.59, 2.59]) line(x, -6.7, x, 6.7, 0.03);
  const net = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.55), new THREE.MeshBasicMaterial({ color: 0xc9e5e8, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false }));
  net.position.set(0, 0.775, 0);
  scene.add(net);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.045, 0.035), lineMat);
  tape.position.set(0, 1.55, 0);
  scene.add(tape);
  for (const x of [-3.2, 3.2]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.55, 8), mat('#e3e9ee'));
    post.position.set(x, 0.775, 0);
    scene.add(post);
  }
  function athlete(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.58, 4, 8), mat(color));
    body.position.y = 0.85;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat('#f5d0ad'));
    head.position.y = 1.56;
    group.add(head);
    const racket = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 6, 14), mat('#e5edf5'));
    racket.position.set(0.48, 1.38, 0);
    racket.rotation.z = 0.35;
    group.add(racket);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.68, 6), mat('#d4e0ed'));
    shaft.position.set(0.3, 0.94, 0);
    shaft.rotation.z = -0.6;
    group.add(shaft);
    scene.add(group);
    return group;
  }
  const user = athlete('#4fb7ff');
  const opponent = athlete('#f26c79');
  opponent.rotation.y = Math.PI;
  const shuttle = new THREE.Group();
  const cork = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat('#f4c566'));
  shuttle.add(cork);
  const feathers = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.38, 10), mat('#fffdf1', { side: THREE.DoubleSide }));
  feathers.position.y = 0.24;
  shuttle.add(feathers);
  scene.add(shuttle);
  let disposed = false;
  function render(state) {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const parentRect = canvas.offsetParent?.getBoundingClientRect();
    const offsetTop = parentRect ? rect.top - parentRect.top : canvas.offsetTop;
    const offsetLeft = parentRect ? rect.left - parentRect.left : canvas.offsetLeft;
    renderer.domElement.style.top = offsetTop + 'px';
    renderer.domElement.style.left = offsetLeft + 'px';
    renderer.domElement.style.width = rect.width + 'px';
    renderer.domElement.style.height = rect.height + 'px';
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 0.7 ? 55 : 46;
    camera.updateProjectionMatrix();
    user.position.set((state.player.x - 0.5) * 6.1, 0, (state.player.y - 0.5) * 13.4);
    opponent.position.set((state.bot.x - 0.5) * 6.1, 0, (state.bot.y - 0.5) * 13.4);
    shuttle.position.set((state.ball.x - 0.5) * 6.1, 0.25 + state.ball.z * 2.8, (state.ball.y - 0.5) * 13.4);
    renderer.render(scene, camera);
  }
  function dispose() { disposed = true; renderer.dispose(); renderer.domElement.remove(); }
  return { render, dispose };
}
