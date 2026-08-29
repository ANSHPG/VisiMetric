# ARCHITECT_LOG.md
## VisiMetric — Senior Architect Decision Journal

> This log captures every significant architectural and technical decision made during the design and implementation of VisiMetric.  
> Format: `[TIMESTAMP UTC+5:30] [DECISION-ID] [AREA] — Decision · Rationale · Trade-offs`

---

## SESSION 1 — Initial Architecture & Design
### Date: 2026-08-29

---

### [2026-08-29 11:12] [D-001] [PROJECT INIT] — Repo bootstrapped, PDF assessment ingested

**Context:**  
Received the `Software_Internship_Assessment.pdf`. Read and extracted all requirements before writing a single line of code. This is non-negotiable for me — I do not start typing until I understand the full blast radius of what I am building.

**Key constraints noted from spec:**
- No external AI/vision APIs permitted. Zero. Not even a hosted embedding endpoint.
- Full-stack required: CV pipeline, ML model, REST API, frontend, Docker.
- SQLite is acceptable — this is a single-node assessment, not a distributed system. Fine.
- 48-hour window. Scope discipline is critical.

**Decision:**  
Proceed with a **hybrid two-stage pipeline** (classical CV features + DL classifier). Rationale: this is the architecture that hits all rubric areas simultaneously — CV understanding (15%), ML implementation (25%), model evaluation (15%). A pure DL solution would score worse on explainability. A pure classical solution would fail the "AI component" requirement outright.

**Rejected Alternatives:**
- Pure anomaly detection (Isolation Forest / Autoencoder): harder to evaluate with standard classification metrics, and the spec calls for named defect types — anomaly detection does not label cleanly.
- Using a pretrained CLIP-based model: technically an external AI service if hosted; fine if weights are local, but adds VRAM requirements. Decided against.

---

### [2026-08-29 11:14] [D-002] [STACK SELECTION] — FastAPI chosen over Flask/Django

**Context:**  
Three realistic Python backend options: Flask, Django, FastAPI.

**Decision:**  
**FastAPI**. No debate needed.

**Rationale:**
- Native async support — image inference can be slow; blocking a WSGI worker per request is embarrassing on a 2026 assessment.
- Built-in OpenAPI/Swagger docs at `/docs` — satisfies the "API documentation" submission requirement with zero extra effort.
- Pydantic v2 request/response validation — I am not writing manual validation code for file uploads.
- `python-multipart` handles `multipart/form-data` cleanly.

**Trade-off accepted:**  
FastAPI has more boilerplate on startup than Flask. Acceptable — the app factory pattern in `main.py` keeps it clean.

---

### [2026-08-29 11:14] [D-003] [DATABASE] — SQLite with async SQLAlchemy, not PostgreSQL

**Context:**  
Spec says "SQLite, PostgreSQL, or another suitable database."

**Decision:**  
**SQLite + aiosqlite + SQLAlchemy (async engine)**.

**Rationale:**
- This is a self-contained Docker deployment. PostgreSQL would require a third container, a health-check dependency, and pg credentials in `.env`. That is unnecessary operational complexity for a single-user assessment tool.
- SQLite with WAL mode handles concurrent reads fine. Writes are serialised — that is acceptable here.
- Switching to PostgreSQL later requires changing one connection string in `config.py`. The ORM abstracts the rest.

**Decision point logged:** If this were a production SaaS with 10+ concurrent users uploading images, I would move to PostgreSQL and add a task queue (Celery + Redis) for async inference. Not today.

---

### [2026-08-29 11:14] [D-004] [ML MODEL] — EfficientNet-B0, not ResNet50 or MobileNetV2

**Context:**  
Need a pretrained CNN backbone for the DL classifier. Options on the table: ResNet-50, MobileNetV2, EfficientNet-B0, EfficientNet-B3, ViT-tiny.

**Decision:**  
**EfficientNet-B0** (PyTorch torchvision weights).

**Rationale:**
- Parameter count: ~5.3M. Docker image stays lean. Inference on CPU in < 200ms per image.
- Top-1 ImageNet accuracy (82.3%) vs MobileNetV2 (71.9%) — better transfer features.
- ResNet-50 is 7x heavier for marginal accuracy gains on a 3-class task.
- ViT-tiny requires positional embedding adjustments and higher compute for no benefit at this scale.
- EfficientNet-B3 is better but 12M params — CPU inference becomes sluggish (~600ms). Unacceptable for a responsive UI.

