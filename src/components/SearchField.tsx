import { Logo } from "./Logo";

/** Magnifier icon (node 17637:48551). */
function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="#d4d4d4" strokeWidth="1.6" />
      <path d="M13.5 13.5L17 17" stroke="#d4d4d4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** "Search by image" camera icon with notification dot (node 9320:76333). */
function CameraIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="1.75" y="4.75" width="15.5" height="12.5" rx="3" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="9.5" cy="11" r="3.25" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M6.5 4.5L7.6 2.9C7.8 2.6 8.1 2.5 8.4 2.5H10.6C10.9 2.5 11.2 2.6 11.4 2.9L12.5 4.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="18.5" cy="4" r="3.25" fill="#f59e0b" stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
}

/** Sparkle glyph used inside the premium badge. */
function Sparkle({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 0.5C6.4 2.9 7.1 3.6 9.5 4C7.1 4.4 6.4 5.1 6 7.5C5.6 5.1 4.9 4.4 2.5 4C4.9 3.6 5.6 2.9 6 0.5Z"
        fill="#1a1200"
      />
      <path d="M10 6.5C10.2 7.6 10.5 7.9 11.5 8C10.5 8.2 10.2 8.4 10 9.5C9.8 8.4 9.5 8.2 8.5 8C9.5 7.9 9.8 7.6 10 6.5Z" fill="#1a1200" />
    </svg>
  );
}

/**
 * The Collection search bar (Figma node 17637:48595 / 48545).
 * Glass container: logo + "Experiência Premium" badge, the search input,
 * and the "Entrar" button. Width is controlled by the parent so it can be
 * animated from the hero (centered) to the docked (top) state.
 */
export function SearchField() {
  return (
    <div
      className="relative flex h-[56px] w-full items-center gap-[16px] rounded-[12px] py-[8px] pl-[16px] pr-[8px]"
      style={{
        background: "rgba(190,190,190,0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "inset 0px 2px 4px 0px rgba(255,255,255,0.15)",
      }}
    >
      {/* Logo + premium badge */}
      <div className="flex shrink-0 items-center gap-[8px]">
        <Logo className="h-[32px] w-[27.749px] text-white" />
        <span
          className="flex h-[22px] items-center gap-[5px] rounded-full pl-[8px] pr-[10px] text-[11px] font-semibold whitespace-nowrap"
          style={{ background: "#f59e0b", color: "#1a1200" }}
        >
          <Sparkle />
          Experiência Premium
        </span>
      </div>

      {/* Input */}
      <div className="flex h-[40px] min-w-px flex-1 items-center justify-between rounded-[8px] bg-black px-[12px] py-[4px]">
        <div className="flex items-center gap-[12px]">
          <SearchIcon />
          <span className="text-[12px] leading-[20px] whitespace-nowrap" style={{ color: "#d4d4d4" }}>
            Buscar em 21.433 produtos
          </span>
        </div>
        <button
          type="button"
          className="flex h-[32px] items-center justify-center"
          aria-label="Buscar por imagem"
        >
          <CameraIcon />
        </button>
      </div>

      {/* Entrar */}
      <button
        type="button"
        className="flex h-[40px] shrink-0 items-center justify-center rounded-[8px] px-[20px] text-[12px] font-medium text-white"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        Entrar
      </button>
    </div>
  );
}
