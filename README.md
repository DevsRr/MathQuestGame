# 🚀 MathQuest — Fun Math Game for Kids

A colorful, interactive math learning game for kids ages 5–12.
Built with HTML/CSS/JS frontend + Python Flask backend + Firebase Firestore.

---

## 📁 Project Structure

```
/game
  /templates
    index.html         ← Home / login screen
    game.html          ← Game play screen
    leaderboard.html   ← Hall of fame
  /static
    /css
      style.css        ← Full cartoon-style CSS
    /js
      firebase-init.js ← Firebase SDK + helpers
      audio.js         ← Web Audio API sound engine
      home.js          ← Home screen logic
      game.js          ← Full game engine
      leaderboard.js   ← Leaderboard page logic
  app.py               ← Flask backend
  firebase_config.py   ← Firebase setup reference
  requirements.txt
  README.md
```

---

## ⚡ Quick Start

### 1. Install Python dependencies
```bash
cd game
pip install -r requirements.txt
```

### 2. Run the Flask server
```bash
python app.py
```

Open your browser to: **http://localhost:5000**

> The game works fully WITHOUT Firebase (scores save to Flask memory).
> To enable persistent scores and leaderboard, follow the Firebase steps below.

---

## 🔥 Firebase Setup (Optional but Recommended)

### Step 1 — Create a Firebase project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `MathQuestGame`
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Firestore
1. In left sidebar → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location → **Enable**

### Step 3 — Enable Anonymous Authentication
1. Left sidebar → **Authentication** → **Get started**
2. **Sign-in method** tab → **Anonymous** → Enable → **Save**

### Step 4 — Get your config
1. Left sidebar → **Project Settings** (gear icon)
2. Scroll to **Your apps** → click **</>** (Web)
3. Register app with name `MathQuest Web`
4. Copy the `firebaseConfig` object

### Step 5 — Add config to the game
Open `static/js/firebase-init.js` and replace the placeholder:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← paste your values here
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 6 — Add Firestore indexes (for Today's leaderboard)
In Firebase Console → **Firestore** → **Indexes** → Add composite index:
- Collection: `scores`
- Fields: `timestamp` (Ascending), `score` (Descending)

---

## 🎮 Game Features

### Math Modes
| Mode | Description |
|------|-------------|
| ➕ Addition | Add two numbers |
| ➖ Subtraction | Subtract (always positive result) |
| ✖️ Multiplication | Times tables up to 12 |
| ➗ Division | Clean integer division |
| 🌪️ Mixed Madness | Random mode each question |
| 📅 Daily Challenge | Seed-based daily puzzle |

### Difficulty Scaling
| Level | Number Range | Timer |
|-------|-------------|-------|
| Easy | 1–10 | 15s |
| Medium | 1–50 | 10s |
| Hard | 1–100+ | 7s |

Level increases every 10 questions, scaling range and speed.

### Scoring
- Easy: 10 base + time bonus (2pts/sec remaining)
- Medium: 20 base + time bonus
- Hard: 30 base + time bonus

### Badges
| Badge | Condition |
|-------|-----------|
| 💎 Perfect | 100% accuracy |
| 🌟 Star Player | 80%+ accuracy |
| 🔥 On Fire | 300+ score |
| 🚀 Level Master | Reach level 3 |
| 🛡️ No Mistakes | Keep all 3 lives |
| 📅 Daily Hero | Complete daily challenge |

---

## 🔧 Flask API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home screen |
| `/play` | GET | Game screen |
| `/leaderboard` | GET | Leaderboard page |
| `/submit-score` | POST | Save score (JSON body) |
| `/get-leaderboard` | GET | Get top 10 scores |

### POST /submit-score body:
```json
{
  "name": "PlayerName",
  "avatar": "🦁",
  "score": 250,
  "accuracy": 80,
  "level": 3,
  "mode": "addition",
  "difficulty": "medium"
}
```

---

## 🎵 Sound Engine

Uses Web Audio API — **no external audio files needed**.
All sounds are synthesized in real-time:
- ✅ Correct answer: ascending happy chord
- ❌ Wrong answer: descending sad tones
- ⏰ Timer warning: alert beep
- 🎉 Level up: celebration fanfare
- 🎵 Background music: ambient arpeggio loop

Voice feedback uses the browser's Speech Synthesis API.

---

## 📱 Browser Support

Works on all modern browsers:
- Chrome / Edge (best performance)
- Firefox
- Safari (iOS + macOS)
- Mobile browsers (responsive design)

---

## 🚀 Deployment Tips

### Deploy to Railway / Render / Heroku:
1. Add a `Procfile`:
   ```
   web: python app.py
   ```
2. Set environment variable `PORT` and update `app.py`:
   ```python
   import os
   app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
   ```

### Deploy to Firebase Hosting (static only):
Not recommended since this uses Flask — use a Python host.

---

## 🎨 Customization

### Change colors (CSS variables in style.css):
```css
:root {
  --purple: #7c3aed;   /* primary accent */
  --pink: #ec4899;     /* secondary accent */
  --orange: #f97316;   /* highlights */
}
```

### Add more questions or modes:
Edit the `generateQuestion()` function in `static/js/game.js`.

### Change total questions per round:
```javascript
G.totalQuestions = 10;  // in game.js, line ~30
```

---

## 🛡️ Security Notes

- Firebase is in **test mode** by default — add security rules before production
- Firestore rules for production:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /scores/{doc} {
        allow read: if true;
        allow write: if request.auth != null;
      }
      match /players/{uid} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
  ```

---

Built with ❤️ for young math adventurers!
