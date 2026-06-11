#!/usr/bin/env python3
"""
Generate favicon assets from WealthSync logo
"""
from PIL import Image
import os

LOGO_PATH = 'static/branding/logo.png'
OUTPUT_DIR = 'static'
SIZES = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

def generate_favicons():
    if not os.path.exists(LOGO_PATH):
        print(f"Error: Logo not found at {LOGO_PATH}")
        return
    
    print(f"Loading logo from {LOGO_PATH}...")
    logo = Image.open(LOGO_PATH)
    print(f"✓ Logo loaded: {logo.size[0]}x{logo.size[1]} pixels")
    
    # Convert to RGBA if needed
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    for filename, size in SIZES.items():
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"Generating {filename} ({size}x{size})...")
        
        # High-quality resize
        resized = logo.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(output_path, 'PNG', optimize=True, quality=95)
        
        file_size = os.path.getsize(output_path)
        print(f"  ✓ Created {output_path} ({file_size:,} bytes)")
    
    # Generate favicon.ico (multi-resolution)
    ico_path = os.path.join(OUTPUT_DIR, 'favicon.ico')
    print(f"Generating favicon.ico (16, 32, 48 sizes)...")
    
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [logo.resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
    ico_images[0].save(ico_path, format='ICO', sizes=ico_sizes)
    
    file_size = os.path.getsize(ico_path)
    print(f"  ✓ Created {ico_path} ({file_size:,} bytes)")
    
    print("\n✅ All favicon assets generated successfully!")
    print("\nGenerated files:")
    for filename in list(SIZES.keys()) + ['favicon.ico']:
        path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"  • {filename} - {size:,} bytes")

if __name__ == "__main__":
    generate_favicons()
