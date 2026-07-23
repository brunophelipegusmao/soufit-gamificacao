"use server";

import { revalidatePath } from "next/cache";
import { assertCampaignAccess } from "@/api/data/admin";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import {
  requestCampaignExtensionSchema,
  type RequestCampaignExtensionInput,
} from "./schema";

export async function requestCampaignExtension(
  campaignSlug: string,
  input: RequestCampaignExtensionInput,
) {
  const { campaign, user } = await assertCampaignAccess(campaignSlug);

  const { requested_until } = requestCampaignExtensionSchema.parse(input);

  if (new Date(requested_until) <= new Date(campaign.contract_ends_at)) {
    throw new Error(
      "A nova data precisa ser posterior ao encerramento atual da plataforma.",
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("campaign_extension_requests")
    .insert({
      campaign_id: campaign.id,
      requested_by: user.id,
      requested_until,
    });

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Já existe uma solicitação de prorrogação pendente para essa campanha.",
      );
    }
    throw new Error(error.message);
  }

  revalidatePath(`/admin/${campaignSlug}`);

  return { success: "Solicitação de prorrogação enviada." };
}
