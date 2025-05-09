"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from 'next/navigation'

interface Announcement {
  id: number
  titulo: string
  fecha_publicacion: string
}

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchRecentAnnouncements()
  }, [])

  async function fetchRecentAnnouncements() {
    const { data, error } = await supabase
      .from("avisos")
      .select("id, titulo, fecha_publicacion")
      .order("fecha_publicacion", { ascending: false })
      .limit(3) 

    if (!error && data) {
      setAnnouncements(data)
    } else {
      console.error("Error al obtener avisos:", error)
    }
  }

  const handleViewMore = (id: number) => {
    router.push(`/avisos/`) 
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Panel Principal</h1>
      <p className="text-center">Bienvenido a la red interna UNICI. Selecciona una opción del menú lateral para comenzar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2 text-center">Avisos recientes</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center">No hay avisos disponibles</p>
          ) : (
            <ul className="space-y-2">
              {announcements.map((a) => (
                <li key={a.id} className="border-b pb-2">
                  <p className="font-medium text-left">{a.titulo}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(a.fecha_publicacion + "T00:00:00"), "dd/MM/yyyy", { locale: es })}
                  </p>
                  <div className="mt-1 text-right">
                    <button
                      onClick={() => handleViewMore(a.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver más
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2 text-center">Próximos eventos</h2>
          <p className="text-gray-600 text-center">No hay eventos próximos</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-2 text-center">Solicitudes pendientes</h2>
          <p className="text-gray-600 text-center">No hay solicitudes pendientes</p>
        </div>
      </div>
    </div>
  )
}
