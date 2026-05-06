// ═══════════════════════════════════════════
//  game.js — Full game engine
// ═══════════════════════════════════════════

// ── State ─────────────────────────────────
const G = {
  player: { name: 'Player', avatar: '🦁' },
  score: 0,
  lives: 3,
  level: 1,
  questionIndex: 0,
  totalQuestions: 10,
  correctCount: 0,
  mode: 'addition',
  difficulty: 'easy',
  timerValue: 10,
  timerInterval: null,
  timerCircumference: 213.6,
  currentAnswer: null,
  usedQuestions: new Set(),
  answered: false,
  badges: [],
  questionsPerLevel: 10,
  isDaily: false
};

const DIFFICULTY = {
  easy:   { min: 1,  max: 10,  time: 15, label: 'Easy' },
  medium: { min: 1,  max: 50,  time: 10, label: 'Medium' },
  hard:   { min: 1,  max: 100, time: 7,  label: 'Hard' }
};

const MODE_ICONS = {
  addition: '➕', subtraction: '➖',
  multiplication: '✖️', division: '➗', mixed: '🌪️', daily: '📅'
};

const VOICE_CORRECT = [
  "Great job!", "Amazing!", "You're on fire!", "Brilliant!",
  "Superstar!", "Keep it up!", "Wow, fantastic!", "Genius!"
];
const VOICE_WRONG = [
  "Try again!", "Almost there!", "You've got this!", "Don't give up!"
];

// ── Init ──────────────────────────────────
(function init() {
  // Restore player info
  const p = JSON.parse(localStorage.getItem('mathquest_player') || '{}');
  G.player.name = p.name || 'Player';
  G.player.avatar = p.avatar || '🦁';
  document.getElementById('playerAvatar').textContent = G.player.avatar;
  document.getElementById('playerNameDisplay').textContent = G.player.name;

  // Restore prefs
  const prefs = JSON.parse(localStorage.getItem('mathquest_prefs') || '{}');
  if (prefs.darkMode) document.body.classList.add('dark');
  if (prefs.musicOff) AudioManager.setMusicEnabled(false);
  if (prefs.sfxOff) AudioManager.setSFXEnabled(false);

  showScreen('modeScreen');

  // Load daily seed
  const today = new Date().toDateString();
  G.dailySeed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // Start music on click
  document.addEventListener('click', () => AudioManager.startBgMusic(), { once: true });
})();

// ── Screen management ──────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Mode & difficulty selection ────────────
function selectMode(mode) {
  G.mode = mode;
  G.isDaily = mode === 'daily';
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[data-mode="${mode}"]`)?.classList.add('selected');
  AudioManager.click();
  setTimeout(startCountdown, 300);
}

function selectDifficulty(diff) {
  G.difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-diff="${diff}"]`)?.classList.add('active');
  AudioManager.click();
}

// ── Countdown ─────────────────────────────
function startCountdown() {
  showScreen('countdownScreen');
  let count = 3;
  const numEl = document.getElementById('countdownNumber');
  numEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      numEl.textContent = count;
      AudioManager.countdown();
    } else if (count === 0) {
      numEl.textContent = '🚀 GO!';
      AudioManager.countdownGo();
    } else {
      clearInterval(interval);
      startGame();
    }
  }, 900);
}

// ── Game start ─────────────────────────────
function startGame() {
  G.score = 0;
  G.lives = 3;
  G.level = 1;
  G.questionIndex = 0;
  G.correctCount = 0;
  G.usedQuestions = new Set();
  G.badges = [];

  updateHUD();
  showScreen('questionScreen');
  nextQuestion();
}

