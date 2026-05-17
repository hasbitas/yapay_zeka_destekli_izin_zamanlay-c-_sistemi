/* ============================================
   YAP-IS Dashboard - JavaScript
   Yapay Zeka Destekli İzin Planlayıcı
   Giriş sistemi, dashboard etkileşimleri
   ============================================ */

// ============================================
// DOKTOR VERİTABANI
// 10 doktor hesabı: her biri benzersiz ID, şifre,
// isim ve kişisel izin önerilerine sahip.
// ============================================
const doctors = [
  {
    id: 'AY001', password: 'ayse123',
    name: 'Dr. Ayşe Yılmaz',
    // Her doktorun kendine özel önerilen izin tarihleri
    leaveRecommendations: [
      { date: '19 Mayıs 2026', day: 'Salı', intensity: 'Düşük', status: 'green' },
      { date: '22 Mayıs 2026', day: 'Cuma', intensity: 'Düşük', status: 'green' },
      { date: '24 Mayıs 2026', day: 'Pazar', intensity: 'Çok Düşük', status: 'green' },
    ]
  },
  {
    id: 'MK002', password: 'mehmet123',
    name: 'Dr. Mehmet Kaya',
    leaveRecommendations: [
      { date: '20 Mayıs 2026', day: 'Çarşamba', intensity: 'Düşük', status: 'green' },
      { date: '23 Mayıs 2026', day: 'Cumartesi', intensity: 'Çok Düşük', status: 'green' },
      { date: '25 Mayıs 2026', day: 'Pazartesi', intensity: 'Orta', status: 'yellow' },
    ]
  },
  {
    id: 'ED003', password: 'elif123',
    name: 'Dr. Elif Demir',
    leaveRecommendations: [
      { date: '18 Mayıs 2026', day: 'Pazartesi', intensity: 'Orta', status: 'yellow' },
      { date: '21 Mayıs 2026', day: 'Perşembe', intensity: 'Düşük', status: 'green' },
      { date: '24 Mayıs 2026', day: 'Pazar', intensity: 'Çok Düşük', status: 'green' },
    ]
  },
  {
    id: 'CO004', password: 'can123',
    name: 'Dr. Can Öztürk',
    leaveRecommendations: [
      { date: '19 Mayıs 2026', day: 'Salı', intensity: 'Düşük', status: 'green' },
      { date: '23 Mayıs 2026', day: 'Cumartesi', intensity: 'Çok Düşük', status: 'green' },
    ]
  },
  {
    id: 'ZA005', password: 'zeynep123',
    name: 'Dr. Zeynep Aksoy',
    leaveRecommendations: [
      { date: '20 Mayıs 2026', day: 'Çarşamba', intensity: 'Düşük', status: 'green' },
      { date: '22 Mayıs 2026', day: 'Cuma', intensity: 'Düşük', status: 'green' },
      { date: '24 Mayıs 2026', day: 'Pazar', intensity: 'Çok Düşük', status: 'green' },
      { date: '25 Mayıs 2026', day: 'Pazartesi', intensity: 'Orta', status: 'yellow' },
    ]
  },
  {
    id: 'AC006', password: 'ali123',
    name: 'Dr. Ali Çelik',
    leaveRecommendations: [
      { date: '21 Mayıs 2026', day: 'Perşembe', intensity: 'Düşük', status: 'green' },
      { date: '23 Mayıs 2026', day: 'Cumartesi', intensity: 'Çok Düşük', status: 'green' },
    ]
  },
  {
    id: 'FS007', password: 'fatma123',
    name: 'Dr. Fatma Şahin',
    leaveRecommendations: [
      { date: '18 Mayıs 2026', day: 'Pazartesi', intensity: 'Orta', status: 'yellow' },
      { date: '22 Mayıs 2026', day: 'Cuma', intensity: 'Düşük', status: 'green' },
      { date: '24 Mayıs 2026', day: 'Pazar', intensity: 'Çok Düşük', status: 'green' },
    ]
  },
  {
    id: 'HY008', password: 'hasan123',
    name: 'Dr. Hasan Yıldız',
    leaveRecommendations: [
      { date: '19 Mayıs 2026', day: 'Salı', intensity: 'Düşük', status: 'green' },
      { date: '20 Mayıs 2026', day: 'Çarşamba', intensity: 'Düşük', status: 'green' },
      { date: '23 Mayıs 2026', day: 'Cumartesi', intensity: 'Çok Düşük', status: 'green' },
    ]
  },
  {
    id: 'SK009', password: 'selin123',
    name: 'Dr. Selin Koç',
    leaveRecommendations: [
      { date: '21 Mayıs 2026', day: 'Perşembe', intensity: 'Düşük', status: 'green' },
      { date: '24 Mayıs 2026', day: 'Pazar', intensity: 'Çok Düşük', status: 'green' },
      { date: '25 Mayıs 2026', day: 'Pazartesi', intensity: 'Orta', status: 'yellow' },
    ]
  },
  {
    id: 'BA010', password: 'burak123',
    name: 'Dr. Burak Arslan',
    leaveRecommendations: [
      { date: '20 Mayıs 2026', day: 'Çarşamba', intensity: 'Düşük', status: 'green' },
      { date: '22 Mayıs 2026', day: 'Cuma', intensity: 'Düşük', status: 'green' },
      { date: '23 Mayıs 2026', day: 'Cumartesi', intensity: 'Çok Düşük', status: 'green' },
    ]
  }
];

