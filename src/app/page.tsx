import { HeroSection } from "@/components/common/hero-section";
import { Header } from "../components/common/header";
import { Footer } from "@/components/common/footer";

export default function Home() {
  return (
    <>
      <div className="flex min-h-dvh flex-col md:h-dvh">
        <Header />
        <main className="flex flex-1 flex-col">
          <HeroSection />
        </main>
      </div>
      <Footer />
    </>
  );
}
