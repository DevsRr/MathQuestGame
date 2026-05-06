// ═══════════════════════════════════════════
//  home.js — Home screen logic
// ═══════════════════════════════════════════

// Load saved prefs
(function init() {
  const prefs = JSON.parse(localStorage.getItem('mathquest_prefs') || '{}');
  if (prefs.darkMode) {
    document.body.classList.add('dark');
    document.getElementById('themeToggle').textContent = '☀️ Light Mode';
  }
  if (prefs.musicOff) {
    AudioManager.setMusicEnabled(false);
    document.getElementById('musicStatus').textContent = 'OFF';
  }
  if (prefs.sfxOff) {
    AudioManager.setSFXEnabled(false);
    document.getElementById('sfxStatus').textContent = 'OFF';
  }

  // Restore saved name/avatar
  const player = JSON.parse(localStorage.getItem('mathquest_player') || '{}');
  if (player.name) document.getElementById('playerName').value = player.name;
  if (player.avatar) {
    document.querySelectorAll('.avatar-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.avatar === player.avatar);
    });
  }
})();

let selectedAvatar = '🦁';

function selectAvatar(btn) {
  document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedAvatar = btn.dataset.avatar;
  AudioManager.click();
}

function startAdventure() {
  const name = document.getElementById('playerName').value.trim();
  if (!name) {
    document.getElementById('playerName').style.borderColor = '#ef4444';
    document.getElementById('playerName').focus();
    AudioManager.wrong();
    return;
  }

  // Save player info
  localStorage.setItem('mathquest_player', JSON.stringify({
    name,
    avatar: selectedAvatar
  }));

  AudioManager.click();
  AudioManager.stopBgMusic();

  // Navigate to game
  window.location.href = '/play';
}

function toggleMusic() {
  const on = AudioManager.toggleMusic();
  document.getElementById('musicStatus').textContent = on ? 'ON' : 'OFF';
  const prefs = JSON.parse(localStorage.getItem('mathquest_prefs') || '{}');
  prefs.musicOff = !on;
  localStorage.setItem('mathquest_prefs', JSON.stringify(prefs));
}

function toggleSFX() {
  const on = AudioManager.toggleSFX();
  document.getElementById('sfxStatus').textContent = on ? 'ON' : 'OFF';
  const prefs = JSON.parse(localStorage.getItem('mathquest_prefs') || '{}');
  prefs.sfxOff = !on;
  localStorage.setItem('mathquest_prefs', JSON.stringify(prefs));
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  document.getElementById('themeToggle').textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  const prefs = JSON.parse(localStorage.getItem('mathquest_prefs') || '{}');
  prefs.darkMode = isDark;
  localStorage.setItem('mathquest_prefs', JSON.stringify(prefs));
  AudioManager.click();
}

// Start bg music on first user interaction
document.addEventListener('click', () => {
  AudioManager.startBgMusic();
}, { once: true });

// Enter key submits
document.getElementById('playerName').addEventListener('keydown', e => {
  if (e.key === 'Enter') startAdventure();
  else document.getElementById('playerName').style.borderColor = '';
});
