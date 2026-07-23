import { z } from "zod";

export const removeCampaignAdminSchema = z.object({
  campaign_id: z.uuid(),
  admin_id: z.uuid(),
});

export type RemoveCampaignAdminInput = z.infer<typeof removeCampaignAdminSchema>;
