/**
 * ============================================================================
 * THREE.JS 3D COFFEE & CROISSANT BREAK SCENE (coffee3d.js)
 * University of Fribourg (UniFR) — Practical AI Automation Command Center
 * ============================================================================
 * Procedurally generated 3D coffee mug, saucer, espresso, rising steam,
 * and golden crescent croissant with interactive 360° mouse/touch rotation.
 */

window.Coffee3D = (function () {
  let scene, camera, renderer;
  let mainGroup;
  let steamParticles = [];
  let animId = null;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotationY = 0;
  let targetRotationX = 0.2;
  let currentRotationY = 0;
  let currentRotationX = 0.2;
  let containerEl = null;

  function init(container) {
    if (!container || !window.THREE) return;
    containerEl = container;

    // Clear previous canvas if exists, leaving HTML overlays intact
    container.querySelectorAll("canvas").forEach((c) => c.remove());

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 7.2);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "1";
    container.insertBefore(renderer.domElement, container.firstChild);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
    dirLight.position.set(5, 10, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.8);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    const warmPoint = new THREE.PointLight(0xf59e0b, 1.2, 10);
    warmPoint.position.set(2, 2, 2);
    scene.add(warmPoint);

    // 5. Main Object Group
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Build Models
    buildCoffeeCupAndSaucer();
    buildCroissant();
    buildSteam();

    // 6. Interaction Listeners
    setupInteraction(container);

    // Start loop
    start();
  }

  /**
   * Build Ceramic Coffee Mug, Saucer & Dark Espresso
   */
  function buildCoffeeCupAndSaucer() {
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.08
    });

    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.25,
      metalness: 0.05
    });

    const coffeeMat = new THREE.MeshStandardMaterial({
      color: 0x221108,
      roughness: 0.12,
      metalness: 0.25
    });

    const cremaMat = new THREE.MeshStandardMaterial({
      color: 0x8a5323,
      roughness: 0.65
    });

    const cupGroup = new THREE.Group();
    cupGroup.position.set(-1.2, -0.3, 0);

    // Saucer
    const saucerGeo = new THREE.CylinderGeometry(2.0, 1.4, 0.16, 48);
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = -0.92;
    cupGroup.add(saucer);

    // Outer Mug
    const mugOuterGeo = new THREE.CylinderGeometry(1.22, 0.95, 1.85, 48);
    const mugOuter = new THREE.Mesh(mugOuterGeo, ceramicMat);
    cupGroup.add(mugOuter);

    // Inner Mug Hollow
    const mugInnerGeo = new THREE.CylinderGeometry(1.14, 0.88, 1.8, 48);
    const mugInnerMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2 });
    const mugInner = new THREE.Mesh(mugInnerGeo, mugInnerMat);
    mugInner.position.y = 0.05;
    cupGroup.add(mugInner);

    // Mug Rim Torus
    const rimGeo = new THREE.TorusGeometry(1.18, 0.05, 16, 48);
    const rim = new THREE.Mesh(rimGeo, ceramicMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.92;
    cupGroup.add(rim);

    // Mug Handle
    const handleGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32, Math.PI * 1.15);
    const handle = new THREE.Mesh(handleGeo, ceramicMat);
    handle.position.set(-1.3, 0.1, 0);
    handle.rotation.z = Math.PI / 2.3;
    handle.rotation.y = Math.PI;
    cupGroup.add(handle);

    // Coffee Liquid Surface
    const coffeeGeo = new THREE.CircleGeometry(1.1, 36);
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.72;
    cupGroup.add(coffee);

    // Crema Swirl Accent
    const cremaGeo = new THREE.RingGeometry(0.7, 1.05, 36);
    const crema = new THREE.Mesh(cremaGeo, cremaMat);
    crema.rotation.x = -Math.PI / 2;
    crema.position.y = 0.725;
    cupGroup.add(crema);

    mainGroup.add(cupGroup);
  }

  /**
   * Procedural Golden Crescent Croissant
   */
  function buildCroissant() {
    const croissantGroup = new THREE.Group();
    croissantGroup.position.set(1.4, -0.65, 0.4);
    croissantGroup.rotation.y = -Math.PI / 4.5;

    // Segment definitions along curved arc
    // [radius, scaleX, scaleY, scaleZ, posX, posY, posZ, rotZ, colorHex]
    const segments = [
      // Left tip
      { r: 0.22, sx: 1.1, sy: 0.9, sz: 1.0, x: -1.8, y: -0.15, z: 0.75, rz: 0.65, c: 0xb45309 },
      { r: 0.35, sx: 1.15, sy: 0.95, sz: 1.1, x: -1.4, y: -0.05, z: 0.48, rz: 0.45, c: 0xc2620c },
      { r: 0.52, sx: 1.2, sy: 1.05, sz: 1.15, x: -0.95, y: 0.08, z: 0.25, rz: 0.28, c: 0xd97706 },
      { r: 0.68, sx: 1.25, sy: 1.15, sz: 1.25, x: -0.48, y: 0.18, z: 0.08, rz: 0.12, c: 0xe58a13 },
      // Center (fattest puff)
      { r: 0.8, sx: 1.35, sy: 1.25, sz: 1.35, x: 0.0, y: 0.24, z: 0.0, rz: 0.0, c: 0xf59e0b },
      // Right puff
      { r: 0.68, sx: 1.25, sy: 1.15, sz: 1.25, x: 0.48, y: 0.18, z: 0.08, rz: -0.12, c: 0xe58a13 },
      { r: 0.52, sx: 1.2, sy: 1.05, sz: 1.15, x: 0.95, y: 0.08, z: 0.25, rz: -0.28, c: 0xd97706 },
      { r: 0.35, sx: 1.15, sy: 0.95, sz: 1.1, x: 1.4, y: -0.05, z: 0.48, rz: -0.45, c: 0xc2620c },
      // Right tip
      { r: 0.22, sx: 1.1, sy: 0.9, sz: 1.0, x: 1.8, y: -0.15, z: 0.75, rz: -0.65, c: 0xb45309 }
    ];

    segments.forEach((seg, idx) => {
      const geo = new THREE.SphereGeometry(seg.r, 24, 20);
      geo.scale(seg.sx, seg.sy, seg.sz);

      const mat = new THREE.MeshStandardMaterial({
        color: seg.c,
        roughness: 0.48,
        metalness: 0.08
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(seg.x, seg.y, seg.z);
      mesh.rotation.z = seg.rz;
      mesh.rotation.x = 0.25;

      croissantGroup.add(mesh);

      // Flaky ridge rings on top
      if (idx >= 2 && idx <= 6) {
        const ridgeGeo = new THREE.TorusGeometry(seg.r * 0.95, 0.045, 12, 28);
        const ridgeMat = new THREE.MeshStandardMaterial({
          color: 0x92400e,
          roughness: 0.6
        });
        const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
        ridge.position.set(seg.x, seg.y + 0.05, seg.z);
        ridge.rotation.y = Math.PI / 2;
        ridge.rotation.x = 0.3;
        croissantGroup.add(ridge);
      }
    });

    // Elegant wooden board / napkin underneath croissant
    const boardGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.08, 48);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, -0.4, 0.4);
    board.scale.set(1.1, 1, 0.85);
    croissantGroup.add(board);

    mainGroup.add(croissantGroup);
  }

  /**
   * Animated Rising Steam Particles
   */
  function buildSteam() {
    steamParticles = [];
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35
    });

    const steamGroup = new THREE.Group();
    steamGroup.position.set(-1.2, 0.5, 0);

    for (let i = 0; i < 28; i++) {
      const size = 0.06 + Math.random() * 0.07;
      const geo = new THREE.SphereGeometry(size, 8, 8);
      const particle = new THREE.Mesh(geo, steamMat.clone());

      particle.position.set(
        (Math.random() - 0.5) * 0.9,
        Math.random() * 2.2,
        (Math.random() - 0.5) * 0.9
      );

      particle.userData = {
        speed: 0.012 + Math.random() * 0.015,
        offset: Math.random() * Math.PI * 2,
        initialY: 0,
        maxY: 2.2 + Math.random() * 0.6
      };

      steamGroup.add(particle);
      steamParticles.push(particle);
    }

    mainGroup.add(steamGroup);
  }

  /**
   * Animation & Physics Loop
   */
  function animate() {
    animId = requestAnimationFrame(animate);

    // Smooth rotation interpolation
    currentRotationY += (targetRotationY - currentRotationY) * 0.08;
    currentRotationX += (targetRotationX - currentRotationX) * 0.08;

    if (!isDragging) {
      targetRotationY += 0.007; // Gentle auto-spin
    }

    if (mainGroup) {
      mainGroup.rotation.y = currentRotationY;
      mainGroup.rotation.x = currentRotationX;
    }

    // Animate steam particles
    const time = Date.now() * 0.003;
    steamParticles.forEach((p) => {
      p.position.y += p.userData.speed;
      p.position.x += Math.sin(time + p.userData.offset) * 0.004;

      const progress = p.position.y / p.userData.maxY;
      p.material.opacity = Math.max(0, 0.45 * (1 - progress));

      if (p.position.y >= p.userData.maxY) {
        p.position.y = 0;
        p.position.x = (Math.random() - 0.5) * 0.8;
        p.position.z = (Math.random() - 0.5) * 0.8;
      }
    });

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function start() {
    if (!animId) {
      animate();
    }
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  /**
   * Mouse & Touch 360° Drag Controls
   */
  function setupInteraction(container) {
    function onDown(e) {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    }

    function onMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.006;
      targetRotationX = Math.max(-0.2, Math.min(0.8, targetRotationX));

      previousMousePosition = { x: clientX, y: clientY };
    }

    function onUp() {
      isDragging = false;
    }

    container.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    container.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  }

  function resize() {
    if (!containerEl || !camera || !renderer) return;
    const width = containerEl.clientWidth || 600;
    const height = containerEl.clientHeight || 360;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  return {
    init,
    start,
    stop,
    resize
  };
})();
