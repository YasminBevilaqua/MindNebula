import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

type Props = {
  content: string;
};

export const nebulaMarkdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-heading text-xl font-semibold text-foreground mb-3 mt-1 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading text-base font-semibold text-foreground/95 mb-2 mt-3 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] md:text-base text-foreground/90 leading-relaxed mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1.5 text-[15px] md:text-base text-foreground/90 mb-3 last:mb-0 marker:text-primary/90">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1.5 text-[15px] md:text-base text-foreground/90 mb-3 last:mb-0 marker:text-primary/80">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic text-foreground/95">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline-offset-2 hover:underline font-medium"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-white/10" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/50 pl-4 my-3 text-muted-foreground italic">{children}</blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono text-sm`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.9em] text-foreground/95"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/35 p-4 text-sm last:mb-0">{children}</pre>
  ),
};

/**
 * Resposta formatada desde o primeiro render — sem markdown cru na UI.
 */
export function NebulaMarkdownContent({ content }: Props) {
  return (
    <div className="nebula-response-markdown text-[15px] md:text-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={nebulaMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
