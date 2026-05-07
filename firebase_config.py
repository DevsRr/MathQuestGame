# firebase_config.py
# Firebase is integrated client-side via the Firebase JS SDK (v9 modular).
# This file documents the setup steps and provides a server-side reference.

# ─────────────────────────────────────────────
# SETUP INSTRUCTIONS
# ─────────────────────────────────────────────
# 1. Go to https://console.firebase.google.com
# 2. Create a new project (e.g. "MathQuestGame")
# 3. Enable Firestore Database (start in test mode for dev)
# 4. Enable Authentication → Anonymous sign-in
# 5. Go to Project Settings → General → Your apps → Add Web App
# 6. Copy the firebaseConfig object
# 7. Paste it into static/js/firebase-init.js  (see that file)
# ─────────────────────────────────────────────

FIREBASE_CONFIG_TEMPLATE = {
    "apiKey": "AIzaSyDbTaI2f4rQ1iGAFq_9G8t4w02kASYYRyo",
    "authDomain": "mathquestgame.firebaseapp.com",
    "projectId": "mathquestgame",
    "storageBucket": "mathquestgame.firebasestorage.app",
    "messagingSenderId": "186591335714",
    "appId": "1:186591335714:web:c8398064b4eafa4492017b",
    "measurementId": "G-362RFCPT77"
}

# Optional: If you want server-side Firebase Admin SDK access
# pip install firebase-admin
# Then:
# import firebase_admin
# from firebase_admin import credentials, firestore
# cred = credentials.Certificate('serviceAccountKey.json')
# firebase_admin.initialize_app(cred)
# db = firestore.client()
