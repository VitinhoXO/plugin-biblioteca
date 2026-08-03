"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Splash } from "./Splash";
import { Home } from "./home/Home";
import { LockedLogin } from "./LockedLogin";

/**
 * Onboarding → biblioteca com o Entrar TRAVADO.
 *
 * SÓ NO PRIMEIRO ACESSO — o mesmo contrato da biblioteca real
 * (firstAccessStore/sketchupInit): dentro do SketchUp o app registra
 * `window.getFirstAccess` e pergunta `window.sketchup.getFirstAccess()`;
 * o plugin responde `true` apenas na primeira abertura. Sem resposta =
 * sem onboarding (fail closed). No navegador (demo), o papel do plugin é
 * feito por localStorage: primeira visita mostra, depois nunca mais —
 * `?onboarding=1` força o replay pra apresentação.
 *
 * O onboarding termina no mergulho (a escolha É o último step). A home
 * entra por baixo já BORRADA, com o gate de login por cima — sem X e sem
 * fechar: a biblioteca só existe logado (decisão de 03/08).
 */

const ONBOARDED_KEY = "pb:onboarded";

type SketchupBridge = {
  sketchup?: { getFirstAccess?: () => void };
  getFirstAccess?: (isFirst: boolean) => void;
};

export function Experience() {
  /* null = resolvendo (nada renderiza por cima; o fundo é preto) */
  const [firstAccess, setFirstAccess] = useState<boolean | null>(null);
  const [reveal, setReveal] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "1") {
      setFirstAccess(true);
      return;
    }

    const bridge = window as unknown as SketchupBridge;
    if (bridge.sketchup) {
      /* Dentro do SketchUp: pergunta ao plugin, como a biblioteca real. */
      bridge.getFirstAccess = (isFirst: boolean) => setFirstAccess(!!isFirst);
      try {
        bridge.sketchup.getFirstAccess?.();
      } catch {
        setFirstAccess(false);
      }
      /* Plugin antigo / sem resposta: fail closed, direto pra biblioteca. */
      const timeout = window.setTimeout(() => {
        setFirstAccess((v) => (v === null ? false : v));
      }, 1500);
      return () => window.clearTimeout(timeout);
    }

    /* Navegador (demo): localStorage faz o papel da flag do plugin. */
    setFirstAccess(window.localStorage.getItem(ONBOARDED_KEY) !== "1");
  }, []);

  /* Já onboardado: pula direto pro estado final (home borrada + gate). */
  useEffect(() => {
    if (firstAccess === false) {
      setReveal(true);
      setSplashGone(true);
    }
  }, [firstAccess]);

  const handleSplashComplete = () => {
    try {
      window.localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      /* storage indisponível (webview restrito): só não persiste */
    }
    setReveal(true);
  };

  useLayoutEffect(() => {
    if (!reveal || splashGone) return;
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
  }, [reveal, splashGone]);

  if (firstAccess === null) {
    return <div className="fixed inset-0 bg-black" />;
  }

  return (
    <div ref={rootRef} className="relative bg-black">
      <div className={`pb-home-stage${reveal ? " pb-home-blurred" : ""}`}>
        <Home />
      </div>
      {reveal && <LockedLogin />}
      {firstAccess && !splashGone && (
        <div className="pb-splash-overlay fixed inset-0 z-50">
          <Splash onComplete={handleSplashComplete} />
        </div>
      )}
    </div>
  );
}
