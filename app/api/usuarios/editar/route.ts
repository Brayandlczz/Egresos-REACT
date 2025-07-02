import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, email, rol_id } = body

    console.log("Payload recibido:", { id, email, rol_id });

    if (!id || !email || !rol_id) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
    })

    if (authError) {
      console.log("Error al actualizar auth:", authError.message)
      return NextResponse.json({ error: "Error al actualizar el correo del usuario" }, { status: 400 })
    }

    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .update({ email, rol_id })
      .eq("id", id)

    if (dbError) {
      console.log("Error al actualizar rol:", dbError.message)
      return NextResponse.json({ error: "Error al actualizar el rol del usuario" }, { status: 400 })
    }

    return NextResponse.json({ message: "Usuario actualizado correctamente" }, { status: 200 })
  } catch (err: any) {
    console.log("Error catch:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
