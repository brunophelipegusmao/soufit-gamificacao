import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ServicesCta() {
  return (
    <div className="max-w-300 mx-auto px-5 md:px-8 mt-20 md:mt-28 text-center">
      <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
        Pronto para gamificar sua academia?
      </h2>
      <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
        Agende uma demonstração e veja como configurar sua primeira campanha
        em poucos minutos.
      </p>
      <Button
        render={<Link href="/demo" />}
        nativeButton={false}
        className="rounded-full bg-accent text-background px-8 py-4 h-auto gap-2 font-bold hover:bg-primary green-glow"
      >
        Quero agendar uma demo <ArrowRightIcon size={18} />
      </Button>
    </div>
  );
}
