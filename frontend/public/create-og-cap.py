#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import sys

# Create 1200x630 OG image
width, height = 1200, 630
img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

# Purple gradient background  
for y in range(height):
    ratio = y / height
    r = int(102 + (118 - 102) * ratio)
    g = int(126 + (75 - 126) * ratio)
    b = int(234 + (162 - 234) * ratio)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Try multiple font paths for emoji support
emoji_fonts = [
    "/System/Library/Fonts/Apple Color Emoji.ttc",
    "/System/Library/Fonts/Supplemental/AppleColorEmoji.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
]

emoji = "🧢"
font = None

for font_path in emoji_fonts:
    try:
        # Try smaller size first
        font = ImageFont.truetype(font_path, 320)
        # Test if it can render emoji
        draw.text((0, 0), emoji, font=font, fill='white')
        print(f"✅ Using font: {font_path}")
        break
    except:
        continue

if font:
    # Clear and redraw background
    for y in range(height):
        ratio = y / height
        r = int(102 + (118 - 102) * ratio)
        g = int(126 + (75 - 126) * ratio)
        b = int(234 + (162 - 234) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Center the emoji
    bbox = font.getbbox(emoji)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), emoji, font=font, fill='white', embedded_color=True)
else:
    print("⚠️  No emoji font found, using text instead")
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 180)
    except:
        font = ImageFont.load_default()
    
    text = "FB"
    bbox = font.getbbox(text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text, font=font, fill='white')

img.save('og-cap-image.png', 'PNG', optimize=True, quality=95)
print(f"✅ Created og-cap-image.png")
