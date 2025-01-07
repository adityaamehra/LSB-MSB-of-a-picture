from PIL import Image
import io

def msbb(a):
    return str((a & 128) >> 7)

def decode_image(image_data):
    # Open the image from the provided byte data
    image = Image.open(io.BytesIO(image_data))
    image = image.convert("RGB")
    pixels = image.getdata()

    # LSB Decoding
    lsb_decoded_text = []
    binary_chunk = []
    for pixel in pixels:
        r, g, b = pixel
        binary_chunk.extend([str(r % 2), str(g % 2), str(b % 2)])
        while len(binary_chunk) >= 8:
            byte = ''.join(binary_chunk[:8])
            binary_chunk = binary_chunk[8:]
            char = chr(int(byte, 2))
            lsb_decoded_text.append(char)

    # MSB Decoding
    msb_decoded_text = []
    binary_chunk = []
    for pixel in pixels:
        r, g, b = pixel
        binary_chunk.extend([msbb(r), msbb(g), msbb(b)])
        while len(binary_chunk) >= 8:
            byte = ''.join(binary_chunk[:8])
            binary_chunk = binary_chunk[8:]
            char = chr(int(byte, 2))
            msb_decoded_text.append(char)

    # Return the LSB and MSB decoded text as separate files
    return ''.join(lsb_decoded_text), ''.join(msb_decoded_text)

if __name__ == "__main__":
    import sys
    image_path = sys.argv[1]
    output_lsb_path = sys.argv[2]
    output_msb_path = sys.argv[3]

    # Read the image data
    with open(image_path, 'rb') as image_file:
        image_data = image_file.read()

    # Decode the image
    lsb_text, msb_text = decode_image(image_data)

    # Write the LSB decoded text to a file
    with open(output_lsb_path, 'w') as lsb_file:
        lsb_file.write(lsb_text)

    # Write the MSB decoded text to a file
    with open(output_msb_path, 'w') as msb_file:
        msb_file.write(msb_text)
