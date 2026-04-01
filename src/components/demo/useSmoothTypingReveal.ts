import { useEffect, useRef, useState } from "react";

function sliceByCodePoints(s: string, count: number): string {
  if (count <= 0) return "";
  const arr = [...s];
  return arr.slice(0, Math.min(count, arr.length)).join("");
}

function codePointLength(s: string): number {
  return [...s].length;
}

export type SmoothTypingOptions = {
  /** Caracteres (Unicode estendido) por segundo — valores mais baixos = digitação mais lenta. */
  charsPerSecond?: number;
  /** Se true, revela instantaneamente todo o texto disponível. */
  instant?: boolean;
};

/**
 * Revela `fullText` progressivamente de forma contínua (tempo real), alinhado ao stream da API
 * mas com velocidade de exibição teto — efeito de digitação fluido sem dados fictícios.
 */
export function useSmoothTypingReveal(
  fullText: string,
  turnId: string,
  apiPending: boolean,
  options?: SmoothTypingOptions,
): { displayText: string; revealComplete: boolean } {
  const charsPerSecond = options?.charsPerSecond ?? 54;
  const instant = options?.instant === true;
  const [visibleCount, setVisibleCount] = useState(0);
  const visibleRef = useRef(0);
  const carryRef = useRef(0);
  const fullRef = useRef(fullText);
  const pendingRef = useRef(apiPending);
  fullRef.current = fullText;
  pendingRef.current = apiPending;

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    visibleRef.current = 0;
    carryRef.current = 0;
    setVisibleCount(0);
  }, [turnId]);

  useEffect(() => {
    if (reducedMotion || instant) return;

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const full = fullRef.current;
      const targetLen = codePointLength(full);
      const pending = pendingRef.current;
      let len = visibleRef.current;

      if (len >= targetLen && !pending) {
        return;
      }

      carryRef.current += charsPerSecond * dt;
      const add = Math.floor(carryRef.current);
      carryRef.current -= add;
      len = Math.min(len + add, targetLen);
      visibleRef.current = len;
      setVisibleCount(len);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [turnId, charsPerSecond, reducedMotion, instant]);

  useEffect(() => {
    if (!instant) return;
    const len = codePointLength(fullRef.current);
    visibleRef.current = len;
    setVisibleCount(len);
  }, [instant, fullText]);

  const targetLen = codePointLength(fullText);
  const displayText = reducedMotion || instant ? fullText : sliceByCodePoints(fullText, visibleCount);
  const revealComplete = reducedMotion || instant ? !apiPending : visibleCount >= targetLen && !apiPending;

  return { displayText, revealComplete };
}


