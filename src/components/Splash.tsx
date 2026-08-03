"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Logo } from "./Logo";

/**
 * Onboarding de primeiro acesso — nós 18902:63949/63901 (logo) →
 * 18819:27760 (Preparando) → 18819:27743 (Bem-vindo) → 18819:27780
 * (Vamos começar, o ÚLTIMO step) → mergulho → biblioteca com o Entrar
 * TRAVADO (a biblioteca só existe logado).
 *
 * O campo de materiais é a FITA do collection-site (MaterialsCloud):
 * esferas cruas derivando de um lado ao outro por um vale raso na metade
 * de baixo, com NÉVOA por profundidade e um resto de blur só no que está
 * quase na tela — o centro fica limpo pro texto, sem borrão.
 */

const PRODUCT_IMGS = Array.from(
  { length: 10 },
  (_, i) => `/products/product-${i + 1}.webp`,
);

/* Itens da fita: fase inicial u, profundidade dz [0..1], desvio dy (px @864)
   e tamanho base. Os três últimos são os "altos": longe, pequenos, no topo —
   o resto vive no vale de baixo, como no site. */
const ITEMS: { u0: number; dz: number; dy: number; size: number; top?: boolean }[] = [
  { u0: 0.05, dz: 0.85, dy: 40, size: 210 },
  { u0: 0.18, dz: 0.35, dy: -20, size: 150 },
  { u0: 0.3, dz: 0.65, dy: 20, size: 185 },
  { u0: 0.42, dz: 0.2, dy: -35, size: 125 },
  { u0: 0.55, dz: 0.9, dy: 55, size: 220 },
  { u0: 0.66, dz: 0.45, dy: 0, size: 160 },
  { u0: 0.78, dz: 0.7, dy: 30, size: 190 },
  { u0: 0.9, dz: 0.3, dy: -15, size: 140 },
  { u0: 0.98, dz: 0.55, dy: 12, size: 170 },
  { u0: 0.12, dz: 0.12, dy: 0, size: 95, top: true },
  { u0: 0.5, dz: 0.2, dy: 24, size: 110, top: true },
  { u0: 0.82, dz: 0.08, dy: -12, size: 85, top: true },
];

type ItemSim = {
  el: HTMLElement;
  u: number;
  dz: number;
  dy: number;
  speed: number;
  top: boolean;
};

/* Fade nas bordas da travessia, como o edgeFade do site. */
function edgeFade(u: number): number {
  const inF = Math.min(1, Math.max(0, u / 0.16));
  const outF = Math.min(1, Math.max(0, (1 - u) / 0.16));
  const t = Math.min(inF, outF);
  return t * t * (3 - 2 * t); // smoothstep
}

