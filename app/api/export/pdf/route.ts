import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateBalanceSheet, generateIncomeStatement } from '@/lib/report-generator'
import ReactPDF from '@react-pdf/renderer'
import { FinancialReportPDF } from '@/lib/pdf-templates/financial-report'

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

    const pdfStream = await ReactPDF.renderToStream(
      FinancialReportPDF({
        project: {
          name: project.name,
          companyName: project.companyName,
          periodEnd: project.periodEnd,
        },
        balanceSheet,
        incomeStatement,
      })
    )

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${project.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Financial_Report.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
