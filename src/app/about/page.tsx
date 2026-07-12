import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { AboutSection } from "./components/about-section";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
