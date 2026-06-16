# CLAUDE.md — gp-website

## Project

Static HTML/CSS website for GrowthPoint Technology Advisors (gptechadvisors.com).
Replaces WordPress/Elementor site. Hosted on AWS Amplify.

## Stack

- HTML5 + CSS3 + vanilla JavaScript
- No frameworks, no build step
- CSS custom properties for brand tokens
- Mobile-first responsive (breakpoints: 768px, 1024px)

## Critical — Matching the Live Site

**This is a rebuild of an existing WordPress/Elementor site. Every element must match the live site exactly — text content, styling, and layout.**

### Prerequisite: Install Puppeteer

```bash
npm install   # installs puppeteer (headless Chrome for style extraction)
```

### Workflow: Copy any element from the live site

#### Step 1: Find the element in the cached reference files
- `reference/live-home.html` — full page source for home page
- `reference/live-services.html` — full page source for services page
- `reference/live-about.html` — full page source for about page
- `reference/live-blog.html` — full page source for blog page
- Find the element by searching for its text content or Elementor `data-id` attributes

#### Step 2: Extract exact computed styles via Puppeteer
Run the extraction tool — launches headless Chrome, renders the live site (including
Elementor JS runtime), and dumps every browser-computed CSS property to JSON:
```bash
npm run extract-styles
```
Output: `reference/computed-styles.json`

**ALWAYS use computed-styles.json as the source of truth for CSS values.**
Do NOT guess from the Elementor CSS variable files — Elementor assigns variables to
elements via JavaScript at runtime, and the static CSS files do not contain those mappings.
Do NOT estimate font sizes, colors, or spacing from screenshots.

#### Step 3: Map computed values to our CSS
Compare `reference/computed-styles.json` values against our CSS files. Use the EXACT
computed values. Do NOT approximate or round.

#### Step 4: Verify with automated comparison — BEFORE committing
Run the comparison tool — renders both the live site and our local site in headless Chrome
side-by-side, extracts computed styles from matching elements, and outputs a diff:
```bash
npm run compare-styles
```
Output: terminal diff table + `reference/style-comparison.json`

**Do NOT commit until `compare-styles` shows no meaningful diffs for the elements you changed.**
Acceptable diffs: `font-family` fallback order (`system-ui`), `text-align: start` vs `left`.
Not acceptable: any diff in font-size, font-weight, color, line-height, letter-spacing,
text-transform, padding, margin, display, or position.

#### Step 5: Add new elements to the comparison tool
When implementing a new section, add its selectors to `tools/compare-styles.js` so future
changes can be validated automatically.

### Gotchas (learned the hard way)
- **CSS specificity conflicts**: Our `base.css` has `.eyebrow` and `.hero p` selectors that
  can override more specific component styles. Always check what other selectors match your
  element. Use Puppeteer's `document.styleSheets` API to list all matching rules if needed.
- **Elementor runtime styles**: Elementor assigns typography and colors via JS at page load.
  The static CSS files (`reference/elementor-post-*.css`) define variable VALUES but not
  which elements USE them. Only `computed-styles.json` (from Puppeteer) has the truth.
- **Content must be verbatim**: Do not rewrite, paraphrase, or summarize text from the live
  site. Copy it exactly. Use `reference/live-*.html` as the source. If content differs, it's
  a bug.

### Reference Files

| File | Purpose | How to refresh |
|------|---------|----------------|
| `reference/computed-styles.json` | Exact computed CSS from live site | `npm run extract-styles` |
| `reference/style-comparison.json` | Diff of live vs local | `npm run compare-styles` |
| `reference/live-*.html` | Cached live page HTML sources | Re-download with curl |
| `reference/elementor-post-*.css` | Elementor stylesheets (variable definitions only) | Re-download with curl |
| `reference/website-reference-styles.css` | Pre-extracted reference stylesheet | Manual |

## Brand Compliance

**All design must follow the GrowthPoint Brand Guide.**

- Colors: `css/variables.css` (source of truth for all brand tokens)
- Fonts: Rethink Sans (headings), Onest (body/eyebrows) via Google Fonts
- Logos: `assets/logos/` — use SVG versions. KO (white) variants for dark backgrounds.
- Reference: `reference/` directory contains cached live site assets (see Critical section above)

## File Organization

| Directory | Purpose |
|-----------|---------|
| `css/variables.css` | Brand tokens only (colors, fonts, spacing, shadows) |
| `css/base.css` | Reset, typography, layout primitives |
| `css/components.css` | Reusable: nav, footer, cards, buttons, testimonials |
| `css/pages.css` | Page-specific styles |
| `js/` | Minimal JS: mobile nav toggle, blog, animations |
| `assets/` | Images, logos, icons, favicons |
| `reference/` | Reference files — not deployed |

## Conventions

- No inline styles or inline JavaScript
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<footer>`)
- BEM-like CSS naming: `.block__element--modifier`
- All images must have `alt` attributes
- CSS classes use brand variable names, never hard-coded hex values
- Keep each HTML page under 300 lines — extract shared partials into components

## Pages

| Page | File | Key Sections |
|------|------|-------------|
| Home | `index.html` | Hero, 4 pillars, services overview, blog highlights, testimonial, CTA |
| CTO Services | `services/cto.html` | Fractional CTO, Agentic AI, org design, engineering processes |
| CISO Services | `services/ciso.html` | Fractional CISO, compliance, ISMS wheel, audits, data privacy |
| CHRO Services | `services/chro.html` | Fractional CHRO, leadership acceleration, talent architecture |
| About | `about.html` | Mission, Stacey Robinson bio, Michelle Byrd Robinson bio |
| Blog | `blog/index.html` | Card grid of posts, category filter |
| Blog Post | `blog/posts/{slug}.html` | Article content |
| Privacy Policy | `privacy.html` | Data collection, rights, contact |

## Blog
- Maintain this as an array of Blog Posts so that we can dynamically list posts and add posts in the future
- The home page should pull form this array to create a scrollable horizontal band on the home page of blog posts

## Shared Components

Every page includes:
1. **Nav** — Logo left, links right (Services dropdown → CTO/CISO/CHRO, Blog, About). Sticky. Mobile hamburger.
2. **Footer** — KO logo, nav links, social (LinkedIn), copyright, privacy policy link.

## Security

- `customHttp.yml` defines security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- No secrets in the repo
- No inline JS (Content-Security-Policy compliance)

## Branch Strategy

- `feature/*` → PR to `preview` → merge deploys to preview.gptechadvisors.com
- `preview` → PR to `main` → merge deploys to gptechadvisors.com
- Never push directly to `main` or `preview`

## Team

| Person | Role |
|--------|------|
| Stacey Robinson | Co-Founder, project champion, final approver |
| Michelle Byrd Robinson | Co-Founder, content approver |
| Maddox Strader | Intern — Home, CTO/CISO service pages, ISMS wheel, AWS |
| Joshua Williams | Intern — About, Blog, CHRO service page, Claude skills |
