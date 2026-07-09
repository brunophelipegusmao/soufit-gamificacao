"use client";

import { useActionState } from "react";
import { inviteAdmin } from "./actions";

export function InviteAdminForm({
  campaignId,
  campaignSlug,
}: {
  campaignId: string;
  campaignSlug: string;
}) {
  const boundAction = inviteAdmin.bind(null, campaignId, campaignSlug);
  const [state, action, pending] = useActionState(boundAction, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Convidar admin (email)
        <input
          name="email"
          type="email"
          required
          placeholder="admin@academia.com"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Convidando..." : "Convidar"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="w-full text-sm text-green-600">{state.success}</p>
      )}
    </form>
  );
}
