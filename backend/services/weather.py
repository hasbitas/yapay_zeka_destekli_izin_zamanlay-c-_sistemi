"""
Hava durumu servisi.

Üretimde Open-Meteo / OpenWeatherMap çağrılır; hackathon demosu için
deterministik bir mock kullanıyoruz (senaryo: Salı 2026-05-19 → -5°C).
"""
from typing import Dict

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


def get_weather_forecast(city: str, date: str) -> Dict:
    if date in SCENARIO_OVERRIDES:
        w = dict(SCENARIO_OVERRIDES[date])
        w.update({"city": city, "date": date, "source": "scenario_mock"})
        return w
    return {
        "city": city, "date": date, "source": "default_mock",
        "tavg": 16.0, "tmin": 10.0, "tmax": 22.0,
        "prcp": 0.5, "snow": 0.0, "snow_day": 0,
        "condition": "Parçalı bulutlu",
    }
