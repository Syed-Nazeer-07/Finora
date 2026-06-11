#!/usr/bin/env python3
"""Generate favicon assets from logo.png"""
from PIL import Image
import os

LOGO_PATH = 'static/branding/logo.png'
OUTPUT_DIR = 'static'

def generate_favicons():
    if not os.path.exists(LOGO_PATH):
        print(f"❌ Logo not found: {LOGO_PATH}")
        return False
    
    logo = Image.open(LOGO_PATH)
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    print(f"✅ Logo loaded: {logo.size[0]}x{logo.size[1]}")
    
    # PNG sizes
    sizes = {
        'favicon-16x16.png': 16,
        'favicon-32x32.png': 32,
        'apple-touch-icon.png': 180,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
    }
    
    # Generate PNGs
    for filename, size in sizes.items():
        output_path = os.path.join(OUTPUT_DIR, filename)
        resized = logo.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(output_path, 'PNG', optimize=True)
        file_size = os.path.getsize(output_path)
        print(f"✅ {filename} ({size}x{size}) - {file_size:,} bytes")
    
    # Generate ICO
    ico_path = os.path.join(OUTPUT_DIR, 'favicon.ico')
    ico_images = [logo.resize((s, s), Image.Resampling.LANCZOS) for s in [16, 32, 48]]
    ico_images[0].save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    file_size = os.path.getsize(ico_path)
    print(f"✅ favicon.ico (16,32,48) - {file_size:,} bytes")
    
    return True

if __name__ == "__main__":
    if generate_favicons():
        print("\n✅ All favicons generated successfully")
    else:
        print("\n❌ Failed to generate favicons")
