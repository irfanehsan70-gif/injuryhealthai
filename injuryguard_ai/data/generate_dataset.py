"""
InjuryGuard AI — Realistic Balanced Dataset Generator
Key fixes:
1. More realistic injury rate (~35% of all players get injured, not 80%)
2. Balanced injury type distribution — all 7 types have meaningful representation
3. Risk formula tuned so low-fatigue / young / low-load players = LOW risk
4. Position-specific injury probabilities are medically accurate
"""
import pandas as pd
import numpy as np
import os

OUTPUT_PATH = r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\data\football_injury_dataset_10000_new.csv'

def generate_dataset(n_players=20000):
    np.random.seed(42)  # New seed for new era of accuracy

    leagues    = ['Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga']
    positions  = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper']

    # ── Medically accurate injury type probabilities per position ───────────
    INJURY_PROBS = {
        'Forward':    {'Hamstring': 0.35, 'ACL': 0.12, 'Ankle': 0.15, 'Groin': 0.14, 'Muscle': 0.12, 'Knee': 0.08, 'Back': 0.04},
        'Midfielder': {'Hamstring': 0.22, 'ACL': 0.10, 'Ankle': 0.22, 'Groin': 0.16, 'Muscle': 0.18, 'Knee': 0.08, 'Back': 0.04},
        'Defender':   {'Hamstring': 0.18, 'ACL': 0.14, 'Ankle': 0.24, 'Groin': 0.10, 'Muscle': 0.12, 'Knee': 0.14, 'Back': 0.08},
        'Goalkeeper': {'Hamstring': 0.08, 'ACL': 0.08, 'Ankle': 0.18, 'Groin': 0.08, 'Muscle': 0.04, 'Knee': 0.18, 'Back': 0.36},
    }

    data = []

    for _ in range(n_players):
        league   = np.random.choice(leagues)
        age      = np.random.randint(17, 39)
        position = np.random.choice(positions)

        seasons_played      = np.random.randint(1, 20)
        matches_per_season  = np.random.randint(5, 55) # Includes cup/international
        avg_minutes         = np.random.randint(60, 95)
        minutes_per_season  = matches_per_season * avg_minutes
        
        # simulated Match Density (Congestion)
        congestion = (matches_per_season / 38) * np.random.uniform(0.8, 1.4)

        # Position-specific high-speed runs
        hsr_mean = {'Forward': 110, 'Midfielder': 85, 'Defender': 60, 'Goalkeeper': 5}[position]
        hsr_std  = {'Forward': 35, 'Midfielder': 25, 'Defender': 20, 'Goalkeeper': 3}[position]
        hsr = float(np.clip(np.random.normal(hsr_mean, hsr_std), 0, 250))

        previous_injuries = int(np.random.choice([0, 1, 2, 3, 4, 5], p=[0.38, 0.25, 0.15, 0.12, 0.07, 0.03]))
        
        # Recurrence logic: older players with history are very likely to have recurrence flags
        rec_prob = 0.12
        if previous_injuries > 2: rec_prob += 0.40
        if age > 30: rec_prob += 0.20
        recurrence_flag = 1 if np.random.random() < rec_prob else 0
        
        fatigue_index = round(float(np.random.beta(2.5, 3.5) * 3.5), 2)

        # ── ADVANCED NON-LINEAR RISK ARCHITECTURE ────────────────────────────
        # 1. Base Age Risk (Exponential as we get older)
        age_risk = pow((age - 17) / 22, 1.5) * 0.25
        
        # 2. Fatigue-Age Synergy (Fatigue is deadlier for older players)
        synergy_factor = 1.0 + ( (age - 25) / 15 if age > 25 else 0 )
        fatigue_risk = (fatigue_index / 3.5) * 0.35 * synergy_factor
        
        # 3. Position-Aware Load Load (HSR impact varies by role)
        hsr_weight = {'Forward': 0.20, 'Midfielder': 0.15, 'Defender': 0.10, 'Goalkeeper': 0.02}[position]
        load_risk = ( (minutes_per_season / 4500) * 0.15 ) + ( (hsr / 250) * hsr_weight )
        
        # 4. Congestion Spike
        congestion_risk = (congestion - 1.0) * 0.10 if congestion > 1.0 else 0
        
        # 5. Clinical History (Recurrence is heavy)
        history_risk = (previous_injuries / 5) * 0.20 + (recurrence_flag * 0.25)

        raw_score = age_risk + fatigue_risk + load_risk + history_risk + congestion_risk
        
        # Noise + Sigmoid
        raw_score += np.random.normal(0, 0.03)
        # Shifted sigmoid for a harder, more professional classification
        injury_prob = float(1 / (1 + np.exp(-(raw_score - 0.45) * 8.5)))
        injury_prob = round(float(np.clip(injury_prob, 0.01, 0.99)), 3)

        # Binary label @ 0.50 threshold
        injury_label = 1 if injury_prob > 0.50 else 0

        # ── Injury type ──────────────────────────────────────────────────────
        if injury_label == 1:
            type_dist  = INJURY_PROBS[position]
            types      = list(type_dist.keys())
            weights    = list(type_dist.values())
            injury_type = str(np.random.choice(types, p=weights))
        else:
            injury_type = 'None'

        data.append({
            'League':              league,
            'Age':                 age,
            'Position':            position,
            'Seasons_Played':      seasons_played,
            'Matches_Per_Season':  matches_per_season,
            'Minutes_Per_Season':  int(minutes_per_season),
            'High_Speed_Runs':     round(hsr, 2),
            'Previous_Injuries':   previous_injuries,
            'Recurrence_Flag':     recurrence_flag,
            'Fatigue_Index':       fatigue_index,
            'Injury_Prob':         injury_prob,
            'Injury_Label':        injury_label,
            'Injury_Type':         injury_type,
        })

    df = pd.DataFrame(data)
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)

    print("\n✅ Dataset generated!")
    print(f"   Total players : {len(df)}")
    print(f"   Injured       : {df['Injury_Label'].sum()} ({df['Injury_Label'].mean()*100:.1f}%)")
    print(f"   Not injured   : {(df['Injury_Label']==0).sum()} ({(df['Injury_Label']==0).mean()*100:.1f}%)")
    print("\n   Injury type distribution:")
    print(df[df['Injury_Label']==1]['Injury_Type'].value_counts())
    print("\n   Risk probability distribution:")
    print(df['Injury_Prob'].describe())

if __name__ == '__main__':
    generate_dataset()
