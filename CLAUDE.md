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

When copying ANY element from the live site (https://gptechadvisors.com), follow this exact sequence:

### Step 1: Find the element in the cached reference files
- `reference/live-home.html` — full page source for home page
- `reference/live-services.html` — full page source for services page
- `reference/live-about.html` — full page source for about page
- `reference/live-blog.html` — full page source for blog page
- Find the element by searching for its text content or Elementor class names

### Step 2: Get exact computed styles via Puppeteer
Run the style extraction tool — this launches headless Chrome, renders the live site
(including Elementor JS), and dumps every computed CSS property to JSON:
```bash
npm run extract-styles
```
Output: `reference/computed-styles.json` — contains exact browser-computed values for
every element: font-family, font-size, font-weight, color, line-height, letter-spacing,
text-transform, padding, margin, width, and bounding box dimensions.

**ALWAYS use computed-styles.json as the source of truth for CSS values.**
Do NOT guess from the Elementor CSS variable files — Elementor assigns variables to
elements via JavaScript at runtime, and the static CSS files do not contain those mappings.

### Step 3: Map computed values to our CSS system
Compare `reference/computed-styles.json` values against:
- `css/variables.css` — brand tokens
- `css/base.css` — typography, reset
- `css/components.css` — shared components
- `css/pages.css` — page-specific

Use the EXACT computed values. Do NOT approximate or round.

### Step 4: Verify after making changes
After implementing, compare the local result to the live site:
- Font: family, size, weight, transform, spacing
- Colors: text, background, border
- Spacing: padding, margin, gap
- Layout: display, position, width, alignment
- List every difference. Fix before committing.

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
| `js/` | Minimal JS: mobile nav toggle, contact page |
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
| Services | `services.html` | Fractional CISO, Compliance, ISMS wheel, Audits, Data Privacy |
| About | `about.html` | Company story, mission, Stacey bio, social links |
| Contact | `contact.html` | Calendly booking embed + mailto fallback |
| Blog | `blog/index.html` | Card grid of posts |
| Blog Post | `blog/posts/{slug}.html` | Article content |

## Blog
- Maintain this as an array of Blog Posts so that we can dynamically list posts and add posts in the future
- The home page should pull form this array to create a scrollable horizontal band on the home page of blog posts

## Shared Components

Every page includes:
1. **Nav** — Logo left, links right (Services, Blog, About, Contact). Sticky. Mobile hamburger.
2. **Footer** — KO logo, nav links, social (LinkedIn, X), copyright, privacy policy link.

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
| Stacey Robinson | Project champion, final approver |
| Maddox Strader | Intern — Home, Services, ISMS wheel, AWS |
| Joshua Williams | Intern — About, Blog, Contact, Claude skills |
