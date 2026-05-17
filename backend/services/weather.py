"""
Hava durumu servisi.

İki katmanlı çalışır:
  1) SCENARIO_OVERRIDES içinde elle tanımlanmış senaryo günleri (sunum için)
  2) Diğer tüm tarihler: tarihten deterministik şekilde sentetik hava üretilir
     (Ankara mevsim profili). Böylece kullanıcı dashboard'da hangi günü seçerse
     seçsin AI her zaman makul bir tahmin döndürür.
"""
from __future__ import annotations

import hashlib
import math
from datetime import datetime
from typing import Dict

# Sunum senaryolarında jüriye gösterilecek "hazırlanmış" günler.
SCENARIO_OVERRIDES: Dict[str, Dict] = {
    "2026-05-19": {  # Senaryo: Salı, soğuk dalga
        "tavg": -5.0, "tmin": -9.0, "tmax": -1.0,
        "prcp": 2.4, "snow": 6.0, "snow_day": 1,
        "condition": "Kar yağışı + don",
    },
    "2026-05-21": {  # Perşembe, normal
        "tavg": 14.0, "tmin": 8.0, "tmax": 19.0,
        "prcp": 0.0, "snow": 0.0, "snow_day": 0,
        "condition": "Açık",
    },
}


def _seasonal_temp(d: datetime) -> float:
    """Ankara için kabaca yıllık sıcaklık eğrisi: Ocak ~0°C, Temmuz ~24°C."""
    day_of_year = d.timetuple().tm_yday
    # En sıcak: gün 200 (yaklaşık 19 Temmuz)
    return 12.0 + 12.0 * math.cos((day_of_year - 200) / 365.0 * 2 * math.pi)


def _det_hash(s: str) -> float:
    """Tarihten 0-1 arası deterministik bir noise üret."""
    h = hashlib.md5(s.encode()).hexdigest()
    return int(h[:8], 16) / 0xFFFFFFFF


def _synthesize(city: str, date: str) -> Dict:
    d = datetime.strptime(date, "%Y-%m-%d")
    base = _seasonal_temp(d)
    noise = (_det_hash(date) - 0.5) * 8.0  # ±4°C oynama
    tavg = round(base + noise, 1)
    swing = 5.0 + _det_hash(date + "swing") * 4.0
    tmin = round(tavg - swing, 1)
    tmax = round(tavg + swing, 1)

    # Yağış / kar olasılığı kışın artar
    cold_factor = max(0.0, (10.0 - tavg) / 20.0)   # 0..1
    rng2 = _det_hash(date + "prcp")
    prcp = round(rng2 * (1.0 + cold_factor * 6.0), 1) if rng2 > 0.55 else 0.0

    snow, snow_day = 0.0, 0
    if tavg <= 1.0 and prcp > 0:
        snow = round(prcp * (1.5 + cold_factor), 1)
        snow_day = 1

    if snow_day:
        cond = "Kar yağışı"
    elif prcp > 3:
        cond = "Sağanak yağış"
    elif prcp > 0:
        cond = "Hafif yağmur"
    elif tavg >= 28:
        cond = "Sıcak ve açık"
    elif tavg <= 0:
        cond = "Don, açık"
    else:
        cond = "Parçalı bulutlu"

    return {
        "city": city, "date": date, "source": "synthetic_seasonal",
        "tavg": tavg, "tmin": tmin, "tmax": tmax,
        "prcp": prcp, "snow": snow, "snow_day": snow_day,
        "condition": cond,
    }


def get_weather_forecast(city: str, date: str) -> Dict:
    """Verilen tarih için hava verisi döndürür; senaryo yoksa sentezler."""
    if date in SCENARIO_OVERRIDES:
        w = dict(SCENARIO_OVERRIDES[date])
        w.update({"city": city, "date": date, "source": "scenario_mock"})
        return w
    try:
        return _synthesize(city, date)
    except Exception:
        # Son çare: nötr varsayılan
        return {
            "city": city, "date": date, "source": "default_fallback",
            "tavg": 16.0, "tmin": 10.0, "tmax": 22.0,
            "prcp": 0.0, "snow": 0.0, "snow_day": 0,
            "condition": "Parçalı bulutlu",
        }
