# VisiMetric — AI-Powered Image Quality & Defect Detection
### Implementation Plan · Senior Architect Review

---

## Problem Statement

Build a full-stack application that accepts an image and automatically evaluates its visual quality. The system must identify common image-quality problems (blur, exposure, noise, corruption, defects) and classify the image as **ACCEPTABLE**, **DEGRADED**, or **DEFECTIVE** — **without any external AI or vision API**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       BROWSER                           │
│             React + Vite + TailwindCSS                  │
└────────────────────────┬────────────────────────────────┘
                         │  REST / JSON
┌────────────────────────▼────────────────────────────────┐
│              BACKEND  (FastAPI · Python 3.11)            │
│  ┌─────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │  API Layer  │  │  CV Pipeline  │  │  ML Engine   │  │
│  │  (routes)   │  │  (features)   │  │  (classifier)│  │
│  └─────────────┘  └───────────────┘  └──────────────┘  │
│                    ┌──────────────────┐                 │
│                    │  SQLite (aiosqlite│                 │
│                    │  + SQLAlchemy)    │                 │
│                    └──────────────────┘                 │
└─────────────────────────────────────────────────────────┘
                         │
           ┌─────────────▼────────────┐
           │   Docker Compose         │
           │   (backend + frontend)   │
           └──────────────────────────┘
