import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

// Define the runtime (Next.js 13+ way)
export const runtime = 'nodejs'  // This specifies the environment your API will use

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

    // If the Python script printed out data, capture it
    const pythonOutput = stdout.trim()

    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })
    console.log('Cleaned up temporary directory')

    // Send the Python script output as a response to the client
    return NextResponse.json({
      message: 'Image processed successfully!',
      pythonOutput: pythonOutput,
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
