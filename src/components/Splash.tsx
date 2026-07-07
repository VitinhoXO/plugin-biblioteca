"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

/**
 * Six material spheres. Each has three keyframes — one per stage of the
 * sequence — as [centerX %, centerY %, diameter vw] relative to the
 * 1440×864 Figma frame. Across the stages they drift outward and grow,
 * mirroring Figma nodes 17520:48186 → 17637:48523 → 17637:48575.
 */
const SPHERES: {
  img: string;
  stages: [number, number, number][]; // [left%, top%, widthVw]
}[] = [
  { img: "/spheres/s1.png", stages: [[24.51, 84.38, 12.5], [18.34, 93.38, 15.59], [16.43, 99.27, 17.72]] },
  { img: "/spheres/s2.png", stages: [[81.01, 17.19, 11.46], [88.8, 9.58, 14.29], [96.52, 4.01, 16.25]] },
  { img: "/spheres/s3.png", stages: [[91.46, 68.87, 13.19], [101.83, 74.04, 16.46], [111.34, 77.28, 18.71]] },
  { img: "/spheres/s4.png", stages: [[26.7, 9.66, 6.32], [21.07, 0.2, 7.88], [19.53, -6.65, 8.96]] },
  { img: "/spheres/s5.png", stages: [[5.69, 40.57, 14.72], [-5.13, 38.74, 18.36], [-10.26, 37.16, 20.87]] },
  { img: "/spheres/s6.png", stages: [[73.09, 83.16, 11.04], [78.93, 91.86, 13.77], [85.3, 97.55, 15.66]] },
];

// Vertical anchor (% of 864) + width (px) for the field in each state.
const FIELD = {
  hero: { top: 62.6, w: 680 },
  docked: { top: 1.39, w: 880 },
};

