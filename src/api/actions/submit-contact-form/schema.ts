import { z } from "zod";

export const studentsRangeOptions = [
  { value: "up_to_100", label: "Até 100 alunos" },
  { value: "100_to_300", label: "100 a 300 alunos" },
  { value: "300_to_500", label: "300 a 500 alunos" },
  { value: "over_500", label: "Mais de 500 alunos" },
] as const;

const studentsRangeValues = studentsRangeOptions.map((option) => option.value) as [
  string,
  ...string[],
];

export const contactFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  gymName: z.string().min(1, "Nome da academia é obrigatório."),
  email: z.email("Email inválido."),
  phone: z.string().min(14, "Telefone inválido."),
  studentsRange: z.enum(studentsRangeValues),
  message: z.string().min(1, "Conte um pouco sobre sua academia."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
