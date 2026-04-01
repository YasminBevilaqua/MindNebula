import { ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
  /** `floating` = pílula centrada estilo chat moderno (sem barra full-width) */
  variant?: "default" | "floating";
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
  variant = "default",
}: Props) {
  if (variant === "floating") {
    return (
      <div
        className="flex w-full items-center gap-1 rounded-full border border-white/[0.06] bg-[#2f2f2f]/92 py-1.5 pl-3 pr-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
      >
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground/90 transition-colors hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Mais opções"
          disabled={disabled}
        >
          <Plus className="h-5 w-5 stroke-[1.5]" aria-hidden />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder ?? "Pergunte alguma coisa"}
          disabled={disabled}
          className="min-h-[44px] min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/65"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          aria-label="Enviar"
          className={cn(
            "glow-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary via-[hsl(270_93%_57%)] to-[hsl(282_84%_52%)] text-primary-foreground shadow-lg shadow-primary/30",
            "transition-transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-45 disabled:hover:scale-100",
          )}
        >
          <ArrowUp className="h-4 w-4 shrink-0 stroke-[2.5]" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder ?? 'Digite algo… (ex: "crie uma legenda para Instagram")'}
        className="neon-input min-h-11 flex-1 rounded-xl border-0 bg-white/[0.06] px-3.5 py-3 text-[15px] text-foreground shadow-inner outline-none ring-0 placeholder:text-muted-foreground/80 md:text-base focus-visible:ring-0"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        aria-label="Enviar"
        className={cn(
          "glow-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          "bg-gradient-to-br from-primary via-[hsl(270_93%_57%)] to-[hsl(282_84%_52%)] text-primary-foreground shadow-lg shadow-primary/30",
          "transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100",
        )}
      >
        <ArrowUp className="h-4 w-4 shrink-0 stroke-[2.5]" aria-hidden />
      </button>
    </div>
  );
}
