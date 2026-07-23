import "server-only";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";

async function getRedirectOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  return `${proto}://${host}`;
}

export async function inviteCampaignAdmin(
  campaignId: string,
  email: string,
  isPrincipal = false,
) {
  const supabaseAdmin = getSupabaseAdmin();
  const origin = await getRedirectOrigin();
  const redirectTo = `${origin}/admin/set-password`;

  const invite = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });

  const ALREADY_REGISTERED_CODES = [
    "email_exists",
    "user_already_exists",
    "identity_already_exists",
  ];

  let userId = invite.data.user?.id;
  let emailSent = !invite.error;

  if (invite.error) {
    if (!ALREADY_REGISTERED_CODES.includes(invite.error.code ?? "")) {
      // Erro real (rate limit, email inválido, SMTP mal configurado etc.) —
      // não é seguro assumir "já registrado" e cair no fallback silencioso.
      throw new Error(invite.error.message);
    }

    // Email já tem conta — recupera o id existente sem reenviar convite
    // nenhum (generateLink não envia email, só gera o link).
    const link = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (link.error || !link.data.user) {
      throw new Error(invite.error.message);
    }

    userId = link.data.user.id;
    emailSent = false;
  }

  if (!userId) {
    throw new Error("Não foi possível resolver o usuário convidado.");
  }

  const { error: insertError } = await supabaseAdmin
    .from("campaign_admins")
    .upsert(
      { campaign_id: campaignId, user_id: userId, is_principal: isPrincipal },
      { onConflict: "campaign_id,user_id" },
    );

  if (insertError) throw new Error(insertError.message);

  return { userId, emailSent };
}
