import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, nombre } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
    })
  
    if (error) {
      console.log("Error supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (err: any) {
    console.log("Error catch:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
