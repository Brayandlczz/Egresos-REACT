"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export type SolicitudBaseProps = {
  title: string
  description: string
  children: React.ReactNode
  onSubmit: (formData: any) => Promise<{ success: boolean; message: string }>
  submitButtonText?: string
}

export function SolicitudFormBase({
  title,
  description,
  children,
  onSubmit,
  submitButtonText = "Enviar solicitud",
}: SolicitudBaseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const formValues: Record<string, any> = {}

      formData.forEach((value, key) => {
        formValues[key] = value
      })

      const result = await onSubmit(formValues)

      if (result.success) {
        toast({
          title: "Solicitud enviada",
          description: result.message,
        })
        // Reset form
        e.currentTarget.reset()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Enviando..." : submitButtonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}