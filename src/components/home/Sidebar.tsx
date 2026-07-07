/**
 * Left category rail (Figma node 17637:48881). 73px floating panel, 11 category
 * icons in a column (gap 24). The first (grid / "all") is the selected state:
 * a 48px #404040 rounded square. Height 680.
 */
const ICONS = [
  "/home/side/02.png",
  "/home/side/03.png",
  "/home/side/04.png",
  "/home/side/05.png",
  "/home/side/06.png",
  "/home/side/07.png",
  "/home/side/08.png",
  "/home/side/09.png",
  "/home/side/10.png",
  "/home/side/11.png",
];

export function Sidebar() {
  return (
    <aside
      className="flex h-[680px] w-[73px] flex-col items-center gap-[24px] rounded-[20px] py-[16px]"
      style={{ background: "#141414" }}
    >
      {/* selected: grid */}
      <div className="flex size-[48px] shrink-0 items-center justify-center rounded-[12px]" style={{ background: "#404040" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/side/01-grid.png" alt="Todas as categorias" className="size-[36px] object-contain" />
      </div>
      {ICONS.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt="" className="size-[36px] shrink-0 object-contain" />
      ))}
    </aside>
  );
}
