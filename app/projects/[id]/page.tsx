import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, List, Tags, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ProjectPageProps {
  params: { id: string }
}

async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { entries: true }
      },
      entries: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  return project
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.id)

  if (!project) {
    notFound()
  }

  const steps = [
    {
      title: 'Upload CSV',
      description: 'Import trial balance data from a CSV file',
      icon: Upload,
      href: `/projects/${project.id}/upload`,
      status: project._count.entries > 0 ? 'complete' : 'current',
    },
    {
      title: 'View & Edit Entries',
      description: 'Review imported data and add manual entries',
      icon: List,
      href: `/projects/${project.id}/entries`,
      status: project._count.entries > 0 ? 'current' : 'pending',
    },
    {
      title: 'Classify Accounts',
      description: 'Tag accounts for Balance Sheet or P&L',
      icon: Tags,
      href: `/projects/${project.id}/classify`,
      status: project._count.entries > 0 ? 'current' : 'pending',
    },
    {
      title: 'Generate Reports',
      description: 'Create and export financial statements',
      icon: FileText,
      href: `/projects/${project.id}/reports`,
      status: project._count.entries > 0 ? 'current' : 'pending',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.companyName}</p>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Period End</div>
            <div className="font-medium">{formatDate(project.periodEnd)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Entries</dt>
                <dd className="font-medium">{project._count.entries}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDate(project.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Updated</dt>
                <dd>{formatDate(project.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/projects/${project.id}/upload`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/reports`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Workflow</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Link key={step.title} href={step.href}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      step.status === 'complete' ? 'bg-green-100 text-green-600' :
                      step.status === 'current' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Step {index + 1}</div>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
