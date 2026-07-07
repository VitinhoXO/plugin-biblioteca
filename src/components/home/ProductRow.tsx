/**
 * Product section (Figma node 17637:48748): a title with a chevron and
 * prev/next controls, over a scrollable row of cardProductPlugin cards
 * (17637:48762). Card: 308px, thumb 280 (rounded 12), brand avatar + name +
 * "categoria • subcategoria", and a "Usar no projeto" button.
 */

function ChevronRight({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M7.5 4.5L13 10L7.5 15.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M12.5 4.5L7 10L12.5 15.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Card images for a row: first is object-contain (sphere on dark), rest cover.
const CARD_IMAGES: [string, boolean][] = [
  ["/home/card/c1.png", true],
  ["/home/card/c2.png", false],
  ["/home/card/c3.png", false],
  ["/home/card/c4.png", false],
  ["/home/card/c4.png", false],
];

function ProductCard({ src, contain }: { src: string; contain: boolean }) {
  return (
    <div
      className="flex w-[308px] shrink-0 flex-col items-start gap-[12px] rounded-[16px] border border-[#404040] p-[8px]"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <div className="h-[280px] w-full overflow-hidden rounded-[12px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Lombarda Massima Mocha" className={`h-full w-full ${contain ? "object-contain" : "object-cover"}`} />
      </div>

      <div className="flex w-full items-center gap-[12px] px-[8px]">
        <div className="size-[32px] shrink-0 overflow-hidden rounded-[4px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/card/brand.png" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-px flex-1 flex-col">
          <div className="flex flex-col gap-[4px]">
            <p className="text-[16px] font-medium leading-[24px] whitespace-nowrap" style={{ color: "#f5f5f5" }}>
              Lombarda Massima Mocha
            </p>
            <div className="flex items-center gap-[4px] font-[family-name:var(--font-inter)] text-[12px] leading-[1.5]" style={{ color: "#d4d4d4" }}>
              <span>Móveis</span>
              <span className="size-[3px] rounded-full" style={{ background: "#d4d4d4" }} />
              <span>Cristaleira</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="relative flex h-[44px] w-full items-center justify-center overflow-hidden rounded-[12px] border"
        style={{
          borderColor: "rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.16)",
          boxShadow: "inset 0px 0px 24px 0px rgba(255,255,255,0.16)",
        }}
      >
        <span className="text-[14px] font-semibold text-white">
          Usar no projeto <span className="text-[12px] font-medium">(23)</span>
        </span>
      </button>
    </div>
  );
}

export function ProductRow({ title }: { title: string }) {
  return (
    <section className="pt-[32px]">
      <div className="flex h-[36px] items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <h2 className="text-[24px] font-semibold leading-[32px] whitespace-nowrap text-white">{title}</h2>
          <button type="button" aria-label="Ver tudo" className="flex size-[20px] items-center justify-center">
            <ChevronRight color="#ffffff" />
          </button>
        </div>
        <div className="flex items-center gap-[4px]">
          <button
            type="button"
            aria-label="Anterior"
            className="flex size-[36px] items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <ChevronLeft color="#a3a3a3" />
          </button>
          <button
            type="button"
            aria-label="Próximo"
            className="flex size-[36px] items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <ChevronRight color="#ffffff" />
          </button>
        </div>
      </div>

      <div className="pb-home-scroll mt-[32px] flex gap-[20px] overflow-x-auto pb-[4px]">
        {CARD_IMAGES.map(([src, contain], i) => (
          <ProductCard key={i} src={src} contain={contain} />
        ))}
      </div>
    </section>
  );
}
