import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    console.log('Received image processing request')
    const formData = await req.formData()
    const image = formData.get('image') as File

    if (!image) {
      console.log('No image provided')
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    console.log(`Received image: ${image.name}, size: ${image.size} bytes`)

    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'image-processor-'))
    console.log(`Created temporary directory: ${tempDir}`)

    const inputPath = path.join(tempDir, 'input.jpg')
    const outputPath = path.join(tempDir, 'output.bin')

    // Write the uploaded file to the temporary directory
    const bytes = await image.arrayBuffer()
    await fs.writeFile(inputPath, Buffer.from(bytes))
    console.log(`Wrote input file to: ${inputPath}`)

    // Run the Python script
    console.log('Starting Python script execution')
    const { stdout, stderr } = await execAsync(`python3 process_image.py "${inputPath}" "${outputPath}"`)
    console.log('Python script output:', stdout)
    if (stderr) {
      console.error('Python script error:', stderr)
    }

    // Read the processed file
    const processedData = await fs.readFile(outputPath)
    console.log(`Read processed file: ${outputPath}, size: ${processedData.length} bytes`)

    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })
    console.log('Cleaned up temporary directory')

    // Send the processed data as a downloadable file
    console.log('Sending processed data to client')
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

