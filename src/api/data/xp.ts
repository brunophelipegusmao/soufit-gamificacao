import "server-only";
import { supabase } from "./supabase";

export async function creditXp({
  user_id,
  mission_id,
  qr_code_id,
  points,
}: {
  user_id: string;
  mission_id: string;
  qr_code_id?: string;
  points: number;
}) {
  const { error } = await supabase.from("xp_logs").insert({
    user_id,
    mission_id,
    qr_code_id: qr_code_id ?? null,
    points,
  });

  if (error) throw new Error(error.message);
}

export async function hasScannedToday(user_id: string, qr_code_id: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("xp_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("qr_code_id", qr_code_id)
    .gte("created_at", today.toISOString());

  return (count ?? 0) > 0;
}

export async function getRanking(campaign_id: string) {
  const { data, error } = await supabase
    .from("campaign_ranking")
    .select("*")
    .eq("campaign_id", campaign_id)
    .order("position", { ascending: true })
    .limit(50);

  if (error) throw new Error(error.message);
  return data;
}
