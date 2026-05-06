from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime

# Absolute paths so Flask finds templates/static from any working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, 'templates'),
    static_folder=os.path.join(BASE_DIR, 'static')
)

# In-memory leaderboard fallback (Firebase is handled client-side via JS SDK)
# Note: Vercel is serverless so this resets between requests — use Firebase for persistence
leaderboard_cache = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/play')
def play():
    return render_template('game.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/submit-score', methods=['POST'])
def submit_score():
    """Backup endpoint — primary saving is done via Firebase JS SDK on client."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    entry = {
        'name': data.get('name', 'Anonymous'),
        'score': data.get('score', 0),
        'accuracy': data.get('accuracy', 0),
        'level': data.get('level', 1),
        'mode': data.get('mode', 'addition'),
        'timestamp': datetime.utcnow().isoformat()
    }

    leaderboard_cache.append(entry)
    leaderboard_cache.sort(key=lambda x: x['score'], reverse=True)

    return jsonify({'success': True, 'entry': entry})

@app.route('/get-leaderboard', methods=['GET'])
def get_leaderboard():
    top = leaderboard_cache[:10]
    return jsonify({'leaderboard': top})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)