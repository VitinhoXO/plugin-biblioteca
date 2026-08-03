"use client";

import { Logo } from "./Logo";

/**
 * O gate de login TRAVADO que recebe quem sai do onboarding: a biblioteca
 * só existe logado (decisão de 03/08), então o modal de Entrar abre por
 * cima da home borrada SEM o X e sem fechar no clique-fora — a única saída
 * é entrar (ou criar a conta).
 *
 * Visual = o hub do AuthModal real da biblioteca (nó 18738:25451), na
 * versão enxuta do protótipo: logo, título, Google, divisor e o caminho
 * do e-mail.
 */
export function LockedLogin() {
  return (
    <div className="pb-gate fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="pb-gate-scrim absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.56)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      <div
        role="dialog"
        aria-modal
        aria-label="Entrar no Collection"
        className="pb-gate-content relative flex w-[400px] max-w-[calc(100vw-48px)] flex-col gap-[28px] rounded-[16px] p-[28px]"
        style={{
          background: "rgba(31,31,31,0.72)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
        }}
      >
        <div className="flex flex-col gap-[20px]">
          <Logo className="h-[22px] w-[19px] text-[#ffc400]" />
          <div className="flex flex-col gap-[6px]">
            <h2 className="m-0 text-[20px] font-semibold leading-[28px] text-white">
              Entrar no Collection
            </h2>
            <p className="m-0 text-[14px] leading-[20px] text-[#d4d4d4]">
              Use uma das opções abaixo para acessar ou criar uma nova conta
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <button
            type="button"
            className="flex h-[44px] items-center justify-center gap-[10px] rounded-[12px] text-[14px] font-medium text-white"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-[12px]" aria-hidden>
            <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.12)" }} />
            <span className="text-[12px] text-[#a3a3a3]">ou</span>
            <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.12)" }} />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-[14px] leading-[20px] text-[#e5e5e5]">
              E-mail
            </label>
            <input
              type="email"
              placeholder="email@collection.com.br"
              className="h-[44px] rounded-[12px] bg-[#171717] px-[16px] text-[14px] text-[#f5f5f5] outline-none placeholder:text-[#737373]"
              style={{ border: "1px solid #404040" }}
            />
          </div>

          <button
            type="button"
            className="flex h-[44px] items-center justify-center rounded-[12px] text-[14px] font-semibold text-black"
            style={{ background: "#ffc400" }}
          >
            Continuar com E-mail
          </button>
        </div>
        {/* SEM o X de propósito: o gate não fecha — a biblioteca é logada. */}
      </div>
    </div>
  );
}
