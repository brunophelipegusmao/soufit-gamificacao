import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "./supabase-server";
import { getSupabaseAdmin } from "./supabase-admin";
import type { Campaign } from "@/types";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
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
  email: string | null;
};

export async function listCampaignAdmins(
  supabase: ServerSupabase,
  campaignId: string,
): Promise<CampaignAdminWithEmail[]> {
  const { data, error } = await supabase
    .from("campaign_admins")
    .select("id, user_id, created_at")
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
