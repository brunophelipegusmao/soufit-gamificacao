import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AdminCampaign } from "@/api/data/admin";

export function CampaignCard({ campaign }: { campaign: AdminCampaign }) {
  return (
    <Card className="p-0">
      <CardHeader className="flex-row items-center justify-between gap-3 border-b py-4">
        <div>
          <CardTitle>{campaign.title}</CardTitle>
          <CardDescription>{campaign.brand_name}</CardDescription>
        </div>
        <Badge variant={campaign.active ? "default" : "outline"}>
          {campaign.active ? "Ativa" : "Desativada"}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between py-4 text-sm text-muted-foreground">
        <span>
          {new Date(campaign.contract_starts_at).toLocaleDateString("pt-BR")} –{" "}
          {new Date(campaign.contract_ends_at).toLocaleDateString("pt-BR")}
        </span>
        <Link href={`/admin/${campaign.slug}`} className="text-primary hover:underline">
          Gerenciar →
        </Link>
      </CardContent>
    </Card>
  );
}
