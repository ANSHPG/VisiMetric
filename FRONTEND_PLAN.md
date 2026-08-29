# FRONTEND_PLAN.md
## VisiMetric — Frontend UI Implementation Plan

> Authored: 2026-08-29 11:30 IST  
> Architect: Anshuman Pattnaik  
> Design system source: `DESIGN.md` (NVIDIA Engineering Design System — EMEA cut)  
> Fonts in repo: `assets/Fonts/`

---

## 0. Design System Foundation

Everything in this frontend is derived directly from `DESIGN.md`. No tokens are invented. No colors are added. No radius values are loosened. This section maps every relevant design token to its CSS custom property declaration.

### 0.1 Font Loading

Two variable fonts are available locally in `assets/Fonts/`:

| File | Role |
|---|---|
| `NVIDIASansVF_NALA_W_Wght.woff2` | NVIDIA-EMEA upright, weight axis 400–700 |
| `NVIDIASansVF_Wght_NALA_W_Italic.woff2` | NVIDIA-EMEA italic (used only for edge cases) |
| `fa-solid-900.woff2` | Font Awesome Solid icons |
| `fa-brands-400.woff2` | Font Awesome Brands (social) |
| `fa-sharp-light-300.woff2` | Font Awesome Sharp Light icons |

CSS `@font-face` declarations will be placed in `src/index.css` — the `src: url()` paths point to the copied font files placed in `public/fonts/`. The font family name used everywhere is `"NVIDIA-EMEA"`.  
Fallback stack: `"NVIDIA-EMEA", Arial, Helvetica, sans-serif`.

### 0.2 CSS Custom Properties (`:root`)

All token names come from DESIGN.md front matter verbatim.

```
/* Colors */
--color-primary:          #76b900;
--color-on-primary:       #000000;
--color-primary-dark:     #5a8d00;
--color-ink:              #000000;
--color-canvas:           #ffffff;
--color-surface-dark:     #000000;
--color-surface-soft:     #f7f7f7;
--color-surface-elevated: #1a1a1a;
--color-hairline:         #cccccc;
--color-hairline-strong:  #5e5e5e;
--color-body:             #1a1a1a;
--color-mute:             #757575;
--color-stone:            #898989;
--color-ash:              #a7a7a7;
--color-on-dark:          #ffffff;
--color-on-dark-mute:     rgba(255,255,255,0.7);
--color-link-blue:        #0046a4;
--color-error:            #e52020;
--color-warning:          #df6500;
--color-success-deep:     #3f8500;

/* Spacing */
--space-xxs:     2px;
--space-xs:      4px;
--space-sm:      8px;
--space-md:      12px;
--space-lg:      16px;
--space-xl:      24px;
--space-xxl:     32px;
--space-section: 64px;

/* Radius */
--radius-none: 0px;
--radius-xs:   1px;
--radius-sm:   2px;
--radius-full: 9999px;

/* Shadows */
--shadow-sticky: 0 0 5px 0 rgba(0,0,0,0.3);

/* Typography sizes */
--text-display-xl:  48px;
--text-display-lg:  36px;
--text-heading-xl:  24px;
--text-heading-lg:  22px;
--text-heading-md:  20px;
--text-heading-sm:  18px;
--text-card-title:  17px;
--text-body-md:     16px;
--text-body-sm:     15px;
--text-button-lg:   18px;
--text-button-md:   16px;
--text-button-sm:   14.4px;
--text-caption-md:  14px;
--text-caption-sm:  12px;
--text-caption-xs:  11px;
--text-utility-xs:  10px;
```

---

## 1. Page Architecture

The app has **four views**, all in a single SPA shell. No page reloads.

