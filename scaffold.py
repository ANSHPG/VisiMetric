import os
import shutil

base = "/home/murphy/Documents/VisiMetric"

# 1. Copy implementation plan
impl_plan_src = "/home/murphy/.gemini/antigravity/brain/89ea36dd-84c8-40c0-9bb8-1a1253467e04/implementation_plan.md"
impl_plan_dest = os.path.join(base, "IMPLEMENTATION_PLAN.md")
if os.path.exists(impl_plan_src):
    shutil.copy(impl_plan_src, impl_plan_dest)

# 2. Create directories
dirs = [
    "backend/app/models", "backend/app/schemas", "backend/app/routers",
    "backend/app/services", "backend/app/utils", "backend/ml/dataset",
    "backend/ml/models", "backend/tests",
    "frontend/src/components", "frontend/src/pages", "frontend/src/services",
    "frontend/src/constants", "frontend/public/fonts",
    "sample_images"
]
for d in dirs:
    os.makedirs(os.path.join(base, d), exist_ok=True)

# 3. Write backend/requirements.txt
with open(os.path.join(base, "backend/requirements.txt"), "w") as f:
    f.write("""fastapi
uvicorn[standard]
python-multipart
sqlalchemy
aiosqlite
opencv-python-headless
scikit-learn
torch
torchvision
torchcam
pillow
numpy
scipy
structlog
pydantic
pydantic-settings
python-dotenv
pytest
pytest-asyncio
""")

# 4. Write frontend/package.json
with open(os.path.join(base, "frontend/package.json"), "w") as f:
    f.write("""{
  "name": "visimetric-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
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
    "autoprefixer": "^10.4.0"
  }
}""")

# 5. Update ARCHITECT_LOG.md
with open(os.path.join(base, "ARCHITECT_LOG.md"), "a") as f:
    f.write("""\n
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
""")

# 6. docker-compose.yml
with open(os.path.join(base, "docker-compose.yml"), "w") as f:
    f.write("""version: '3.8'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - MODEL_VERSION=efficientnet_b0_v1
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev -- --host 0.0.0.0 --port 3000
""")

# 7. Copy fonts to frontend/public/fonts
fonts_dir = os.path.join(base, "frontend/public/fonts")
assets_fonts = os.path.join(base, "assets/Fonts")
if os.path.exists(assets_fonts):
    for font in os.listdir(assets_fonts):
        if font.endswith(".woff2"):
            shutil.copy(os.path.join(assets_fonts, font), os.path.join(fonts_dir, font))
            
print("Scaffolding complete.")
