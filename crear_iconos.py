from PIL import Image, ImageDraw, ImageFont

def create_icon(size, file_name):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fondo azul
    color1 = (63, 81, 181, 255)
    color2 = (255, 106, 0, 255)
    for i in range(size):
        ratio = i / size
        r = int((1-ratio)*color1[0] + ratio*color2[0])
        g = int((1-ratio)*color1[1] + ratio*color2[1])
        b = int((1-ratio)*color1[2] + ratio*color2[2])
        draw.line((0, i, size, i), fill=(r, g, b, 255))

    # Marco redondo
    margin = int(size * 0.12)
    draw.rounded_rectangle(
        (margin, margin, size-margin, size-margin),
        radius=int(size*0.22),
        outline=(255,255,255,180),
        width=max(2, size//28),
        fill=(255,255,255,35)
    )

    # Letra U
    font_size = size // 2
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    text = "U"
    bbox = draw.textbbox((0,0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) / 2
    y = (size - th) / 2 - 5
    draw.text((x, y), text, font=font, fill=(255,255,255,255))

    img.save(file_name)

create_icon(192, "public/icons/icon-192.png")
create_icon(512, "public/icons/icon-512.png")
print("Iconos creados correctamente")