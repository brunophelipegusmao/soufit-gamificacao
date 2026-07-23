"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { useInviteAdminMutation } from "@/hooks/mutations/use-invite-admin-mutation";
import {
  inviteAdminSchema,
  type InviteAdminInput,
} from "@/api/actions/invite-admin/schema";

export function InviteAdminForm({
  campaignId,
  campaignSlug,
}: {
  campaignId: string;
  campaignSlug: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteAdminInput>({ resolver: zodResolver(inviteAdminSchema) });

  const { mutate, isPending, error, data } = useInviteAdminMutation(
    campaignId,
    campaignSlug,
  );

  return (
    <form
      onSubmit={handleSubmit((input) => mutate(input, { onSuccess: () => reset() }))}
      className="flex flex-wrap items-end gap-3"
    >
      <Field
        label="Convidar admin (email)"
        htmlFor="email"
        error={errors.email?.message}
      >
        <input
          id="email"
          type="email"
          placeholder="admin@academia.com"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          {...register("email")}
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending ? "Convidando..." : "Convidar"}
      </button>

      {error && <p className="w-full text-sm text-red-600">{error.message}</p>}
      {data?.success && (
        <p className="w-full text-sm text-green-600">{data.success}</p>
      )}
    </form>
  );
}
