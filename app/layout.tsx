import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "محول روابط Pixeldrain Pro - أداة احترافية متقدمة",
  description: "أداة احترافية متقدمة لتحويل وإدارة روابط Pixeldrain مع إحصائيات شاملة وواجهة عصرية سهلة الاستخدام",
  keywords: "pixeldrain, تحويل روابط, تنزيل ملفات, إدارة ملفات, أداة احترافية",
  authors: [{ name: "Pixeldrain Converter Pro" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
