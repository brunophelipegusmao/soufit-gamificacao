import { z } from "zod";

export const requestCampaignExtensionSchema = z.object({
  requested_until: z.string().min(1, "Nova data de encerramento é obrigatória."),
});

export type RequestCampaignExtensionInput = z.infer<
  typeof requestCampaignExtensionSchema
>;