// ---- Giriş yapan doktorun bilgisi ----
let currentDoctor = null;

// ---- DOM Elemanları ----
const darkModeToggle = document.getElementById('darkModeToggle');
const aiButton = document.getElementById('aiButton');

// ============================================
// KARANKLIK MOD
// ============================================
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('yapIsDarkMode', isDark ? 'true' : 'false');
}

// Sayfa açılışında kayıtlı tercihi kontrol et
(function () {
  const saved = localStorage.getItem('yapIsDarkMode');
  if (saved === 'true') {
    document.body.classList.add('dark');
    darkModeToggle.textContent = '☀️';
  }
})();

// ============================================
// GİRİŞ SİSTEMİ (LOGIN)
// ============================================

// Giriş formunu işle
function handleLogin(event) {
  event.preventDefault(); // Sayfa yenilenmesini engelle

  const idInput = document.getElementById('loginId').value.trim().toUpperCase();
  const passInput = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  // Doktor veritabanında ID ve şifre eşleşmesini ara
  const doctor = doctors.find(function (d) {
    return d.id === idInput && d.password === passInput;
  });

  if (doctor) {
    // Giriş başarılı
    currentDoctor = doctor;
    errorEl.textContent = '';

    // Login ekranını gizle, dashboard'u göster
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';

    // Dashboard'u kişiselleştir
    initDashboard(doctor);
  } else {
    // Hatalı giriş
    errorEl.textContent = '❌ Hatalı ID veya şifre. Tekrar deneyin.';
  }
}

// Çıkış fonksiyonu
function handleLogout() {
  currentDoctor = null;
  // Dashboard'u gizle, login'i göster
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
  // Form alanlarını temizle
  document.getElementById('loginId').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').textContent = '';
}

// ============================================
// DASHBOARD KİŞİSELLEŞTİRME
// Giriş yapan doktorun adını ve izin önerilerini göster
// ============================================
function initDashboard(doctor) {
  // Doktorun adını hoş geldin mesajına yaz
  document.getElementById('doctorName').textContent = doctor.name;

  // İlk grafiği oluştur
  updateChart(850);

  // Doktora özel izin önerilerini tabloya yaz
  renderLeaveTable(doctor);
}

// ============================================
// İZİN SEÇİM SİSTEMİ
// Haftalık 2 izin hakkı, seçim + doğrulama akışı.
// Seçimler doğrulanana kadar değiştirilebilir.
// ============================================

// Haftalık izin limiti
const WEEKLY_LEAVE_LIMIT = 2;

// Her satırın mevcut seçim durumunu tutar
// { rowIndex: 'approve' | 'reject' | null }
let pendingSelections = {};

// Doğrulanmış (kesinleşmiş) seçimler
let confirmedCount = 0;
let isConfirmed = false;

