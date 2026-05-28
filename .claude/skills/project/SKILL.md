---
description: Manages systematic execution of the GrowthPoint website rebuild in phases with human review checkpoints. Commands: /project plan, /project init, /project status, /project execute, /project resume, /project validate.
---

# Project Automation Skill

Manages systematic execution of the website rebuild in phases with human review checkpoints.

## Commands

| Command | Description |
|---------|-------------|
| `/project plan` | Create a work manifest from the project milestones |
| `/project init <manifest>` | Initialize project from manifest, create master plan |
| `/project status` | Display current project status |
| `/project execute [unit-id]` | Execute next or specified unit |
| `/project resume` | Resume after PR merge |
| `/project validate <unit-id>` | Run validation only (browser check, Lighthouse) |

---

## How It Works

The project skill breaks the website rebuild into **phases** (matching the weekly milestones) and **units** (individual pieces of work within a phase). Each phase produces a single PR that gets reviewed before merging.

```
Phase 1: Setup (Week 3)
  ├── unit: brand assets committed
  ├── unit: CSS variables finalized
  └── PR → review → merge to preview

Phase 2: Home + Nav + Footer (Week 4)
  ├── unit: navigation bar (shared component)
  ├── unit: footer (shared component)
  ├── unit: home page hero section
  ├── unit: home page pillars section
  ├── unit: home page services overview
  ├── unit: home page testimonial + CTA
  └── PR → review → merge to preview

Phase 3: Services + About (Week 5)
  ├── unit: services page content
  ├── unit: ISMS interactive wheel
  ├── unit: about page
  └── PR → review → merge to preview

...and so on through Phase 8 (Launch)
```

---

## Manifest Format

The manifest is a YAML file that defines all work units:

```yaml
plan_id: gp-website-rebuild
source: intern-project-website-rebuild.md

phases:
  - id: phase-1-setup
    title: "Setup & Brand Assets"
    week: 3
    units:
      - id: unit-brand-assets
        title: "Commit logo SVGs, icons, and favicon"
        assignee: maddox
        files:
          - assets/logos/
          - assets/icons/
          - assets/favicon/
        depends_on: []

      - id: unit-css-variables
        title: "Finalize CSS variables from brand guide"
        assignee: joshua
        files:
          - css/variables.css
        depends_on: []

  - id: phase-2-home
    title: "Home Page + Nav + Footer"
    week: 4
    units:
      - id: unit-nav
        title: "Build responsive navigation bar"
        assignee: maddox
        files:
          - css/components.css
          - js/nav.js
        depends_on: [unit-css-variables]

      - id: unit-footer
        title: "Build footer with KO logo and social links"
        assignee: joshua
        files:
          - css/components.css
        depends_on: [unit-css-variables]

      # ...more units
```

### Unit Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (used for branch naming) |
| `title` | Yes | What this unit builds |
| `assignee` | Yes | `maddox` or `joshua` |
| `files` | Yes | Files to create or modify (max 5) |
| `depends_on` | Yes | Unit IDs that must complete first (can be empty) |
| `validation` | No | How to verify this unit (default: browser check) |

---

## /project plan

Create a manifest from the project milestones.

### Process

1. Read `CLAUDE.md` for project structure and conventions
2. Read the milestone plan (weekly breakdown from project doc)
3. Split each week into implementable units:
   - Each unit modifies **at most 5 files**
   - Each unit has a **clear deliverable** (visible in browser)
   - Each unit is assigned to **one intern**
4. Identify dependencies between units
5. Group units into phases (one phase per week)
6. Write `manifest.yaml` to `.project/` directory
7. Output: "Manifest created. Run `/project init .project/manifest.yaml`"

---

## /project init <manifest-path>

Initialize project from manifest.

### Process

1. Read and validate manifest
2. Verify all referenced files exist or will be created
3. Create `master-plan.md` in `.project/` directory
4. Create `.project/state.json` for tracking progress
5. Output: "Project initialized. Run `/project execute` to start."

### Output Files

| File | Purpose |
|------|---------|
| `.project/manifest.yaml` | Work breakdown (created by `/project plan`) |
| `.project/master-plan.md` | Human-readable status dashboard |
| `.project/state.json` | Machine-readable state for automation |

---

## /project status

Display current project status.

### Output Format

