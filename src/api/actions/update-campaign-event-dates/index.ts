"use server";

import { revalidatePath } from "next/cache";
import { assertCampaignAccess } from "@/api/data/admin";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import {
  updateCampaignEventDatesSchema,
  type UpdateCampaignEventDatesInput,
} from "./schema";

export async function updateCampaignEventDates(
  campaignSlug: string,
  input: UpdateCampaignEventDatesInput,
) {
  const { campaign } = await assertCampaignAccess(campaignSlug);

  const { event_starts_at, event_ends_at } =
    updateCampaignEventDatesSchema.parse(input);

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("campaigns")
    .update({ event_starts_at, event_ends_at })
    .eq("id", campaign.id);

  if (error) {
    if (error.code === "23514") {
      throw new Error(
        "A data do evento precisa estar dentro do período contratado da plataforma.",
      );
    }
    throw new Error(error.message);
  }

  revalidatePath(`/admin/${campaignSlug}`);

  return { success: "Data do evento atualizada." };
}
