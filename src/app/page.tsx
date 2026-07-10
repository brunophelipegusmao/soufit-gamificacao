
import { HeroSection } from "@/components/hero-section";
import { Header } from "../components/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <HeroSection />
      </main>
    </>
  );
}
