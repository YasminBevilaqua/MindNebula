# NebulaMind

Landing page e demonstração de chat com IA: interface escura com fundo de nebulosa animada (WebGL), secções de ferramentas e CTA, e um modo chat em ecrã completo com streaming de respostas via **Groq** (Llama 3.1).

## Funcionalidades

- **Hero / demo** — Campo para experimentar a IA; ao enviar, abre o modo chat em tela cheia.
- **Chat** — Mensagens do utilizador e respostas com Markdown; compositor flutuante estilo “glass”; barra lateral com nova conversa e voltar ao início.
- **Fundo animado** — Nebulosa procedural com Three.js (renderer direto), com fallback em gradiente se WebGL não estiver disponível.
- **API Groq** — Pedidos passam por um proxy de desenvolvimento (`/api/groq`) no Vite; a chave fica no servidor (ficheiro `.env`), não exposta no browser.

## Stack

| Área | Tecnologia |
|------|------------|
| Framework | [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| UI | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix), [React Router](https://reactrouter.com/) |
| IA | [Groq](https://groq.com/) (OpenAI-compatible API), modelo `llama-3.1-8b-instant` |
| 3D / fundo | [three.js](https://threejs.org/) |
| Testes | [Vitest](https://vitest.dev/) + Testing Library |
| E2E (opcional) | [Playwright](https://playwright.dev/) |

## Pré-requisitos

- **Node.js** 18+ (recomendado 20 LTS)
- Conta **Groq** e chave de API ([console.groq.com](https://console.groq.com/))

## Configuração

1. **Clonar e instalar dependências**

   ```bash
   git clone <url-do-repositório>
   cd NebulaMind-main
   npm install
   ```

2. **Variáveis de ambiente**

   Copia o exemplo e coloca a tua chave:

   ```bash
   copy .env.example .env
   ```

   No `.env`:

   ```env
   GROQ_API_KEY=gsk_...
   ```

   > Não uses `VITE_` para a chave: o proxy lê `GROQ_API_KEY` no servidor de desenvolvimento.

3. **Arrancar em desenvolvimento**

   ```bash
   npm run dev
   ```

   Abre o endereço indicado no terminal (por defeito `http://localhost:8080`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Servir o build localmente |
| `npm run lint` | ESLint |
| `npm test` | Vitest (uma execução) |
| `npm run test:watch` | Vitest em modo watch |

## Estrutura (resumo)

```
src/
  components/     # UI, NebulaBackground, DemoSection, chat (demo), shadcn
  lib/            # groqClient, nebulaSystemPrompt, jumpToTop, utils
  pages/          # Index, NotFound
  ...
vite-plugin-groq-proxy.ts   # Proxy /api/groq em dev
```

## Build de produção

O proxy Groq é um plugin do **Vite** pensado para desenvolvimento. Para produção, configura o mesmo encaminhamento no teu backend ou num serverless (env `GROQ_API_KEY` só no servidor).

```bash
npm run build
```

## Licença

Uso interno / projeto de demonstração — ajusta conforme a licença que quiseres para o repositório.
