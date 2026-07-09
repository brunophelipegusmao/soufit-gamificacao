import { assertSuperadmin } from "@/lib/admin";
import { CampaignForm } from "./campaign-form";

export default async function NovaCampanhaPage() {
  await assertSuperadmin();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Nova campanha
      </h1>
      <CampaignForm />
    </div>
  );
}
