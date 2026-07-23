"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { setPrincipal } from "@/api/actions/set-principal-admin";
import type { SetPrincipalAdminInput } from "@/api/actions/set-principal-admin/schema";

export const setPrincipalAdminMutationKey = ["set-principal-admin"] as const;

export function useSetPrincipalAdminMutation(campaignSlug: string) {
  const router = useRouter();

  return useMutation({
    mutationKey: setPrincipalAdminMutationKey,
    mutationFn: (input: SetPrincipalAdminInput) =>
      setPrincipal(campaignSlug, input),
    onSuccess: () => {
      router.refresh();
    },
  });
}
