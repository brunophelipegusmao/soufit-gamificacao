import Image from "next/image";
import { ChartLine, HandCoins, Megaphone, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    icon: Users,
    title: "Mais retenção de alunos",
    description:
      "Gamificação mantém alunos motivados e reduz o abandono — eles voltam pra bater recordes.",
  },
  {
    icon: HandCoins,
    title: "Nova fonte de receita",
    description:
      "Monetize eventos com inscrições pagas, patrocínios e planos premium para competições.",
  },
  {
    icon: Megaphone,
    title: "Comunidade mais forte",
    description:
      "Eventos criam senso de pertencimento e viram máquina de indicação orgânica.",
  },
  {
    icon: ChartLine,
    title: "Decisões orientadas a dados",
    description:
      "Painel completo de engajamento e frequência para entender e crescer sua base.",
  },
];

export function AboutBenefects() {
  return (
    <div className="max-w-300 mx-auto px-5 pb-7 md:px-8 mt-20 md:mt-28">
      <div>
        <div className="text-center pb-5">
          <span className="text-primary text-xs font-semibold tracking-widest uppercase">
            Benefícios
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-6">
            Por que academias e boxes escolhem a Events Fitness
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="relative">
            <div className="relative h-80 md:h-130">
              <Image
                src="/atleta.jpg"
                alt="Atleta motivado"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="rounded-2xl object-cover"
              />
            </div>
            <Card className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-40 md:w-56 gap-0 rounded-2xl bg-primary p-4 md:p-6 text-primary-foreground green-glow">
              <p className="font-display font-black text-2xl md:text-4xl">
                +38%
              </p>
              <p className="text-xs md:text-sm font-semibold">
                de retenção média nas academias parceiras
              </p>
            </Card>
          </div>
          <div>
            <div className="space-y-6">
              {benefits.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <span className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-lg">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
