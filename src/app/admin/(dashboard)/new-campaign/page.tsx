import { assertSuperadmin } from "@/lib/admin";
import { CampaignForm } from "../components/campaign-form";

export default async function NovaCampanhaPage() {
  await assertSuperadmin();

  return (
    <div className="flex w-full flex-1 flex-col p-6 lg:p-10">
      <CampaignForm />
    </div>
  );
}
