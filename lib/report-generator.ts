import type { BalanceSheetData, IncomeStatementData, EntryData } from '@/types'

interface Entry {
  id: string
  accountCode: string
  accountName: string
  amount: number | string
  adjustments: number | string | null
  finalAmount: number | string
  classification: string
  reportSection: string
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

function toEntryData(entry: Entry): EntryData {
  return {
    id: entry.id,
    accountCode: entry.accountCode,
    accountName: entry.accountName,
    amount: toNumber(entry.amount),
    adjustments: entry.adjustments != null ? toNumber(entry.adjustments) : null,
    finalAmount: toNumber(entry.finalAmount),
    classification: entry.classification as any,
    reportSection: entry.reportSection as any,
    isManual: false,
  }
}

export function generateBalanceSheet(entries: Entry[]): BalanceSheetData {
  const bsEntries = entries.filter(e => e.reportSection === 'balance_sheet')

  const nonCurrentAssets = bsEntries
    .filter(e => e.classification === 'bs_non_current_asset')
    .map(toEntryData)

  const currentAssets = bsEntries
    .filter(e => e.classification === 'bs_current_asset')
    .map(toEntryData)

  const nonCurrentLiabilities = bsEntries
    .filter(e => e.classification === 'bs_non_current_liability')
    .map(toEntryData)

  const currentLiabilities = bsEntries
    .filter(e => e.classification === 'bs_current_liability')
    .map(toEntryData)

  const equity = bsEntries
    .filter(e => e.classification === 'bs_equity')
    .map(toEntryData)

  const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, e) => sum + e.finalAmount, 0)
  const totalCurrentAssets = currentAssets.reduce((sum, e) => sum + e.finalAmount, 0)
  const totalAssets = totalNonCurrentAssets + totalCurrentAssets

  const totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum, e) => sum + e.finalAmount, 0)
  const totalCurrentLiabilities = currentLiabilities.reduce((sum, e) => sum + e.finalAmount, 0)
  const totalLiabilities = totalNonCurrentLiabilities + totalCurrentLiabilities

  const totalEquity = equity.reduce((sum, e) => sum + e.finalAmount, 0)

  return {
    nonCurrentAssets,
    currentAssets,
    totalAssets,
    nonCurrentLiabilities,
    currentLiabilities,
    totalLiabilities,
    equity,
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
  }
}

export function generateIncomeStatement(entries: Entry[]): IncomeStatementData {
  const pnlEntries = entries.filter(e => e.reportSection === 'pnl')

  const revenue = pnlEntries
    .filter(e => e.classification === 'pnl_revenue')
    .map(toEntryData)

  const costOfSales = pnlEntries
    .filter(e => e.classification === 'pnl_cost_of_sales')
    .map(toEntryData)

  const operatingExpenses = pnlEntries
    .filter(e => e.classification === 'pnl_operating_expense')
    .map(toEntryData)

  const financeCosts = pnlEntries
    .filter(e => e.classification === 'pnl_finance_cost')
    .map(toEntryData)

  const taxation = pnlEntries
    .filter(e => e.classification === 'pnl_tax')
    .map(toEntryData)

  // Revenue is typically stored as negative (credit), so we negate to show as positive
  const totalRevenue = Math.abs(revenue.reduce((sum, e) => sum + e.finalAmount, 0))
  const totalCostOfSales = costOfSales.reduce((sum, e) => sum + e.finalAmount, 0)
  const grossProfit = totalRevenue - totalCostOfSales

  const totalOperatingExpenses = operatingExpenses.reduce((sum, e) => sum + e.finalAmount, 0)
  const operatingProfit = grossProfit - totalOperatingExpenses

  const totalFinanceCosts = financeCosts.reduce((sum, e) => sum + e.finalAmount, 0)
  const profitBeforeTax = operatingProfit - totalFinanceCosts

  // Tax could be negative (credit/refund) or positive (expense)
  const totalTaxation = taxation.reduce((sum, e) => sum + e.finalAmount, 0)
  const netProfit = profitBeforeTax - totalTaxation

  return {
    revenue,
    totalRevenue,
    costOfSales,
    totalCostOfSales,
    grossProfit,
    operatingExpenses,
    totalOperatingExpenses,
    operatingProfit,
    financeCosts,
    totalFinanceCosts,
    profitBeforeTax,
    taxation,
    totalTaxation,
    netProfit,
  }
}
