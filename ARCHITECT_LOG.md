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

*Log maintained by: Senior SWE Architect*  
*Project: VisiMetric*  
*Repository: https://github.com/ANSHPG/VisiMetric.git*
