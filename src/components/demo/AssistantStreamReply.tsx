import { useEffect, useRef, useState } from "react";
import type { ChatTurn } from "./types";
import { NebulaMarkdownContent } from "@/components/NebulaMarkdownContent";
import { useSmoothTypingReveal } from "./useSmoothTypingReveal";
import { cn } from "@/lib/utils";
import { Check, Copy, RotateCcw } from "lucide-react";

type Props = {
  turn: ChatTurn;
  onRevealProgress?: () => void;
  onRetry?: (turnId: string) => void;
};

export function AssistantStreamReply({ turn, onRevealProgress, onRetry }: Props) {
  const [instantReveal, setInstantReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const full = turn.assistantMessage ?? "";
  const { displayText, revealComplete } = useSmoothTypingReveal(full, turn.id, turn.pending, {
    charsPerSecond: 54,
    instant: instantReveal,
  });
  const prevDisplay = useRef("");

  useEffect(() => {
    setInstantReveal(false);
  }, [turn.id]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (displayText !== prevDisplay.current && onRevealProgress) {
      prevDisplay.current = displayText;
      onRevealProgress();
    }
  }, [displayText, onRevealProgress]);

  const showCaret = (turn.pending || !revealComplete) && full.length > 0;
  const canSkipTyping = !instantReveal && full.length > 0 && !revealComplete;
  const showActions = !turn.pending && !turn.error && full.length > 0 && revealComplete;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
    } catch {
      // Sem clipboard disponível: mantém botão sem feedback.
    }
  };

  return (
    <div className="min-w-0 w-full">
      <div
        key={revealComplete ? `${turn.id}-done` : `${turn.id}-typing`}
        role={canSkipTyping ? "button" : undefined}
        tabIndex={canSkipTyping ? 0 : -1}
        onClick={canSkipTyping ? () => setInstantReveal(true) : undefined}
        onKeyDown={
          canSkipTyping
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setInstantReveal(true);
                }
              }
            : undefined
        }
        className={cn(
          canSkipTyping && "cursor-pointer",
          revealComplete &&
            "animate-fade-in-soft motion-reduce:animate-none motion-reduce:opacity-100",
        )}
      >
        <NebulaMarkdownContent content={displayText} />
        {showCaret && (
          <span
            className="ml-0.5 inline-block w-px h-[1.05em] align-baseline bg-primary/75 motion-reduce:hidden animate-pulse rounded-[1px]"
            aria-hidden
          />
        )}
      </div>
      {showActions && (
        <div className="mt-4 flex items-center gap-3 text-muted-foreground">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center text-muted-foreground/85 hover:text-foreground transition-colors"
            aria-label={copied ? "Copiado" : "Copiar resposta"}
            title={copied ? "Copiado" : "Copiar"}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => onRetry?.(turn.id)}
            className="inline-flex items-center justify-center text-muted-foreground/85 hover:text-foreground transition-colors"
            aria-label="Tentar novamente"
            title="Tente novamente"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
