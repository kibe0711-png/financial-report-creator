import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    const entries = await prisma.entry.findMany({
      where: { projectId },
      orderBy: { accountCode: 'asc' },
      select: {
        id: true,
        accountCode: true,
        accountName: true,
        amount: true,
        adjustments: true,
        finalAmount: true,
        classification: true,
        reportSection: true,
      },
    })

    return NextResponse.json({ success: true, data: entries })
  } catch (error) {
    console.error('Failed to fetch entries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body as {
      updates: Array<{ id: string; classification: string; reportSection: string }>
    }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required' },
        { status: 400 }
      )
    }

    // Update entries in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.entry.update({
          where: { id: update.id },
          data: {
            classification: update.classification,
            reportSection: update.reportSection,
          },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update classifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update classifications' },
      { status: 500 }
    )
  }
}
