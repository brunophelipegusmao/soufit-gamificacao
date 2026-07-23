import "server-only";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import type { User, CampaignParticipant } from "@/types";

// Participante não tem sessão Supabase Auth (sem auth.uid()), então RLS de
// authenticated/anon não se aplica a ele — toda leitura/escrita de
// users/campaign_participants pro fluxo de login fica atrás do
// service_role (ver AUTENTICAÇÃO-PARTICIPANTE no CLAUDE.md).
export function normalizeWhatsapp(whatsapp: string) {
  return whatsapp.replace(/\D/g, "");
}

export async function findUserByWhatsapp(whatsapp: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("whatsapp", normalizeWhatsapp(whatsapp))
    .maybeSingle<User>();

  if (error) throw new Error(`Erro ao buscar participante: ${error.message}`);
  return data;
}

export async function findCampaignParticipant(
  campaignId: string,
  userId: string,
) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("campaign_participants")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("user_id", userId)
    .maybeSingle<CampaignParticipant>();

  if (error) {
    throw new Error(`Erro ao buscar vínculo com a campanha: ${error.message}`);
  }
  return data;
}

export async function joinCampaign(input: {
  campaignId: string;
  userId: string;
  venueId: string;
  lgpdConsent: boolean;
}) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("campaign_participants")
    .insert({
      campaign_id: input.campaignId,
      user_id: input.userId,
      venue_id: input.venueId,
      lgpd_consent: input.lgpdConsent,
    })
    .select("*")
    .single<CampaignParticipant>();

  if (error) {
    throw new Error(`Erro ao vincular participante à campanha: ${error.message}`);
  }
  return data;
}

export async function createParticipant(input: {
  name: string;
  whatsapp: string;
  campaignId: string;
  venueId: string;
  lgpdConsent: boolean;
}) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .insert({ name: input.name, whatsapp: normalizeWhatsapp(input.whatsapp) })
    .select("*")
    .single<User>();

  if (userError || !user) {
    throw new Error(userError?.message ?? "Erro ao criar participante.");
  }

  const participant = await joinCampaign({
    campaignId: input.campaignId,
    userId: user.id,
    venueId: input.venueId,
    lgpdConsent: input.lgpdConsent,
  });

  return { user, participant };
}