export function Splash({ onComplete }: { onComplete?: () => void } = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ctx: gsap.Context | null = null;

    const build = () => {
      ctx?.revert();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sphereEls = gsap.utils.toArray<HTMLElement>(".pb-sphere", root);

      // Precompute each sphere's transform target per stage. Position is driven
      // entirely by GPU transforms (x/y/scale) — never layout props — so the
      // motion stays smooth. Scale pivots on the element centre, which keeps the
      // sphere centred on its target point at any size.
      const geom = SPHERES.map((s) => {
        const baseD = (s.stages[0][2] / 100) * vw;
        const pt = (st: [number, number, number]) => ({
          x: (st[0] / 100) * vw - baseD / 2,
          y: (st[1] / 100) * vh - baseD / 2,
          scale: (st[2] / 100) * vw / baseD,
        });
        return { baseD, s: s.stages.map(pt) };
      });

      const heroY = (FIELD.hero.top / 100) * vh;
      const dockedY = (FIELD.docked.top / 100) * vh;

      ctx = gsap.context(() => {
        // ---- static setup ----
        sphereEls.forEach((el, i) => {
          gsap.set(el, {
            width: geom[i].baseD,
            height: geom[i].baseD,
            x: geom[i].s[0].x,
            y: geom[i].s[0].y,
            scale: geom[i].s[0].scale,
          });
        });
        gsap.set([".pb-welcome", ".pb-search-heading"], { xPercent: -50, yPercent: -50 });
        gsap.set(".pb-top-logo", { xPercent: -50 });
        gsap.set(".pb-field-wrap", { y: heroY });

        // ---- perpetual idle drift so nothing ever sits perfectly still ----
        if (!reduce) {
          gsap.utils.toArray<HTMLElement>(".pb-sphere-float", root).forEach((el, i) => {
            const dir = i % 2 ? 1 : -1;
            gsap.to(el, {
              xPercent: dir * (5 + (i % 3) * 3),
              yPercent: -dir * (6 + ((i + 1) % 3) * 4),
              rotation: dir * 2,
              duration: 4.5 + i * 0.6,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });
        }

        // ---- the sequence ----
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            playedRef.current = true;
            doneRef.current?.();
          },
        });

        // Stage 0 · Welcome reveal
        tl.from(sphereEls, {
          scale: (i: number) => geom[i].s[0].scale * 0.25,
          opacity: 0,
          duration: 0.85,
          ease: "back.out(1.5)",
          stagger: { each: 0.06, from: "random" },
        }, 0)
          .from(".pb-top-logo", { opacity: 0, y: -14, duration: 0.6 }, 0.2)
          .from(".pb-welcome", { opacity: 0, y: 26, duration: 0.7 }, 0.45);

        // Transition A · Welcome → Search hero
        const tA = 2.2;
        tl.to(".pb-welcome", { opacity: 0, y: -26, scale: 0.97, duration: 0.5, ease: "power2.in" }, tA);
        sphereEls.forEach((el, i) => {
          tl.to(el, { x: geom[i].s[1].x, y: geom[i].s[1].y, scale: geom[i].s[1].scale, duration: 1.35, ease: "power3.inOut" }, tA);
        });
        tl.fromTo(".pb-search-heading", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, tA + 0.3)
          .fromTo(".pb-field-inner", { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "back.out(1.3)" }, tA + 0.35)
          .to(".pb-glow", { opacity: 0.9, duration: 1.2, ease: "power2.out" }, tA + 0.3);

        // Transition B · Search hero → Docked. Everything else clears out —
        // heading, logo, glow and the spheres dissolve outward — leaving only
        // the docked search bar on black.
        const tB = 4.35;
        tl.to(".pb-search-heading", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" }, tB)
          .to(".pb-top-logo", { opacity: 0, duration: 0.45 }, tB)
          .to(".pb-glow", { opacity: 0, duration: 0.8, ease: "power2.in" }, tB)
          .to(".pb-field-wrap", { y: dockedY, duration: 1.1, ease: "expo.inOut" }, tB)
          .to(".pb-field-inner", { width: FIELD.docked.w, duration: 1.1, ease: "expo.inOut" }, tB);
        sphereEls.forEach((el, i) => {
          tl.to(el, { x: geom[i].s[2].x, y: geom[i].s[2].y, scale: geom[i].s[2].scale * 0.9, opacity: 0, duration: 1.1, ease: "power2.in" }, tB);
        });

        // On resize (after the intro has played) or reduced motion, skip to rest.
        if (reduce || playedRef.current) tl.progress(1).pause();

        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __tl?: gsap.core.Timeline }).__tl = tl;
        }
      }, root);
    };

    build();

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(build, 180);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(rt);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="pb-root relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* ---- Material spheres ---- */}
      {SPHERES.map((s, i) => (
        <div key={i} className="pb-sphere absolute left-0 top-0 z-0 will-change-transform">
          <div className="pb-sphere-float h-full w-full will-change-transform">
            <div
              className="flex h-full w-full items-center justify-center rounded-[clamp(8px,1.1vw,22px)] p-[15%]"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.img}
                alt=""
                className="pointer-events-none h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>
      ))}

      {/* ---- Standalone top logo (welcome + hero) ---- */}
      <div className="pb-top-logo absolute left-1/2 z-10" style={{ top: "7.87%" }}>
        <Logo className="h-[32px] w-[27.749px] text-white" />
      </div>

      {/* ---- Welcome heading ---- */}
      <h1 className="pb-welcome absolute left-1/2 top-1/2 z-10 m-0 text-center font-semibold uppercase leading-[1.1] text-white [font-size:clamp(30px,4.44vw,64px)]">
        Bem-vindo(a),<br />
        Sua biblioteca está<br />
        pronta!
      </h1>

      {/* ---- Search heading ---- */}
      <h1 className="pb-search-heading absolute left-1/2 z-10 m-0 text-center font-semibold uppercase leading-[1.1] text-white opacity-0 [font-size:clamp(30px,4.44vw,64px)]" style={{ top: "43%" }}>
        Busque em mais de<br />
        22.000 materiais<br />
        e produtos
      </h1>

      {/* ---- Search field (+ animated glow), animates hero → docked ---- */}
      <div className="pb-field-wrap absolute left-0 right-0 top-0 z-20 flex justify-center px-[16px]">
        <div
          className="pb-glow pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 opacity-0"
          style={{ width: "min(820px, 92vw)", height: "160px" }}
        >
          <div
            className="pb-glow-inner h-full w-full"
            style={{
              background:
                "radial-gradient(58% 140% at 16% 50%, rgba(236,172,80,0.42), transparent 64%), radial-gradient(50% 160% at 44% 55%, rgba(140,100,205,0.36), transparent 64%), radial-gradient(48% 160% at 70% 48%, rgba(100,135,225,0.32), transparent 64%), radial-gradient(45% 150% at 90% 52%, rgba(210,110,170,0.28), transparent 64%)",
            }}
          />
        </div>
        <div className="pb-field-inner relative z-10 opacity-0" style={{ width: FIELD.hero.w, maxWidth: "100%" }}>
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
