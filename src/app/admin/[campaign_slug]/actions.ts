"use server";

import { revalidatePath } from "next/cache";
import { assertSuperadmin } from "@/lib/admin";
import { inviteCampaignAdmin } from "@/lib/invite-admin";

export type InviteAdminState = { error?: string; success?: string } | undefined;

export async function inviteAdmin(
  campaignId: string,
  campaignSlug: string,
  _prevState: InviteAdminState,
  formData: FormData,
): Promise<InviteAdminState> {
  await assertSuperadmin();

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe um email." };

  let emailSent = false;

  try {
    ({ emailSent } = await inviteCampaignAdmin(campaignId, email));
  } catch (err) {
    return { error: (err as Error).message };
  }

  revalidatePath(`/admin/${campaignSlug}`);
  return {
    success: emailSent
      ? `Convite enviado por email pra ${email}.`
      : `${email} já tinha conta — acesso à campanha concedido direto (nenhum email foi enviado).`,
  };
}
