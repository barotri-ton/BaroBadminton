import * as THREE from 'three';

// Lightweight WebGL scene. The Canvas 2D game remains the fallback when WebGL is unavailable.
export function create3DRenderer(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#112f3d');
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 10.8, 15.5);
  camera.lookAt(0, 0.1, -0.35);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  Object.assign(renderer.domElement.style, { position: 'absolute', pointerEvents: 'none', zIndex: '1', display: 'block' });
  canvas.insertAdjacentElement('afterend', renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3d6976, 2.2));
  const sunlight = new THREE.DirectionalLight(0xffffff, 1.8);
  sunlight.position.set(-4, 12, 8);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  sunlight.shadow.camera.left = -9;
  sunlight.shadow.camera.right = 9;
  sunlight.shadow.camera.top = 10;
  sunlight.shadow.camera.bottom = -10;
  sunlight.shadow.bias = -0.0005;
  scene.add(sunlight);
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
  scene.fog = new THREE.Fog('#112f3d', 26, 52);
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
  ground.receiveShadow = true;
  scene.add(ground);
  const court = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 13.4), mat('#23866c'));
  court.rotation.x = -Math.PI / 2;
  court.receiveShadow = true;
  scene.add(court);
  const border = new THREE.Mesh(new THREE.PlaneGeometry(9, 16.2), mat('#aa5643'));
  border.rotation.x = -Math.PI / 2;
  border.position.y = -0.022;
  scene.add(border);
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
  const meshMaterial = new THREE.LineBasicMaterial({ color: '#d7f6f1', transparent: true, opacity: 0.58 });
  const meshVertices = [];
  for (let x = -3.15; x <= 3.16; x += 0.2) meshVertices.push(x, 0.03, 0, x, 1.5, 0);
  for (let y = 0.08; y <= 1.5; y += 0.17) meshVertices.push(-3.18, y, 0, 3.18, y, 0);
  const meshGeometry = new THREE.BufferGeometry();
  meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(meshVertices, 3));
  scene.add(new THREE.LineSegments(meshGeometry, meshMaterial));
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
    body.castShadow = true;
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
      limb.castShadow = true;
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
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.28), mat('#f8fafc'));
    collar.position.y = 1.23;
    group.add(collar);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.225, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#20242e'));
    hair.position.y = 1.61;
    group.add(hair);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), mat('#f5d0ad'));
    head.position.y = 1.56;
    head.castShadow = true;
    group.add(head);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat('#dfad8f'));
    nose.position.set(0, 1.53, 0.215);
    group.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.016, 0.015), mat('#9d5b59'));
    mouth.position.set(0, 1.46, 0.215);
    group.add(mouth);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), mat('#20242e'));
      eye.position.set(side * 0.085, 1.59, 0.195);
      group.add(eye);
    }
    const racket = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 6, 14), mat('#e5edf5'));
    racket.position.set(0.48, 1.38, 0);
    racket.rotation.z = 0.35;
    group.add(racket);
    const strings = new THREE.Group();
    const stringMat = new THREE.LineBasicMaterial({ color: '#e3f5f4', transparent: true, opacity: 0.7 });
    const stringPoints = [];
    for (let k = -3; k <= 3; k++) {
      const v = k * 0.065;
      const half = Math.sqrt(Math.max(0, 0.23 * 0.23 - v * v));
      stringPoints.push(v, -half, 0, v, half, 0, -half, v, 0, half, v, 0);
    }
    const stringGeo = new THREE.BufferGeometry();
    stringGeo.setAttribute('position', new THREE.Float32BufferAttribute(stringPoints, 3));
    strings.add(new THREE.LineSegments(stringGeo, stringMat));
    strings.position.copy(racket.position);
    strings.rotation.copy(racket.rotation);
    group.add(strings);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.68, 6), mat('#d4e0ed'));
    shaft.position.set(0.3, 0.94, 0);
    shaft.rotation.z = -0.6;
    group.add(shaft);
    scene.add(group);
    return { group, legs, arms, racket, strings, shaft, previous: new THREE.Vector3(), stride: 0 };
  }
  const user = athlete('#4fb7ff');
  const opponent = athlete('#f26c79');
  opponent.group.rotation.y = Math.PI;
  const floorRing = new THREE.Mesh(new THREE.RingGeometry(3.3, 3.38, 64), new THREE.MeshBasicMaterial({color:'#58bba1', transparent:true, opacity:0.35, side:THREE.DoubleSide}));
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.position.y = 0.018;
  scene.add(floorRing);
  const shuttle = new THREE.Group();
  const cork = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat('#f4c566'));
  shuttle.add(cork);
  const feathers = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.38, 10), mat('#fffdf1', { side: THREE.DoubleSide }));
  feathers.position.y = 0.24;
  shuttle.add(feathers);
  scene.add(shuttle);
  const landingMarker = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.37, 28), new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }));
  landingMarker.rotation.x = -Math.PI / 2;
  landingMarker.position.y = 0.035;
  scene.add(landingMarker);
  let disposed = false;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastTime = 0;
  const lookTarget = new THREE.Vector3(0, 0.4, -0.4);
  let lastSwingPulse = 0;
  let swingStart = -1000;
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
      camera.fov = camera.aspect < 0.7 ? 42 : 39;
      camera.updateProjectionMatrix();
      lastWidth = width;
      lastHeight = height;
    }
    const now = performance.now();
    const frameDelta = Math.min((now - lastTime) / 1000 || 0, 0.05);
    lastTime = now;
    if (state.swingPulse !== lastSwingPulse) {
      lastSwingPulse = state.swingPulse;
      swingStart = now;
    }
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
    const swingProgress = Math.min(1, (now - swingStart) / 420);
    const swingAngle = swingProgress < 1 ? Math.sin(swingProgress * Math.PI) * 1.5 : 0;
    user.arms[1].rotation.x = -swingAngle;
    user.racket.rotation.z = 0.35 - swingAngle * 0.3;
    user.strings.rotation.z = user.racket.rotation.z;
    const focusX = (state.ball.x - 0.5) * 0.65;
    const focusZ = (state.ball.y - 0.5) * 1.2;
    const smooth = 1 - Math.exp(-frameDelta * 2.5);
    lookTarget.x += (focusX - lookTarget.x) * smooth;
    lookTarget.z += (focusZ - 0.4 - lookTarget.z) * smooth;
    camera.lookAt(lookTarget);
    shuttle.position.set((state.ball.x - 0.5) * 6.1, 0.25 + state.ball.z * 2.8, (state.ball.y - 0.5) * 13.4);
    const landing = state.landing;
    landingMarker.visible = Boolean(landing && landing.x >= 0 && landing.x <= 1 && landing.y >= 0 && landing.y <= 1);
    if (landingMarker.visible) {
      landingMarker.position.set((landing.x - 0.5) * 6.1, 0.035, (landing.y - 0.5) * 13.4);
      landingMarker.scale.setScalar(0.88 + Math.sin(now * 0.007) * 0.12);
    }
    renderer.render(scene, camera);
  }
  function dispose() { disposed = true; renderer.dispose(); renderer.domElement.remove(); }
  return { render, dispose };
}
