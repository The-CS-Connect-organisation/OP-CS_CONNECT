import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const AtomOrbitAnimation = ({ 
  size = 200,
  electronsCount = 3,
  orbitSpeed = 1
}) => {
  const mountRef = useRef(null);
  const { shouldReduceQuality } = usePerformanceMonitor();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !shouldReduceQuality 
    });
    
    renderer.setSize(size, size);
    renderer.setPixelRatio(shouldReduceQuality ? 1 : Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 6;

    // Create atom
    const atomGroup = new THREE.Group();

    // Nucleus (protons + neutrons)
    const nucleusGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const nucleusMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xec4899,
      emissive: 0xec4899,
      emissiveIntensity: 0.3,
      shininess: 100
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    atomGroup.add(nucleus);

    // Orbit rings
    const orbitRingGeometry = new THREE.TorusGeometry(2, 0.02, 16, 100);
    const orbitRingMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x6366f1,
      transparent: true,
      opacity: 0.3
    });

    const orbits = [];
    const electrons = [];

    for (let i = 0; i < electronsCount; i++) {
      // Create orbit ring
      const orbitRing = new THREE.Mesh(orbitRingGeometry, orbitRingMaterial);
      
      // Rotate each orbit at different angles
      orbitRing.rotation.x = (Math.PI / 3) * i;
      orbitRing.rotation.y = (Math.PI / 4) * i;
      
      atomGroup.add(orbitRing);
      orbits.push(orbitRing);

      // Create electron
      const electronGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const electronMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x60a5fa,
        emissive: 0x60a5fa,
        emissiveIntensity: 0.5,
        shininess: 100
      });
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      
      atomGroup.add(electron);
      electrons.push({
        mesh: electron,
        angle: (Math.PI * 2 / electronsCount) * i,
        orbitIndex: i
      });
    }

    scene.add(atomGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 1.5, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    let time = 0;
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01 * orbitSpeed;

      // Rotate entire atom slowly
      atomGroup.rotation.y += 0.002;

      // Animate electrons along their orbits
      electrons.forEach((electron, index) => {
        const angle = time + electron.angle;
        const orbitRadius = 2;
        
        // Calculate position based on orbit orientation
        const orbit = orbits[electron.orbitIndex];
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius;
        
        // Apply orbit rotation to electron position
        const rotatedPos = new THREE.Vector3(x, y, 0);
        rotatedPos.applyEuler(orbit.rotation);
        
        electron.mesh.position.copy(rotatedPos);
      });

      // Nucleus pulse
      const pulseScale = 1 + Math.sin(time * 2) * 0.05;
      nucleus.scale.set(pulseScale, pulseScale, pulseScale);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      nucleusGeometry.dispose();
      nucleusMaterial.dispose();
      orbitRingGeometry.dispose();
      orbitRingMaterial.dispose();
      electrons.forEach(e => {
        e.mesh.geometry.dispose();
        e.mesh.material.dispose();
      });
    };
  }, [size, electronsCount, orbitSpeed, shouldReduceQuality]);

  return <div ref={mountRef} className="atom-orbit-animation" />;
};

export default AtomOrbitAnimation;
