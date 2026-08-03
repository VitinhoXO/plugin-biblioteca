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

/* O FUNIL do site, de verdade: perspectiva de câmera com ponto de fuga no
   centro. Cada material vive no mundo 3D (wx, wy fixos num anel em volta do
   eixo; wz vindo do FUNDO na direção da tela). A projeção faz o resto:
   longe = pequeno, apagado e perto do centro; aproximando = cresce, acende
   e ABRE pras bordas até passar pela câmera. Sem blur — profundidade é
   névoa + escala, como no site. */
const NEAR = 2.2; // além daqui o item passou pela câmera
const FAR = 26;
const FOG_NEAR = 8; // aceso total
const FOG_FAR = 24; // nasce apagado
const PROJ = 10; // escala 1 quando wz = PROJ

const GOLDEN = 137.508;

const ITEMS = Array.from({ length: 36 }, (_, i) => {
  const angle = ((i * GOLDEN) % 360) * (Math.PI / 180);
  const radius = 2.8 + (((i * 53) % 100) / 100) * 6.0; // anel 2.8–8.8: centro livre
  return {
    wx: Math.cos(angle) * radius,
    wy: Math.sin(angle) * radius, // achatamento fica na projeção
    wz0: NEAR + (((i * 29) % 100) / 100) * (FAR - NEAR),
    size: 96 + (((i * 17) % 100) / 100) * 84, // 96–180 @ escala 1
    speed: 1.15 + (((i * 11) % 100) / 100) * 0.85, // ~12–20s do fundo à tela
  };
});

