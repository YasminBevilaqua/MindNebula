import { Palette, LayoutGrid, Wand2, Layers } from "lucide-react";
import { AiDesignVisual } from "@/components/AiDesignVisual";

const tools = [
  {
    icon: Palette,
    title: "Direção de cor & mood",
    desc: "Harmonize paletas, gradientes e atmosfera para marca ou interface.",
  },
  {
    icon: LayoutGrid,
    title: "Composição & hierarquia",
    desc: "Sugestões de grid, ritmo visual e balanceamento de elementos.",
  },
  {
    icon: Wand2,
    title: "Conceitos criativos",
    desc: "Ideias de layout, naming e narrativa para o teu próximo projeto.",
  },
  {
    icon: Layers,
    title: "Do rascunho ao refinamento",
    desc: "Itere textos e estruturas até ficarem prontos para apresentar.",
  },
];

const ToolsSection = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-center mb-4">
          Ferramentas para quem{" "}
          <span className="gradient-text">desenha o futuro</span>
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10 text-base md:text-lg leading-relaxed">
          IA pensada para fluxo criativo — cor, layout e intenção, não só texto genérico.
        </p>

        <div className="flex justify-center mb-14 md:mb-16">
          <AiDesignVisual className="max-w-[300px] sm:max-w-[340px] md:max-w-[380px]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, i) => (
            <div
              key={tool.title}
              className="gradient-border card-hover p-6 rounded-xl bg-card opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/22 to-fuchsia-600/18 flex items-center justify-center mb-4 ring-1 ring-white/10">
                <tool.icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{tool.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
