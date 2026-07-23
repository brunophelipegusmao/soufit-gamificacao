"use server";

import { assertSuperadmin } from "@/api/data/admin";
import { getSupabaseAdmin } from "@/api/clients/supabase-admin";
import { inviteCampaignAdmin } from "@/api/data/invite-admin";
import { createCampaignSchema, type CreateCampaignInput } from "./schema";

export async function createCampaign(input: CreateCampaignInput) {
  await assertSuperadmin();

  const {
    title,
    slug,
    brand_name,
    logo_url,
    primary_color,
    contract_starts_at,
    contract_ends_at,
    active,
    admin_email,
    venues,
    missions,
  } = createCampaignSchema.parse(input);

  const supabaseAdmin = getSupabaseAdmin();

  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from("campaigns")
    .insert({
      title,
      slug,
      brand_name,
      logo_url: logo_url || null,
      primary_color,
      contract_starts_at,
      contract_ends_at,
      active,
    })
    .select("id, slug")
    .single();

  if (campaignError || !campaign) {
    throw new Error(campaignError?.message ?? "Erro ao criar a campanha.");
  }

  const { data: insertedVenues, error: venuesError } = await supabaseAdmin
    .from("venues")
    .insert(venues.map((v) => ({ name: v.name, city: v.city, state: v.state })))
    .select("id, name");

  if (venuesError || !insertedVenues) {
    throw new Error(venuesError?.message ?? "Erro ao criar as academias.");
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
    throw new Error(campaignVenuesError.message);
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
    throw new Error(missionsError?.message ?? "Erro ao criar as missões.");
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

    if (qrError) throw new Error(qrError.message);
  }

  if (admin_email) {
    try {
      await inviteCampaignAdmin(campaign.id, admin_email, true);
    } catch (err) {
      throw new Error(
        `Campanha criada, mas o convite do admin falhou: ${
          (err as Error).message
        }. Tente convidar novamente pela página da campanha.`,
      );
    }
  }

  return { slug: campaign.slug };
}
