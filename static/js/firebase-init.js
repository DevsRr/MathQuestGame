
const firebaseConfig = {
  apiKey: "AIzaSyDbTaI2f4rQ1iGAFq_9G8t4w02kASYYRyo",
  authDomain: "mathquestgame.firebaseapp.com",
  projectId: "mathquestgame",
  storageBucket: "mathquestgame.firebasestorage.app",
  messagingSenderId: "186591335714",
  appId: "1:186591335714:web:c8398064b4eafa4492017b",
  measurementId: "G-362RFCPT77"
};
// ─────────────────────────────────────────────────────────

window.db = null;
window.firebaseAuth = null;
window.currentUser = null;
window.firebaseReady = false;

function initFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    window.db = firebase.firestore();
    window.firebaseAuth = firebase.auth();

    window.firebaseAuth.signInAnonymously()
      .then(result => {
        window.currentUser = result.user;
        window.firebaseReady = true;
        console.log('[Firebase] Ready. UID:', result.user.uid);
      })
      .catch(err => {
        console.warn('[Firebase] Auth skipped (demo mode):', err.message);
        window.firebaseReady = false;
      });
  } catch (e) {
    console.warn('[Firebase] Init failed — running in offline demo mode:', e.message);
    window.firebaseReady = false;
  }
}

// Called by the last Firebase <script> tag's onload (see HTML)
window._firebaseReady = initFirebase;

// ── Firestore helpers ──────────────────────────────────────

async function saveScore(data) {
  if (!window.firebaseReady || !window.db) return false;
  try {
    await window.db.collection('scores').add({
      ...data,
      uid: window.currentUser?.uid || 'anonymous',
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (e) {
    console.warn('[Firebase] Save score failed:', e.message);
    return false;
  }
}

async function getTopScores(limitCount = 10) {
  if (!window.firebaseReady || !window.db) return [];
  try {
    const snap = await window.db.collection('scores')
      .orderBy('score', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('[Firebase] Get scores failed:', e.message);
    return [];
  }
}

async function getTodayScores(limitCount = 10) {
  if (!window.firebaseReady || !window.db) return [];
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const snap = await window.db.collection('scores')
      .where('timestamp', '>=', today)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    const scores = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return scores.sort((a, b) => b.score - a.score).slice(0, limitCount);
  } catch (e) {
    console.warn('[Firebase] Get today scores failed:', e.message);
    return [];
  }
}

async function savePlayerProgress(name, avatar, data) {
  if (!window.firebaseReady || !window.db || !window.currentUser) return;
  try {
    await window.db.collection('players').doc(window.currentUser.uid).set({
      name, avatar, ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('[Firebase] Save progress failed:', e.message);
  }
}

async function getPlayerProgress() {
  if (!window.firebaseReady || !window.db || !window.currentUser) return null;
  try {
    const doc = await window.db.collection('players').doc(window.currentUser.uid).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    return null;
  }
}