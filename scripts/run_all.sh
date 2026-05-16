#!/usr/bin/env bash
# Tek komutla tüm stack'i ayağa kaldırır.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "📦  AI servisi (port 9000) hazırlanıyor..."
( cd "$ROOT/ai" && pip install -q -r requirements.txt && \
  PYTHONUNBUFFERED=1 python predictor.py ) &
AI_PID=$!

sleep 2

echo "🚀  Backend + Frontend (port 8000) hazırlanıyor..."
( cd "$ROOT/backend" && pip install -q -r requirements.txt && \
  AI_SERVICE_URL=http://127.0.0.1:9000 python main.py ) &
BE_PID=$!

trap "kill $AI_PID $BE_PID 2>/dev/null || true" EXIT

echo ""
echo "✅  Hazır!"
echo "    Dashboard:  http://127.0.0.1:8000/"
echo "    API docs:   http://127.0.0.1:8000/docs"
echo "    AI service: http://127.0.0.1:9000/"
echo ""
wait