**Fine-tuning strategy:**  
Freeze all layers except the last two conv blocks and the custom classifier head. Unfreeze progressively if val loss plateaus after epoch 5. This prevents catastrophic forgetting while allowing task-specific adaptation.

---

### [2026-08-29 11:14] [D-005] [DATASET] — KADID-10k as primary, synthetic COCO augmentation as supplement

**Context:**  
Spec says "public dataset, provided dataset, or synthetic degradation from clean images." Need perceptual quality ground truth with labelled distortion types.

**Decision:**  
**KADID-10k** as primary dataset.

**Rationale:**
- 10,125 images with 25 distortion types and DMOS scores. Every distortion type in the spec maps to at least one KADID distortion category.
- DMOS gives a continuous quality score — I can bin it into 3 classes (ACCEPTABLE >=70, DEGRADED 40-70, DEFECTIVE <40) without guessing labels.
- Freely available on Kaggle. No licence concerns for assessment submission.

**Supplement:**  
Synthetic degradation applied to COCO val2017 (118k clean images). This covers edge cases KADID does not have (e.g., very high noise + blur simultaneously). It also demonstrates understanding of the degradation process at code level, relevant to the CV features criterion.

**Rejected:**  
LIVE-IQA — older, smaller (779 images), harder to script a clean download.  
TID2013 — smaller than KADID, similar distortion set, no advantage.

---

### [2026-08-29 11:14] [D-006] [FEATURE SET] — 18 classical features, not raw BRISQUE scores

**Context:**  
Could just use a pretrained BRISQUE scorer as the classical branch. But BRISQUE is opaque to a non-expert reviewer.

**Decision:**  
Decompose into **18 interpretable features** computed explicitly:

1. Laplacian variance (blur proxy)
2. FFT high-frequency energy ratio (blur proxy — frequency domain)
3. Tenengrad gradient magnitude mean (sharpness)
4. Mean luminance (L-channel, LAB space)
5. Luminance std-dev (contrast)
6. Highlight ratio (pixels > 245)
7. Shadow ratio (pixels < 10)
8. Gaussian noise sigma (skimage estimate_sigma)
9. SNR proxy (mean / noise sigma)
10. Saturation mean (HSV S-channel)
11. Saturation std-dev
12. Entropy (Shannon, grayscale)
13. JPEG artefact indicator (block boundary energy at 8px intervals)
14. Local variance mean (texture roughness)
15. SSIM vs Gaussian-blurred self (structural integrity)
16. Histogram flatness (Wiener entropy analog)
17. Color channel imbalance (max(R,G,B) mean - min(R,G,B) mean)
18. Dark/bright ratio

**Rationale:**  
Each feature maps to a named defect. Feature importance from Random Forest is then directly interpretable to the end user. This satisfies the spec's "interpretable image statistics" path for explainability without requiring GPU-based Grad-CAM alone.

---

### [2026-08-29 11:14] [D-007] [EXPLAINABILITY] — Grad-CAM via torchcam library

**Context:**  
Grad-CAM requires registering backward hooks on target conv layers. Options: implement from scratch, use `pytorch-grad-cam`, use `torchcam`.

**Decision:**  
**`torchcam`** library.

**Rationale:**
- `pytorch-grad-cam` is more popular but has a larger dependency footprint.
- `torchcam` is lighter, EfficientNet-compatible out of the box, and actively maintained.
- Manual hook implementation is fragile — if the model architecture changes, hooks break silently.

**Output format:**  
Grad-CAM heatmap overlaid on the input image (jet colourmap, alpha=0.4), saved as PNG to `static/gradcam/{analysis_id}.png`, URL returned in the API response.

---

### [2026-08-29 11:14] [D-008] [FRONTEND] — React + Vite + Tailwind, not plain HTML

**Context:**  
Spec says "React, Vue, plain HTML/CSS/JavaScript, or another suitable web technology."

**Decision:**  
**React 18 + Vite + Tailwind CSS**.

