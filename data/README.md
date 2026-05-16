# data/

Eğitim çıktıları ve modeller. Büyük binary dosyalar repo'ya commit edilmez;
`scripts/download_model.py` ile Drive'dan indirilir.

- `catboost_er_model.cbm` — eğitilmiş CatBoost regresörü
- `er_dataset_ankara.csv` — eğitim veri seti
- `forecast_next_days.csv` — 14 günlük ileri tahmin
- `feature_importance.csv` — top özellikler (commit'li, AI heuristic için referans)
