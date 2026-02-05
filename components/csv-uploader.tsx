'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react'
import { parseCSV, detectColumnMapping, mapCSVToEntries, type CSVParseResult } from '@/lib/csv-parser'
import { classifyEntries } from '@/lib/classifier'
import type { ColumnMapping, ParsedCSVRow, Classification, ReportSection } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CSVUploaderProps {
  projectId: string
  onUploadComplete: () => void
}

type UploadStep = 'upload' | 'map' | 'preview' | 'saving'

export function CSVUploader({ projectId, onUploadComplete }: CSVUploaderProps) {
  const [step, setStep] = useState<UploadStep>('upload')
  const [csvData, setCsvData] = useState<CSVParseResult | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({
    accountCode: null,
    accountName: null,
    amount: null,
    adjustments: null,
    finalAmount: null,
  })
  const [entries, setEntries] = useState<Array<ParsedCSVRow & { classification: Classification; reportSection: ReportSection }>>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setCsvData(parsed)

      // Auto-detect column mapping
      const autoMapping = detectColumnMapping(parsed.headers)
      setMapping(autoMapping)
      setStep('map')
    }
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  })

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value === '_none_' ? null : value,
    }))
  }

  const handlePreview = () => {
    if (!csvData) return

    const mapped = mapCSVToEntries(csvData.rows, mapping)
    const classified = classifyEntries(mapped)
    setEntries(classified)
    setStep('preview')
  }

  const handleSave = async () => {
    setStep('saving')
    setError(null)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          entries: entries.map(e => ({
            accountCode: e.accountCode,
            accountName: e.accountName,
            amount: e.amount,
            adjustments: e.adjustments,
            finalAmount: e.finalAmount,
            classification: e.classification,
            reportSection: e.reportSection,
          })),
        }),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to save entries')
      }

      onUploadComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('preview')
    }
  }

  const handleReset = () => {
    setCsvData(null)
    setMapping({
      accountCode: null,
      accountName: null,
      amount: null,
      adjustments: null,
      finalAmount: null,
    })
    setEntries([])
    setStep('upload')
    setError(null)
  }

  if (step === 'upload') {
    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to select a file
        </p>
        <Button variant="outline" type="button">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Select CSV File
        </Button>
      </div>
    )
  }

  if (step === 'map' && csvData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Map Columns</h3>
            <p className="text-sm text-muted-foreground">
              Match CSV columns to the required fields
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { key: 'accountCode', label: 'Account Code', required: true },
            { key: 'accountName', label: 'Account Name', required: false },
            { key: 'amount', label: 'Amount (Prelim)', required: true },
            { key: 'adjustments', label: 'Adjustments', required: false },
            { key: 'finalAmount', label: 'Final Amount (Rep)', required: false },
          ].map(({ key, label, required }) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium">
                {label} {required && <span className="text-destructive">*</span>}
              </label>
              <Select
                value={mapping[key as keyof ColumnMapping] || '_none_'}
                onValueChange={(v) => handleMappingChange(key as keyof ColumnMapping, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">-- Not mapped --</SelectItem>
                  {csvData.headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Sample Data (first 5 rows)</h4>
            <div className="overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvData.headers.slice(0, 6).map((header) => (
                      <TableHead key={header} className="text-xs whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.rows.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      {csvData.headers.slice(0, 6).map((header) => (
                        <TableCell key={header} className="text-xs">
                          {row[header]?.substring(0, 30)}
                          {row[header]?.length > 30 && '...'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handlePreview} disabled={!mapping.accountCode || !mapping.amount}>
            Preview & Classify
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'preview' || step === 'saving') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Preview & Confirm</h3>
            <p className="text-sm text-muted-foreground">
              {entries.length} entries ready to import
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={step === 'saving'}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Adjustments</TableHead>
                    <TableHead className="text-right">Final Amount</TableHead>
                    <TableHead>Classification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 50).map((entry, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{entry.accountCode}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{entry.accountName}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {entry.adjustments ? formatCurrency(entry.adjustments) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(entry.finalAmount)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          entry.classification === 'unclassified'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.reportSection === 'pnl'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.classification.replace(/_/g, ' ').replace('bs ', '').replace('pnl ', '')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {entries.length > 50 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Showing first 50 of {entries.length} entries
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={step === 'saving'}>
            <Check className="h-4 w-4 mr-2" />
            {step === 'saving' ? 'Saving...' : 'Import Entries'}
          </Button>
          <Button variant="outline" onClick={() => setStep('map')} disabled={step === 'saving'}>
            Back to Mapping
          </Button>
        </div>
      </div>
    )
  }

  return null
}
