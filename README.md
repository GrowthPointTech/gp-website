# GrowthPoint Technology Advisors — Website

Static HTML/CSS website for [gptechadvisors.com](https://www.gptechadvisors.com), hosted on AWS Amplify.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/GrowthPointTech/gp-website.git
cd gp-website

# Install dev tools (Puppeteer — headless Chrome for style validation)
npm install

# Open in browser (no build step required for the site itself)
open index.html
```

No frameworks, no build tools for the site. `npm install` is only needed for the Puppeteer-based style validation tools.

## Dev Tools — Style Validation

We use Puppeteer (headless Chrome) to extract and compare computed CSS from the live site vs our local build. This is how we ensure our static site matches the WordPress/Elementor original.

```bash
# Extract exact computed styles from the live site
npm run extract-styles
# Output: reference/computed-styles.json

# Compare live site vs local — shows every CSS diff
npm run compare-styles
# Output: terminal diff table + reference/style-comparison.json
```

**Run `npm run compare-styles` before every PR.** This is our quality gate — it catches font size, color, spacing, and layout differences that are invisible in code review.

See `tools/extract-styles.js` and `tools/compare-styles.js` for implementation.

### Requirements
- Node.js 18+
- `npm install` downloads Puppeteer + bundled Chromium (~170MB, one-time, in `node_modules/`)

## Project Structure

```
gp-website/
├── index.html                 # Home page
├── about.html                 # About page
├── privacy.html               # Privacy policy
├── services/
│   ├── cto.html               # Fractional CTO & Agentic AI
│   ├── ciso.html              # Fractional CISO & Cybersecurity
│   └── chro.html              # Fractional CHRO & People Leadership
├── blog/
│   ├── index.html             # Blog listing
│   └── posts/                 # Individual blog post pages
├── css/
│   ├── variables.css          # Brand tokens (colors, fonts, spacing)
│   ├── base.css               # Reset, typography, layout primitives
│   ├── components.css         # Nav, footer, cards, buttons, testimonials
│   └── pages.css              # Page-specific overrides
├── js/
│   ├── nav.js                 # Mobile menu toggle
│   ├── blog.js                # Blog listing & filtering
│   ├── blog-data.js           # Blog post data array
│   └── animations.js          # Scroll animations
├── assets/
│   ├── images/                # Optimized site images
│   ├── logos/                 # SVG logos from brand package
│   ├── icons/                 # Brand icons (pillars, services)
│   └── favicon/               # Favicon set
├── tools/
│   ├── extract-styles.js         # Puppeteer: extract computed CSS from live site
│   └── compare-styles.js         # Puppeteer: diff live vs local computed CSS
├── reference/
│   ├── computed-styles.json      # Exact computed CSS from live site (via Puppeteer)
│   ├── style-comparison.json     # Live vs local diff output
│   ├── live-*.html               # Cached live page HTML sources
│   ├── elementor-post-*.css      # Elementor stylesheets (variable defs)
│   └── website-reference-styles.css  # Pre-extracted reference stylesheet
├── .claude/
│   └── CLAUDE.md              # Claude Code instructions for this repo
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions (placeholder)
├── customHttp.yml             # Amplify security headers
├── CLAUDE.md                  # Claude Code instructions
└── README.md                  # This file
```

## Tech Stack

- **HTML5 + CSS3 + Vanilla JS** — no framework, no build step
- **CSS Custom Properties** — brand tokens from GrowthPoint Brand Guide
- **Responsive** — mobile-first, breakpoints at 768px and 1024px
- **AWS Amplify** — hosting with auto-deploy on merge

## Brand Guide

All design decisions must follow the [GrowthPoint Brand Guide](https://www.figma.com/proto/upMbWzAdNJsgBE7TdsD9Tv/GrowthPoint-Branding).

| Element | Font | Notes |
|---------|------|-------|
| Headings | Rethink Sans | Weight 400, letter-spacing -2% |
| Eyebrows | Onest Semibold | Uppercase, letter-spacing 8% |
| Body | Onest Regular | 20px, line-height 1.6 |

### Colors

| Name | HEX | Usage |
|------|-----|-------|
| Rich Black | `#080F1F` | Dark backgrounds, body text |
| Bright Blue | `#0C50D5` | Headers, primary CTAs |
| Med Blue | `#3F8CFF` | Links, accents |
| Orange | `#F6621C` | CTA buttons |
| Lime | `#A4E322` | Success, growth indicators |
| Light Gray | `#EDF2F4` | Page backgrounds |

## Hosting — AWS Amplify

| Environment | Branch | URL | Password |
|-------------|--------|-----|----------|
| **Preview / Staging** | `preview` | [preview.gptechadvisors.com](https://preview.gptechadvisors.com) | `growthpoint` / `millie bae` |
| **Production** | `main` | [main.d3t25f13f2ifsh.amplifyapp.com](https://main.d3t25f13f2ifsh.amplifyapp.com) | No |

**Amplify App ID:** `d3t25f13f2ifsh`

Custom domain DNS (Route 53 — active):

| Record | Type | Value |
|--------|------|-------|
| `preview.gptechadvisors.com` | CNAME | `d76c94awsonva.cloudfront.net` |
| `gptechadvisors.com` | CNAME/ALIAS | `main.d3t25f13f2ifsh.amplifyapp.com` (pending) |
| `www.gptechadvisors.com` | CNAME | `main.d3t25f13f2ifsh.amplifyapp.com` (pending) |

## Branch Strategy

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `feature/*` | Working branches | PR preview URLs (Engineering Amplify) |
| `preview` | Staging | preview.gptechadvisors.com (password protected) |
| `main` | Production | gptechadvisors.com |

### Workflow

1. Create a branch: `feature/your-feature-name`
2. Open a PR targeting `preview`
3. Get PR review + merge to `preview` (deploys to staging)
4. Stacey/Michelle review on preview site
5. PR from `preview` → `main` (deploys to production)

## Pages

| Page | File | Status |
|------|------|--------|
| Home | `index.html` | In progress |
| CTO Services | `services/cto.html` | Live |
| CISO Services | `services/ciso.html` | Live |
| CHRO Services | `services/chro.html` | Live |
| About | `about.html` | Live |
| Blog Listing | `blog/index.html` | Live |
| Blog Posts | `blog/posts/*.html` | Live (8 posts) |
| Privacy Policy | `privacy.html` | Live |

## Intern Assignment

| Intern | Primary Focus |
|--------|--------------|
| **Maddox Strader** | Home page, CTO/CISO service pages, ISMS wheel, AWS setup |
| **Joshua Williams** | About page, Blog system, CHRO service page, Claude skills |

Both collaborate on shared components (nav, footer, CSS variables) and review each other's PRs.

## Security

- HTTPS enforced via Amplify (automatic)
- Security headers configured in `customHttp.yml`
- No inline JavaScript (CSP compliance)
- No secrets in the repo
- Branch protection on `main` and `preview`

## License

Proprietary — GrowthPoint Technology Advisors, LLC
