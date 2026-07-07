"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Splash } from "./Splash";
import { Home } from "./home/Home";

/**
 * Splash → Home as one continuous piece. The splash resolves to the docked
 * search bar; because the home header field sits at the exact same spot
 * (880px, top of screen), fading the splash out reveals the header in place —
 * the bar *becomes* the header. Meanwhile the sidebar slides in from the left
 * and the sections rise in with a stagger, so the home grows out of the splash.
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
        .to(".pb-splash-overlay", { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 0.15);
    }, rootRef);
    return () => ctx.revert();
  }, [reveal]);

  return (
    <div ref={rootRef} className="relative bg-black">
      <Home />
      {!splashGone && (
        <div className="pb-splash-overlay fixed inset-0 z-50">
          <Splash onComplete={() => setReveal(true)} />
        </div>
      )}
    </div>
  );
}
