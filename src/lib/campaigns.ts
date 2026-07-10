import "server-only";
import { supabase } from "./supabase";
import type { Campaign, Venue } from "@/types";

export async function getCampaignBySlug(
  slug: string,
): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getVenuesByCampaign(campaign_id: string) {
  const { data } = await supabase
    .from("campaign_venues")
    .select("venues(*)")
    .eq("campaign_id", campaign_id)
    .returns<{ venues: Venue }[]>();

  return data?.map((d) => d.venues) ?? [];
}
