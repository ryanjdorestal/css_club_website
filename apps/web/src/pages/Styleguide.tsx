/** /styleguide — the type specimen + component sheet, compared to T01–T12 (run 3), one band per file under
    pages/styleguide/. Not linked from the nav; the design reference the DESIGN.md rules point at. */
import { FinLine } from "@/components/FinLine";
import { TypeBand } from "./styleguide/TypeBand";
import { FolderBand } from "./styleguide/FolderBand";
import { SpecimenBand } from "./styleguide/SpecimenBand";
import { GrammarBand } from "./styleguide/GrammarBand";
import { CardsBand } from "./styleguide/CardsBand";
import { PaperBand } from "./styleguide/PaperBand";
import { TexturesBand } from "./styleguide/TexturesBand";

export default function Styleguide() {
  return (
    <main className="pt-[72px]">
      <TypeBand />
      <FolderBand />
      <SpecimenBand />
      <GrammarBand />
      <CardsBand />
      <PaperBand />
      <TexturesBand />
      <FinLine n="00" next="/" binary="01010100 01011001 01010000 01000101" />
    </main>
  );
}