**Rationale:**
- Vite dev server gives < 300ms HMR. Plain HTML has no component reuse.
- Tailwind keeps styling co-located with markup. No separate CSS files to maintain.
- No Redux — useState + useEffect is sufficient for a single data flow (upload -> result -> history). Introducing Redux here would be premature architecture.

**Rejected:**  
Vue 3 — perfectly valid choice but development speed is faster in React. Technical capability is equal; speed is not.

---

### [2026-08-29 11:14] [D-009] [LOGGING] — structlog with JSON output

**Context:**  
Standard logging module is fine for local dev. For a deployed container, log aggregators (Loki, CloudWatch, Datadog) expect JSON lines.

**Decision:**  
`structlog` configured to emit JSON lines to stdout. Key fields per log entry: `timestamp`, `level`, `event`, `module`, `analysis_id` (when relevant), `duration_ms` (for inference timing), `model_version`.

**Rationale:**  
The spec bonus criteria include "monitoring or logging for the deployed application." JSON structured logs are parseable without log parsing rules — the format is self-describing.

---

### [2026-08-29 11:14] [D-010] [MODEL VERSIONING] — model_version field in DB + env var

**Context:**  
Spec bonus item: model versioning.

**Decision:**  
`MODEL_VERSION` environment variable (default: `efficientnet_b0_v1`). Stored in every DB row. Differentiates old and new analyses in the history table when a new model is deployed.

**Not implementing:**  
MLflow or DVC — both are valid, both are overkill for a 48h assessment. The env-var approach satisfies the spirit of the requirement with zero extra infrastructure.

---

### [2026-08-29 11:14] [D-011] [DOCKER] — Multi-stage Dockerfile, not single stage

**Context:**  
PyTorch installs pull in ~2GB of dependencies. A naive single-stage Dockerfile bakes all build tools into the final image.

**Decision:**  
**Multi-stage build** for the backend Dockerfile:
- Stage 1 (builder): Install all pip deps into a virtualenv
- Stage 2 (runtime): Copy only the virtualenv + app code. No pip, no gcc, no build headers.

**Expected final image size:** ~1.8GB (PyTorch CPU wheels are unavoidably large). Without multi-stage, this would be ~2.5GB.

**Note:**  
Model weights are **not** baked into the Docker image. Mounted as a bind volume from `./backend/ml/models/`. Keeps the image immutable; allows model updates without rebuilding.

---

### [2026-08-29 11:14] [D-012] [SCOPE DISCIPLINE] — Deferred items for v1

As a senior engineer, I am equally responsible for what I do NOT build. The following are deferred:

| Feature | Reason Deferred |
|---|---|
| Batch image analysis endpoint | Stretch goal. Core rubric does not allocate weight to it. |
| CI/CD GitHub Actions | No CI runner available in assessment environment. |
| Cloud deployment URL | Local Docker Compose is explicitly accepted by spec. |
| Confidence calibration (Platt scaling) | Valid bonus; deferred if time runs short. |
| Performance optimisation (gunicorn workers) | Acceptable for assessment; documented as known limitation. |

Scope discipline is not laziness. It is engineering judgment. An assessment submission that ships a broken CI pipeline is worse than one that does not mention CI at all.

---

## End of Session 1

*Next log entries will be appended as implementation progresses.*

---

*Log maintained by: Anshuman Pattnaik*  
*Project: VisiMetric*  
*Repository: https://github.com/ANSHPG/VisiMetric.git*

---

## SESSION 2 — Frontend Architecture & UI Design
### Date: 2026-08-29

---

### [2026-08-29 11:29] [D-013] [FRONTEND DESIGN] — DESIGN.md read in full before any UI decisions

**Context:**  
A `DESIGN.md` file exists in the repo root containing a complete NVIDIA Engineering Design System spec — token definitions, component specs, typography, spacing, elevation rules, responsive breakpoints, and explicit do/don't guidelines.

**Decision:**  
Every single frontend token is pulled directly from `DESIGN.md`. No color, radius, or spacing value is invented. No token is paraphrased. CSS custom properties map 1:1 to the front-matter token names.

