"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/actions/create-campaign";
import type { CreateCampaignInput } from "@/actions/create-campaign/schema";

export const createCampaignMutationKey = ["create-campaign"] as const;

export function useCreateCampaignMutation() {
  const router = useRouter();

  return useMutation({
    mutationKey: createCampaignMutationKey,
    mutationFn: (input: CreateCampaignInput) => createCampaign(input),
    onSuccess: (data) => {
      router.push(`/admin/${data.slug}`);
    },
  });
}
