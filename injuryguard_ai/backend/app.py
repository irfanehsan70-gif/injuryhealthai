from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import jwt
import datetime
import bcrypt
from functools import wraps
from pymongo import MongoClient
from bson import ObjectId
import json

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'injury_guard_secret_2026'

import certifi
ca = certifi.where()

import urllib.parse
# ─────────────────────────────────────────────
# MongoDB Connection
# ─────────────────────────────────────────────
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

try:
    # Use tlsAllowInvalidCertificates and explicitly set connectTimeout
    client = MongoClient(MONGO_URI, 
                         serverSelectionTimeoutMS=10000, 
                         connectTimeoutMS=10000,
                         tlsAllowInvalidCertificates=True)
    client.admin.command('ping')  # Verify connection
    db = client[DB_NAME]
    users_col = db["users"]
    predictions_col = db["predictions"]
    team_uploads_col = db["team_uploads"]
    players_col = db["players"]
    print("✅ MongoDB connected successfully.")

    # Seed default users if not exists
    if not users_col.find_one({"email": "admin@injuryguard.ai"}):
        hashed = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())
        users_col.insert_one({
            "name": "Elite Coach",
            "email": "admin@injuryguard.ai",
            "password": hashed,
            "role": "admin",
            "team_name": "GLOBAL",
            "created_at": datetime.datetime.utcnow()
        })
        print("✅ Default admin user seeded.")
    
    if not users_col.find_one({"email": "player@injuryguard.ai"}):
        hashed = bcrypt.hashpw("player123".encode('utf-8'), bcrypt.gensalt())
        users_col.insert_one({
            "name": "Pro Athlete",
            "email": "player@injuryguard.ai",
            "password": hashed,
            "role": "player",
            "team_name": "GLOBAL",
            "created_at": datetime.datetime.utcnow()
        })
        print("✅ Default player user seeded.")
except Exception as e:
    print(f"⚠️  MongoDB connection failed: {e}. Falling back to demo mode.")
    db = None
    users_col = None
    predictions_col = None
    team_uploads_col = None
    players_col = None
else:
    pass

# ─────────────────────────────────────────────
# ML Models (Two-Stage Pipeline)
# ─────────────────────────────────────────────
MODEL_DIR = 'c:\\Users\\97335\\.gemini\\antigravity\\scratch\\injuryguard_ai\\models'
BINARY_MODEL_PATH = os.path.join(MODEL_DIR, 'binary_model.pkl')
TYPE_MODEL_PATH   = os.path.join(MODEL_DIR, 'injury_model.pkl')
ENCODERS_PATH     = os.path.join(MODEL_DIR, 'encoders.pkl')
METRICS_PATH      = os.path.join(MODEL_DIR, 'model_metrics.pkl')

try:
    with open(BINARY_MODEL_PATH, 'rb') as f:
        binary_model = pickle.load(f)
    with open(TYPE_MODEL_PATH, 'rb') as f:
        type_model = pickle.load(f)
    with open(ENCODERS_PATH, 'rb') as f:
        encoders = pickle.load(f)   # keys: 'league', 'position', 'type'
    with open(METRICS_PATH, 'rb') as f:
        metrics = pickle.load(f)
    print("✅ Two-stage ML models loaded successfully.")
except Exception as e:
    print(f"⚠️  Error loading models: {e}")
    binary_model = None
    type_model   = None
    encoders     = None
    metrics      = None

