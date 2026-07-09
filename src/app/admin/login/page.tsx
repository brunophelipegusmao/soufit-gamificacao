import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/admin";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const { user } = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <LoginForm />
    </div>
  );
}
