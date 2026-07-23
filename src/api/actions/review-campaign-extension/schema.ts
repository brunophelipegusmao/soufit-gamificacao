import { z } from "zod";

export const reviewCampaignExtensionSchema = z.object({
  request_id: z.uuid(),
  decision: z.enum(["approved", "rejected"]),
});

export type ReviewCampaignExtensionInput = z.infer<
  typeof reviewCampaignExtensionSchema
>;
