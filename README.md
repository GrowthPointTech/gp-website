# GrowthPoint Technology Advisors — Website

Static HTML/CSS website for [gptechadvisors.com](https://www.gptechadvisors.com), hosted on AWS Amplify.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/GrowthPointTech/gp-website.git
cd gp-website

# Open in browser (no build step required)
open index.html
```

No frameworks, no build tools. Open any `.html` file directly in a browser to preview.

## Project Structure

```
gp-website/
├── index.html                 # Home page
├── services.html              # Services page
├── about.html                 # About page
├── contact.html               # Contact page
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
│   └── contact.js             # Contact page interactions
├── assets/
│   ├── images/                # Optimized site images
│   ├── logos/                 # SVG logos from brand package
│   ├── icons/                 # Brand icons (pillars, services)
│   └── favicon/               # Favicon set
├── reference/
│   └── website-reference-styles.css  # Full reference stylesheet (do not deploy)
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
| **Preview / Staging** | `preview` | [preview.d3t25f13f2ifsh.amplifyapp.com](https://preview.d3t25f13f2ifsh.amplifyapp.com) | Yes |
| **Production** | `main` | [main.d3t25f13f2ifsh.amplifyapp.com](https://main.d3t25f13f2ifsh.amplifyapp.com) | No |

**Amplify App ID:** `d3t25f13f2ifsh`

Custom domain DNS (Route 53 — pending setup):

| Record | Type | Value |
|--------|------|-------|
| `preview.gptechadvisors.com` | CNAME | `preview.d3t25f13f2ifsh.amplifyapp.com` |
| `gptechadvisors.com` | CNAME/ALIAS | `main.d3t25f13f2ifsh.amplifyapp.com` |
| `www.gptechadvisors.com` | CNAME | `main.d3t25f13f2ifsh.amplifyapp.com` |

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
| Home | `index.html` | Pending |
| Services | `services.html` | Pending |
| About | `about.html` | Pending |
| Contact | `contact.html` | Pending |
| Blog Listing | `blog/index.html` | Pending |
| Blog Posts | `blog/posts/*.html` | Pending |

## Intern Assignment

| Intern | Primary Focus |
|--------|--------------|
| **Maddox Strader** | Home page, Services page, ISMS wheel, AWS setup |
| **Joshua Williams** | About page, Blog system, Contact page, Claude skills |

Both collaborate on shared components (nav, footer, CSS variables) and review each other's PRs.

## Security

- HTTPS enforced via Amplify (automatic)
- Security headers configured in `customHttp.yml`
- No inline JavaScript (CSP compliance)
- No secrets in the repo
- Branch protection on `main` and `preview`

## License

Proprietary — GrowthPoint Technology Advisors, LLC
