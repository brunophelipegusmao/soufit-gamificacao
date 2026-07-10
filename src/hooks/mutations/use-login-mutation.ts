"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "@/actions/login";
import type { LoginInput } from "@/actions/login/schema";

export const loginMutationKey = ["login"] as const;

export function useLoginMutation() {
  const router = useRouter();

  return useMutation({
    mutationKey: loginMutationKey,
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => {
      router.push("/admin");
    },
  });
}
