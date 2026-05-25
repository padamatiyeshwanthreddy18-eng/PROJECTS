import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.012);

    // --- SETUP CAMERA ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 32);

    // --- SETUP RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- INTERACTIVE MOUSE TRACKING ---
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (event: MouseEvent) => {
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- CUSTOM CANVAS GRADIENT TEXTURES FOR NEON PARTICLES ---
    const createGlowingParticleTexture = (colorHex: string): THREE.Texture => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.2, colorHex);
        gradient.addColorStop(0.5, "rgba(0, 150, 255, 0.15)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const cyanTexture = createGlowingParticleTexture("#22d3ee");
    const purpleTexture = createGlowingParticleTexture("#a855f7");
    const pinkTexture = createGlowingParticleTexture("#ec4899");

    // --- GROUP CONTAINER ---
    const techGroup = new THREE.Group();
    scene.add(techGroup);

    // ==========================================
    // 1. NESTED PULSING CORE & KINETIC RINGS
    // ==========================================
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0, 0);
    techGroup.add(coreGroup);

    // Core Wireframe Sphere
    const coreGeometry = new THREE.IcosahedronGeometry(2.5, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreSphere);

    // Concentric Orbit Tech Rings
    const ringGeometries = [
      new THREE.RingGeometry(3.5, 3.6, 64),
      new THREE.RingGeometry(4.2, 4.3, 64),
      new THREE.RingGeometry(5.0, 5.05, 64),
    ];
    const ringColors = [0x22d3ee, 0xa855f7, 0xec4899];
    const rings: THREE.Mesh[] = [];

    ringGeometries.forEach((geom, idx) => {
      const mat = new THREE.MeshBasicMaterial({
        color: ringColors[idx],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18 + idx * 0.05,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(geom, mat);
      // Randomize initial tilt angles
      ring.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      coreGroup.add(ring);
      rings.push(ring);
    });

    // ==========================================
    // 2. DOUBLE HELIX DEVELOPER DNA STRANDS (SkillGenome DNA)
    // ==========================================
    const dnaGroup = new THREE.Group();
    dnaGroup.position.set(-18, 4, -5);
    techGroup.add(dnaGroup);

    const dnaParticlesCount = 80;
    const strandGeom1 = new THREE.BufferGeometry();
    const strandGeom2 = new THREE.BufferGeometry();
    const posStrand1 = new Float32Array(dnaParticlesCount * 3);
    const posStrand2 = new Float32Array(dnaParticlesCount * 3);
    const connectionLinesGeom = new THREE.BufferGeometry();
    const connectionLinesPos = new Float32Array(dnaParticlesCount * 6);

    // Render DNA Helix coords Procedurally
    const updateHelixCoordinates = (timeOffset: number = 0) => {
      let lineIdx = 0;
      for (let i = 0; i < dnaParticlesCount; i++) {
        const theta = (i / dnaParticlesCount) * Math.PI * 6 + timeOffset; // wave rotation
        const y = (i / dnaParticlesCount) * 16 - 8; // stretch tallness
        const radius = 2.4;

        // Strand 1
        const x1 = Math.cos(theta) * radius;
        const z1 = Math.sin(theta) * radius;
        posStrand1[i * 3] = x1;
        posStrand1[i * 3 + 1] = y;
        posStrand1[i * 3 + 2] = z1;

        // Strand 2 (Offset by Math.PI)
        const x2 = Math.cos(theta + Math.PI) * radius;
        const z2 = Math.sin(theta + Math.PI) * radius;
        posStrand2[i * 3] = x2;
        posStrand2[i * 3 + 1] = y;
        posStrand2[i * 3 + 2] = z2;

        // Helix Rungs connection cords
        connectionLinesPos[lineIdx++] = x1;
        connectionLinesPos[lineIdx++] = y;
        connectionLinesPos[lineIdx++] = z1;

        connectionLinesPos[lineIdx++] = x2;
        connectionLinesPos[lineIdx++] = y;
        connectionLinesPos[lineIdx++] = z2;
      }
      strandGeom1.setAttribute("position", new THREE.BufferAttribute(posStrand1, 3));
      strandGeom2.setAttribute("position", new THREE.BufferAttribute(posStrand2, 3));
      connectionLinesGeom.setAttribute("position", new THREE.BufferAttribute(connectionLinesPos, 3));
    };

    updateHelixCoordinates();

    const dnaMaterial1 = new THREE.PointsMaterial({
      size: 1.2,
      map: cyanTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dnaMaterial2 = new THREE.PointsMaterial({
      size: 1.2,
      map: purpleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointsStrand1 = new THREE.Points(strandGeom1, dnaMaterial1);
    const pointsStrand2 = new THREE.Points(strandGeom2, dnaMaterial2);
    const dnaLinesMaterial = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const dnaRungSegments = new THREE.LineSegments(connectionLinesGeom, dnaLinesMaterial);

    dnaGroup.add(pointsStrand1);
    dnaGroup.add(pointsStrand2);
    dnaGroup.add(dnaRungSegments);
    dnaGroup.rotation.z = 0.2; // slight elegant lean

    // Mirroring Helix on Right Side for gorgeous widescreen symmetry
    const rightDnaGroup = dnaGroup.clone();
    rightDnaGroup.position.set(18, -4, -5);
    rightDnaGroup.rotation.z = -0.2;
    techGroup.add(rightDnaGroup);

    // ==========================================
    // 3. INTERACTIVE NEURAL NETWORK (Constellation System)
    // ==========================================
    const networkCount = 130;
    const networkPositions = new Float32Array(networkCount * 3);
    const networkVelocities: THREE.Vector3[] = [];
    const networkGeom = new THREE.BufferGeometry();

    for (let i = 0; i < networkCount; i++) {
      // Scatter elements across space
      const rx = (Math.random() - 0.5) * 45;
      const ry = (Math.random() - 0.5) * 25;
      const rz = (Math.random() - 0.5) * 20 - 5;

      networkPositions[i * 3] = rx;
      networkPositions[i * 3 + 1] = ry;
      networkPositions[i * 3 + 2] = rz;

      networkVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015,
          (Math.random() - 0.5) * 0.015
        )
      );
    }

    networkGeom.setAttribute("position", new THREE.BufferAttribute(networkPositions, 3));
    const networkMaterial = new THREE.PointsMaterial({
      size: 0.8,
      map: pinkTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const networkPoints = new THREE.Points(networkGeom, networkMaterial);
    techGroup.add(networkPoints);

    // Connection vectors for the constellation rendering
    const networkLinesGeom = new THREE.BufferGeometry();
    const maxConnections = 240;
    const netLinesPos = new Float32Array(maxConnections * 6);
    const netLinesColor = new Float32Array(maxConnections * 6);

    networkLinesGeom.setAttribute("position", new THREE.BufferAttribute(netLinesPos, 3));
    networkLinesGeom.setAttribute("color", new THREE.BufferAttribute(netLinesColor, 3));

    const netLinesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const networkLineSegments = new THREE.LineSegments(networkLinesGeom, netLinesMat);
    techGroup.add(networkLineSegments);

    // ==========================================
    // 4. FLOATING PROCEDURAL 3D TECH PANELS
    // ==========================================
    const panels: THREE.Mesh[] = [];
    const panelCount = 4;
    for (let i = 0; i < panelCount; i++) {
      const pGeom = new THREE.PlaneGeometry(3, 1.8);
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x22d3ee : 0xa855f7,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const panel = new THREE.Mesh(pGeom, pMat);
      panel.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 2
      );
      panel.rotation.set(
        Math.random() * 0.4,
        Math.random() * 0.4,
        Math.random() * 0.4
      );
      techGroup.add(panel);
      panels.push(panel);
    }

    // ==========================================
    // 5. DIGITAL CYBER GRID / FLOOR WAVE FLUIDS
    // ==========================================
    const gridCols = 32;
    const gridRows = 24;
    const gridParticleCount = gridCols * gridRows;
    const waveGeom = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(gridParticleCount * 3);

    const initWaveGrid = () => {
      let idx = 0;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const x = (c - gridCols / 2) * 2;
          const z = (r - gridRows / 2) * 2 - 10;
          const y = -11; // anchor lower bounds

          wavePositions[idx++] = x;
          wavePositions[idx++] = y;
          wavePositions[idx++] = z;
        }
      }
      waveGeom.setAttribute("position", new THREE.BufferAttribute(wavePositions, 3));
    };

    initWaveGrid();

    const waveMaterial = new THREE.PointsMaterial({
      size: 0.6,
      map: cyanTexture,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const wavePoints = new THREE.Points(waveGeom, waveMaterial);
    techGroup.add(wavePoints);

    // ==========================================
    // 6. VOLUMETRIC DIRECTIONAL GLOW LIGHTS
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x05070a);
    scene.add(ambientLight);

    const lightCyan = new THREE.PointLight(0x22d3ee, 5, 45);
    lightCyan.position.set(-15, 10, 5);
    scene.add(lightCyan);

    const lightPurple = new THREE.PointLight(0xa855f7, 4, 45);
    lightPurple.position.set(15, -10, 5);
    scene.add(lightPurple);

    // Interactive Mouse Focus Light Spot
    const mouseLight = new THREE.PointLight(0xec4899, 6, 25);
    scene.add(mouseLight);

    // ==========================================
    // ANIMATION TICK LOOP SYSTEM
    // ==========================================
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsUpdate = 0;

    const tick = () => {
      frameCount++;
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // FPS tracking for performance validation
      if (time - lastFpsUpdate > 1.0) {
        setFps(Math.round(frameCount / (time - lastFpsUpdate)));
        frameCount = 0;
        lastFpsUpdate = time;
      }

      // Smooth mouse coordinate interpolation (Parallax camera panning)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 3.5;
      camera.position.y = mouse.y * 3.5;
      camera.lookAt(0, 0, 0);

      // Cast mouse Interactive Glow Spot into the projected 3D scene space
      mouseLight.position.set(mouse.x * 20, mouse.y * 12, 6);

      // Core rotation & multi-ring orbital orbits
      coreSphere.rotation.y += 0.005;
      coreSphere.rotation.z += 0.003;
      // Core pulse breathing pattern
      const coreScale = 1.0 + Math.sin(time * 2.5) * 0.08;
      coreSphere.scale.set(coreScale, coreScale, coreScale);

      rings.forEach((ring, index) => {
        const speed = (index + 1) * 0.003;
        ring.rotation.x += speed * (index % 2 === 0 ? 1 : -1);
        ring.rotation.y += speed * 0.7;
        ring.rotation.z += speed * 0.4;
      });

      // DNA Helix continuous spiraling rotations & translation updates
      const pos1Arr = strandGeom1.attributes.position.array as Float32Array;
      const pos2Arr = strandGeom2.attributes.position.array as Float32Array;
      const linePosArr = connectionLinesGeom.attributes.position.array as Float32Array;

      let lineIdx = 0;
      for (let i = 0; i < dnaParticlesCount; i++) {
        // dynamic winding formula
        const theta = (i / dnaParticlesCount) * Math.PI * 6.5 + time * 0.8;
        const radius = 2.4 + Math.sin(time * 1.5 + i * 0.05) * 0.25; // heartbeat pulse mapping inside helix
        const y = (i / dnaParticlesCount) * 16 - 8;

        const x1 = Math.cos(theta) * radius;
        const z1 = Math.sin(theta) * radius;
        pos1Arr[i * 3] = x1;
        pos1Arr[i * 3 + 1] = y;
        pos1Arr[i * 3 + 2] = z1;

        const x2 = Math.cos(theta + Math.PI) * radius;
        const z2 = Math.sin(theta + Math.PI) * radius;
        pos2Arr[i * 3] = x2;
        pos2Arr[i * 3 + 1] = y;
        pos2Arr[i * 3 + 2] = z2;

        linePosArr[lineIdx++] = x1;
        linePosArr[lineIdx++] = y;
        linePosArr[lineIdx++] = z1;

        linePosArr[lineIdx++] = x2;
        linePosArr[lineIdx++] = y;
        linePosArr[lineIdx++] = z2;
      }
      strandGeom1.attributes.position.needsUpdate = true;
      strandGeom2.attributes.position.needsUpdate = true;
      connectionLinesGeom.attributes.position.needsUpdate = true;

      // Slowly rotate individual helix coordinates in world spaces
      dnaGroup.rotation.y += 0.004;
      rightDnaGroup.rotation.y += 0.004;

      // Tech panels floating tilt animations
      panels.forEach((panel, i) => {
        panel.position.y += Math.sin(time + i) * 0.002;
        panel.rotation.x += Math.cos(time * 0.5 + i) * 0.001;
        panel.rotation.y += Math.sin(time * 0.5 + i) * 0.0012;
      });

      // Constellation nodes drift updates & collision bounds constraints
      const netPosArr = networkGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < networkCount; i++) {
        const idx = i * 3;
        // add velocity
        netPosArr[idx] += networkVelocities[i].x;
        netPosArr[idx + 1] += networkVelocities[i].y;
        netPosArr[idx + 2] += networkVelocities[i].z;

        // Bounce back inside virtual bounds box
        if (Math.abs(netPosArr[idx]) > 24) networkVelocities[i].x *= -1;
        if (Math.abs(netPosArr[idx + 1]) > 14) networkVelocities[i].y *= -1;
        if (Math.abs(netPosArr[idx + 2]) > 10) networkVelocities[i].z *= -1;

        // Interactive mouse force repulsion
        const dx = netPosArr[idx] - (mouse.x * 20);
        const dy = netPosArr[idx + 1] - (mouse.y * 12);
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        if (distToMouse < 4.5) {
          const repelStrength = (4.5 - distToMouse) * 0.002;
          netPosArr[idx] += dx * repelStrength;
          netPosArr[idx + 1] += dy * repelStrength;
        }
      }
      networkGeom.attributes.position.needsUpdate = true;

      // Compute Neural Network Intersect connections segment arrays (Drifting Connections)
      let lineSegmentsIdx = 0;
      let connectionsCount = 0;
      const positions = networkGeom.attributes.position.array as Float32Array;
      const netLinesPosArr = networkLinesGeom.attributes.position.array as Float32Array;
      const netLinesColorArr = networkLinesGeom.attributes.position.array as Float32Array;

      for (let i = 0; i < networkCount && connectionsCount < maxConnections; i++) {
        const x1 = positions[i * 3];
        const y1 = positions[i * 3 + 1];
        const z1 = positions[i * 3 + 2];

        for (let j = i + 1; j < networkCount && connectionsCount < maxConnections; j++) {
          const x2 = positions[j * 3];
          const y2 = positions[j * 3 + 1];
          const z2 = positions[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const distSq = dx * dx + dy * dy + dz * dz;

          // Connection limit threshold
          if (distSq < 32.0) {
            const opacity = 1.0 - Math.sqrt(distSq) / Math.sqrt(32.0);

            // Set Position vertices
            netLinesPosArr[lineSegmentsIdx] = x1;
            netLinesPosArr[lineSegmentsIdx + 1] = y1;
            netLinesPosArr[lineSegmentsIdx + 2] = z1;

            netLinesPosArr[lineSegmentsIdx + 3] = x2;
            netLinesPosArr[lineSegmentsIdx + 4] = y2;
            netLinesPosArr[lineSegmentsIdx + 5] = z2;

            // Gradient vertex colors
            netLinesColorArr[lineSegmentsIdx] = 0.14 * opacity;
            netLinesColorArr[lineSegmentsIdx + 1] = 0.83 * opacity; // cyan mix
            netLinesColorArr[lineSegmentsIdx + 2] = 0.93 * opacity;

            netLinesColorArr[lineSegmentsIdx + 3] = 0.66 * opacity; // purple highlights
            netLinesColorArr[lineSegmentsIdx + 4] = 0.33 * opacity;
            netLinesColorArr[lineSegmentsIdx + 5] = 0.97 * opacity;

            lineSegmentsIdx += 6;
            connectionsCount++;
          }
        }
      }
      // Zero out trailing segments to avoid rendering dead pointers
      for (let i = lineSegmentsIdx; i < maxConnections * 6; i++) {
        netLinesPosArr[i] = 0;
        netLinesColorArr[i] = 0;
      }
      networkLinesGeom.attributes.position.needsUpdate = true;
      networkLinesGeom.attributes.color.needsUpdate = true;

      // Cyber floor waves sin/cos mathematical drift calculations (Apple Vision Pro matrix waves)
      const wavePositionsArr = waveGeom.attributes.position.array as Float32Array;
      let waveIdx = 0;
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const px = wavePositionsArr[waveIdx];
          const pz = wavePositionsArr[waveIdx + 2];

          // Wave equation
          const waveHeight =
            Math.sin(px * 0.18 + time * 1.4) * 0.9 +
            Math.cos(pz * 0.18 + time * 1.4) * 0.9;
          wavePositionsArr[waveIdx + 1] = -11 + waveHeight; // adjust offset index

          waveIdx += 3;
        }
      }
      waveGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };

    const animationFrameId = requestAnimationFrame(tick);

    // --- SETUP RESIZE VISUAL OBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(containerRef.current);

    // --- CLEANUP ALL GRAPHICS PIPELINES ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      cyanTexture.dispose();
      purpleTexture.dispose();
      pinkTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      id="three-3d-backdrop"
    >
      {/* Tiny Status Indicator displaying 60FPS real-time WebGL rendering */}
      <div className="absolute bottom-4 left-4 font-mono text-[9px] text-cyan-400/40 select-none hidden md:block z-50">
        SYS.CORE_WEBGL_ONLINE : {fps} FPS SYSTEM STABLE
      </div>
    </div>
  );
}
