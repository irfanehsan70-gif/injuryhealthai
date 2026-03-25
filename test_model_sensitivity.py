import pickle
import numpy as np
import pandas as pd

MODEL_DIR = r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\models'

with open(f'{MODEL_DIR}/binary_model.pkl', 'rb') as f:
    binary_model = pickle.load(f)
with open(f'{MODEL_DIR}/encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)

le_league = encoders['league']
le_pos = encoders['position']

# Print classes to verify
print(f"Leagues: {le_league.classes_}")
print(f"Positions: {le_pos.classes_}")

def get_prob(age, injuries, recur, fatigue):
    # Dummy data for other fields
    league = 'Premier League'
    position = 'Forward'
    seasons = 5
    matches = 30
    minutes = 2400
    hsr = 80
    
    league_enc = le_league.transform([league])[0]
    position_enc = le_pos.transform([position])[0]
    
    load_ratio = minutes / matches
    sprint_load = hsr * fatigue
    injury_rate = injuries / (seasons + 1)
    age_fatigue = age * fatigue
    high_risk_combo = recur * injuries * fatigue
    age_load = (age / 35.0) * (minutes / 4000.0)
    fatigue_recurrence = fatigue * recur
    hsr_position_impact = hsr * 1.2 # Forward
    
    feature_row = np.array([[
        league_enc, position_enc, age, seasons, matches,
        minutes, hsr, injuries, recur, fatigue,
        load_ratio, sprint_load, injury_rate, age_fatigue, high_risk_combo,
        age_load, fatigue_recurrence, hsr_position_impact
    ]])
    
    prob = binary_model.predict_proba(feature_row)[0][1]
    return prob

print(f"Safe Player (20y, 0 inj): {get_prob(20, 0, 0, 1.0):.4f}")
print(f"Moderate Player (25y, 1 inj, no recur): {get_prob(25, 1, 0, 1.2):.4f}")
print(f"Risky Player (30y, 2 inj, recur, 2.0 fat): {get_prob(30, 2, 1, 2.0):.4f}")
print(f"Extreme Player (35y, 5 inj, recur, 3.0 fat): {get_prob(35, 5, 1, 3.0):.4f}")
