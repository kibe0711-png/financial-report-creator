'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CSVUploader } from '@/components/csv-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UploadPageProps {
  params: { id: string }
}

export default function UploadPage({ params }: UploadPageProps) {
  const { id } = params
  const router = useRouter()

  const handleUploadComplete = () => {
    router.push(`/projects/${id}/classify`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`/projects/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Project
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Upload Trial Balance CSV</CardTitle>
          <CardDescription>
            Import your trial balance data from a CSV file. The system will automatically
            detect column mappings and classify accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CSVUploader projectId={id} onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>
    </div>
  )
}
