# Contributing

Use Node 22 LTS and run `npm ci`. Before opening a change, run `npm run verify`; UI changes should also pass `npm run test:browser`.

Vehicle work begins with `npm run new-vehicle -- <slug>`. Keep records non-live until their specifications, poster, model, hashes, attribution and ledger row are complete. Then run `npm run validate:strict`. Do not place secrets, raw source archives, signing keys or release APKs in Git.

Code should use semantic design tokens from `apps/web/src/styles.css`, preserve keyboard behavior and reduced-motion/transparency modes, and provide poster/error fallbacks for 3D experiences.
