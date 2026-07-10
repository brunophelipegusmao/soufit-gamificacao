import { QrCode, ShieldCheck, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const validations = [
  {
    icon: QrCode,
    title: "QR Code físico",
    description:
      "Scan automático no local do evento. O sistema verifica se o aluno já validou aquele QR no dia e credita o XP na hora — sem intervenção humana.",
  },
  {
    icon: ShieldCheck,
    title: "Aprovação manual",
    description:
      "Para ações que não dá pra checar por API, como seguir o perfil no Instagram: o aluno envia um print, o admin aprova na fila do painel e o XP é creditado.",
  },
  {
    icon: Zap,
    title: "Ação automática",
    description:
      "Eventos já rastreados pelo próprio sistema, como cadastro ou primeiro login, creditam XP sozinhos, sem qualquer validação extra.",
  },
];

export function ServicesValidation() {
  return (
    <div className="max-w-300 mx-auto px-5 md:px-8 mt-20 md:mt-28">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Validação de missões
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-4">
          Três formas de garantir que o XP é merecido
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nada de trapaça: cada tipo de missão tem seu próprio jeito de
          confirmar que a ação realmente aconteceu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {validations.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="gap-2 rounded-2xl border border-white/10 p-7"
          >
            <span className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Icon size={20} />
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
