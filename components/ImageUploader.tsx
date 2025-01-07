'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setProcessing(true)
    setError(null)
    setDownloadUrl(null)
    setProgress(0)
    setStatus('Uploading file...')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      setStatus('Processing image...')
      setProgress(50)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      setProgress(100)
      setStatus('Processing complete')
    } catch (err) {
      setError('An error occurred while processing the image.')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={processing}
        />
        <Button type="submit" disabled={!file || processing}>
          {processing ? 'Processing...' : 'Process Image'}
        </Button>
      </form>
      {processing && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2">{status}</p>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {downloadUrl && (
        <div className="mt-4">
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your file has been processed. Click below to download.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-2">
            <a href={downloadUrl} download="processed_image.bin">
              Download Processed File
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}