```

---

## Open Questions

> [!IMPORTANT]
> No open blockers from the spec. All design choices are resolved below with rationale documented in `ARCHITECT_LOG.md`.

---

## Technology Stack

### Backend
| Concern | Choice | Rationale |
|---|---|---|
| Language | Python 3.11 | Best ecosystem for CV/ML |
| API Framework | FastAPI | Async, OpenAPI out-of-the-box |
| CV Library | OpenCV (`opencv-python-headless`) | Industry standard; no GUI dep |
| ML Framework | scikit-learn + PyTorch (EfficientNet-B0) | Hybrid approach: fast classical features + DL backbone |
| Database | SQLite via SQLAlchemy (async) + aiosqlite | Zero-setup, self-contained, portable |
| Image handling | Pillow | Preprocessing and format normalisation |
| Feature extraction | NumPy, SciPy | FFT, Laplacian variance, histogram stats |
| Logging | Python `logging` + `structlog` (JSON) | Machine-readable structured logs |
| Explainability | `torchcam` (Grad-CAM) | Saliency maps for DL branch |

### Frontend
| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| HTTP client | Axios |
| State | useState / useEffect (no Redux needed) |
| Charts | Recharts (score gauge, history list) |

### DevOps
| Concern | Choice |
|---|---|
| Containerisation | Docker + Docker Compose |
| Env config | `.env` file + `python-dotenv` |
| Health endpoint | `GET /health` |

---

## Dataset & Training Strategy

### Primary Dataset
**KADID-10k** (Kaggle / public)  
- 10,125 distorted images derived from 81 reference images  
- 25 distortion types including blur, noise, JPEG artefacts, brightness/contrast shifts  
- Each image has a DMOS (Differential Mean Opinion Score) — a ground-truth quality score  
- **Why**: Contains exactly the distortion categories required by the spec; perceptual quality ground truth  

**Fallback / Augmentation**  
**Synthetic degradation pipeline** (generated from COCO val2017 clean images):
- Gaussian blur (σ ∈ [0.5, 5])  
- Salt-and-pepper + Gaussian noise (var ∈ [0.001, 0.05])  
- Gamma correction for under/over-exposure (γ ∈ [0.2, 0.5] / [1.8, 3.0])  
- JPEG re-compression (quality ∈ [1, 20]) for artefact/corruption class  
- Random pixel zeroing (5–30% of pixels) for severe degradation  

This gives a balanced labelled dataset without licensing issues.

### Label Strategy
Map DMOS/synthetic severity to three classes:
| Label | Score Range |
|---|---|
| ACCEPTABLE | quality_score ≥ 70 |
| DEGRADED | 40 ≤ quality_score < 70 |
| DEFECTIVE | quality_score < 40 |

---

## ML / CV Pipeline (Two-Stage Hybrid)

### Stage 1 — Classical Feature Extraction
Compute interpretable features per image:

| Feature | Method | Detects |
|---|---|---|
| Laplacian Variance | `cv2.Laplacian` | Blur / sharpness |
| FFT Energy Ratio | `np.fft.fft2` high-freq power | Blur / softness |
| Mean Luminance | Histogram mean (L-channel) | Under/over-exposure |
| Histogram Spread | Std-dev of pixel values | Contrast / flat images |
| BRISQUE-like | Local normalised DCT stats | No-reference IQA |
| Noise Estimate | `skimage.restoration.estimate_sigma` | Noise level |
| Saturation Mean | HSV S-channel mean | Colour integrity |
| SSIM vs blurred self | `skimage.metrics.ssim` | Structural loss |

Output: **18-dimensional feature vector** — one row per image.

### Stage 2 — ML Classifier
**Primary model**: `EfficientNet-B0` (PyTorch, pretrained on ImageNet, fine-tuned on KADID-10k)  
- Input: 224×224 RGB image  
- Head: replaced with `[Dropout(0.3) → Linear(1280, 512) → ReLU → Linear(512, 3)]`  
- Output: 3-class softmax (ACCEPTABLE / DEGRADED / DEFECTIVE)  
- Training: 20 epochs, Adam, LR=1e-4, cosine LR schedule, mixed precision  

**Auxiliary model**: Random Forest on Stage-1 feature vector  
- Provides a fast, explainable prediction  
- Used as a fallback if DL model is unavailable / for feature importance display  

**Ensemble**: Weighted average of DL softmax + RF probability — weights tunable via env var.

---

## Proposed File & Directory Structure

```
VisiMetric/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app factory + startup
│   │   ├── config.py              # Settings (pydantic BaseSettings)
│   │   ├── database.py            # SQLAlchemy async engine + session
│   │   ├── models/
│   │   │   └── analysis.py        # ORM model: AnalysisResult
│   │   ├── schemas/
│   │   │   └── analysis.py        # Pydantic in/out schemas
│   │   ├── routers/
│   │   │   ├── analysis.py        # POST /analyze, GET /analyses, GET /analyses/{id}
│   │   │   └── health.py          # GET /health
│   │   ├── services/
│   │   │   ├── cv_pipeline.py     # Stage-1 classical feature extraction
│   │   │   ├── ml_engine.py       # Stage-2 DL inference + ensemble
│   │   │   ├── explainability.py  # Grad-CAM, feature importance
│   │   │   └── analysis_service.py# Orchestrates pipeline; writes to DB
│   │   └── utils/
│   │       ├── image_utils.py     # Validation, resizing, format norm
│   │       └── logging_config.py  # structlog JSON setup
│   ├── ml/
│   │   ├── dataset/
│   │   │   ├── download_kadid.py  # Script to fetch + organise KADID-10k
│   │   │   └── synthetic_degradation.py  # Augmentation pipeline
│   │   ├── train_dl.py            # EfficientNet-B0 fine-tuning
│   │   ├── train_rf.py            # Random Forest on feature vectors
│   │   ├── evaluate.py            # Metrics: accuracy, F1, ROC-AUC, confusion matrix
│   │   └── models/
│   │       ├── efficientnet_b0_visimetric.pth   # Trained weights (gitignored, mounted via volume)
│   │       └── rf_classifier.pkl                # Serialised RF model
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_cv_pipeline.py
│   │   └── test_ml_engine.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── IssueCard.jsx
│   │   │   ├── QualityGauge.jsx
│   │   │   ├── AnalysisHistory.jsx
│   │   │   └── GradCamViewer.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── ARCHITECT_LOG.md              # ← Decision log (see below)
├── README.md
├── .env.example
└── sample_images/
    ├── acceptable_sharp.jpg
    ├── blurry_low.jpg
    ├── noisy_medium.jpg
    ├── overexposed_high.jpg
    ├── underexposed_high.jpg
    └── corrupted_defective.jpg