// ── Question generator ─────────────────────
function getRange() {
  const d = DIFFICULTY[G.difficulty];
  if (G.isDaily) {
    // Daily challenge uses seed-based pseudo-difficulty
    const seed = G.dailySeed;
    const base = 5 + (seed % 15);
    return { min: 1, max: base, time: 10 };
  }
  // Scale range with level
  const scale = 1 + (G.level - 1) * 0.5;
  return {
    min: d.min,
    max: Math.round(d.max * scale),
    time: Math.max(5, d.time - Math.floor((G.level - 1) / 2))
  };
}

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getActualMode() {
  if (G.mode === 'mixed') {
    const modes = ['addition', 'subtraction', 'multiplication', 'division'];
    return modes[Math.floor(Math.random() * modes.length)];
  }
  if (G.isDaily) {
    const modes = ['addition', 'subtraction', 'multiplication'];
    const idx = (G.dailySeed + G.questionIndex) % modes.length;
    return modes[idx];
  }
  return G.mode;
}

function generateQuestion() {
  const { min, max } = getRange();
  const mode = getActualMode();
  let a, b, answer, questionStr;

  let attempts = 0;
  do {
    attempts++;
    switch (mode) {
      case 'addition':
        a = rnd(min, max); b = rnd(min, max);
        answer = a + b;
        questionStr = `${a} + ${b}`;
        break;
      case 'subtraction':
        a = rnd(min, max); b = rnd(min, a); // ensure non-negative
        answer = a - b;
        questionStr = `${a} − ${b}`;
        break;
      case 'multiplication':
        a = rnd(1, Math.min(12, max)); b = rnd(1, Math.min(12, max));
        answer = a * b;
        questionStr = `${a} × ${b}`;
        break;
      case 'division':
        b = rnd(1, Math.min(12, max));
        answer = rnd(1, Math.min(12, Math.floor(max / b)));
        a = b * answer;
        questionStr = `${a} ÷ ${b}`;
        break;
    }
  } while (G.usedQuestions.has(questionStr) && attempts < 30);

  G.usedQuestions.add(questionStr);
  return { questionStr: `${questionStr} = ?`, answer, mode };
}

function generateChoices(correct, mode) {
  const choices = new Set([correct]);
  const spread = correct > 10 ? Math.ceil(correct * 0.3) : 5;

  while (choices.size < 4) {
    let wrong;
    const r = Math.random();
    if (r < 0.4) wrong = correct + rnd(1, spread) * (Math.random() < 0.5 ? 1 : -1);
    else if (r < 0.7) wrong = correct + rnd(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    else wrong = rnd(Math.max(0, correct - spread), correct + spread);

    if (wrong > 0 && wrong !== correct) choices.add(wrong);
  }

  return shuffleArray([...choices]);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Question display ───────────────────────
function nextQuestion() {
  if (G.questionIndex >= G.totalQuestions) {
    endGame();
    return;
  }

  G.answered = false;
  const { time } = getRange();
  G.timerValue = time;

  // Update progress
  const pct = ((G.questionIndex) / G.totalQuestions) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressText').textContent =
    `${G.questionIndex + 1} / ${G.totalQuestions}`;

  const diffLabel = DIFFICULTY[G.difficulty]?.label || 'Easy';
  document.getElementById('levelBadge').textContent =
    `Level ${G.level} — ${diffLabel}`;

  // Generate question
  const q = generateQuestion();
  G.currentAnswer = q.answer;
  G.currentMode = q.mode;

  // Animate question card
  const card = document.getElementById('questionCard');
  card.classList.remove('bounce');
  void card.offsetWidth;
  card.classList.add('bounce');

  document.getElementById('questionText').textContent = q.questionStr;
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';

  // Build choices
  const choices = generateChoices(q.answer, q.mode);
  const grid = document.getElementById('choicesGrid');
  grid.innerHTML = '';

  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.onclick = () => answer(btn, choice);
    grid.appendChild(btn);
  });

  startTimer(time);
  G.questionIndex++;
}

// ── Timer ──────────────────────────────────
function startTimer(seconds) {
  clearInterval(G.timerInterval);
  G.timerValue = seconds;
  updateTimerUI(seconds, seconds);

  G.timerInterval = setInterval(() => {
    G.timerValue--;
    updateTimerUI(G.timerValue, seconds);

    if (G.timerValue <= 3) AudioManager.timerWarning();
    if (G.timerValue <= 0) {
      clearInterval(G.timerInterval);
      if (!G.answered) timeOut();
    }
  }, 1000);
}

