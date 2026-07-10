import { AboutServices } from "@/components/about-services";
import { HowWork } from "./about-how-work";
import { AboutBenefects } from "./about-benefects";

export function AboutSection() {
  return (
    <section className="w-full flex flex-col gap-7 bg-background border-t border-white/10 pt-12 pb-8 md:pt-16">
      <HowWork />
      <AboutServices />
      <AboutBenefects />
    </section>
  );
}
