import { useEffect, useRef } from "react";
import * as THREE from "three";
import { nebulaFragmentShader, nebulaVertexShader } from "@/components/nebula/nebulaShaders";

export type NebulaWebGLCanvasProps = {
  /** Já inclui multiplicadores (ex.: 0.152 * speed * perf) */
  shaderSpeed: number;
  intensity: number;
  timeScale: number;
  dprMax: number;
  lowPerf: boolean;
};

/**
 * Fundo WebGL sem R3F: o Canvas do @react-three/fiber só monta quando useMeasure
 * vê dimensões > 0 — em `fixed`/scroll isso falha e fica o gradiente estático.
 */
export function NebulaWebGLCanvas({
  shaderSpeed,
  intensity,
  timeScale,
  dprMax,
  lowPerf,
}: NebulaWebGLCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ shaderSpeed, intensity, timeScale });
  propsRef.current = { shaderSpeed, intensity, timeScale };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: intensity },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: lowPerf ? "low-power" : "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x050508, 1);

    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
    container.appendChild(canvas);

    const clock = new THREE.Clock();
    let frameId = 0;

    const resize = () => {
      const w = Math.max(1, Math.floor(container.clientWidth));
      const h = Math.max(1, Math.floor(container.clientHeight));
      const raw = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const dpr = Math.min(dprMax, Math.max(1, raw));
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      const { shaderSpeed: sp, intensity: int, timeScale: ts } = propsRef.current;
      uniforms.uTime.value = clock.getElapsedTime() * sp * ts;
      uniforms.uIntensity.value = int;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [dprMax, lowPerf]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
      aria-hidden
    />
  );
}
