import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Rutas protegidas (donde SÍ se requiere sesión)
  const protectedRoutes = ["/dashboard", "/perfil", "/admin", "/periodos", "/cuentas", "/planteles", "/facturas", "/conceptos",  "/users"]
  const pathname = req.nextUrl.pathname

  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Solo verificar sesión si la ruta es protegida o raíz
  let session = null
  if (isProtected || pathname === "/") {
    const supabase = createMiddlewareClient({ req, res })
    const result = await supabase.auth.getSession()
    session = result.data.session

    // Redirigir si no hay sesión en ruta protegida
    if (!session && isProtected) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      return NextResponse.redirect(redirectUrl)
    }

    // Redirigir si ya hay sesión y está en la raíz (página de login)
    if (session && pathname === "/") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    // (Opcional) Headers de depuración
    res.headers.set("x-auth-status", session ? "authenticated" : "unauthenticated")
  }

  return res
}

// Solo aplicar el middleware a rutas donde pueda ser relevante
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
