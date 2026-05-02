import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const FloatingBookElement3D = ({ 
  position = [0, 0, 0],
  scale = 1,
  orbitRadius = 2,
  orbitSpeed = 0.5
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
    
    renderer.setSize(200, 200);
    renderer.setPixelRatio(shouldReduceQuality ? 1 : Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Create book geometry
    const bookGroup = new THREE.Group();
    
    // Book cover
    const coverGeometry = new THREE.BoxGeometry(1.5, 2, 0.2);
    const coverMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x6366f1,
      shininess: 30
    });
    const cover = new THREE.Mesh(coverGeometry, coverMaterial);
    bookGroup.add(cover);

    // Pages
    const pagesGeometry = new THREE.BoxGeometry(1.4, 1.9, 0.15);
    const pagesMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xf5f5f5,
      shininess: 10
    });
    const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
    pages.position.z = 0.025;
    bookGroup.add(pages);

    // Spine detail
    const spineGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const spineMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4338ca
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.position.x = -0.75;
    bookGroup.add(spine);

    bookGroup.scale.set(scale, scale, scale);
    bookGroup.position.set(...position);
    scene.add(bookGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation
    let time = 0;
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01 * orbitSpeed;

      // Orbital motion
      bookGroup.position.x = position[0] + Math.cos(time) * orbitRadius;
      bookGroup.position.y = position[1] + Math.sin(time * 0.7) * (orbitRadius * 0.5);
      
      // Rotation
      bookGroup.rotation.y += 0.01;
      bookGroup.rotation.x = Math.sin(time * 0.5) * 0.2;

      // Page flip animation (subtle)
      pages.rotation.y = Math.sin(time * 2) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
      coverGeometry.dispose();
      coverMaterial.dispose();
      pagesGeometry.dispose();
      pagesMaterial.dispose();
      spineGeometry.dispose();
      spineMaterial.dispose();
    };
  }, [position, scale, orbitRadius, orbitSpeed, shouldReduceQuality]);

  return <div ref={mountRef} className="floating-book-3d" />;
};

export default FloatingBookElement3D;
