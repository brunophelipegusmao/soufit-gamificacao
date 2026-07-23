"use server";

import { assertSuperadmin } from "@/api/data/admin";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import type { CampaignExtensionRequest } from "@/types";
import {
  reviewCampaignExtensionSchema,
  type ReviewCampaignExtensionInput,
} from "./schema";

export async function reviewCampaignExtension(input: ReviewCampaignExtensionInput) {
  const { user } = await assertSuperadmin();

  const { request_id, decision } = reviewCampaignExtensionSchema.parse(input);

  const supabaseAdmin = getSupabaseAdmin();

  const { data: request, error: requestError } = await supabaseAdmin
    .from("campaign_extension_requests")
    .select("id, campaign_id, requested_by, requested_until, status")
    .eq("id", request_id)
    .maybeSingle<CampaignExtensionRequest>();

  if (requestError || !request) {
    throw new Error(requestError?.message ?? "Solicitação não encontrada.");
  }

  if (request.status !== "pending") {
    throw new Error("Essa solicitação já foi revisada.");
  }

  // Não deveria acontecer pelo modelo de papéis (superadmin não tem
  // vínculo de campanha, ver GATE-1), mas nada no banco impede
  // tecnicamente alguém estar em superadmins e campaign_admins ao mesmo
  // tempo — checagem defensiva contra auto-aprovação.
  if (request.requested_by === user.id) {
    throw new Error("Você não pode revisar a própria solicitação.");
  }

  const { error: updateRequestError } = await supabaseAdmin
    .from("campaign_extension_requests")
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request_id);

  if (updateRequestError) throw new Error(updateRequestError.message);

  if (decision === "approved") {
    const { error: updateCampaignError } = await supabaseAdmin
      .from("campaigns")
      .update({ contract_ends_at: request.requested_until })
      .eq("id", request.campaign_id);

    if (updateCampaignError) throw new Error(updateCampaignError.message);
  }

  return { success: "Solicitação revisada." };
}
