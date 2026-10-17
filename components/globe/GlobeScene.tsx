'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Country } from '@/types/country';
import { COUNTRIES } from '@/data/countries';

interface GlobeSceneProps {
  selectedCountry?: Country | null;
  onLandCountry: (country: Country) => void;
  isSpinning: boolean;
  onSpinStart?: () => void;
  reducedMotion?: boolean;
}

export const GlobeScene: React.FC<GlobeSceneProps> = ({
  selectedCountry,
  onLandCountry,
  isSpinning,
  onSpinStart,
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLError, setWebGLError] = useState<boolean>(false);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);

  // References to keep animation state across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const beaconRef = useRef<THREE.Group | null>(null);
  const targetCountryRef = useRef<Country | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);
  const starMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Spin animation variables
  const spinStateRef = useRef<{
    active: boolean;
    progress: number;
    duration: number;
    startRotX: number;
    startRotY: number;
    targetRotX: number;
    targetRotY: number;
    startZoom: number;
    targetZoom: number;
  }>({
    active: false,
    progress: 0,
    duration: 3400, // ms
    startRotX: 0,
    startRotY: 0,
    targetRotX: 0,
    targetRotY: 0,
    startZoom: 5.4,
    targetZoom: 3.2,
  });

  // Inertia and drag
  const dragRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    velX: 0,
    velY: 0,
    lastInteractionTime: Date.now(),
  });

  // Convert lat/lon to sphere Cartesian coordinates
  const latLonToVector3 = (lat: number, lon: number, radius: number = 2): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Programmatic spin initiation
  const startSpinToCountry = useCallback(
    (country: Country) => {
      if (!earthGroupRef.current || !cameraRef.current) return;
      targetCountryRef.current = country;

      // Target rotation: bring lat/lon directly towards camera at (0, 0, Z)
      const targetRotY = -((country.lon + 90) * (Math.PI / 180));
      const targetRotX = country.lat * (Math.PI / 180);

      const currentRotX = earthGroupRef.current.rotation.x;
      const currentRotY = earthGroupRef.current.rotation.y;

      // Add 2-3 full spins for cinematic momentum
      const spinRotations = Math.PI * (Math.random() > 0.5 ? 4 : 6);

      spinStateRef.current = {
        active: true,
        progress: 0,
        duration: reducedMotion ? 100 : 3400,
        startRotX: currentRotX,
        startRotY: currentRotY,
        targetRotX: targetRotX,
        targetRotY: currentRotY + spinRotations + (targetRotY - (currentRotY % (Math.PI * 2))),
        startZoom: cameraRef.current.position.z,
        targetZoom: reducedMotion ? 4.6 : 3.2,
      };

      // Position and orient the precision navigator pin on the target country
      if (beaconRef.current) {
        const normal = latLonToVector3(country.lat, country.lon, 1).normalize();
        beaconRef.current.position.copy(normal.clone().multiplyScalar(2.02));
        beaconRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        beaconRef.current.visible = true;
      }

      dragRef.current.lastInteractionTime = Date.now();
    },
    [reducedMotion]
  );

  // Sync beacon location whenever selectedCountry changes while idle
  useEffect(() => {
    if (!isSpinning && selectedCountry && beaconRef.current) {
      const normal = latLonToVector3(selectedCountry.lat, selectedCountry.lon, 1).normalize();
      beaconRef.current.position.copy(normal.clone().multiplyScalar(2.02));
      beaconRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      beaconRef.current.visible = true;
    }
  }, [selectedCountry, isSpinning]);

  useEffect(() => {
    if (isSpinning) {
      const target =
        selectedCountry ||
        COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      startSpinToCountry(target);
    }
  }, [isSpinning, selectedCountry, startSpinToCountry]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera: positioned at 5.4 to frame the globe comfortably in center with no edge clipping
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.z = 5.4;
      cameraRef.current = camera;

      // Renderer with 4K color fidelity and high pixel ratio
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

      // Texture Loader for photorealistic 4K NASA Blue Marble assets
      const textureLoader = new THREE.TextureLoader();

      const earthDayMap = textureLoader.load('/textures/earth_blue_marble_4k.jpg');
      const earthBumpMap = textureLoader.load('/textures/earth_topology_4k.png');
      const earthNightMap = textureLoader.load('/textures/earth_night_4k.jpg');
      const earthSpecularMap = textureLoader.load('/textures/earth_specular_2048.jpg');
      const earthCloudsMap = textureLoader.load('/textures/earth_clouds_1024.png');

      // Configure 4K textures with maximum anisotropic filtering and mipmapping
      [earthDayMap, earthBumpMap, earthNightMap, earthSpecularMap, earthCloudsMap].forEach((tex) => {
        tex.anisotropy = maxAnisotropy;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
      });

      earthDayMap.colorSpace = THREE.SRGBColorSpace;
      earthCloudsMap.colorSpace = THREE.SRGBColorSpace;
      earthNightMap.colorSpace = THREE.SRGBColorSpace;

      // Earth Group
      const earthGroup = new THREE.Group();
      scene.add(earthGroup);
      earthGroupRef.current = earthGroup;

      // 1. Photorealistic 4K NASA Blue Marble Earth Sphere with Mountain Relief
      const earthGeo = new THREE.SphereGeometry(2, 64, 64);
      const earthMat = new THREE.MeshPhongMaterial({
        map: earthDayMap,
        bumpMap: earthBumpMap,
        bumpScale: 0.035,
        specularMap: earthSpecularMap,
        specular: new THREE.Color(0x334466),
        shininess: 28,
        emissiveMap: earthNightMap,
        emissive: new THREE.Color(0xfff0cc),
        emissiveIntensity: 0.35,
      });
      const earthMesh = new THREE.Mesh(earthGeo, earthMat);
      earthGroup.add(earthMesh);

      // 2. Realistic Dynamic Cloud Layer (hovering slightly above terrain)
      const cloudsGeo = new THREE.SphereGeometry(2.015, 64, 64);
      const cloudsMat = new THREE.MeshStandardMaterial({
        map: earthCloudsMap,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
      earthGroup.add(cloudsMesh);
      cloudsMeshRef.current = cloudsMesh;



      // 5. Landing Target Navigator (Precision Google-Earth style pin & reticle)
      const beaconGroup = new THREE.Group();
      beaconGroup.name = 'beaconGroup';
      beaconGroup.visible = false;

      // 5a. Ground Reticle Ring (tangent to sphere surface, rotated -PI/2 on X)
      const baseRingGeo = new THREE.RingGeometry(0.012, 0.016, 32);
      baseRingGeo.rotateX(-Math.PI / 2);
      const baseRingMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      });
      const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
      beaconGroup.add(baseRing);

      // 5b. Sonar Radar Pulse Ring (subtly expands and fades smoothly)
      const rippleGeo = new THREE.RingGeometry(0.012, 0.017, 32);
      rippleGeo.rotateX(-Math.PI / 2);
      const rippleMat = new THREE.MeshBasicMaterial({
        color: 0xffe066,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
      });
      const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
      rippleMesh.name = 'beaconRipple';
      beaconGroup.add(rippleMesh);

      // 5c. Ground Center Dot (bullseye target)
      const centerDotGeo = new THREE.SphereGeometry(0.0035, 16, 16);
      const centerDotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const centerDot = new THREE.Mesh(centerDotGeo, centerDotMat);
      centerDot.position.y = 0.001;
      beaconGroup.add(centerDot);

      // 5d. Slender Pin Needle Stem (pointing along surface normal)
      const stemGeo = new THREE.CylinderGeometry(0.0008, 0.002, 0.05, 12);
      const stemMat = new THREE.MeshBasicMaterial({
        color: 0xffd700,
      });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 0.025;
      beaconGroup.add(stemMesh);

      // 5e. Golden Pin Head Jewel
      const headGeo = new THREE.SphereGeometry(0.0065, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({
        color: 0xffea00,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.y = 0.052;
      beaconGroup.add(headMesh);

      // 5f. Inner Core Dot on Pin Head
      const headCoreGeo = new THREE.SphereGeometry(0.003, 12, 12);
      const headCoreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const headCoreMesh = new THREE.Mesh(headCoreGeo, headCoreMat);
      headCoreMesh.position.y = 0.052;
      beaconGroup.add(headCoreMesh);

      // 5g. Pin Head Glow Shimmer Halo
      const haloGeo = new THREE.SphereGeometry(0.0095, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffb700,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.name = 'pinGlow';
      haloMesh.position.y = 0.052;
      beaconGroup.add(haloMesh);

      earthGroup.add(beaconGroup);
      beaconRef.current = beaconGroup;

      // 6. Realistic Space Lighting
      // Sun Directional Light
      const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
      sunLight.position.set(7, 3, 5);
      scene.add(sunLight);

      // Soft deep-space ambient light so dark side remains visible with city lights
      const ambientLight = new THREE.AmbientLight(0x182236, 0.45);
      scene.add(ambientLight);



      // 7. Full-Screen Deep Space Starfield with gentle drift and twinkling
      const starGeo = new THREE.BufferGeometry();
      const starCount = 3000;
      const starPositions = new Float32Array(starCount * 3);
      const starPhases = new Float32Array(starCount);
      const starSpeeds = new Float32Array(starCount);
      const starBaseSizes = new Float32Array(starCount);
      const starBaseOpacities = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        starPositions[i3] = (Math.random() - 0.5) * 240;
        starPositions[i3 + 1] = (Math.random() - 0.5) * 180;
        starPositions[i3 + 2] = -35 - Math.random() * 110;

        starPhases[i] = Math.random() * Math.PI * 2;
        starSpeeds[i] = 0.8 + Math.random() * 2.2;
        starBaseSizes[i] = 1.0 + Math.random() * 2.2;
        starBaseOpacities[i] = 0.4 + Math.random() * 0.55;
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));
      starGeo.setAttribute('aSpeed', new THREE.BufferAttribute(starSpeeds, 1));
      starGeo.setAttribute('aBaseSize', new THREE.BufferAttribute(starBaseSizes, 1));
      starGeo.setAttribute('aBaseOpacity', new THREE.BufferAttribute(starBaseOpacities, 1));

      const starMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: `
          attribute float aPhase;
          attribute float aSpeed;
          attribute float aBaseSize;
          attribute float aBaseOpacity;
          uniform float uTime;
          varying float vOpacity;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float twinkle = sin(uTime * aSpeed + aPhase);
            float size = aBaseSize * (1.0 + twinkle * 0.35);
            gl_PointSize = size * (260.0 / -mvPosition.z);
            vOpacity = clamp(aBaseOpacity * (0.75 + twinkle * 0.35), 0.15, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying float vOpacity;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float glow = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(vec3(0.97, 0.97, 1.0), glow * vOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const starField = new THREE.Points(starGeo, starMat);
      scene.add(starField);
      starFieldRef.current = starField;
      starMaterialRef.current = starMat;

      // 8. Interaction Event Handlers
      const onMouseDown = (e: MouseEvent) => {
        if (spinStateRef.current.active) return;
        dragRef.current.isDragging = true;
        dragRef.current.prevX = e.clientX;
        dragRef.current.prevY = e.clientY;
        dragRef.current.velX = 0;
        dragRef.current.velY = 0;
        dragRef.current.lastInteractionTime = Date.now();
      };

      const onMouseMove = (e: MouseEvent) => {
        dragRef.current.lastInteractionTime = Date.now();
        if (dragRef.current.isDragging && earthGroupRef.current) {
          const deltaX = e.clientX - dragRef.current.prevX;
          const deltaY = e.clientY - dragRef.current.prevY;
          dragRef.current.velX = deltaX * 0.005;
          dragRef.current.velY = deltaY * 0.005;

          earthGroupRef.current.rotation.y += dragRef.current.velX;
          earthGroupRef.current.rotation.x += dragRef.current.velY;

          dragRef.current.prevX = e.clientX;
          dragRef.current.prevY = e.clientY;
        }
      };

      const onMouseUp = () => {
        dragRef.current.isDragging = false;
      };

      const onTouchStart = (e: TouchEvent) => {
        if (spinStateRef.current.active || e.touches.length === 0) return;
        dragRef.current.isDragging = true;
        dragRef.current.prevX = e.touches[0].clientX;
        dragRef.current.prevY = e.touches[0].clientY;
        dragRef.current.lastInteractionTime = Date.now();
      };

      const onTouchMove = (e: TouchEvent) => {
        dragRef.current.lastInteractionTime = Date.now();
        if (dragRef.current.isDragging && earthGroupRef.current && e.touches.length > 0) {
          const deltaX = e.touches[0].clientX - dragRef.current.prevX;
          const deltaY = e.touches[0].clientY - dragRef.current.prevY;
          dragRef.current.velX = deltaX * 0.005;
          dragRef.current.velY = deltaY * 0.005;

          earthGroupRef.current.rotation.y += dragRef.current.velX;
          earthGroupRef.current.rotation.x += dragRef.current.velY;

          dragRef.current.prevX = e.touches[0].clientX;
          dragRef.current.prevY = e.touches[0].clientY;
        }
      };

      const onTouchEnd = () => {
        dragRef.current.isDragging = false;
      };

      const domElem = renderer.domElement;
      domElem.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      domElem.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      const handleResize = () => {
        if (!container || !rendererRef.current || !cameraRef.current) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animation Loop
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        animFrameIdRef.current = requestAnimationFrame(animate);

        const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;

        // Subtle independent cloud drift for realism
        if (cloudsMeshRef.current) {
          cloudsMeshRef.current.rotation.y += delta * 0.012;
        }

        // Subtle radar ripple and shimmer on landing navigator pin
        if (beaconRef.current && beaconRef.current.visible) {
          const ripple = beaconRef.current.getObjectByName('beaconRipple') as THREE.Mesh;
          if (ripple) {
            const wave = (currentTime * 0.0018) % 1;
            const s = 1.0 + wave * 1.5;
            ripple.scale.set(s, s, s);
            const mat = ripple.material as THREE.MeshBasicMaterial;
            if (mat) {
              mat.opacity = Math.max(0, (1 - wave) * 0.65);
            }
          }
          const pinGlow = beaconRef.current.getObjectByName('pinGlow') as THREE.Mesh;
          if (pinGlow) {
            const shimmer = 0.25 + Math.sin(currentTime * 0.006) * 0.12;
            (pinGlow.material as THREE.MeshBasicMaterial).opacity = shimmer;
          }
        }

        // Active Spin Animation
        if (spinStateRef.current.active && earthGroupRef.current && cameraRef.current) {
          spinStateRef.current.progress += (delta * 1000) / spinStateRef.current.duration;
          const t = Math.min(1.0, spinStateRef.current.progress);

          // Quintic ease out for cinematic deceleration
          const easeOut = 1 - Math.pow(1 - t, 4);

          earthGroupRef.current.rotation.y =
            spinStateRef.current.startRotY +
            (spinStateRef.current.targetRotY - spinStateRef.current.startRotY) * easeOut;

          earthGroupRef.current.rotation.x =
            spinStateRef.current.startRotX +
            (spinStateRef.current.targetRotX - spinStateRef.current.startRotX) * easeOut;

          cameraRef.current.position.z =
            spinStateRef.current.startZoom +
            (spinStateRef.current.targetZoom - spinStateRef.current.startZoom) * easeOut;

          if (t >= 1.0) {
            spinStateRef.current.active = false;
            if (targetCountryRef.current) {
              onLandCountry(targetCountryRef.current);
            }
          }
        } else {
          // Slow ambient rotation when not spinning and not dragging
          if (!dragRef.current.isDragging && earthGroupRef.current) {
            dragRef.current.velX *= 0.94;
            dragRef.current.velY *= 0.94;
            earthGroupRef.current.rotation.y += dragRef.current.velX;
            earthGroupRef.current.rotation.x += dragRef.current.velY;

            if (Math.abs(dragRef.current.velX) < 0.0001) {
              earthGroupRef.current.rotation.y += 0.001;
            }
          }
        }

        // Gentle cosmic star drift and sparkling twinkle
        if (starMaterialRef.current) {
          starMaterialRef.current.uniforms.uTime.value = currentTime * 0.0015;
        }
        if (starFieldRef.current) {
          starFieldRef.current.rotation.y += delta * 0.003;
          starFieldRef.current.rotation.x += delta * 0.0012;
        }

        renderer.render(scene, camera);
      };

      animFrameIdRef.current = requestAnimationFrame(animate);

      // Cleanup
      return () => {
        cancelAnimationFrame(animFrameIdRef.current);
        domElem.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        domElem.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      };
    } catch (err) {
      console.error('WebGL initialization error:', err);
      setWebGLError(true);
    }
  }, [onLandCountry, reducedMotion]);

  if (webGLError) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 text-center text-zinc-400">
        <p>3D WebGL is unavailable in your browser. Using accessible map mode.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none cursor-grab active:cursor-grabbing flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />

      {/* Country Hover Badge */}
      {hoveredCountry && (
        <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-panel-gold flex items-center gap-2 text-xs font-semibold text-white animate-fade-in shadow-xl">
          <span className="text-base">{hoveredCountry.flagEmoji}</span>
          <span>{hoveredCountry.name}</span>
        </div>
      )}
    </div>
  );
};
