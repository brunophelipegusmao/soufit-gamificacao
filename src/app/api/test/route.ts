import { getCampaignBySlug } from "@/lib/campaigns";
import { getMissionsByCampaign } from "@/lib/missions";
import { NextResponse } from "next/server";

export async function GET() {
  const campaign = await getCampaignBySlug("soufit-rio");
  if (!campaign)
    return NextResponse.json(
      { error: "campanha não encontrada" },
      { status: 404 },
    );

  const missions = await getMissionsByCampaign(campaign.id);

  return NextResponse.json({ campaign, missions });
}
