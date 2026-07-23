import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/api/clients/supabase-server";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import type { Campaign } from "@/types";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

// Client injetado em vez de construído aqui dentro: src/proxy.ts roda em
// Edge (middleware) e precisa de um client Supabase montado com
// request.cookies, incompatível com o createClient() baseado em
// next/headers usado no resto do app — mas a query de sessão em si
// (auth.getUser()) é a mesma nos dois runtimes, então fica compartilhada
// aqui em vez de duplicada.
export async function getAuthUser(supabase: ServerSupabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionUser() {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);
  return { supabase, user };
}

// Timeout de inatividade (superadmin/campaign_admin — participante não usa
// Supabase Auth, ver AUTENTICAÇÃO-PARTICIPANTE no CLAUDE.md). Pura por
// design: só matemática de timestamp, sem I/O, então dá pra chamar de
// src/proxy.ts sem duplicar a regra em Edge e no resto do app.
export const ADMIN_INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

export function isAdminSessionExpired(lastActivityCookie: string | undefined) {
  const lastActivityMs = lastActivityCookie ? Number(lastActivityCookie) : NaN;
  return (
    Number.isNaN(lastActivityMs) ||
    Date.now() - lastActivityMs > ADMIN_INACTIVITY_LIMIT_MS
  );
}

export async function verifySession() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect("/admin/login");
  return { supabase, user };
}

export async function isSuperadmin(supabase: ServerSupabase, userId: string) {
  const { data, error } = await supabase
    .from("superadmins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao checar superadmin: ${error.message}`);

  return data !== null;
}

export async function assertSuperadmin() {
  const { supabase, user } = await verifySession();
  if (!(await isSuperadmin(supabase, user.id))) notFound();
  return { supabase, user };
}

export type AdminCampaign = Campaign & { role: "superadmin" | "admin" };

export async function getCampaignsForUser(): Promise<AdminCampaign[]> {
  const { supabase, user } = await verifySession();

  if (await isSuperadmin(supabase, user.id)) {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("title", { ascending: true })
      .returns<Campaign[]>();

    if (error) throw new Error(`Erro ao listar campanhas: ${error.message}`);

    return (data ?? []).map((campaign) => ({ ...campaign, role: "superadmin" }));
  }

  const { data, error } = await supabase
    .from("campaign_admins")
    .select("campaigns(*)")
    .eq("user_id", user.id)
    .returns<{ campaigns: Campaign }[]>();

  if (error) throw new Error(`Erro ao listar campanhas: ${error.message}`);

  return (data ?? [])
    .filter((row) => row.campaigns)
    .map((row) => ({ ...row.campaigns, role: "admin" }));
}

async function getCampaignBySlugForAdmin(supabase: ServerSupabase, slug: string) {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Campaign>();

  if (error) throw new Error(`Erro ao buscar campanha: ${error.message}`);

  return data;
}

export async function assertCampaignAccess(campaignSlug: string) {
  const { supabase, user } = await verifySession();
  const campaign = await getCampaignBySlugForAdmin(supabase, campaignSlug);
  if (!campaign) notFound();

  if (await isSuperadmin(supabase, user.id)) {
    return { supabase, user, campaign, isSuperadmin: true as const };
  }

  const { data, error } = await supabase
    .from("campaign_admins")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao checar acesso à campanha: ${error.message}`);
  if (!data) notFound();

  return { supabase, user, campaign, isSuperadmin: false as const };
}

export type CampaignAdminWithEmail = {
  id: string;
  user_id: string;
  created_at: string;
  is_principal: boolean;
  email: string | null;
};

export async function listCampaignAdmins(
  supabase: ServerSupabase,
  campaignId: string,
): Promise<CampaignAdminWithEmail[]> {
  const { data, error } = await supabase
    .from("campaign_admins")
    .select("id, user_id, created_at, is_principal")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Erro ao listar admins da campanha: ${error.message}`);

  const rows = data ?? [];
  const supabaseAdmin = getSupabaseAdmin();

  return Promise.all(
    rows.map(async (row) => {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
        row.user_id,
      );
      return { ...row, email: userData.user?.email ?? null };
    }),
  );
}

type AdminSupabase = ReturnType<typeof getSupabaseAdmin>;

export async function countCampaignAdmins(
  supabase: ServerSupabase,
  campaignId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("campaign_admins")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);

  if (error) throw new Error(`Erro ao contar admins da campanha: ${error.message}`);

  return count ?? 0;
}

export async function removeCampaignAdmin(
  supabaseAdmin: AdminSupabase,
  campaignId: string,
  adminId: string,
) {
  const { data: target, error: targetError } = await supabaseAdmin
    .from("campaign_admins")
    .select("id, is_principal")
    .eq("id", adminId)
    .eq("campaign_id", campaignId)
    .single();

  if (targetError || !target) {
    throw new Error(targetError?.message ?? "Admin não encontrado.");
  }

  const { error: deleteError } = await supabaseAdmin
    .from("campaign_admins")
    .delete()
    .eq("id", adminId);

  if (deleteError) throw new Error(deleteError.message);

  if (!target.is_principal) return;

  const { data: oldest, error: oldestError } = await supabaseAdmin
    .from("campaign_admins")
    .select("id")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (oldestError) throw new Error(oldestError.message);
  if (!oldest) return;

  const { error: promoteError } = await supabaseAdmin
    .from("campaign_admins")
    .update({ is_principal: true })
    .eq("id", oldest.id);

  if (promoteError) throw new Error(promoteError.message);
}

export async function setPrincipalAdmin(
  supabaseAdmin: AdminSupabase,
  campaignId: string,
  adminId: string,
) {
  const { error: unsetError } = await supabaseAdmin
    .from("campaign_admins")
    .update({ is_principal: false })
    .eq("campaign_id", campaignId)
    .eq("is_principal", true);

  if (unsetError) throw new Error(unsetError.message);

  const { error: setError } = await supabaseAdmin
    .from("campaign_admins")
    .update({ is_principal: true })
    .eq("id", adminId)
    .eq("campaign_id", campaignId);

  if (setError) throw new Error(setError.message);
}
