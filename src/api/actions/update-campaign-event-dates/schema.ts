import { z } from "zod";

export const updateCampaignEventDatesSchema = z.object({
  event_starts_at: z.string().min(1, "Data de início do evento é obrigatória."),
  event_ends_at: z.string().min(1, "Data de fim do evento é obrigatória."),
});

export type UpdateCampaignEventDatesInput = z.infer<
  typeof updateCampaignEventDatesSchema
>;
