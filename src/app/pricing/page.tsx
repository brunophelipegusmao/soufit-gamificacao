import { Header } from "@/components/header";
import { PriceSection } from "./components/price-section";
import { Footer } from "@/components/footer";

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