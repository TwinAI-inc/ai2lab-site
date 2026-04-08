# IE 6400 — Foundations of Data Analytics

Per-course landing page for **IE 6400**, hosted under AI²Lab.ai.

## Files

```
courses/IE6400/
├── course-outline.html              # The main outline page (open this)
├── decks/
│   ├── Distributions.html           # M1 — Common distributions (30 slides)
│   ├── ProbabilityDistributions.html # M1 — Foundations (34 slides)
│   ├── ConfidenceIntervals_HypothesisTesting.html  # M2 — CI/HT (18 slides)
│   └── img/                         # Cinematic images for the CI/HT deck
└── README.md
```

## Local preview

```bash
# From repo root
cd courses/IE6400
start course-outline.html
```

Or right-click `course-outline.html` → Open with → your browser.

## Deployment to ie6400.ai2lab.ai

The page is currently hosted as a sub-folder of the main `ai2lab.ai` Azure Static Web App. To split it onto its own subdomain `ie6400.ai2lab.ai`:

### Option A — CNAME subdomain on the existing SWA (recommended)

1. **Azure Portal** → Static Web App for AI²Lab → **Custom domains** → Add custom domain
2. Domain name: `ie6400.ai2lab.ai`
3. Follow validation steps (CNAME `_dnsauth` then CNAME → SWA hostname)
4. **GoDaddy DNS** for `ai2lab.ai`:
   - Add CNAME record: name `ie6400`, value `<azure-swa-host>.azurestaticapps.net`
5. Add a `staticwebapp.config.json` route in the AI²Lab repo root:
   ```json
   {
     "routes": [
       { "route": "/", "rewrite": "/courses/IE6400/course-outline.html" }
     ]
   }
   ```
   **WARNING:** this rewrites the root for the entire SWA. Use Option B if you want to keep `ai2lab.ai/` as the homepage.

### Option B — Separate Azure Static Web App

1. Create a new Azure Static Web App pointing only to the `courses/IE6400/` subfolder
2. Use the GitHub Actions workflow to deploy on push
3. Add custom domain `ie6400.ai2lab.ai` to the new SWA
4. Cleaner separation but doubles the CI/CD config

### Option C — URL rewrite via Azure Front Door

1. Create a Front Door profile with routing rule:
   - Frontend: `ie6400.ai2lab.ai`
   - Backend: AI²Lab SWA, path prefix `/courses/IE6400/`
2. Most flexible, supports multiple per-course subdomains in one place

## Build / dependencies

- **None.** Pure static HTML + CSS + a tiny inline JS toggle. Loads Outfit + JetBrains Mono from Google Fonts and Lucide icons from unpkg CDN. No build step.

## Updating deck content

The 3 HTML decks under `decks/` are **copies** of the source files in:

```
C:\Users\mdehg\Dropbox\5_Courses\20_Other\8- IE 6800 Foundations Data Analytics\2- Course Materials\Presentations\
```

When the source decks are updated, re-run:

```bash
SRC='/c/Users/mdehg/Dropbox/5_Courses/20_Other/8- IE 6800 Foundations Data Analytics/2- Course Materials/Presentations'
DST='/c/Users/mdehg/Dropbox/11_Azure_Projects/AI2Lab/courses/IE6400/decks'
cp "$SRC/Distributions.html" "$DST/"
cp "$SRC/ProbabilityDistributions.html" "$DST/"
cp "$SRC/ConfidenceIntervals_HypothesisTesting.html" "$DST/"
cp "$SRC/img/"*.png "$DST/img/"
```

## Adding a new module

Edit `course-outline.html`:

1. Add a new `<div class="phase-header">` for the new section
2. Add a new `<div class="mod-row">` block (copy M1 or M2 as a template)
3. Bump the **info bar** counts (`Modules`, `Slide Decks`, `Total Slides`)
4. Add a new `<div class="phase-card">` to the **pipeline** section
5. Update the hero `meta-pill` count: "X of Y modules live"
6. Drop the new deck files into `decks/`

## Notes

- The folder name on Dropbox says **"IE 6800 Foundations Data Analytics"** but the official course code is **IE 6400**. The folder is legacy naming — do not rename without checking that no other tooling depends on the path.
- Both M1 and M2 are auto-expanded on page load for now (since they're the only complete modules). When more modules are added, change the auto-expand behavior in the inline `<script>` block at the bottom.
