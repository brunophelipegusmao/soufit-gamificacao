import { ArrowRightIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-140 w-full overflow-hidden md:h-200">
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 hero-overlay"></div>
      <div className="relative max-w-300 px-5 py-16 md:px-20 md:py-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-primary text-xs font-semibold tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary pulse-dot"></span>{" "}
            Plataforma de eventos gamificados
          </span>
          <h1 className="font-display font-black text-3xl md:text-6xl leading-[1.1] md:leading-[1.05] mb-4 md:mb-6">
            Transforme treinos em{" "}
            <span className="text-primary text-glow">competição</span> e
            engajamento
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-9 max-w-xl">
            A Events Fitness leva jogos de competição e gamificação de treinos
            para academias e boxes. Mais retenção, mais energia na sua
            comunidade e alunos que voltam sempre pra bater recordes.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
            <Button
              render={<a href="#contato" />}
              nativeButton={false}
              className="w-full sm:w-auto rounded-full bg-accent text-background px-8 py-4 h-auto gap-2 font-bold hover:bg-primary green-glow"
            >
              Quero na minha academia <ArrowRightIcon size={18} />
            </Button>
            <Button
              render={<a href="#" />}
              variant="outline"
              nativeButton={false}
              className="w-full sm:w-auto rounded-full border-white/25 bg-transparent px-7 py-4 h-auto gap-2 font-semibold text-white hover:bg-white/10"
            >
              <PlayIcon className="text-primary" size={18} /> Ver demonstração
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-6 md:gap-8 mt-8 md:mt-12">
            <div>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-primary">
                +320
              </p>
              <p className="text-sm text-muted-foreground">academias parceiras</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/15"></div>
            <div>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-primary">
                +45mil
              </p>
              <p className="text-sm text-muted-foreground">atletas engajados</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/15"></div>
            <div>
              <p className="font-display font-extrabold text-2xl md:text-3xl text-primary">
                +38%
              </p>
              <p className="text-sm text-muted-foreground">retenção de alunos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
