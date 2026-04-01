import { House, MessageSquarePlus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mesma base visual que `ChatComposer` variant floating */
const glassSurface =
  "border border-white/[0.06] bg-[#2f2f2f]/92 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl";

const iconButton =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground/90 transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

type Props = {
  className?: string;
  onNewChat?: () => void;
  onExitChat?: () => void;
};

export function GlassNavBar({ className, onNewChat, onExitChat }: Props) {
  return (
    <nav
      className={cn(
        "pointer-events-auto fixed z-[55] flex flex-col items-center gap-1 rounded-3xl px-2 py-3",
        glassSurface,
        "left-[max(0.75rem,env(safe-area-inset-left,0px))] top-1/2 -translate-y-1/2",
        className,
      )}
      aria-label="Navegação do chat"
    >
      <div
        className="mb-1 flex h-10 w-10 items-center justify-center rounded-full text-primary"
        aria-hidden
      >
        <Sparkles className="h-5 w-5 stroke-[1.5]" />
      </div>
      <div className="mx-auto h-px w-6 bg-white/[0.08]" aria-hidden />
      {onNewChat && (
        <button type="button" className={iconButton} aria-label="Nova conversa" onClick={onNewChat}>
          <MessageSquarePlus className="h-5 w-5 stroke-[1.5]" />
        </button>
      )}
      {onExitChat && (
        <button type="button" className={iconButton} aria-label="Voltar ao início" onClick={onExitChat}>
          <House className="h-5 w-5 stroke-[1.5]" />
        </button>
      )}
    </nav>
  );
}
