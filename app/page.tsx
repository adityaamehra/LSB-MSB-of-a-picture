import ImageUploader from '@/components/ImageUploader'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Magical Image Processor
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Transform your images into binary wonders with just a click!
        </p>
        <ImageUploader />
      </div>
    </main>
  )
}

