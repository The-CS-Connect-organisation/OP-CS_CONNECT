import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const DNAHelixAnimation = ({ 
  height = 300,
  width = 200,
  helixRadius = 1,
  pairsCount = 20,
  rotationSpeed = 0.5
}) => {
  const mountRef = useRef(null);
  const { shouldReduceQuality } = usePerformanceMonitor();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !shouldReduceQuality 
    });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(shouldReduceQuality ? 1 : Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 8;

    // Create DNA helix
    const helixGroup = new THREE.Group();
    
    const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const strand1Material = new THREE.MeshPhongMaterial({ 
      color: 0x6366f1,
      shininess: 50
    });
    const strand2Material = new THREE.MeshPhongMaterial({ 
      color: 0xa855f7,
      shininess: 50
    });
    const pairMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xec4899,
      shininess: 30
    });

    const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);

    // Create base pairs
    for (let i = 0; i < pairsCount; i++) {
      const angle = (i / pairsCount) * Math.PI * 4; // Two full rotations
      const y = (i / pairsCount) * 6 - 3; // Spread vertically

      // Strand 1 sphere
      const sphere1 = new THREE.Mesh(sphereGeometry, strand1Material);
      sphere1.position.set(
        Math.cos(angle) * helixRadius,
        y,
        Math.sin(angle) * helixRadius
      );
      helixGroup.add(sphere1);

      // Strand 2 sphere (opposite side)
      const sphere2 = new THREE.Mesh(sphereGeometry, strand2Material);
      sphere2.position.set(
        Math.cos(angle + Math.PI) * helixRadius,
        y,
        Math.sin(angle + Math.PI) * helixRadius
      );
      helixGroup.add(sphere2);

      // Connecting pair (horizontal bar)
      const pair = new THREE.Mesh(cylinderGeometry, pairMaterial);
      pair.position.set(0, y, 0);
      pair.rotation.z = Math.PI / 2;
      pair.rotation.y = angle;
      pair.scale.y = helixRadius * 2;
      helixGroup.add(pair);
    }

    scene.add(helixGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate the entire helix
      helixGroup.rotation.y += 0.005 * rotationSpeed;
      
      // Subtle vertical oscillation
      helixGroup.position.y = Math.sin(Date.now() * 0.001) * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      sphereGeometry.dispose();
      strand1Material.dispose();
      strand2Material.dispose();
      pairMaterial.dispose();
      cylinderGeometry.dispose();
    };
  }, [height, width, helixRadius, pairsCount, rotationSpeed, shouldReduceQuality]);

  return <div ref={mountRef} className="dna-helix-animation" />;
};

export default DNAHelixAnimation;
