"use server";

import { revalidatePath } from "next/cache";
import { assertSuperadmin } from "@/lib/admin";
import { inviteCampaignAdmin } from "@/lib/invite-admin";
import { inviteAdminSchema, type InviteAdminInput } from "./schema";

export async function inviteAdmin(
  campaignId: string,
  campaignSlug: string,
  input: InviteAdminInput,
) {
  await assertSuperadmin();

  const { email } = inviteAdminSchema.parse(input);

  const { emailSent } = await inviteCampaignAdmin(campaignId, email);

  revalidatePath(`/admin/${campaignSlug}`);

  return {
    success: emailSent
      ? `Convite enviado por email pra ${email}.`
      : `${email} já tinha conta — acesso à campanha concedido direto (nenhum email foi enviado).`,
  };
}
