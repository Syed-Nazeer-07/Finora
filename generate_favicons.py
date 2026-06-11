#!/usr/bin/env python3
"""
Generate favicon assets from WealthSync logo with proper sizing
"""
from PIL import Image, ImageDraw
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
    
    # Create a square canvas with the logo centered and properly sized
    # Use 85% of the canvas for the logo to ensure good visibility
    for filename, size in SIZES.items():
        output_path = os.path.join(OUTPUT_DIR, filename)
        print(f"Generating {filename} ({size}x{size})...")
        
        # Create square canvas with white background
        canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        
        # Calculate logo size (85% of canvas to leave some padding)
        logo_size = int(size * 0.85)
        
        # Resize logo maintaining aspect ratio
        logo_resized = logo.copy()
        logo_resized.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Center the logo on canvas
        x = (size - logo_resized.width) // 2
        y = (size - logo_resized.height) // 2
        
        # Paste logo on canvas
        canvas.paste(logo_resized, (x, y), logo_resized if logo_resized.mode == 'RGBA' else None)
        
        # Save
        canvas.save(output_path, 'PNG', optimize=True, quality=95)
        
        file_size = os.path.getsize(output_path)
        print(f"  ✓ Created {output_path} ({file_size:,} bytes)")
    
    # Generate favicon.ico (multi-resolution)
    ico_path = os.path.join(OUTPUT_DIR, 'favicon.ico')
    print(f"Generating favicon.ico (16, 32, 48 sizes)...")
    
    ico_images = []
    for ico_size in [(16, 16), (32, 32), (48, 48)]:
        canvas = Image.new('RGBA', ico_size, (255, 255, 255, 255))
        logo_size = int(ico_size[0] * 0.85)
        logo_resized = logo.copy()
        logo_resized.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
        x = (ico_size[0] - logo_resized.width) // 2
        y = (ico_size[1] - logo_resized.height) // 2
        canvas.paste(logo_resized, (x, y), logo_resized if logo_resized.mode == 'RGBA' else None)
        ico_images.append(canvas)
    
    ico_images[0].save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    
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
