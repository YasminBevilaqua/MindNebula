import { useEffect, useState } from "react";
import { streamGroqCompletion } from "@/lib/groqClient";
import { jumpToTopInstant } from "@/lib/jumpToTop";
import { cn } from "@/lib/utils";
import { ChatComposer } from "@/components/demo/ChatComposer";
import { GlassNavBar } from "@/components/demo/GlassNavBar";
import { ChatMessageThread } from "@/components/demo/ChatMessageThread";
import { createBatchedTurnUpdater } from "@/components/demo/batchedTurnUpdater";
import type { ChatTurn } from "@/components/demo/types";

type Props = {
  onChatActiveChange?: (active: boolean) => void;
  /** Sincronizado com Index — dispara fade-in da home ao sair do chat */
  homeEntering?: boolean;
  onHomeEnteringChange?: (entering: boolean) => void;
};

const DemoSection = ({
  onChatActiveChange,
  homeEntering = false,
  onHomeEnteringChange,
}: Props) => {
  const [input, setInput] = useState("");
  const [chatActive, setChatActive] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chatActive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [chatActive]);

  useEffect(() => {
    onChatActiveChange?.(chatActive);
  }, [chatActive, onChatActiveChange]);

  const handleGenerate = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (!chatActive) {
      setInitialError(null);
      setIsLoading(true);
      const id = crypto.randomUUID();
      const batcher = createBatchedTurnUpdater(id, setTurns);
      setTurns([
        {
          id,
          userMessage: trimmed,
          assistantMessage: null,
          error: null,
          pending: true,
        },
      ]);
      setChatActive(true);
      setInput("");
      try {
        await streamGroqCompletion(trimmed, {
          onDelta: (d) => batcher.pushDelta(d),
        });
        batcher.flushPending();
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, pending: false } : t)));
      } catch (e) {
        batcher.flushPending();
        const msg = e instanceof Error ? e.message : "Erro ao gerar resposta";
        setTurns([]);
        setChatActive(false);
        setInitialError(msg);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const id = crypto.randomUUID();
    setTurns((prev) => [
      ...prev,
      {
        id,
        userMessage: trimmed,
        assistantMessage: null,
        error: null,
        pending: true,
      },
    ]);
    setInput("");
    setIsLoading(true);
    const batcher = createBatchedTurnUpdater(id, setTurns);
    try {
      await streamGroqCompletion(trimmed, {
        onDelta: (d) => batcher.pushDelta(d),
      });
      batcher.flushPending();
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, pending: false } : t)));
    } catch (e) {
      batcher.flushPending();
      const msg = e instanceof Error ? e.message : "Erro ao gerar resposta";
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, error: msg, pending: false, assistantMessage: null } : t,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const composerInitial = (
    <ChatComposer
      variant="default"
      value={input}
      onChange={setInput}
      onSubmit={handleGenerate}
      disabled={isLoading}
    />
  );

  const composerFloating = (
    <ChatComposer
      variant="floating"
      value={input}
      onChange={setInput}
      onSubmit={handleGenerate}
      disabled={isLoading}
    />
  );

  const handleGlassNewChat = () => {
    setTurns([]);
    setInput("");
    setInitialError(null);
  };

  /** Alinhar com `animate-fade-in-soft` no tailwind (0.48s) — não cortar a animação */
  const HOME_ENTER_FADE_MS = 500;

  const leaveChatToHome = () => {
    /* Com o overlay ainda visível: a página por baixo já fica em Y=0 antes de desmontar o chat */
    jumpToTopInstant();
    setTurns([]);
    setChatActive(false);
    setInput("");
    setInitialError(null);
    onChatActiveChange?.(false);
    jumpToTopInstant();
    onHomeEnteringChange?.(true);
    window.setTimeout(() => onHomeEnteringChange?.(false), HOME_ENTER_FADE_MS);
  };

  return (
    <>
      {/*
        min-h-dvh sempre: com chat aberto, antes tínhamos min-h-0 e a secção colapsava —
        Tools/CTA subiam para o topo; ao fechar, via-se essa zona antes da hero.
      */}
      <section
        id="inicio"
        className={cn(
          "relative min-h-dvh min-h-[100svh] scroll-mt-0",
          !chatActive && "flex flex-col justify-center",
          chatActive && "pointer-events-none",
        )}
        aria-hidden={chatActive}
        aria-labelledby={chatActive ? undefined : "demo-heading"}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent"
          aria-hidden
        />

        {!chatActive && (
        <div
          className={cn(
            "relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-10 will-change-[opacity] md:pb-20 md:pt-14",
            homeEntering
              ? "animate-fade-in-soft motion-reduce:animate-none motion-reduce:opacity-100"
              : "opacity-100",
          )}
        >
          <div className="text-center mb-10 md:mb-12">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[#c04de6] mb-3">
              NebulaMind
            </p>
            <h2
              id="demo-heading"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.08] mb-4"
            >
              Experimente{" "}
              <span className="gradient-text bg-[length:120%_100%]">agora</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/95 max-w-xl mx-auto leading-relaxed">
              Veja a IA em ação com uma demonstração interativa
            </p>
          </div>

          <div
            className="rounded-3xl p-5 md:p-6 bg-[hsl(240_18%_8%/0.5)] backdrop-blur-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.5)]"
          >
            {composerInitial}
            {initialError && (
              <div
                className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-[15px] md:text-base leading-relaxed text-destructive/90"
                role="alert"
              >
                {initialError}
              </div>
            )}
            {isLoading && (
              <p className="mt-5 text-[15px] md:text-base text-muted-foreground animate-pulse" aria-live="polite">
                Pensando...
              </p>
            )}
          </div>
        </div>
        )}
      </section>

      {chatActive && (
        <section
          className="fixed inset-0 z-50 flex min-h-dvh flex-col"
          aria-label="Demonstração de chat NebulaMind"
        >
          <GlassNavBar onNewChat={handleGlassNewChat} onExitChat={leaveChatToHome} />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-[max(0.8rem,env(safe-area-inset-top,0px))]">
            <button
              type="button"
              onClick={leaveChatToHome}
              aria-label="Voltar para a página inicial"
              className="pointer-events-auto cursor-pointer rounded-md px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:text-base"
            >
              <span className="text-white">Nebula</span>
              <span className="text-primary">Mind</span>
            </button>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col w-full pt-14 md:pt-16">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(9rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(10rem+env(safe-area-inset-bottom,0px))]">
                <div className="mx-auto w-full max-w-3xl pl-[4.75rem] pr-1 min-[920px]:px-4 min-[920px]:pr-1">
                  <ChatMessageThread turns={turns} />
                </div>
              </div>
            </div>
          </div>

          {/* Sem faixa full-width: só a pílula flutuante, fundo transparente */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <div className="pointer-events-auto w-full max-w-2xl">
              {composerFloating}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default DemoSection;