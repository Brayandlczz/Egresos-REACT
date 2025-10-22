import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // --- Validar variables de entorno en tiempo de ejecución ---
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase env vars:", {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
      });
      return NextResponse.json(
        { error: "Configuración del servidor incompleta: faltan variables de Supabase." },
        { status: 500 }
      );
    }
    // ----------------------------------------------------------

    // Crear el cliente **aquí** (dentro del handler) — evita que Next lo ejecute en build time
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
    });

    if (error) {
      console.error("Error creando usuario en Supabase:", error);
      return NextResponse.json({ error: error.message ?? "Error al crear usuario" }, { status: 400 });
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (err: any) {
    console.error("Error en /api/usuarios/crear:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
