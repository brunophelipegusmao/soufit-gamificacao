"use server";

import { revalidatePath } from "next/cache";
import { assertSuperadmin, listCampaignAdmins, removeCampaignAdmin } from "@/api/data/admin";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import {
  removeCampaignAdminSchema,
  type RemoveCampaignAdminInput,
} from "./schema";

export async function removeAdmin(
  campaignSlug: string,
  input: RemoveCampaignAdminInput,
) {
  const { supabase } = await assertSuperadmin();

  const { campaign_id, admin_id } = removeCampaignAdminSchema.parse(input);

  const admins = await listCampaignAdmins(supabase, campaign_id);
  const target = admins.find((admin) => admin.id === admin_id);

  if (!target) throw new Error("Admin não encontrado.");
  if (target.is_principal && admins.length === 1) {
    throw new Error(
      "Não é possível remover o único admin da campanha. Convide outro admin antes de remover o principal.",
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  await removeCampaignAdmin(supabaseAdmin, campaign_id, admin_id);

  revalidatePath(`/admin/${campaignSlug}/administradores`);

  return { success: "Admin removido." };
}
