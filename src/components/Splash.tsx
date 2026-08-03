"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Logo } from "./Logo";

/**
 * Splash v2 — redesign dos nós 18902:63949 → 18902:63901 → 18819:27760 →
 * 18819:27780 → 18819:27743.
 *
 * Sequência:
 *  1. LOGO    — chapa amarela #ffc400 com o logo GIGANTE (estourando a tela,
 *               como no nó) encolhendo até virar selo; a chapa desvanece
 *               revelando o túnel.
 *  2. PREP    — preto com o TÚNEL de materiais (cards de produto flutuando em
 *               direção à câmera, com depth of field: desfoca de leve o que
 *               está longe e, mais forte, o que vai chegando PERTO — a
 *               leitura da nuvem do rodapé do collection-site) + "Preparando
 *               sua experiência..." em text-appear por palavra.
 *  3. CHOICE  — "Vamos começar" + dois cards; "Primeiro acesso" carrega o
 *               MESMO efeito do card de produto selecionado da biblioteca
 *               (anel em degradê + glow respirando).
 *  4. WELCOME — "Bem-vindo(a)!"; na saída os materiais ACELERAM contra a
 *               tela (escala + blur estourando) e o texto vem junto — o
 *               mergulho para dentro da biblioteca.
 *
 * O túnel é DOM + GSAP ticker (sem WebGL): cada card tem um z virtual [0..1]
 * que vira escala + afastamento radial + blur. Barato, e o mesmo modelo
 * serve a saída (z disparado além do plano da tela).
 */

/* As MESMAS esferas de material do túnel do site (public/products de lá):
   é a "image 570" dos nós — bola de material em canvas quase cheio. */
const PRODUCT_IMGS = Array.from(
  { length: 10 },
  (_, i) => `/products/product-${i + 1}.webp`,
);

/* Slots radiais: ângulo (graus, 0 = direita), distância base (% do menor
   lado) e tamanho base (px @1440). Espalhados pelas bordas — o miolo é do
   texto, como nos nós (produtos de 91 a 212px encostados nos cantos). */
const SLOTS: { angle: number; dist: number; size: number; z0: number }[] = [
  { angle: 208, dist: 34, size: 190, z0: 0.62 },
  { angle: 24, dist: 38, size: 170, z0: 0.45 },
  { angle: 336, dist: 36, size: 205, z0: 0.75 },
  { angle: 155, dist: 40, size: 150, z0: 0.3 },
  { angle: 262, dist: 38, size: 165, z0: 0.55 },
  { angle: 82, dist: 40, size: 140, z0: 0.2 },
  { angle: 118, dist: 44, size: 120, z0: 0.68 },
  { angle: 296, dist: 46, size: 130, z0: 0.1 },
  { angle: 45, dist: 50, size: 110, z0: 0.85 },
  { angle: 190, dist: 52, size: 100, z0: 0.02 },
];

/* DOF: foco em z≈0.55; longe desfoca de leve, PERTO desfoca forte (é o
   "depth of field nos que vão ficando mais próximos" do pedido). */
const FOCUS_Z = 0.55;
const RESPAWN_Z = 1.18;

type CardSim = {
  el: HTMLElement;
  angle: number;
  dist: number;
  z: number;
  speed: number;
};

/* DOF discreto, na pegada do site (a nuvem lá usa NÉVOA, não gaussiana
   pesada): perto desfoca um pouco, longe quase nada — e a profundidade é
   contada principalmente pela opacidade (fog) e pela escala. */
function blurFor(z: number): number {
  if (z > FOCUS_Z) return (z - FOCUS_Z) * 9;
  return (FOCUS_Z - z) * 3;
}

function opacityFor(z: number): number {
  const fadeIn = Math.min(1, z / 0.1);
  const fadeOut = Math.min(1, Math.max(0, (RESPAWN_Z - z) / 0.14));
  /* Névoa: fundo mais apagado, aproximando acende — o fog do site. */
  const fog = 0.45 + 0.55 * Math.min(1, z / 0.8);
  return Math.min(fadeIn, fadeOut) * fog;
}

