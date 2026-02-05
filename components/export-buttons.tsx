'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'

interface ExportButtonsProps {
  projectId: string
}

export function ExportButtons({ projectId }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)

  const handleExportPdf = async () => {
    setLoadingPdf(true)
    try {
      const res = await fetch(`/api/export/pdf?projectId=${projectId}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${projectId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF')
    } finally {
      setLoadingPdf(false)
    }
  }

  const handleExportExcel = async () => {
    setLoadingExcel(true)
    try {
      const res = await fetch(`/api/export/excel?projectId=${projectId}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${projectId}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Excel export failed:', error)
      alert('Failed to export Excel')
    } finally {
      setLoadingExcel(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportExcel} disabled={loadingExcel}>
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        {loadingExcel ? 'Exporting...' : 'Export Excel'}
      </Button>
      <Button onClick={handleExportPdf} disabled={loadingPdf}>
        <FileText className="h-4 w-4 mr-2" />
        {loadingPdf ? 'Exporting...' : 'Export PDF'}
      </Button>
    </div>
  )
}
