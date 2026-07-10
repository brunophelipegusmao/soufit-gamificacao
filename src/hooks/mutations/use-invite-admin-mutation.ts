"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { inviteAdmin } from "@/actions/invite-admin";
import type { InviteAdminInput } from "@/actions/invite-admin/schema";

export const inviteAdminMutationKey = ["invite-admin"] as const;

export function useInviteAdminMutation(campaignId: string, campaignSlug: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: inviteAdminMutationKey,
    mutationFn: (input: InviteAdminInput) =>
      inviteAdmin(campaignId, campaignSlug, input),
    onSuccess: () => {
      router.refresh();
    },
  });
}
