import Image from "next/image";

export function LoginHero() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <Image
        src="/login-hero.jpg"
        alt="Competição e Troféus"
        fill
        sizes="50vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative w-full flex flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="font-display font-extrabold text-xl tracking-tight">
              EVENTS<span className="text-primary">FITNESS</span>
            </span>
          </div>
          <h2 className="font-display font-black text-5xl leading-tight mb-6">
            Transforme sua{" "}
            <span className="text-primary text-glow">experiência</span>
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed max-w-sm">
            Acesse a plataforma de gamificação de treinos e competições para
            sua academia.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="font-display font-bold text-2xl text-primary">
              320+
            </p>
            <p className="text-sm text-muted-foreground">
              academias parceiras
            </p>
          </div>
          <div className="w-px h-12 bg-white/15" />
          <div>
            <p className="font-display font-bold text-2xl text-primary">
              45k+
            </p>
            <p className="text-sm text-muted-foreground">
              atletas engajados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
