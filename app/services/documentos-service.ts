// app/services/documentos-service.ts
"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type Documento = {
  id: string
  titulo: string
  descripcion: string
  tipo: 'general' | 'personal'
  archivo_url?: string
  nombre_archivo?: string
  creado_por: string
  created_at?: string
  updated_at?: string
  creador?: {
    nombre?: string
    apellido?: string
    email?: string
  }
  empleados?: {
    id: string
    nombre?: string
    apellido?: string
    email?: string
  }[]
}

export type DocumentoFormData = {
  titulo: string
  descripcion: string
  tipo: 'general' | 'personal'
  empleados_ids?: string[] // IDs de empleados seleccionados para documentos personales
  archivo?: File | null
}

export const DocumentosService = {
  // Obtener todos los documentos
  async getDocumentos(): Promise<Documento[]> {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error al obtener documentos:", error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.error("Error al obtener documentos:", err)
      return []
    }
  },

  // Obtener documentos generales
  async getDocumentosGenerales(): Promise<Documento[]> {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .eq("tipo", "general")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error al obtener documentos generales:", error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.error("Error al obtener documentos generales:", err)
      return []
    }
  },

  // Obtener documentos personales
  async getDocumentosPersonales(): Promise<Documento[]> {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email),
          empleados:documentos_empleados(empleado:profiles(id, nombre, apellido, email))
        `)
        .eq("tipo", "personal")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error al obtener documentos personales:", error.message)
        return []
      }

      // Transformar los datos para que sean más fáciles de usar
      const documentosFormateados = data.map(doc => {
        const empleados = doc.empleados?.map(e => ({
          id: e.empleado.id,
          nombre: e.empleado.nombre,
          apellido: e.empleado.apellido,
          email: e.empleado.email
        })) || []

        return {
          ...doc,
          empleados
        }
      })

      return documentosFormateados || []
    } catch (err) {
      console.error("Error al obtener documentos personales:", err)
      return []
    }
  },

  // Obtener documentos para un empleado específico
  async getDocumentosParaEmpleado(empleadoId: string): Promise<Documento[]> {
    const supabase = createClientComponentClient()
    try {
      // Primero obtenemos todos los documentos generales
      const { data: documentosGenerales, error: errorGenerales } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .eq("tipo", "general")
        .order("created_at", { ascending: false });

      if (errorGenerales) {
        console.error("Error al obtener documentos generales:", errorGenerales.message)
        return [];
      }
      // Obtenemos los IDs de los documentos personales asignados al empleado
      const { data: documentosPersonalesIds, error: errorPersonalesIds } = await supabase
        .from("documentos_empleados")
        .select("documento_id")
        .eq("empleado_id", empleadoId);

      if (errorPersonalesIds) {
        console.error("Error al obtener IDs de documentos personales:", errorPersonalesIds.message);
        return documentosGenerales || [];
      }

      const documentoIds = documentosPersonalesIds.map((doc) => doc.documento_id);

      // Luego obtenemos los documentos personales asignados al empleado
      const { data: documentosPersonales, error: errorPersonales } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .eq("tipo", "personal")
        .in("id", documentoIds)
        .order("created_at", { ascending: false });

      if (errorPersonales) {
        console.error("Error al obtener documentos personales:", errorPersonales.message)
        return documentosGenerales || [];
      }

      // Combinamos ambos conjuntos de documentos
      return [...(documentosGenerales || []), ...(documentosPersonales || [])];
    } catch (err) {
      console.error("Error al obtener documentos para empleado:", err)
      return [];
    }
  },

  // Obtener un documento por ID
  async getDocumentoById(id: string): Promise<Documento | null> {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error al obtener documento:", error)
        return null
      }

      // Si es un documento personal, obtener los empleados asignados
      if (data.tipo === 'personal') {
        const { data: empleadosData, error: empleadosError } = await supabase
        .from("documentos_empleados")
        .select(`
          empleado:profiles(id, nombre, apellido, email)
        `)
        .eq("documento_id", id);      

        console.log(empleadosData);

        if (!empleadosError && empleadosData) {
          data.empleados = empleadosData.map(e => ({
            id: e.empleado.id,   
            nombre: e.empleado.nombre,
            apellido: e.empleado.apellido,
            email: e.empleado.email,
          }))
        }        
      }

      return data
    } catch (err) {
      console.error("Error al obtener documento:", err)
      return null
    }
  },

  // Crear un nuevo documento
  async createDocumento(
    formData: DocumentoFormData,
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
        // Usar la carpeta "documentos/" para los archivos
        const filePath = `documentos/${fileName}`

        // Guardar el nombre original del archivo
        nombreArchivo = formData.archivo.name

        const { error: uploadError } = await supabase.storage.from("archivos-intra").upload(filePath, formData.archivo)
        
        if (uploadError) throw uploadError

        // Generar URL firmada solo si el archivo se subió con éxito
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("archivos-intra")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 años de duración

        if (signedUrlError) throw signedUrlError;

        archivoUrl = signedUrlData?.signedUrl;
      }

      // Crear el documento en la base de datos
      const { data, error } = await supabase
        .from("documentos")
        .insert([
            {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          archivo_url: archivoUrl,
          nombre_archivo: nombreArchivo,
          creado_por: userId,
        }
    ])
        .select()

      if (error) throw error

      const documentoId = data[0].id

      // Si es un documento personal, asignar a los empleados seleccionados
      if (formData.tipo === 'personal' && formData.empleados_ids && formData.empleados_ids.length > 0) {
        const asignaciones = formData.empleados_ids.map(empleadoId => ({
          documento_id: documentoId,
          empleado_id: empleadoId
        }))

        const { error: asignacionError } = await supabase
          .from("documentos_empleados")
          .insert(asignaciones)

        if (asignacionError) throw asignacionError
      }

      return {
        success: true,
        message: "Documento creado correctamente",
        id: documentoId,
      }
    } catch (error: any) {
      console.error("Error al crear documento:", error)
      return {
        success: false,
        message: error.message || "Error al crear el documento",
      }
    }
  },

  // Actualizar un documento existente
  async updateDocumento(id: string, formData: DocumentoFormData): Promise<{ success: boolean; message: string }> {
    const supabase = createClientComponentClient()

    try {
      // Obtener el documento actual para verificar si hay cambios en el archivo
      const { data: documentoActual } = await supabase
        .from("documentos")
        .select("archivo_url, nombre_archivo")
        .eq("id", id)
        .single()

      let archivoUrl = documentoActual?.archivo_url || null
      let nombreArchivo = documentoActual?.nombre_archivo || null

      // Si hay un nuevo archivo, subirlo
      if (formData.archivo) {
        const fileExt = formData.archivo.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `documentos/${fileName}`
      
        nombreArchivo = formData.archivo.name
      
        const { error: uploadError } = await supabase.storage
          .from("archivos-intra")
          .upload(filePath, formData.archivo)
      
        if (uploadError) throw uploadError
      
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("archivos-intra")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 años de duración
      
        if (signedUrlError) throw signedUrlError
      
        archivoUrl = signedUrlData?.signedUrl
      }

      // Actualizar el documento
      const { error } = await supabase
        .from("documentos")
        .update({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          archivo_url: archivoUrl,
          nombre_archivo: nombreArchivo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Si es un documento personal, actualizar las asignaciones de empleados
      if (formData.tipo === 'personal') {
        // Primero eliminar todas las asignaciones existentes
        const { error: deleteError } = await supabase
          .from("documentos_empleados")
          .delete()
          .eq("documento_id", id)

        if (deleteError) throw deleteError

        // Luego crear las nuevas asignaciones
        if (formData.empleados_ids && formData.empleados_ids.length > 0) {
          const asignaciones = formData.empleados_ids.map(empleadoId => ({
            documento_id: id,
            empleado_id: empleadoId
          }))

          const { error: asignacionError } = await supabase
            .from("documentos_empleados")
            .insert(asignaciones)

          if (asignacionError) throw asignacionError
        }
      }

      return {
        success: true,
        message: "Documento actualizado correctamente",
      }
    } catch (error: any) {
      console.error("Error al actualizar documento:", error)
      return {
        success: false,
        message: error.message || "Error al actualizar el documento",
      }
    }
  },

  // Eliminar un documento
  async deleteDocumento(id: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClientComponentClient()

    try {
      // Primero obtener la URL del archivo para eliminarlo si existe
      const { data: documento } = await supabase.from("documentos").select("archivo_url").eq("id", id).single()

      // Eliminar el archivo si existe
      if (documento?.archivo_url) {
        // Extraer la ruta del archivo de la URL
        const urlParts = documento.archivo_url.split("/")
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `documentos/${fileName}`

        await supabase.storage.from("archivos-intra").remove([filePath])
      }

      // Eliminar las asignaciones de empleados si existen
      await supabase.from("documentos_empleados").delete().eq("documento_id", id)

      // Eliminar el documento
      const { error } = await supabase.from("documentos").delete().eq("id", id)

      if (error) throw error

      return {
        success: true,
        message: "Documento eliminado correctamente",
      }
    } catch (error: any) {
      console.error("Error al eliminar documento:", error)
      return {
        success: false,
        message: error.message || "Error al eliminar el documento",
      }
    }
  },

  // Buscar documentos
  async buscarDocumentos(termino: string): Promise<Documento[]> {
    const supabase = createClientComponentClient()
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .or(`titulo.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error al buscar documentos:", error.message)
        return []
      }

      return data || []
    } catch (err) {
      console.error("Error al buscar documentos:", err)
      return []
    }
  }
}