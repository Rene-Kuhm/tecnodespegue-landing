#!/bin/bash

# Simple OG image generation using ImageMagick
convert -size 1200x630 xc:"#0e0e0e" \
  -font "DejaVu-Sans-Bold" -pointsize 72 -fill white \
  -gravity northwest -annotate +100+140 "TecnoDespegue" \
  -font "DejaVu-Sans" -pointsize 36 -fill "#adaaaa" \
  -gravity northwest -annotate +100+240 "Desarrollo Fullstack" \
  -gravity northwest -annotate +100+290 "Automatizaciones con IA" \
  -gravity northwest -annotate +100+340 "Flujos de Trabajo Inteligentes" \
  -fill "#c1fffe" -stroke "#c1fffe" -strokewidth 2 \
  -draw "roundrectangle 100,460 320,510 8,8" \
  -font "DejaVu-Sans-Bold" -pointsize 14 -fill "#c1fffe" -stroke none \
  -gravity northwest -annotate +130+475 "IA-READY SOLUTIONS" \
  public/og-image.png

echo "✅ OG image created: public/og-image.png"
ls -lh public/og-image.png
