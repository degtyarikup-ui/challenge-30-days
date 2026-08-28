import os
import math
from PIL import Image, ImageDraw, ImagePath

def create_flame_icon():
    size = 1024
    img = Image.new('RGBA', (size, size), (212, 255, 0, 255)) # Electric Lime #D4FF00
    
    # High-resolution supersampling for ultra-crisp edges (4x)
    scale = 4
    super_size = size * scale
    super_img = Image.new('RGBA', (super_size, super_size), (212, 255, 0, 255))
    draw = ImageDraw.Draw(super_img)

    # We will draw a stylish, high-contrast, modern flame silhouette in matte black
    # Centered at (512*scale, 530*scale)
    # Using smooth bezier curve coordinates
    
    cx = 512 * scale
    cy = 525 * scale
    s = 3.6 * scale # scale factor

    # Flame path points normalized around center
    # Classic sharp aesthetic flame with inner cut / checkmark
    raw_points = [
        # Outer flame contour
        (0, -110),    # Top sharp tip
        (35, -50),
        (65, 0),
        (85, 45),
        (80, 95),
        (55, 130),
        (15, 145),
        (-35, 140),
        (-75, 105),
        (-85, 55),
        (-80, 5),
        (-60, -35),
        (-35, -20),   # Left inner crest
        (-20, 20),
        (-5, 50),
        (10, 45),
        (25, 20),
        (20, -25),    # Right inner tongue
        (0, -70),
    ]

    # Convert to bezier curve polygon
    scaled_points = [(cx + px * s, cy + py * s) for px, py in raw_points]
    
    # Draw smooth filled matte black flame
    draw.polygon(scaled_points, fill=(18, 20, 24, 255))

    # Downsample with Lanczos for ultra high quality anti-aliasing
    final_img = super_img.resize((size, size), Image.Resampling.LANCZOS)

    # 1. Save to Desktop for Telegram Bot Avatar
    desktop_path = os.path.expanduser('~/Desktop/challenge_bot_avatar.png')
    final_img.save(desktop_path, 'PNG')
    print(f"Saved Desktop avatar: {desktop_path}")

    # 2. Save to client/public
    public_dir = os.path.abspath('client/public')
    os.makedirs(public_dir, exist_ok=True)

    # High-res PNG
    p1024 = os.path.join(public_dir, 'icon-1024.png')
    final_img.save(p1024, 'PNG')

    # Favicon 512, 192, 32
    final_img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    final_img.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon-192.png'), 'PNG')
    final_img.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon.png'), 'PNG')
    final_img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon.ico'), 'ICO')

    # 3. Create clean Vector SVG Favicon
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="112" fill="#D4FF00"/>
  <path d="M256 90C256 90 286 142 312 188C334 227 348 266 344 308C338 368 288 412 226 412C154 412 110 354 116 288C120 240 144 204 164 176C174 196 190 216 210 216C232 216 244 196 240 170C236 140 220 118 256 90Z" fill="#121418"/>
</svg>'''
    with open(os.path.join(public_dir, 'favicon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)

    print("Created all favicons and icons in client/public!")

if __name__ == '__main__':
    create_flame_icon()
