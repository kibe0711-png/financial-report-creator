import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateBalanceSheet, generateIncomeStatement } from '@/lib/report-generator'
import { generateExcelReport } from '@/lib/excel-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { entries: true },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    const entries = project.entries.map(e => ({
      ...e,
      amount: Number(e.amount),
      adjustments: e.adjustments ? Number(e.adjustments) : null,
      finalAmount: Number(e.finalAmount),
    }))

    const balanceSheet = generateBalanceSheet(entries)
    const incomeStatement = generateIncomeStatement(entries)

    const buffer = await generateExcelReport(
      {
        name: project.name,
        companyName: project.companyName,
        periodEnd: project.periodEnd,
      },
      balanceSheet,
      incomeStatement
    )

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${project.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Financial_Report.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Excel export failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate Excel' },
      { status: 500 }
    )
  }
}
