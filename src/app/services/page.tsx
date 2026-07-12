import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { ServicesSection } from "./components/services-section";

export default function ServicePage() {
  return (
    <>
      <Header />
        <main>
          <ServicesSection />
        </main>
      <Footer />
    </>
  );
}
