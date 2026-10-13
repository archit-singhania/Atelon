# Atelon Liquid Glass Style Guide (v0.2)

Tagline candidates: "Atelon, every machine in 3D" / "Atelon, the AI vehicle atlas". Headline used on the landing page: "Every machine. In 3D."

## Direction
Adaptive premium showroom. Dark mode uses obsidian and smoked glass; light mode uses pearl and titanium. Both use restrained ice-blue spectral highlights, layered translucency, inner highlights and depth-dependent shadows.

## Tokens (implemented in `apps/web/src/styles.css`)
| Token | Value |
|---|---|
| --canvas | Theme background |
| --canvas-elevated | Solid fallback surface |
| --glass-fill / --glass-fill-strong | Translucent material layers |
| --glass-border / --glass-highlight | Hairline edge and internal reflection |
| --text-primary / --text-secondary | Accessible typography |
| --accent / --accent-glow | Restrained ice-blue emphasis |
| --shadow-glass / --blur-glass | Depth and material blur |

## Typography
- Manrope variable family for display, body and automotive numerals.
- System sans fallbacks keep the interface usable while the web font loads.

## Components
- Buttons: pill, accent fill for primary, outlined for secondary.
- Cards: layered glass with spectral edge, 22px radius, hover lift and pointer tilt.
- Tier badges: Full 3D (accent), Reference 3D (amber), Specs only (grey).
- Respect `prefers-reduced-motion`.
- Respect `prefers-reduced-transparency` and provide a solid-surface fallback.
- Internal component gallery: `/design-system`.

## Brand assets
- The six approved masters live in `assets/logo/`; do not edit these originals.
- Use the dark artwork on dark canvases and the light artwork on light canvases.
- Run `npm run icons` after changing a master to regenerate web, favicon, Apple touch and PWA derivatives.

## To do (needs you)
- Figma sketch of the landing page.
