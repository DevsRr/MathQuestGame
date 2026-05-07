// ─────────────────────────────────────────────────────────
// Firebase Configuration
// ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDbTaI2f4rQ1iGAFq_9G8t4w02kASYYRyo",
  authDomain: "mathquestgame.firebaseapp.com",
  projectId: "mathquestgame",
  storageBucket: "mathquestgame.appspot.com",
  messagingSenderId: "186591335714",
  appId: "1:186591335714:web:c8398064b4eafa4492017b",
  measurementId: "G-362RFCPT77"
};

// ─────────────────────────────────────────────────────────
// Global Firebase Variables
// ─────────────────────────────────────────────────────────
window.db = null;
window.firebaseAuth = null;
window.currentUser = null;
window.firebaseReady = false;

// ─────────────────────────────────────────────────────────
// Initialize Firebase
// ─────────────────────────────────────────────────────────
function initFirebase() {

  try {

    // Initialize app once only
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("[Firebase] App initialized");
    }

    // Initialize Firestore
    window.db = firebase.firestore();

    // Initialize Auth
    window.firebaseAuth = firebase.auth();

    console.log("[Firebase] Firestore initialized");
    console.log("[Firebase] Auth initialized");

    // Anonymous Login
    window.firebaseAuth.signInAnonymously()

      .then(result => {

        window.currentUser = result.user;
        window.firebaseReady = true;

        console.log("[Firebase] Ready!");
        console.log("[Firebase] UID:", result.user.uid);

      })

      .catch(err => {

        console.error("[Firebase] Anonymous Auth Error:");
        console.error(err);

        window.firebaseReady = false;

      });

  } catch (e) {

    console.error("[Firebase] Initialization Failed:");
    console.error(e);

    window.firebaseReady = false;
  }
}

// Auto initialize Firebase
initFirebase();

// ─────────────────────────────────────────────────────────
// Save Score Function
// ─────────────────────────────────────────────────────────
async function saveScore(data) {

  console.log("========== SAVE SCORE DEBUG ==========");
  console.log("Data:", data);
  console.log("Firebase Ready:", window.firebaseReady);
  console.log("DB Exists:", !!window.db);
  console.log("Current User:", window.currentUser);

  // Prevent saving if Firebase isn't ready
  if (!window.firebaseReady || !window.db) {

    console.error("❌ Firebase not ready yet");

    return false;
  }

  try {

    console.log("⏳ Getting Firestore collection...");

    const scoresCollection = window.db.collection('scores');

    console.log("Collection Ref:", scoresCollection);

    console.log("⏳ Saving score to Firestore...");

    const result = await scoresCollection.add({

      ...data,

      uid: window.currentUser?.uid || 'anonymous',

      timestamp: firebase.firestore.FieldValue.serverTimestamp()

    });

    console.log("✅ SCORE SAVED SUCCESSFULLY!");
    console.log("Document ID:", result.id);

    return true;

  } catch (e) {

    console.error("❌ FIRESTORE SAVE ERROR");
    console.error(e);

    if (e.code) {
      console.error("Error Code:", e.code);
    }

    if (e.message) {
      console.error("Error Message:", e.message);
    }

    return false;
  }
}

// Make globally accessible
window.saveScore = saveScore;

// ─────────────────────────────────────────────────────────
// Get Top Scores
// ─────────────────────────────────────────────────────────
async function getTopScores(limitCount = 10) {

  if (!window.firebaseReady || !window.db) {
    console.warn("[Firebase] Not ready for getTopScores()");
    return [];
  }

  try {

    const snap = await window.db
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(limitCount)
      .get();

    const scores = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("[Firebase] Top scores loaded:", scores);

    return scores;

  } catch (e) {

    console.error("[Firebase] Get scores failed:");
    console.error(e);

    return [];
  }
}

// ─────────────────────────────────────────────────────────
// Get Today's Scores
// ─────────────────────────────────────────────────────────
async function getTodayScores(limitCount = 10) {

  if (!window.firebaseReady || !window.db) {
    return [];
  }

  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snap = await window.db
      .collection('scores')
      .where('timestamp', '>=', today)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const scores = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount);

  } catch (e) {

    console.error("[Firebase] Get today scores failed:");
    console.error(e);

    return [];
  }
}

// ─────────────────────────────────────────────────────────
// Save Player Progress
// ─────────────────────────────────────────────────────────
async function savePlayerProgress(name, avatar, data) {

  if (!window.firebaseReady || !window.db || !window.currentUser) {
    return;
  }

  try {

    await window.db
      .collection('players')
      .doc(window.currentUser.uid)
      .set({

        name,
        avatar,

        ...data,

        updatedAt: firebase.firestore.FieldValue.serverTimestamp()

      }, { merge: true });

    console.log("[Firebase] Player progress saved");

  } catch (e) {

    console.error("[Firebase] Save progress failed:");
    console.error(e);
  }
}

// ─────────────────────────────────────────────────────────
// Get Player Progress
// ─────────────────────────────────────────────────────────
async function getPlayerProgress() {

  if (!window.firebaseReady || !window.db || !window.currentUser) {
    return null;
  }

  try {

    const doc = await window.db
      .collection('players')
      .doc(window.currentUser.uid)
      .get();

    if (doc.exists) {

      console.log("[Firebase] Player progress loaded");

      return doc.data();
    }

    return null;

  } catch (e) {

    console.error("[Firebase] Get player progress failed:");
    console.error(e);

    return null;
  }
}