import { Logo } from "./Logo";

/**
 * The Collection search bar — the single source of truth for the docked bar.
 * Used both as the splash's docked field and as the home header, so the two
 * are literally the same element and nothing changes across the transition.
 * Width is controlled by the parent (splash animates it 680 → 880; home fixes
 * it at 880). Content matches Figma field 17637:48897 (logged-in):
 * logo + "Experiência Premium" badge, search input with camera, then folders /
 * star buttons and the amber avatar with a chevron bullet.
 */
export function SearchBar() {
  return (
    <div
      className="relative flex h-[56px] w-full items-center gap-[8px] rounded-[12px] py-[8px] pl-[16px] pr-[8px]"
      style={{
        background: "rgba(190,190,190,0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "inset 0px 2px 4px 0px rgba(255,255,255,0.15)",
      }}
    >
      {/* logo + premium badge */}
      <div className="flex shrink-0 items-center gap-[8px]">
        <Logo className="h-[32px] w-[27.749px] text-white" />
        {/* badge is a 146.5×22 slot; the SVG (155×30, with shadow bleed) sits at
            its natural aspect offset -4,-2 so the pill lines up exactly */}
        <div className="relative h-[22px] w-[146.521px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/home/header/tagplan.svg"
            alt="Experiência Premium"
            className="absolute left-[-4px] top-[-2px] h-[30px] w-[155px] max-w-none"
          />
        </div>
      </div>

      {/* input */}
      <div className="flex h-[40px] min-w-px flex-1 items-center justify-between rounded-[8px] bg-black px-[12px] py-[4px]">
        <div className="flex items-center gap-[12px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header/search.svg" alt="" className="size-[20px]" />
          <span className="text-[12px] leading-[20px] whitespace-nowrap" style={{ color: "#d4d4d4" }}>
            Buscar em 21.433 produtos
          </span>
        </div>
        <button type="button" aria-label="Buscar por imagem" className="flex h-[32px] items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header/camera.svg" alt="" className="size-[20px]" />
        </button>
      </div>

      {/* folders / star / avatar */}
      <div className="flex shrink-0 items-center gap-[8px]">
        <button type="button" aria-label="Pastas" className="flex size-[40px] items-center justify-center rounded-[8px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header/folders.svg" alt="" className="size-[20px]" />
        </button>
        <button type="button" aria-label="Favoritos" className="flex size-[40px] items-center justify-center rounded-[24px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header/star.svg" alt="" className="size-[20px]" />
        </button>
        <div className="relative">
          <div className="size-[32px] overflow-hidden rounded-full" style={{ background: "#d97706" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/header/avatar.png" alt="Usuário" className="h-full w-full object-cover" />
          </div>
          <div className="absolute left-[20px] top-[20px] flex size-[16px] items-center justify-center rounded-full bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/header/chevron-down.svg" alt="" className="size-[12px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
