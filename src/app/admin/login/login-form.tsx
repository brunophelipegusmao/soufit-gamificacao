"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/ui/field";
import { useLoginMutation } from "@/hooks/mutations/use-login-mutation";
import { loginSchema, type LoginInput } from "@/actions/login/schema";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending, error } = useLoginMutation();

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Painel administrativo
      </h1>

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          {...register("email")}
        />
      </Field>

      <Field label="Senha" htmlFor="password" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
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
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
