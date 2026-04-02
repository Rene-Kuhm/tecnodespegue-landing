# TecnoDespegue Landing

> "The Neon Architect" - High-Resolution Noir landing page for TecnoDespegue

Modern, minimalist landing page built with intentional asymmetry and atmospheric depth. Moving away from template-heavy looks toward a bespoke, engineered feel that mirrors the quality of code being produced.

## 🎨 Design System: Editorial Technicality

### Creative North Star
**"The Neon Architect"** - Bridging high-end editorial layouts with raw technical precision through:
- Intentional asymmetry
- Atmospheric depth via tonal layering
- No-line rule (negative space over borders)
- Glass & gradient effects
- Ambient digital glows

### Color Palette
```
Primary (Electric Cyan): #c1fffe / #00ffff
Secondary (Neon Green): #00fd87 / #00ff88
Background: #0e0e0e (the void)
Surface Container: #1a1919 (elevated cards)
On Surface Variant: #adaaaa (secondary text - never pure white)
```

### Typography
- **Headlines**: Space Grotesk (bold statements)
- **Body**: Inter (Swiss legibility)
- **Scale**: Display-LG (3.5rem) → Headline-MD (1.75rem) → Body-MD (0.875rem)

## 🚀 Tech Stack

- **Framework**: Astro 6.x (static site generation)
- **Styling**: Tailwind CSS 4.x
- **Fonts**: Google Fonts (Space Grotesk + Inter)
- **Icons**: Material Symbols Outlined
- **TypeScript**: Strict mode enabled

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tecnodespegue/landing.git
cd landing

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Development

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Build for production
npm run preview    # Preview production build
npm run astro      # Run Astro CLI commands
```

## 📁 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Astro components
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Services.astro
│   │   ├── Why.astro
│   │   ├── Tech.astro
│   │   ├── CTA.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro # Base layout with fonts & meta
│   ├── pages/
│   │   └── index.astro  # Main landing page
│   └── styles/
│       └── global.css   # Tailwind + custom utilities
├── tailwind.config.js   # Design system tokens
└── astro.config.mjs     # Astro configuration
```

## 🎯 Key Features

### 🎨 Animations & Micro-interactions
- **Scroll Reveal**: Sections fade in as you scroll (Intersection Observer)
- **Custom Cursor**: Desktop-only smooth following cursor with hover effects
- **Progress Bar**: Gradient bar tracking scroll progress
- **Floating Animations**: Hero geometric shapes with orbiting rings
- **Hover Effects**: Ambient glows on interactive elements

### 📊 Content & Conversion
- **Real Metrics**: -70% ticket reduction, <100ms response time, 99.9% uptime
- **Testimonials**: 3 client success stories with measurable results
- **Trust Signals**: 50+ projects, ISO 27001, GDPR badges
- **Contact Form**: Full functional form with validation (ready for backend)
- **Strong CTAs**: "Agendar Consulta Gratis" with clear value props

### 🎭 Design System Implementation
- **No-Line Rule**: Standard 1px borders prohibited, negative space instead
- **Glass Effects**: Backdrop blur 12px on floating elements
- **Ambient Glows**: Digital light simulation (20px blur, 15% opacity)
- **Asymmetric Layouts**: 60/40 splits, overlapping elements
- **Tonal Layering**: #0e0e0e → #1a1919 for elevation (no drop shadows)

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to modify the design system tokens.

### Content
Each section is a standalone component in `src/components/`. Update text and icons directly in the `.astro` files.

### Contact Info
Update email and WhatsApp in `src/components/CTA.astro`:
```astro
href="mailto:your-email@tecnodespegue.com"
href="https://wa.me/YOUR_PHONE_NUMBER"
```

## 📊 Performance

- Lighthouse Score: 90+ (all metrics)
- Zero JavaScript on initial load (Astro islands architecture)
- Optimized fonts with `display=swap`
- Lazy-loaded Material Symbols

## 🚢 Deployment

Compatible with:
- **Vercel** (recommended)
- **Netlify**
- **Cloudflare Pages**
- Any static hosting

```bash
npm run build
# Output: dist/
```

## 📝 Design Principles

### Do:
- Use asymmetry for visual interest
- Embrace negative space (Spacing 16/20)
- Use tone-on-tone for hierarchy
- Apply ambient glows on interactive elements

### Don't:
- Use pure white (#ffffff) for long-form text
- Use 100% opaque borders
- Create standard 3-column card layouts
- Add drop shadows (use glows instead)

## 🧩 Component Philosophy

Each component follows:
1. **Tonal layering** over drop shadows
2. **Gradient fills** for primary CTAs
3. **Ghost borders** (15% opacity) when boundaries are needed
4. **Monospace badges** for technical indicators

## 🤝 Contributing

This is a private agency landing. For TecnoDespegue team members:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit using Conventional Commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

© 2026 TecnoDespegue. All rights reserved.

---

Built with ⚔️ by **Tecno Squire** using **The Neon Architect** design system.
