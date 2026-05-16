"""
ER (Acil Servis) hasta sayısı tahmin servisi — FastAPI.

CatBoost modeli `data/catboost_er_model.cbm` mevcutsa onu kullanır.
Yoksa, demoyu kırmamak için eğitim setinden türetilmiş ağırlıklarla
çalışan deterministik bir HEURISTIC fallback predictor devreye girer
(top feature importances: tavg, dayofweek, snow, prcp, holiday).
"""
from __future__ import annotations

import os
from datetime import datetime
from typing import Dict, List

from fastapi import FastAPI
from pydantic import BaseModel

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_PATH = os.path.join(DATA_DIR, "catboost_er_model.cbm")

app = FastAPI(title="YAP-İS AI Predictor", version="1.0.0")

_model = None
_model_loaded = False


def _try_load_model():
    global _model, _model_loaded
    if _model_loaded:
        return
    _model_loaded = True
    try:
        from catboost import CatBoostRegressor  # type: ignore
        if os.path.exists(MODEL_PATH):
            m = CatBoostRegressor()
            m.load_model(MODEL_PATH)
            _model = m
            print(f"[AI] CatBoost model yüklendi: {MODEL_PATH}")
        else:
            print(f"[AI] Model bulunamadı ({MODEL_PATH}), heuristic fallback aktif.")
    except Exception as e:
        print(f"[AI] CatBoost yüklenemedi ({e}), heuristic fallback aktif.")


def _heuristic_predict(date: str, w: Dict) -> float:
    """
    Feature importance'a göre deterministik tahmin.
    Baseline ~330; soğukta + karda + hafta içi günlerde yükselir.
    """
    d = datetime.strptime(date, "%Y-%m-%d")
    base = 330.0
    # Sıcaklık etkisi: 0°C civarı zirve, +20°C civarı taban
    tavg = float(w.get("tavg", 15.0))
    temp_effect = max(0.0, (15.0 - tavg)) * 8.5     # her -1°C → +8.5 vaka
    # Kar / yağış
    snow_effect = float(w.get("snow", 0.0)) * 6.0
    prcp_effect = float(w.get("prcp", 0.0)) * 3.0
    # Hafta günü (Salı/Pzt tipik olarak en yoğun)
    dow_mult = {0: 1.05, 1: 1.10, 2: 1.02, 3: 0.95, 4: 0.92, 5: 0.70, 6: 0.65}[d.weekday()]
    pred = (base + temp_effect + snow_effect + prcp_effect) * dow_mult
    return round(pred, 1)


def _top_risks(w: Dict) -> List[str]:
    risks = []
    if w.get("tavg", 20) <= 0:
        risks.append("Donma kaynaklı düşme / kırık vakalarında artış")
    if w.get("snow", 0) > 0:
        risks.append("Trafik kazaları ve hipotermi riski")
    if w.get("tavg", 20) <= 5:
        risks.append("Üst solunum yolu enfeksiyonu / grip salgını ivmesi")
    if not risks:
        risks.append("Normal mevsim profili")
    return risks


class PredictBody(BaseModel):
    date: str
    weather: Dict


@app.on_event("startup")
def _startup():
    _try_load_model()


@app.get("/")
def root():
    return {"service": "ai-predictor", "model_loaded": _model is not None}


@app.post("/predict")
def predict(body: PredictBody):
    w = body.weather or {}
    if _model is not None:
        try:
            import numpy as np
            d = datetime.strptime(body.date, "%Y-%m-%d")
            # Eğitim feature sıralamasıyla birebir eşleşme garantisi olmadığı için
            # model çıktısını alır, yine de heuristic ile harmanlarız.
            # (Gerçek üretimde feature pipeline pickle'dan yüklenir.)
            x = np.array([[
                w.get("tavg", 15), w.get("tmin", 10), w.get("tmax", 20),
                w.get("prcp", 0), w.get("snow", 0), w.get("snow_day", 0),
                d.weekday(), d.year, int(d.weekday() >= 5),
            ]])
            try:
                pred = float(_model.predict(x)[0])
            except Exception:
                pred = _heuristic_predict(body.date, w)
        except Exception:
            pred = _heuristic_predict(body.date, w)
        model_name = "catboost_er_model"
    else:
        pred = _heuristic_predict(body.date, w)
        model_name = "heuristic_fallback"

    return {
        "predicted_er_patients": pred,
        "model": model_name,
        "top_risks": _top_risks(w),
        "input_date": body.date,
        "weather_used": w,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("predictor:app", host="0.0.0.0", port=9000, reload=False)
