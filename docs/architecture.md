# Architecture

Atelon is a workspace with a static-first React/Vite PWA and a small Fastify API. Vehicle JSON in `data/vehicles` is the source of truth. `scripts/build-data.mjs` produces the browser bundle; the API reads the same records at startup. Public GLBs and posters are immutable build assets.

The browser never receives AI credentials. `/api/chat` matches a question to local vehicle records, sends only that context to a configured provider, rejects answers containing numbers absent from that context, and falls back to deterministic facts when providers fail. Search and comparison remain usable without AI.

Production builds create static snapshots for every public route and vehicle, including metadata and structured data. React takes over after load. The PWA precaches the shell and limits runtime model storage. Capacitor packages the same web build for Android.

## Trust boundaries

- Secrets exist only in the API environment.
- Browser input is schema-validated by Fastify and rate-limited for chat.
- Vehicle data and optimized asset hashes are validated before builds.
- Model provenance stays in vehicle records and `data/ledger.csv`.
- Production origins are explicit; localhost is rejected in production.
