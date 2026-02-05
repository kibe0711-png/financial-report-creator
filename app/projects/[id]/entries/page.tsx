import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Upload } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ManualEntryForm } from '@/components/manual-entry-form'

interface EntriesPageProps {
  params: Promise<{ id: string }>
}

async function getProjectWithEntries(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { accountCode: 'asc' },
      },
    },
  })
  return project
}

export default async function EntriesPage({ params }: EntriesPageProps) {
  const { id } = await params
  const project = await getProjectWithEntries(id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold">Entries</h1>
          <p className="text-muted-foreground">{project.entries.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${id}/upload`}>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {project.entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No entries yet.</p>
                  <p className="text-sm mt-2">Upload a CSV or add entries manually.</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Final Amount</TableHead>
                        <TableHead>Classification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-xs">
                            {entry.accountCode}
                            {entry.isManual && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                manual
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm max-w-xs truncate">
                            {entry.accountName}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(Number(entry.amount))}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(Number(entry.finalAmount))}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                entry.classification === 'unclassified'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : entry.reportSection === 'pnl'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {entry.classification.replace(/_/g, ' ').replace('bs ', '').replace('pnl ', '')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ManualEntryForm projectId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