```
Project: GrowthPoint Website Rebuild
Status: in_progress
Current Phase: Phase 2 — Home Page + Nav + Footer (Week 4)

Phases:
  ✅ Phase 1: Setup & Brand Assets (PR #3 merged)
  🔄 Phase 2: Home + Nav + Footer (PR #5 open)
     ✅ unit-nav (Maddox) — committed
     ✅ unit-footer (Joshua) — committed
     🔄 unit-home-hero (Maddox) — in progress
     ⏳ unit-home-pillars (Maddox) — pending
  ⏳ Phase 3: Services + About (Week 5)
  ⏳ Phase 4: Blog + Contact (Week 6)
```

---

## /project execute [unit-id]

Execute the next phase or a specific unit.

### Process

1. Load manifest and state
2. Identify next phase (all prior phases must be merged)
3. Create phase branch: `feature/phase-{n}-{short-name}`
4. For each unit in the phase (sequentially):
   a. Read the relevant files and reference stylesheet
   b. Build implementation prompt for Claude:
      - What to build (from unit title and description)
      - Which files to modify
      - Brand conventions (from `css/variables.css` and `CLAUDE.md`)
      - Reference patterns (from `reference/website-reference-styles.css`)
   c. Implement the unit
   d. Verify in browser (visual check)
   e. Commit to phase branch with descriptive message
5. Push branch and create PR targeting `preview`
6. Output: "Phase {n} complete — PR #{number} ready for review"
7. **STOP** — wait for human review

### Branch Naming

```
feature/phase-1-setup
feature/phase-2-home
feature/phase-3-services
feature/phase-4-blog
feature/phase-5-content
feature/phase-6-polish
feature/phase-7-dns
feature/phase-8-launch
```

### Commit Messages

Each unit gets its own commit within the phase branch:

```
feat: add responsive navigation bar

Implements sticky nav with logo, links, and mobile hamburger toggle.
Brand-compliant using variables from css/variables.css.
```

---

## /project resume

Resume after a phase PR is merged.

### Process

1. Verify the current phase PR is merged
2. Update state: all units in phase → `complete`
3. Pull latest `preview` branch
4. Identify next phase
5. If next phase exists: execute it
6. If no more phases: "Project complete!"

---

## /project validate <unit-id>

Run validation without creating a PR.

### Validation Checklist

For each unit, verify:

- [ ] **Renders correctly** — open the HTML file in browser, visually matches current site
- [ ] **Brand compliance** — uses CSS variables, correct fonts, correct colors
- [ ] **Responsive** — looks right at desktop (1200px+), tablet (768-1024px), and mobile (<768px)
- [ ] **No broken links** — all navigation links work
- [ ] **No inline styles** — all styling in CSS files
- [ ] **Semantic HTML** — uses `<nav>`, `<main>`, `<article>`, `<footer>`, etc.
- [ ] **Images have alt text** — all `<img>` tags have `alt` attributes
- [ ] **Lighthouse score** — Performance, Accessibility, Best Practices, SEO all > 90

---

## State Management

### .project/state.json

```json
{
  "plan_id": "gp-website-rebuild",
  "status": "in_progress",
  "current_phase": "phase-2-home",
  "phases": {
    "phase-1-setup": {
      "status": "complete",
      "branch": "feature/phase-1-setup",
      "pr_number": 3
    },
    "phase-2-home": {
      "status": "pr_open",
      "branch": "feature/phase-2-home",
      "pr_number": 5,
      "units_completed": ["unit-nav", "unit-footer"]
    }
  }
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not started, waiting for prior phase |
| `in_progress` | Currently being built |
| `pr_open` | PR created, awaiting review |
| `complete` | PR merged |

---

## Hard Limits

| Limit | Value | Why |
|-------|-------|-----|
| Files per unit | ≤ 5 | Keep changes focused and reviewable |
| Units per phase | ≤ 8 | Keep PRs manageable |
| Phase = 1 PR | Always | One review cycle per phase |

If a unit needs more than 5 files, split it. If a phase has more than 8 units, split the phase.

---

## Error Handling

| Error | Action |
|-------|--------|
| Prior phase not merged | "Phase {n} blocked — merge PR #{x} first, then run `/project resume`" |
| File doesn't exist | Create it (this is expected for new pages) |
| Unit too large | "Split this unit — too many files. Max 5 per unit." |
| Validation fails | Report what failed, suggest fix, do not create PR |

---

## Tips for Interns

- **Ask Claude to build one section at a time.** Don't try to build an entire page in one shot.
- **Preview after every change.** Open the HTML file in your browser and refresh.
- **Use the reference stylesheet.** `reference/website-reference-styles.css` has every pattern from the current site.
- **Commit often.** Small commits are easier to review and easier to undo if something goes wrong.
- **Review each other's PRs.** You'll learn from seeing how the other person solved a problem.

---

**Status:** Active
**Last Updated:** 2026-05-28
