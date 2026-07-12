import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession, isSuperadmin, getCampaignsForUser } from "@/lib/admin";
import { logout } from "@/actions/logout";

export default async function AdminHomePage() {
  const { supabase, user } = await verifySession();
  const superadmin = await isSuperadmin(supabase, user.id);

  if (superadmin) redirect("/admin/new-campaign");

  const campaigns = await getCampaignsForUser();

  if (campaigns.length === 1) {
    redirect(`/admin/${campaigns[0].slug}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Campanhas
        </h1>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Sair
          </button>
        </form>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Você ainda não tem acesso a nenhuma campanha. Fale com quem te convidou.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/admin/${campaign.slug}`}
                className="block rounded-md border border-zinc-200 px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {campaign.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
