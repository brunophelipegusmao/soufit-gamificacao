import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { ContactSection } from "./components/contact-section";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="py-7">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
