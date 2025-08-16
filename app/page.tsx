"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Copy,
  Download,
  Trash2,
  Link,
  FileText,
  Calendar,
  HardDrive,
  Eye,
  ChevronDown,
  Clipboard,
  RefreshCw,
  History,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Search,
  BarChart3,
  Clock,
  TrendingUp,
  Filter,
  X,
  Upload,
  FileDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileInfo {
  id: string
  name: string
  size: number
  mime_type: string
  downloads: number
  upload_date: string
  downloadUrl: string
  thumbnail?: string
}

interface HistoryItem {
  id: string
  name: string
  link: string
  date: string
  size?: number
  mime_type?: string
  thumbnail?: string
}

interface Stats {
  totalFiles: number
  totalSize: number
  mostDownloaded: string
  recentActivity: number
}

export default function PixeldrainConverter() {
  const [linkInput, setLinkInput] = useState("")
  const [currentFile, setCurrentFile] = useState<FileInfo | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [visibleCount, setVisibleCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [stats, setStats] = useState<Stats>({ totalFiles: 0, totalSize: 0, mostDownloaded: "", recentActivity: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterHistory()
    calculateStats()
  }, [history, searchQuery, selectedFilter])

  const loadHistory = () => {
    try {
      const savedHistory = localStorage.getItem("pixeldrainHistory")
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }

  const filterHistory = () => {
    let filtered = history

    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((item) => {
        const mimeType = item.mime_type || ""
        switch (selectedFilter) {
          case "images":
            return mimeType.startsWith("image/")
          case "videos":
            return mimeType.startsWith("video/")
          case "documents":
            return mimeType.includes("pdf") || mimeType.includes("doc")
          case "archives":
            return mimeType.includes("zip") || mimeType.includes("rar")
          default:
            return true
        }
      })
    }

    setFilteredHistory(filtered)
  }

  const calculateStats = () => {
    const totalFiles = history.length
    const totalSize = history.reduce((sum, item) => sum + (item.size || 0), 0)
    const recentActivity = history.filter((item) => {
      const itemDate = new Date(item.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return itemDate > weekAgo
    }).length

    const mostDownloaded = history.length > 0 ? history[0].name : "لا يوجد"

    setStats({ totalFiles, totalSize, mostDownloaded, recentActivity })
  }

  const convertLink = async () => {
    const url = linkInput.trim()
    const match = url.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/)

    if (!match) {
      toast({
        title: "رابط غير صالح",
        description: "الرجاء إدخال رابط صالح من موقع Pixeldrain",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    const fileId = match[1]
    const downloadUrl = `https://pixeldrain.com/api/file/${fileId}?download`
    const infoUrl = `https://pixeldrain.com/api/file/${fileId}/info`
    const thumbnailUrl = `https://pixeldrain.com/api/file/${fileId}/thumbnail`

    setIsLoading(true)

    try {
      const response = await fetch(infoUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch file info")
      }

      const data = await response.json()
      const fileInfo: FileInfo = {
        id: fileId,
        name: data.name || "غير معروف",
        size: data.size || 0,
        mime_type: data.mime_type || "غير معروف",
        downloads: data.downloads || 0,
        upload_date: data.upload_date,
        downloadUrl,
        thumbnail:
          data.mime_type?.startsWith("image/") || data.mime_type?.startsWith("video/") ? thumbnailUrl : undefined,
      }

      setCurrentFile(fileInfo)
      saveToHistory(fileInfo)

      toast({
        title: "تم التحويل بنجاح",
        description: `تم جلب معلومات الملف: ${fileInfo.name}`,
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "خطأ في التحويل",
        description: "تعذر جلب معلومات الملف. تأكد من صحة الرابط",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToHistory = (fileInfo: FileInfo) => {
    const historyItem: HistoryItem = {
      id: fileInfo.id,
      name: fileInfo.name,
      link: fileInfo.downloadUrl,
      date: new Date().toLocaleString("ar-EG"),
      size: fileInfo.size,
      mime_type: fileInfo.mime_type,
      thumbnail: fileInfo.thumbnail,
    }

    const updatedHistory = [historyItem, ...history.filter((item) => item.id !== fileInfo.id)].slice(0, 50)
    setHistory(updatedHistory)
    localStorage.setItem("pixeldrainHistory", JSON.stringify(updatedHistory))
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setLinkInput(text)
      toast({
        title: "تم اللصق بنجاح",
        description: "تم لصق الرابط من الحافظة",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "خطأ في اللصق",
        description: "لم يتم السماح بالوصول إلى الحافظة",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const copyTitleAndLink = async (text: string, fileName: string) => {
    try {
      const textToCopy = `${fileName}\n${text}`
      await navigator.clipboard.writeText(textToCopy)
      toast({
        title: "تم النسخ بنجاح",
        description: `تم نسخ عنوان ورابط ${fileName}`,
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "فشل في نسخ العنوان والرابط",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const copyLinkOnly = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "تم النسخ بنجاح",
        description: "تم نسخ الرابط فقط إلى الحافظة",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "فشل في نسخ الرابط",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("pixeldrainHistory", JSON.stringify(updatedHistory))

    toast({
      title: "تم الحذف",
      description: "تم حذف العنصر من السجل",
      duration: 2000,
    })
  }

  const clearAllHistory = () => {
    setHistory([])
    localStorage.removeItem("pixeldrainHistory")
    setVisibleCount(5)
    setSearchQuery("")
    setSelectedFilter("all")

    toast({
      title: "تم مسح السجل",
      description: "تم حذف جميع العناصر من السجل",
      duration: 2000,
    })
  }

  const exportHistory = () => {
    if (history.length === 0) {
      toast({
        title: "لا يوجد بيانات للتصدير",
        description: "السجل فارغ، لا توجد بيانات للتصدير",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const dataToExport = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      totalFiles: history.length,
      history: history,
    }

    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `pixeldrain-history-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "تم التصدير بنجاح",
      description: `تم تصدير ${history.length} عنصر إلى ملف JSON`,
      duration: 3000,
    })
  }

  const importHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار ملف JSON صالح",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        if (!importedData.history || !Array.isArray(importedData.history)) {
          throw new Error("Invalid data structure")
        }

        const mergedHistory = [...importedData.history, ...history]
        const uniqueHistory = mergedHistory
          .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
          .slice(0, 50)

        setHistory(uniqueHistory)
        localStorage.setItem("pixeldrainHistory", JSON.stringify(uniqueHistory))

        toast({
          title: "تم الاستيراد بنجاح",
          description: `تم استيراد ${importedData.history.length} عنصر من الملف`,
          duration: 3000,
        })
      } catch (error) {
        toast({
          title: "خطأ في الاستيراد",
          description: "فشل في قراءة الملف. تأكد من أنه ملف JSON صالح",
          variant: "destructive",
          duration: 4000,
        })
      }
    }

    reader.readAsText(file)
    event.target.value = ""
  }

  const triggerImport = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "🖼️"
    if (mimeType.startsWith("video/")) return "🎥"
    if (mimeType.startsWith("audio/")) return "🎵"
    if (mimeType.includes("pdf")) return "📄"
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦"
    return "📁"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1a1a1-1V8aMMxqQkba55BFw3YKsOCcsYTgNU.png"
                alt="شعار محول Pixeldrain"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent leading-tight">
              محول روابط Pixeldrain Pro
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              أداة احترافية متقدمة لتحويل وإدارة روابط Pixeldrain مع إحصائيات شاملة
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-slate-200 truncate">{stats.totalFiles}</p>
                      <p className="text-xs sm:text-sm text-slate-400">إجمالي الملفات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <HardDrive className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-slate-200 truncate">
                        {formatFileSize(stats.totalSize)}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400">إجمالي الحجم</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-slate-200">{stats.recentActivity}</p>
                      <p className="text-xs sm:text-sm text-slate-400">نشاط الأسبوع</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-lg font-bold text-slate-200 truncate">{stats.mostDownloaded}</p>
                      <p className="text-xs sm:text-sm text-slate-400">الأحدث</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Converter */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-200 text-lg sm:text-xl">
                  <Link className="h-5 w-5 text-cyan-400" />
                  تحويل الرابط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="أدخل رابط Pixeldrain هنا..."
                    className="bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400 transition-colors text-sm sm:text-base"
                    onKeyPress={(e) => e.key === "Enter" && convertLink()}
                  />
                  <Button
                    onClick={pasteFromClipboard}
                    variant="outline"
                    size="icon"
                    className="border-slate-600 hover:bg-slate-700 bg-transparent hover:border-cyan-400 transition-colors flex-shrink-0"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={convertLink}
                  disabled={isLoading || !linkInput.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري التحويل...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      تحويل الرابط
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current File Result */}
          <AnimatePresence>
            {currentFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600 backdrop-blur-sm shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-200 text-lg sm:text-xl">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      معلومات الملف
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {currentFile.thumbnail && (
                        <div className="lg:col-span-2 space-y-3">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm text-slate-400">معاينة:</span>
                          </div>
                          <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600 flex justify-center">
                            <img
                              src={currentFile.thumbnail || "/placeholder.svg"}
                              alt={currentFile.name}
                              className="max-w-full max-h-48 object-contain rounded-lg shadow-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm text-slate-400">اسم الملف:</span>
                        </div>
                        <p className="text-slate-200 font-medium break-all bg-slate-700/30 p-3 rounded-lg text-sm sm:text-base">
                          {getFileTypeIcon(currentFile.mime_type)} {currentFile.name}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm text-slate-400">الحجم:</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 text-sm sm:text-lg p-2"
                        >
                          {formatFileSize(currentFile.size)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm text-slate-400">عدد التنزيلات:</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-green-700 to-green-600 text-slate-200 text-sm sm:text-lg p-2"
                        >
                          {currentFile.downloads.toLocaleString("ar-EG")}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm text-slate-400">تاريخ الرفع:</span>
                        </div>
                        <p className="text-slate-200 text-xs sm:text-sm bg-slate-700/30 p-3 rounded-lg">
                          {new Date(currentFile.upload_date).toLocaleString("ar-EG")}
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-slate-600" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-slate-400">رابط التحميل:</span>
                      </div>
                      <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                        <p className="text-slate-300 text-xs sm:text-sm break-all">{currentFile.downloadUrl}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => window.open(currentFile.downloadUrl, "_blank")}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-green-500/25"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        تنزيل الملف
                      </Button>
                      <Button
                        onClick={() => copyTitleAndLink(currentFile.downloadUrl, currentFile.name)}
                        variant="outline"
                        className="flex-1 border-slate-600 hover:bg-slate-700 hover:border-cyan-400"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        نسخ العنوان والرابط
                      </Button>
                      <Button
                        onClick={() => copyLinkOnly(currentFile.downloadUrl)}
                        variant="outline"
                        className="flex-1 border-slate-600 hover:bg-slate-700 hover:border-purple-400"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        رابط فقط
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-slate-200 text-lg sm:text-xl">
                    <History className="h-5 w-5 text-cyan-400" />
                    السجل ({filteredHistory.length} من {history.length})
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <Button
                        onClick={exportHistory}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 hover:bg-slate-700 hover:border-green-400 shadow-lg flex-1 sm:flex-none bg-transparent"
                        disabled={history.length === 0}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        تصدير
                      </Button>
                      <Button
                        onClick={triggerImport}
                        variant="outline"
                        size="sm"
                        className="border-slate-600 hover:bg-slate-700 hover:border-blue-400 shadow-lg flex-1 sm:flex-none bg-transparent"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        استيراد
                      </Button>
                    </div>
                    {history.length > 0 && (
                      <Button
                        onClick={clearAllHistory}
                        variant="destructive"
                        size="sm"
                        className="shadow-lg hover:shadow-red-500/25 w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        مسح الكل
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="البحث في السجل..."
                          className="pl-10 bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400 text-sm sm:text-base"
                        />
                        {searchQuery && (
                          <Button
                            onClick={() => setSearchQuery("")}
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {[
                        { key: "all", label: "الكل", icon: Filter },
                        { key: "images", label: "صور", icon: FileText },
                        { key: "videos", label: "فيديو", icon: FileText },
                        { key: "documents", label: "مستندات", icon: FileText },
                        { key: "archives", label: "أرشيف", icon: FileText },
                      ].map((filter) => (
                        <Button
                          key={filter.key}
                          onClick={() => setSelectedFilter(filter.key)}
                          variant={selectedFilter === filter.key ? "default" : "outline"}
                          size="sm"
                          className={`text-xs sm:text-sm ${
                            selectedFilter === filter.key
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
                              : "border-slate-600 hover:bg-slate-700"
                          }`}
                        >
                          <filter.icon className="h-3 w-3 mr-1" />
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">
                      {history.length === 0 ? "لا توجد عناصر في السجل" : "لا توجد نتائج للبحث"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredHistory.slice(0, visibleCount).map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 p-3 sm:p-4 rounded-lg border border-slate-600 hover:border-slate-500 transition-all hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-3 flex-1 min-w-0">
                              {item.thumbnail && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.thumbnail || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-slate-600 shadow-md"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none"
                                    }}
                                  />
                                </div>
                              )}

                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg flex-shrink-0">{getFileTypeIcon(item.mime_type || "")}</span>
                                  <h4 className="font-medium text-slate-200 break-all text-sm sm:text-base">
                                    {item.name}
                                  </h4>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    {item.date}
                                  </span>
                                  {item.size && (
                                    <Badge variant="outline" className="border-slate-600 text-slate-300 w-fit">
                                      {formatFileSize(item.size)}
                                    </Badge>
                                  )}
                                </div>

                                <div className="bg-slate-800/50 p-2 rounded text-xs text-slate-400 break-all border border-slate-700">
                                  {item.link}
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={() => deleteFromHistory(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <Button
                              onClick={() => window.open(item.link, "_blank")}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-md text-xs sm:text-sm"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              تنزيل
                            </Button>
                            <Button
                              onClick={() => copyTitleAndLink(item.link, item.name)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-slate-600 hover:bg-slate-700 hover:border-cyan-400 text-xs sm:text-sm"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              نسخ العنوان والرابط
                            </Button>
                            <Button
                              onClick={() => copyLinkOnly(item.link)}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-slate-600 hover:bg-slate-700 hover:border-purple-400 text-xs sm:text-sm"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              رابط فقط
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredHistory.length > visibleCount && (
                      <div className="text-center pt-4">
                        <Button
                          onClick={() => setVisibleCount((prev) => prev + 5)}
                          variant="outline"
                          className="border-slate-600 hover:bg-slate-700 hover:border-cyan-400 shadow-lg w-full sm:w-auto"
                        >
                          <ChevronDown className="h-4 w-4 mr-2" />
                          عرض المزيد ({filteredHistory.length - visibleCount} متبقي)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hidden File Input for Import */}
          <input ref={fileInputRef} type="file" accept=".json" onChange={importHistory} style={{ display: "none" }} />

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                  <p className="text-slate-400 text-sm">تم تصميم الصفحة عبر الذكاء الاصطناعي من المستخدم عمر</p>
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                </div>
                <p className="text-slate-500 text-xs">alomar3363@gmail.com</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
