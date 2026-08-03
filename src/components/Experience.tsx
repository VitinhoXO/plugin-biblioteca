"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Splash } from "./Splash";
import { Home } from "./home/Home";

/**
 * Splash v2 → live home.
 *
 * O splash novo (logo amarelo → túnel → escolha → Bem-vindo) já termina no
 * MERGULHO — os materiais aceleram contra a tela e o fundo do splash abre.
 * Aqui só resta a home entrar por baixo enquanto o overlay desvanece; o
 * WelcomeGate antigo ("Sua biblioteca está pronta") morreu com o redesign:
 * o Bem-vindo agora vive dentro do próprio splash.
 */
export function Experience() {
  const [reveal, setReveal] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!reveal) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setSplashGone(true);
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setSplashGone(true) });
      tl.from(".pb-home aside", { xPercent: -130, opacity: 0, duration: 0.8, ease: "power3.out" }, 0)
        .from(".pb-home main > section", { y: 44, opacity: 0, duration: 0.75, stagger: 0.09, ease: "power3.out" }, 0.1)
        .to(".pb-splash-overlay", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 0.05);
    }, rootRef);
    return () => ctx.revert();
  }, [reveal]);

  return (
    <div ref={rootRef} className="relative bg-black">
      <div className="pb-home-stage">
        <Home />
      </div>
      {!splashGone && (
        <div className="pb-splash-overlay fixed inset-0 z-50">
          <Splash onComplete={() => setReveal(true)} />
        </div>
      )}
    </div>
  );
}
