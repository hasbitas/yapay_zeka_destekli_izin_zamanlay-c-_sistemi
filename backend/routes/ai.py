"""
AI Optimizasyon ve Predictive Healthcare endpoint'leri.

Akış:
  1) Frontend  →  POST /api/ai/predict-and-reschedule {date, city}
  2) Backend   →  weather servisinden hava durumunu çeker
  3) Backend   →  AI servisine (ai/, port 9000) tahmin için POST atar
  4) AI        →  CatBoost modelinden ER (acil servis) hasta sayısı tahmini döner
  5) Backend   →  Tahmini baseline ile karşılaştırır; %artış > eşik ise
                  ilgili tarihteki izinleri otomatik olarak Perşembe'ye taşır
  6) Backend   →  Frontend'e tek bir bütünsel JSON payload döndürür
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Any, Dict, List

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.mock_data import leave_requests_db, schedule_db
from services.weather import get_weather_forecast

router = APIRouter()

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:9000")
BASELINE_PATIENTS = 330.0   # eğitim setindeki ortalamaya yakın
SURGE_THRESHOLD = 0.20      # %20 ve üzeri artış → operasyonel müdahale


class PredictRequest(BaseModel):
    date: str           # "2026-05-19"
    city: str = "Ankara"


def _shift_leaves_to(target_date: str, source_date: str) -> List[Dict[str, Any]]:
    """Source tarihindeki onaylı izinleri target tarihine taşır."""
    moved = []
    for req in leave_requests_db:
        if req["start_date"] == source_date and req["status"] == "approved":
            req["original_date"] = source_date
            req["start_date"] = target_date
            req["end_date"] = target_date
            req["status"] = "rescheduled"
            req["reschedule_reason"] = "AI: Hava durumu kaynaklı vaka artışı öngörüsü"
            moved.append(req)
    return moved


@router.post("/predict-and-reschedule")
async def predict_and_reschedule(payload: PredictRequest):
    """Hackathon ana akışı — hava + AI + iş mantığı tek çağrıda."""
    # 1) Hava durumu
    weather = get_weather_forecast(payload.city, payload.date)

    # 2) AI servisinden tahmin
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.post(
                f"{AI_SERVICE_URL}/predict",
                json={"date": payload.date, "weather": weather},
            )
            r.raise_for_status()
            ai_result = r.json()
    except Exception as e:
        raise HTTPException(503, f"AI servisine ulaşılamadı: {e}")

    predicted = float(ai_result["predicted_er_patients"])
    surge_pct = round((predicted - BASELINE_PATIENTS) / BASELINE_PATIENTS * 100, 1)

    # 3) İş mantığı: artış eşiği aşıldıysa izinleri taşı
    moved_leaves: List[Dict[str, Any]] = []
    action_taken = "no_action"
    target_date = None
    if surge_pct >= SURGE_THRESHOLD * 100:
        src = datetime.strptime(payload.date, "%Y-%m-%d")
        # Perşembe'ye ötele (haftanın 3. günü = weekday 3)
        delta = (3 - src.weekday()) % 7 or 7
        target_date = (src + timedelta(days=delta)).strftime("%Y-%m-%d")
        moved_leaves = _shift_leaves_to(target_date, payload.date)
        action_taken = "leaves_rescheduled" if moved_leaves else "no_leaves_to_move"

    # 4) Frontend için bütünsel payload
    return {
        "status": "success",
        "scenario_date": payload.date,
        "weather": weather,
        "ai_prediction": {
            "predicted_er_patients": round(predicted),
            "baseline": int(BASELINE_PATIENTS),
            "surge_pct": surge_pct,
            "top_risks": ai_result.get("top_risks", []),
            "model": ai_result.get("model", "catboost"),
        },
        "operational_response": {
            "action": action_taken,
            "rescheduled_to": target_date,
            "moved_leaves": moved_leaves,
            "message": (
                f"⚠️ {payload.date} için %{surge_pct} vaka artışı öngörüldü. "
                f"{len(moved_leaves)} doktor izni otomatik olarak {target_date} tarihine kaydırıldı."
                if moved_leaves else
                f"Tahmin {payload.date} için normal aralıkta (%{surge_pct}). Müdahale gerekmedi."
            ),
        },
        "updated_schedule": schedule_db,
        "updated_leaves": leave_requests_db,
    }


@router.post("/optimize-schedule")
def optimize_schedule():
    """Geriye uyumluluk için bırakılan mock optimizer."""
    return {
        "status": "success",
        "message": "Mock optimizasyon tamamlandı.",
        "data": schedule_db,
    }
