/** Scroll imediato ao topo (vários contentores — útil após sair de overlay fixed). */
export function jumpToTopInstant(): void {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const se = document.scrollingElement;
  if (se) (se as HTMLElement).scrollTop = 0;
  const root = document.getElementById("root");
  if (root) root.scrollTop = 0;
}
