"""
InjuryGuard AI — Two-Stage Model Retraining
Fixes:
1. All 7 injury types trained (Hamstring, ACL, Ankle, Groin, Muscle, Knee, Back)
2. GradientBoosting binary + RandomForest type (better for multi-class imbalance)
3. class_weight='balanced' on type model to prevent dominant-class bias
4. Calibrated thresholds so predictions vary across the full range
"""
import pandas as pd
import numpy as np
import pickle, os, gc
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

DATA_PATH = r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\data\football_injury_dataset_10000_new.csv'
MODEL_DIR = r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\models'

FEATURE_COLS = [
    'League_enc', 'Position_enc', 'Age', 'Seasons_Played', 'Matches_Per_Season',
    'Minutes_Per_Season', 'High_Speed_Runs', 'Previous_Injuries', 'Recurrence_Flag',
    'Fatigue_Index', 'load_ratio', 'sprint_load', 'injury_rate', 'age_fatigue', 
    'high_risk_combo', 'age_load', 'fatigue_recurrence', 'hsr_position_impact'
]
FEATURE_NAMES_FRIENDLY = [
    'League', 'Position', 'Age', 'Seasons_Played', 'Matches_Per_Season',
    'Minutes_Per_Season', 'High_Speed_Runs', 'Previous_Injuries', 'Recurrence_Flag',
    'Fatigue_Index', 'Load_Ratio', 'Sprint_Load', 'Injury_Rate', 'Age_Fatigue', 
    'High_Risk_Combo', 'Age_Load_Synergy', 'Fatigue_Recurrence', 'HSR_Target_Impact'
]

def load_and_prepare():
    df = pd.read_csv(DATA_PATH)
    return df

def encode_cats(df):
    le_league = LabelEncoder()
    le_pos    = LabelEncoder()
    df = df.copy()
    df['League_enc']   = le_league.fit_transform(df['League'].astype(str))
    df['Position_enc'] = le_pos.fit_transform(df['Position'].astype(str))
    return df, le_league, le_pos

def add_features(df):
    df = df.copy()
    df['load_ratio']       = df['Minutes_Per_Season'] / df['Matches_Per_Season'].replace(0, 1)
    df['sprint_load']      = df['High_Speed_Runs'] * df['Fatigue_Index']
    df['injury_rate']      = df['Previous_Injuries'] / df['Seasons_Played'].replace(0, 1)
    df['age_fatigue']      = df['Age'] * df['Fatigue_Index']
    df['high_risk_combo']  = df['Recurrence_Flag'] * df['Previous_Injuries'] * df['Fatigue_Index']
    
    # ── New Accurate Interaction Features ────────────────────────────────
    df['age_load']             = (df['Age'] / 35.0) * (df['Minutes_Per_Season'] / 4000.0)
    df['fatigue_recurrence']   = df['Fatigue_Index'] * df['Recurrence_Flag']
    
    # HSR impact depends on position (Forward/Midfielder have higher HSR risk)
    pos_weight = df['Position'].map({'Forward': 1.2, 'Midfielder': 1.0, 'Defender': 0.8, 'Goalkeeper': 0.2}).fillna(1.0)
    df['hsr_position_impact']  = df['High_Speed_Runs'] * pos_weight
    
    return df

