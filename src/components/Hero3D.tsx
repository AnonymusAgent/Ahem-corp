"use client";

import type * as T from "three";
import { useEffect, useRef, useState } from "react";

/** Static line drawing used on small screens, for reduced-motion users and while WebGL loads. */
export function BlueprintSketch({ className = "" }: { className?: string }) {
  const p = { pathLength: 1, fill: "none", strokeWidth: 1.2, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg viewBox="0 0 400 360" className={`draw ${className}`} aria-hidden>
      <g stroke="#9db4cc" opacity="0.8">
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x="110" y={300 - (i + 1) * 22} width="96" height="18" {...p} style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x="222" y={300 - (i + 1) * 22} width="80" height="18" {...p} style={{ animationDelay: `${0.3 + i * 0.08}s` }} />
        ))}
        <rect x="84" y="300" width="240" height="14" {...p} />
      </g>
      <g stroke="#e89a38">
        <line x1="60" y1="314" x2="60" y2="36" {...p} />
        <line x1="24" y1="52" x2="210" y2="52" {...p} />
        <line x1="60" y1="36" x2="24" y2="52" {...p} />
        <line x1="60" y1="36" x2="150" y2="52" {...p} />
        <line x1="176" y1="52" x2="176" y2="98" {...p} />
        <rect x="168" y="98" width="16" height="10" {...p} />
        <line x1="20" y1="314" x2="380" y2="314" {...p} />
      </g>
    </svg>
  );
}

/**
 * Animated architectural structure (Three.js).
 * - loaded lazily and only on large screens with WebGL
 * - floors assemble from above, then the model responds gently to the pointer
 * - rendering pauses when the hero is scrolled out of view
 */
export default function Hero3D() {
  const mount = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el || !window.matchMedia("(min-width: 1024px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: T.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // WebGL unavailable: the SVG sketch stays visible.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText = "width:100%;height:100%;display:block";
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(12.5, 8.6, 14);
      camera.lookAt(0.4, 4.2, 0);
      const root = new THREE.Group();
      scene.add(root);

      const GOLD = 0xe89a38;
      const STEEL = 0x9db4cc;
      const NAVY = 0x142b40;
      const bin: { dispose(): void }[] = [];
      const keep = <X extends { dispose(): void }>(x: X) => (bin.push(x), x);

      const grid = new THREE.GridHelper(16, 16, GOLD, 0x2c4d70);
      const gridMat = grid.material as T.Material;
      gridMat.transparent = true;
      gridMat.opacity = 0.32;
      bin.push(grid.geometry, gridMat);
      root.add(grid);

      type Part = { obj: T.Object3D; y: number; delay: number; mats: T.Material[]; base: number[] };
      const parts: Part[] = [];
      function slab(w: number, h: number, d: number, x: number, y: number, z: number, delay: number, color: number, fill = 0.16) {
        const geo = keep(new THREE.BoxGeometry(w, h, d));
        const line = keep(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }));
        const face = keep(new THREE.MeshBasicMaterial({ color: NAVY, transparent: true, opacity: 0, depthWrite: false }));
        const g = new THREE.Group();
        g.add(new THREE.Mesh(geo, face), new THREE.LineSegments(keep(new THREE.EdgesGeometry(geo)), line));
        g.position.set(x, y + h / 2, z);
        root.add(g);
        parts.push({ obj: g, y: y + h / 2, delay, mats: [line, face], base: [0.95, fill] });
      }

      slab(7.2, 0.45, 5, 0.2, 0, 0, 0, STEEL, 0.28); // podium
      for (let i = 0; i < 12; i++) slab(2.7, 0.46, 2.7, -1.15, 0.45 + i * 0.54, -0.5, 0.3 + i * 0.1, i % 4 === 3 ? GOLD : STEEL);
      for (let i = 0; i < 7; i++) slab(2.3, 0.46, 3, 1.95, 0.45 + i * 0.54, 0.4, 0.55 + i * 0.1, i === 6 ? GOLD : STEEL);
      for (let i = 0; i < 3; i++) slab(1.5, 0.46, 1.5, 2.3, 0.45 + i * 0.54, -1.75, 0.9 + i * 0.1, STEEL);

      // Tower crane
      const goldLine = keep(new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.95 }));
      const edge = (w: number, h: number, d: number) => new THREE.LineSegments(keep(new THREE.EdgesGeometry(keep(new THREE.BoxGeometry(w, h, d)))), goldLine);
      const crane = new THREE.Group();
      crane.position.set(-3.9, 0, 1.9);
      const mast = edge(0.3, 9.4, 0.3);
      mast.position.y = 4.7;
      const jib = new THREE.Group();
      jib.position.y = 9.1;
      const arm = edge(6.4, 0.2, 0.2);
      arm.position.x = 2.4;
      const tail = edge(1.8, 0.2, 0.2);
      tail.position.x = -1.3;
      const weight = edge(0.6, 0.5, 0.4);
      weight.position.set(-1.9, -0.35, 0);
      const cap = edge(0.2, 0.9, 0.2);
      cap.position.y = 0.55;
      const cable = edge(0.03, 3, 0.03);
      cable.position.set(4.3, -1.5, 0);
      const hook = edge(0.32, 0.22, 0.32);
      hook.position.set(4.3, -3.1, 0);
      jib.add(arm, tail, weight, cap, cable, hook);
      crane.add(mast, jib);
      root.add(crane);

      const pointer = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      // Own time accumulator: the build-up animation keeps its place when rendering is paused off-screen.
      let t = 0;
      let last = performance.now();
      let raf = 0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        t += Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        for (const p of parts) {
          const k = reduce ? 1 : Math.min(1, Math.max(0, (t - p.delay) / 1));
          const e = 1 - Math.pow(1 - k, 3);
          p.obj.position.y = p.y + (1 - e) * 3.2;
          p.mats.forEach((m, i) => (m.opacity = p.base[i]! * e));
        }
        pointer.x += (target.x - pointer.x) * 0.04;
        pointer.y += (target.y - pointer.y) * 0.04;
        root.rotation.y = -0.3 + (reduce ? 0 : Math.sin(t * 0.14) * 0.16) + pointer.x * 0.2;
        root.rotation.x = pointer.y * 0.04;
        if (!reduce) {
          jib.rotation.y = 0.5 + Math.sin(t * 0.22) * 0.55;
          const drop = Math.sin(t * 0.5) * 0.5;
          cable.scale.y = 1 + drop * 0.3;
          cable.position.y = -1.5 * cable.scale.y;
          hook.position.y = -3 * cable.scale.y - 0.1;
        }
        renderer.render(scene, camera);
      };
      const io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(raf);
        if (entry?.isIntersecting) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      });
      io.observe(el);
      setLive(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        bin.forEach((x) => x.dispose());
        renderer.dispose();
        canvas.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="relative h-full w-full" aria-hidden>
      <BlueprintSketch className={`absolute inset-0 m-auto h-[78%] w-[78%] transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`} />
      <div ref={mount} className={`absolute inset-0 transition-opacity duration-1000 [mask-image:linear-gradient(to_bottom,black_80%,transparent_98%)] ${live ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
