import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
export const runtime = 'edge'; // or 'nodejs'


const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'image-processor-'))
    const inputPath = path.join(tempDir, 'input.jpg')
    const outputPath = path.join(tempDir, 'output.bin')

    // Write the uploaded file to the temporary directory
    const bytes = await image.arrayBuffer()
    await fs.writeFile(inputPath, Buffer.from(bytes))

    // Run the Python script
    await execAsync(`python3 process_image.py "${inputPath}" "${outputPath}"`)

    // Read the processed file
    const processedData = await fs.readFile(outputPath)

    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })

    // Send the processed data as a downloadable file
    return new NextResponse(processedData, {
      headers: {
        'Content-Disposition': 'attachment; filename="processed_image.bin"',
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}