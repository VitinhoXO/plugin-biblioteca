"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Splash } from "./Splash";
import { Home } from "./home/Home";
import { WelcomeGate } from "./WelcomeGate";

/**
 * Splash → blurred home + welcome gate → live home.
 *
 * The splash resolves to the docked search bar (which is the home header). As
 * it fades, the home reveals behind a full-screen blur with a short message and
 * a COMEÇAR button. Clicking COMEÇAR clears the blur into the usable home.
 */
export function Experience() {
  const [reveal, setReveal] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateClosing, setGateClosing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Splash finished → reveal the home (behind the gate blur) and raise the gate.
  // The gate itself fades in via CSS; here we only slide the home in and fade
  // the splash out.
  useLayoutEffect(() => {
    if (!reveal) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setGateOpen(true);
    if (reduce) {
      setSplashGone(true);
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setSplashGone(true) });
      tl.from(".pb-home aside", { xPercent: -130, opacity: 0, duration: 0.8, ease: "power3.out" }, 0)
        .from(".pb-home main > section", { y: 44, opacity: 0, duration: 0.75, stagger: 0.09, ease: "power3.out" }, 0.1)
        .to(".pb-splash-overlay", { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 0.1);
    }, rootRef);
    return () => ctx.revert();
  }, [reveal]);

  // COMEÇAR → CSS fades the blur out; unmount once the transition is done.
  const handleStart = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGateOpen(false);
      return;
    }
    setGateClosing(true);
    window.setTimeout(() => setGateOpen(false), 640);
  }, []);

  return (
    <div ref={rootRef} className="relative bg-black">
      <Home />
      {gateOpen && <WelcomeGate onStart={handleStart} closing={gateClosing} />}
      {!splashGone && (
        <div className="pb-splash-overlay fixed inset-0 z-50">
          <Splash onComplete={() => setReveal(true)} />
        </div>
      )}
    </div>
  );
}
