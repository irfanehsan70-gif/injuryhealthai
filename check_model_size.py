import pickle
import numpy as np
import os

MODEL_DIR = r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\models'
BINARY_MODEL_PATH = os.path.join(MODEL_DIR, 'binary_model.pkl')

try:
    with open(BINARY_MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print(f"Model type: {type(model)}")
    if hasattr(model, 'n_features_in_'):
        print(f"Features expected: {model.n_features_in_}")
    elif hasattr(model, 'feature_names_in_'):
        print(f"Features expected: {len(model.feature_names_in_)}")
    else:
         # Try to predict with a dummy row
         row = np.zeros((1, 18))
         try:
             model.predict(row)
             print("Model ACCEPTS 18 features")
         except ValueError as e:
             print(f"FAIL with 18: {e}")
             row_15 = np.zeros((1, 15))
             try:
                 model.predict(row_15)
                 print("Model ACCEPTS 15 features")
             except ValueError as e2:
                 print(f"FAIL with 15: {e2}")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
