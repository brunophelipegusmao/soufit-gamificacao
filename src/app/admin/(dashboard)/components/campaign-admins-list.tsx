"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useRemoveCampaignAdminMutation } from "@/hooks/mutations/use-remove-campaign-admin-mutation";
import { useSetPrincipalAdminMutation } from "@/hooks/mutations/use-set-principal-admin-mutation";
import type { CampaignAdminWithEmail } from "@/lib/admin";

export function CampaignAdminsList({
  admins,
  campaignId,
  campaignSlug,
}: {
  admins: CampaignAdminWithEmail[];
  campaignId: string;
  campaignSlug: string;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const removeMutation = useRemoveCampaignAdminMutation(campaignSlug);
  const setPrincipalMutation = useSetPrincipalAdminMutation(campaignSlug);

  const error = removeMutation.error ?? setPrincipalMutation.error;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Admins desta campanha</h2>
        <span className="text-sm text-zinc-500">{admins.length} de 3</span>
      </div>

      {admins.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum admin ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2">
                <span>{admin.email ?? admin.user_id}</span>
                {admin.is_principal && <Badge variant="outline">Principal</Badge>}
              </div>

              {!admin.is_principal && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={setPrincipalMutation.isPending}
                    onClick={() => {
                      setPendingId(admin.id);
                      setPrincipalMutation.mutate({
                        campaign_id: campaignId,
                        admin_id: admin.id,
                      });
                    }}
                    className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-zinc-400"
                  >
                    Tornar principal
                  </button>
                  <button
                    type="button"
                    disabled={removeMutation.isPending}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Remover ${admin.email ?? admin.user_id} desta campanha?`,
                        )
                      ) {
                        return;
                      }
                      setPendingId(admin.id);
                      removeMutation.mutate({
                        campaign_id: campaignId,
                        admin_id: admin.id,
                      });
                    }}
                    className="text-xs font-medium text-red-600 underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && pendingId && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}
