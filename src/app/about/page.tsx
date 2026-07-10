import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { AboutSection } from "./components/about-section";

export default function AboutPage() {
    return (
      <>
        <Header />
            <main>
                <AboutSection   />
        </main>
        <Footer />
      </>
    );
}