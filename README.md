# YAP-İS — Yapay Zeka Destekli İzin Planlayıcısı

> **Predictive Healthcare Management**
> Hava durumu + resmi tatil + hastalık trendlerini birleştiren CatBoost modeli, acil servis yoğunluğunu öngörüp doktor izinlerini otonom olarak yeniden planlar.

## 📁 Repo Yapısı

```
.
├── backend/    FastAPI iş mantığı + REST API (port 8000) ─ frontend'i de servis eder
│   ├── main.py
│   ├── routes/        personnel, leave_requests, schedule, ai
│   └── services/      mock_data, weather
├── frontend/   YAP-İS dashboard (vanilla HTML/CSS/JS, login + KPI + alert banner)
├── ai/         CatBoost tahmin mikroservisi (FastAPI, port 9000)
│   └── predictor.py
├── data/       Eğitilmiş model, dataset, feature importance
└── scripts/    run_all.sh • demo_scenario.py • download_model.py
```

## 🚀 Tek Komutla Demo

```bash
python scripts/download_model.py    # (opsiyonel) Drive'dan model+dataset indir
bash scripts/run_all.sh             # AI(9000) + Backend+Frontend(8000) ayağa kalkar
# Tarayıcı:  http://127.0.0.1:8000/
# Login:     AY001 / ayse123   (veya BAŞHEKİM / admin)
```

## 🎬 Senaryo: Salı -5°C

1. Frontend "🤖 Predictive Scenario Çalıştır" butonuna basılır.
2. Backend `services/weather.py` → 2026-05-19 için **-5°C, kar yağışı** verisi alır.
3. Backend → AI servisinin `POST /predict` endpoint'ine hava verisini gönderir.
4. CatBoost (`tavg`, `dayofweek`, `snow`, `prcp` ...) **%40+ vaka artışı** öngörür.
5. Backend iş mantığı: `surge ≥ %20` → o günkü onaylı izinleri **Perşembe'ye** taşır.
6. Frontend kırmızı **"Hava Durumu Kaynaklı Operasyonel Güncelleme"** banner'ını,
   güncellenmiş çizelgeyi (kaydırılan satırlar flash highlight) ve KPI'ları yansıtır.

## 🔌 Mimari (CTO notu)

```
┌─────────┐  POST /api/ai/predict-and-reschedule  ┌──────────┐
│Frontend │ ────────────────────────────────────► │ Backend  │
│  :8000  │  ◄──── unified JSON payload ────────  │FastAPI   │
└─────────┘                                       │ :8000    │
                                                  └─┬──────┬─┘
                              weather mock ◄────────┘      │
                                                           ▼
                                                  ┌──────────────┐
                                                  │ AI Predictor │
                                                  │ FastAPI :9000│
                                                  │ + CatBoost   │
                                                  └──────────────┘
```

REST/JSON over HTTP. CORS açık. AI servisi `AI_SERVICE_URL` env ile değiştirilebilir.
Model dosyası yoksa AI servisi `feature_importance.csv` türevli **heuristic fallback**'e düşer — demo asla kırılmaz.
