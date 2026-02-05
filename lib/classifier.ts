import type { Classification, ReportSection, ParsedCSVRow } from '@/types'

interface ClassificationResult {
  classification: Classification
  reportSection: ReportSection
}

// Default classification rules based on account code patterns
const classificationRules: Array<{
  pattern: RegExp
  classification: Classification
  reportSection: ReportSection
}> = [
  // Balance Sheet - Assets
  { pattern: /^300/, classification: 'bs_non_current_asset', reportSection: 'balance_sheet' },
  { pattern: /^400/, classification: 'bs_current_asset', reportSection: 'balance_sheet' },

  // Balance Sheet - Liabilities
  { pattern: /^500/, classification: 'bs_non_current_liability', reportSection: 'balance_sheet' },
  { pattern: /^600/, classification: 'bs_current_liability', reportSection: 'balance_sheet' },

  // Balance Sheet - Equity
  { pattern: /^800/, classification: 'bs_equity', reportSection: 'balance_sheet' },

  // Income Statement
  { pattern: /^700/, classification: 'pnl_revenue', reportSection: 'pnl' },
  { pattern: /^750\.720/, classification: 'pnl_cost_of_sales', reportSection: 'pnl' },
  { pattern: /^750\.750/, classification: 'pnl_operating_expense', reportSection: 'pnl' },
  { pattern: /^750\.775/, classification: 'pnl_finance_cost', reportSection: 'pnl' },
  { pattern: /^750\.795/, classification: 'pnl_tax', reportSection: 'pnl' },
  { pattern: /^750/, classification: 'pnl_operating_expense', reportSection: 'pnl' }, // Fallback for other 750.xxx
]

export function classifyAccount(accountCode: string): ClassificationResult {
  // Clean the account code - extract numeric prefix
  const cleanCode = accountCode.trim()

  // Try to match against rules
  for (const rule of classificationRules) {
    if (rule.pattern.test(cleanCode)) {
      return {
        classification: rule.classification,
        reportSection: rule.reportSection,
      }
    }
  }

  // Check for BDO prefix entries - try to classify based on parent code
  if (cleanCode.startsWith('BDO')) {
    // These are detail lines - need context from the account name or parent
    // Default to unclassified and let user override
    return {
      classification: 'unclassified',
      reportSection: 'balance_sheet',
    }
  }

  return {
    classification: 'unclassified',
    reportSection: 'balance_sheet',
  }
}

export function classifyEntries(entries: ParsedCSVRow[]): Array<ParsedCSVRow & ClassificationResult> {
  let lastParentClassification: ClassificationResult = {
    classification: 'unclassified',
    reportSection: 'balance_sheet',
  }

  return entries.map(entry => {
    // Check if this is a parent category (starts with 3-digit code)
    const isParentCategory = /^\d{3}(\.\d+)*\s/.test(entry.accountCode)

    if (isParentCategory) {
      // Classify based on the code prefix
      const numericCode = entry.accountCode.split(' ')[0]
      lastParentClassification = classifyAccount(numericCode)
      return {
        ...entry,
        ...lastParentClassification,
      }
    }

    // For BDO entries, inherit from last parent
    if (entry.accountCode.startsWith('BDO')) {
      return {
        ...entry,
        ...lastParentClassification,
      }
    }

    // For other entries, try to classify directly
    const result = classifyAccount(entry.accountCode)
    if (result.classification !== 'unclassified') {
      lastParentClassification = result
    }

    return {
      ...entry,
      ...result,
    }
  })
}

export function getClassificationOptions(): Array<{
  value: Classification
  label: string
  section: ReportSection
}> {
  return [
    { value: 'bs_non_current_asset', label: 'Non-Current Assets', section: 'balance_sheet' },
    { value: 'bs_current_asset', label: 'Current Assets', section: 'balance_sheet' },
    { value: 'bs_non_current_liability', label: 'Non-Current Liabilities', section: 'balance_sheet' },
    { value: 'bs_current_liability', label: 'Current Liabilities', section: 'balance_sheet' },
    { value: 'bs_equity', label: 'Equity', section: 'balance_sheet' },
    { value: 'pnl_revenue', label: 'Revenue', section: 'pnl' },
    { value: 'pnl_cost_of_sales', label: 'Cost of Sales', section: 'pnl' },
    { value: 'pnl_operating_expense', label: 'Operating Expenses', section: 'pnl' },
    { value: 'pnl_finance_cost', label: 'Finance Costs', section: 'pnl' },
    { value: 'pnl_tax', label: 'Taxation', section: 'pnl' },
    { value: 'unclassified', label: 'Unclassified', section: 'balance_sheet' },
  ]
}