```
Shell (App.jsx)
├── NavBar                    ← sticky, surface-dark, height 64px
├── Route: "/"                → HomePage
│   ├── HeroSection           ← surface-dark, full-bleed, display-xl headline
│   ├── UploadSection         ← canvas, centered drop-zone card
│   └── FeatureStrip          ← canvas, 3-up feature-card grid
├── Route: "/analyze/:id"     → AnalysisResultPage
│   ├── ResultHero            ← surface-dark, quality label + score
│   ├── ScoreGaugeCard        ← canvas, callout-stat style
│   ├── IssueGrid             ← canvas, resource-card style per issue
│   ├── FeatureStatsPanel     ← canvas, table + bar-chart
│   └── GradCamCard           ← canvas, image overlay viewer
├── Route: "/history"         → HistoryPage
│   ├── SubNavStrip           ← surface-soft, filter tabs
│   └── HistoryGrid           ← canvas, resource-card grid of past analyses
└── Footer                    ← surface-dark, 4-col link grid
```

---

## 2. Global Shell

### 2.1 NavBar

**Spec:** `primary-nav` component from DESIGN.md.

| Property | Value |
|---|---|
| Background | `var(--color-surface-dark)` |
| Height | `64px` |
| Text | `var(--color-on-dark)`, `font-size: var(--text-body-md)`, `font-weight: 700` |
| Radius | `0` (`rounded.none`) |
| Shadow (scrolled) | `var(--shadow-sticky)` applied via JS scroll listener |
| Position | `position: sticky; top: 0; z-index: 100` |

**Layout (desktop):**
```
[ VisiMetric wordmark (green) ]    [ Analyze  History ]    [ Upload Image → ]
       left                              center                  right (button-primary)
```

**"VisiMetric" wordmark:**  
- Font: NVIDIA-EMEA 700, 20px  
- Color: `var(--color-primary)` — #76b900  
- No logo icon — text only, matching the NVIDIA design language

**Nav links:** "Analyze", "History"  
- Default: `var(--color-on-dark)`, 16px 700  
- Active route: `var(--color-primary)` — underline of 2px solid primary below the link

**Right CTA:** `button-primary` — "Upload Image", `background: var(--color-primary)`, `color: var(--color-on-primary)`, `height: 44px`, `padding: 11px 24px`, `border-radius: var(--radius-sm)`

**Mobile (≤768px):** Wordmark left, hamburger icon right. Drawer slides in from right, full-height, `surface-dark`, nav links stacked vertically at `heading-md` size.

---

### 2.2 Footer

**Spec:** `footer-section` component from DESIGN.md.

| Property | Value |
|---|---|
| Background | `var(--color-surface-dark)` |
| Text | `var(--color-on-dark-mute)` |
| Padding | `64px 48px` |
| Radius | `0` |
| Columns (desktop) | 4-up |

