from PIL import Image
image = Image.open("chall.png")
image = image.convert("RGB")
pixels = image.getdata()
def msbb(a):
    return str((a & 128) >> 7)
with open("decoded_text_lsb.txt", "w") as f:
    binary_chunk = []
    for pixel in pixels:
        r, g, b = pixel
        binary_chunk.extend([str(r % 2), str(g % 2), str(b % 2)])
        while len(binary_chunk) >= 8:
            byte = ''.join(binary_chunk[:8])
            binary_chunk = binary_chunk[8:]
            char = chr(int(byte, 2))
            f.write(char)
with open("decoded_text_msb.txt", "w") as f:
    binary_chunk = []
    for pixel in pixels:
        r, g, b = pixel
        binary_chunk.extend([msbb(r), msbb(g), msbb(b)])
        while len(binary_chunk) >= 8:
            byte = ''.join(binary_chunk[:8])
            binary_chunk = binary_chunk[8:]
            char = chr(int(byte, 2))
            f.write(char)