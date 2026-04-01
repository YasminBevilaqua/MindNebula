import { useEffect, useState, memo } from "react";
import { NebulaWebGLCanvas } from "@/components/nebula/NebulaWebGLCanvas";

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useLowPerformanceProfile(): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setLow(mobile || cores <= 4 || (typeof mem === "number" && mem <= 4));
  }, []);
  return low;
}

function useDevicePixelRatioCap(lowPerf: boolean): number {
  if (typeof window === "undefined") return 1;
  if (lowPerf) return 1;
  const raw = window.devicePixelRatio || 1;
  return Math.min(1.25, Math.max(1, raw * 0.85));
}

export type NebulaBackgroundProps = {
  speed?: number;
  intensity?: number;
};

/**
 * Nebulosa animada em WebGL (Three.js direto — evita R3F/useMeasure com altura 0 em `fixed`).
 * Fallback: gradiente estático se WebGL não existir.
 */
function NebulaBackgroundInner({ speed = 1, intensity = 1.05 }: NebulaBackgroundProps) {
  const [webglOk, setWebglOk] = useState(() =>
    typeof window !== "undefined" ? isWebGLAvailable() : true,
  );
  const reducedMotion = useReducedMotion();
  const lowPerf = useLowPerformanceProfile();
  const dprMax = useDevicePixelRatioCap(lowPerf);

  useEffect(() => {
    setWebglOk(isWebGLAvailable());
  }, []);

  const baseSpeed = 0.152 * speed;
  const shaderSpeed = lowPerf ? baseSpeed * 0.65 : baseSpeed;
  const shaderIntensity = lowPerf ? intensity * 0.88 : intensity;
  const timeScale = reducedMotion ? 0.32 : 1;

  return (
    <>
      {!webglOk ? (
        <div
          className="pointer-events-none fixed inset-0 z-0 min-h-[100dvh] min-h-[100svh] w-full max-w-none overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, #100a20 0%, #181c3e 18%, #2c2872 42%, #4e1f78 68%, #080a1a 100%)",
            minHeight: "max(100dvh, 100%)",
          }}
          aria-hidden
        />
      ) : (
        <div
          className="pointer-events-none fixed inset-0 z-0 h-[100dvh] min-h-[100svh] w-full max-w-none overflow-hidden"
          style={{ minHeight: "max(100dvh, 100%)" }}
        >
          <NebulaWebGLCanvas
            shaderSpeed={shaderSpeed}
            intensity={shaderIntensity}
            timeScale={timeScale}
            dprMax={dprMax}
            lowPerf={lowPerf}
          />
        </div>
      )}

      <div
        className="pointer-events-none fixed inset-0 z-[1] h-[100dvh] min-h-[100svh] w-full max-w-none overflow-hidden bg-gradient-to-b from-[#050510]/40 via-transparent to-[#070818]/50"
        style={{ minHeight: "max(100dvh, 100%)" }}
        aria-hidden
      />
    </>
  );
}

export const NebulaBackground = memo(NebulaBackgroundInner);

export const Nebula = memo(function Nebula({
  speed = 1,
}: {
  speed?: number;
  nebulaColor?: string;
}) {
  return <NebulaBackground speed={speed} />;
});
