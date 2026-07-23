"use server";

import { resend } from "@/api/clients/resend";
import {
  contactFormSchema,
  studentsRangeOptions,
  type ContactFormInput,
} from "./schema";

const CONTACT_EMAIL = "contato@eventsfitness.com.br";

export async function submitContactForm(input: ContactFormInput) {
  const { name, gymName, email, phone, studentsRange, message } =
    contactFormSchema.parse(input);

  const studentsRangeLabel = studentsRangeOptions.find(
    (option) => option.value === studentsRange,
  )!.label;

  const { error } = await resend.emails.send({
    from: "Events Fitness <onboarding@resend.dev>",
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `Nova solicitação de demo — ${gymName}`,
    text: [
      `Nome: ${name}`,
      `Academia/Box: ${gymName}`,
      `Email: ${email}`,
      `Telefone: ${phone}`,
      `Número de alunos: ${studentsRangeLabel}`,
      "",
      "Mensagem:",
      message,
    ].join("\n"),
  });

  if (error) {
    throw new Error("Erro ao enviar sua solicitação. Tente novamente.");
  }

  return { ok: true as const };
}
