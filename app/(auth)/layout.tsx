import type React from "react"
import { Sidebar } from "@/app/components/sidebar"
import { Inter } from "next/font/google"
const inter = Inter({ subsets: ["latin"] })

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 overflow-y-auto bg-gray-50 p-4">{children}</main>
    </div>
  )
}

