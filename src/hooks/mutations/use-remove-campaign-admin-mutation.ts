"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { removeAdmin } from "@/actions/remove-campaign-admin";
import type { RemoveCampaignAdminInput } from "@/actions/remove-campaign-admin/schema";

export const removeCampaignAdminMutationKey = ["remove-campaign-admin"] as const;

export function useRemoveCampaignAdminMutation(campaignSlug: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: removeCampaignAdminMutationKey,
    mutationFn: (input: RemoveCampaignAdminInput) =>
      removeAdmin(campaignSlug, input),
    onSuccess: () => {
      router.refresh();
    },
  });
}
