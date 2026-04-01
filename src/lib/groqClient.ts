export const MAX_DISPLAY_CHARS = 4000;

function parseErrorPayload(data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error?: unknown }).error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
      return (err as { message: string }).message;
    }
  }
  return "Erro ao gerar resposta";
}

type StreamJson = {
  choices?: { delta?: { content?: string | null } }[];
};

export type GroqStreamOptions = {
  /** Chamado para cada troço vindo de `choices[0].delta.content`. */
  onDelta: (delta: string) => void;
  /** Executado quando o fluxo SSE termina sem erro (após o último chunk). */
  onComplete?: () => void;
};

function parseSseDataLine(line: string, onDelta: (s: string) => void) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return;
  const payload = trimmed.slice(5).trim();
  if (payload === "[DONE]") return;
  try {
    const json = JSON.parse(payload) as StreamJson;
    const piece = json.choices?.[0]?.delta?.content;
    if (typeof piece === "string" && piece.length > 0) onDelta(piece);
  } catch {
    /* ignorar linhas malformadas */
  }
}

/**
 * Lê o corpo `text/event-stream` da resposta, extraindo apenas `delta.content`.
 */
export async function readGroqSseBody(body: ReadableStream<Uint8Array>, onDelta: (s: string) => void): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? "";
      for (const line of parts) {
        parseSseDataLine(line, onDelta);
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (buffer.trim()) {
    parseSseDataLine(buffer, onDelta);
  }
}

/** POST `/api/groq` com `{ stream: true }` e consome o SSE até o fim. */
export async function streamGroqCompletion(content: string, options: GroqStreamOptions): Promise<void> {
  const { onDelta, onComplete } = options;
  const res = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: content.trim(), stream: true }),
  });

  const ct = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let data: unknown = {};
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const t = await res.text().catch(() => "");
      try {
        data = JSON.parse(t);
      } catch {
        data = { error: t || "Erro ao gerar resposta" };
      }
    }
    throw new Error(parseErrorPayload(data));
  }

  if (!res.body) {
    throw new Error("Erro ao gerar resposta");
  }

  await readGroqSseBody(res.body, onDelta);
  onComplete?.();
}

/** Resposta completa de uma só vez (útil para código legado sem UI incremental). */
export async function generateWithGroq(content: string): Promise<string> {
  let text = "";
  await streamGroqCompletion(content, {
    onDelta: (d) => {
      text += d;
    },
  });
  if (text.length > MAX_DISPLAY_CHARS) {
    text = text.slice(0, MAX_DISPLAY_CHARS).trimEnd() + "…";
  }
  return text;
}
