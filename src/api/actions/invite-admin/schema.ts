import { z } from "zod";

export const inviteAdminSchema = z.object({
  email: z.email("Informe um email válido."),
});

export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
