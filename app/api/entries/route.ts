import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      projectId,
      accountCode,
      accountName,
      amount,
      adjustments,
      classification,
      reportSection,
      isManual,
    } = body

    if (!projectId || !accountCode || !accountName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const finalAmount = (amount || 0) + (adjustments || 0)

    const entry = await prisma.entry.create({
      data: {
        projectId,
        accountCode,
        accountName,
        amount: new Decimal(amount || 0),
        adjustments: adjustments != null ? new Decimal(adjustments) : null,
        finalAmount: new Decimal(finalAmount),
        classification: classification || 'unclassified',
        reportSection: reportSection || 'balance_sheet',
        isManual: isManual ?? true,
      },
    })

    // Update project timestamp
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Failed to create entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, classification, reportSection } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        classification,
        reportSection,
      },
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Failed to update entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    await prisma.entry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}
