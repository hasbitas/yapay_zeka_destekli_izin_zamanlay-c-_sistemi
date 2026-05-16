/* YAP-İS Dashboard — Predictive Healthcare integration */

const API_BASE = (location.port === '8000' || location.port === '')
  ? '/api'                              // backend statik olarak serve ediyor
  : 'http://127.0.0.1:8000/api';        // ayrı vite/live-server senaryosu

const SCENARIO_DATE = '2026-05-19';     // Salı

// --- demo kullanıcılar ---
const users = [
  { id:'AY001', password:'ayse123',  name:'Dr. Ayşe Yılmaz' },
  { id:'MK002', password:'mehmet123',name:'Dr. Mehmet Demir' },
  { id:'BAŞHEKİM', password:'admin', name:'Başhekim (Yönetim)' },
];

let currentUser = null;

function handleLogin(e){
  e.preventDefault();
  const id = document.getElementById('loginId').value.trim().toUpperCase();
  const pw = document.getElementById('loginPassword').value;
  const u = users.find(x => x.id === id && x.password === pw);
  if (!u){ document.getElementById('loginError').textContent = '❌ Hatalı ID veya şifre.'; return; }
  currentUser = u;
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  document.getElementById('doctorName').textContent = u.name;
  document.getElementById('dateBadge').textContent = '📅 ' + new Date().toLocaleDateString('tr-TR');
  loadInitial();
}

function handleLogout(){
  currentUser = null;
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
}

function toggleDarkMode(){ document.body.classList.toggle('dark'); }

async function loadInitial(){
  drawChart([320,345,330,310,300,210,190]);   // baseline
  try {
    const r = await fetch(`${API_BASE}/schedule/`);
    const j = await r.json();
    renderSchedule(j.data || []);
  } catch { renderSchedule([]); }
}

function renderSchedule(rows){
  document.getElementById('scheduleBadge').textContent = `${rows.length} kayıt`;
  const tb = document.getElementById('scheduleTableBody');
  tb.innerHTML = rows.map(r => {
    const isResched = r.status === 'rescheduled';
    const badge = isResched
      ? `<span class="badge badge-red">🔄 ${r.original_date} → ${r.start_date}</span>`
      : `<span class="badge badge-blue">${r.shift || r.reason || '—'}</span>`;
    return `
      <tr class="${isResched ? 'row-rescheduled' : ''}">
        <td><strong>${r.personnel_name || '—'}</strong></td>
        <td>${r.date || r.start_date}</td>
        <td>${r.department || r.reason || '—'}</td>
        <td>${badge}</td>
      </tr>`;
  }).join('');
}

// === ANA SENARYO ===
async function runPredictiveScenario(){
  const btn = document.getElementById('aiButton');
  btn.disabled = true; btn.textContent = '⏳ AI analizi çalışıyor...';
  try {
    const r = await fetch(`${API_BASE}/ai/predict-and-reschedule`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ date: SCENARIO_DATE, city: 'Ankara' }),
    });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    applyScenario(j);
  } catch (e) {
    alert('Senaryo başarısız: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = '🤖 Predictive Scenario Çalıştır (Salı -5°C)';
  }
}

function applyScenario(r){
  const w = r.weather, ai = r.ai_prediction, op = r.operational_response;

  // KPI'lar
  document.getElementById('kpiPatientValue').textContent = ai.predicted_er_patients;
  document.getElementById('kpiPatientSub').textContent =
    `Baseline ${ai.baseline} → %${ai.surge_pct} ${ai.surge_pct >= 0 ? 'artış' : 'düşüş'} (${ai.model})`;

  document.getElementById('kpiWeatherValue').textContent = `${w.tavg}°C`;
  document.getElementById('kpiWeatherSub').textContent =
    `${w.condition} • ${w.city} • ${w.date}`;

  const statusEl = document.getElementById('kpiStatusValue');
  if (op.action === 'leaves_rescheduled'){
    statusEl.innerHTML = '🚨 ' + op.moved_leaves.length + ' İzin Kaydırıldı';
    statusEl.style.color = 'var(--red)';
  } else {
    statusEl.innerHTML = '✅ Müdahale Gerekmedi';
    statusEl.style.color = 'var(--green)';
  }
  document.getElementById('kpiStatusSub').textContent = op.message;

  // Hava banner
  const ab = document.getElementById('weatherAlert');
  ab.style.display = 'flex';
  document.getElementById('weatherAlertBody').innerHTML = `
    <div><strong>Hava Durumu Kaynaklı Operasyonel Güncelleme</strong><br/>
    ${ai.surge_pct >= 20 ? '🔴' : '🟢'} <strong>%${ai.surge_pct}</strong> vaka artışı öngörüsü
    (${w.condition}, ${w.tavg}°C). Riskler: <em>${(ai.top_risks||[]).join(' • ')}</em><br/>
    ${op.message}</div>`;
  ab.className = 'alert-banner ' + (ai.surge_pct >= 20 ? 'red' : 'green');

  // Grafik tahmini günü zirvede göster
  drawChart([320, ai.predicted_er_patients, 360, 280, 270, 210, 190], 1);

  // Çizelgeyi güncelle (taşınan izinler kırmızı highlight ile)
  renderSchedule(r.updated_leaves || []);
}

function drawChart(values, highlightIdx = -1){
  const labels = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  const cap = Math.max(...values, 1000);
  document.getElementById('chartBars').innerHTML = values.map((v,i) => {
    const h = Math.min(Math.round(v/cap*100), 100);
    const ratio = v/1000;
    const grad = ratio >= .9 ? 'linear-gradient(180deg,#ef4444,#f87171)'
              : ratio >= .7 ? 'linear-gradient(180deg,#f59e0b,#fbbf24)'
              :               'linear-gradient(180deg,#10b981,#34d399)';
    const hl = i === highlightIdx ? 'outline:3px solid #6366f1;' : '';
    return `<div class="chart-bar-wrapper">
      <div class="chart-bar" style="height:${h}%;background:${grad};${hl}">
        <span class="chart-bar-value">${v}</span>
      </div>
      <span class="chart-bar-label">${labels[i]}</span></div>`;
  }).join('');
}
