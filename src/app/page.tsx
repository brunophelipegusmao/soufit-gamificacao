
import { HeroSection } from "@/components/hero-section";
import { Header } from "../components/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <HeroSection />
      </main>
      <Footer/>
    </>
  );
}
