import { ContactInfo } from "./contact-info";
import { ContactForm } from "./contact-form";

export function ContactSection() {
  return (
    <section className="w-full bg-background border-t border-white/10 py-12 md:py-20">
      <div className="max-w-300 mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