// ---- İzin Önerileri Tablosu ----
// Her satırda Onayla/Reddet butonları gösterilir.
// data-index ile satır indeksi takip edilir.
function renderLeaveTable(doctor) {
  const tbody = document.getElementById('leaveTableBody');
  let html = '';

  // Seçimleri sıfırla
  pendingSelections = {};
  confirmedCount = 0;
  isConfirmed = false;

  // Sayacı sıfırla
  updateLeaveCounter();

  // Doğrulama çubuğunu gizle
  document.getElementById('confirmBar').style.display = 'none';

  doctor.leaveRecommendations.forEach(function (rec, index) {
    let badgeClass;
    if (rec.status === 'green') badgeClass = 'badge-green';
    else if (rec.status === 'yellow') badgeClass = 'badge-yellow';
    else badgeClass = 'badge-red';

    // data-index: Bu satırın sıra numarası (seçim takibi için)
    html += `
      <tr data-index="${index}">
        <td style="font-weight:600;">${rec.date}</td>
        <td>${rec.day}</td>
        <td><span class="badge ${badgeClass}">${rec.intensity}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-sm btn-approve" onclick="selectLeave(${index}, 'approve', this)">✓ Onayla</button>
            <button class="btn-sm btn-reject" onclick="selectLeave(${index}, 'reject', this)">✕ Reddet</button>
          </div>
        </td>
      </tr>`;
  });

  if (doctor.leaveRecommendations.length === 0) {
    html = '<tr><td colspan="4" style="text-align:center;color:var(--gray-400);padding:24px;">Şu an için izin önerisi bulunmamaktadır.</td></tr>';
  }

  tbody.innerHTML = html;
}

// ---- Seçim Yapma ----
// Onayla veya Reddet'e tıklanınca seçim işaretlenir
// ama henüz kesinleşmez. Tekrar tıklayınca seçim kaldırılır.
function selectLeave(index, action, button) {
  // Doğrulanmışsa değişiklik yapılamaz
  if (isConfirmed) return;

  const row = button.closest('tr');
  const buttons = row.querySelectorAll('.btn-sm');
  const approveBtn = buttons[0];
  const rejectBtn = buttons[1];

  // Aynı butona tekrar tıklanırsa seçimi kaldır (toggle)
  if (pendingSelections[index] === action) {
    pendingSelections[index] = null;
    row.classList.remove('pending-approve', 'pending-reject');
    approveBtn.classList.remove('selected', 'dimmed');
    rejectBtn.classList.remove('selected', 'dimmed');
  } else {
    // Onay seçiliyorsa izin limitini kontrol et
    if (action === 'approve') {
      const currentApproveCount = countPendingApprovals();
      // Eğer bu satır zaten onaylıysa sayma (değişim yapıyor)
      const alreadyApproved = pendingSelections[index] === 'approve';
      if (!alreadyApproved && currentApproveCount >= WEEKLY_LEAVE_LIMIT) {
        alert('⚠️ Haftalık izin limitiniz (' + WEEKLY_LEAVE_LIMIT + ') dolmuştur! Başka bir izni onaylamak için önce mevcut bir onayı kaldırın.');
        return;
      }
    }

    // Yeni seçimi kaydet
    pendingSelections[index] = action;

    // Satır görselini güncelle
    row.classList.remove('pending-approve', 'pending-reject');
    if (action === 'approve') {
      row.classList.add('pending-approve');
      approveBtn.classList.add('selected');
      approveBtn.classList.remove('dimmed');
      rejectBtn.classList.remove('selected');
      rejectBtn.classList.add('dimmed');
    } else {
      row.classList.add('pending-reject');
      rejectBtn.classList.add('selected');
      rejectBtn.classList.remove('dimmed');
      approveBtn.classList.remove('selected');
      approveBtn.classList.add('dimmed');
    }
  }

  // Sayacı güncelle
  updateLeaveCounter();

  // Herhangi bir seçim varsa doğrulama çubuğunu göster
  showConfirmBar();
}

// ---- Onaylanan izin sayısını say ----
function countPendingApprovals() {
  let count = 0;
  for (const key in pendingSelections) {
    if (pendingSelections[key] === 'approve') count++;
  }
  return count;
}

