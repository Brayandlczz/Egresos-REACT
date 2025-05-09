"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusIcon, TrashIcon, PencilIcon, FileIcon, DownloadIcon } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Definimos un tipo para el nuevo aviso
interface Announcement {
  titulo: string
  descripcion: string
  fecha_publicacion: string
}

export default function AdminAnnouncementsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([]) // Usar "any" hasta que tengamos una mejor definición del tipo de datos
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>({
    titulo: "",
    descripcion: "",
    fecha_publicacion: new Date().toISOString().split("T")[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase.from("avisos").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error al obtener avisos:", error)
        return
      }

      setAnnouncements(data || [])
    } catch (err) {
      console.error("Error al obtener avisos:", err)
    }
  }

  async function handleCreateAnnouncement() {
    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "No se pudo identificar al usuario",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("avisos")
        .insert([
          {
            titulo: newAnnouncement.titulo,
            descripcion: newAnnouncement.descripcion,
            fecha_publicacion: newAnnouncement.fecha_publicacion,
            creado_por: user.id,
          },
        ])
        .select()

      if (error) {
        console.error("Error al crear aviso:", error)
        toast({
          title: "Error",
          description: error.message || "Error al crear el aviso",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Éxito",
        description: "Aviso creado correctamente",
      })

      fetchAnnouncements()
      setIsCreateDialogOpen(false)

      setNewAnnouncement({
        titulo: "",
        descripcion: "",
        fecha_publicacion: new Date().toISOString().split("T")[0],
      })
    } catch (err) {
      console.error("Error al crear aviso:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el aviso",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteAnnouncement(id: number) {
    try {
      const { error } = await supabase.from("avisos").delete().eq("id", id)

      if (error) {
        console.error("Error al eliminar aviso:", error)
        toast({
          title: "Error",
          description: error.message || "Error al eliminar el aviso",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Éxito",
        description: "Aviso eliminado correctamente",
      })

      fetchAnnouncements()
    } catch (err) {
      console.error("Error al eliminar aviso:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el aviso",
        variant: "destructive",
      })
    }
  }

  function getFileExtension(filename: string) {
    return filename.split(".").pop()?.toLowerCase()
  }

  function getFileType(filename: string) {
    const ext = getFileExtension(filename)
    if (ext && ["pdf"].includes(ext)) return "PDF"
    if (ext && ["doc", "docx"].includes(ext)) return "Word"
    if (ext && ["xls", "xlsx"].includes(ext)) return "Excel"
    if (ext && ["jpg", "jpeg", "png", "gif"].includes(ext)) return "Imagen"
    return "Documento"
  }

  return (
    <div className="container mx-auto py-4">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold">Gestión de Avisos y Comunicados</h1>
          <Button
            onClick={() => router.push("/admin/avisos/nuevo")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" /> Crear Nuevo Aviso
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No hay avisos disponibles
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.titulo}</TableCell>
                  <TableCell>
                    {announcement.fecha_publicacion
                       ? format(new Date(announcement.fecha_publicacion + "T00:00:00"), "dd/MM/yyyy", { locale: es })
                       : "Fecha no disponible"}
                  </TableCell>
                  
                  <TableCell>
                    {announcement.archivo_url ? (
                      <a
                        href={announcement.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <FileIcon className="h-4 w-4" />
                        <span>
                          {announcement.nombre_archivo || `Documento ${getFileType(announcement.archivo_url)}`}
                        </span>
                        <DownloadIcon className="h-4 w-4 text-gray-400" />
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin archivo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/avisos/editar/${announcement.id}`)}
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Aviso</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newAnnouncement.titulo}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, titulo: e.target.value })}
                  placeholder="Ingrese el título del aviso"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newAnnouncement.descripcion}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, descripcion: e.target.value })}
                  placeholder="Ingrese la descripción del aviso"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha de Publicación</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={newAnnouncement.fecha_publicacion}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, fecha_publicacion: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAnnouncement}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creando..." : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
