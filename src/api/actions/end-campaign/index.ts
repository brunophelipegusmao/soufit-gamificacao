"use server";

import { revalidatePath } from "next/cache";
import { assertCampaignAccess } from "@/api/data/admin";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";

export async function endCampaign(campaignSlug: string) {
  const { campaign } = await assertCampaignAccess(campaignSlug);

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("campaigns")
    .update({ active: false })
    .eq("id", campaign.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/${campaignSlug}`);

  return { success: "Campanha encerrada." };
}