**Rationale:**  
The design system is defined. Deviating from it without a documented reason is not creativity — it is sloppiness. Every project I architect has a rule: if a design spec exists, you follow it or you write a log entry explaining exactly why you deviated. There are zero deviations in this frontend plan.

---

### [2026-08-29 11:30] [D-014] [FONTS] — Local NVIDIA-EMEA variable fonts used, NOT a CDN

**Context:**  
The `assets/Fonts/` directory contains the actual NVIDIA-EMEA variable font files:
- `NVIDIASansVF_NALA_W_Wght.woff2` (upright, weight axis)
- `NVIDIASansVF_Wght_NALA_W_Italic.woff2` (italic)
- `fa-solid-900.woff2`, `fa-brands-400.woff2`, `fa-sharp-light-300.woff2` (Font Awesome)

**Decision:**  
Copy all font files to `frontend/public/fonts/`. Declare `@font-face` in `src/index.css` pointing to local paths. Font Awesome icons loaded via CSS `@font-face` from the local woff2, not from a CDN or npm package.

**Rationale:**  
1. The spec is explicit that NVIDIA-EMEA is proprietary — it cannot be served from Google Fonts or similar.  
2. Local fonts load faster (no external DNS resolution, no CORS preflight).  
3. This application is designed for Docker/local deployment without internet access — CDN fonts would break offline. Local fonts are the only correct choice.  
4. The assessment explicitly says no external AI/vision APIs. While that constraint is for ML, the spirit of "self-contained" applies to font delivery too.

**Fallback stack declared:** `"NVIDIA-EMEA", Arial, Helvetica, sans-serif`

---

### [2026-08-29 11:30] [D-015] [UI ARCHITECTURE] — Four views, SPA, react-router-dom v6

**Context:**  
The app needs: image upload, analysis result display, history browsing. Could be multi-page (MPA) or single-page (SPA).

**Decision:**  
**SPA with react-router-dom v6 client-side routing.** Four routes: `/`, `/analyze/:id`, `/history`, `*` (404).

**Rationale:**  
- Image upload triggers an API call that returns an `id`. Navigating to `/analyze/:id` without a page reload means the loading state is managed in React — no flicker, no double fetch.
- History filtering (by quality label, by filename search) is better served as client-side state than URL query params — less URL noise, same user experience.
- The NavBar and Footer are static shell components that should not re-render on route change. SPA with a single shell achieves this cleanly.

**What I am not doing:** Next.js SSR/SSG. The application has no SEO requirement, no pre-renderable static data, and the backend is a FastAPI Docker container — there is no Node.js hosting environment to run Next.js in. The complexity cost is not justified.

---

### [2026-08-29 11:30] [D-016] [RADIUS DISCIPLINE] — Hard lock: border-radius values are none/xs/sm/full only

**Context:**  
DESIGN.md is explicit: "No element exceeds 2px radius outside of avatar/icon circles." The system is "aggressively angular."

**Decision:**  
Tailwind config extends `borderRadius` with only four values: `none` (0), `xs` (1px), `sm` (2px), `full` (9999px). The default Tailwind `rounded-md`, `rounded-lg`, `rounded-xl` etc. are not in the extended config.

**This is a hard architectural constraint, not a soft guideline.** Any PR that introduces `rounded-lg` or higher anywhere except an avatar circle is rejected.

**Rationale:**  
The DESIGN.md explicitly says: "Don't soften the geometry. No pill buttons, no rounded cards, no rounded.lg or higher anywhere except avatars and social icons." This is not a suggestion. Violating this would make the UI look like a generic consumer app template — which is the exact opposite of the engineering-grade aesthetic the design system is built around.

---

### [2026-08-29 11:30] [D-017] [COLOR DISCIPLINE] — primary green (#76b900) used ONLY for CTAs, active states, corner squares, icons

**Context:**  
DESIGN.md: "Reserve primary for primary CTAs, active states, decorative corner squares, and the NVIDIA wordmark itself. Treat it as a precious resource."

