import { assertCampaignAccess, listCampaignAdmins } from "@/lib/admin";
import { InviteAdminForm } from "./invite-admin-form";

type Params = Promise<{ campaign_slug: string }>;

export default async function CampaignAdminPage({
  params,
}: {
  params: Params;
}) {
  const { campaign_slug } = await params;
  const { supabase, campaign, isSuperadmin } =
    await assertCampaignAccess(campaign_slug);

  const admins = isSuperadmin
    ? await listCampaignAdmins(supabase, campaign.id)
    : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {campaign.title}
        </h1>
        <p className="text-sm text-zinc-500">{campaign.brand_name}</p>
      </div>

      {isSuperadmin && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Admins desta campanha</h2>

          {admins.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum admin ainda.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {admins.map((admin) => (
                <li key={admin.id}>{admin.email ?? admin.user_id}</li>
              ))}
            </ul>
          )}

          <InviteAdminForm campaignId={campaign.id} campaignSlug={campaign.slug} />
        </section>
      )}
    </div>
  );
}
