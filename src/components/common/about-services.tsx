import Image from "next/image";
import { Check, Gamepad2, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    image: "/competicao.jpg",
    alt: "Competição fitness",
    badgeIcon: Trophy,
    badgeLabel: "Competição",
    title: "Jogos de competição",
    description:
      "Torneios, desafios e ligas internas com rankings ao vivo, chaveamento e premiações. Crie eventos que lotam sua academia e viram tradição entre os alunos.",
    highlights: [
      "Rankings e leaderboards em tempo real",
      "Chaveamento e categorias automatizadas",
      "Inscrições e pagamentos integrados",
    ],
  },
  {
    image: "/treino-grupo.jpg",
    alt: "Treino em grupo",
    badgeIcon: Gamepad2,
    badgeLabel: "Gamificação",
    title: "Gamificação de treinos",
    description:
      "Pontos, níveis, medalhas e missões que transformam cada treino em progresso visível. Seus alunos ganham recompensas por consistência e evolução.",
    highlights: [
      "Sistema de pontos, XP e níveis",
      "Conquistas, badges e streaks diárias",
      "Missões e desafios personalizados",
    ],
  },
];

export function AboutServices() {
  return (
    <div className="max-w-300 mx-auto px-5 md:px-8 mt-20 md:mt-28">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Nossos serviços
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-4">
          Dois motores para engajar sua comunidade
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Combinamos competição real com gamificação do dia a dia para manter
          seus alunos motivados o ano inteiro.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map(
          ({
            image,
            alt,
            badgeIcon: BadgeIcon,
            badgeLabel,
            title,
            description,
            highlights,
          }) => (
            <Card
              key={title}
              className="group gap-0 overflow-hidden rounded-2xl border border-white/10 p-0 hover:border-primary/50 transition"
            >
              <div className="relative h-56">
                <Image
                  src={image}
                  alt={alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />
                <Badge className="absolute top-4 left-4 gap-1.5 px-3 py-1.5 text-xs font-bold">
                  <BadgeIcon size={14} /> {badgeLabel}
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="font-display font-bold text-2xl mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {description}
                </p>
                <ul className="space-y-2.5 text-sm text-foreground/80">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-3">
                      <Check className="text-primary shrink-0" size={16} />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
