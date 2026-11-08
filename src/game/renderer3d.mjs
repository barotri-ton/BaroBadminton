import * as THREE from 'three';
import { athletePose } from './athlete-pose.mjs';

// Lightweight WebGL scene. The Canvas 2D game remains the fallback when WebGL is unavailable.
export function create3DRenderer(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#112f3d');
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
  camera.position.set(0, 10.8, 15.5);
  camera.lookAt(0, 0.1, -0.35);
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
  // Limit GPU fill rate on mobile portrait displays.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
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
  sunlight.shadow.mapSize.set(512, 512);
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
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.215, 0.22, 10), mat(color));
    waist.position.y = 0.56;
    waist.castShadow = true;
    group.add(waist);
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.25, 0.33), mat('#183c55'));
    shorts.position.y = 0.46;
    group.add(shorts);
    const shirtStripe = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.49, 0.015), mat('#e8fff7'));
    shirtStripe.position.set(-0.14, 0.92, 0.255);
    group.add(shirtStripe);
    const legs = [];
    const feet = [];
    const knees = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * 0.14, 0.38, 0);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.39, 3, 6), mat('#f1c7a4'));
      limb.position.y = -0.23;
      limb.castShadow = true;
      leg.add(limb);
      const knee = new THREE.Group();
      knee.position.y = -0.37;
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.067, 0.18, 3, 6), mat('#f1c7a4'));
      shin.position.y = -0.12;
      shin.castShadow = true;
      knee.add(shin);
      leg.add(knee);
      knees.push(knee);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.37), mat('#f5f7fc'));
      shoe.position.set(0, -0.57, 0.09);
      knee.add(shoe);
      shoe.position.y += 0.37;
      group.add(leg);
      legs.push(leg);
      feet.push(shoe);
    }
    const eyes = [];
    const arms = [];
    const elbows = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.32, 1.13, 0);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.43, 3, 6), mat('#f1c7a4'));
      limb.position.y = -0.27;
      arm.add(limb);
      const elbow = new THREE.Group();
      elbow.position.y = -0.42;
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.063, 0.19, 3, 6), mat('#f1c7a4'));
      forearm.position.y = -0.11;
      elbow.add(forearm);
      arm.add(elbow);
      elbows.push(elbow);
      group.add(arm);
      arms.push(arm);
    }
    const wristbands = [];
    for (const elbow of elbows) {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.09, 8), mat('#f4f8ff'));
      band.position.y = -0.19;
      elbow.add(band);
      wristbands.push(band);
    }
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.28), mat('#f8fafc'));
    collar.position.y = 1.23;
    group.add(collar);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.225, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#20242e'));
    hair.position.y = 1.61;
    group.add(hair);
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.38), mat('#20242e'));
    fringe.position.set(0, 1.7, 0.06);
    group.add(fringe);
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
      eyes.push(eye);
    }
    const racket = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 6, 14), mat('#e5edf5'));
    racket.position.set(0.48, 1.38, 0);
    racket.rotation.z = 0.35;
    const racketRig = new THREE.Group();
    racketRig.position.set(0.32, 1.04, 0);
    group.add(racketRig);
    racketRig.add(racket);
    racket.position.sub(racketRig.position);
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
    racketRig.add(strings);
    // Strings and frame share the same wrist-relative coordinate system.

    // Racket geometry is local to the wrist: grip at origin, head above the grip.
    racket.position.set(0.16, 0.55, 0);
    strings.position.copy(racket.position);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.48, 6), mat('#d4e0ed'));
    shaft.position.set(0.085, 0.245, 0);
    shaft.rotation.z = -0.34;
    racketRig.add(shaft);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.20, 8), mat('#26384c'));
    grip.position.y = 0.015;
    racketRig.add(grip);
    // Hierarchical upper-body rig: pivot at waist, independent from the legs.
    // Preserve existing world-space pose when moving parts into the torso.
    const torsoRig = new THREE.Group();
    torsoRig.position.y = 0.75;
    group.add(torsoRig);
    for (const part of [body, shirtStripe, collar, hair, fringe, head, nose, mouth, ...eyes, ...arms, racketRig]) {
      group.remove(part);
      torsoRig.add(part);
      part.position.y -= torsoRig.position.y;
    }
    // Attach the racket to the dominant forearm, so elbow flexion moves the racket too.
    torsoRig.remove(racketRig);
    elbows[1].add(racketRig);
    racketRig.position.set(0, -0.24, 0);
    scene.add(group);
    return { group, torsoRig, legs, knees, feet, arms, elbows, racket, racketRig, strings, shaft, previous: new THREE.Vector3(), poseInitialized: false, stride: 0, facing: 0 };
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
  const impactRing = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.23, 24), new THREE.MeshBasicMaterial({ color: '#fff2a5', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  impactRing.rotation.x = -Math.PI / 2;
  impactRing.visible = false;
  scene.add(impactRing);
  const shuttleTrail = [];
  const trailMaterial = new THREE.MeshBasicMaterial({ color: '#f6fff4', transparent: true, depthWrite: false });
  for (let i = 0; i < 5; i++) {
    const ghost = new THREE.Mesh(new THREE.SphereGeometry(0.045 - i * 0.006, 6, 4), trailMaterial.clone());
    ghost.material.opacity = 0.32 - i * 0.052;
    ghost.visible = false;
    scene.add(ghost);
    shuttleTrail.push(ghost);
  }
  const landingMarker = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.37, 28), new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }));
  landingMarker.rotation.x = -Math.PI / 2;
  landingMarker.position.y = 0.035;
  scene.add(landingMarker);
  let disposed = false;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastTime = 0;
  const lookTarget = new THREE.Vector3(0, 0.4, -0.4);
  const cameraGoal = new THREE.Vector3(0, 10.8, 15.5);
  let lastSwingPulse = 0;
  let swingStart = -1000;
  let currentShot = 'clear';
  let impactPosition = new THREE.Vector3();
  let impactStart = -1000;
  let lastAiSwingPulse = 0;
  let opponentSwingStart = -1000;
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
      camera.fov = camera.aspect < 0.7 ? 47 : 39;
      camera.updateProjectionMatrix();
      lastWidth = width;
      lastHeight = height;
    }
    const now = performance.now();
    const frameDelta = lastTime ? Math.max(0, Math.min((now - lastTime) / 1000, 0.05)) : 1 / 60;
    lastTime = now;
    if (state.swingPulse !== lastSwingPulse) {
      lastSwingPulse = state.swingPulse;
      swingStart = now;
      currentShot = state.shotType || 'clear';
      impactStart = now;
      impactPosition.set((state.ball.x - .5) * 6.1, 0.06, (state.ball.y - .5) * 13.4);
    }
    function animateAthlete(actor, position) {
      const x = (position.x - 0.5) * 6.1;
      const z = (position.y - 0.5) * 13.4;
      // First render is a placement, not a sprint across the court.
      if (!actor.poseInitialized) {
        actor.previous.set(x, 0, z);
        actor.poseInitialized = true;
      }
      const distance = Math.hypot(x - actor.previous.x, z - actor.previous.z);
      const moving = distance > 0.002 && distance < 3;
      const dx = x - actor.previous.x;
      const dz = z - actor.previous.z;
      const pose = athletePose({dx, dz, dt:frameDelta || 1/60, stride:actor.stride});
      actor.stride = pose.stride;
      const gait = moving ? pose.gait : 0;
      const lateral = moving ? pose.lateral : 0;
      actor.legs[0].rotation.x = gait;
      actor.legs[1].rotation.x = -gait;
      const poseSmooth = 1 - Math.exp(-frameDelta * 15);
      actor.legs[0].rotation.z = THREE.MathUtils.lerp(actor.legs[0].rotation.z, lateral, poseSmooth);
      actor.legs[1].rotation.z = THREE.MathUtils.lerp(actor.legs[1].rotation.z, -lateral, poseSmooth);
      actor.knees[0].rotation.x = Math.max(0, gait) * 0.38;
      actor.knees[1].rotation.x = Math.max(0, -gait) * 0.38;
      actor.elbows[0].rotation.x = Math.max(0, -gait) * 0.22;
      actor.elbows[1].rotation.x = Math.max(0, gait) * 0.22;
      actor.feet[0].rotation.x = -Math.max(0, gait) * 0.28;
      actor.feet[1].rotation.x = Math.min(0, gait) * 0.28;
      actor.arms[0].rotation.x = -gait * 0.5;
      actor.arms[1].rotation.x = gait * 0.5;
      actor.torsoRig.rotation.z = THREE.MathUtils.lerp(actor.torsoRig.rotation.z, moving ? pose.leanZ : 0, poseSmooth);
      actor.torsoRig.rotation.x = THREE.MathUtils.lerp(actor.torsoRig.rotation.x, moving ? pose.leanX : 0, poseSmooth);
      actor.group.position.set(x, moving ? Math.abs(Math.sin(actor.stride)) * 0.045 : Math.sin(now * 0.002) * 0.009, z);
      actor.previous.set(x, 0, z);
    }
    animateAthlete(user, state.player);
    animateAthlete(opponent, state.bot);
    if (state.aiSwingPulse !== lastAiSwingPulse) {
      lastAiSwingPulse = state.aiSwingPulse;
      opponentSwingStart = now;
    }
    const opponentSwingProgress = Math.min(1, (now - opponentSwingStart) / 440);
    const opponentSwingAngle = opponentSwingProgress < 1 ? Math.sin(opponentSwingProgress * Math.PI) : 0;
    opponent.arms[1].rotation.x = -opponentSwingAngle * 1.4;
    opponent.elbows[1].rotation.x = -opponentSwingAngle * 0.8;
    opponent.racketRig.rotation.x = -opponentSwingAngle * 1.05;
    opponent.racketRig.rotation.z = -opponentSwingAngle * 0.3;
    const duration = currentShot === 'smash' ? 330 : currentShot === 'drop' ? 540 : 430;
    const swingProgress = Math.min(1, (now - swingStart) / duration);
    const attackPose = athletePose({shot:currentShot,swingProgress});
    const swingAngle = attackPose.swing;
    user.group.position.y += attackPose.jump;
    user.legs[0].rotation.x += currentShot === 'smash' && swingProgress < 1 ? 0.18 : 0;
    const impactAge = (now - impactStart) / 380;
    impactRing.visible = impactAge >= 0 && impactAge < 1;
    if (impactRing.visible) {
      impactRing.position.copy(impactPosition);
      impactRing.scale.setScalar(0.7 + impactAge * 3.2);
      impactRing.material.opacity = (1 - impactAge) * 0.75;
    }
    user.arms[1].rotation.x = -swingAngle;
    user.elbows[1].rotation.x = -swingAngle * 0.45;
    user.racket.rotation.z = 0.35 - swingAngle * 0.3;
    user.strings.rotation.z = user.racket.rotation.z;
    user.racketRig.rotation.x = -swingAngle * 0.72;
    user.racketRig.rotation.z = -swingAngle * 0.28;
    const portrait = camera.aspect < 0.7;
    const focusX = (state.ball.x - 0.5) * 0.5 + (state.player.x - 0.5) * 0.35;
    const focusZ = (state.ball.y - 0.5) * 0.85;
    const smooth = 1 - Math.exp(-frameDelta * 2.5);
    lookTarget.x += (focusX - lookTarget.x) * smooth;
    lookTarget.z += (focusZ - 0.4 - lookTarget.z) * smooth;
    cameraGoal.set((state.player.x - 0.5) * 1.1, portrait ? 12.5 : 10.8, portrait ? 17.5 : 15.5);
    camera.position.lerp(cameraGoal, smooth * 0.55);
    camera.lookAt(lookTarget);
    shuttle.position.set((state.ball.x - 0.5) * 6.1, 0.25 + state.ball.z * 2.8, (state.ball.y - 0.5) * 13.4);
    const trailLength = Math.hypot(state.ball.vx, state.ball.vy);
    for (let i = 0; i < shuttleTrail.length; i++) {
      const ghost = shuttleTrail[i];
      ghost.visible = trailLength > 0.35 && state.ball.z > 0;
      ghost.position.set(shuttle.position.x - state.ball.vx * (i + 1) * 0.26 * 6.1, shuttle.position.y - (state.ball.vzVelocity || 0) * (i + 1) * 0.09, shuttle.position.z - state.ball.vy * (i + 1) * 0.26 * 13.4);
    }
    const landing = state.landing;
    landingMarker.visible = Boolean(landing && landing.x >= 0 && landing.x <= 1 && landing.y >= 0 && landing.y <= 1);
    if (landingMarker.visible) {
      landingMarker.position.set((landing.x - 0.5) * 6.1, 0.035, (landing.y - 0.5) * 13.4);
      landingMarker.scale.setScalar(0.88 + Math.sin(now * 0.007) * 0.12);
    }
    renderer.render(scene, camera);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    // Dispose shared geometries/materials only once, including lines and shadows.
    const geometries = new Set();
    const materials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) {
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    renderer.renderLists.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  return { render, dispose };
}
