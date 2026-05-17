#!/usr/bin/env bash
# YAP-IS — Tek proses launcher (Linux/macOS)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

# python3 -> python -> py sırasıyla dene
if command -v python3 >/dev/null 2>&1; then PYCMD=python3
elif command -v python  >/dev/null 2>&1; then PYCMD=python
else
  echo "HATA: Python bulunamadı. https://python.org/downloads"
  exit 1
fi

echo "[1/2] Bağımlılıklar yükleniyor..."
$PYCMD -m pip install -q -r requirements.txt

echo "[2/2] YAP-İS başlıyor: http://127.0.0.1:8000/"
exec $PYCMD main.py