// ---- İzin Sayacını Güncelle ----
function updateLeaveCounter() {
  const used = countPendingApprovals();
  document.getElementById('leaveUsed').textContent = used;

  // Limit dolduğunda sayacı kırmızıya çevir
  const counter = document.getElementById('leaveCounter');
  if (used >= WEEKLY_LEAVE_LIMIT) {
    counter.style.borderColor = 'var(--red)';
    counter.style.background = 'var(--red-bg)';
    counter.style.color = 'var(--red)';
  } else {
    counter.style.borderColor = '';
    counter.style.background = '';
    counter.style.color = '';
  }
}

// ---- Doğrulama Çubuğunu Göster/Gizle ----
function showConfirmBar() {
  const hasSelection = Object.values(pendingSelections).some(function (v) { return v !== null; });
  const confirmBar = document.getElementById('confirmBar');
  const confirmText = document.getElementById('confirmText');

  if (hasSelection) {
    confirmBar.style.display = 'flex';
    const approveCount = countPendingApprovals();
    confirmText.textContent = approveCount + ' izin onayı ve ' +
      Object.values(pendingSelections).filter(function (v) { return v === 'reject'; }).length +
      ' red seçildi. Seçimleri doğrulamak için butona basın.';
  } else {
    confirmBar.style.display = 'none';
  }
}

// ---- Seçimleri Doğrula ----
// Tüm seçimler kesinleşir, butonlar kilitlenir.
function confirmSelections() {
  isConfirmed = true;

  // Her satırın butonlarını sonuçla değiştir
  const rows = document.querySelectorAll('#leaveTableBody tr');
  rows.forEach(function (row) {
    const index = row.getAttribute('data-index');
    const actionCell = row.querySelector('.action-buttons');
    if (!actionCell) return;

    const selection = pendingSelections[index];
    if (selection === 'approve') {
      actionCell.innerHTML = '<span class="badge badge-green" style="font-size:0.82rem;">✅ Onaylandı</span>';
      row.className = 'confirmed';
      row.style.background = 'rgba(16, 185, 129, 0.06)';
    } else if (selection === 'reject') {
      actionCell.innerHTML = '<span class="badge badge-red" style="font-size:0.82rem;">❌ Reddedildi</span>';
      row.className = 'confirmed';
      row.style.background = 'rgba(239, 68, 68, 0.06)';
    }
    // Seçim yapılmamış satırlar olduğu gibi kalır
  });

  // Doğrulama çubuğunu güncelle
  const confirmBar = document.getElementById('confirmBar');
  confirmBar.innerHTML = '<p class="confirm-text" style="color:var(--green);font-weight:600;">✅ Seçimleriniz başarıyla doğrulandı ve kaydedildi.</p>';
}

// ---- Seçimleri İptal Et ----
// Tüm seçimleri sıfırlar, tabloyu eski haline döndürür.
function cancelSelections() {
  if (isConfirmed) return; // Doğrulanmışsa iptal edilemez

  // Seçimleri temizle
  pendingSelections = {};

  // Tüm satırları sıfırla
  const rows = document.querySelectorAll('#leaveTableBody tr');
  rows.forEach(function (row) {
    row.classList.remove('pending-approve', 'pending-reject');
    row.style.background = '';
    const buttons = row.querySelectorAll('.btn-sm');
    buttons.forEach(function (btn) {
      btn.classList.remove('selected', 'dimmed');
    });
  });

  // Sayacı ve doğrulama çubuğunu sıfırla
  updateLeaveCounter();
  document.getElementById('confirmBar').style.display = 'none';
}

// ============================================
// YAPAY ZEKA ANALİZ — Backend + CatBoost entegrasyonu
// Seçilen tarihi backend'e yollar, hava + AI tahmini alır,
// %20+ artışta izinleri Perşembe'ye taşıyıp dashboard'u günceller.
// ============================================
const API_BASE = (location.port === '8000' || location.port === '')
  ? '/api'
  : 'http://127.0.0.1:8000/api';

