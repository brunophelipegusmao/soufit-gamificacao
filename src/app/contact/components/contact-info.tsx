import { Clock, Mail, Phone } from "lucide-react";

const infoItems = [
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@eventsfitness.com.br",
  },
  {
    icon: Phone,
    label: "Telefone / WhatsApp",
    value: "(11) 99999-0000",
  },
  {
    icon: Clock,
    label: "Atendimento",
    value: "Seg a Sex, 9h às 18h",
  },
];

export function ContactInfo() {
  return (
    <div>
      <span className="text-primary text-xs font-semibold tracking-widest uppercase">
        Fale conosco
      </span>
      <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 mb-6">
        Pronto para gamificar sua academia?
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-9 max-w-md">
        Preencha o formulário e nossa equipe entra em contato para uma
        demonstração gratuita e personalizada para o seu box ou academia.
      </p>
      <div className="space-y-5">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
