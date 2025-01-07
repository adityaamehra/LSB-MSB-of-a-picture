export async function POST(req: NextRequest) {
  try {
    // Log incoming request
    console.log("Received POST request for image processing");

    const formData = await req.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log(`Received image: ${image.name}, size: ${image.size}`);

    const imageBuffer = await image.arrayBuffer();
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'image-processor-'));
    const inputPath = path.join(tempDir, 'input_image.jpg');
    const outputLsbPath = path.join(tempDir, 'decoded_lsb.txt');
    const outputMsbPath = path.join(tempDir, 'decoded_msb.txt');

    console.log(`Input path: ${inputPath}`);
    console.log(`Output LSB path: ${outputLsbPath}`);
    console.log(`Output MSB path: ${outputMsbPath}`);

    await fs.writeFile(inputPath, Buffer.from(imageBuffer));

    // Log before running Python script
    console.log('Running Python script...');
    const { stdout, stderr } = await execAsync(`python3 process_image.py "${inputPath}" "${outputLsbPath}" "${outputMsbPath}"`);
    console.log('Python script stdout:', stdout);
    if (stderr) {
      console.error('Python script stderr:', stderr);
    }

    const lsbData = await fs.readFile(outputLsbPath);
    const msbData = await fs.readFile(outputMsbPath);

    await fs.rm(tempDir, { recursive: true, force: true });

    return new NextResponse([lsbData, msbData], {
      headers: {
        'Content-Disposition': 'attachment; filename="decoded_lsb.txt"',
        'Content-Type': 'application/octet-stream',
      },
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}

