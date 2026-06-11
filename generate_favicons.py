#!/usr/bin/env python3
"""
Generate favicon assets from WealthSync logo - Simple transparent version
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
    
    # Convert to RGBA
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    # Generate each size - just resize logo directly
    for filename, size in SIZES.items():
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"Generating {filename} ({size}x{size})...")
        
        # Resize logo to fit in square, maintaining aspect ratio
        logo_copy = logo.copy()
        logo_copy.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Create transparent canvas
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Center the logo
        x = (size - logo_copy.width) // 2
        y = (size - logo_copy.height) // 2
        canvas.paste(logo_copy, (x, y), logo_copy)
        
        # Save
        canvas.save(output_path, 'PNG', optimize=True, quality=95)
        
        file_size = os.path.getsize(output_path)
        print(f"  ✓ Created {output_path} ({file_size:,} bytes)")
    
    # Generate favicon.ico with white background for browser compatibility
    ico_path = os.path.join(OUTPUT_DIR, 'favicon.ico')
    print(f"Generating favicon.ico (16, 32, 48 sizes)...")
    
    ico_images = []
    for ico_size in [(16, 16), (32, 32), (48, 48)]:
        # White background for .ico for better browser compatibility
        canvas = Image.new('RGBA', ico_size, (255, 255, 255, 255))
        logo_copy = logo.copy()
        logo_copy.thumbnail(ico_size, Image.Resampling.LANCZOS)
        x = (ico_size[0] - logo_copy.width) // 2
        y = (ico_size[1] - logo_copy.height) // 2
        canvas.paste(logo_copy, (x, y), logo_copy)
        ico_images.append(canvas)
    
    ico_images[0].save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    
    file_size = os.path.getsize(ico_path)
    print(f"  ✓ Created {ico_path} ({file_size:,} bytes)")
    
    print("\n✅ All favicon assets generated!")
    print("\nGenerated files:")
    for filename in list(SIZES.keys()) + ['favicon.ico']:
        path = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"  • {filename} - {size:,} bytes")

if __name__ == "__main__":
    generate_favicons()
