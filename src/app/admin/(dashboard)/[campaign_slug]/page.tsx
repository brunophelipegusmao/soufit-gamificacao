import { assertCampaignAccess } from "@/lib/admin";

type Params = Promise<{ campaign_slug: string }>;

export default async function CampaignAdminPage({
  params,
}: {
  params: Params;
}) {
  const { campaign_slug } = await params;
  const { campaign } = await assertCampaignAccess(campaign_slug);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {campaign.title}
        </h1>
        <p className="text-sm text-zinc-500">{campaign.brand_name}</p>
      </div>
    </div>
  );
}
