import { useEffect, useRef, useState } from 'react';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const HeroScene3D = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const shapesRef = useRef([]);
  const mousePosition = useMousePosition();
  const prefersReducedMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let animationFrameId;

    // Lazy load Three.js
    import('three').then(({ Scene, PerspectiveCamera, WebGLRenderer, IcosahedronGeometry, TorusGeometry, OctahedronGeometry, MeshBasicMaterial, AmbientLight, DirectionalLight, PointLight, Mesh }) => {
      if (!containerRef.current) return;

      // Scene setup
      const scene = new Scene();
      sceneRef.current = scene;

      // Camera setup
      const camera = new PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const pointLight = new PointLight(0x00ffff, 0.6);
      pointLight.position.set(-5, 3, 2);
      scene.add(pointLight);

      // Create floating geometric shapes
      const shapes = [
        {
          geometry: new IcosahedronGeometry(0.8, 0),
          material: new MeshBasicMaterial({ color: 0xff6b9d, wireframe: true }),
          position: [-2, 1, 0],
          rotation: [0.01, 0.02, 0],
          floatOffset: 0,
          floatSpeed: 0.001,
          floatAmplitude: 0.3
        },
        {
          geometry: new TorusGeometry(0.6, 0.2, 16, 100),
          material: new MeshBasicMaterial({ color: 0xa855f7, wireframe: true }),
          position: [2, -1, -1],
          rotation: [0.02, 0.01, 0.01],
          floatOffset: Math.PI / 3,
          floatSpeed: 0.0012,
          floatAmplitude: 0.25
        },
        {
          geometry: new OctahedronGeometry(0.7, 0),
          material: new MeshBasicMaterial({ color: 0x00ffff, wireframe: true }),
          position: [0, 2, -2],
          rotation: [0.015, 0.015, 0.02],
          floatOffset: Math.PI * 2 / 3,
          floatSpeed: 0.0008,
          floatAmplitude: 0.35
        }
      ];

      shapes.forEach(shapeData => {
        const mesh = new Mesh(shapeData.geometry, shapeData.material);
        mesh.position.set(...shapeData.position);
        mesh.userData = {
          rotation: shapeData.rotation,
          floatOffset: shapeData.floatOffset,
          floatSpeed: shapeData.floatSpeed,
          floatAmplitude: shapeData.floatAmplitude,
          initialY: shapeData.position[1]
        };
        scene.add(mesh);
        shapesRef.current.push(mesh);
      });

      setIsLoaded(true);

      // Animation loop
      let time = 0;
      const animate = () => {
        time += 0.01;

        // Animate shapes
        shapesRef.current.forEach(mesh => {
          // Continuous rotation
          mesh.rotation.x += mesh.userData.rotation[0];
          mesh.rotation.y += mesh.userData.rotation[1];
          mesh.rotation.z += mesh.userData.rotation[2];

          // Sine wave floating motion
          const floatY = Math.sin(time * mesh.userData.floatSpeed * 1000 + mesh.userData.floatOffset) * mesh.userData.floatAmplitude;
          mesh.position.y = mesh.userData.initialY + floatY;

          // Mouse parallax
          mesh.position.x += mousePosition.normalizedX * 0.001;
          mesh.position.y += mousePosition.normalizedY * 0.001;
        });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!containerRef.current) return;
        
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        
        shapesRef.current.forEach(mesh => {
          mesh.geometry.dispose();
          mesh.material.dispose();
        });
        
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
        
        renderer.dispose();
      };
    }).catch(error => {
      console.error('Failed to load Three.js:', error);
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mousePosition.normalizedX, mousePosition.normalizedY, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s' }}
    />
  );
};
