"use client";

import { Logo } from "./Logo";

/**
 * Welcome gate shown once the splash resolves: the whole home sits blurred
 * behind a full-screen scrim, with a short message and a COMEÇAR button.
 * Clicking COMEÇAR (handled by the parent) clears the blur into the live home.
 */
export function WelcomeGate({ onStart, closing = false }: { onStart: () => void; closing?: boolean }) {
  return (
    <div className={`pb-gate fixed inset-0 z-[60] flex items-center justify-center${closing ? " pb-gate-closing" : ""}`}>
      <div
        className="pb-gate-scrim absolute inset-0"
        style={{
          background: "rgba(6,6,8,0.5)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
      />

      <div className="pb-gate-content relative flex flex-col items-center gap-[28px] px-6 text-center">
        <Logo className="h-[40px] w-[34.69px] text-white" />

        <h2 className="m-0 font-semibold uppercase leading-[1.1] text-white [font-size:clamp(30px,4.4vw,56px)]">
          Sua biblioteca
          <br />
          está pronta
        </h2>

        <p className="max-w-[440px] text-[15px] leading-[1.55] text-white/60">
          Mais de 22.000 materiais e produtos prontos pra aplicar e renderizar direto no seu projeto.
        </p>

        <button
          type="button"
          onClick={onStart}
          className="pb-gate-btn mt-[4px] flex h-[52px] items-center justify-center rounded-full px-[44px] text-[15px] font-bold uppercase tracking-[0.06em]"
          style={{
            background: "linear-gradient(135deg, #FFC400 0%, #F6D873 100%)",
            color: "#3a2a00",
            boxShadow: "0 10px 34px rgba(255,196,0,0.34)",
          }}
        >
          Começar
        </button>
      </div>
    </div>
  );
}
