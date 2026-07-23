import { z } from "zod";

// name/venue_id/lgpd_consent só são exigidos condicionalmente (participante
// novo, ou já existente mas ainda não vinculado a esta campanha) — checado
// na action, não aqui, porque depende de uma consulta ao banco (se o
// whatsapp já existe). Ver AUTENTICAÇÃO-PARTICIPANTE no CLAUDE.md.
export const participantLoginSchema = z.object({
  whatsapp: z.string().min(1, "WhatsApp é obrigatório."),
  name: z.string().min(1, "Nome é obrigatório.").optional(),
  venue_id: z.uuid("Selecione uma academia.").optional(),
  lgpd_consent: z.boolean().optional(),
});

export type ParticipantLoginInput = z.infer<typeof participantLoginSchema>;
