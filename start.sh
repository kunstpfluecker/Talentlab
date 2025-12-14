#!/usr/bin/env bash

set -e

echo ">> Starte Backend..."
(
  cd "/Users/vico/Neuer Ordner/api"
  source .venv/bin/activate
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
) &
BACK_PID=$!

echo "Backend PID: ${BACK_PID}"

echo ">> Starte Frontend..."
cd "/Users/vico/Neuer Ordner/web"
npm run dev

echo ">> Stoppe Backend..."
kill "${BACK_PID}" >/dev/null 2>&1 || true
