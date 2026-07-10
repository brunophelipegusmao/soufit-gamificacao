import { Card} from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Configure sua academia",
    description:
      "Cadastre modalidades, alunos e regras. Tudo pronto em minutos com nossa equipe.",
  },
  {
    number: "02",
    title: "Crie eventos e desafios",
    description:
      "Monte torneios, ligas e missões de treino com poucos cliques em modelos prontos.",
  },
  {
    number: "03",
    title: "Engaje seus alunos",
    description:
      "Alunos competem, acumulam pontos e acompanham rankings pelo app em tempo real.",
  },
  {
    number: "04",
    title: "Acompanhe resultados",
    description:
      "Painel com métricas de engajamento, frequência e retenção para decidir melhor.",
  },
];

export function HowWork() {
  return (
    <div className="max-w-300 mx-auto px-5 md:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Como funciona
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">
          Do zero ao primeiro evento em dias
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {steps.map(({ number, title, description }) => (
          <Card
            key={number}
            className="relative gap-2 rounded-2xl border border-white/10 p-7"
          >
            <span className="font-display font-black text-5xl text-primary/60">
              {number}
            </span>
            <h3 className="font-display font-semibold text-lg mt-2 mb-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
