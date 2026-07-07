import { Logo } from "../Logo";

/**
 * Logged-in docked search header (Figma node 17637:48896 / field 17637:48897).
 * 880px glass field: logo + "Experiência Premium" badge, search input with
 * camera, then folders / star buttons and the amber avatar with a chevron
 * bullet. Sticky at the top of the plugin home.
 */
export function Header() {
  return (
    <header className="pb-home-header sticky top-0 z-40 flex h-[80px] w-full items-center justify-center bg-black">
      <div
        className="relative flex h-[56px] w-[880px] items-center gap-[8px] rounded-[12px] py-[8px] pl-[16px] pr-[8px]"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/header/tagplan.svg" alt="Experiência Premium" className="h-[22px] w-[146.521px]" />
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
    </header>
  );
}
