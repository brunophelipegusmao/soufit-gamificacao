import { Card } from "@/components/ui/card";
import { LoginHero } from "./login-hero";
import { LoginPanel } from "./login-panel";

export function LoginScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8">
      <Card className="w-full max-w-6xl flex-col gap-0 rounded-2xl py-0 lg:min-h-[80vh] lg:flex-row">
        <LoginHero />
        <LoginPanel />
      </Card>
    </div>
  );
}
