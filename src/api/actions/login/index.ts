"use server";

import { createClient } from "@/lib/supabase-server";
import { loginSchema, type LoginInput } from "./schema";

export async function login(input: LoginInput) {
  const { email, password } = loginSchema.parse(input);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Email ou senha inválidos.");
  }

  return { ok: true as const };
}
