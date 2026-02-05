'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getClassificationOptions } from '@/lib/classifier'
import type { Classification, ReportSection, EntryData } from '@/types'

interface ClassifyPageProps {
  params: { id: string }
}

interface Entry {
  id: string
  accountCode: string
  accountName: string
  amount: string
  adjustments: string | null
  finalAmount: string
  classification: string
  reportSection: string
}

export default function ClassifyPage({ params }: ClassifyPageProps) {
  const { id } = params
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Record<string, { classification: string; reportSection: string }>>({})
  const [filter, setFilter] = useState<string>('all')

  const classificationOptions = getClassificationOptions()

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch(`/api/classify?projectId=${id}`)
        const result = await res.json()
        if (result.success) {
          setEntries(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch entries:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [id])

  const handleClassificationChange = (entryId: string, classification: Classification) => {
    const option = classificationOptions.find(o => o.value === classification)
    setChanges(prev => ({
      ...prev,
      [entryId]: {
        classification,
        reportSection: option?.section || 'balance_sheet',
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(changes).map(([id, data]) => ({
        id,
        ...data,
      }))

      const res = await fetch('/api/classify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (res.ok) {
        // Update local state
        setEntries(prev =>
          prev.map(entry => {
            if (changes[entry.id]) {
              return {
                ...entry,
                classification: changes[entry.id].classification,
                reportSection: changes[entry.id].reportSection,
              }
            }
            return entry
          })
        )
        setChanges({})
      }
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true
    if (filter === 'unclassified') return entry.classification === 'unclassified' || changes[entry.id]?.classification === 'unclassified'
    if (filter === 'balance_sheet') return entry.reportSection === 'balance_sheet' || changes[entry.id]?.reportSection === 'balance_sheet'
    if (filter === 'pnl') return entry.reportSection === 'pnl' || changes[entry.id]?.reportSection === 'pnl'
    return true
  })

  const getEntryClassification = (entry: Entry): Classification => {
    return (changes[entry.id]?.classification || entry.classification) as Classification
  }

  const stats = {
    total: entries.length,
    unclassified: entries.filter(e => (changes[e.id]?.classification || e.classification) === 'unclassified').length,
    balanceSheet: entries.filter(e => (changes[e.id]?.reportSection || e.reportSection) === 'balance_sheet').length,
    pnl: entries.filter(e => (changes[e.id]?.reportSection || e.reportSection) === 'pnl').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading entries...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold">Classify Accounts</h1>
          <p className="text-muted-foreground">
            Assign each account to Balance Sheet or Income Statement
          </p>
        </div>
        <div className="flex gap-2">
          {Object.keys(changes).length > 0 && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : `Save ${Object.keys(changes).length} Changes`}
            </Button>
          )}
          <Link href={`/projects/${id}/reports`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${filter === 'unclassified' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setFilter('unclassified')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.unclassified}</div>
            <div className="text-sm text-muted-foreground">Unclassified</div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${filter === 'balance_sheet' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setFilter('balance_sheet')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.balanceSheet}</div>
            <div className="text-sm text-muted-foreground">Balance Sheet</div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${filter === 'pnl' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFilter('pnl')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.pnl}</div>
            <div className="text-sm text-muted-foreground">Income Statement</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {filter === 'all' ? 'All Entries' :
             filter === 'unclassified' ? 'Unclassified Entries' :
             filter === 'balance_sheet' ? 'Balance Sheet Entries' :
             'Income Statement Entries'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({filteredEntries.length} entries)
            </span>
          </CardTitle>
          {filter !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>
              Show All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="text-right w-[120px]">Final Amount</TableHead>
                  <TableHead className="w-[200px]">Classification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className={changes[entry.id] ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-mono text-xs">{entry.accountCode}</TableCell>
                    <TableCell className="text-sm">{entry.accountName}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(Number(entry.finalAmount))}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={getEntryClassification(entry)}
                        onValueChange={(value) => handleClassificationChange(entry.id, value as Classification)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_header_bs" disabled className="font-semibold text-xs">
                            BALANCE SHEET
                          </SelectItem>
                          {classificationOptions
                            .filter(o => o.section === 'balance_sheet')
                            .map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          <SelectItem value="_header_pnl" disabled className="font-semibold text-xs mt-2">
                            INCOME STATEMENT
                          </SelectItem>
                          {classificationOptions
                            .filter(o => o.section === 'pnl')
                            .map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
