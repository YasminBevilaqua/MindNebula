import { useEffect, useRef } from "react";

const Particles = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 4 + 1;
      p.className = "particle";
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `-${Math.random() * 20}%`;
      p.style.animationDuration = `${Math.random() * 15 + 10}s`;
      p.style.animationDelay = `${Math.random() * 10}s`;
      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0" />;
};

export default Particles;
