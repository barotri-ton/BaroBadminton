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
  scene.fog = new THREE.Fog('#112f3d', 24, 54);
  const arena = new THREE.Group();
  scene.add(arena);
  // Arena architecture: lightweight geometry, no textures or network requests.
  const standMaterial = mat('#193e50');
  const seatMaterial = mat('#2a5969');
  for (const side of [-1, 1]) {
    for (let tier = 0; tier < 4; tier++) {
      const stand = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 18 + tier * 1.4), standMaterial);
      stand.position.set(side * (5.5 + tier * 1.6), tier * 0.62 + 0.15, 0);
      arena.add(stand);
      const seats = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 17 + tier * 1.4), seatMaterial);
      seats.position.set(side * (5.5 + tier * 1.6), tier * 0.62 + 0.49, 0);
      arena.add(seats);
    }
  }
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 0.5), mat('#173647'));
  backWall.position.set(0, 2.9, -12);
  arena.add(backWall);
  for (const x of [-8, 0, 8]) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.28), new THREE.MeshBasicMaterial({ color: 0xe8fff4 }));
    light.position.set(x, 8.5, 0);
    arena.add(light);
  }
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
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.25, 0.33), mat('#183c55'));
    shorts.position.y = 0.46;
    group.add(shorts);
    const legs = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * 0.14, 0.38, 0);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.39, 3, 6), mat('#f1c7a4'));
      limb.position.y = -0.23;
      leg.add(limb);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.37), mat('#f5f7fc'));
      shoe.position.set(0, -0.57, 0.09);
      leg.add(shoe);
      group.add(leg);
      legs.push(leg);
    }
    const arms = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.32, 1.13, 0);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.43, 3, 6), mat('#f1c7a4'));
      limb.position.y = -0.27;
      arm.add(limb);
      group.add(arm);
      arms.push(arm);
    }
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
    return { group, legs, arms, racket, shaft, previous: new THREE.Vector3(), stride: 0 };
  }
  const user = athlete('#4fb7ff');
  const opponent = athlete('#f26c79');
  opponent.group.rotation.y = Math.PI;
  const shuttle = new THREE.Group();
  const cork = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat('#f4c566'));
  shuttle.add(cork);
  const feathers = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.38, 10), mat('#fffdf1', { side: THREE.DoubleSide }));
  feathers.position.y = 0.24;
  shuttle.add(feathers);
  scene.add(shuttle);
  let disposed = false;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastTime = 0;
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
    if (width !== lastWidth || height !== lastHeight) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = camera.aspect < 0.7 ? 55 : 46;
      camera.updateProjectionMatrix();
      lastWidth = width;
      lastHeight = height;
    }
    const now = performance.now();
    lastTime = now;
    function animateAthlete(actor, position) {
      const x = (position.x - 0.5) * 6.1;
      const z = (position.y - 0.5) * 13.4;
      const distance = Math.hypot(x - actor.previous.x, z - actor.previous.z);
      const moving = distance > 0.002;
      if (moving) actor.stride += Math.min(distance, 0.2) * 12;
      const gait = moving ? Math.sin(actor.stride) * 0.42 : 0;
      actor.legs[0].rotation.x = gait;
      actor.legs[1].rotation.x = -gait;
      actor.arms[0].rotation.x = -gait * 0.5;
      actor.arms[1].rotation.x = gait * 0.5;
      actor.group.position.set(x, moving ? Math.abs(Math.sin(actor.stride)) * 0.045 : 0, z);
      actor.previous.set(x, 0, z);
    }
    animateAthlete(user, state.player);
    animateAthlete(opponent, state.bot);
    shuttle.position.set((state.ball.x - 0.5) * 6.1, 0.25 + state.ball.z * 2.8, (state.ball.y - 0.5) * 13.4);
    renderer.render(scene, camera);
  }
  function dispose() { disposed = true; renderer.dispose(); renderer.domElement.remove(); }
  return { render, dispose };
}
