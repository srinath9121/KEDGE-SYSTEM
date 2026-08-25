import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { animate, createTimer, stagger, utils } from "animejs";
import { getInstances } from "animejs/adapters/three";

/**
 * LoadingScreen — Full-screen Three.js 4×4×4 exploding cube grid.
 * Props:
 *   onComplete — called after the display duration ends
 *   duration   — how long to show the loader in ms (default 3000)
 */
export default function LoadingScreen({ onComplete, duration = 3000 }) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let exitTimer;
    try {
      const width = el.clientWidth || window.innerWidth;
      const height = el.clientHeight || window.innerHeight;

      // ── Renderer ──────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      renderer.shadowMap.enabled = true;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      // ── Scene & Camera ────────────────────────────────────────────────
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.z = 6;
      scene.add(camera);

      // ── Lights ─────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));

      const pointLight = new THREE.PointLight(0xffffff, 8, 20, 0.4);
      pointLight.castShadow = true;
      scene.add(pointLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 2);
      dirLight.position.set(2, 3, 4);
      scene.add(dirLight);

      // ── Instanced Cube Grid ───────────────────────────────────────────
      const gridSize = 4;
      const cellSize = 2 / gridSize;
      const spread = ((gridSize - 1) / 2) * cellSize;

      const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
      const material = new THREE.MeshLambertMaterial({ color: "#16A34A" });
      const mesh = new THREE.InstancedMesh(geometry, material, gridSize * gridSize * gridSize);
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);

      // ── Animation with Three.js adapter ───────────────────────────────
      const instances = getInstances(mesh);

      utils.set(instances, {
        x: stagger([-spread, spread], { grid: [gridSize, gridSize, gridSize], axis: "x" }),
        y: stagger([-spread, spread], { grid: [gridSize, gridSize, gridSize], axis: "y" }),
        z: stagger([-spread, spread], { grid: [gridSize, gridSize, gridSize], axis: "z" }),
      });

      const rotAnim = animate(mesh, {
        rotateY: { to: 360, duration: 9000 },
        rotateX: { to: 360, duration: 12000 },
        loop: true,
        ease: "inOutQuad",
      });

      const lightAnim = animate(pointLight, {
        intensity: [30, 0],
        duration: 2500,
        loop: true,
        loopDelay: 500,
        alternate: true,
        ease: "out(3)",
      });

      const instAnim = animate(instances, {
        x: (instance) => instance.x * 10,
        y: (instance) => instance.y * 10,
        z: (instance) => instance.z * 10,
        duration: 2000,
        delay: stagger([0, 500], { grid: true, from: "center", reversed: true, ease: "in(3)" }),
        loop: true,
        loopDelay: 500,
        alternate: true,
        ease: "inOutExpo",
      });

      const timer = createTimer({
        onUpdate: () => renderer.render(scene, camera),
      });

      exitTimer = setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current();
      }, duration);

      const handleResize = () => {
        if (!el) return;
        const w = el.clientWidth || window.innerWidth;
        const h = el.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      cleanupRef.current = () => {
        clearTimeout(exitTimer);
        window.removeEventListener("resize", handleResize);
        if (timer && timer.pause) timer.pause();
        if (rotAnim && rotAnim.pause) rotAnim.pause();
        if (lightAnim && lightAnim.pause) lightAnim.pause();
        if (instAnim && instAnim.pause) instAnim.pause();
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        if (el && renderer.domElement && el.contains(renderer.domElement)) {
          el.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn("LoadingScreen WebGL fallback triggered:", err);
      if (onCompleteRef.current) onCompleteRef.current();
    }

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [duration]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#09090B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Brand & Loading Status Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: "#FAFAFA",
            fontFamily: "'Inter', sans-serif",
            textTransform: "uppercase",
          }}
        >
          KEDGE
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#71717A",
            fontFamily: "'Inter', sans-serif",
            marginTop: 6,
            letterSpacing: "0.1em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#16A34A",
              boxShadow: "0 0 8px #16A34A",
            }}
          />
          Initializing System Environment...
        </div>
      </div>
    </div>
  );
}
