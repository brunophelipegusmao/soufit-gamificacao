import {
  Camera,
  Dumbbell,
  HelpCircle,
  Heart,
  Images,
  LogIn,
  QrCode,
  Share2,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const missions = [
  { icon: UserPlus, label: "Cadastro completo", xp: 100 },
  { icon: LogIn, label: "Primeiro login", xp: 50 },
  { icon: QrCode, label: "Check-in (QR Code)", xp: 20 },
  { icon: Dumbbell, label: "Presença em aula", xp: 30 },
  { icon: Camera, label: "Story no Instagram", xp: 80 },
  { icon: Images, label: "Post no feed", xp: 150 },
  { icon: Heart, label: "Seguir perfil", xp: 30 },
  { icon: HelpCircle, label: "Quiz completo", xp: 40 },
  { icon: Share2, label: "Indicação de amigo", xp: 100 },
  { icon: ShoppingBag, label: "Compra na loja", xp: 200 },
];

export function ServicesXpModel() {
  return (
    <div className="max-w-300 mx-auto px-5 md:px-8 mt-20 md:mt-28">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Modelo de XP
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-4">
          Toda ação do aluno vira pontuação
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Cada missão tem um valor de XP configurável por campanha. Quanto
          mais o aluno se engaja, mais ele sobe no ranking.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {missions.map(({ icon: Icon, label, xp }) => (
          <Card
            key={label}
            className="items-center gap-3 rounded-2xl border border-white/10 p-6 text-center"
          >
            <span className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Icon size={20} />
            </span>
            <h3 className="font-semibold text-sm leading-snug">{label}</h3>
            <Badge>+{xp}xp</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
