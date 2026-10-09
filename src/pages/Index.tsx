import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import Artwork from "@/components/studio/Artwork";
import IconLibrary from "@/components/studio/IconLibrary";
import Converter from "@/components/studio/Converter";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { usePageParallax } from "@/hooks/use-page-parallax";

export default function Index() {
  const reducedMotion = useReducedMotion();
  const pageRef = usePageParallax(Boolean(reducedMotion));
  return (
    <MotionConfig reducedMotion="user">
      <IconLibrary />
      <div className="page-shell" ref={pageRef}>
        <div className="parallax-glow" aria-hidden="true" />
        <StudioHeader />
        <main className="studio-layout">
          <Artwork />
          <Converter />
        </main>
        <StudioFooter />
      </div>
    </MotionConfig>
  );
}
