import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { generateBalanceSheet, generateIncomeStatement } from '@/lib/report-generator'
import { ExportButtons } from '@/components/export-buttons'

interface ReportsPageProps {
  params: Promise<{ id: string }>
}

async function getProjectWithEntries(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      entries: true,
    },
  })
  return project
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { id } = await params
  const project = await getProjectWithEntries(id)

  if (!project) {
    notFound()
  }

  const entries = project.entries.map(e => ({
    ...e,
    amount: Number(e.amount),
    adjustments: e.adjustments ? Number(e.adjustments) : null,
    finalAmount: Number(e.finalAmount),
  }))

  const balanceSheet = generateBalanceSheet(entries)
  const incomeStatement = generateIncomeStatement(entries)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            {project.companyName} - Period ending {formatDate(project.periodEnd)}
          </p>
        </div>
        <ExportButtons projectId={id} />
      </div>

      {/* Balance Sheet */}
      <Card>
        <CardHeader>
          <CardTitle>Statement of Financial Position (Balance Sheet)</CardTitle>
          <p className="text-sm text-muted-foreground">
            As at {formatDate(project.periodEnd)}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Assets */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">ASSETS</TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold pl-4">Non-Current Assets</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {balanceSheet.nonCurrentAssets.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-8">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(entry.finalAmount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t">
                <TableCell className="pl-4 font-medium">Total Non-Current Assets</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(balanceSheet.nonCurrentAssets.reduce((s, e) => s + e.finalAmount, 0))}
                </TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold pl-4">Current Assets</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {balanceSheet.currentAssets.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-8">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(entry.finalAmount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t">
                <TableCell className="pl-4 font-medium">Total Current Assets</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(balanceSheet.currentAssets.reduce((s, e) => s + e.finalAmount, 0))}
                </TableCell>
              </TableRow>

              <TableRow className="bg-primary/10 border-t-2">
                <TableCell className="font-bold">TOTAL ASSETS</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatCurrency(balanceSheet.totalAssets)}</TableCell>
              </TableRow>

              {/* Liabilities */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">LIABILITIES</TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold pl-4">Non-Current Liabilities</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {balanceSheet.nonCurrentLiabilities.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-8">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(Math.abs(entry.finalAmount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t">
                <TableCell className="pl-4 font-medium">Total Non-Current Liabilities</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(Math.abs(balanceSheet.nonCurrentLiabilities.reduce((s, e) => s + e.finalAmount, 0)))}
                </TableCell>
              </TableRow>

              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold pl-4">Current Liabilities</TableCell>
                <TableCell></TableCell>
              </TableRow>
              {balanceSheet.currentLiabilities.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-8">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(Math.abs(entry.finalAmount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t">
                <TableCell className="pl-4 font-medium">Total Current Liabilities</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCurrency(Math.abs(balanceSheet.currentLiabilities.reduce((s, e) => s + e.finalAmount, 0)))}
                </TableCell>
              </TableRow>

              <TableRow className="border-t">
                <TableCell className="font-bold">TOTAL LIABILITIES</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatCurrency(Math.abs(balanceSheet.totalLiabilities))}</TableCell>
              </TableRow>

              {/* Equity */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">EQUITY</TableCell>
              </TableRow>
              {balanceSheet.equity.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-4">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(Math.abs(entry.finalAmount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t">
                <TableCell className="font-bold">TOTAL EQUITY</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatCurrency(Math.abs(balanceSheet.totalEquity))}</TableCell>
              </TableRow>

              <TableRow className="bg-primary/10 border-t-2">
                <TableCell className="font-bold">TOTAL LIABILITIES AND EQUITY</TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {formatCurrency(Math.abs(balanceSheet.totalLiabilitiesAndEquity))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Income Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Statement of Profit or Loss (Income Statement)</CardTitle>
          <p className="text-sm text-muted-foreground">
            For the period ending {formatDate(project.periodEnd)}
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Revenue */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">REVENUE</TableCell>
              </TableRow>
              {incomeStatement.revenue.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-4">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(Math.abs(entry.finalAmount))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t bg-muted/30">
                <TableCell className="font-medium">Total Revenue</TableCell>
                <TableCell className="text-right font-mono font-medium">{formatCurrency(incomeStatement.totalRevenue)}</TableCell>
              </TableRow>

              {/* Cost of Sales */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">COST OF SALES</TableCell>
              </TableRow>
              {incomeStatement.costOfSales.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-4">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">({formatCurrency(entry.finalAmount)})</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t bg-muted/30">
                <TableCell className="font-medium">Total Cost of Sales</TableCell>
                <TableCell className="text-right font-mono font-medium">({formatCurrency(incomeStatement.totalCostOfSales)})</TableCell>
              </TableRow>

              <TableRow className="bg-green-50 border-t-2">
                <TableCell className="font-bold">GROSS PROFIT</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatCurrency(incomeStatement.grossProfit)}</TableCell>
              </TableRow>

              {/* Operating Expenses */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2} className="font-bold">OPERATING EXPENSES</TableCell>
              </TableRow>
              {incomeStatement.operatingExpenses.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="pl-4">{entry.accountName}</TableCell>
                  <TableCell className="text-right font-mono">({formatCurrency(entry.finalAmount)})</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t bg-muted/30">
                <TableCell className="font-medium">Total Operating Expenses</TableCell>
                <TableCell className="text-right font-mono font-medium">({formatCurrency(incomeStatement.totalOperatingExpenses)})</TableCell>
              </TableRow>

              <TableRow className="bg-blue-50 border-t">
                <TableCell className="font-bold">OPERATING PROFIT</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatCurrency(incomeStatement.operatingProfit)}</TableCell>
              </TableRow>

              {/* Finance Costs */}
              {incomeStatement.financeCosts.length > 0 && (
                <>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={2} className="font-bold">FINANCE COSTS</TableCell>
                  </TableRow>
                  {incomeStatement.financeCosts.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-4">{entry.accountName}</TableCell>
                      <TableCell className="text-right font-mono">({formatCurrency(entry.finalAmount)})</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t">
                    <TableCell className="font-medium">PROFIT BEFORE TAX</TableCell>
                    <TableCell className="text-right font-mono font-medium">{formatCurrency(incomeStatement.profitBeforeTax)}</TableCell>
                  </TableRow>
                </>
              )}

              {/* Taxation */}
              {incomeStatement.taxation.length > 0 && (
                <>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={2} className="font-bold">TAXATION</TableCell>
                  </TableRow>
                  {incomeStatement.taxation.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-4">{entry.accountName}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(entry.finalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              <TableRow className="bg-primary/10 border-t-2">
                <TableCell className="font-bold text-lg">NET PROFIT / (LOSS)</TableCell>
                <TableCell className={`text-right font-mono font-bold text-lg ${incomeStatement.netProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {incomeStatement.netProfit < 0 ? `(${formatCurrency(Math.abs(incomeStatement.netProfit))})` : formatCurrency(incomeStatement.netProfit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
