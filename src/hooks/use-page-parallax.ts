import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function usePageParallax(reducedMotion: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const artwork = root.querySelector<HTMLElement>(".artwork");
    const image = root.querySelector<HTMLElement>(".artwork-visual");
    const workspace = root.querySelector<HTMLElement>(".workspace");
    const mark = root.querySelector<HTMLElement>(".brand-mark");
    const signature = root.querySelector<HTMLElement>(".signature");
    const glow = root.querySelector<HTMLElement>(".parallax-glow");
    if (!artwork || !image || !workspace || !mark || !signature || !glow)
      return;

    gsap.registerPlugin(ScrollTrigger);
    let removePointer = () => {};
    const context = gsap.context(() => {
      gsap.fromTo(
        image,
        { yPercent: -2 },
        {
          yPercent: 2,
          ease: "none",
          scrollTrigger: {
            trigger: artwork,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );

      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const moveImage = gsap.quickTo(image, "x", {
          duration: 0.75,
          ease: "power3.out",
        });
        const moveWorkspaceX = gsap.quickTo(workspace, "x", {
          duration: 0.9,
          ease: "power3.out",
        });
        const moveWorkspaceY = gsap.quickTo(workspace, "y", {
          duration: 0.9,
          ease: "power3.out",
        });
        const moveMark = gsap.quickTo(mark, "x", {
          duration: 0.65,
          ease: "power3.out",
        });
        const moveSignature = gsap.quickTo(signature, "x", {
          duration: 1,
          ease: "power3.out",
        });
        const moveGlowX = gsap.quickTo(glow, "x", {
          duration: 1.2,
          ease: "power3.out",
        });
        const moveGlowY = gsap.quickTo(glow, "y", {
          duration: 1.2,
          ease: "power3.out",
        });
        const onMove = (event: PointerEvent) => {
          const x = (event.clientX / window.innerWidth - 0.5) * 2;
          const y = (event.clientY / window.innerHeight - 0.5) * 2;
          moveImage(x * 15);
          moveWorkspaceX(x * -5);
          moveWorkspaceY(y * -4);
          moveMark(x * 4);
          moveSignature(x * 7);
          moveGlowX(x * 38);
          moveGlowY(y * 28);
        };
        const onLeave = () => {
          moveImage(0);
          moveWorkspaceX(0);
          moveWorkspaceY(0);
          moveMark(0);
          moveSignature(0);
          moveGlowX(0);
          moveGlowY(0);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        removePointer = () => {
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerleave", onLeave);
        };
      }
    }, root);

    return () => {
      removePointer();
      context.revert();
    };
  }, [reducedMotion]);

  return rootRef;
}
