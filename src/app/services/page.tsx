import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