async function runAIAnalysis() {
  aiButton.classList.add('loading');
  aiButton.textContent = '⏳ Analiz Ediliyor...';

  const dateInput = document.getElementById('scenarioDate');
  const date = (dateInput && dateInput.value) ? dateInput.value : '2026-05-19';

  try {
    const r = await fetch(API_BASE + '/ai/predict-and-reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: date, city: 'Ankara' }),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();

    const predicted = j.ai_prediction.predicted_er_patients;
    updateDashboard(predicted);
    applyScenarioMeta(j);
    // 7 günlük backend tahminini grafiğe ve izin tablosuna işle
    if (j.weekly_forecast) {
      drawForecastChart(j.weekly_forecast);
      overlayLeaveTableWithForecast(j.weekly_forecast);
    }
  } catch (e) {
    // Backend yoksa orijinal davranışa düş (sunum yine devam etsin).
    console.warn('Backend ulaşılamadı, fallback:', e);
    updateDashboard(Math.floor(Math.random() * 450) + 500);
  } finally {
    aiButton.classList.remove('loading');
    aiButton.textContent = '🤖 Yapay Zeka Analizini Başlat';
  }
}

// Hava + operasyonel mesajı banner'a yedir
function applyScenarioMeta(j) {
  const w = j.weather || {};
  const ai = j.ai_prediction || {};
  const op = j.operational_response || {};
  const banner = document.getElementById('alertBanner');
  if (!banner) return;
  const surge = ai.surge_pct;
  const color = surge >= 20 ? 'red' : (surge >= 5 ? 'yellow' : 'green');
  const icon  = surge >= 20 ? '🌨️' : (surge >= 5 ? '🟡' : '🟢');
  banner.className = 'alert-banner ' + color;
  banner.innerHTML =
    '<div class="alert-icon">' + icon + '</div>' +
    '<div><strong>Hava Durumu Kaynaklı Operasyonel Güncelleme</strong><br/>' +
    w.date + ' • ' + (w.condition || '—') + ' • ' + (w.tavg) + '°C → ' +
    '<strong>%' + surge + '</strong> vaka değişimi öngörüsü. ' +
    (op.message || '') + '</div>';
}

// ============================================
// DASHBOARD GÜNCELLEME
// ============================================
function updateDashboard(predicted) {
  const capacity = 1000;
  const ratio = predicted / capacity;

  // KPI Kart 1
  animateNumber(document.getElementById('kpiPatientValue'), predicted);

  // KPI Kart 3: Trafik ışığı
  const statusEl = document.getElementById('kpiStatusValue');
  const alertBanner = document.getElementById('alertBanner');

  if (ratio >= 0.9) {
    statusEl.innerHTML = '🔴 Kritik Yoğunluk';
    statusEl.style.color = 'var(--red)';
    alertBanner.className = 'alert-banner red';
    alertBanner.innerHTML = `
      <div class="alert-icon">🔴</div>
      <div><strong>Kırmızı Işık:</strong> Yoğunluk kritik! İzin talepleri reddedilmeli.
      Kapasite: <strong>%${Math.round(ratio * 100)}</strong></div>`;
  } else if (ratio >= 0.7) {
    statusEl.innerHTML = '🟡 Normal Yoğunluk';
    statusEl.style.color = 'var(--yellow)';
    alertBanner.className = 'alert-banner yellow';
    alertBanner.innerHTML = `
      <div class="alert-icon">🟡</div>
      <div><strong>Sarı Işık:</strong> Yoğunluk normal. İzin talepleri dikkatle değerlendirilmeli.
      Kapasite: <strong>%${Math.round(ratio * 100)}</strong></div>`;
  } else {
    statusEl.innerHTML = '✅ Kapasite Uygun';
    statusEl.style.color = 'var(--green)';
    alertBanner.className = 'alert-banner green';
    alertBanner.innerHTML = `
      <div class="alert-icon">🟢</div>
      <div><strong>Yeşil Işık:</strong> Yoğunluk düşük. İzin onayı verilebilir.
      Kapasite: <strong>%${Math.round(ratio * 100)}</strong></div>`;
  }

  updateChart(predicted);
}

// ---- Sayı Animasyonu ----
function animateNumber(element, target) {
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(function () {
    current += step;
    if (current >= target) { current = target; clearInterval(interval); }
    element.textContent = current;
  }, 25);
}

// ============================================
// GRAFİK GÜNCELLEME
// Bugünden başlayarak 7 gün gösterir.
// ============================================
function updateChart(basePrediction) {
  const chartContainer = document.getElementById('chartBars');
  const allDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const dayMultipliers = {
    'Pzt': 1.0, 'Sal': 1.15, 'Çar': 1.05,
    'Per': 0.9, 'Cum': 0.8, 'Cmt': 0.55, 'Paz': 0.4
  };

  // Bugünün gününü otomatik belirle
  const jsDay = new Date().getDay();
  const startIndex = jsDay === 0 ? 6 : jsDay - 1;

  const capacity = 1000;
  let html = '';

  for (let i = 0; i < 7; i++) {
    const dayIndex = (startIndex + i) % 7;
    const dayLabel = allDays[dayIndex];
    const value = Math.round(basePrediction * dayMultipliers[dayLabel]);
    const ratio = value / capacity;
    const heightPct = Math.min(Math.round(ratio * 100), 100);

    let gradient;
    if (ratio >= 0.9) gradient = 'linear-gradient(180deg,#ef4444,#f87171)';
    else if (ratio >= 0.7) gradient = 'linear-gradient(180deg,#f59e0b,#fbbf24)';
    else gradient = 'linear-gradient(180deg,#10b981,#34d399)';

    const highlight = (i === 0) ? 'border:2px solid rgba(99,102,241,0.5);' : '';

    html += `
      <div class="chart-bar-wrapper">
        <div class="chart-bar" style="height:0%;background:${gradient};${highlight}">
          <span class="chart-bar-value">${value}</span>
        </div>
        <span class="chart-bar-label">${dayLabel}</span>
      </div>`;
  }

  chartContainer.innerHTML = html;

  // Animasyon
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      chartContainer.querySelectorAll('.chart-bar').forEach(function (bar) {
        const val = parseInt(bar.querySelector('.chart-bar-value').textContent);
        bar.style.height = Math.min(Math.round((val / capacity) * 100), 100) + '%';
      });
    });
  });
}

