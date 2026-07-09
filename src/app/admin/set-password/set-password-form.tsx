"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export function SetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      if (!session) setError("Link inválido ou expirado.");
    }

    establishSession();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
  }

  if (!ready) {
    return (
      <p className="text-sm text-zinc-500">
        {error ?? "Verificando link..."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Defina sua senha
      </h1>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Senha
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-zinc-900 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {submitting ? "Salvando..." : "Salvar e entrar"}
      </button>
    </form>
  );
}
