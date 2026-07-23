import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaignBySlug } from "@/api/data/campaigns";

type Params = Promise<{ campaign_slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { campaign_slug } = await params;
  const campaign = await getCampaignBySlug(campaign_slug);

  if (!campaign) return {};

  return {
    title: campaign.title,
    description: campaign.brand_name,
  };
}

export default async function CampaignPage({ params }: { params: Params }) {
  const { campaign_slug } = await params;
  const campaign = await getCampaignBySlug(campaign_slug);

  if (!campaign) notFound();

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center"
      style={{ "--brand": campaign.primary_color } as React.CSSProperties}
    >
      {campaign.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={campaign.logo_url}
          alt={campaign.brand_name}
          className="h-16 w-auto object-contain"
        />
      ) : (
        <span className="text-lg font-semibold text-[var(--brand)]">
          {campaign.brand_name}
        </span>
      )}

      <h1 className="max-w-md text-4xl font-bold tracking-tight text-[var(--brand)]">
        {campaign.title}
      </h1>

      <Link
        href={`/${campaign.slug}/cadastro`}
        className="rounded-full bg-[var(--brand)] px-8 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
      >
        Participar
      </Link>
    </div>
  );
}