# Keep a unified alias for health-check / old references
model = binary_model

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
def serialize_doc(doc):
    """Convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    doc = dict(doc)
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    for k, v in doc.items():
        if isinstance(v, datetime.datetime):
            doc[k] = v.isoformat()
    return doc

def standardize_input(data):
    """Map incoming request keys to model column names."""
    mapping = {
        'league': 'League', 'position': 'Position', 'age': 'Age',
        'seasons_played': 'Seasons_Played', 'matches_per_season': 'Matches_Per_Season',
        'minutes_per_season': 'Minutes_Per_Season', 'high_speed_runs': 'High_Speed_Runs',
        'high_speed_runs_per_season': 'High_Speed_Runs', 'previous_injuries': 'Previous_Injuries',
        'recurrence_flag': 'Recurrence_Flag', 'fatigue_index': 'Fatigue_Index',
        # Already correctly cased
        'League': 'League', 'Position': 'Position', 'Age': 'Age',
        'Seasons_Played': 'Seasons_Played', 'Matches_Per_Season': 'Matches_Per_Season',
        'Minutes_Per_Season': 'Minutes_Per_Season', 'High_Speed_Runs': 'High_Speed_Runs',
        'Previous_Injuries': 'Previous_Injuries', 'Recurrence_Flag': 'Recurrence_Flag',
        'Fatigue_Index': 'Fatigue_Index'
    }
    return {mapping.get(k, k): v for k, v in data.items()}

# ─────────────────────────────────────────────
# Auth Decorator
# ─────────────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.current_user = data
        except Exception:
            return jsonify({'message': 'Token is invalid or expired!'}), 401
        return f(*args, **kwargs)
    return decorated

# ─────────────────────────────────────────────
# Auth Routes
# ─────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    auth = request.json
    if not auth or not auth.get('email') or not auth.get('password'):
        return jsonify({'message': 'Email and password are required.'}), 400

    email = auth.get('email').strip().lower()
    password = auth.get('password').encode('utf-8')

    # MongoDB auth
    if users_col is not None:
        user = users_col.find_one({"email": email})
        if not user or not bcrypt.checkpw(password, user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401

        token = jwt.encode({
            'user': email,
            'name': user.get('name', 'Coach'),
            'role': user.get('role', 'user'),
            'team_name': user.get('team_name', 'GLOBAL'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])

        return jsonify({
            'token': token,
            'user': {
                'name': user.get('name', 'Coach'), 
                'email': email, 
                'role': user.get('role', 'user'),
                'team_name': user.get('team_name', 'GLOBAL'),
                'coach_profile': user.get('coach_profile', {})
            }
        })
    else:
        # Fallback demo mode
        DEMO_USERS = {
            'admin@injuryguard.ai': {'password': 'admin123', 'name': 'Elite Coach', 'role': 'admin'},
            'player@injuryguard.ai': {'password': 'player123', 'name': 'Pro Athlete', 'role': 'player'},
        }
        demo_user = DEMO_USERS.get(email)
        if demo_user and auth.get('password') == demo_user['password']:
            token = jwt.encode({
                'user': email, 'name': demo_user['name'], 'role': demo_user['role'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.config['SECRET_KEY'])
            return jsonify({'token': token, 'user': {'name': demo_user['name'], 'email': email, 'role': demo_user['role']}})
        return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Name, email, and password are required.'}), 400

    if users_col is None:
        return jsonify({'message': 'Database unavailable.'}), 503

    email = data['email'].strip().lower()
    if users_col.find_one({"email": email}):
        return jsonify({'message': 'Email already registered.'}), 409

    # Add Team Association
    team_name = data.get('team_name', '').strip().upper()
    role = data.get('role', 'player')  # 'player' or 'coach'
    
    if role == 'coach':
        if not team_name:
            return jsonify({'message': 'Team Name is required for coaches.'}), 400
        # Check if team already exists
        if users_col.find_one({"team_name": team_name, "role": "coach"}):
            return jsonify({'message': f'A coach for "{team_name}" is already registered.'}), 409
    elif role == 'player':
        if not team_name:
            return jsonify({'message': 'Team Name is required for players.'}), 400
        # Verify team exists
        coach = users_col.find_one({"team_name": team_name, "role": "coach"})
        if not coach:
            return jsonify({'message': f'Team "{team_name}" not found. Please verify with your coach.'}), 404

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    # Accept an optional 'profile' block and 'role' from the multi-step wizard
    incoming_profile = data.get('profile', {})

    user_doc = {
        "name":       data['name'],
        "email":      email,
        "password":   hashed,
        "role":       role,
        "team_name":  team_name,
        "created_at": datetime.datetime.utcnow(),
    }

    # Store athletic profile fields if provided
    if incoming_profile:
        user_doc['profile'] = {
            'league':             incoming_profile.get('league', ''),
            'position':           incoming_profile.get('position', ''),
            'age':                incoming_profile.get('age'),
            'seasons_played':     incoming_profile.get('seasons_played'),
            'matches_per_season': incoming_profile.get('matches_per_season'),
            'minutes_per_season': incoming_profile.get('minutes_per_season'),
            'high_speed_runs':    incoming_profile.get('high_speed_runs'),
            'previous_injuries':  incoming_profile.get('previous_injuries', 0),
            'recurrence_flag':    incoming_profile.get('recurrence_flag', 0),
            'fatigue_index':      incoming_profile.get('fatigue_index', 1.0),
            'jersey_number':      incoming_profile.get('jersey_number', ''),
            'nationality':        incoming_profile.get('nationality', ''),
            'club':               incoming_profile.get('club', ''),
            'height_cm':          incoming_profile.get('height_cm'),
            'weight_kg':          incoming_profile.get('weight_kg'),
        }

    # Store coach profile if provided
    coach_profile = data.get('coach_profile')
    if coach_profile:
        user_doc['coach_profile'] = coach_profile

    users_col.insert_one(user_doc)
    return jsonify({'message': 'User registered successfully.', 'team_name': team_name}), 201


@app.route('/api/me', methods=['GET'])
@token_required
def get_me():
    email = request.current_user.get('user')
    if users_col is not None:
        user = users_col.find_one({"email": email}, {"password": 0})
        return jsonify(serialize_doc(user))
    return jsonify({'email': email, 'name': request.current_user.get('name', 'Coach')})


@app.route('/api/player_profile', methods=['GET'])
@token_required
def player_profile():
    """Returns comprehensive player profile: personal info + all scan history + stats."""
    email = request.current_user.get('user')

    # ── User info ─────────────────────────────────────────────────────────
    user_info = {
        'name': request.current_user.get('name', 'Athlete'),
        'email': email,
        'role': request.current_user.get('role', 'player'),
    }
    if users_col is not None:
        user_doc = users_col.find_one({"email": email}, {"password": 0})
        if user_doc:
            user_info['created_at'] = user_doc.get('created_at', '').isoformat() if isinstance(user_doc.get('created_at'), datetime.datetime) else str(user_doc.get('created_at', ''))
            # Include the stored athletic profile (filled in during registration)
            if user_doc.get('profile'):
                user_info['profile'] = user_doc['profile']

    # ── Assessment history ────────────────────────────────────────────────
    history = []
    if predictions_col is not None:
        docs = list(predictions_col.find({"user": email}).sort("timestamp", -1).limit(50))
        history = [serialize_doc(d) for d in docs]

    # ── Aggregate stats ───────────────────────────────────────────────────
    stats = {
        'total_scans': len(history),
        'avg_risk': 0,
        'highest_risk': 0,
        'lowest_risk': 100,
        'most_common_injury': 'None',
        'high_risk_scans': 0,
        'medium_risk_scans': 0,
        'low_risk_scans': 0,
    }

    if history:
        risks = [h['result']['risk_prob'] for h in history]
        stats['avg_risk'] = round(float(np.mean(risks)), 1)
        stats['highest_risk'] = round(float(max(risks)), 1)
        stats['lowest_risk'] = round(float(min(risks)), 1)
        stats['high_risk_scans']   = sum(1 for h in history if h['result']['risk_label'] == 'High')
        stats['medium_risk_scans'] = sum(1 for h in history if h['result']['risk_label'] == 'Medium')
        stats['low_risk_scans']    = sum(1 for h in history if h['result']['risk_label'] == 'Low')

        injury_types = [h['result']['predicted_type'] for h in history if h['result']['predicted_type'] != 'None']
        if injury_types:
            from collections import Counter
            stats['most_common_injury'] = Counter(injury_types).most_common(1)[0][0]

    # ── Risk trend (chronological) ─────────────────────────────────────────
    risk_trend = [
        {
            'date': h['timestamp'][:10] if h.get('timestamp') else '',
            'risk': h['result']['risk_prob'],
            'label': h['result']['risk_label'],
            'injury_type': h['result']['predicted_type'],
            'player_name': h.get('player_name', ''),
        }
        for h in reversed(history)
    ]

    # ── Latest assessment full result ─────────────────────────────────────
    latest = history[0] if history else None

    return jsonify({
        'user': user_info,
        'stats': stats,
        'history': history[:20],
        'risk_trend': risk_trend[-20:],   # last 20 in time order
        'latest': latest,
    })

# ─────────────────────────────────────────────
# Prediction Routes
# ─────────────────────────────────────────────
@app.route('/api/predict', methods=['POST'])
@token_required
def predict():
    if not binary_model or not type_model or not encoders:
        return jsonify({'error': 'ML models not loaded'}), 503
    data = request.json
    try:
        standard_data = standardize_input(data)

        # ── Encode categoricals using saved LabelEncoders ─────────
        le_league   = encoders['league']
        le_position = encoders['position']
        le_type     = encoders['type']

        league_str   = str(standard_data.get('League', 'Premier League'))
        position_str = str(standard_data.get('Position', 'Midfielder'))

        # Handle unseen labels gracefully
        if league_str not in le_league.classes_:
            league_enc = 0
        else:
            league_enc = int(le_league.transform([league_str])[0])

        if position_str not in le_position.classes_:
            position_enc = 0
        else:
            position_enc = int(le_position.transform([position_str])[0])

        # ── Build numeric feature row matching training FEATURE_COLS ─
        age       = float(standard_data.get('Age', 25))
        seasons   = float(standard_data.get('Seasons_Played', 3)) or 1
        matches   = float(standard_data.get('Matches_Per_Season', 30)) or 1
        minutes   = float(standard_data.get('Minutes_Per_Season', 2000))
        hsr       = float(standard_data.get('High_Speed_Runs', 80))
        prev_inj  = float(standard_data.get('Previous_Injuries', 0))
        recur     = float(standard_data.get('Recurrence_Flag', 0))
        fatigue   = float(standard_data.get('Fatigue_Index', 1.0))

        load_ratio      = minutes / matches
        sprint_load     = hsr * fatigue
        injury_rate     = prev_inj / seasons
        age_fatigue     = age * fatigue
        high_risk_combo = recur * prev_inj * fatigue

        # ── New interaction features matching train_enhanced_model.py ──
        age_load           = (age / 35.0) * (minutes / 4000.0)
        fatigue_recurrence = fatigue * recur
        
        # Position weighting for HSR impact
        pos_map = {'Forward': 1.2, 'Midfielder': 1.0, 'Defender': 0.8, 'GK': 0.2}
        pos_weight = pos_map.get(position_str, 1.0)
        hsr_position_impact = hsr * pos_weight

        feature_row = np.array([[
            league_enc, position_enc, age, seasons, matches,
            minutes, hsr, prev_inj, recur, fatigue,
            load_ratio, sprint_load, injury_rate, age_fatigue, high_risk_combo,
            age_load, fatigue_recurrence, hsr_position_impact
        ]])

        # ── Stage 1: Binary prediction (injury probability) ───────
        raw_prob = float(binary_model.predict_proba(feature_row)[0][1])
        # Clip to [0.01, 0.99] — avoids hard 0%/100% in a clinical tool
        injury_prob = float(np.clip(raw_prob, 0.01, 0.99))

        # ── Stage 2: Injury type (only runs if likely injured) ────
        if injury_prob >= 0.3:
            type_enc     = type_model.predict(feature_row)[0]
            predicted_type = le_type.inverse_transform([type_enc])[0]
            # Probability breakdown per type
            type_probs   = type_model.predict_proba(feature_row)[0]
            type_classes = le_type.inverse_transform(type_model.classes_)
            prob_breakdown = {str(c): round(float(p) * 100, 1)
                              for c, p in zip(type_classes, type_probs)}
        else:
            predicted_type = 'None'
            prob_breakdown = {}

        # ── Key risk factors from saved metrics ───────────────────
        global_importance = dict(zip(
            metrics.get('feature_names', []),
            metrics.get('feature_importance', [])
        ))
        top_factors = [k for k, _ in sorted(
            global_importance.items(), key=lambda x: x[1], reverse=True
        )[:5]]

        # ── Rule-based recommendations ────────────────────────────
        recommendations = []
        if fatigue > 2.0:
            recommendations.append("Immediate 48h rest period suggested.")
        if hsr > 120:
            recommendations.append("Reduce high-intensity sprint drills.")
        if minutes > 3000:
            recommendations.append("Apply load management for next 2 matches.")
        if prev_inj > 2 or recur == 1:
            recommendations.append("Specific proprioception and strengthening focus.")
        if not recommendations:
            recommendations = ["Maintain current training load.", "Ensure optimal hydration."]

        result = {
            'player_name':   standard_data.get('PlayerName', 'Unknown Player'),
            'risk_prob':     round(injury_prob * 100, 1),
            'risk_label':    'High' if injury_prob > 0.6 else 'Medium' if injury_prob > 0.3 else 'Low',
            'predicted_type': predicted_type,
            'prob_breakdown': prob_breakdown,
            'key_factors':   top_factors,
            'recommendations': recommendations
        }

        # ── Persist to MongoDB ────────────────────────────────────
        if predictions_col is not None:
            prediction_entry = {
                "user":      standard_data.get('PlayerEmail', request.current_user.get('user')),
                "player_name": result['player_name'],
                "input":     {k: (int(v) if hasattr(v, 'item') else v)
                              for k, v in standard_data.items()},
                "result":    result,
                "timestamp": datetime.datetime.utcnow()
            }
            predictions_col.insert_one(prediction_entry)
            
            # Also update/insert player record
            if players_col is not None:
                players_col.update_one(
                    {"name": result['player_name'], "coach": request.current_user.get('user')},
                    {"$set": {
                        "name": result['player_name'],
                        "coach": request.current_user.get('user'),
                        "last_assessment": datetime.datetime.utcnow(),
                        "last_risk": result['risk_prob'],
                        "last_type": result['predicted_type'],
                        "position": position_str
                    }},
                    upsert=True
                )

        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400


@app.route('/api/history', methods=['GET'])
@token_required
def get_history():
    if predictions_col is None:
        return jsonify([])
    email = request.current_user.get('user')
    is_admin = request.current_user.get('role') == 'admin'

    query = {} if is_admin else {"user": email}
    limit = int(request.args.get('limit', 20))
    docs = list(predictions_col.find(query).sort("timestamp", -1).limit(limit))
    return jsonify([serialize_doc(d) for d in docs])


@app.route('/api/history/<prediction_id>', methods=['DELETE'])
@token_required
def delete_prediction(prediction_id):
    if predictions_col is None:
        return jsonify({'error': 'DB unavailable'}), 503
    try:
        result = predictions_col.delete_one({"_id": ObjectId(prediction_id), "user": request.current_user.get('user')})
        if result.deleted_count:
            return jsonify({'message': 'Deleted successfully.'})
        return jsonify({'error': 'Not found or unauthorized'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ─────────────────────────────────────────────
# Model Stats
# ─────────────────────────────────────────────
@app.route('/api/model_stats', methods=['GET'])
@token_required
def get_model_stats():
    if not metrics:
        return jsonify({'error': 'Metrics not loaded'}), 500
    return jsonify({
        'accuracy': metrics['accuracy'],
        'feature_names': metrics['feature_names'],
        'feature_importance': metrics['feature_importance'],
        'confusion_matrix': metrics['confusion_matrix'],
        'report': metrics.get('report', {})
    })

# ─────────────────────────────────────────────
# Team Upload
# ─────────────────────────────────────────────
@app.route('/api/upload_team', methods=['POST'])
@token_required
def upload_team():
    if not binary_model or not type_model or not encoders:
        return jsonify({'error': 'ML models not loaded'}), 503
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        df = pd.read_csv(file)
        col_map = {
            'league': 'League', 'position': 'Position', 'age': 'Age',
            'seasons_played': 'Seasons_Played', 'matches_per_season': 'Matches_Per_Season',
            'minutes_per_season': 'Minutes_Per_Season', 'high_speed_runs': 'High_Speed_Runs',
            'high_speed_runs_per_season': 'High_Speed_Runs', 'previous_injuries': 'Previous_Injuries',
            'recurrence_flag': 'Recurrence_Flag', 'fatigue_index': 'Fatigue_Index',
            'player_name': 'PlayerName', 'name': 'PlayerName', 'player': 'PlayerName'
        }
        df = df.rename(columns=lambda x: col_map.get(x.lower(), x))

        if 'PlayerName' not in df.columns:
            df['PlayerName'] = [f"Athlete #{i+1}" for i in range(len(df))]

        expected_cols = ['League', 'Position', 'Age', 'Seasons_Played', 'Matches_Per_Season',
                         'Minutes_Per_Season', 'High_Speed_Runs', 'Previous_Injuries',
                         'Recurrence_Flag', 'Fatigue_Index']
        df_input = df[expected_cols].copy()

        # ── Encode categoricals ──────────────────────────────────
        le_league   = encoders['league']
        le_position = encoders['position']
        le_type     = encoders['type']

        def safe_encode(le, series):
            known = set(le.classes_)
            return series.apply(lambda v: le.transform([str(v)])[0]
                                if str(v) in known else 0).values

        league_enc   = safe_encode(le_league,   df_input['League'])
        position_enc = safe_encode(le_position, df_input['Position'])

        # ── Feature engineering ──────────────────────────────────
        matches  = df_input['Matches_Per_Season'].replace(0, 1)
        seasons  = df_input['Seasons_Played'].replace(0, 1)
        minutes  = df_input['Minutes_Per_Season']
        hsr      = df_input['High_Speed_Runs']
        fatigue  = df_input['Fatigue_Index']
        prev_inj = df_input['Previous_Injuries']
        recur    = df_input['Recurrence_Flag']
        age      = df_input['Age']

        X = np.column_stack([
            league_enc, position_enc,
            age.values, seasons.values, matches.values, minutes.values,
            hsr.values, prev_inj.values, recur.values, fatigue.values,
            (minutes / matches).values,          # load_ratio
            (hsr * fatigue).values,               # sprint_load
            (prev_inj / seasons).values,          # injury_rate
            (age * fatigue).values,               # age_fatigue
            (recur * prev_inj * fatigue).values   # high_risk_combo
        ])

        # ── Stage 1: injury probabilities ────────────────────────
        risks = binary_model.predict_proba(X)[:, 1]  # P(injured)

        # ── Stage 2: injury type for high-risk rows ───────────────
        type_preds = np.full(len(df), 'None', dtype=object)
        high_mask  = risks > 0.3
        if high_mask.any():
            type_enc_preds = type_model.predict(X[high_mask])
            type_preds[high_mask] = le_type.inverse_transform(type_enc_preds)

        avg_risk = float(np.mean(risks))
        high_risk_players = df[risks > 0.6].head(5).to_dict('records')
        high_risk_players = [{k: (int(v) if isinstance(v, (np.integer,)) else
                                  float(v) if isinstance(v, (np.floating,)) else v)
                              for k, v in p.items()} for p in high_risk_players]

        # Type counts (only for injured predictions)
        unique_types, type_counts = np.unique(
            type_preds[type_preds != 'None'], return_counts=True
        )
        injury_type_predictions = [
            {'type': str(t), 'count': int(c)}
            for t, c in zip(unique_types, type_counts)
        ]

        result = {
            'avg_risk': round(avg_risk * 100, 1),
            'total_players': len(df),
            'risk_distribution': {
                'Low':    int(np.sum(risks <= 0.3)),
                'Medium': int(np.sum((risks > 0.3) & (risks <= 0.6))),
                'High':   int(np.sum(risks > 0.6))
            },
            'top_risk_players': high_risk_players,
            'injury_type_predictions': injury_type_predictions
        }

        # Persist to MongoDB
        if team_uploads_col is not None:
            team_uploads_col.insert_one({
                "user":             request.current_user.get('user'),
                "filename":         file.filename,
                "total_players":    result['total_players'],
                "avg_risk":         result['avg_risk'],
                "risk_distribution": result['risk_distribution'],
                "timestamp":        datetime.datetime.utcnow()
            })

        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400


@app.route('/api/team_history', methods=['GET'])
@token_required
def get_team_history():
    if team_uploads_col is None:
        return jsonify([])
    email = request.current_user.get('user')
    is_admin = request.current_user.get('role') == 'admin'
    query = {} if is_admin else {"user": email}
    docs = list(team_uploads_col.find(query).sort("timestamp", -1).limit(10))
    return jsonify([serialize_doc(d) for d in docs])


@app.route('/api/players', methods=['GET'])
@token_required
def get_players():
    """Returns list of all registered players (athletes) for the coach."""
    if users_col is None:
        return jsonify([])
    
    # Only admins/coaches should see the full roster
    role = request.current_user.get('role')
    team_name = request.current_user.get('team_name')

    if role != 'admin' and role != 'coach':
        return jsonify({'error': 'Unauthorized access'}), 403

    print(f"📋 Fetching players for team: {team_name} (Role: {role})")
    # Find all users with role 'player' and same team_name
    query = {"role": "player"}
    if team_name and team_name != 'GLOBAL':
        # Squad lookup is now case-insensitive but we standardize to upper in registration too
        query["team_name"] = team_name.upper()

    print(f"🔍 MongoDB Squad Query: {query}")
    players = list(users_col.find(query, {"password": 0}))
    print(f"✅ Found {len(players)} players.")
    
    # Enhance with their latest prediction if available
    result = []
    for p in players:
        p_doc = serialize_doc(p)
        if predictions_col is not None:
            latest = predictions_col.find_one({"user": p['email']}, sort=[("timestamp", -1)])
            if latest:
                p_doc['latest_assessment'] = serialize_doc(latest)
        result.append(p_doc)
        
    return jsonify(result)


# ─────────────────────────────────────────────
# Stats Dashboard
# ─────────────────────────────────────────────
@app.route('/api/dashboard_stats', methods=['GET'])
@token_required
def dashboard_stats():
    stats = {
        'total_predictions': 0,
        'high_risk_count': 0,
        'avg_risk_score': 0,
        'most_common_injury': 'N/A',
        'team_uploads': 0,
        'recent_predictions': []
    }

    if predictions_col is not None:
        email = request.current_user.get('user')
        is_admin = request.current_user.get('role') == 'admin'
        query = {} if is_admin else {"user": email}

        all_preds = list(predictions_col.find(query).sort("timestamp", -1))
        stats['total_predictions'] = len(all_preds)

        if all_preds:
            high_risk = [p for p in all_preds if p['result']['risk_label'] == 'High']
            stats['high_risk_count'] = len(high_risk)
            avg = np.mean([p['result']['risk_prob'] for p in all_preds])
            stats['avg_risk_score'] = round(float(avg), 1)

            injury_types = [p['result']['predicted_type'] for p in all_preds if p['result']['predicted_type'] != 'None']
            if injury_types:
                from collections import Counter
                stats['most_common_injury'] = Counter(injury_types).most_common(1)[0][0]

            stats['recent_predictions'] = [serialize_doc(p) for p in all_preds[:5]]

    if team_uploads_col is not None:
        stats['team_uploads'] = team_uploads_col.count_documents({})

    return jsonify(stats)


# ─────────────────────────────────────────────
# Diet & Workout Plans
# ─────────────────────────────────────────────
@app.route('/api/diet_plan', methods=['GET'])
@token_required
def get_diet_plan():
    injury_type = request.args.get('injury_type', '').lower()
    email = request.current_user.get('user')

    # If no type provided, try to find the player's latest assessment
    if not injury_type and predictions_col is not None:
        latest = predictions_col.find_one({"user": email}, sort=[("timestamp", -1)])
        if latest and latest.get('result'):
            injury_type = latest['result'].get('predicted_type', '').lower()

    # ── Food image URLs ────────────────────────────────────────────────────
    # Primary: TheMealDB ingredient CDN — maps ingredient names to exact images
    MEAL_DB = 'https://www.themealdb.com/images/ingredients'
    # Supplement/drink images: Wikimedia Commons (public domain, exact content)
    WIKI = 'https://upload.wikimedia.org/wikipedia/commons/thumb'

    FOOD_IMAGES = {
        # ── Proteins (TheMealDB) ───────────────────────────────────────────
        'Grilled Salmon':           f'{MEAL_DB}/Salmon.png',
        'Chicken Breast':           f'{MEAL_DB}/Chicken%20Breast.png',
        'Grilled Chicken':          f'{MEAL_DB}/Chicken.png',
        '3 Egg whites':             f'{MEAL_DB}/Egg.png',
        'Scrambled Eggs':           f'{MEAL_DB}/Egg.png',
        'Tuna Salad':               f'{MEAL_DB}/Tuna.png',
        'Greek Yogurt':             f'{MEAL_DB}/Yogurt.png',
        'Cottage Cheese':           f'{MEAL_DB}/Cheese.png',
        # ── Carbohydrates (TheMealDB) ─────────────────────────────────────
        'Oatmeal with chia seeds':  f'{MEAL_DB}/Oats.png',
        'Sweet Potato':             f'{MEAL_DB}/Sweet%20Potatoes.png',
        'Brown Rice':               f'{MEAL_DB}/Rice.png',
        'Quinoa Bowl':              f'{MEAL_DB}/Rice.png', # Closest match
        'Banana':                   f'{MEAL_DB}/Bananas.png',
        'Dextrose':                 f'{MEAL_DB}/Sugar.png',
        'Whole Grain Toast':        f'{MEAL_DB}/Bread.png',
        # ── Fruits & Vegetables (TheMealDB) ──────────────────────────────
        'Blueberries':              f'{MEAL_DB}/Blueberries.png',
        'Spinach':                  f'{MEAL_DB}/Spinach.png',
        'Avocado Toast':            f'{MEAL_DB}/Avocado.png',
        'Mixed Greens Salad':       f'{MEAL_DB}/Lettuce.png',
        'Broccoli':                 f'{MEAL_DB}/Broccoli.png',
        'Cherry Tomatoes':          f'{MEAL_DB}/Tomato.png',
        'Orange Juice':             f'{MEAL_DB}/Orange.png',
        'Berries Mix':              f'{MEAL_DB}/Strawberries.png',
        'Pineapple':                f'{MEAL_DB}/Pineapple.png',
        'Tart Cherry Juice':        f'{MEAL_DB}/Cherries.png',
        'Asparagus':                f'{MEAL_DB}/Asparagus.png',
        # ── Nuts (TheMealDB) ──────────────────────────────────────────────
        'Almonds':                  f'{MEAL_DB}/Almonds.png',
        'Walnuts':                  f'{MEAL_DB}/Walnuts.png',
        'Dark Chocolate (70%+)':    f'{MEAL_DB}/Chocolate.png',
        # ── Drinks & Juices (TheMealDB) ───────────────────────────────────
        'Beetroot juice Shot':      f'{MEAL_DB}/Beetroot.png',
        'Turmeric Latte':           f'{MEAL_DB}/Turmeric.png',
        'Green Smoothie':           f'{MEAL_DB}/Spinach.png',
        'Lentil Soup':              f'{MEAL_DB}/Lentils.png',
        'Bone Broth':               f'{MEAL_DB}/Chicken%20Stock.png',
        'Kefir':                    f'{MEAL_DB}/Yogurt.png',
        # ── Supplements — proxy ingredients from TheMealDB ──────────────
        'Whey Isolate Shake':       f'{MEAL_DB}/Milk.png',
        'Collagen Peptides':        f'{MEAL_DB}/Gelatine.png',
        'Electrolyte Drink':        f'{MEAL_DB}/Water.png',
        'Magnesium Supplement':     f'{MEAL_DB}/Salt.png',
        'Omega-3 Capsules':         f'{MEAL_DB}/Fish%20Sauce.png',
    }
    DEFAULT_IMG = f'{MEAL_DB}/Plain%20Flour.png'

    def enrich(items):
        """Add image URL to each food item."""
        return [{'name': item, 'image': FOOD_IMAGES.get(item, DEFAULT_IMG)} for item in items]

    # ── Injury-specific diet plans ────────────────────────────────────────
    PLANS = {
        'hamstring': {
            'title': 'Hamstring Recovery Nutrition Protocol',
            'subtitle': 'Protein-rich eccentric repair & anti-inflammatory focus',
            'alert': 'Avoid NSAIDs before training — they mask pain signals needed for load monitoring.',
            'hydration': '3.5L Water/day + 500ml Tart Cherry Juice for inflammation control',
            'sections': [
                {'category': 'Breakfast',     'items': enrich(['Oatmeal with chia seeds', 'Scrambled Eggs', 'Blueberries'])},
                {'category': 'Pre-Training',  'items': enrich(['Banana', 'Beetroot juice Shot'])},
                {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Tart Cherry Juice', 'Dark Chocolate (70%+)'])},
                {'category': 'Dinner',        'items': enrich(['Grilled Salmon', 'Sweet Potato', 'Spinach'])},
                {'category': 'Supplements',   'items': enrich(['Collagen Peptides', 'Omega-3 Capsules'])},
            ]
        },
        'knee': {
            'title': 'Knee & Cartilage Recovery Protocol',
            'subtitle': 'Collagen synthesis, anti-inflammation & joint lubrication',
            'alert': 'Avoid high-purine foods (red meat excess). Citrus at every meal to support collagen.',
            'hydration': '3.0L Water/day — joints need constant lubrication. Add lemon to water.',
            'sections': [
                {'category': 'Breakfast',     'items': enrich(['Oatmeal with chia seeds', '3 Egg whites', 'Orange Juice'])},
                {'category': 'Pre-Training',  'items': enrich(['Banana', 'Collagen Peptides'])},
                {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Tart Cherry Juice'])},
                {'category': 'Dinner',        'items': enrich(['Grilled Salmon', 'Broccoli', 'Brown Rice'])},
                {'category': 'Supplements',   'items': enrich(['Collagen Peptides', 'Omega-3 Capsules', 'Magnesium Supplement'])},
            ]
        },
        'ankle': {
            'title': 'Ankle Ligament Recovery Protocol',
            'subtitle': 'Calcium + Vitamin C + collagen for ligament and bone recovery',
            'alert': 'Avoid high sodium foods — excess salt causes fluid retention around the ankle joint.',
            'hydration': '3.0L Water/day + Electrolyte Drink post-session to prevent swelling.',
            'sections': [
                {'category': 'Breakfast',     'items': enrich(['Scrambled Eggs', 'Whole Grain Toast', 'Orange Juice'])},
                {'category': 'Pre-Training',  'items': enrich(['Greek Yogurt', 'Berries Mix'])},
                {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Electrolyte Drink'])},
                {'category': 'Dinner',        'items': enrich(['Grilled Chicken', 'Sweet Potato', 'Broccoli'])},
                {'category': 'Supplements',   'items': enrich(['Collagen Peptides', 'Magnesium Supplement'])},
            ]
        },
        'groin': {
            'title': 'Groin & Adductor Recovery Protocol',
            'subtitle': 'Anti-inflammatory nutrition + hip flexor and pelvic stabiliser support',
            'alert': 'Avoid excessive caffeine — it increases muscle tension. Prioritise magnesium-rich foods.',
            'hydration': '3.5L Water/day. Magnesium-rich mineral water recommended.',
            'sections': [
                {'category': 'Breakfast',     'items': enrich(['Avocado Toast', 'Scrambled Eggs', 'Blueberries'])},
                {'category': 'Pre-Training',  'items': enrich(['Banana', 'Green Smoothie'])},
                {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Tart Cherry Juice'])},
                {'category': 'Dinner',        'items': enrich(['Grilled Salmon', 'Quinoa Bowl', 'Spinach'])},
                {'category': 'Supplements',   'items': enrich(['Magnesium Supplement', 'Omega-3 Capsules'])},
            ]
        },
        'back': {
            'title': 'Lumbar & Spine Recovery Protocol',
            'subtitle': 'Anti-inflammatory + bone density + disc hydration nutrition',
            'alert': 'Avoid inflammatory foods: processed sugar, alcohol, trans fats — they worsen disc inflammation.',
            'hydration': '3.5L Water/day — spinal discs are 80% water. Stay hydrated throughout the day.',
            'sections': [
                {'category': 'Breakfast',     'items': enrich(['Oatmeal with chia seeds', '3 Egg whites', 'Berries Mix'])},
                {'category': 'Pre-Training',  'items': enrich(['Banana', 'Turmeric Latte'])},
                {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Dark Chocolate (70%+)'])},
                {'category': 'Dinner',        'items': enrich(['Grilled Salmon', 'Asparagus', 'Brown Rice'])},
                {'category': 'Supplements',   'items': enrich(['Magnesium Supplement', 'Omega-3 Capsules', 'Collagen Peptides'])},
            ]
        },
        'muscle': {
            'title': 'Muscle Strain Recovery Protocol',
            'subtitle': 'High protein synthesis + satellite cell activation nutrition',
            'alert': 'Do NOT skip post-workout nutrition — the 30-min anabolic window is critical for fibre repair.',
            'hydration': '4.0L Water/day. Add 500ml Tart Cherry Juice to reduce DOMS and inflammation.',
            'sections': [
                {'category': 'Breakfast',     'items': enrich(['Scrambled Eggs', 'Whole Grain Toast', 'Greek Yogurt'])},
                {'category': 'Pre-Training',  'items': enrich(['Banana', 'Almonds', 'Beetroot juice Shot'])},
                {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Dextrose', 'Tart Cherry Juice'])},
                {'category': 'Dinner',        'items': enrich(['Chicken Breast', 'Brown Rice', 'Broccoli'])},
                {'category': 'Supplements',   'items': enrich(['Omega-3 Capsules', 'Magnesium Supplement'])},
            ]
        },
    }

    plan_key = 'general'
    for key in PLANS:
        if key in injury_type:
            plan_key = key
            break

    plan = PLANS.get(plan_key, {
        'title': 'Elite Athlete Performance Protocol',
        'subtitle': 'General optimization for peak physiological performance',
        'alert': 'Avoid processed sugars 4 hours before training. Alcohol nullifies recovery projections.',
        'hydration': '3.5L Water/day + Electrolytes during session',
        'sections': [
            {'category': 'Breakfast',     'items': enrich(['Oatmeal with chia seeds', '3 Egg whites', 'Blueberries'])},
            {'category': 'Pre-Training',  'items': enrich(['Banana', 'Beetroot juice Shot'])},
            {'category': 'Post-Training', 'items': enrich(['Whey Isolate Shake', 'Dextrose'])},
            {'category': 'Dinner',        'items': enrich(['Grilled Salmon', 'Sweet Potato', 'Spinach'])},
        ]
    })

    return jsonify({
        'title':      plan['title'],
        'subtitle':   plan.get('subtitle', ''),
        'alert':      plan.get('alert', ''),
        'image':      '/diet.png',
        'injury_type': injury_type or 'general',
        'sections':   plan['sections'],
        'hydration':  plan.get('hydration', '3.5L Water/day'),
    })

@app.route('/api/workout_plan', methods=['GET'])
@token_required
def get_workout_plan():
    injury_type = request.args.get('injury_type', '').lower()
    email = request.current_user.get('user')

    # Auto-load latest if none requested
    if not injury_type and predictions_col is not None:
        latest = predictions_col.find_one({"user": email}, sort=[("timestamp", -1)])
        if latest and latest.get('result'):
            injury_type = latest['result'].get('predicted_type', '').lower()

    # ── Exercise library per injury type ─────────────────────────
    PLANS = {
        'hamstring': {
            'title': 'Hamstring Rehabilitation Protocol',
            'subtitle': 'Eccentric loading & progressive tensile strengthening',
            'exercises': [
                {'name': 'Nordic Hamstring Curls',      'sets': '3x8',   'focus': 'Eccentric Strength'},
                {'name': 'Romanian Deadlift',            'sets': '4x10',  'focus': 'Hip Hinge Strength'},
                {'name': 'Nordic Leg Curl Isometric',   'sets': '3x30s', 'focus': 'Tendon Loading'},
                {'name': 'Single-Leg Glute Bridge',     'sets': '3x12',  'focus': 'Glute Activation'},
            ]
        },
        'knee': {
            'title': 'Knee Stability & VMO Protocol',
            'subtitle': 'Patellofemoral control & quad-hamstring balance',
            'exercises': [
                {'name': 'Spanish Squat (Isometric)',   'sets': '3x45s', 'focus': 'VMO Activation'},
                {'name': 'Step-Down Exercise',          'sets': '3x15',  'focus': 'Eccentric Quad Control'},
                {'name': 'Terminal Knee Extension',     'sets': '3x20',  'focus': 'Last-Arc Quad Strength'},
                {'name': 'Biomechanical Plyos',         'sets': '4x6',   'focus': 'Landing Mechanics'},
            ]
        },
        'ankle': {
            'title': 'Ankle Stability & Proprioception Protocol',
            'subtitle': 'Ligament loading & neuromuscular re-education',
            'exercises': [
                {'name': 'Proprioception Drills',       'sets': '10 mins','focus': 'Ankle Stability'},
                {'name': 'Single-Leg Calf Raise',       'sets': '3x20',  'focus': 'Soleus Strength'},
                {'name': 'Resistance Band Dorsiflexion','sets': '3x15',  'focus': 'Anterior Tibialis'},
                {'name': 'Lateral Hop & Stick',         'sets': '3x10',  'focus': 'Reactive Stability'},
            ]
        },
        'groin': {
            'title': 'Groin & Adductor Rehabilitation Protocol',
            'subtitle': 'Adductor loading progression & hip stability',
            'exercises': [
                {'name': 'Copenhagen Plank',            'sets': '3x30s', 'focus': 'Adductor Health'},
                {'name': 'Adductor Squeeze Ball',       'sets': '3x20',  'focus': 'Groin Activation'},
                {'name': 'Side-Lying Hip Adduction',    'sets': '3x15',  'focus': 'Inner Thigh Strength'},
                {'name': 'Lateral Band Walk',           'sets': '3x20m', 'focus': 'Hip Abductor Stability'},
            ]
        },
        'back': {
            'title': 'Lumbar & Core Stability Protocol',
            'subtitle': 'Spinal offloading & deep stabiliser activation',
            'exercises': [
                {'name': 'Dead Bug',                    'sets': '3x10',  'focus': 'Deep Core Activation'},
                {'name': 'McGill Bird-Dog',             'sets': '3x10',  'focus': 'Lumbar Stability'},
                {'name': 'Pallof Press',                'sets': '3x12',  'focus': 'Anti-Rotation Core'},
                {'name': 'Glute Bridge March',          'sets': '3x15',  'focus': 'Glute & Core Link'},
            ]
        },
        'muscle': {
            'title': 'Muscle Strain Recovery Protocol',
            'subtitle': 'Eccentric progression & tissue remodelling',
            'exercises': [
                {'name': 'Isometric Hold (Affected)',   'sets': '5x30s', 'focus': 'Pain-Free Activation'},
                {'name': 'Eccentric Contraction Drill', 'sets': '3x8',   'focus': 'Fibre Lengthening'},
                {'name': 'Foam Roll & Mobility',        'sets': '10 mins','focus': 'Tissue Quality'},
                {'name': 'Progressive Loading Squat',   'sets': '3x12',  'focus': 'Functional Return'},
            ]
        },
    }

    # Match injury type to plan key
    plan_key = 'general'
    for key in PLANS:
        if key in injury_type:
            plan_key = key
            break

    plan = PLANS.get(plan_key, {
        'title': 'General Injury Prevention Protocol',
        'subtitle': 'Functional strength & biomechanical correction',
        'exercises': [
            {'name': 'Nordic Hamstring Curls',  'sets': '3x8',   'focus': 'Eccentric Strength'},
            {'name': 'Copenhagen Plank',        'sets': '3x30s', 'focus': 'Adductor Health'},
            {'name': 'Biomechanical Plyos',     'sets': '4x6',   'focus': 'Explosive Landing'},
            {'name': 'Proprioception Drills',   'sets': '10 mins','focus': 'Ankle Stability'},
        ]
    })

    return jsonify({
        'title':    plan['title'],
        'subtitle': plan.get('subtitle', ''),
        'image':    '/workout.png',
        'injury_type': injury_type or 'general',
        'exercises': plan['exercises']
    })

# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status':       'ok',
        'mongodb':      'connected' if db is not None else 'disconnected',
        'binary_model': 'loaded' if binary_model is not None else 'not loaded',
        'type_model':   'loaded' if type_model is not None else 'not loaded',
        'encoders':     'loaded' if encoders is not None else 'not loaded',
        'timestamp':    datetime.datetime.utcnow().isoformat()
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
