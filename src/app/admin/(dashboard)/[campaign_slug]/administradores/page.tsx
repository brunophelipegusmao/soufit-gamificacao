import { assertCampaignAccess, listCampaignAdmins } from "@/api/data/admin";
import { CampaignAdminsList } from "@/app/admin/(dashboard)/components/campaign-admins-list";
import { InviteAdminForm } from "../../components/invite-admin-form";

type Params = Promise<{ campaign_slug: string }>;

export default async function CampaignAdminsPage({
  params,
}: {
  params: Params;
}) {
  const { campaign_slug } = await params;
  const { supabase, campaign, isSuperadmin } =
    await assertCampaignAccess(campaign_slug);

  const admins = await listCampaignAdmins(supabase, campaign.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Administradores
        </h1>
        <p className="text-sm text-zinc-500">{campaign.title}</p>
      </div>

      {isSuperadmin ? (
        <>
          <CampaignAdminsList
            admins={admins}
            campaignId={campaign.id}
            campaignSlug={campaign.slug}
          />

          {admins.length < 3 && (
            <InviteAdminForm
              campaignId={campaign.id}
              campaignSlug={campaign.slug}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-500">
          Somente superadmin pode gerenciar os administradores da campanha.
        </p>
      )}
    </div>
  );
}
