import "server-only";
import { supabase } from "./supabase";

export async function getMissionByQrToken(token: string) {
  const { data, error } = await supabase
    .from("qr_codes")
    .select("*, missions(*)")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getMissionsByCampaign(campaign_id: string) {
  const { data } = await supabase
    .from("missions")
    .select("*")
    .eq("campaign_id", campaign_id)
    .eq("active", true)
    .order("xp_value", { ascending: false });

  return data ?? [];
}
