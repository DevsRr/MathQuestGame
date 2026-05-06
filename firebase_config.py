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
    "apiKey": "YOUR_API_KEY",
    "authDomain": "YOUR_PROJECT.firebaseapp.com",
    "projectId": "YOUR_PROJECT_ID",
    "storageBucket": "YOUR_PROJECT.appspot.com",
    "messagingSenderId": "YOUR_SENDER_ID",
    "appId": "YOUR_APP_ID"
}

# Optional: If you want server-side Firebase Admin SDK access
# pip install firebase-admin
# Then:
# import firebase_admin
# from firebase_admin import credentials, firestore
# cred = credentials.Certificate('serviceAccountKey.json')
# firebase_admin.initialize_app(cred)
# db = firestore.client()
