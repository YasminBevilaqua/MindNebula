import { useLayoutEffect, useRef } from "react";
import type { ChatTurn } from "./types";
import { AssistantStreamReply } from "@/components/demo/AssistantStreamReply";

type Props = {
  turns: ChatTurn[];
};

export function ChatMessageThread({ turns }: Props) {
  const threadRef = useRef<HTMLDivElement>(null);
  const latestQuestionRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const latestQuestion = latestQuestionRef.current;
    if (!latestQuestion) return;

    let scroller: HTMLElement | null = threadRef.current?.parentElement ?? null;
    while (scroller) {
      const { overflowY } = window.getComputedStyle(scroller);
      if (overflowY === "auto" || overflowY === "scroll") break;
      scroller = scroller.parentElement;
    }

    if (!scroller) {
      latestQuestion.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    // Mantem a nova pergunta visivel logo abaixo do titulo fixo.
    const targetTop = latestQuestion.offsetTop - 72;
    scroller.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  }, [turns.length]);

  return (
    <div ref={threadRef} className="flex flex-col gap-6 pr-1">
      {turns.map((turn, index) => (
        <article
          key={turn.id}
          className="flex flex-col gap-3 scroll-mt-4 md:scroll-mt-6"
        >
          <div
            className="flex justify-end"
            ref={index === turns.length - 1 ? (node) => (latestQuestionRef.current = node) : undefined}
          >
            <div
              className="max-w-[min(100%,28rem)] rounded-2xl rounded-br-md border-0 bg-gradient-to-br from-primary via-[hsl(270_93%_57%)] to-[hsl(282_84%_52%)] px-4 py-3 text-left text-[15px] md:text-base text-primary-foreground"
            >
              <p className="leading-relaxed whitespace-pre-wrap break-words">{turn.userMessage}</p>
            </div>
          </div>

          <div className="flex justify-start w-full min-w-0">
            <div className="w-full max-w-full min-w-0">
              {turn.pending && !turn.assistantMessage && (
                <p
                  className="text-[15px] md:text-base leading-relaxed text-muted-foreground animate-pulse"
                  aria-live="polite"
                >
                  Pensando...
                </p>
              )}
              {!turn.error && turn.assistantMessage && (
                <AssistantStreamReply turn={turn} />
              )}
              {!turn.pending && turn.error && (
                <p className="text-[15px] md:text-base leading-relaxed text-destructive/90" role="alert">
                  {turn.error}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
      {/* Folga extra para "virar página" entre perguntas consecutivas */}
      <div className="h-[85vh] min-h-[420px]" aria-hidden />
    </div>
  );
}