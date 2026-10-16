import * as THREE from "three";
import { FontLoader } from "./vendor/FontLoader.js";
import { TextGeometry } from "./vendor/TextGeometry.js";

// Original decorative characters, built from simple 3D geometry.
// The scene illustrates the research theme; all actual research figures live in HTML.
export async function createScene(host, onUnavailable) {
  const canvasHost = host.querySelector("#scene-canvas");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const font = await new FontLoader().loadAsync(
    new URL("./vendor/helvetiker_bold.typeface.json", import.meta.url).href
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute("aria-hidden", "true");
  canvasHost.replaceChildren(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 90);
  const materials = [];
  const geometries = new Set();
  function material(options) {
    const value = new THREE.MeshStandardMaterial(options);
    materials.push(value);
    return value;
  }
  const shell = material({ color: 0xe7e3d9, roughness: .55, metalness: .08 });
  const joint = material({ color: 0x535b5d, roughness: .6 });
  const trim = material({ color: 0x9e332d, roughness: .46, metalness: .12 });
  const face = material({ color: 0x242b30, roughness: .25, metalness: .15 });
  const eyes = material({ color: 0xfff5d8, emissive: 0xffefd2, emissiveIntensity: .45 });
  const floorMaterial = material({ color: 0xf4f3ef, roughness: .9 });
  const wallMaterial = material({ color: 0xf4f3ef, roughness: 1 });
  const titleMaterial = material({ color: 0x9e332d, roughness: .36, metalness: .12 });

  function mesh(geometry, surface, parent, x = 0, y = 0, z = 0) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const hemisphere = new THREE.HemisphereLight(0xffffff, 0xbcb5a6, 2.4);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight(0xfff8ec, 3.8);
  key.position.set(-5, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -7;
  key.shadow.normalBias = .04;
  key.shadow.bias = -.0002;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 1.3);
  fill.position.set(7, 4, 2);
  scene.add(fill);

  const floor = mesh(new THREE.PlaneGeometry(80, 80), floorMaterial, scene);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;
  const wall = mesh(new THREE.PlaneGeometry(80, 30), wallMaterial, scene, 0, 10, -4);
  wall.castShadow = false;
  const grid = new THREE.GridHelper(80, 80, 0xd0b4a4, 0xded8cd);
  grid.position.y = .009;
  grid.material.transparent = true;
  grid.material.opacity = .65;
  scene.add(grid);
  geometries.add(grid.geometry);
  const wallGrid = new THREE.GridHelper(80, 80, 0xded8cd, 0xded8cd);
  wallGrid.rotation.x = Math.PI / 2;
  wallGrid.position.set(0, 10, -3.99);
  wallGrid.material.transparent = true;
  wallGrid.material.opacity = .4;
  scene.add(wallGrid);
  geometries.add(wallGrid.geometry);

  const titleGeometry = new TextGeometry("Hritam Basak", {
    font, size: 1.45, depth: .18, curveSegments: 6,
    bevelEnabled: true, bevelThickness: .018, bevelSize: .012, bevelSegments: 2,
  });
  titleGeometry.computeBoundingBox();
  const bounds = titleGeometry.boundingBox;
  titleGeometry.translate(-(bounds.max.x + bounds.min.x) / 2, -bounds.min.y, 0);
  const title = mesh(titleGeometry, titleMaterial, scene, 0, 2.5, -.4);
  const titleScale = 11.4 / (bounds.max.x - bounds.min.x);
  title.scale.setScalar(titleScale);

  // Limbs use actual pivots so walking and reaching move as a coherent body.
  function robot(x, z, scale, angle) {
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    root.scale.setScalar(scale);
    root.rotation.y = angle;
    scene.add(root);
    const torso = mesh(new THREE.CapsuleGeometry(.32, .3, 4, 12), shell, root, 0, 1.25, 0);
    torso.scale.z = .8;
    const badge = mesh(new THREE.BoxGeometry(.25, .13, .045), trim, root, 0, 1.36, .272);
    badge.rotation.x = -.1;
    const head = new THREE.Group();
    head.position.y = 1.94;
    root.add(head);
    const helmet = mesh(new THREE.SphereGeometry(.285, 18, 12), shell, head);
    helmet.scale.set(1.05, 1, .97);
    const visor = mesh(new THREE.SphereGeometry(.24, 16, 10), face, head, 0, .015, .21);
    visor.scale.set(1.04, .43, .52);
    for (const offset of [-.087, .087]) {
      const eye = mesh(new THREE.SphereGeometry(.027, 8, 6), eyes, head, offset, .022, .343);
      eye.castShadow = false;
    }
    mesh(new THREE.CylinderGeometry(.011, .011, .11, 6), joint, head, .16, .32, 0);
    mesh(new THREE.SphereGeometry(.027, 8, 6), trim, head, .16, .39, 0);
    function arm(side) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * .37, 1.51, 0);
      root.add(shoulder);
      mesh(new THREE.SphereGeometry(.1, 10, 8), joint, shoulder);
      mesh(new THREE.CapsuleGeometry(.095, .19, 3, 8), shell, shoulder, 0, -.18, 0);
      const elbow = new THREE.Group();
      elbow.position.y = -.37;
      shoulder.add(elbow);
      mesh(new THREE.SphereGeometry(.075, 8, 6), joint, elbow);
      mesh(new THREE.CapsuleGeometry(.082, .18, 3, 8), shell, elbow, 0, -.17, 0);
      const hand = mesh(new THREE.SphereGeometry(.1, 10, 8), trim, elbow, 0, -.35, .012);
      hand.scale.set(.85, 1.1, .85);
      return { shoulder, elbow };
    }
    function leg(side) {
      const hip = new THREE.Group();
      hip.position.set(side * .17, .87, 0);
      root.add(hip);
      mesh(new THREE.CapsuleGeometry(.116, .19, 3, 8), shell, hip, 0, -.18, 0);
      const knee = new THREE.Group();
      knee.position.y = -.37;
      hip.add(knee);
      mesh(new THREE.SphereGeometry(.09, 8, 6), joint, knee);
      mesh(new THREE.CapsuleGeometry(.097, .16, 3, 8), shell, knee, 0, -.17, 0);
      const shoe = mesh(new THREE.SphereGeometry(.13, 12, 8), trim, knee, 0, -.37, .045);
      shoe.scale.set(1, .65, 1.8);
      return { hip, knee };
    }
    return { root, head, leftArm: arm(-1), rightArm: arm(1), leftLeg: leg(-1), rightLeg: leg(1) };
  }
  const walker = robot(-4.6, 2.05, 1.02, .25);
  const maker = robot(4.45, 1.95, 1.02, -.27);
  const sitter = robot(-4.94, -.15, .43, .05);
  // Seat the body on the capital H rather than above a shorter lowercase letter.
  sitter.root.position.y = title.position.y + titleGeometry.boundingBox.max.y * titleScale - .34;
  for (const leg of [sitter.leftLeg, sitter.rightLeg]) {
    leg.hip.rotation.x = -1.2;
    leg.knee.rotation.x = 1.4;
  }
  sitter.leftArm.shoulder.rotation.z = -.17;
  sitter.rightArm.shoulder.rotation.z = .17;

  const plinth = mesh(new THREE.CylinderGeometry(.46, .52, .35, 24), shell, scene, 3.55, .175, 2.15);
  plinth.receiveShadow = true;
  const cube = mesh(new THREE.BoxGeometry(.37, .37, .37), trim, scene, 3.55, .64, 2.15);
  cube.rotation.y = .35;

  let active = false;
  let paused = false;
  let inView = true;
  let disposed = false;
  let frame = 0;
  let lastTime = 0;
  let motionTime = 0;
  let previousRender = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  function pose(time) {
    const phase = time * 2.7;
    for (const [leg, offset] of [[walker.leftLeg, 0], [walker.rightLeg, Math.PI]]) {
      leg.hip.rotation.x = Math.sin(phase + offset) * .42;
      leg.knee.rotation.x = Math.max(0, Math.sin(phase + offset)) * .62;
    }
    walker.leftArm.shoulder.rotation.x = -Math.sin(phase) * .34;
    walker.rightArm.shoulder.rotation.x = Math.sin(phase) * .34;
    walker.leftArm.elbow.rotation.x = -.2;
    walker.rightArm.elbow.rotation.x = -.2;
    walker.root.position.y = .035 + Math.abs(Math.sin(phase)) * .035;
    walker.head.rotation.y = -.12 + Math.sin(time * .7) * .12;
    const reach = (Math.sin(time * 1.3) + 1) / 2;
    maker.leftArm.shoulder.rotation.z = -.8 - reach * .2;
    maker.leftArm.shoulder.rotation.x = -.25;
    maker.leftArm.elbow.rotation.x = -.18 - reach * .5;
    maker.rightArm.shoulder.rotation.z = .1;
    maker.rightArm.elbow.rotation.x = -.28;
    maker.head.rotation.y = -.3;
    cube.position.y = .64 + reach * .1;
    sitter.head.rotation.y = Math.sin(time * .8) * .22;
  }
  function render() {
    if (disposed || !active) return;
    const aspect = camera.aspect;
    camera.position.set(pointerX * .65, 5.3 + pointerY * .24, aspect < 1.5 ? 16.6 : 15.1);
    camera.lookAt(0, 1.85, 0);
    renderer.render(scene, camera);
  }
  function canAnimate() {
    return active && inView && !document.hidden && !paused && !reducedMotion.matches;
  }
  function tick(time) {
    frame = 0;
    if (!canAnimate()) return;
    if (time - previousRender >= 1000 / 30) {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, .06) : 0;
      lastTime = time;
      previousRender = time;
      motionTime += delta;
      pointerX += (targetX - pointerX) * .09;
      pointerY += (targetY - pointerY) * .09;
      pose(motionTime);
      render();
    }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (canAnimate() && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height || !active) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  function theme() {
    const dark = document.documentElement.dataset.theme === "dark";
    scene.background = new THREE.Color(dark ? 0x191d20 : 0xf4f3ef);
    scene.fog = new THREE.Fog(dark ? 0x191d20 : 0xf4f3ef, 23, 50);
    floorMaterial.color.set(dark ? 0x262b2d : 0xf4f3ef);
    wallMaterial.color.set(dark ? 0x191d20 : 0xf4f3ef);
    titleMaterial.color.set(dark ? 0xcb6557 : 0x9e332d);
    grid.material.color.set(dark ? 0x434a4d : 0xded8cd);
    wallGrid.material.color.set(dark ? 0x434a4d : 0xded8cd);
    render();
  }
  function move(event) {
    if (reducedMotion.matches || paused || !active) return;
    const bounds = host.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
  }
  function leave() { targetX = targetY = 0; }
  function visibility() { if (document.hidden) stop(); else schedule(); }
  function preference() {
    pointerX = pointerY = targetX = targetY = 0;
    if (reducedMotion.matches) { stop(); pose(0); render(); } else schedule();
  }
  function lost(event) {
    event.preventDefault();
    stop();
    onUnavailable();
  }
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  reducedMotion.addEventListener("change", preference);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  const viewObserver = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) schedule(); else stop();
  });
  viewObserver.observe(host);
  const themeObserver = new MutationObserver(theme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  pose(0);
  theme();

  return {
    setActive(value) {
      active = value;
      if (value) { resize(); render(); schedule(); } else stop();
    },
    setPaused(value) {
      paused = value;
      if (value) stop(); else schedule();
    },
    dispose() {
      disposed = true;
      stop();
      sizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      reducedMotion.removeEventListener("change", preference);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(value => value.dispose());
      grid.material.dispose();
      wallGrid.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
