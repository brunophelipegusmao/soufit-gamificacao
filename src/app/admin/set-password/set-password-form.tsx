"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase-browser";
import { Field } from "@/components/ui/field";
import { useUpdatePasswordMutation } from "@/hooks/mutations/use-update-password-mutation";

const setPasswordSchema = z.object({
  password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres."),
});

type SetPasswordInput = z.infer<typeof setPasswordSchema>;

export function SetPasswordForm() {
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordInput>({ resolver: zodResolver(setPasswordSchema) });

  const { mutate, isPending, error } = useUpdatePasswordMutation();

  useEffect(() => {
    // O client (@supabase/ssr) é fixo em flowType "pkce", mas o link de
    // convite/recovery gerado pela Admin API usa o formato antigo (implicit
    // grant, tokens no #hash). O auth-js rejeita esse hash automaticamente
    // por causa desse descompasso de flow ("Not a valid PKCE flow url."), então
    // extraímos os tokens do hash na mão e chamamos setSession diretamente,
    // sem depender da detecção automática (detectSessionInUrl).
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");

    async function establishSession() {
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (!error) {
          window.history.replaceState(null, "", window.location.pathname);
          setReady(true);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setReady(!!session);
      if (!session) setSessionError("Link inválido ou expirado.");
    }

    establishSession();
  }, [supabase]);

  if (!ready) {
    return (
      <p className="text-sm text-zinc-500">
        {sessionError ?? "Verificando link..."}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data.password))}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Defina sua senha
      </h1>

      <Field label="Senha" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          {...register("password")}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-zinc-900 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending ? "Salvando..." : "Salvar e entrar"}
      </button>
    </form>
  );
}
