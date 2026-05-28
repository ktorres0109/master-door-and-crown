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
- Dark background/nav: #1a1a1a
- Wood accent: #8B5E3C
- Page background: #FAF8F5
- Headings: Playfair Display (Google Fonts)
- Body: Inter (Google Fonts)

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
- areas/ — Individual city stub pages
- faq.html — FAQ accordion
- privacy-policy.html — Privacy policy
- terms.html — Terms of service
- css/styles.css — Full design system
- js/main.js — All interactivity
- secrets/ — GITIGNORED, never push this folder

## Commit rules
Never include secrets/ in any git command.
Always verify .gitignore is protecting secrets/ before pushing.
