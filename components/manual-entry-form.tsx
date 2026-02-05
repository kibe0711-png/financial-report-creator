'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getClassificationOptions } from '@/lib/classifier'
import type { Classification } from '@/types'

interface ManualEntryFormProps {
  projectId: string
}

export function ManualEntryForm({ projectId }: ManualEntryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const classificationOptions = getClassificationOptions()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const classification = formData.get('classification') as Classification
    const option = classificationOptions.find(o => o.value === classification)

    const data = {
      projectId,
      accountCode: formData.get('accountCode') as string,
      accountName: formData.get('accountName') as string,
      amount: parseFloat(formData.get('amount') as string) || 0,
      adjustments: formData.get('adjustments') ? parseFloat(formData.get('adjustments') as string) : null,
      classification,
      reportSection: option?.section || 'balance_sheet',
      isManual: true,
    }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to add entry')
      }

      setSuccess(true)
      e.currentTarget.reset()
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
          Entry added successfully!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="accountCode">Account Code</Label>
        <Input
          id="accountCode"
          name="accountCode"
          placeholder="e.g., 300.305.025"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountName">Account Name</Label>
        <Input
          id="accountName"
          name="accountName"
          placeholder="e.g., Furniture and fixtures"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adjustments">Adjustments (optional)</Label>
        <Input
          id="adjustments"
          name="adjustments"
          type="number"
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classification">Classification</Label>
        <Select name="classification" defaultValue="unclassified">
          <SelectTrigger>
            <SelectValue placeholder="Select classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_header_bs" disabled className="font-semibold">
              Balance Sheet
            </SelectItem>
            {classificationOptions
              .filter(o => o.section === 'balance_sheet')
              .map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            <SelectItem value="_header_pnl" disabled className="font-semibold mt-2">
              Income Statement
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
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : 'Add Entry'}
      </Button>
    </form>
  )
}