function updateTimerUI(current, max) {
  const circle = document.getElementById('timerCircle');
  const numEl = document.getElementById('timerNumber');
  const pct = current / max;
  const offset = G.timerCircumference * (1 - pct);
  circle.style.strokeDashoffset = offset;

  // Color: green → yellow → red
  if (pct > 0.5) circle.style.stroke = '#10b981';
  else if (pct > 0.25) circle.style.stroke = '#fbbf24';
  else circle.style.stroke = '#ef4444';

  numEl.textContent = current;
}

// ── Answer handling ────────────────────────
function answer(btn, selected) {
  if (G.answered) return;
  G.answered = true;
  clearInterval(G.timerInterval);

  // Disable all buttons
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

  if (selected === G.currentAnswer) {
    handleCorrect(btn);
  } else {
    handleWrong(btn);
  }
}

function handleCorrect(btn) {
  G.correctCount++;
  const timeBonus = G.timerValue * 2;
  const basePoints = G.difficulty === 'easy' ? 10 : G.difficulty === 'medium' ? 20 : 30;
  const points = basePoints + timeBonus;
  G.score += points;

  btn.classList.add('correct');

  // Feedback
  const fb = document.getElementById('feedback');
  fb.textContent = `✅ +${points} points!`;
  fb.className = 'feedback correct';

  updateHUD();
  AudioManager.correct();

  // Voice feedback
  if (Math.random() < 0.4) {
    AudioManager.speak(VOICE_CORRECT[Math.floor(Math.random() * VOICE_CORRECT.length)]);
  }

  // Stars animation
  spawnStars(btn);

  // Level up check
  if (G.questionIndex % G.questionsPerLevel === 0 && G.questionIndex > 0) {
    G.level++;
    AudioManager.levelUp();
  }

  setTimeout(nextQuestion, 1200);
}

function handleWrong(btn) {
  G.lives--;
  btn.classList.add('wrong');

  // Show correct answer
  document.querySelectorAll('.choice-btn').forEach(b => {
    if (parseInt(b.textContent) === G.currentAnswer) b.classList.add('correct');
  });

  const fb = document.getElementById('feedback');
  fb.textContent = `❌ Answer: ${G.currentAnswer}`;
  fb.className = 'feedback wrong';

  updateHUD();
  AudioManager.wrong();

  if (Math.random() < 0.3) {
    AudioManager.speak(VOICE_WRONG[Math.floor(Math.random() * VOICE_WRONG.length)]);
  }

  if (G.lives <= 0) {
    setTimeout(endGame, 1200);
  } else {
    setTimeout(nextQuestion, 1500);
  }
}

function timeOut() {
  if (G.answered) return;
  G.answered = true;
  G.lives--;

  // Show correct answer
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (parseInt(b.textContent) === G.currentAnswer) b.classList.add('correct');
  });

  const fb = document.getElementById('feedback');
  fb.textContent = `⏰ Time's up! Answer: ${G.currentAnswer}`;
  fb.className = 'feedback wrong';

  AudioManager.wrong();
  updateHUD();

  if (G.lives <= 0) {
    setTimeout(endGame, 1200);
  } else {
    setTimeout(nextQuestion, 1500);
  }
}

// ── HUD updates ────────────────────────────
function updateHUD() {
  document.getElementById('scoreDisplay').textContent = G.score;
  const hearts = '❤️'.repeat(Math.max(0, G.lives)) + '🖤'.repeat(Math.max(0, 3 - G.lives));
  document.getElementById('livesDisplay').textContent = hearts;
}

