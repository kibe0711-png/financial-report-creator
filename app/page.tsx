import Link from "next/link"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FolderOpen, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

async function getProjects() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { entries: true }
      }
    }
  })
  return projects
}

async function deleteProject(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.project.delete({ where: { id } })
  revalidatePath('/')
}

export default async function HomePage() {
  const projects = await getProjects()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your financial report projects
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first project to start generating financial reports
            </p>
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.companyName}</CardDescription>
                  </div>
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={project.id} />
                    <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period End:</span>
                    <span>{formatDate(project.periodEnd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entries:</span>
                    <span>{project._count.entries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" className="w-full">
                      Open Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
