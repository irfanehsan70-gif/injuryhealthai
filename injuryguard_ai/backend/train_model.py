import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def train_injury_model():
    data_path = 'c:\\Users\\97335\\.gemini\\antigravity\\scratch\\injuryguard_ai\\data\\semi_realistic_multi_league_injury_dataset_10000.csv'
    df = pd.read_csv(data_path)
    
    print("Checking for NaNs...")
    print(df.isnull().sum())
    
    # Drop rows with any NaN just in case
    df = df.dropna()
    
    # Feature columns
    cat_features = ['League', 'Position']
    num_features = ['Age', 'Seasons_Played', 'Matches_Per_Season', 'Minutes_Per_Season', 'High_Speed_Runs', 'Previous_Injuries', 'Recurrence_Flag', 'Fatigue_Index']
    
    X = df[cat_features + num_features]
    y = df['Injury_Type']
    
    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
        ])
    
    # Pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Prediction
    y_pred = model.predict(X_test)
    
    # Metrics
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'report': classification_report(y_test, y_pred, output_dict=True),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'feature_importance': model.named_steps['classifier'].feature_importances_.tolist(),
        # Get one-hot encoded feature names correctly
        'feature_names': num_features + list(model.named_steps['preprocessor'].transformers_[1][1].get_feature_names_out(cat_features))
    }
    
    # Save model and metrics
    model_path = 'c:\\Users\\97335\\.gemini\\antigravity\\scratch\\injuryguard_ai\\models'
    os.makedirs(model_path, exist_ok=True)
    
    with open(os.path.join(model_path, 'injury_model.pkl'), 'wb') as f:
        pickle.dump(model, f)
        
    with open(os.path.join(model_path, 'model_metrics.pkl'), 'wb') as f:
        pickle.dump(metrics, f)
        
    print(f"Model trained and saved with {metrics['accuracy']} accuracy.")

if __name__ == "__main__":
    train_injury_model()