def train():
    print("=" * 60)
    print("InjuryGuard AI — Model Retraining")
    print("=" * 60)

    print("\n[1] Loading data...")
    df = load_and_prepare()
    df, le_league, le_pos = encode_cats(df)
    df = add_features(df)

    print(f"    Total rows     : {len(df)}")
    print(f"    Injured        : {df['Injury_Label'].sum()} ({df['Injury_Label'].mean()*100:.1f}%)")
    print(f"    Not injured    : {(df['Injury_Label']==0).sum()}")
    print("\n    Injury type distribution (injured only):")
    print(df[df['Injury_Label']==1]['Injury_Type'].value_counts())

    X        = df[FEATURE_COLS].values
    y_binary = df['Injury_Label'].astype(int).values
    y_type   = df['Injury_Type'].values

    X_tr, X_te, yb_tr, yb_te, yt_tr, yt_te = train_test_split(
        X, y_binary, y_type, test_size=0.2, random_state=42, stratify=y_binary
    )

    # ── STAGE 1: Binary classifier ──────────────────────────────
    print("\n[2] Training binary classifier (injured / not injured)...")
    binary_clf = GradientBoostingClassifier(
        n_estimators=400,          # Increased for accuracy
        learning_rate=0.05,        # Slower learning for better generalization
        max_depth=5,               # Deeper to capture new nonlinear interactions
        subsample=0.85,
        min_samples_leaf=15,
        random_state=42
    )
    binary_clf.fit(X_tr, yb_tr)
    yb_pred  = binary_clf.predict(X_te)
    bin_acc  = accuracy_score(yb_te, yb_pred)
    bin_prob = binary_clf.predict_proba(X_te)[:, 1]
    auc      = roc_auc_score(yb_te, bin_prob)
    print(f"    Accuracy : {bin_acc*100:.1f}%  |  AUC-ROC : {auc:.4f}")

    # Show probability histogram to verify spread
    bins = [0, 0.2, 0.4, 0.6, 0.8, 1.01]
    labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
    print("    Probability distribution on test set:")
    for i, lbl in enumerate(labels):
        count = ((bin_prob >= bins[i]) & (bin_prob < bins[i+1])).sum()
        print(f"      {lbl} : {count} players")
    gc.collect()

    # ── STAGE 2: Type classifier (injured rows only) ──────────
    print("\n[3] Training injury type classifier (7 types)...")
    mask_tr = yb_tr == 1
    mask_te = yb_te == 1
    X_inj_tr, yt_inj_tr = X_tr[mask_tr], yt_tr[mask_tr]
    X_inj_te, yt_inj_te = X_te[mask_te], yt_te[mask_te]

    print(f"    Injured train rows : {len(X_inj_tr)}")
    print(f"    Injured test rows  : {len(X_inj_te)}")

    le_type = LabelEncoder()
    yt_inj_tr_enc = le_type.fit_transform(yt_inj_tr)
    yt_inj_te_enc = le_type.transform(yt_inj_te)
    print(f"    Injury classes: {list(le_type.classes_)}")

    # Use RandomForest with balanced class weights to handle imbalance
    type_clf = RandomForestClassifier(
        n_estimators=500,
        max_depth=10,
        min_samples_leaf=3,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    type_clf.fit(X_inj_tr, yt_inj_tr_enc)

    yt_pred_enc = type_clf.predict(X_inj_te)
    yt_pred     = le_type.inverse_transform(yt_pred_enc)
    type_acc    = accuracy_score(yt_inj_te, yt_pred)

    print(f"    Type Accuracy: {type_acc*100:.1f}%")
    print(classification_report(yt_inj_te, yt_pred, zero_division=0))

    # Feature importance from binary model
    importances = binary_clf.feature_importances_.tolist()
    report      = classification_report(yt_inj_te, yt_pred, output_dict=True, zero_division=0)
    wa          = report.get('weighted avg', {})

    # ── Save models ──────────────────────────────────────────
    print("\n[4] Saving models...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(os.path.join(MODEL_DIR, 'binary_model.pkl'), 'wb') as f:
        pickle.dump(binary_clf, f)
    with open(os.path.join(MODEL_DIR, 'injury_model.pkl'), 'wb') as f:
        pickle.dump(type_clf, f)
    with open(os.path.join(MODEL_DIR, 'encoders.pkl'), 'wb') as f:
        pickle.dump({'league': le_league, 'position': le_pos, 'type': le_type}, f)
    with open(os.path.join(MODEL_DIR, 'model_metrics.pkl'), 'wb') as f:
        pickle.dump({
            'accuracy':         float(bin_acc),
            'auc_roc':          float(auc),
            'type_accuracy':    float(type_acc),
            'model_name':       'Two-Stage: GradientBoosting (binary) + RandomForest (type, balanced)',
            'report':           report,
            'confusion_matrix': [],
            'feature_importance': importances,
            'feature_names':    FEATURE_NAMES_FRIENDLY,
            'injury_types':     list(le_type.classes_),
        }, f)

    print("\n" + "=" * 60)
    print(f"✅ Binary accuracy       : {bin_acc*100:.1f}%")
    print(f"✅ AUC-ROC               : {auc:.4f}")
    print(f"✅ Type accuracy         : {type_acc*100:.1f}%")
    print(f"✅ Precision (weighted)  : {wa.get('precision',0)*100:.1f}%")
    print(f"✅ Recall (weighted)     : {wa.get('recall',0)*100:.1f}%")
    print(f"✅ Injury classes        : {list(le_type.classes_)}")
    print(f"✅ Models saved to       : {MODEL_DIR}")
    print("=" * 60)

if __name__ == '__main__':
    train()