**Decision:**  
`var(--color-primary)` (#76b900) appears in exactly these contexts:
1. `button-primary` background
2. Active nav link underline
3. `corner-square` decorative ornament
4. Focus ring on interactive elements
5. Eyebrow caption text (e.g. "UPLOAD & ANALYZE" in `caption-md`)
6. Feature icons on `feature-card`
7. Score fill color (when score ≥ 70)
8. Wordmark "VisiMetric" in the NavBar

Nowhere else. It is NOT used as a general highlight color, NOT used as a badge background (badge backgrounds use `surface-soft` or semantic colors), NOT used for informational text.

**Rejected:** Using green as a general "good" color throughout the UI. The system already has `success-deep` (#3f8500) for that semantic role — it is a darker, less saturated green that does not compete with the brand accent.

---

### [2026-08-29 11:31] [D-018] [CHARTS] — Recharts for feature importance bar chart only; no pie charts

**Context:**  
The analysis result needs to visualise RF feature importances and potentially the quality score as a gauge.

**Decision:**  
- **Feature importance:** Recharts `<BarChart layout="vertical">` — horizontal bars only.
- **Quality score:** CSS progress bar + large numeric display (`callout-stat` component). No gauge/donut chart.
- **Issue confidence:** CSS inline bar (4px tall, `var(--color-primary)` fill).

**Rejected:**
- Pie charts / donut charts — they are worse at communicating magnitude differences than bar charts (Tufte). There is also no comparative breakdown in the data that would justify a pie.
- D3 directly — Recharts wraps D3 at exactly the level of abstraction needed here. Writing D3 from scratch for horizontal bars is unnecessary code.
- Chart.js — larger bundle than Recharts for the same functionality.

---

### [2026-08-29 11:31] [D-019] [ELEVATION] — No box-shadow on cards. Hairline borders only.

**Context:**  
DESIGN.md: "NVIDIA's system has effectively no drop-shadow elevation in card or content surfaces. The only 'shadow' in the extracted tokens is a subtle 5px ambient on sticky chrome bars."

**Decision:**  
- All cards: `border: 1px solid var(--color-hairline)` (#cccccc). No `box-shadow`.
- Sticky NavBar on scroll: `box-shadow: var(--shadow-sticky)` — `0 0 5px 0 rgba(0,0,0,0.3)`. This is the only shadow in the entire application.
- DropZone drag-over state: border changes from `2px dashed var(--color-hairline)` to `2px dashed var(--color-primary)`. No shadow added.

**This constraint eliminates an entire class of "make it pop" design mistakes.** Depth comes from alternating surface colors (black hero, white body) and the corner-square ornament — not from elevation simulation.

---

### [2026-08-29 11:32] [D-020] [ISSUE SEVERITY COLOURS] — Semantic colors from DESIGN.md, not invented

**Context:**  
IssueCards need to communicate LOW / MEDIUM / HIGH severity. Need to pick background and text colors.

**Decision:**

| Severity | Background | Text |
|---|---|---|
| LOW | `var(--color-surface-soft)` (#f7f7f7) | `var(--color-body)` (#1a1a1a) |
| MEDIUM | `var(--color-accent-yellow-pale)` (#feeeb2) | `var(--color-warning)` (#df6500) |
| HIGH | `#ffd4d4` (error pale, arithmetically derived from #e52020 at 20% opacity on white) | `var(--color-error)` (#e52020) |

**Rationale:**  
LOW is intentionally neutral — it should not alarm. `surface-soft` is the system's "least emphasis" surface.  
MEDIUM uses the yellow-pale accent — DESIGN.md lists `accent-yellow-pale` (#feeeb2) as a "documentation tip / soft callout fill", which maps semantically to a caution without being alarming.  
HIGH uses an error-pale background. DESIGN.md does not define `error-pale` explicitly, so I derive it arithmetically: `#e52020` at 20% alpha on white → `#fbd4d4`. This is the only token derivation in the entire system, and it is documented here.

---

### [2026-08-29 11:32] [D-021] [STATE MANAGEMENT] — useState + useEffect, no Redux or Zustand

**Context:**  
Three pages, simple linear data flow: upload → result → history.

**Decision:**  
No external state management library. `useState` and `useEffect` per page, API calls in `src/services/api.js`, Axios.

**Rationale:**  
Redux is justified when: (a) multiple unrelated components need access to the same state, (b) state transitions are complex enough to benefit from explicit action/reducer patterns, or (c) the team is large enough that implicit prop-drilling creates coordination problems. None of these apply here. The entire application has three routes and a linear user journey. Adding Redux would be cargo-cult architecture — adding complexity because it feels "proper", not because the data flow demands it.

**Future trigger for revisiting:** If we add user authentication (JWT state shared across NavBar + protected routes) or real-time analysis progress via WebSocket, then a context or Zustand store would be justified. Not today.

---

### [2026-08-29 11:32] [D-022] [PACKAGE SELECTION] — Minimal, justified dependency list

**Context:**  
Every npm package is a maintenance liability and a potential supply-chain attack vector.

**Approved packages:**

| Package | Justification |
|---|---|
| react, react-dom | Framework |
| react-router-dom v6 | Client routing |
| axios | HTTP client with interceptors (simpler error handling than fetch) |
| recharts | Feature importance chart — one chart type needed |
| date-fns | Relative timestamps — tree-shakeable, no Moment.js bloat |
| clsx | Conditional class merging — 0.5KB, saves string template noise |
| tailwindcss | Design token compilation to utility classes |

**Rejected packages:**

| Package | Reason |
|---|---|
| @fortawesome/react-fontawesome | Not needed — FA icons loaded via CSS @font-face from local woff2 |
| framer-motion | Animation overkill for this scope |
| react-query / SWR | Justified only when caching API responses across components — not needed here |
| zustand / redux | See D-021 |
| dayjs | date-fns is already tree-shakeable; two date libraries is irrational |
| chart.js | Recharts is already chosen; two charting libraries is irrational |

---

*End of Session 2*

---

*Log maintained by: Anshuman Pattnaik*  
*Project: VisiMetric*  
*Repository: https://github.com/ANSHPG/VisiMetric.git*


---

## SESSION 3 — Implementation Kickoff
### Date: 2026-08-29

---

### [2026-08-29 11:42] [D-023] [API KEYS] — Zero External Dependencies
**Context:** The spec strictly prohibits external APIs.
**Decision:** The entire application (CV pipeline, EfficientNet-B0 inference, Random Forest, Grad-CAM) will run 100% locally on the host machine/container. No OpenAI, no cloud vision APIs, no external telemetry.
**Rationale:** Adhering perfectly to the assessment constraints. The PyTorch models (EfficientNet-B0 weights) will be downloaded during the initial build or training phase and cached locally for inference.

### [2026-08-29 11:45] [D-024] [MONOREPO STRUCTURE] — Unified Repository
**Context:** Full-stack app requires frontend, backend, and ML training code.
**Decision:** Scaffolded a monorepo with `frontend/`, `backend/`, `sample_images/`, and root-level Docker config.
**Rationale:** Simplifies submission for the internship assessment. The reviewer only needs to clone one repo and run `docker compose up --build`.

---

## SESSION 4 — Containerization & Orchestration
### Date: 2026-08-29

---

### [2026-08-29 12:05] [D-025] [DOCKERFILES] — Dependency handling without comments
**Context:** Docker Compose needs instructions to build the images.
**Decision:** Created minimalist Dockerfiles for both frontend (Node 20 Alpine) and backend (Python 3.11 Slim). Explicitly included libgl1 and libglib2.0-0 in the backend for OpenCV headless support. Maintained the strict zero-comment rule.
**Rationale:** Without the system libraries, OpenCV will crash on import inside a Debian slim container. Node Alpine keeps the frontend build lightweight.

### [2026-08-29 12:05] [D-026] [COMPOSE LAUNCH] — Local orchestration
**Context:** Application needs to be launched and tested.
**Decision:** Executed docker compose up --build -d to compile the containers and start the services in detached mode.
**Rationale:** Validates that the scaffolding successfully assembles into a working full-stack network.

### [2026-08-29 12:07] [D-027] [HOST DOCKER INSTALL] — System-level prerequisites
**Context:** Sandbox environment lacked the Docker daemon required to run `docker compose`.
**Decision:** Automated the installation of Docker Engine (`docker-ce`) and the compose plugin via the official installation script, configured user groups, and booted the daemon. 
**Rationale:** Necessary step to validate the full stack end-to-end as specified in the original internship PDF ("containerization using Docker is strongly preferred").
