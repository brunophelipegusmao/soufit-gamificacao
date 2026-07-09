"use server";

import { redirect } from "next/navigation";
import { assertSuperadmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { inviteCampaignAdmin } from "@/lib/invite-admin";

export type CreateCampaignState = { error?: string } | undefined;

type VenueInput = { name: string; city: string; state: string };

type MissionInput = {
  title: string;
  description: string;
  xp_value: number;
  validation_type: string;
  repeatable: boolean;
  max_per_day: number;
  active: boolean;
};

export async function createCampaign(
  _prevState: CreateCampaignState,
  formData: FormData,
): Promise<CreateCampaignState> {
  await assertSuperadmin();
  const supabaseAdmin = getSupabaseAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const brand_name = String(formData.get("brand_name") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim() || null;
  const primary_color = String(formData.get("primary_color") ?? "#000000");
  const starts_at = String(formData.get("starts_at") ?? "") || null;
  const ends_at = String(formData.get("ends_at") ?? "") || null;
  const active = formData.get("active") === "on";
  const adminEmail = String(formData.get("admin_email") ?? "").trim();

  if (!title || !slug) {
    return { error: "Título e slug são obrigatórios." };
  }

  let venues: VenueInput[];
  let missions: MissionInput[];

  try {
    venues = JSON.parse(String(formData.get("venues") ?? "[]"));
    missions = JSON.parse(String(formData.get("missions") ?? "[]"));
  } catch {
    return { error: "Dados de academias/missões inválidos." };
  }

  venues = venues.filter((v) => v.name.trim());
  missions = missions.filter((m) => m.title.trim());

  if (venues.length === 0) {
    return { error: "Adicione pelo menos uma academia." };
  }
  if (missions.length === 0) {
    return { error: "Adicione pelo menos uma missão." };
  }

  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("campaigns")
    .insert({
      title,
      slug,
      brand_name,
      logo_url,
      primary_color,
      starts_at,
      ends_at,
      active,
    })
    .select("id, slug")
    .single();

  if (campaignError || !campaign) {
    return { error: campaignError?.message ?? "Erro ao criar a campanha." };
  }

  const { data: insertedVenues, error: venuesError } = await supabaseAdmin
    .from("venues")
    .insert(venues.map((v) => ({ name: v.name, city: v.city, state: v.state })))
    .select("id, name");

  if (venuesError || !insertedVenues) {
    return { error: venuesError?.message ?? "Erro ao criar as academias." };
  }

  const { error: campaignVenuesError } = await supabaseAdmin
    .from("campaign_venues")
    .insert(
      insertedVenues.map((venue) => ({
        campaign_id: campaign.id,
        venue_id: venue.id,
      })),
    );

  if (campaignVenuesError) {
    return { error: campaignVenuesError.message };
  }

  const { data: insertedMissions, error: missionsError } = await supabaseAdmin
    .from("missions")
    .insert(
      missions.map((m) => ({
        campaign_id: campaign.id,
        title: m.title,
        description: m.description || null,
        xp_value: m.xp_value,
        validation_type: m.validation_type,
        repeatable: m.repeatable,
        max_per_day: m.max_per_day,
        active: m.active,
      })),
    )
    .select("id, title, validation_type");

  if (missionsError || !insertedMissions) {
    return { error: missionsError?.message ?? "Erro ao criar as missões." };
  }

  const qrMissions = insertedMissions.filter(
    (m) => m.validation_type === "qr",
  );

  if (qrMissions.length > 0) {
    const qrRows = qrMissions.flatMap((mission) =>
      insertedVenues.map((venue) => ({
        campaign_id: campaign.id,
        venue_id: venue.id,
        mission_id: mission.id,
        token: crypto.randomUUID(),
        label: `${venue.name} — ${mission.title}`,
      })),
    );

    const { error: qrError } = await supabaseAdmin
      .from("qr_codes")
      .insert(qrRows);

    if (qrError) return { error: qrError.message };
  }

  if (adminEmail) {
    try {
      await inviteCampaignAdmin(campaign.id, adminEmail);
    } catch (err) {
      return {
        error: `Campanha criada, mas o convite do admin falhou: ${
          (err as Error).message
        }. Tente convidar novamente pela página da campanha.`,
      };
    }
  }

  redirect(`/admin/${campaign.slug}`);
}
