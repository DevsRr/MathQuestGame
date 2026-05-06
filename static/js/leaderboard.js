// ═══════════════════════════════════════════
//  leaderboard.js — Leaderboard page logic
// ═══════════════════════════════════════════

let currentTab = 'alltime';

// Apply dark mode
const prefs = JSON.parse(localStorage.getItem('mathquest_prefs') || '{}');
if (prefs.darkMode) document.body.classList.add('dark');

// Rank medals for positions 4+
function rankLabel(i) {
  if (i === 0) return ''; // handled by CSS rank-1
  if (i === 1) return '';
  if (i === 2) return '';
  return `#${i + 1}`;
}

function renderLeaderboard(entries) {
  const list = document.getElementById('leaderboardList');
  if (!entries || entries.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-light)">
        <div style="font-size:3rem">🏜️</div>
        <p style="font-weight:700;margin-top:8px">No scores yet — be the first champion!</p>
      </div>`;
    return;
  }

  list.innerHTML = entries.map((e, i) => {
    const rankClass = i < 3 ? `rank-${i+1}` : '';
    const avatar = e.avatar || '🦁';
    const name = e.name || 'Anonymous';
    const score = e.score || 0;
    const accuracy = e.accuracy != null ? e.accuracy + '%' : '—';
    const mode = e.mode || 'addition';
    const diff = e.difficulty || 'easy';
    const modeIcon = { addition:'➕', subtraction:'➖', multiplication:'✖️', division:'➗', mixed:'🌪️', daily:'📅' }[mode] || '❓';

    return `
      <div class="lb-entry ${rankClass}" style="animation-delay:${i*0.05}s">
        <div class="lb-rank">${rankLabel(i)}</div>
        <div class="lb-avatar">${avatar}</div>
        <div class="lb-info">
          <div class="lb-name">${escapeHtml(name)}</div>
          <div class="lb-meta">${modeIcon} ${capitalize(mode)} · ${capitalize(diff)} · ✅ ${accuracy}</div>
        </div>
        <div class="lb-score">⭐ ${score}</div>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

async function loadLeaderboard(tab) {
  document.getElementById('leaderboardList').innerHTML =
    '<div class="loading-spinner">⏳ Loading champions...</div>';

  let entries = [];

  try {
    if (tab === 'alltime') {
      entries = await getTopScores(10);
    } else {
      entries = await getTodayScores(10);
    }
  } catch(e) {
    // Fallback to Flask backend
    try {
      const res = await fetch('/get-leaderboard');
      const data = await res.json();
      entries = data.leaderboard || [];
    } catch(e2) {
      entries = [];
    }
  }

  renderLeaderboard(entries);
}

function switchTab(tab, btn) {
  currentTab = tab;
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  loadLeaderboard(tab);
}

// Load on page ready — wait for Firebase
let attempts = 0;
const waitForFirebase = setInterval(() => {
  attempts++;
  if (window.firebaseReady || attempts > 15) {
    clearInterval(waitForFirebase);
    loadLeaderboard('alltime');
  }
}, 300);
