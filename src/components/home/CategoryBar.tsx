/**
 * Category bar (Figma node 17637:48667). A scrollable row of 150×190 category
 * tiles (photo + label) over a divider row of equal-width subcategory chips.
 */
const TILES: [string, string][] = [
  ["/home/cat/01-mdf.png", "MDF | Marcenaria"],
  ["/home/cat/02-porcelanato.png", "Porcelanato e Cerâmico"],
  ["/home/cat/03-tintas.png", "Tintas e Texturas"],
  ["/home/cat/04-pedras.png", "Pedras"],
  ["/home/cat/05-metal.png", "Metal"],
  ["/home/cat/06-tecido.png", "Tecido e Couro"],
  ["/home/cat/07-vidro.png", "Vidro"],
  ["/home/cat/08-louca.png", "Louça"],
  ["/home/cat/09-concreto.png", "Concreto, Cimento..."],
  ["/home/cat/10-papel.png", "Papel de parede"],
  ["/home/cat/11-laminado.png", "Laminado e Vinílico"],
  ["/home/cat/12-natural.png", "Natural"],
  ["/home/cat/13-tijolo.png", "Tijolo"],
  ["/home/cat/14-acrilico.png", "Acrílico e Plástico"],
];

const CHIPS: [string, string][] = [
  ["/home/chip/1-decoracao.png", "Decoração"],
  ["/home/chip/2-moveis.png", "Móveis"],
  ["/home/chip/3-loucas.png", "Louças e Metais"],
  ["/home/chip/4-iluminacao.png", "Iluminação"],
  ["/home/chip/5-eletrodomesticos.png", "Eletrodomésticos"],
  ["/home/chip/6-esquadrias.png", "Esquadrias"],
  ["/home/chip/7-eletronicos.png", "Eletrônicos"],
  ["/home/chip/8-vegetacao.png", "Vegetação"],
];

export function CategoryBar() {
  return (
    <section className="pt-[24px] pb-[24px]">
      {/* tiles */}
      <div className="pb-home-scroll flex gap-[16px] overflow-x-auto pb-[24px]">
        {TILES.map(([src, label], i) => (
          <div
            key={i}
            className="flex h-[190px] w-[150px] shrink-0 flex-col items-center justify-center gap-[12px] rounded-[12px] border border-[#262626] px-[4px] pt-[4px] pb-[12px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div className="aspect-square w-full overflow-hidden rounded-[8px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="h-full w-full object-cover" />
            </div>
            <p className="text-center text-[12px] font-medium leading-[20px] whitespace-nowrap" style={{ color: "#e5e5e5" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* subcategory chips */}
      <div className="flex items-center justify-center gap-[16px] border-t border-[#262626] pt-[24px]">
        {CHIPS.map(([src, label], i) => (
          <div
            key={i}
            className="flex min-w-px flex-1 items-center gap-[12px] rounded-[12px] border border-[#262626] py-[4px] pl-[4px] pr-[12px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex size-[40px] shrink-0 items-center justify-center rounded-[8px] p-[2px]" style={{ background: "#232323" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className="h-full w-full object-cover" />
            </div>
            <p className="min-w-px flex-1 truncate text-[12px] font-medium leading-[20px]" style={{ color: "#e5e5e5" }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
