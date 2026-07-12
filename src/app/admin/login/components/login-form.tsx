"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, MailIcon } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/hooks/mutations/use-login-mutation";
import { loginSchema, type LoginInput } from "@/actions/login/schema";

export function LoginForm() {
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending, error } = useLoginMutation();

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="space-y-5 mb-8"
    >
      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <div className="relative">
          <MailIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="digite seu e-mail"
            className="pl-10"
            {...register("email")}
          />
        </div>
      </Field>

      <Field label="Senha" htmlFor="password" error={errors.password?.message}>
        <div className="relative">
          <LockIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10"
            {...register("password")}
          />
        </div>
      </Field>

      <label className="flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer">
        <Checkbox
          checked={remember}
          onCheckedChange={(checked) => setRemember(checked === true)}
        />
        Lembrar de mim
      </label>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-accent text-background py-3.5 h-auto font-bold hover:bg-primary green-glow disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
