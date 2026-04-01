const CTASection = () => {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      {/* Fundo em gradiente escuro (roxo/preto) — transições suaves para não criar “linha” no fim */}
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full w-full" aria-hidden>
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_40%,#16101f_0%,#0c0814_50%,#050508_100%)]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a0b2e]/55 to-[#08040f]/95"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#020203]/90 via-transparent to-transparent opacity-80"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary/85">Design × inteligência</p>
        <h2 className="mb-4 text-3xl font-heading font-bold md:text-5xl">
          Entre no futuro com{" "}
          <span className="gradient-text">NebulaMind</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground">
          Do moodboard ao entregável — uma IA pensada como par criativo no teu dia a dia.
        </p>

        <button className="glow-button rounded-xl px-10 py-4 font-heading text-lg font-semibold bg-primary text-primary-foreground">
          Começar gratuitamente
        </button>
      </div>
    </section>
  );
};

export default CTASection;
