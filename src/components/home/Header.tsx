import { SearchBar } from "../SearchBar";

/**
 * Home header — the docked search bar (Figma node 17637:48896). It's the very
 * same <SearchBar> the splash ends on, so the splash → home transition shows
 * no header change at all. 880px, sticky at the top.
 */
export function Header() {
  return (
    <header className="pb-home-header pointer-events-none sticky top-0 z-40 flex h-[80px] w-full items-center justify-center">
      <div className="pointer-events-auto w-[880px]">
        <SearchBar />
      </div>
    </header>
  );
}
