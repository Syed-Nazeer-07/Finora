#!/usr/bin/env python3
"""
Generate favicon assets from WealthSync logo
"""
from PIL import Image
import os

LOGO_PATH = 'static/branding/logo.png'
SIZES = [16, 32, 48, 180, 192, 512]

def generate_favicons():
    if not os.path.exists(LOGO_PATH):
        print(f"Error: Logo not found at {LOGO_PATH}")
        return
    
    logo = Image.open(LOGO_PATH)
    print(f"Loaded logo: {logo.size[0]}x{logo.size[1]}")
    
    for size in SIZES:
        output_path = f'static/favicon-{size}x{size}.png'
        resized = logo.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(output_path, 'PNG', optimize=True)
        file_size = os.path.getsize(output_path)
        print(f"✓ Generated {output_path} ({file_size} bytes)")
    
    print("\n✓ All favicon assets generated successfully")

if __name__ == "__main__":
    generate_favicons()
