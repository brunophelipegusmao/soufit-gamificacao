import type { AdminCampaign } from "@/api/data/admin";
import { CampaignCard } from "./campaign-card";

export function CampaignSection({
  title,
  campaigns,
  emptyLabel,
}: {
  title: string;
  campaigns: AdminCampaign[];
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
