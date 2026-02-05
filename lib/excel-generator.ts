import ExcelJS from 'exceljs'
import type { BalanceSheetData, IncomeStatementData } from '@/types'

interface ProjectInfo {
  name: string
  companyName: string
  periodEnd: Date
}

export async function generateExcelReport(
  project: ProjectInfo,
  balanceSheet: BalanceSheetData,
  incomeStatement: IncomeStatementData
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Financial Report Creator'
  workbook.created = new Date()

  // Helper function to format currency
  const formatCurrency = (value: number) => value

  // Styles
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: 'center' },
  }

  const subHeaderStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } },
  }

  const totalStyle: Partial<ExcelJS.Style> = {
    font: { bold: true },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'double' },
    },
  }

  const currencyFormat = '#,##0.00'

  // ============ Balance Sheet Worksheet ============
  const bsSheet = workbook.addWorksheet('Balance Sheet')
  bsSheet.columns = [
    { width: 50 },
    { width: 20 },
  ]

  // Title
  bsSheet.addRow([project.companyName])
  bsSheet.getRow(1).font = { bold: true, size: 16 }
  bsSheet.addRow(['Statement of Financial Position'])
  bsSheet.getRow(2).font = { bold: true, size: 14 }
  bsSheet.addRow([`As at ${project.periodEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`])
  bsSheet.addRow([])

  // Header row
  bsSheet.addRow(['Description', 'Amount'])
  bsSheet.getRow(5).font = { bold: true }
  bsSheet.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD0D0D0' } }

  let row = 6

  // ASSETS
  bsSheet.addRow(['ASSETS', ''])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  row++

  // Non-Current Assets
  bsSheet.addRow(['Non-Current Assets', ''])
  bsSheet.getRow(row).font = { bold: true }
  row++

  for (const entry of balanceSheet.nonCurrentAssets) {
    bsSheet.addRow([`  ${entry.accountName}`, entry.finalAmount])
    bsSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  const totalNCA = balanceSheet.nonCurrentAssets.reduce((s, e) => s + e.finalAmount, 0)
  bsSheet.addRow(['Total Non-Current Assets', totalNCA])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  // Current Assets
  bsSheet.addRow(['Current Assets', ''])
  bsSheet.getRow(row).font = { bold: true }
  row++

  for (const entry of balanceSheet.currentAssets) {
    bsSheet.addRow([`  ${entry.accountName}`, entry.finalAmount])
    bsSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  const totalCA = balanceSheet.currentAssets.reduce((s, e) => s + e.finalAmount, 0)
  bsSheet.addRow(['Total Current Assets', totalCA])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  bsSheet.addRow(['TOTAL ASSETS', balanceSheet.totalAssets])
  bsSheet.getRow(row).font = { bold: true, size: 12 }
  bsSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  bsSheet.addRow([])
  row++

  // LIABILITIES
  bsSheet.addRow(['LIABILITIES', ''])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  row++

  // Non-Current Liabilities
  bsSheet.addRow(['Non-Current Liabilities', ''])
  bsSheet.getRow(row).font = { bold: true }
  row++

  for (const entry of balanceSheet.nonCurrentLiabilities) {
    bsSheet.addRow([`  ${entry.accountName}`, Math.abs(entry.finalAmount)])
    bsSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  const totalNCL = Math.abs(balanceSheet.nonCurrentLiabilities.reduce((s, e) => s + e.finalAmount, 0))
  bsSheet.addRow(['Total Non-Current Liabilities', totalNCL])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  // Current Liabilities
  bsSheet.addRow(['Current Liabilities', ''])
  bsSheet.getRow(row).font = { bold: true }
  row++

  for (const entry of balanceSheet.currentLiabilities) {
    bsSheet.addRow([`  ${entry.accountName}`, Math.abs(entry.finalAmount)])
    bsSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  const totalCL = Math.abs(balanceSheet.currentLiabilities.reduce((s, e) => s + e.finalAmount, 0))
  bsSheet.addRow(['Total Current Liabilities', totalCL])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  bsSheet.addRow(['TOTAL LIABILITIES', Math.abs(balanceSheet.totalLiabilities)])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  bsSheet.addRow([])
  row++

  // EQUITY
  bsSheet.addRow(['EQUITY', ''])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  row++

  for (const entry of balanceSheet.equity) {
    bsSheet.addRow([`  ${entry.accountName}`, Math.abs(entry.finalAmount)])
    bsSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  bsSheet.addRow(['TOTAL EQUITY', Math.abs(balanceSheet.totalEquity)])
  bsSheet.getRow(row).font = { bold: true }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  bsSheet.addRow([])
  row++

  bsSheet.addRow(['TOTAL LIABILITIES AND EQUITY', Math.abs(balanceSheet.totalLiabilitiesAndEquity)])
  bsSheet.getRow(row).font = { bold: true, size: 12 }
  bsSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } }
  bsSheet.getCell(`B${row}`).numFmt = currencyFormat

  // ============ Income Statement Worksheet ============
  const plSheet = workbook.addWorksheet('Income Statement')
  plSheet.columns = [
    { width: 50 },
    { width: 20 },
  ]

  // Title
  plSheet.addRow([project.companyName])
  plSheet.getRow(1).font = { bold: true, size: 16 }
  plSheet.addRow(['Statement of Profit or Loss'])
  plSheet.getRow(2).font = { bold: true, size: 14 }
  plSheet.addRow([`For the period ending ${project.periodEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`])
  plSheet.addRow([])

  // Header row
  plSheet.addRow(['Description', 'Amount'])
  plSheet.getRow(5).font = { bold: true }
  plSheet.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD0D0D0' } }

  row = 6

  // Revenue
  plSheet.addRow(['REVENUE', ''])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  row++

  for (const entry of incomeStatement.revenue) {
    plSheet.addRow([`  ${entry.accountName}`, Math.abs(entry.finalAmount)])
    plSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  plSheet.addRow(['Total Revenue', incomeStatement.totalRevenue])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  // Cost of Sales
  plSheet.addRow(['COST OF SALES', ''])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  row++

  for (const entry of incomeStatement.costOfSales) {
    plSheet.addRow([`  ${entry.accountName}`, -entry.finalAmount])
    plSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  plSheet.addRow(['Total Cost of Sales', -incomeStatement.totalCostOfSales])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  plSheet.addRow(['GROSS PROFIT', incomeStatement.grossProfit])
  plSheet.getRow(row).font = { bold: true, size: 12 }
  plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } }
  plSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  // Operating Expenses
  plSheet.addRow(['OPERATING EXPENSES', ''])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  row++

  for (const entry of incomeStatement.operatingExpenses) {
    plSheet.addRow([`  ${entry.accountName}`, -entry.finalAmount])
    plSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  plSheet.addRow(['Total Operating Expenses', -incomeStatement.totalOperatingExpenses])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  plSheet.addRow(['OPERATING PROFIT', incomeStatement.operatingProfit])
  plSheet.getRow(row).font = { bold: true }
  plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE5FF' } }
  plSheet.getCell(`B${row}`).numFmt = currencyFormat
  row++

  // Finance Costs
  if (incomeStatement.financeCosts.length > 0) {
    plSheet.addRow(['FINANCE COSTS', ''])
    plSheet.getRow(row).font = { bold: true }
    plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
    row++

    for (const entry of incomeStatement.financeCosts) {
      plSheet.addRow([`  ${entry.accountName}`, -entry.finalAmount])
      plSheet.getCell(`B${row}`).numFmt = currencyFormat
      row++
    }

    plSheet.addRow(['PROFIT BEFORE TAX', incomeStatement.profitBeforeTax])
    plSheet.getRow(row).font = { bold: true }
    plSheet.getCell(`B${row}`).numFmt = currencyFormat
    row++
  }

  // Taxation
  if (incomeStatement.taxation.length > 0) {
    plSheet.addRow(['TAXATION', ''])
    plSheet.getRow(row).font = { bold: true }
    plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
    row++

    for (const entry of incomeStatement.taxation) {
      plSheet.addRow([`  ${entry.accountName}`, entry.finalAmount])
      plSheet.getCell(`B${row}`).numFmt = currencyFormat
      row++
    }
  }

  plSheet.addRow(['NET PROFIT / (LOSS)', incomeStatement.netProfit])
  plSheet.getRow(row).font = { bold: true, size: 12 }
  plSheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: incomeStatement.netProfit >= 0 ? 'FFCCFFCC' : 'FFFFCCCC' } }
  plSheet.getCell(`B${row}`).numFmt = currencyFormat

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
