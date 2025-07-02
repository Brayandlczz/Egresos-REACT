"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginStatus, setLoginStatus] = useState<"idle" | "success" | "error">("idle")
  const [showSupportModal, setShowSupportModal] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setLoginStatus("idle")

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      setLoginStatus("success")
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 800)
    } catch (error: any) {
      let msg = error.message || "Error al iniciar sesión"
      if (msg === "Invalid login credentials") {
        msg = "Correo o contraseña incorrectos"
      }
      setError(msg)
      setLoginStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const buttonClass =
    loginStatus === "success"
      ? "bg-green-600 hover:bg-green-700"
      : loginStatus === "error"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700"

  const buttonText =
    isLoading
      ? "Iniciando sesión..."
      : loginStatus === "success"
      ? "Login exitoso...¡Bienvenido!"
      : loginStatus === "error"
      ? "Login fallido...¡Intenta nuevamente!"
      : "Iniciar sesión"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-10 min-h-[500px]">
        <div className="flex justify-center mb-3">
          <Image src="/uniciflama.webp" alt="Logo" width={30} height={30} />
        </div>

        <h3 className="text-center text-2xl font-bold mb-3">Bienvenido(a)</h3>

        {error && (
          <div className="alert alert-danger text-sm mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md px-3 py-2 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="block text-sm text-center font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control w-full rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="block text-sm text-center font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control w-full rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-3 flex items-center">
            <input type="checkbox" id="remember" className="mr-2 accent-blue-600" />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Recordar sesión
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn w-full rounded-full font-medium py-2 shadow-sm text-white transition disabled:opacity-50 ${buttonClass}`}
          >
            {buttonText}
          </button>
        </form>

        <hr className="my-4 border-gray-300" />

        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer"
            onClick={() => setShowSupportModal(true)}
          >
            Contacta al administrador
          </span>
        </p>
      </div>

      {showSupportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-xs text-center shadow-lg">
            <h4 className="text-lg font-semibold mb-3">Soporte Técnico</h4>
            <p className="mb-4">Puedes contactar al administrador del sistema a través del correo:</p>
            <a
              href="mailto:sistemas@unici.edu.mx"
              className="text-blue-600 font-medium hover:underline mb-6 block"
            >
              sistemas@unici.edu.mx
            </a>
            <button
              onClick={() => setShowSupportModal(false)}
              className="mt-0 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
