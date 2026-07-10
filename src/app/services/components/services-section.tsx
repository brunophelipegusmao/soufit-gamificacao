import { AboutServices } from "@/components/about-services";
import { ServicesXpModel } from "./services-xp-model";
import { ServicesValidation } from "./services-validation";
import { ServicesCta } from "./services-cta";

export function ServicesSection() {
  return (
    <section className="w-full bg-background border-t border-white/10 pt-6 pb-16 md:pt-8 md:pb-24">
      <AboutServices />
      <ServicesXpModel />
      <ServicesValidation />
      <ServicesCta />
    </section>
  );
}