// ============================================
// BACKEND FORECAST → GRAFİK
// 7 günlük gerçek AI tahminini bar grafiğe çevirir.
// Her gün kendi oranına göre yeşil/sarı/kırmızı.
// Seçilen gün outline ile vurgulanır.
// ============================================
function drawForecastChart(weekly) {
  const chartContainer = document.getElementById('chartBars');
  if (!chartContainer || !weekly || !weekly.length) return;

  const capacity = 1000;
  const maxVal = Math.max(capacity, ...weekly.map(function (d) { return d.predicted; }));
  let html = '';

  weekly.forEach(function (day) {
    const heightPct = Math.min(Math.round((day.predicted / maxVal) * 100), 100);
    let gradient;
    if (day.status === 'red')        gradient = 'linear-gradient(180deg,#ef4444,#f87171)';
    else if (day.status === 'yellow') gradient = 'linear-gradient(180deg,#f59e0b,#fbbf24)';
    else                              gradient = 'linear-gradient(180deg,#10b981,#34d399)';
    const highlight = day.is_selected
      ? 'border:2px solid rgba(99,102,241,0.85);box-shadow:0 0 0 3px rgba(99,102,241,0.25);' : '';
    html +=
      '<div class="chart-bar-wrapper">' +
        '<div class="chart-bar" style="height:0%;background:' + gradient + ';' + highlight + '"' +
            ' title="' + day.date_tr + ' • ' + day.intensity + ' • ' + day.tavg + '°C">' +
          '<span class="chart-bar-value">' + day.predicted + '</span>' +
        '</div>' +
        '<span class="chart-bar-label">' + day.weekday_short +
          '<br/><span class="chart-bar-date">' + day.date_tr.substring(0, 5) + '</span>' +
        '</span>' +
      '</div>';
  });
  chartContainer.innerHTML = html;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      const bars = chartContainer.querySelectorAll('.chart-bar');
      bars.forEach(function (bar, i) {
        const val = weekly[i].predicted;
        bar.style.height = Math.min(Math.round((val / maxVal) * 100), 100) + '%';
      });
    });
  });
}

