import Papa from 'papaparse'
import type { ParsedCSVRow, ColumnMapping } from '@/types'
import { parseNumber } from './utils'

export interface CSVParseResult {
  headers: string[]
  rows: Record<string, string>[]
  rowCount: number
}

export function parseCSV(csvText: string): CSVParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  return {
    headers: result.meta.fields || [],
    rows: result.data,
    rowCount: result.data.length,
  }
}

export function mapCSVToEntries(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): ParsedCSVRow[] {
  const entries: ParsedCSVRow[] = []

  for (const row of rows) {
    // Skip rows without account code or name
    const accountCode = mapping.accountCode ? row[mapping.accountCode]?.trim() : ''
    const accountName = mapping.accountName ? row[mapping.accountName]?.trim() : ''

    if (!accountCode && !accountName) continue

    // Skip header/summary rows (often start with specific patterns)
    if (accountName.toLowerCase().includes('net income') && accountCode === '') continue
    if (accountName === '' && accountCode === '') continue

    const amount = mapping.amount ? parseNumber(row[mapping.amount] || '0') : 0
    const adjustments = mapping.adjustments ? parseNumber(row[mapping.adjustments] || '0') : null
    const finalAmount = mapping.finalAmount
      ? parseNumber(row[mapping.finalAmount] || '0')
      : amount + (adjustments || 0)

    // Skip rows where all amounts are 0 and it looks like a category header
    if (amount === 0 && finalAmount === 0 && !accountCode.includes('BDO')) {
      // Check if this is a parent category row
      const isCategory = /^\d{3}(\.\d+)*\s+/.test(accountCode) || /^\d{3}\s+/.test(accountCode)
      if (isCategory && rows.some(r => {
        const childCode = mapping.accountCode ? r[mapping.accountCode] : ''
        return childCode?.startsWith(accountCode.split(' ')[0] + '.')
      })) {
        continue // Skip parent category headers
      }
    }

    entries.push({
      accountCode,
      accountName,
      amount,
      adjustments: adjustments === 0 ? null : adjustments,
      finalAmount,
    })
  }

  return entries
}

export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    accountCode: null,
    accountName: null,
    amount: null,
    adjustments: null,
    finalAmount: null,
  }

  const lowerHeaders = headers.map(h => h.toLowerCase())

  // Account code detection
  const codePatterns = ['account', 'code', 'acc']
  for (let i = 0; i < headers.length; i++) {
    if (codePatterns.some(p => lowerHeaders[i].includes(p))) {
      mapping.accountCode = headers[i]
      break
    }
  }

  // If first column has no header or is empty, it might be account code
  if (!mapping.accountCode && headers[0]) {
    mapping.accountCode = headers[0]
  }

  // Account name - often second column or contains 'name', 'description'
  const namePatterns = ['name', 'description', 'desc']
  for (let i = 0; i < headers.length; i++) {
    if (namePatterns.some(p => lowerHeaders[i].includes(p))) {
      mapping.accountName = headers[i]
      break
    }
  }

  // Amount patterns
  const amountPatterns = ['prelim', 'amount', 'balance', 'debit', 'credit']
  for (let i = 0; i < headers.length; i++) {
    if (amountPatterns.some(p => lowerHeaders[i].includes(p))) {
      mapping.amount = headers[i]
      break
    }
  }

  // Adjustments
  const adjPatterns = ['adj', 'adjustment']
  for (let i = 0; i < headers.length; i++) {
    if (adjPatterns.some(p => lowerHeaders[i].includes(p))) {
      mapping.adjustments = headers[i]
      break
    }
  }

  // Final amount - often contains 'rep', 'final', 'total'
  const finalPatterns = ['rep', 'final', 'total', 'closing']
  for (let i = 0; i < headers.length; i++) {
    if (finalPatterns.some(p => lowerHeaders[i].includes(p)) && !lowerHeaders[i].includes('12/23')) {
      mapping.finalAmount = headers[i]
      break
    }
  }

  return mapping
}
