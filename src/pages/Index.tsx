import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NebulaBackground } from "@/components/NebulaBackground";
import ToolsSection from "@/components/ToolsSection";
import DemoSection from "@/components/DemoSection";
import CTASection from "@/components/CTASection";
import { jumpToTopInstant } from "@/lib/jumpToTop";
import { cn } from "@/lib/utils";

const Index = () => {
  const [chatActive, setChatActive] = useState(false);
  const [homeEntering, setHomeEntering] = useState(false);
  const wasChatActiveRef = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (wasChatActiveRef.current && !chatActive) {
      jumpToTopInstant();
      document.getElementById("inicio")?.scrollIntoView({ block: "start", behavior: "auto" });
    }
    wasChatActiveRef.current = chatActive;
  }, [chatActive]);

  return (
    <>
      <NebulaBackground speed={1} />
      <div className="relative z-10 min-h-screen overflow-x-hidden">
        {/* Sessão 1: hero + demo (altura ≥ viewport — conteúdo de baixo só abaixo do fold) */}
        <DemoSection
          onChatActiveChange={setChatActive}
          homeEntering={homeEntering}
          onHomeEnteringChange={setHomeEntering}
        />
        {/* Sessão 2: restante da página (só entra no viewport após scroll) */}
        <section
          aria-label="Ferramentas e contacto"
          className={cn(
            "will-change-[opacity]",
            homeEntering
              ? "animate-fade-in-soft motion-reduce:animate-none motion-reduce:opacity-100"
              : "opacity-100",
          )}
        >
          {!chatActive && <ToolsSection />}
          {!chatActive && <CTASection />}
        </section>
      </div>
    </>
  );
};

export default Index;