```

---

## API Design

### `POST /analyze`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (image binary)
- **Response 200**:
```json
{
  "id": "uuid",
  "filename": "photo.jpg",
  "quality_score": 82,
  "quality_label": "ACCEPTABLE",
  "issues": [
    {"type": "noise", "severity": "low", "confidence": 0.71}
  ],
  "feature_stats": {
    "laplacian_variance": 423.1,
    "mean_luminance": 128.4,
    "noise_sigma": 0.012,
    "saturation_mean": 0.44
  },
  "gradcam_url": "/static/gradcam/{id}.png",
  "analyzed_at": "2026-08-29T11:15:00Z"
}
```

### `GET /analyses`
- Returns paginated list of past analyses

### `GET /analyses/{id}`
- Returns a single analysis record

### `GET /health`
- Returns `{"status": "ok", "model_loaded": true}`

---

## Database Schema

**Table: `analysis_results`**

| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| filename | TEXT | Original filename |
| file_hash | TEXT | SHA-256 of raw bytes |
| quality_score | FLOAT | 0–100 |
| quality_label | TEXT | ACCEPTABLE / DEGRADED / DEFECTIVE |
| issues_json | TEXT | JSON-serialised issues array |
| feature_stats_json | TEXT | JSON-serialised feature vector |
| gradcam_path | TEXT | Relative path to saliency PNG |
| model_version | TEXT | e.g., "efficientnet_b0_v1" |
| analyzed_at | DATETIME | UTC |

---

## Explainability Plan

- **DL branch**: Grad-CAM via `torchcam` on the last conv block of EfficientNet-B0 → saved as PNG overlay → served as static file  
- **Classical branch**: Random Forest `feature_importances_` → returned in JSON as `feature_stats` alongside threshold-based triggered issues  
- **Per-issue confidence**: DL softmax class probability; RF probability for that class  

---

## Evaluation Plan

Run `ml/evaluate.py` on held-out 20% of KADID-10k:

| Metric | Expected threshold |
|---|---|
| 3-class Accuracy | ≥ 80% |
| Macro F1 | ≥ 0.78 |
| ROC-AUC (OvR) | ≥ 0.90 |
| Confusion matrix | Included in README |

Failure case analysis: images that straddle class boundaries (score ~40 or ~70), heavily compressed images misclassified as noise, night-mode photos misclassified as underexposed.

---

## Deployment

```yaml
# docker-compose.yml (sketch)
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes:
      - ./backend/ml/models:/app/ml/models
      - ./data/db:/app/data
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    environment:
      - VITE_API_URL=http://localhost:8000
```

- `docker compose up --build` is the single command to run the full stack  
- `.env.example` documents every configurable variable  
- Model weights mounted as a volume (not baked into image)

---

## Verification Plan

### Automated Tests
```bash
# Backend
cd backend && pytest tests/ -v --cov=app

# Frontend
cd frontend && npm test
```

### Manual Verification
1. Upload each of the 6 sample images and verify correct label  
2. Confirm `/health` returns `model_loaded: true`  
3. Confirm history page shows past analyses  
4. Confirm Grad-CAM image renders in UI  
5. Run `docker compose up --build` on a clean machine  

---

## Bonus Items (In Scope)

- [x] Quality heatmaps via Grad-CAM  
- [x] Structured JSON logging for all decisions  
- [x] Health endpoint  
- [ ] Batch image analysis *(stretch)*  
- [ ] CI/CD workflow *(stretch)*  

---

*Plan authored: 2026-08-29 · Architect: Senior SWE Review*