**Column headers:** `font-weight: 700`, `var(--color-on-dark)`, 16px  
**Links:** 15px 400, `var(--color-on-dark-mute)`, no underline, underline on active  
**Bottom strip:** `var(--color-surface-elevated)` (#1a1a1a) background, copyright + "Built by Anshuman Pattnaik" in `utility-xs` (10px uppercase `var(--color-mute)`)

**Footer columns:**
1. VisiMetric — About, GitHub, Assessment
2. API — Analyze Endpoint, History Endpoint, Health Check
3. Model — KADID-10k, EfficientNet-B0, Grad-CAM
4. Tech Stack — FastAPI, React, Docker

**Mobile:** Each column header becomes a tap-to-expand accordion row. Chevron icon (Font Awesome `fa-chevron-down`) rotates 180° on open.

---

## 3. Pages

---

### 3.1 HomePage (`/`)

#### 3.1.1 HeroSection

**Spec:** `hero-card-dark` component — no deviations.

| Property | Value |
|---|---|
| Background | `var(--color-surface-dark)` |
| Padding | `80px 48px` |
| Radius | `0` |

**Layout:** Copy block left-aligned (left ~55% of viewport), right ~45% reserved for a static or animated abstract tech visual (SVG circuit/graph — no external images).

**Copy block:**
- Eyebrow (above headline): `caption-md` (14px 700 uppercase), `var(--color-primary)` — text: "IMAGE QUALITY ASSESSMENT"
- Headline: `display-xl` (48px 700 1.25), `var(--color-on-dark)` — "See Every Flaw. Score Every Frame."
- Subhead: `heading-lg` (22px 400 1.75), `var(--color-on-dark-mute)` — "AI-powered image quality analysis. Detects blur, noise, exposure failures, and visual defects — no external APIs, fully local inference."
- CTA row: `button-primary` "Analyze an Image" + `button-outline-on-dark` "View History"
- Corner square: 12×12px `var(--color-primary)` at bottom-left of the hero copy column

**Mobile (≤480px):**  
- Headline scales from 48px → 32px  
- Right visual hidden  
- Full-width single column  
- Padding: `32px 24px`

#### 3.1.2 UploadSection

Background: `var(--color-canvas)`. Section padding: `var(--space-section)` (64px) top and bottom.

**Section heading:** `display-lg` (36px 700), `var(--color-ink)` — "Analyze Your Image"  
**Section eyebrow:** `caption-md` uppercase, `var(--color-primary)` — "UPLOAD & ANALYZE"

**DropZoneCard:**  
Styled as a `product-card` but with dashed border instead of solid hairline.

| Property | Value |
|---|---|
| Background | `var(--color-canvas)` |
| Border | `2px dashed var(--color-hairline)` default; `2px dashed var(--color-primary)` on drag-over |
| Padding | `var(--space-xxl)` (32px) |
| Radius | `var(--radius-sm)` (2px) |
| Min-height | `240px` |
| Max-width | `640px`, centered |

**Interior layout (default — no file selected):**
- Font Awesome icon `fa-cloud-upload-alt` — 40px, `var(--color-primary)`
- Heading: `heading-md` (20px 700), `var(--color-ink)` — "Drop your image here"
- Sub-text: `body-sm` (15px 400), `var(--color-mute)` — "or click to browse — JPG, PNG, WebP, BMP up to 20 MB"
- Hidden `<input type="file" accept="image/*">`

**Interior layout (file selected — before submit):**
- Image thumbnail (200px tall, `object-fit: cover`, `border-radius: var(--radius-sm)`)
- Filename in `caption-md`, `var(--color-body)`
- File size in `caption-sm`, `var(--color-mute)`
- Action row: `button-primary` "Run Analysis" + `button-ghost-link` "Remove ×"

**Interior layout (loading state):**
- Animated progress bar — `height: 2px`, `background: var(--color-primary)`, CSS `@keyframes` width animation 0%→100%
- `body-sm` text: "Analyzing…" in `var(--color-mute)`
- Spinner: 24px circular `border: 3px solid var(--color-hairline); border-top-color: var(--color-primary)` rotating

**Error state:**
- Border switches to `2px solid var(--color-error)`
- Error message in `caption-sm`, `var(--color-error)` below the zone

**Accepted formats validation:** client-side, before POST. Reject non-image MIME. Show error inline.

#### 3.1.3 FeatureStrip

3-up `feature-card` grid. Background: `var(--color-canvas)`. Padding top: `0`, padding bottom: `var(--space-section)`.

Each card:
- Background `var(--color-canvas)`, 1px solid `var(--color-hairline)`, padding `32px`, `border-radius: var(--radius-sm)`
- Corner square: 12×12px `var(--color-primary)` at `top: 0; left: 0; position: absolute`
- Icon: Font Awesome at 22px, `var(--color-primary)` — see per-card below
- Title: `heading-md` (20px 700), `var(--color-ink)`
- Body: `body-md` (16px 400), `var(--color-body)`

| Card | Icon (FA) | Title | Body |
|---|---|---|---|
| 1 | `fa-solid fa-eye` | Multi-Defect Detection | Identifies blur, noise, overexposure, underexposure, corruption, and visual defects simultaneously. |
| 2 | `fa-solid fa-brain` | Hybrid AI Engine | EfficientNet-B0 fine-tuned on KADID-10k, ensembled with a classical feature vector for robust, explainable scoring. |
| 3 | `fa-solid fa-chart-bar` | Full Explainability | Grad-CAM saliency maps, per-feature stats, confidence per detected issue — not a black box. |

---

### 3.2 AnalysisResultPage (`/analyze/:id`)

#### 3.2.1 ResultHero

**Spec:** `cta-strip-dark` — compressed dark band.

| Property | Value |
|---|---|
| Background | `var(--color-surface-dark)` |
| Padding | `64px 48px` |
| Radius | `0` |

Layout:
- Left: breadcrumb trail → `caption-md` uppercase, `var(--color-mute)` — "HISTORY / [filename]"  
- Center: `heading-xl` (24px 700), `var(--color-on-dark)` — "Analysis Complete"  
- Right: quality label pill — `badge-tag` style but on dark; label text is `ACCEPTABLE` / `DEGRADED` / `DEFECTIVE` with semantic background color:
  - ACCEPTABLE: background `var(--color-success-deep)` (#3f8500), text white
  - DEGRADED: background `var(--color-warning)` (#df6500), text white
  - DEFECTIVE: background `var(--color-error)` (#e52020), text white
  - Padding `4px 10px`, `border-radius: var(--radius-sm)`, `caption-md` uppercase

#### 3.2.2 ScoreGaugeCard

**Spec:** `callout-stat` component.

| Property | Value |
|---|---|
| Background | `var(--color-canvas)` |
| Border | `1px solid var(--color-hairline)` |
| Padding | `var(--space-xxl)` (32px) |
| Radius | `var(--radius-sm)` |

Layout — single wide card, centered, max-width 480px:
- Corner square: 12×12px `var(--color-primary)`, top-left
- Label: `caption-md` uppercase, `var(--color-primary)` — "QUALITY SCORE"
- Score number: `display-xl` (48px 700), `var(--color-ink)` — e.g. "82"
- Score bar: full-width `height: 8px`, `border-radius: var(--radius-sm)` progress bar  
  - Track: `var(--color-surface-soft)`  
  - Fill: color interpolated — green (`var(--color-primary)`) ≥70, orange (`var(--color-warning)`) 40–70, red (`var(--color-error)`) <40  
  - Animated: CSS transition width from 0 on mount
- Caption: `body-sm`, `var(--color-mute)` — "out of 100 · scored by EfficientNet-B0 ensemble"
- Analyzed at: `caption-sm`, `var(--color-stone)` — timestamp

Section heading above this card: `heading-xl` (24px 700), `var(--color-ink)` — "Quality Score"

#### 3.2.3 IssueGrid

Section heading: `heading-xl` (24px 700), `var(--color-ink)` — "Detected Issues"  
Section eyebrow: `caption-md` uppercase, `var(--color-primary)` — "DEFECT ANALYSIS"

If no issues: single full-width `feature-card` with FA icon `fa-check-circle` in `var(--color-success-deep)` and text "No issues detected — image passed all quality checks."

If issues exist: 2-up grid (desktop), 1-up (mobile) of **IssueCard** components.

**IssueCard — styled as `resource-card`:**

| Property | Value |
|---|---|
| Background | `var(--color-canvas)` |
| Border | `1px solid var(--color-hairline)` |
| Padding | `var(--space-xl)` (24px) |
| Radius | `var(--radius-sm)` |
| Corner square | 12×12px `var(--color-primary)`, top-left |

Layout per card:
- Top row: `badge-tag` for issue type (e.g. "BLUR", "NOISE") + severity badge (LOW / MEDIUM / HIGH) in semantic color  
  - LOW: background `var(--color-surface-soft)`, text `var(--color-body)`  
  - MEDIUM: background `var(--color-accent-yellow-pale)` (#feeeb2), text `var(--color-warning)` (#df6500)  
  - HIGH: background `#ffd4d4` (error pale, derived), text `var(--color-error)` (#e52020)
- Issue name: `card-title` (17px 700), `var(--color-ink)` — e.g. "Gaussian Blur Detected"
- Description: `body-sm` (15px 400), `var(--color-body)` — human-readable explanation of the issue
- Confidence bar:  
  - Label: `caption-sm`, `var(--color-mute)` — "Confidence"  
  - Bar: `height: 4px`, fill `var(--color-primary)`, track `var(--color-surface-soft)`, width = confidence %
- Footer: `button-ghost-link` — "What does this mean? →" linking to a tooltip/modal with brief technical explanation

**Issue type → human name + description mapping (hardcoded in frontend constants):**

| API type | Display name | Description |
|---|---|---|
| blur | Blur / Insufficient Sharpness | Image shows softness beyond acceptable threshold. Laplacian variance and FFT high-frequency energy are below calibrated limits. |
| noise | Image Noise | Elevated pixel-level variance consistent with sensor noise or compression artefacts. |
| overexposure | Overexposure | Significant portion of pixels are clipped at maximum brightness (>245), losing highlight detail. |
| underexposure | Underexposure | Mean luminance is below the acceptable floor. Shadow detail is unrecoverable. |
| corruption | Image Corruption / Severe Degradation | Structural integrity of the image is compromised — SSIM vs reference baseline is critically low. |
| defect | Visual Defect | Anomalous region detected that does not match expected image characteristics. Inspect Grad-CAM overlay for location. |

#### 3.2.4 FeatureStatsPanel

Section heading: `heading-xl` (24px 700), `var(--color-ink)` — "Feature Statistics"  
Section eyebrow: `caption-md` uppercase, `var(--color-primary)` — "CLASSICAL CV ANALYSIS"

**Layout:** 2-column desktop, 1-column mobile.

Left column — stat table:

`feature-card` style: `border: 1px solid var(--color-hairline)`, padding 32px, `border-radius: var(--radius-sm)`.

Table inside: no external table library — plain `<table>`.

| Column | Style |
|---|---|
| Feature name | `body-sm` 400, `var(--color-body)` |
| Value | `body-strong` 700, `var(--color-ink)` |
| Status | `badge-tag` — PASS (green), WARN (orange), FAIL (red) |

Table header row: `caption-md` uppercase, `var(--color-mute)`, `border-bottom: 1px solid var(--color-hairline)`.  
Row dividers: `border-bottom: 1px solid var(--color-surface-soft)`.  
No shadow. Hairline borders only.

Features displayed:

| Feature | Unit | PASS threshold |
|---|---|---|
| Laplacian Variance | px² | ≥ 80 |
| FFT HF Energy Ratio | ratio | ≥ 0.15 |
| Mean Luminance | 0–255 | 40–220 |
| Luminance Std-Dev | 0–255 | ≥ 30 |
| Noise Sigma | 0–1 | ≤ 0.02 |
| SNR Proxy | dB | ≥ 20 |
| Saturation Mean | 0–1 | ≥ 0.1 |
| Highlight Ratio | % | ≤ 5% |
| Shadow Ratio | % | ≤ 5% |
| Shannon Entropy | bits | ≥ 4.0 |
| SSIM vs Blurred Self | 0–1 | ≥ 0.7 |

Right column — feature importance horizontal bar chart (RF feature importances):

- Hand-drawn with `<svg>` or a minimal Recharts `<BarChart horizontal>` — **no pie charts**.
- Each bar: `height: 20px`, `background: var(--color-primary)`, `border-radius: var(--radius-sm)`
- Label: `caption-sm`, `var(--color-body)`, left-aligned
- Value: `caption-sm`, `var(--color-mute)`, right-aligned
- Chart background: `var(--color-canvas)`, `border: 1px solid var(--color-hairline)`, padding 32px

#### 3.2.5 GradCamCard

Section heading: `heading-xl` (24px 700), `var(--color-ink)` — "Saliency Map (Grad-CAM)"  
Section eyebrow: `caption-md` uppercase, `var(--color-primary)` — "MODEL EXPLAINABILITY"

**Layout:** 2-column desktop — original image left, Grad-CAM overlay right.

Each image panel: `feature-card` style — `border: 1px solid var(--color-hairline)`, padding 24px, `border-radius: var(--radius-sm)`, `corner-square` top-left.

Panel labels (above each image): `caption-md` uppercase, `var(--color-mute)` — "ORIGINAL" / "SALIENCY OVERLAY"

Image display: `width: 100%`, `aspect-ratio: auto`, `object-fit: contain`, `border-radius: var(--radius-xs)`

Below overlay image: `caption-sm` in `var(--color-mute)` — "Brighter regions indicate areas with higher influence on the model's quality prediction."

Toggle switch: `pill-tab` + `pill-tab-active` pair — "Original" | "Saliency" — for mobile where both images can't be side-by-side.

**Action row (below both panels):**  
`button-outline` "Download Saliency Map" + `button-ghost-link` "Back to Analyze →"

---

### 3.3 HistoryPage (`/history`)

#### 3.3.1 SubNavStrip

**Spec:** `sub-nav-strip` component.

| Property | Value |
|---|---|
| Background | `var(--color-surface-soft)` |
| Height | `56px` |
| Text | `var(--color-ink)`, `button-md` (16px 700) |
| Radius | `0` |
| Border-bottom | `1px solid var(--color-hairline)` |

Contents: filter pill tabs — `pill-tab` / `pill-tab-active`:
- "All" (default active — black bg, white text)
- "ACCEPTABLE"
- "DEGRADED"
- "DEFECTIVE"

Right side: search input `search-input` — 40px height, `border: 1px solid var(--color-hairline)`, `border-radius: var(--radius-sm)`, FA magnifier icon left, placeholder "Search by filename…" in `var(--color-ash)`.

#### 3.3.2 HistoryGrid

Section padding: `var(--space-section)` top and bottom.

**Empty state:** `feature-card` centered, FA `fa-inbox` at 32px `var(--color-ash)`, `heading-md` "No analyses yet", `body-sm` "Upload an image to get started.", `button-primary` "Analyze an Image".

**Grid:** `resource-card` style, 3-up desktop → 2-up tablet → 1-up mobile.

**HistoryCard per analysis:**

| Property | Value |
|---|---|
| Background | `var(--color-canvas)` |
| Border | `1px solid var(--color-hairline)` |
| Padding | `var(--space-xl)` (24px) |
| Radius | `var(--radius-sm)` |
| Corner square | 12×12px `var(--color-primary)`, top-left |

Layout:
- Top: `badge-tag` quality label with semantic color (ACCEPTABLE/DEGRADED/DEFECTIVE)
- Thumbnail: 16:9 aspect ratio, the original uploaded image (from API), `width: 100%`, `object-fit: cover`, `border-radius: var(--radius-xs)`, `border: 1px solid var(--color-hairline)`
- Title: `card-title` (17px 700), `var(--color-ink)` — filename, truncated with ellipsis at 1 line
- Score row: `caption-md` uppercase `var(--color-mute)` "SCORE" + `body-strong` (16px 700) `var(--color-primary)` — the numeric score
- Issues summary: `caption-sm` `var(--color-stone)` — "2 issues detected: blur (high), noise (low)" — or "No issues detected"
- Timestamp: `caption-sm` `var(--color-mute)` — relative time (e.g. "2 hours ago") via `date-fns`
- Footer: `button-ghost-link` "View Full Report →"

**Pagination:** `button-outline` "Load More" centered below grid, hidden when all records loaded. No infinite scroll.

---

## 4. Component Inventory

All components live in `src/components/`. One file per component.

| File | Renders | Notes |
|---|---|---|
| `NavBar.jsx` | Global navigation | Sticky, scroll shadow |
| `Footer.jsx` | Global footer | Accordion on mobile |
| `HeroSection.jsx` | Hero band on HomePage | surface-dark, display-xl |
| `DropZone.jsx` | Upload card | Drag-and-drop + click |
| `FeatureStrip.jsx` | 3-up feature cards | feature-card spec |
| `CornerSquare.jsx` | 12px green square | Reusable ornament |
| `ButtonPrimary.jsx` | Green fill button | 44px, radius sm |
| `ButtonOutline.jsx` | Green border button | 44px, radius sm |
| `ButtonGhostLink.jsx` | Arrow text link | No bg, primary color |
| `BadgeTag.jsx` | Uppercase label chip | surface-soft bg |
| `QualityBadge.jsx` | ACCEPTABLE/DEGRADED/DEFECTIVE | Semantic color |
| `ScoreGauge.jsx` | Score number + progress bar | callout-stat spec |
| `IssueCard.jsx` | Per-issue resource card | Confidence bar |
| `FeatureStatsTable.jsx` | CV feature table | PASS/WARN/FAIL |
| `FeatureImportanceChart.jsx` | Horizontal bar chart | SVG / Recharts |
| `GradCamViewer.jsx` | Dual-panel image viewer | Toggle on mobile |
| `HistoryCard.jsx` | Past analysis card | resource-card spec |
| `PillTab.jsx` | Filter tab | pill-tab / pill-tab-active |
| `SearchInput.jsx` | Filename search | search-input spec |
| `LoadingBar.jsx` | 2px animated progress | primary color |
| `ErrorBanner.jsx` | API error display | error color |
| `EmptyState.jsx` | Empty history/no issues | Reusable |

---

## 5. State Management

No Redux. No Zustand. Plain React.

| State variable | Location | Purpose |
|---|---|---|
| `file` | `DropZone` | Selected file object |
| `status` | `DropZone` | `idle | loading | success | error` |
| `analysisId` | `App` / router | Navigate to result page |
| `result` | `AnalysisResultPage` | Fetched analysis JSON |
| `history` | `HistoryPage` | Array of past analyses |
| `historyFilter` | `HistoryPage` | Active quality label filter |
| `historySearch` | `HistoryPage` | Filename search string |
| `historyPage` | `HistoryPage` | Pagination offset |

All API calls via `src/services/api.js` using Axios. Base URL from `import.meta.env.VITE_API_URL`.

---

## 6. API Service Layer (`src/services/api.js`)

```
uploadImage(file)        → POST /analyze       → returns analysis object
getAnalysis(id)          → GET  /analyses/{id} → returns analysis object
getHistory(filter, page) → GET  /analyses?label={}&page={}&limit=12
```

Error handling: HTTP ≥400 caught and surfaced via `ErrorBanner` component. 413 (file too large) and 415 (unsupported media type) have specific human-readable messages defined in a constant map.

---

## 7. Routing

`react-router-dom` v6.

| Route | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Default |
| `/analyze/:id` | `AnalysisResultPage` | Redirect here after upload |
| `/history` | `HistoryPage` | |
| `*` | `NotFoundPage` | `heading-xl` "404", ghost-link back |

---

## 8. Responsive Breakpoints

Following DESIGN.md exactly:

| Name | Width | Behaviour |
|---|---|---|
| ultrawide | ≥1920px | Content max 1280px, outer gutters grow |
| desktop-large | 1440px | 4-up card grid, full footer |
| desktop | 1280px | Default reference |
| desktop-small | 1024px | Card grid 4→3 up |
| tablet | 768px | 3→2 up cards, hamburger nav |
| mobile | 480px | 1-up everything |
| mobile-narrow | 320px | Hero headline 48→32px |

**Section padding collapse:** 64px desktop → 48px tablet → 32px mobile.  
**Card gutters:** 24px desktop → 16px mobile.

---

## 9. Tailwind Configuration

`tailwind.config.js` will extend the default theme with DESIGN.md tokens:

```js
theme: {
  extend: {
    colors: {
      primary: '#76b900',
      'on-primary': '#000000',
      'primary-dark': '#5a8d00',
      ink: '#000000',
      canvas: '#ffffff',
      'surface-dark': '#000000',
      'surface-soft': '#f7f7f7',
      'surface-elevated': '#1a1a1a',
      hairline: '#cccccc',
      'hairline-strong': '#5e5e5e',
      body: '#1a1a1a',
      mute: '#757575',
      stone: '#898989',
      ash: '#a7a7a7',
      'on-dark': '#ffffff',
      error: '#e52020',
      warning: '#df6500',
      'success-deep': '#3f8500',
    },
    fontFamily: {
      nvidia: ['"NVIDIA-EMEA"', 'Arial', 'Helvetica', 'sans-serif'],
    },
    borderRadius: {
      none: '0px',
      xs: '1px',
      sm: '2px',
      full: '9999px',
    },
    spacing: {
      xxs: '2px',
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      xxl: '32px',
      section: '64px',
    },
    boxShadow: {
      sticky: '0 0 5px 0 rgba(0,0,0,0.3)',
    },
  },
}
```

`border-radius` is LOCKED at `none / xs / sm / full`. No `md`, `lg`, `xl` radius classes used anywhere.

---

## 10. Accessibility

- All interactive elements meet WCAG AA touch target (≥44×44px) per DESIGN.md spec.
- Focus ring: `outline: 2px solid var(--color-primary)`, `outline-offset: 2px` — the green focus ring is on-brand and accessible.
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<h1>`–`<h3>` hierarchy.
- Images: `alt` attributes on all `<img>` elements.
- Drag-and-drop zone: keyboard accessible via `<input type="file">` as fallback, always visible (opacity 0, not display none).
- Color contrast: `var(--color-primary)` (#76b900) on `var(--color-surface-dark)` (#000000) — contrast ratio 6.1:1. Passes AA for large text. All body text is black on white or white on black — 21:1.

---

## 11. Package List (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.24.0",
    "axios": "^1.7.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "vite": "^5.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    "eslint-plugin-react-hooks": "^5.0.0"
  }
}
```

**Package rationale:**
- `recharts` — only chart library used; only for the feature importance horizontal bar chart. No D3 directly.
- `date-fns` — relative timestamps on history cards. No moment.js (legacy, bloated).
- `clsx` — conditional class merging. No `classnames` (same function, clsx is smaller).
- No state management library — component state is sufficient.
- No CSS-in-JS — Tailwind + CSS custom properties only.
- No icon library npm package — Font Awesome loaded via local woff2 files and CSS `@font-face`.

---

## 12. File Structure (`frontend/src/`)

```
src/
├── index.css              ← @font-face declarations, :root CSS vars, base resets
├── main.jsx               ← ReactDOM.createRoot, Router wrapper
├── App.jsx                ← Route definitions, NavBar + Footer shell
├── components/
│   ├── NavBar.jsx
│   ├── Footer.jsx
│   ├── CornerSquare.jsx
│   ├── ButtonPrimary.jsx
│   ├── ButtonOutline.jsx
│   ├── ButtonGhostLink.jsx
│   ├── BadgeTag.jsx
│   ├── QualityBadge.jsx
│   ├── LoadingBar.jsx
│   └── ErrorBanner.jsx
├── pages/
│   ├── HomePage.jsx
│   │   ├── HeroSection.jsx
│   │   ├── DropZone.jsx
│   │   └── FeatureStrip.jsx
│   ├── AnalysisResultPage.jsx
│   │   ├── ResultHero.jsx
│   │   ├── ScoreGauge.jsx
│   │   ├── IssueCard.jsx
│   │   ├── FeatureStatsTable.jsx
│   │   ├── FeatureImportanceChart.jsx
│   │   └── GradCamViewer.jsx
│   ├── HistoryPage.jsx
│   │   ├── HistoryCard.jsx
│   │   ├── PillTab.jsx
│   │   └── SearchInput.jsx
│   └── NotFoundPage.jsx
├── services/
│   └── api.js
└── constants/
    ├── issueDescriptions.js   ← Issue type → human name + description map
    └── featureThresholds.js   ← PASS/WARN/FAIL thresholds per feature
```

---

*Plan authored: 2026-08-29 11:30 IST · Anshuman Pattnaik*