type ItemSim = {
  el: HTMLElement;
  wx: number;
  wy: number;
  wz: number;
  speed: number;
};

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
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

  /* Projeção de câmera: k = PROJ/wz manda em posição, escala e ordem.
     A névoa acende conforme aproxima; passando da câmera, desvanece. */
  const applySim = useCallback((sim: ItemSim) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = PROJ / sim.wz;
    const unit = Math.min(vw, vh) / 14; // 1 unidade de mundo em px
    /* FURO central: o texto mora no meio, então nenhum material chega a
       menos de (holeX, holeY) do centro — o deslocamento é ao longo do
       próprio ângulo, o anel continua circular e o mergulho abre pelas
       bordas em vez de atravessar o botão. */
    const holeX = Math.min(vw * 0.26, 330);
    const holeY = Math.min(vh * 0.3, 260);
    const ang = Math.atan2(sim.wy, sim.wx);
    const radial = Math.hypot(sim.wx, sim.wy) * k * unit;
    const x = Math.cos(ang) * (holeX + radial);
    const y = Math.sin(ang) * (holeY + radial * 0.78);
    const fog = smooth((FOG_FAR - sim.wz) / (FOG_FAR - FOG_NEAR));
    const nearFade = sim.wz < 3.4 ? smooth((sim.wz - NEAR) / (3.4 - NEAR)) : 1;
    gsap.set(sim.el, {
      x,
      y,
      scale: k,
      opacity: fog * nearFade,
      zIndex: Math.round((FAR - sim.wz) * 3),
    });
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cardEls = gsap.utils.toArray<HTMLElement>(".pb2-card", root);
    simsRef.current = cardEls.map((el, i) => ({
      el,
      wx: ITEMS[i].wx,
      wy: ITEMS[i].wy,
      wz: ITEMS[i].wz0,
      speed: ITEMS[i].speed,
    }));

    const ctx = gsap.context(() => {
      simsRef.current.forEach(applySim);
      gsap.set(".pb2-field", { opacity: 0 });
      /* Esconder as palavras AQUI, não no CSS: translateY(%) na folha e
         yPercent no tween são pistas diferentes e a palavra trava. */
      gsap.set(".pb2-wi", { yPercent: 115, filter: "blur(8px)" });
      /* Palco INTEIRO some quando não é a vez dele (autoAlpha): era o
         "borrão no fundo" — as palavras das outras etapas, borradas e
         empilhadas atrás do texto ativo (print do Victor, 03/08). */
      gsap.set(".pb2-stage", { autoAlpha: 0 });

      if (reduce) {
        gsap.set(".pb2-logo-layer", { display: "none" });
        gsap.set(".pb2-field", { opacity: 1 });
        gsap.set(".pb2-stage-choice", {
          autoAlpha: 1,
          pointerEvents: "auto",
        });
        gsap.set(".pb2-stage-choice .pb2-wi", { yPercent: 0, filter: "none" });
        gsap.set(".pb2-stage-choice .pb2-rise", { opacity: 1, y: 0 });
        setStage("choice");
        return;
      }

      const ticker = (_t: number, dtMs: number) => {
        const dt = Math.min(dtMs, 64) / 1000;
        for (const sim of simsRef.current) {
          if (leavingRef.current) continue;
          sim.wz -= sim.speed * dt; // vindo NA DIREÇÃO da tela
          if (sim.wz < NEAR) sim.wz += FAR - NEAR; // renasce no fundo do funil
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
      /* Text-out = ZOOM IN seco: o bloco vem contra a tela e apaga, como os
         materiais no mergulho. Sem blur — virava borrão (Victor, 03/08).
         Zoom no BLOCO, não nas palavras — a máscara do .pb2-w cortaria. */
      const wordsOut = (
        tl: gsap.core.Timeline,
        scope: string,
        at: gsap.Position,
      ) => {
        tl.to(
          scope,
          {
            scale: 1.75,
            opacity: 0,
            transformOrigin: "50% 50%",
            duration: 0.45,
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

      /* Cada palco ACENDE na sua vez e APAGA por inteiro na troca
         (autoAlpha): o fantasma borrado das outras etapas morre, e a
         entrada/saída conversa com a névoa do fundo. */

      // 2. BEM-VINDO (18819:27743) — primeiro (ordem do Victor, 03/08):
      //    título, depois o subtítulo.
      tl.to(
        ".pb2-stage-welcome",
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        "reveal+=0.3",
      );
      wordsIn(tl, ".pb2-stage-welcome .pb2-title", "reveal+=0.35");
      tl.to(
        ".pb2-stage-welcome .pb2-sub",
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3",
      );
      wordsOut(tl, ".pb2-stage-welcome .pb2-title", "+=1.7");
      tl.to(
        ".pb2-stage-welcome .pb2-sub",
        {
          opacity: 0,
          scale: 1.5,
          duration: 0.4,
          ease: "power2.in",
        },
        "<0.06",
      ).to(
        ".pb2-stage-welcome",
        { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
        ">-0.15",
      );

      // 3. PREPARANDO (18819:27760)
      tl.to(
        ".pb2-stage-prep",
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        "+=0.05",
      );
      wordsIn(tl, ".pb2-stage-prep", "<0.05");
      wordsOut(tl, ".pb2-stage-prep .pb2-title", "+=1.5");
      tl.to(
        ".pb2-stage-prep",
        { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
        ">-0.15",
      );

      // 4. TUDO PRONTO (18819:27780) — o ÚLTIMO step.
      tl.to(
        ".pb2-stage-choice",
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        "+=0.05",
      );
      wordsIn(tl, ".pb2-stage-choice .pb2-title", "<0.05");
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
      /* O texto sai em ZOOM IN seco — mergulha junto com os materiais. */
      tl.to(".pb2-stage-choice", {
        scale: 1.7,
        autoAlpha: 0,
        transformOrigin: "50% 50%",
        duration: 0.45,
        ease: "power2.in",
      }).addLabel("dive", "-=0.32");

      /* MERGULHO: acelera o wz de cada material até passar pela câmera — a
         mesma projeção do idle faz o resto (cresce, abre e some na borda). */
      leavingRef.current = true;
      simsRef.current.forEach((sim, i) => {
        tl.to(
          sim,
          {
            wz: NEAR * 0.55,
            duration: 0.8,
            ease: "power2.in",
            onUpdate: () => applySim(sim),
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
        <div className="flex w-[430px] max-w-[calc(100vw-48px)] flex-col items-center gap-[16px] text-center">
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
        <div className="flex w-[450px] max-w-[calc(100vw-48px)] flex-col items-center gap-[56px] text-center">
          <div className="flex w-full flex-col items-center gap-[8px]">
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
            className="pb2-start pb2-rise self-stretch"
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
