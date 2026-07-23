import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser, isAdminSessionExpired } from "@/api/data/admin";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/set-password"];
const ADMIN_ACTIVITY_COOKIE = "admin_last_activity";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Deploy de demonstração (Vercel project separado, DEMO_MODE=true): a área
  // admin fica invisível — 404 mesmo para quem tem sessão válida.
  if (process.env.DEMO_MODE === "true" && pathname.startsWith("/admin")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Checagem otimista (só cookie/sessão) — autorização real (superadmin,
  // acesso à campanha) fica na DAL em src/api/data/admin.ts, perto do dado.
  // O client em si não dá pra compartilhar (Edge exige request.cookies),
  // mas a query de sessão vem de lá via getAuthUser().
  const user = await getAuthUser(supabase);

  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) =>
    pathname.startsWith(p),
  );

  if (isAdminRoute && !isPublicAdminPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Timeout de inatividade de 15min (superadmin/campaign_admin) — sliding
  // window: qualquer request autenticado nessa área renova o cookie. Não
  // afeta o participante, que não passa por aqui (login próprio, sem
  // Supabase Auth — ver AUTENTICAÇÃO-PARTICIPANTE no CLAUDE.md).
  if (isAdminRoute && !isPublicAdminPath && user) {
    const lastActivity = request.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    if (isAdminSessionExpired(lastActivity)) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("expired", "1");
      const redirectResponse = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      redirectResponse.cookies.delete(ADMIN_ACTIVITY_COOKIE);
      return redirectResponse;
    }

    response.cookies.set(ADMIN_ACTIVITY_COOKIE, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
