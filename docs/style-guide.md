# Atelon Style Guide (draft v0.1)

Tagline candidates: "Atelon, every machine in 3D" / "Atelon, the AI vehicle atlas". Headline used on the landing page: "Every machine. In 3D."

## Look
Dark showroom. Near-black background, glass cards, subtle grain, one neon accent.

## Tokens (implemented in `apps/web/src/styles.css`)
| Token | Value |
|---|---|
| --bg | #07090d |
| --surface | #0f141b |
| --border | rgba(255,255,255,0.08) |
| --text | #e8edf3 |
| --muted | #8a97a8 |
| --accent | #22d3ee (cyan; swap to #ff6a1a for racing orange) |

## Fonts (Google Fonts)
- Display: Space Grotesk
- Body: Inter

## Components
- Buttons: pill, accent fill for primary, outlined for secondary.
- Cards: glass (translucent surface, 1px border, 16px radius), tilt on hover.
- Tier badges: Full 3D (accent), Reference 3D (amber), Specs only (grey).
- Respect `prefers-reduced-motion`.

## To do (needs you)
- Figma sketch of the landing page.
- Final logo usage rules (`Atelon_logo.png` in the repo root is the source file).
