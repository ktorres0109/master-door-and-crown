# Orientation for Claude — Master Door and Crown

Read this instead of crawling the whole repo. Written 2026-07-12 by the session
that did the full renovation. CLAUDE.md is still the authoritative rules file
(secrets, commit rules); this is the context and state.

## What this is

Marketing site for Kel's uncle ("Roberto", "tío") — a one-man custom wood door
and trim business in Ventura County, CA. **He depends on this site for income**;
the goal of all work is more calls / form fills. Kel builds and maintains it.

- Live: https://masterdoorandcrown.com (apex is canonical; www 301s to apex)
- Repo: github.com/ktorres0109/master-door-and-crown — **push to `main` = deploy**
  (Cloudflare Pages, live ~30–60s after push, no build step)
- Local working copy: `~/projects/master-door-and-crown`

## Hard constraints — do not violate

1. **Never change the URL/folder structure.** Every page is indexed in Google
   Search Console. Edit files in place; no renames, moves, or deletions of pages.
2. `areas/*.html` are legacy duplicates of `cities/*` — 301-redirected by
   `_redirects`, canonicals point to `cities/*`. Leave them alone.
3. `old-home.html` + `css/theme-dark-archive.css` are a frozen snapshot of the
   pre-redesign dark homepage. Never edit; never link sitewide styles into it.
4. Secrets in `secrets/credentials.json` (gitignored). Never commit, never
   hardcode. Note: repurposing those tokens for non-R2 API calls got flagged —
   ask Kel before using them for anything but the image scripts.
5. Kel's uncle approved the current light theme — don't redesign without asking.

## Stack & design system

Plain HTML + CSS + vanilla JS. One stylesheet: `css/styles.css`; one JS file:
`js/main.js` (nav, reveal animations, FAB, contact form, FAQ accordion, sticky
call button) plus inline per-page scripts (gallery, services grids, homepage
preview grid).

Palette (drawn from the logo — sage-green door, gold ring, cream field). All
tokens are CSS variables at the top of styles.css:
cream bg `#FAF7F2`, white cards, charcoal text `#2B2B28`, gold `#A87E38`
(hover `#8C6A2F`), sage `#7E9084`/`#5F7365`, deep green `#232A24` for
header/footer/dark accent bands. Fonts: Cormorant Garamond + DM Sans.

## Images (important)

- All photos in Cloudflare R2, custom domain `images.masterdoorandcrown.com`,
  folders = categories: `entry-doors`(24), `interior-doors`(25),
  `barn-sliding-doors`(13), `closet-doors`(25), `room-dividers`(17),
  `crown-woodwork`(24) — files named `1.webp`, `2.webp`, … sequential.
- **Cloudflare Image Transformations is enabled** ("this zone only"). The site
  serves variants via `https://images.masterdoorandcrown.com/cdn-cgi/image/width=W,quality=82,format=auto/<cat>/<n>.webp`.
  Tiles use 400/600/800w srcset, lightbox 1600w, hero 828–2048w, OG images 1200w.
- `IMAGE_COUNTS` is hardcoded in THREE places that must stay in sync when photos
  are added/removed: `index.html`, `services.html`, `gallery.html`.
- Category display names: slug `entry-doors`→"Exterior Doors",
  `crown-woodwork`→"Woodwork & Crown", `barn-sliding-doors`→"Barn Doors".
  (Slugs are the old names; display names were renamed. Don't rename R2 folders.)
- Shell scripts: `fix-orientation.sh` has the CURRENT folder names;
  `upload-images.sh` / `remove-image.sh` are STALE (pre-rename names) — fix
  before using.

## Page inventory

index, services (all 6 services + inline photo grids + lightbox), gallery
(filter tabs + captions + lightbox w/ swipe & keyboard), about (story, process,
3 reviews), service-areas + cities/* (14), contact (web3forms, key in the HTML
is publishable-by-design), faq (10 Q&A + FAQPage JSON-LD), privacy-policy,
terms, services/* (6 subpages). Footers sitewide: 7 page links (incl. FAQ) +
6 service links. Header has clickable phone number (hidden 769–1099px width).

## SEO state (as of 2026-07-12)

Done: apex canonicals everywhere, BreadcrumbList on services/* + cities/*,
LocalBusiness (index), ItemList (services), AboutPage/ContactPage/FAQPage
JSON-LD, `sitemap.xml` + `sitemap-images.xml` (128 images) both in robots.txt,
responsive images (the big CWV win), interlinking clean.

Pending / next levers:
- **City-page de-templating**: the 14 city pages share recycled copy — waiting
  on the uncle for 2-3 unique lines + real project stories/photos per city.
  This is the biggest remaining on-site win.
- Photos of Roberto working → about page (E-E-A-T).
- Cost/guide content pages ("custom door cost ventura county" etc.).
- When Google reviews accumulate: Maps embed + real review display on contact;
  only then consider rating schema (never fake AggregateRating).
- Off-site (Kel is handling): GBP, Yelp (free), Houzz, Nextdoor, citations,
  Google Local Services Ads (the recommended paid channel; Yelp ads not).
- "500+ Projects Completed" stat is a conservative placeholder; uncle may give
  a real number. Uncle may confirm Spanish service → add "Se habla español".

## Working environment

Claude runs on Kel's remote Mac (Tailscale); Kel cannot see this Mac's GUI.
- Don't attempt Safari/AppleScript GUI automation (fails with -600).
- Verify with headless Playwright WebKit (installed at
  `~/Library/Caches/ms-playwright/webkit-2311`; npm pkg cached in session
  scratchpads). Serve with `python3 -m http.server 8765` from repo root.
  Scroll pages before full-page screenshots so reveal animations fire.
- Kel verifies visuals himself — 2-3 screenshots max, don't screenshot everything.
- A Cloudflare MCP plugin is installed (OAuth; can read zones, cannot write
  zone settings — dashboard toggles need Kel).
- git identity is unconfigured (commits warn); harmless, or set user.name/email.

## Gotchas learned the hard way

- Footer markup differs between top-level pages (multi-line `<li>`s) and
  cities/* (single-line `<li>`s) — sitewide regex edits need both patterns.
- Inline scripts use `&` escapes for `&` in JS strings — plain-text
  search for "&" misses them.
- `main.js` runs before the inline `#lightbox` markup on services.html, so its
  `initLightbox` no-ops there (by luck, not design). Gallery manages its own
  lightbox; `initLightbox` guards on `#gallery-grid`.
- Reveal animations (`.reveal`, IntersectionObserver) make below-fold content
  invisible in naive full-page screenshots.
