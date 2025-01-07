'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={processing}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors duration-300"
          >
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-700">
                {file ? file.name : 'Select an image'}
              </span>
            </div>
          </label>
        </div>
        <Button
          type="submit"
          disabled={!file || processing}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
        >
          {processing ? 'Processing...' : 'Process Image'}
        </Button>
      </form>
      {processing && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-center text-sm font-medium text-gray-600">{status}</p>
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4 animate-shake">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {downloadUrl && (
        <div className="mt-4 animate-fadeIn">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Success</AlertTitle>
            <AlertDescription className="text-green-600">
              Your file has been processed. Click below to download.
            </AlertDescription>
          </Alert>
          <Button asChild className="mt-4 w-full bg-green-500 hover:bg-green-600 transition-all duration-300 transform hover:scale-105">
            <a href={downloadUrl} download="processed_image.bin">
              Download Processed File
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}

