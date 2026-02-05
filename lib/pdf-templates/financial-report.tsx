import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { BalanceSheetData, IncomeStatementData } from '@/types'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  reportDate: {
    fontSize: 10,
    color: '#666',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 6,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 6,
    backgroundColor: '#fafafa',
  },
  sectionHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 8,
    fontWeight: 'bold',
  },
  subSectionHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 6,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 8,
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#333',
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: '#d4edda',
  },
  descCol: {
    flex: 3,
  },
  amountCol: {
    flex: 1,
    textAlign: 'right',
  },
  indented: {
    paddingLeft: 20,
  },
  pageBreak: {
    marginTop: 30,
  },
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

interface FinancialReportPDFProps {
  project: {
    name: string
    companyName: string
    periodEnd: Date
  }
  balanceSheet: BalanceSheetData
  incomeStatement: IncomeStatementData
}

export function FinancialReportPDF({ project, balanceSheet, incomeStatement }: FinancialReportPDFProps) {
  return (
    <Document>
      {/* Balance Sheet */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{project.companyName}</Text>
          <Text style={styles.reportTitle}>Statement of Financial Position</Text>
          <Text style={styles.reportDate}>As at {formatDate(project.periodEnd)}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.descCol}>Description</Text>
            <Text style={styles.amountCol}>Amount</Text>
          </View>

          {/* ASSETS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.descCol}>ASSETS</Text>
            <Text style={styles.amountCol}></Text>
          </View>

          {/* Non-Current Assets */}
          <View style={styles.subSectionHeader}>
            <Text style={styles.descCol}>Non-Current Assets</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {balanceSheet.nonCurrentAssets.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>{formatCurrency(entry.finalAmount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Non-Current Assets</Text>
            <Text style={styles.amountCol}>
              {formatCurrency(balanceSheet.nonCurrentAssets.reduce((s, e) => s + e.finalAmount, 0))}
            </Text>
          </View>

          {/* Current Assets */}
          <View style={styles.subSectionHeader}>
            <Text style={styles.descCol}>Current Assets</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {balanceSheet.currentAssets.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>{formatCurrency(entry.finalAmount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Current Assets</Text>
            <Text style={styles.amountCol}>
              {formatCurrency(balanceSheet.currentAssets.reduce((s, e) => s + e.finalAmount, 0))}
            </Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.descCol}>TOTAL ASSETS</Text>
            <Text style={styles.amountCol}>{formatCurrency(balanceSheet.totalAssets)}</Text>
          </View>

          {/* LIABILITIES */}
          <View style={[styles.sectionHeader, { marginTop: 15 }]}>
            <Text style={styles.descCol}>LIABILITIES</Text>
            <Text style={styles.amountCol}></Text>
          </View>

          {/* Non-Current Liabilities */}
          <View style={styles.subSectionHeader}>
            <Text style={styles.descCol}>Non-Current Liabilities</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {balanceSheet.nonCurrentLiabilities.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>{formatCurrency(Math.abs(entry.finalAmount))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Non-Current Liabilities</Text>
            <Text style={styles.amountCol}>
              {formatCurrency(Math.abs(balanceSheet.nonCurrentLiabilities.reduce((s, e) => s + e.finalAmount, 0)))}
            </Text>
          </View>

          {/* Current Liabilities */}
          <View style={styles.subSectionHeader}>
            <Text style={styles.descCol}>Current Liabilities</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {balanceSheet.currentLiabilities.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>{formatCurrency(Math.abs(entry.finalAmount))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Current Liabilities</Text>
            <Text style={styles.amountCol}>
              {formatCurrency(Math.abs(balanceSheet.currentLiabilities.reduce((s, e) => s + e.finalAmount, 0)))}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.descCol}>TOTAL LIABILITIES</Text>
            <Text style={styles.amountCol}>{formatCurrency(Math.abs(balanceSheet.totalLiabilities))}</Text>
          </View>

          {/* EQUITY */}
          <View style={[styles.sectionHeader, { marginTop: 15 }]}>
            <Text style={styles.descCol}>EQUITY</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {balanceSheet.equity.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>{formatCurrency(Math.abs(entry.finalAmount))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>TOTAL EQUITY</Text>
            <Text style={styles.amountCol}>{formatCurrency(Math.abs(balanceSheet.totalEquity))}</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.descCol}>TOTAL LIABILITIES AND EQUITY</Text>
            <Text style={styles.amountCol}>{formatCurrency(Math.abs(balanceSheet.totalLiabilitiesAndEquity))}</Text>
          </View>
        </View>
      </Page>

      {/* Income Statement */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{project.companyName}</Text>
          <Text style={styles.reportTitle}>Statement of Profit or Loss</Text>
          <Text style={styles.reportDate}>For the period ending {formatDate(project.periodEnd)}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.descCol}>Description</Text>
            <Text style={styles.amountCol}>Amount</Text>
          </View>

          {/* Revenue */}
          <View style={styles.sectionHeader}>
            <Text style={styles.descCol}>REVENUE</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {incomeStatement.revenue.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>{formatCurrency(Math.abs(entry.finalAmount))}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Revenue</Text>
            <Text style={styles.amountCol}>{formatCurrency(incomeStatement.totalRevenue)}</Text>
          </View>

          {/* Cost of Sales */}
          <View style={styles.sectionHeader}>
            <Text style={styles.descCol}>COST OF SALES</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {incomeStatement.costOfSales.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>({formatCurrency(entry.finalAmount)})</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Cost of Sales</Text>
            <Text style={styles.amountCol}>({formatCurrency(incomeStatement.totalCostOfSales)})</Text>
          </View>

          <View style={styles.grandTotalRow}>
            <Text style={styles.descCol}>GROSS PROFIT</Text>
            <Text style={styles.amountCol}>{formatCurrency(incomeStatement.grossProfit)}</Text>
          </View>

          {/* Operating Expenses */}
          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <Text style={styles.descCol}>OPERATING EXPENSES</Text>
            <Text style={styles.amountCol}></Text>
          </View>
          {incomeStatement.operatingExpenses.map((entry, i) => (
            <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
              <Text style={styles.amountCol}>({formatCurrency(entry.finalAmount)})</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.descCol}>Total Operating Expenses</Text>
            <Text style={styles.amountCol}>({formatCurrency(incomeStatement.totalOperatingExpenses)})</Text>
          </View>

          <View style={[styles.grandTotalRow, { backgroundColor: '#cce5ff' }]}>
            <Text style={styles.descCol}>OPERATING PROFIT</Text>
            <Text style={styles.amountCol}>{formatCurrency(incomeStatement.operatingProfit)}</Text>
          </View>

          {/* Finance Costs */}
          {incomeStatement.financeCosts.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.descCol}>FINANCE COSTS</Text>
                <Text style={styles.amountCol}></Text>
              </View>
              {incomeStatement.financeCosts.map((entry, i) => (
                <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
                  <Text style={styles.amountCol}>({formatCurrency(entry.finalAmount)})</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.descCol}>PROFIT BEFORE TAX</Text>
                <Text style={styles.amountCol}>{formatCurrency(incomeStatement.profitBeforeTax)}</Text>
              </View>
            </>
          )}

          {/* Taxation */}
          {incomeStatement.taxation.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Text style={styles.descCol}>TAXATION</Text>
                <Text style={styles.amountCol}></Text>
              </View>
              {incomeStatement.taxation.map((entry, i) => (
                <View key={entry.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.descCol, styles.indented]}>{entry.accountName}</Text>
                  <Text style={styles.amountCol}>{formatCurrency(entry.finalAmount)}</Text>
                </View>
              ))}
            </>
          )}

          <View style={[styles.grandTotalRow, { backgroundColor: incomeStatement.netProfit >= 0 ? '#d4edda' : '#f8d7da' }]}>
            <Text style={styles.descCol}>NET PROFIT / (LOSS)</Text>
            <Text style={styles.amountCol}>
              {incomeStatement.netProfit < 0
                ? `(${formatCurrency(Math.abs(incomeStatement.netProfit))})`
                : formatCurrency(incomeStatement.netProfit)
              }
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
