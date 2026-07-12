import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";

const googleIconPath =
  "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z";

export function LoginPanel() {
  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-primary text-xs font-semibold tracking-widest uppercase bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
            Bem-vindo de volta
          </span>
          <h1 className="font-display font-black text-4xl leading-tight mb-3">
            Faça seu login
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Entre na sua conta para acessar eventos, rankings e desafios da
            sua academia.
          </p>
        </div>

        <LoginForm />

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-card text-muted-foreground">
              ou continue com
            </span>
          </div>
        </div>

        <div className="mb-8">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 border-white/10 py-3 h-auto"
          >
            <svg
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={googleIconPath} />
            </svg>
            Google
          </Button>
        </div>

        <div className="text-center">
          <Button type="button" variant="link" size="sm">
            Esqueceu sua senha?
          </Button>
        </div>

        <div className="lg:hidden mt-12 pt-12 border-t border-white/10 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <Image src="/logo.svg" alt="Logo" width={36} height={36} />
            <span className="font-display font-extrabold">
              EVENTS<span className="text-primary">FITNESS</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Events Fitness. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
