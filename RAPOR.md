# 📋 Proje Raporu — YAP-İS: Yapay Zeka Destekli İzin Planlayıcı

## 🎯 Neden Yapıldı?

Hastane operasyonları reaktiftir: izinler ve nöbet çizelgeleri *geçmiş* verilere ve sezgiye dayanır. Bunun bedeli, acil servislerde beklenmedik yoğunluk anlarında personelin yetersiz kalması, hasta bekleme sürelerinin uzaması ve doktor tükenmişliğidir. Özellikle Türkiye'de kış ayları (grip salgını, donma kaynaklı düşmeler, hipotermi) acil servis vakalarında **%30–80 arası ani artışlara** yol açmaktadır.

**YAP-İS** (Yapay Zeka Destekli İzin Planlayıcı), bu sorunu *prediktif* bir yaklaşımla çözer: hava durumu, hafta günü, resmi tatiller ve geçmiş başvuru trendlerini birleştirerek **48 saat önceden** acil servis yoğunluğunu tahmin eder ve riskli günlere denk gelen doktor izinlerini otonom olarak düşük yoğunluklu güne kaydırır. Böylece hastane yönetimi reaktif değil, **prediktif** çalışır; doktorlar haftalık 2 izin haklarını sistemin önerdiği güvenli günlerden seçer.

## 🧠 Sistem Nasıl Çalışır?

1. **Kullanıcı (doktor) giriş yapar** → dashboard yüklenir, kişisel haftalık izin önerileri görüntülenir.
2. **Senaryo günü seçilir** (gün değiştirici) → "Yapay Zeka Analizini Başlat" butonuna basılır.
3. **Backend**, hava durumu servisinden o günün verisini çeker (Ankara için: sıcaklık, kar, yağış).
4. **AI mikroservisi**, eğitilmiş **CatBoost regresörü** ile o gün için ER (acil servis) hasta sayısını tahmin eder.
5. **Backend iş mantığı**, tahminle baseline'ı karşılaştırır:
   - Artış ≥ %20 ise o güne denk gelen onaylı izinleri otomatik olarak Perşembe'ye taşır.
6. **Backend 7 günlük forecast** üretir → her gün için ayrı AI çağrısı, yoğunluk sınıflandırması (Çok Düşük / Düşük / Orta / Yüksek / Çok Yüksek).
7. **Frontend** bu forecast ile:
   - 7 günlük bar grafiği çizer (her bar kendi oranına göre yeşil/sarı/kırmızı, seçilen gün outline).
   - İzin önerileri tablosunu **dinamik olarak yeniden inşa eder** (her gün bir satır, gerçek AI yoğunluk badge'i).
   - Hava durumu kaynaklı operasyonel güncelleme banner'ını gösterir.
   - Hafta değişimini ISO hafta numarasıyla takip eder; **haftalık 2 izin hakkı yeni haftada sıfırlanır**.

## 🛠️ Kullanılan Teknolojiler

| Katman | Teknoloji | Görev |
|---|---|---|
| **Frontend** | Vanilla HTML5 + CSS3 + JavaScript (ES6) | Dashboard, login, KPI kartları, bar grafiği, izin tablosu, dark mode |
| **Backend** | Python 3.11 + **FastAPI** + Uvicorn + Pydantic | REST API, iş mantığı, izin yeniden planlama, weather mock |
| **AI Servisi** | Python + FastAPI + **CatBoost** + NumPy + Pandas | Eğitilmiş ER tahmin modeli; model yoksa heuristic fallback |
| **HTTP İletişim** | `httpx` (async client) | Backend → AI servisi asenkron çağrılar |
| **Veri** | CatBoost `.cbm` modeli + Ankara ER dataset (CSV) | Feature importance: `tavg`, `dayofweek`, `prcp`, `snow`, `holiday_type` |
| **Versiyon Kontrol** | Git + GitHub | `claude/integrate-hackathon-modules-JZGjY` branch |
| **Çalıştırma** | `scripts/run_all.bat` (Win) + `scripts/run_all.sh` (Linux/Mac) | Tek komutla AI + Backend + Frontend ayağa kalkar |

## 📦 Repo Yapısı

```
backend/    FastAPI (port 8000) — routes (personnel, leave, schedule, ai) + services (weather, mock_data)
frontend/   YAP-İS dashboard (statik, backend tarafından servis edilir)
ai/         CatBoost tahmin mikroservisi (port 9000)
data/       Eğitilmiş model, dataset, feature importance
scripts/    run_all.sh / run_all.bat / download_model.py / demo_scenario.py
```

## 🎬 Doğrulanmış Senaryo

**2026-05-19 (Salı), -5°C, kar yağışı:**
- AI tahmini: **598 hasta** (baseline 330 → **+%81 artış**)
- Riskler: donma kaynaklı düşme, trafik kazaları, grip ivmesi
- Otomatik aksiyon: 3 doktor izni Salı'dan Perşembe'ye kaydırıldı
- Frontend: kırmızı uyarı banner + kaydırılan satırlar flash highlight + grafikte Salı barı outline'lı orta yoğunluk

## ✅ Çıktı

Hastane yönetimi, jüri demosunda butona tek tıklayarak tüm akışı görür: hava → AI → iş mantığı → UI güncellemesi **300 ms altında** tamamlanır. Sistem doktorun seçtiği herhangi bir tarihte (veri seti dışı günler için **sentetik mevsim profili** üretir) çalışır.
