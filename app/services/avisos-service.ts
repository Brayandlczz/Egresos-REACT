// app/services/avisos-service.ts
"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type Aviso = {
  id: string
  titulo: string
  descripcion: string
  fecha_publicacion: string
  archivo_url?: string
  nombre_archivo?: string
  creado_por: string
  created_at?: string
  updated_at?: string
  creador?: {
    nombre?: string
    email?: string
  }
}

export type AvisoFormData = {
  titulo: string
  descripcion: string
  fecha_publicacion: string
  archivo?: File | null
}

export const AvisosService = {
  // Obtener todos los avisos
  async getAvisos(): Promise<Aviso[]> {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from("avisos")
        .select(`
          *,
          creador:profiles(nombre, email)
        `)
        .order("fecha_publicacion", { ascending: false })

      if (error) {
        console.error("Error al obtener avisos:", error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.error("Error al obtener avisos:", err)
      return []
    }
  },

  // Obtener un aviso por ID
  async getAvisoById(id: string): Promise<Aviso | null> {
    const supabase = createClientComponentClient()
    const { data, error } = await supabase
      .from("avisos")
      .select(`
        *,
        creador:profiles(nombre, email)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error al obtener aviso:", error)
      return null
    }

    return data
  },

  // Crear un nuevo aviso
  async createAviso(
    formData: AvisoFormData,
    userId: string,
  ): Promise<{ success: boolean; message: string; id?: string }> {
    const supabase = createClientComponentClient()
    let archivoUrl = null
    let nombreArchivo = null

    try {
      // Si hay un archivo, subirlo primero
      if (formData.archivo) {
        const fileExt = formData.archivo.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        // Usar la carpeta "avisos/" para los archivos
        const filePath = `avisos/${fileName}`

        // Guardar el nombre original del archivo
        nombreArchivo = formData.archivo.name

        const { error: uploadError } = await supabase.storage.from("archivos-intra").upload(filePath, formData.archivo)

        if (uploadError) throw uploadError

        // Obtener la URL del archivo
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("archivos-intra")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 años de duración
      
      if (signedUrlError) throw signedUrlError;
      
      archivoUrl = signedUrlData?.signedUrl;
      }
      // Crear el aviso en la base de datos
      const { data, error } = await supabase
        .from("avisos")
        .insert([
          {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_publicacion: formData.fecha_publicacion,
          archivo_url: archivoUrl,
          nombre_archivo: nombreArchivo, 
          creado_por: userId,
        }
      ])
        .select()

      if (error) throw error

      return {
        success: true,
        message: "Aviso creado correctamente",
        id: data[0].id || null, // Evita errores si `data` es undefined 
      };
    } catch (error: any) {
      console.error("Error al crear aviso:", error)
      return {
        success: false,
        message: error.message || "Error al crear el aviso",
      }
    }
  },

  // Actualizar un aviso existente
  async updateAviso(id: string, formData: AvisoFormData): Promise<{ success: boolean; message: string }> {
    const supabase = createClientComponentClient()

    try {
      // Obtener el aviso actual para verificar si hay cambios en el archivo
      const { data: avisoActual } = await supabase
        .from("avisos")
        .select("archivo_url, nombre_archivo")
        .eq("id", id)
        .single()

      let archivoUrl = avisoActual?.archivo_url || null
      let nombreArchivo = avisoActual?.nombre_archivo || null

      // Si hay un nuevo archivo, subirlo
      if (formData.archivo) {
        const fileExt = formData.archivo.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        // Usar la carpeta "avisos/" para los archivos
        const filePath = `avisos/${fileName}`

        // Guardar el nombre original del archivo
        nombreArchivo = formData.archivo.name

        const { error: uploadError } = await supabase.storage.from("archivos-intra").upload(filePath, formData.archivo)

        if (uploadError) throw uploadError

        // Obtener la URL del archivo
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("archivos-intra")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 años de duración
      
      if (signedUrlError) throw signedUrlError;
      
      archivoUrl = signedUrlData?.signedUrl;
      }      

      // Actualizar el aviso
      const { error } = await supabase
        .from("avisos")
        .update({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          fecha_publicacion: formData.fecha_publicacion,
          archivo_url: archivoUrl,
          nombre_archivo: nombreArchivo, 
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      return {
        success: true,
        message: "Aviso actualizado correctamente",
      }
    } catch (error: any) {
      console.error("Error al actualizar aviso:", error)
      return {
        success: false,
        message: error.message || "Error al actualizar el aviso",
      }
    }
  },

  // Eliminar un aviso
  async deleteAviso(id: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClientComponentClient()

    try {
      // Primero obtener la URL del archivo para eliminarlo si existe
      const { data: aviso } = await supabase.from("avisos").select("archivo_url").eq("id", id).single()

      // Eliminar el archivo si existe
      if (aviso?.archivo_url) {
        // Extraer la ruta del archivo de la URL
        const urlParts = aviso.archivo_url.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `avisos/${fileName}`

        await supabase.storage.from("archivos-intra").remove([filePath])
      }

      // Eliminar el aviso
      const { error } = await supabase.from("avisos").delete().eq("id", id)

      if (error) throw error

      return {
        success: true,
        message: "Aviso eliminado correctamente",
      }
    } catch (error: any) {
      console.error("Error al eliminar aviso:", error)
      return {
        success: false,
        message: error.message || "Error al eliminar el aviso",
      }
    }
  },
}

