import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Obtener la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/login", "/api", "/_next", "/favicon.ico", "/diagnostico", "/diagnostico-sesion"]

  // Asegurémonos de que el middleware permita el acceso a la ruta de directorio

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(
    (route) => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route),
  )

  // Verificar si es un archivo estático
  const isStaticFile = req.nextUrl.pathname.includes(".")

  // Agregar logs para depuración {comentado para mantener la terminal + limpia, *only testing*}
  console.log(`[Middleware] Ruta: ${req.nextUrl.pathname}, Autenticado: ${!!session}`)

  // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
  if (!session && !isPublicRoute && !isStaticFile) {
    console.log(`[Middleware] Redirigiendo a login desde: ${req.nextUrl.pathname}`)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado y está intentando acceder a la página de login
  if (session && req.nextUrl.pathname === "/") {
    console.log("[Middleware] Usuario autenticado redirigiendo a dashboard")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

