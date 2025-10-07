"use client"

import { useAuth } from "@/app/context/auth-context"

export default function DashboardPage() {
  const { nombre } = useAuth()

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6">
      <img
        src="/logounici.webp"
        alt="Logo UNICI"
        className="w-auto max-w-xs h-auto scale-75"
      />

      <h1 className="text-2xl font-bold text-blue-800 mb-2 text-center">
        ¡Bienvenid@, {nombre ? ` ${nombre}` : ""}!
      </h1>

      <p className="text-center text-gray-700 mb-6">
        Comienza a navegar dentro de los apartados para empezar a registrar facturas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        <a
          href="/planteles"
          className="p-6 rounded-lg shadow transition text-center hover:text-sky-500 hover:bg-sky-100"
        >
          <h2 className="font-semibold text-lg mb-2 text-blue-800">
            Registra un plantel
          </h2>
          <p className="text-gray-600">
            Agrega o modificar información de planteles
          </p>
        </a>

        <a
          href="/facturas"
          className="p-6 rounded-lg shadow transition text-center hover:text-sky-500 hover:bg-sky-100"
        >
          <h2 className="font-semibold text-lg mb-2 text-blue-800">
            Facturas de pago
          </h2>
          <p className="text-gray-600">
            Visualiza y registra facturas dentro del sistema
          </p>
        </a>

        <a
          href="/reportes"
          className="p-6 rounded-lg shadow transition text-center hover:text-sky-500 hover:bg-sky-100"
        >
          <h2 className="font-semibold text-lg mb-2 text-blue-800">
            Reportes de pago
          </h2>
          <p className="text-gray-600">Filtra y descarga reportes personalizados</p>
        </a>
      </div>
    </div>
  )
}
