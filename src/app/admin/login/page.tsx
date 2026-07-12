import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/admin";
import { LoginScreen } from "./components/login-screen";

export default async function LoginPage() {
  const { user } = await getSessionUser();
  if (user) redirect("/admin");

  return <LoginScreen />;
}
