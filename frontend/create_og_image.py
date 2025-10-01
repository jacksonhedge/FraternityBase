from PIL import Image, ImageDraw, ImageFont
import os

# Create a 1200x630 image with blue background
img = Image.new('RGB', (1200, 630), color='#3B82F6')
draw = ImageDraw.Draw(img)

# Try to use a system font that supports emojis
try:
    # macOS emoji font
    font = ImageFont.truetype('/System/Library/Fonts/Apple Color Emoji.ttc', 400)
except:
    try:
        # Fallback to default
        font = ImageFont.truetype('/Library/Fonts/Arial Unicode.ttf', 400)
    except:
        font = ImageFont.load_default()

# Draw the cap emoji in the center
text = "🧢"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

x = (1200 - text_width) // 2
y = (630 - text_height) // 2

draw.text((x, y), text, font=font, embedded_color=True)

# Save the image
output_path = '/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/public/og-image.png'
img.save(output_path)
print(f"✅ Created {output_path}")
