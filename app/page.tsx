import ImageUploader from '@/components/ImageUploader'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Large Image Processor</h1>
      <ImageUploader />
    </main>
  )
}