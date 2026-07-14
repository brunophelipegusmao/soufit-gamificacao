import { redirect } from "next/navigation";
import { verifySession, isSuperadmin, getCampaignsForUser } from "@/lib/admin";
import { CampaignSection } from "@/app/admin/(dashboard)/components/campaign-section";

export default async function AdminDashboardPage() {
  const { supabase, user } = await verifySession();
  const superadmin = await isSuperadmin(supabase, user.id);
  const campaigns = await getCampaignsForUser();

  if (!superadmin && campaigns.length === 1) {
    redirect(`/admin/${campaigns[0].slug}`);
  }

  const active = campaigns.filter((c) => c.active);
  const inactive = campaigns.filter((c) => !c.active);

  return (
    <div className="flex flex-1 flex-col gap-10 p-6 lg:p-10">
      <div>
        <h1 className="text-2xl font-semibold">Campanhas</h1>
        <p className="text-sm text-muted-foreground">
          {superadmin
            ? "Todas as campanhas da plataforma."
            : "Campanhas que você administra."}
        </p>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Você ainda não tem acesso a nenhuma campanha. Fale com quem te
          convidou.
        </p>
      ) : (
        <>
          <CampaignSection
            title="Ativas"
            campaigns={active}
            emptyLabel="Nenhuma campanha ativa."
          />
          <CampaignSection
            title="Desativadas"
            campaigns={inactive}
            emptyLabel="Nenhuma campanha desativada."
          />
        </>
      )}
    </div>
  );
}