// ── End game ───────────────────────────────
function endGame() {
  clearInterval(G.timerInterval);
  AudioManager.stopBgMusic();

  const accuracy = G.questionIndex > 1
    ? Math.round((G.correctCount / (G.questionIndex - 1)) * 100)
    : 0;

  // Determine title & trophy
  let title, trophy;
  if (accuracy >= 90) { title = '🌟 LEGENDARY!'; trophy = '🏆'; }
  else if (accuracy >= 70) { title = '⭐ Awesome!'; trophy = '🎖️'; }
  else if (accuracy >= 50) { title = '👍 Good Try!'; trophy = '🎗️'; }
  else { title = '💪 Keep Practicing!'; trophy = '📚'; }

  document.getElementById('resultsTrophy').textContent = trophy;
  document.getElementById('resultsTitle').textContent = title;
  document.getElementById('finalScore').textContent = G.score;
  document.getElementById('finalAccuracy').textContent = accuracy + '%';
  document.getElementById('finalLevel').textContent = G.level;

  // Badges
  const badges = computeBadges(accuracy);
  G.badges = badges;
  const badgeEl = document.getElementById('badgesEarned');
  badgeEl.innerHTML = badges.map(b =>
    `<div class="badge" style="animation-delay:${b.delay}s">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-name">${b.name}</span>
    </div>`
  ).join('');

  showScreen('resultsScreen');

  if (accuracy >= 70) {
    launchConfetti();
    AudioManager.levelUp();
  } else {
    AudioManager.gameOver();
  }

  // Save to Firebase + Flask backend
  const data = {
    name: G.player.name,
    avatar: G.player.avatar,
    score: G.score,
    accuracy,
    level: G.level,
    mode: G.mode,
    difficulty: G.difficulty
  };

  // Firebase
  if (typeof saveScore !== 'undefined') saveScore(data);
  if (typeof savePlayerProgress !== 'undefined') {
    savePlayerProgress(G.player.name, G.player.avatar, {
      highScore: G.score, lastAccuracy: accuracy
    });
  }

  // Flask backend backup
  fetch('/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {});
}

// ── Badges ────────────────────────────────
function computeBadges(accuracy) {
  const badges = [];
  if (accuracy === 100) badges.push({ icon: '💎', name: 'Perfect!', delay: 0.1 });
  if (accuracy >= 80) badges.push({ icon: '🌟', name: 'Star Player', delay: 0.2 });
  if (G.score >= 300) badges.push({ icon: '🔥', name: 'On Fire!', delay: 0.3 });
  if (G.level >= 3) badges.push({ icon: '🚀', name: 'Level Master', delay: 0.4 });
  if (G.lives === 3) badges.push({ icon: '🛡️', name: 'No Mistakes!', delay: 0.5 });
  if (G.mode === 'multiplication') badges.push({ icon: '✖️', name: 'Times Champ', delay: 0.6 });
  if (G.mode === 'division') badges.push({ icon: '➗', name: 'Division Pro', delay: 0.6 });
  if (G.isDaily) badges.push({ icon: '📅', name: 'Daily Hero', delay: 0.6 });
  return badges;
}

// ── Confetti ──────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#7c3aed','#ec4899','#f97316','#fbbf24','#10b981','#3b82f6','#14b8a6'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 10}px;
      height: ${6 + Math.random() * 10}px;
      border-radius: ${Math.random() < 0.5 ? '50%' : '2px'};
      animation-duration: ${2 + Math.random() * 3}s;
      animation-delay: ${Math.random() * 1.5}s;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ── Star burst on correct ─────────────────
function spawnStars(btn) {
  const rect = btn.getBoundingClientRect();
  const stars = ['⭐','🌟','✨','💫'];
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('div');
    star.className = 'star-burst';
    star.textContent = stars[Math.floor(Math.random() * stars.length)];
    star.style.cssText = `
      left: ${rect.left + rect.width/2 + (Math.random()-0.5)*60}px;
      top: ${rect.top + rect.height/2 + (Math.random()-0.5)*40}px;
      animation-delay: ${i * 0.1}s;
    `;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1000);
  }
}

// ── Navigation ─────────────────────────────
function playAgain() {
  AudioManager.click();
  showScreen('modeScreen');
}

function goHome() {
  AudioManager.click();
  window.location.href = '/';
}
