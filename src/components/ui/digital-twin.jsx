import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function DigitalTwin({ alerts }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    
    // Create isometric building (Stacked boxes)
    const buildingGroup = new THREE.Group();
    
    const floorHeights = [1.2, 1.2, 1.2, 0.6];
    const floorWidths = [3, 3, 2.5, 1.5];
    let currentY = 0;
    
    const material = new THREE.LineBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.35 });
    
    floorHeights.forEach((h, i) => {
      const w = floorWidths[i];
      const geometry = new THREE.BoxGeometry(w, h, w);
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(edges, material);
      line.position.y = currentY + h / 2;
      currentY += h;
      buildingGroup.add(line);
    });
    
    // Add pulsing alert nodes
    const nodeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const criticalMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
    const warningMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
    
    const nodes = [];
    alerts.forEach((alert, i) => {
      const isCrit = alert.level === 'critical';
      const node = new THREE.Mesh(nodeGeometry, isCrit ? criticalMat : warningMat);
      
      // Position nodes on the building
      const angle = (Math.PI * 2 / alerts.length) * i;
      node.position.set(Math.cos(angle) * (1.2 + Math.random()), Math.random() * 3 + 0.5, Math.sin(angle) * (1.2 + Math.random()));
      
      // Add a subtle glow aura behind the node
      const glowGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ color: isCrit ? 0xEF4444 : 0xF59E0B, transparent: true, opacity: 0.3 });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      node.add(glowMesh);
      
      buildingGroup.add(node);
      nodes.push({ mesh: node, glow: glowMesh, isCrit, phase: Math.random() * Math.PI * 2 });
    });
    
    scene.add(buildingGroup);
    
    // Isometric camera angle
    camera.position.set(5.5, 5, 5.5);
    camera.lookAt(0, 1.5, 0);
    
    let animationFrameId;
    let time = 0;
    
    const render = () => {
      time += 0.02;
      buildingGroup.rotation.y += 0.003; // Slow rotation
      
      // Pulse nodes
      nodes.forEach(n => {
        const pulse = Math.sin(time * (n.isCrit ? 4 : 2) + n.phase);
        const scale = 1 + pulse * 0.2;
        n.mesh.scale.set(scale, scale, scale);
        
        const glowScale = 1 + pulse * 0.4;
        n.glow.scale.set(glowScale, glowScale, glowScale);
        n.glow.material.opacity = 0.2 + pulse * 0.2;
      });
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [alerts]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '200px' }} />;
}
