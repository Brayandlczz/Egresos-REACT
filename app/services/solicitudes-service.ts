"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type SolicitudVacacionesData = {
  empleado_id: string
  jefe_directo_id: string
  fecha_inicio: string
  fecha_fin: string
  dias_solicitados: number
  motivo?: string
}

export type SolicitudPermisosData = {
  empleado_id: string
  jefe_directo_id: string
  fecha_permiso: string
  hora_inicio: string
  hora_fin: string
  motivo: string
}

export type SolicitudRetardosData = {
  empleado_id: string
  jefe_directo_id: string
  fecha_retardo: string
  hora_llegada: string
  hora_establecida: string
  motivo?: string
}

export type SolicitudIncapacidadesData = {
  empleado_id: string
  jefe_directo_id: string
  fecha_inicio: string
  fecha_fin: string
  dias_incapacidad: number
  diagnostico?: string
  folio_incapacidad?: string
  archivo_url?: string
}

export type SolicitudCumpleanosData = {
  empleado_id: string
  jefe_directo_id: string
  fecha_cumpleanos: string
  fecha_dia_libre: string
  motivo?: string
}

export const SolicitudesService = {
  // Solicitudes de vacaciones
  async crearSolicitudVacaciones(data: SolicitudVacacionesData) {
    const supabase = createClientComponentClient()
    const { data: result, error } = await supabase.from("solicitudes_vacaciones").insert(data).select()

    if (error) throw error
    return { success: true, message: "Solicitud de vacaciones enviada correctamente", data: result }
  },

  // Solicitudes de permisos
  async crearSolicitudPermisos(data: SolicitudPermisosData) {
    const supabase = createClientComponentClient()
    const { data: result, error } = await supabase.from("solicitudes_permisos").insert(data).select()

    if (error) throw error
    return { success: true, message: "Solicitud de permiso enviada correctamente", data: result }
  },

  // Solicitudes de retardos
  async crearSolicitudRetardos(data: SolicitudRetardosData) {
    const supabase = createClientComponentClient()
    const { data: result, error } = await supabase.from("solicitudes_retardos").insert(data).select()

    if (error) throw error
    return { success: true, message: "Solicitud de retardo enviada correctamente", data: result }
  },

  // Solicitudes de incapacidades
  async crearSolicitudIncapacidades(data: SolicitudIncapacidadesData) {
    const supabase = createClientComponentClient()
    const { data: result, error } = await supabase.from("solicitudes_incapacidades").insert(data).select()

    if (error) throw error
    return { success: true, message: "Solicitud de incapacidad enviada correctamente", data: result }
  },

  // Solicitudes de cumpleaños
  async crearSolicitudCumpleanos(data: SolicitudCumpleanosData) {
    const supabase = createClientComponentClient()
    const { data: result, error } = await supabase.from("solicitudes_cumpleanos").insert(data).select()

    if (error) throw error
    return { success: true, message: "Solicitud de día de cumpleaños enviada correctamente", data: result }
  },
}

