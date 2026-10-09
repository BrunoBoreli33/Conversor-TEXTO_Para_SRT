import StudioHeader from "@/components/studio/StudioHeader";
import StudioFooter from "@/components/studio/StudioFooter";
import Artwork from "@/components/studio/Artwork";
import IconLibrary from "@/components/studio/IconLibrary";
import Converter from "@/components/studio/Converter";

export default function Index() {
  return (
    <>
      <IconLibrary />
      <div className="page-shell">
        <StudioHeader />
        <main className="studio-layout">
          <Artwork />
          <Converter />
        </main>
        <StudioFooter />
      </div>
    </>
  );
}