/** Título quebrado por palavra — máscara + miolo, pro text-appear subir de
 * dentro da linha com um resto de blur. */
function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`pb2-words ${className}`} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span key={`${word}-${index}`} className="pb2-w" aria-hidden>
          <span className="pb2-wi">{word}</span>
        </span>
      ))}
    </span>
  );
}

export function Splash({ onComplete }: { onComplete?: () => void } = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const simsRef = useRef<CardSim[]>([]);
  const tickerRef = useRef<((time: number, dt: number) => void) | null>(null);
  const leavingRef = useRef(false);
  const [stage, setStage] = useState<"intro" | "choice">("intro");
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  /* Um passo da simulação: z avança devagar em direção à câmera; passou do
     plano da tela, renasce no fundo. Escala, afastamento radial, blur e
     opacidade derivam todos do z. */
  const applySim = useCallback((sim: CardSim) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minSide = Math.min(vw, vh);
    const rad = (sim.angle * Math.PI) / 180;
    const spread = sim.dist + sim.z * 34; // afasta do centro conforme aproxima
    const x = Math.cos(rad) * ((spread / 100) * minSide) * (vw / minSide) * 0.72;
    const y = Math.sin(rad) * ((spread / 100) * minSide) * 0.8;
    const scale = 0.34 + sim.z * 1.18;
    gsap.set(sim.el, {
      x,
      y,
      scale,
      opacity: opacityFor(sim.z),
      filter: `blur(${blurFor(sim.z).toFixed(1)}px)`,
      zIndex: Math.round(sim.z * 40),
    });
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cardEls = gsap.utils.toArray<HTMLElement>(".pb2-card", root);
    simsRef.current = cardEls.map((el, i) => ({
      el,
      angle: SLOTS[i].angle,
      dist: SLOTS[i].dist,
      z: SLOTS[i].z0,
      speed: 0.028 + (i % 4) * 0.009, // deriva LENTA, cada um no seu passo
    }));

    const ctx = gsap.context(() => {
      // Estado inicial do campo: invisível (a chapa amarela cobre tudo).
      simsRef.current.forEach(applySim);
      gsap.set(".pb2-field", { opacity: 0 });
      /* Esconder as palavras AQUI, não no CSS: translateY(115%) na folha e
         yPercent no tween são pistas diferentes — o tween "rodava" e a
         palavra ficava presa embaixo, borrada. */
      gsap.set(".pb2-wi", { yPercent: 115, filter: "blur(8px)" });

      if (reduce) {
        // Sem movimento: pula direto pra escolha, campo estático visível.
        gsap.set(".pb2-logo-layer", { display: "none" });
        gsap.set(".pb2-field", { opacity: 1 });
        gsap.set(".pb2-stage-choice", { opacity: 1, pointerEvents: "auto" });
        gsap.set(".pb2-stage-choice .pb2-wi", { yPercent: 0, filter: "none" });
        gsap.set(".pb2-stage-choice .pb2-rise", { opacity: 1, y: 0 });
        setStage("choice");
        return;
      }

      const ticker = (_t: number, dtMs: number) => {
        const dt = Math.min(dtMs, 64) / 1000;
        for (const sim of simsRef.current) {
          if (leavingRef.current) continue; // a saída assume os tweens
          sim.z += sim.speed * dt;
          if (sim.z >= RESPAWN_Z) sim.z -= RESPAWN_Z;
          applySim(sim);
        }
      };
      tickerRef.current = ticker;
      gsap.ticker.add(ticker);

      /* Text-appear FASEADO (pedido do Victor): cada bloco entra na sua vez,
         palavra a palavra — nada de tela inteira de uma vez. */
      const showWords = (
        tl: gsap.core.Timeline,
        scope: string,
        at: gsap.Position,
      ) => {
        tl.to(
          `${scope} .pb2-wi`,
          {
            yPercent: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
          },
          at,
        );
      };

      // ——— Timeline mestre até a tela de escolha ———
      const tl = gsap.timeline();

      // 1. LOGO: selo pequeno (nó 18902:63901) que CRESCE até o traço preto
      //    engolir a tela (o nó 18902:63949 é o meio do caminho) — a origem
      //    do scale fica DENTRO do traço, então quando ele cobre tudo o
      //    corte pro fundo preto é invisível.
      tl.set(".pb2-logo", { scale: 1, transformOrigin: "50% 12%" })
        // pulso de presença do selo antes de crescer
        .to(".pb2-logo", {
          scale: 1.12,
          duration: 0.5,
          ease: "sine.inOut",
          delay: 0.3,
        })
        .to(".pb2-logo", { scale: 1, duration: 0.4, ease: "sine.inOut" })
        // o mergulho pra DENTRO do logo
        .to(".pb2-logo", { scale: 60, duration: 1.25, ease: "power3.in" })
        .addLabel("reveal", ">-0.02")
        // a tela já está toda preta (o traço) — a chapa some sem ninguém ver
        .set(".pb2-logo-layer", { display: "none" }, "reveal")
        .to(
          ".pb2-field",
          { opacity: 1, duration: 0.9, ease: "power2.out" },
          "reveal",
        );

      // 3. PREP: "Preparando sua experiência..." aparece e segura.
      showWords(tl, ".pb2-stage-prep", "reveal+=0.35");
      tl.to(
        ".pb2-stage-prep .pb2-wi",
        {
          yPercent: -115,
          filter: "blur(6px)",
          duration: 0.55,
          stagger: 0.045,
          ease: "power2.in",
        },
        "+=1.5",
      );

      // 4. CHOICE em três fases: título → subtítulo → cards.
      showWords(tl, ".pb2-stage-choice .pb2-title", "+=0.1");
      showWords(tl, ".pb2-stage-choice .pb2-subtitle", "-=0.35");
      tl.to(
        ".pb2-stage-choice .pb2-rise",
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.16, ease: "power3.out" },
        "-=0.2",
      ).call(() => {
        setStage("choice");
        gsap.set(".pb2-stage-choice", { pointerEvents: "auto" });
      });

      /* Mesmo truque do splash v1: em dev o timeline fica acessível pra
         depuração/preview headless (rAF pausado não anda timeline). */
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __pb2Tl?: gsap.core.Timeline }).__pb2Tl = tl;
      }
    }, root);

    return () => {
      if (tickerRef.current) gsap.ticker.remove(tickerRef.current);
      ctx.revert();
    };
  }, [applySim]);

  /* Clique em qualquer card: escolha sai, Bem-vindo entra, e a SAÍDA — os
     materiais aceleram CONTRA a tela e tudo mergulha pra dentro da home. */
  const handleChoose = useCallback(() => {
    const root = rootRef.current;
    if (!root || leavingRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      doneRef.current?.();
      return;
    }

    gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => doneRef.current?.() });
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __pb2ChooseTl?: gsap.core.Timeline }).__pb2ChooseTl = tl;
      }

      /* A escolha é o ÚLTIMO step (Victor, 03/08): sem Bem-vindo — o clique
         já dispara o mergulho pra biblioteca, que abre com o Entrar travado. */
      gsap.set(".pb2-stage-choice", { pointerEvents: "none" });
      tl.to(".pb2-stage-choice .pb2-wi", {
        yPercent: -115,
        filter: "blur(6px)",
        duration: 0.45,
        stagger: 0.03,
        ease: "power2.in",
      })
        .to(
          ".pb2-stage-choice .pb2-rise",
          { opacity: 0, y: 14, duration: 0.4, stagger: 0.05, ease: "power2.in" },
          "<",
        )
        .addLabel("dive", "-=0.05");

      // Materiais vindo NA TELA: além do plano, blur e escala estourando.
      leavingRef.current = true;
      simsRef.current.forEach((sim, i) => {
        const rad = (sim.angle * Math.PI) / 180;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const minSide = Math.min(vw, vh);
        const boost = sim.dist + 150;
        tl.to(
          sim.el,
          {
            x:
              Math.cos(rad) * ((boost / 100) * minSide) * (vw / minSide) * 0.72,
            y: Math.sin(rad) * ((boost / 100) * minSide) * 0.8,
            scale: 3.6 + (i % 3) * 0.8,
            opacity: 0,
            filter: "blur(26px)",
            duration: 0.85,
            ease: "power3.in",
          },
          `dive+=${(i % 5) * 0.05}`,
        );
      });

      // O fundo abre no meio do mergulho — a biblioteca aparece por baixo.
      tl.to(
        ".pb2-root-bg",
        { opacity: 0, duration: 0.5, ease: "power2.inOut" },
        "dive+=0.35",
      );
    }, root);
  }, []);

  return (
    <div ref={rootRef} className="pb2-root fixed inset-0 overflow-hidden">
      <div className="pb2-root-bg absolute inset-0 bg-black" />

      {/* Túnel de materiais (DOM, z virtual → escala/afastamento/DOF). */}
      <div className="pb2-field absolute inset-0" aria-hidden>
        {SLOTS.map((slot, i) => (
          <div
            key={i}
            className="pb2-card absolute left-1/2 top-1/2"
            style={{
              width: `${slot.size}px`,
              height: `${slot.size}px`,
              marginLeft: `${-slot.size / 2}px`,
              marginTop: `${-slot.size / 2}px`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PRODUCT_IMGS[i % PRODUCT_IMGS.length]} alt="" />
          </div>
        ))}
      </div>

      {/* PREP — nó 18819:27760 */}
      <div className="pb2-stage pb2-stage-prep">
        <h1 className="pb2-title">
          <Words text="Preparando sua experiência..." />
        </h1>
      </div>

      {/* CHOICE — nó 18819:27780 */}
      <div
        className="pb2-stage pb2-stage-choice"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex w-[392px] max-w-[calc(100vw-48px)] flex-col gap-[56px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="pb2-title">
              <Words text="Vamos começar" />
            </h1>
            <p className="pb2-subtitle">
              <Words text="Selecione como deseja entrar:" />
            </p>
          </div>
          <div className="flex flex-col gap-[12px]">
            {/* Primeiro acesso — o card com o efeito do produto SELECIONADO
                da biblioteca: anel em degradê + glow que respira (o nó traz
                o stroke em GRADIENT_LINEAR). */}
            <button
              type="button"
              onClick={handleChoose}
              disabled={stage !== "choice"}
              className="pb2-option pb2-option-first pb2-rise"
            >
              <span className="pb2-option-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3.3v9.4M3.3 8h9.4"
                    stroke="#ffc400"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="pb2-option-texts">
                <span className="pb2-option-title">Primeiro acesso</span>
                <span className="pb2-option-sub">Criar uma conta</span>
              </span>
            </button>
            <button
              type="button"
              onClick={handleChoose}
              disabled={stage !== "choice"}
              className="pb2-option pb2-rise"
            >
              <span className="pb2-option-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3.5 10.5 8 6 12.5"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="pb2-option-texts">
                <span className="pb2-option-title">Já tenho conta</span>
                <span className="pb2-option-sub">Entrar</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* LOGO — nós 18902:63949 (gigante) → 18902:63901 (selo) */}
      <div className="pb2-logo-layer absolute inset-0 z-[80] flex items-center justify-center bg-[#ffc400]">
        <Logo className="pb2-logo h-[80px] w-[69px] text-black" />
      </div>
    </div>
  );
}
