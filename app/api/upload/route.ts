import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

interface EntryInput {
  accountCode: string
  accountName: string
  amount: number
  adjustments: number | null
  finalAmount: number
  classification: string
  reportSection: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, entries } = body as { projectId: string; entries: EntryInput[] }

    if (!projectId || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create entries in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing entries for this project (replace mode)
      await tx.entry.deleteMany({
        where: { projectId },
      })

      // Create new entries
      const created = await tx.entry.createMany({
        data: entries.map((entry) => ({
          projectId,
          accountCode: entry.accountCode || '',
          accountName: entry.accountName || '',
          amount: new Decimal(entry.amount || 0),
          adjustments: entry.adjustments != null ? new Decimal(entry.adjustments) : null,
          finalAmount: new Decimal(entry.finalAmount || 0),
          classification: entry.classification || 'unclassified',
          reportSection: entry.reportSection || 'balance_sheet',
          isManual: false,
        })),
      })

      // Update project timestamp
      await tx.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
      })

      return created
    })

    return NextResponse.json({
      success: true,
      data: { count: result.count },
    })
  } catch (error) {
    console.error('Failed to upload entries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload entries' },
      { status: 500 }
    )
  }
}
