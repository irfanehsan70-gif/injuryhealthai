import sys
import os
import pandas as pd
import numpy as np
import pickle

# Setup paths
BASE_DIR = 'c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai'
MODEL_DIR = os.path.join(BASE_DIR, 'models')
DATA_PATH = os.path.join(BASE_DIR, 'data', 'semi_realistic_multi_league_injury_dataset_10000.csv')

# Load models (replicating app.py)
BINARY_MODEL_PATH = os.path.join(MODEL_DIR, 'binary_model.pkl')
TYPE_MODEL_PATH   = os.path.join(MODEL_DIR, 'injury_model.pkl')
ENCODERS_PATH     = os.path.join(MODEL_DIR, 'encoders.pkl')

print("Loading models...")
try:
    with open(BINARY_MODEL_PATH, 'rb') as f:
        binary_model = pickle.load(f)
    with open(TYPE_MODEL_PATH, 'rb') as f:
        type_model = pickle.load(f)
    with open(ENCODERS_PATH, 'rb') as f:
        encoders = pickle.load(f)
    print("Models loaded.")
except Exception as e:
    print(f"Error loading models: {e}")
    sys.exit(1)

# Logic from upload_team
def test_logic():
    print(f"Reading CSV from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    col_map = {
        'league': 'League', 'position': 'Position', 'age': 'Age',
        'seasons_played': 'Seasons_Played', 'matches_per_season': 'Matches_Per_Season',
        'minutes_per_season': 'Minutes_Per_Season', 'high_speed_runs': 'High_Speed_Runs',
        'high_speed_runs_per_season': 'High_Speed_Runs', 'previous_injuries': 'Previous_Injuries',
        'recurrence_flag': 'Recurrence_Flag', 'fatigue_index': 'Fatigue_Index'
    }
    df = df.rename(columns=lambda x: col_map.get(x.lower(), x))

    expected_cols = ['League', 'Position', 'Age', 'Seasons_Played', 'Matches_Per_Season',
                     'Minutes_Per_Season', 'High_Speed_Runs', 'Previous_Injuries',
                     'Recurrence_Flag', 'Fatigue_Index']
    
    print("Checking expected columns...")
    for col in expected_cols:
        if col not in df.columns:
            print(f"Error: Missing column {col}")
            return
    
    df_input = df[expected_cols].copy()
    
    # Encode
    le_league   = encoders['league']
    le_position = encoders['position']
    le_type     = encoders['type']

    def safe_encode(le, series):
        known = set(le.classes_)
        return series.apply(lambda v: le.transform([str(v)])[0]
                            if str(v) in known else 0).values

    print("Encoding...")
    league_enc   = safe_encode(le_league,   df_input['League'])
    position_enc = safe_encode(le_position, df_input['Position'])

    # Engineering
    print("Engineering features...")
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
    
    print(f"X shape: {X.shape}")
    print(f"Sample X row: {X[0]}")

    # Binary prediction
    print("Predicting probability...")
    risks = binary_model.predict_proba(X)[:, 1]
    print(f"Risks sample: {risks[:5]}")

    # Type prediction
    print("Predicting types...")
    type_preds = np.full(len(df), 'None', dtype=object)
    high_mask  = risks > 0.3
    if high_mask.any():
        print(f"Found {high_mask.sum()} high risk cases.")
        type_enc_preds = type_model.predict(X[high_mask])
        print(f"Type predictions shape: {type_enc_preds.shape}")
        # CHECK IF le_type EXISTS AND MATCHES
        type_preds[high_mask] = le_type.inverse_transform(type_enc_preds)
    
    print("Logic passed!")

if __name__ == "__main__":
    test_logic()
