# VisiMetric - Project Context

## Overview
VisiMetric is an AI-powered Image Quality Assessment (IQA) application. It utilizes a hybrid approach:
1. **Classical Computer Vision** (OpenCV) for deterministic feature extraction (e.g., Laplacian variance for blur, Mean luminance for exposure).
2. **Deep Learning** (PyTorch / EfficientNet-B0) to classify image quality scores and catch complex distortions like JPEG artifacts and color noise.

## Directory Structure

### `/backend`
FastAPI application handling APIs, database storage (SQLite), and ML inference.
- `app/main.py`: Entry point for the FastAPI server.
- `app/routers/`: API endpoints (`/analyze`, `/analyses`, etc.).
- `app/services/ml_engine.py`: Loads the PyTorch model and executes inference.
- `app/services/cv_pipeline.py`: Calculates mathematical image statistics using OpenCV.
- `ml/train.py`: The PyTorch training pipeline. Loads KADID-10k and KonIQ-10k datasets, trains the neural network, and saves weights to the `models/` folder.
- `ml/models/`: Holds the compiled weights (e.g., `efficientnet_b0_v1.pth`).
- `ml/kadid10k/`: Contains the KADID-10k synthetic distortion dataset.
- `ml/KonIQ-10k/`: Contains the KonIQ-10k real-world "in the wild" dataset.

### `/frontend`
React.js (Vite) frontend application heavily utilizing Tailwind CSS for UI design.
- `src/App.jsx`: The core routing and component logic. Houses the Hero section, Upload Zone, Analysis Result dashboard, and History dashboard.
- `src/services/api.js`: Axios bindings connecting the React app to the FastAPI backend.
- `public/fonts/`: Houses custom typography (NVIDIA and FontAwesome).

### Root Level
- `start.sh`: A comprehensive startup script that concurrently boots both the FastAPI backend and the React frontend.
- `docker-compose.yml` / `Dockerfile`: Containerization setup (currently superseded by `start.sh` for local execution).
- `ARCHITECT_LOG.md`: Engineering logbook detailing all technical decisions and rationale.
