"use client"

import { useState, useRef } from "react"
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

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const normalizeEmail = (s: string) =>
    s.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    setLoginStatus("idle")

    const normalizedEmail = normalizeEmail(email)
    if (normalizedEmail !== email) setEmail(normalizedEmail)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (error) throw error

      setLoginStatus("success")
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 800)
    } catch (err: any) {
      const msg =
        err?.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos"
          : err?.message || "Error al iniciar sesión"

      setError(msg)
      setLoginStatus("error")

      setPassword("")
      setTimeout(() => passInputRef.current?.focus(), 0)
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
      ? "Validando…"
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

        <h3 className="text-center text-2xl font-semibold mb-3">Bienvenido(a)</h3>

        {error && (
          <div
            className="text-sm mb-4 bg-red-100 text-red-700 border border-red-300 rounded-md px-3 py-2 text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3" aria-live="polite">
          <div>
            <label htmlFor="email" className="block text-sm text-center font-medium mb-2">
              Correo electrónico
            </label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full text-center rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-center font-medium mb-2">
              Contraseña
            </label>
            <input
              ref={passInputRef}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full text-center rounded-full border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          <div className="mb-1 flex items-center justify-center gap-2">
            <input type="checkbox" id="remember" className="accent-blue-600" disabled={isLoading} />
            <label htmlFor="remember" className="text-sm text-gray-700">
              Recordar sesión
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-full font-medium py-2 shadow-sm text-white transition disabled:opacity-60 flex items-center justify-center gap-2 ${buttonClass}`}
            aria-busy={isLoading}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                />
              </svg>
            )}
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
            Contacta al administrador.
          </span>
        </p>
      </div>

      {showSupportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-xs text-center shadow-lg">
            <h4 className="text-lg font-light mb-3">Soporte Técnico</h4>
            <p className="mb-4">Puedes contactar al administrador del sistema a través del correo:</p>
            <a className="text-blue-600 font-medium hover:underline mb-6 block">
              sistemas@unici.edu.mx
            </a>
            <button
              onClick={() => setShowSupportModal(false)}
              className="mt-0 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-red-600 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
