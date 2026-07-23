import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/api/data/admin";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/set-password"];

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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