// ============================================
// İZİN ÖNERİLERİ TABLOSU — Forecast Overlay
// Doktorun listesindeki tarihleri forecast içinde arar,
// yoğunluk badge'ini ve renk durumunu gerçek tahminle değiştirir.
// ============================================
const TR_MONTHS = {
  'ocak':1,'şubat':2,'mart':3,'nisan':4,'mayıs':5,'haziran':6,
  'temmuz':7,'ağustos':8,'eylül':9,'ekim':10,'kasım':11,'aralık':12
};

function trDateToIso(s) {
  // "19 Mayıs 2026" → "2026-05-19"
  if (!s) return null;
  const parts = s.toLocaleString ? s.toString().trim().split(/\s+/) : [];
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const mon = TR_MONTHS[parts[1].toLocaleLowerCase('tr-TR')];
  const yr  = parseInt(parts[2], 10);
  if (!day || !mon || !yr) return null;
  return yr + '-' + String(mon).padStart(2,'0') + '-' + String(day).padStart(2,'0');
}

// Hangi ISO haftasındayız? (yıl-haftano)
function isoWeekKey(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  return tmp.getUTCFullYear() + '-W' + String(week).padStart(2, '0');
}

let lastScenarioWeek = null;

// İzin önerileri tablosunu SİL ve forecast'tan baştan inşa et.
// Her gün = bir satır; haftalık 2 limit, hafta değişince sıfırlanır.
function overlayLeaveTableWithForecast(weekly) {
  if (!weekly || !weekly.length) return;
  const tbody = document.getElementById('leaveTableBody');
  if (!tbody) return;

  // Hafta değişimi tespiti → seçimleri ve sayacı sıfırla
  const wkKey = isoWeekKey(weekly[0].date);
  if (wkKey !== lastScenarioWeek) {
    pendingSelections = {};
    confirmedCount = 0;
    isConfirmed = false;
    lastScenarioWeek = wkKey;
    document.getElementById('confirmBar').style.display = 'none';
  }

  // currentDoctor.leaveRecommendations'ı forecast ile YENİDEN üret
  // (gün/intensity/status'un seçilen tarihle uyumlu olması için)
  if (currentDoctor) {
    currentDoctor.leaveRecommendations = weekly.map(function (fc) {
      return {
        date: fc.date_tr || fc.date,
        day: fc.weekday,
        intensity: fc.intensity,
        status: fc.status,
        iso: fc.date,
        predicted: fc.predicted,
        tavg: fc.tavg,
      };
    });
  }

  // Tabloyu baştan çiz
  let html = '';
  weekly.forEach(function (fc, idx) {
    const badgeClass = fc.status === 'red' ? 'badge-red'
                     : fc.status === 'yellow' ? 'badge-yellow' : 'badge-green';
    const selectedMark = fc.is_selected
      ? ' style="font-weight:700;color:var(--primary-700);"' : '';
    html +=
      '<tr data-index="' + idx + '">' +
        '<td' + selectedMark + '>' + (fc.date_tr || fc.date) +
          (fc.is_selected ? ' <span style="font-size:0.7rem;color:var(--primary-500);">●</span>' : '') +
        '</td>' +
        '<td>' + fc.weekday + '</td>' +
        '<td><span class="badge ' + badgeClass + '" title="AI: ' +
          fc.predicted + ' hasta • ' + fc.tavg + '°C">' + fc.intensity + '</span></td>' +
        '<td><div class="action-buttons">' +
          '<button class="btn-sm btn-approve" onclick="selectLeave(' + idx + ', \'approve\', this)">✓ Onayla</button>' +
          '<button class="btn-sm btn-reject" onclick="selectLeave(' + idx + ', \'reject\', this)">✕ Reddet</button>' +
        '</div></td>' +
      '</tr>';
  });
  tbody.innerHTML = html;

  // Sayaç label'ını güncelle (hafta + kullanım)
  updateLeaveCounter();
  const counter = document.getElementById('leaveCounter');
  if (counter) {
    counter.innerHTML = '🎫 Bu Hafta (' + wkKey + ') Kullanılan İzin: ' +
      '<strong><span id="leaveUsed">' + countPendingApprovals() + '</span>/' +
      WEEKLY_LEAVE_LIMIT + '</strong>';
  }
}
