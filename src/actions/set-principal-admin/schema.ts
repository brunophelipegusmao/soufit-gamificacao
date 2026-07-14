import { z } from "zod";

export const setPrincipalAdminSchema = z.object({
  campaign_id: z.uuid(),
  admin_id: z.uuid(),
});

export type SetPrincipalAdminInput = z.infer<typeof setPrincipalAdminSchema>;
