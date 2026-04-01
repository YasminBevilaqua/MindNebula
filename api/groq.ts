/* eslint-disable @typescript-eslint/no-explicit-any -- handler Vercel sem tipos @vercel/node */
/* Node.js é o runtime predefinido para ficheiros em /api — não uses export const runtime aqui: a Vercel exige versão tipo nodejs22.x e "nodejs" sozinho quebra o build. */

import { Readable } from "node:stream";

/** Alinhado a `src/lib/nebulaSystemPrompt.ts` — duplicado aqui para o build Vercel sem imports fora de `/api`. */
const SYSTEM_PROMPT = `
Você é NebulaMind — apenas esse nome. Não diga que é "IA premium", "assistente premium", "versão premium" nem qualquer rótulo de produto além de NebulaMind.

REGRAS OBRIGATÓRIAS:

1. Estruture SEMPRE assim:

[Título com emoji]
Linha curta explicando

🔹 Tópicos organizados
🔹 Informações claras
🔹 Nada de blocos longos

2. Formatação:
- Use espaçamento entre blocos
- Máximo 2 frases por parágrafo
- Use emojis com propósito

3. Estilo:
- Direta e elegante
- Visualmente escaneável
- Resposta pronta pra UI moderna

4. PROIBIDO:
- texto longo sem quebra
- estilo acadêmico
- respostas genéricas
- afirmar que é "premium", "pro", "elite" ou equivalente comercial

5. FINAL:
Sempre termine com uma linha curta de fechamento (opcional, mas estilosa)

Objetivo:
Cada resposta deve soar natural, clara e alinhada à marca NebulaMind.

Formatação na resposta (obrigatório — a interface renderiza Markdown):
- Títulos: use linhas começando com # ou ## (ex.: "## ✨ Título")
- Negrito: **texto importante**
- Listas: linhas começando com "- " (hífen e espaço)
- Separe blocos com linha em branco entre parágrafos
`.trim();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildGroqPayload(content: string, wantsStream: boolean) {
  return {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content },
    ],
    max_tokens: 1024,
    temperature: 0.65,
    ...(wantsStream ? { stream: true as const } : {}),
  };
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) {
    res.status(500).json({
      error: "GROQ_API_KEY is not configured on the server.",
    });
    return;
  }

  let body: { content?: string; stream?: boolean };
  try {
    body = req.body as { content?: string; stream?: boolean };
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  if (body == null || typeof body !== "object") {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  const wantsStream = body.stream === true;
  if (!content) {
    res.status(400).json({ error: "Mensagem vazia" });
    return;
  }

  const groqPayload = buildGroqPayload(content, wantsStream);

  let groqRes: Response;
  try {
    groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(groqPayload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao contactar a API Groq";
    res.status(500).json({ error: msg });
    return;
  }

  if (wantsStream) {
    if (!groqRes.ok) {
      const rawJson = await groqRes.text();
      let errMsg = "Erro na API Groq";
      try {
        const errData = JSON.parse(rawJson) as { error?: { message?: string } };
        errMsg = errData.error?.message ?? errMsg;
      } catch {
        /* ignore */
      }
      res.status(500).json({ error: errMsg });
      return;
    }

    if (!groqRes.body) {
      res.status(500).json({ error: "Resposta vazia da API Groq" });
      return;
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const stream = Readable.fromWeb(groqRes.body as any);
    stream.pipe(res);
    return;
  }

  const rawJson = await groqRes.text();
  let data: {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };
  try {
    data = JSON.parse(rawJson) as typeof data;
  } catch {
    res.status(500).json({ error: "Resposta inválida da API Groq" });
    return;
  }

  if (!groqRes.ok) {
    res.status(500).json({
      error: data.error?.message ?? "Erro na API Groq",
    });
    return;
  }

  const text = data.choices?.[0]?.message?.content ?? "";
  res.status(200).json({ text });
}
