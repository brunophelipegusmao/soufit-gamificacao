import { Header } from "@/components/common/header";
import { PriceSection } from "./components/price-section";
import { Footer } from "@/components/common/footer";

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <PriceSection />
      </main>
      <Footer />
    </>
  );
}
