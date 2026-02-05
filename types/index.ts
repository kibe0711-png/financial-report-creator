import { Decimal } from '@prisma/client/runtime/library'

// Classification types
export type Classification =
  | 'bs_non_current_asset'
  | 'bs_current_asset'
  | 'bs_non_current_liability'
  | 'bs_current_liability'
  | 'bs_equity'
  | 'pnl_revenue'
  | 'pnl_cost_of_sales'
  | 'pnl_operating_expense'
  | 'pnl_finance_cost'
  | 'pnl_tax'
  | 'unclassified'

export type ReportSection = 'balance_sheet' | 'pnl'

// Display labels for classifications
export const classificationLabels: Record<Classification, string> = {
  bs_non_current_asset: 'Non-Current Assets',
  bs_current_asset: 'Current Assets',
  bs_non_current_liability: 'Non-Current Liabilities',
  bs_current_liability: 'Current Liabilities',
  bs_equity: 'Equity',
  pnl_revenue: 'Revenue',
  pnl_cost_of_sales: 'Cost of Sales',
  pnl_operating_expense: 'Operating Expenses',
  pnl_finance_cost: 'Finance Costs',
  pnl_tax: 'Taxation',
  unclassified: 'Unclassified',
}

// Report section labels
export const reportSectionLabels: Record<ReportSection, string> = {
  balance_sheet: 'Balance Sheet',
  pnl: 'Income Statement (P&L)',
}

// Parsed CSV row
export interface ParsedCSVRow {
  accountCode: string
  accountName: string
  amount: number
  adjustments: number | null
  finalAmount: number
}

// Entry for display/editing
export interface EntryData {
  id: string
  accountCode: string
  accountName: string
  amount: number
  adjustments: number | null
  finalAmount: number
  classification: Classification
  reportSection: ReportSection
  isManual: boolean
}

// Project data
export interface ProjectData {
  id: string
  name: string
  companyName: string
  periodEnd: Date
  createdAt: Date
  updatedAt: Date
  entries?: EntryData[]
}

// Form inputs
export interface ProjectFormInput {
  name: string
  companyName: string
  periodEnd: string
}

export interface EntryFormInput {
  accountCode: string
  accountName: string
  amount: string
  adjustments?: string
  classification: Classification
}

// CSV column mapping
export interface ColumnMapping {
  accountCode: string | null
  accountName: string | null
  amount: string | null
  adjustments: string | null
  finalAmount: string | null
}

// Report data structures
export interface BalanceSheetData {
  nonCurrentAssets: EntryData[]
  currentAssets: EntryData[]
  totalAssets: number
  nonCurrentLiabilities: EntryData[]
  currentLiabilities: EntryData[]
  totalLiabilities: number
  equity: EntryData[]
  totalEquity: number
  totalLiabilitiesAndEquity: number
}

export interface IncomeStatementData {
  revenue: EntryData[]
  totalRevenue: number
  costOfSales: EntryData[]
  totalCostOfSales: number
  grossProfit: number
  operatingExpenses: EntryData[]
  totalOperatingExpenses: number
  operatingProfit: number
  financeCosts: EntryData[]
  totalFinanceCosts: number
  profitBeforeTax: number
  taxation: EntryData[]
  totalTaxation: number
  netProfit: number
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