/** Título quebrado por palavra — máscara + miolo, o text-appear sobe de
 * dentro da linha com um resto de blur. Estado escondido vem do GSAP. */
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
  const simsRef = useRef<ItemSim[]>([]);
  const tickerRef = useRef<((time: number, dt: number) => void) | null>(null);
  const leavingRef = useRef(false);
  const [stage, setStage] = useState<"intro" | "choice">("intro");
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  /* Um passo da fita: u atravessa a tela; posição vem do vale (ou da faixa
     alta), escala/névoa/blur vêm da profundidade dz. */
  const applySim = useCallback((sim: ItemSim) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = (sim.u - 0.5) * (vw + 420);
    const valley = sim.top
      ? -vh * (0.3 + 0.05 * Math.sin(Math.PI * sim.u))
      : vh * (0.16 + 0.15 * Math.sin(Math.PI * sim.u)) + sim.dz * vh * 0.1;
    const y = valley + sim.dy;
    const scale = 0.38 + sim.dz * 1.12;
    const fog = 0.32 + 0.68 * sim.dz;
    const blur = sim.dz > 0.78 ? (sim.dz - 0.78) * 26 : 0;
    gsap.set(sim.el, {
      x,
      y,
      scale,
      opacity: edgeFade(sim.u) * fog,
      filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : "none",
      zIndex: Math.round(sim.dz * 40),
    });
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cardEls = gsap.utils.toArray<HTMLElement>(".pb2-card", root);
    simsRef.current = cardEls.map((el, i) => ({
      el,
      u: ITEMS[i].u0,
      dz: ITEMS[i].dz,
      dy: ITEMS[i].dy,
      top: !!ITEMS[i].top,
      speed: 0.011 + (i % 5) * 0.0035, // travessia de ~45s a ~90s, como o site
    }));

    const ctx = gsap.context(() => {
      simsRef.current.forEach(applySim);
      gsap.set(".pb2-field", { opacity: 0 });
      /* Esconder as palavras AQUI, não no CSS: translateY(%) na folha e
         yPercent no tween são pistas diferentes e a palavra trava. */
      gsap.set(".pb2-wi", { yPercent: 115, filter: "blur(8px)" });

      if (reduce) {
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
          if (leavingRef.current) continue;
          sim.u += sim.speed * dt;
          if (sim.u > 1.02) {
            sim.u -= 1.04;
            sim.dz = 0.1 + Math.abs(Math.sin(sim.u * 97)) * 0.8;
          }
          applySim(sim);
        }
      };
      tickerRef.current = ticker;
      gsap.ticker.add(ticker);

      /* Text-appear FASEADO: cada bloco na sua vez, palavra a palavra. */
      const wordsIn = (
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
      const wordsOut = (
        tl: gsap.core.Timeline,
        scope: string,
        at: gsap.Position,
      ) => {
        tl.to(
          `${scope} .pb2-wi`,
          {
            yPercent: -115,
            filter: "blur(6px)",
            duration: 0.5,
            stagger: 0.04,
            ease: "power2.in",
          },
          at,
        );
      };

      const tl = gsap.timeline();

      // 1. LOGO: selo pequeno que CRESCE até o traço preto engolir a tela.
      tl.set(".pb2-logo", { scale: 1, transformOrigin: "50% 12%" })
        .to(".pb2-logo", {
          scale: 1.12,
          duration: 0.5,
          ease: "sine.inOut",
          delay: 0.3,
        })
        .to(".pb2-logo", { scale: 1, duration: 0.4, ease: "sine.inOut" })
        .to(".pb2-logo", { scale: 60, duration: 1.25, ease: "power3.in" })
        .addLabel("reveal", ">-0.02")
        .set(".pb2-logo-layer", { display: "none" }, "reveal")
        .to(
          ".pb2-field",
          { opacity: 1, duration: 0.9, ease: "power2.out" },
          "reveal",
        );

      // 2. PREPARANDO (18819:27760)
      wordsIn(tl, ".pb2-stage-prep", "reveal+=0.35");
      wordsOut(tl, ".pb2-stage-prep", "+=1.5");

      // 3. BEM-VINDO (18819:27743): título, depois o subtítulo.
      wordsIn(tl, ".pb2-stage-welcome .pb2-title", "+=0.1");
      tl.to(
        ".pb2-stage-welcome .pb2-sub",
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3",
      );
      wordsOut(tl, ".pb2-stage-welcome .pb2-title", "+=1.7");
      tl.to(
        ".pb2-stage-welcome .pb2-sub",
        { opacity: 0, y: -12, duration: 0.4, ease: "power2.in" },
        "<",
      );

      // 4. VAMOS COMEÇAR (18819:27780) — o ÚLTIMO step: título → subtítulo
      //    → cards, e espera o clique.
      wordsIn(tl, ".pb2-stage-choice .pb2-title", "+=0.1");
      wordsIn(tl, ".pb2-stage-choice .pb2-subtitle", "-=0.35");
      tl.to(
        ".pb2-stage-choice .pb2-rise",
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.16, ease: "power3.out" },
        "-=0.2",
      ).call(() => {
        setStage("choice");
        gsap.set(".pb2-stage-choice", { pointerEvents: "auto" });
      });

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __pb2Tl?: gsap.core.Timeline }).__pb2Tl = tl;
      }
    }, root);

    return () => {
      if (tickerRef.current) gsap.ticker.remove(tickerRef.current);
      ctx.revert();
    };
  }, [applySim]);

  /* Clique em qualquer card = MERGULHO: os materiais aceleram contra a
     tela e a biblioteca abre por baixo com o Entrar travado. */
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

      leavingRef.current = true;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      simsRef.current.forEach((sim, i) => {
        const x = (sim.u - 0.5) * (vw + 420);
        const y = sim.top
          ? -vh * 0.55
          : vh * (0.2 + 0.15 * Math.sin(Math.PI * sim.u)) + sim.dy;
        tl.to(
          sim.el,
          {
            x: x * 2.1,
            y: y * 2.2,
            scale: 3.4 + sim.dz * 1.6,
            opacity: 0,
            filter: "blur(24px)",
            duration: 0.85,
            ease: "power3.in",
          },
          `dive+=${(i % 5) * 0.045}`,
        );
      });

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

      {/* Fita de materiais (modelo do MaterialsCloud do site). */}
      <div className="pb2-field absolute inset-0" aria-hidden>
        {ITEMS.map((item, i) => (
          <div
            key={i}
            className="pb2-card absolute left-1/2 top-1/2"
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
              marginLeft: `${-item.size / 2}px`,
              marginTop: `${-item.size / 2}px`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PRODUCT_IMGS[i % PRODUCT_IMGS.length]} alt="" />
          </div>
        ))}
      </div>

      {/* PREPARANDO — nó 18819:27760 */}
      <div className="pb2-stage pb2-stage-prep">
        <h1 className="pb2-title">
          <Words text="Preparando sua experiência..." />
        </h1>
      </div>

      {/* BEM-VINDO — nó 18819:27743 */}
      <div className="pb2-stage pb2-stage-welcome">
        <div className="flex w-[430px] max-w-[calc(100vw-48px)] flex-col gap-[16px]">
          <h1 className="pb2-title">
            <Words text="Bem-vindo(a)!" />
          </h1>
          <p className="pb2-subtitle pb2-sub">
            A partir de agora, sua vida profissional nunca mais será a mesma.
          </p>
        </div>
      </div>

      {/* TUDO PRONTO — nó 18819:27780 (o último step: sem escolha de
          cadastrar/logar; um único Começar que mergulha pro Entrar travado) */}
      <div
        className="pb2-stage pb2-stage-choice"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex w-[450px] max-w-[calc(100vw-48px)] flex-col gap-[56px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="pb2-title">
              <Words text="Tudo pronto!" />
            </h1>
            <p className="pb2-subtitle">
              <Words text="Busque em mais de 22.000 produtos prontos para especificar" />
            </p>
          </div>
          <button
            type="button"
            onClick={handleChoose}
            disabled={stage !== "choice"}
            className="pb2-start pb2-rise"
          >
            <span className="pb2-start-glow" aria-hidden />
            <span>Começar</span>
          </button>
        </div>
      </div>

      {/* LOGO — nós 18902:63949 (gigante) → 18902:63901 (selo) */}
      <div className="pb2-logo-layer absolute inset-0 z-[80] flex items-center justify-center bg-[#ffc400]">
        <Logo className="pb2-logo h-[80px] w-[69px] text-black" />
      </div>
    </div>
  );
}
