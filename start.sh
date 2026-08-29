#!/bin/bash
echo "Starting VisiMetric Servers..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
