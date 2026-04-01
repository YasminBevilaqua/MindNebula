import type { Dispatch, SetStateAction } from "react";
import type { ChatTurn } from "./types";
import { MAX_DISPLAY_CHARS } from "@/lib/groqClient";

/**
 * Agrupa deltas SSE em até um setState por animation frame para limitar re-renders.
 */
export function createBatchedTurnUpdater(turnId: string, setTurns: Dispatch<SetStateAction<ChatTurn[]>>) {
  let pending = "";
  let raf: number | null = null;

  const flush = () => {
    raf = null;
    const chunk = pending;
    pending = "";
    if (!chunk) return;
    setTurns((prev) =>
      prev.map((t) => {
        if (t.id !== turnId) return t;
        const base = t.assistantMessage ?? "";
        let next = base + chunk;
        if (next.length > MAX_DISPLAY_CHARS) {
          next = next.slice(0, MAX_DISPLAY_CHARS).trimEnd() + "…";
        }
        return { ...t, assistantMessage: next };
      }),
    );
  };

  return {
    pushDelta(delta: string) {
      pending += delta;
      if (raf == null) {
        raf = requestAnimationFrame(flush);
      }
    },
    flushPending() {
      if (raf != null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      flush();
    },
  };
}
