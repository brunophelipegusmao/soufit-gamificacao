"use server";

import { revalidatePath } from "next/cache";
import { assertSuperadmin, setPrincipalAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  setPrincipalAdminSchema,
  type SetPrincipalAdminInput,
} from "./schema";

export async function setPrincipal(
  campaignSlug: string,
  input: SetPrincipalAdminInput,
) {
  await assertSuperadmin();

  const { campaign_id, admin_id } = setPrincipalAdminSchema.parse(input);

  const supabaseAdmin = getSupabaseAdmin();
  await setPrincipalAdmin(supabaseAdmin, campaign_id, admin_id);

  revalidatePath(`/admin/${campaignSlug}/administradores`);

  return { success: "Admin principal atualizado." };
}
