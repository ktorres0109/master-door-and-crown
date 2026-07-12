# CLAUDE.md — Master Door and Crown

## API Keys and Credentials
All secrets live in `secrets/credentials.json`.
This folder is gitignored and must NEVER be pushed to GitHub.

Rules:
- For any task requiring an API key or token, always read from `secrets/credentials.json`
- Never hardcode any key directly into HTML, JS, CSS, or any other file
- Never create credential files outside of `secrets/`
- When a new key is added, store it in `secrets/credentials.json` and document it below

## Current credentials in secrets/credentials.json
- r2.account_id — Cloudflare account ID
- r2.access_key_id — R2 access key
- r2.secret_access_key — R2 secret key
- r2.api_token — Cloudflare API token
- r2.endpoint — R2 S3-compatible endpoint
- r2.bucket — bucket name (master-door-crown-images)
- r2.public_base_url — public CDN base URL for images (update after enabling public access)
- web3forms.key — contact form key

## Stack
Plain HTML + CSS + vanilla JS. No build step.
Deploys to Cloudflare Pages from GitHub main branch.

## Design System
Palette is derived from the brand logo (sage door, gold ring, cream field).
All tokens are CSS variables at the top of css/styles.css — change them there, not inline.
- Page background: #FAF7F2 (warm cream); cards/panels: #FFFFFF
- Text: #2B2B28 (warm charcoal); muted: #57534A
- Gold accent (--color-wood/--color-gold): #A87E38, hover #8C6A2F
- Sage green (--color-sage / --color-sage-dark): #7E9084 / #5F7365
- Deep green (--color-dark) for header, footer, and dark accent bands: #232A24
- Headings: Cormorant Garamond (Google Fonts)
- Body: DM Sans (Google Fonts)
- css/theme-dark-archive.css is a frozen copy of the old navy theme, used only by old-home.html — never edit it

## Images
All images served from Cloudflare R2. WebP format only.
Public base URL is in secrets/credentials.json under r2.public_base_url.
Never reference Unsplash or external image URLs in final production code.

## Site Pages
- index.html — Homepage
- services.html — Services
- gallery.html — Gallery with filter + lightbox
- about.html — Craftsman story + process
- service-areas.html — 10-city service area hub
- contact.html — Free estimate form
- cities/ — Individual city pages (14, the canonical set)
- areas/ — LEGACY duplicates of cities/, 301-redirected via _redirects; kept so indexed URLs never break — don't edit or delete
- old-home.html — archived pre-redesign homepage (noindex)
- faq.html — FAQ accordion
- privacy-policy.html — Privacy policy
- terms.html — Terms of service
- css/styles.css — Full design system
- js/main.js — All interactivity
- secrets/ — GITIGNORED, never push this folder

## Commit rules
Never include secrets/ in any git command.
Always verify .gitignore is protecting secrets/ before pushing.
