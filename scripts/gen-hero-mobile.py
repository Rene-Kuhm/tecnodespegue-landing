from PIL import Image
import os

src = r'C:\Users\insyd\Desktop\tecnodespegue-landing\public\hero-mockup.webp'
mobile_path = r'C:\Users\insyd\Desktop\tecnodespegue-landing\public\hero-mockup-mobile.webp'
mobile_jpg_path = r'C:\Users\insyd\Desktop\tecnodespegue-landing\public\hero-mockup-mobile.jpg'

img = Image.open(src)
print(f'Original: {img.size}')

# Mobile necesita ~720px max con DPR 1, ~1440px con DPR 2
# Generamos 800px wide (cubre DPR 1 y DPR 2 con margen)
mobile = img.resize((800, 536), Image.LANCZOS)
mobile.save(mobile_path, 'WEBP', quality=85, method=6)
print(f'Mobile WebP: {os.path.getsize(mobile_path) / 1024:.1f} KB')

# Tambien JPG fallback
mobile.save(mobile_jpg_path, 'JPEG', quality=85, optimize=True, progressive=True)
print(f'Mobile JPG: {os.path.getsize(mobile_jpg_path) / 1024:.1f} KB')
