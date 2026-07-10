"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export const updatePasswordMutationKey = ["update-password"] as const;

export function useUpdatePasswordMutation() {
  const router = useRouter();
  const supabase = createClient();

  return useMutation({
    mutationKey: updatePasswordMutationKey,
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      router.push("/admin");
    },
  });
}
