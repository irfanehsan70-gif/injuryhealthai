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

def train_new_injury_model():
    # Path to the user-provided dataset
    data_path = 'c:\\Users\\97335\\.gemini\\antigravity\\scratch\\injuryguard_ai\\data\\football_injury_dataset_10000_new.csv'
    
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    print("Original Columns:", df.columns.tolist())
    
    # Mapping user columns to expected columns
    column_mapping = {
        'league': 'League',
        'age': 'Age',
        'position': 'Position',
        'seasons_played': 'Seasons_Played',
        'matches_per_season': 'Matches_Per_Season',
        'minutes_per_season': 'Minutes_Per_Season',
        'high_speed_runs_per_season': 'High_Speed_Runs',
        'previous_injuries': 'Previous_Injuries',
        'recurrence_flag': 'Recurrence_Flag',
        'fatigue_index': 'Fatigue_Index',
        'injury_type': 'Injury_Type'
    }
    
    df = df.rename(columns=column_mapping)
    print("Renamed Columns:", df.columns.tolist())
    
    # Drop rows with any NaN
    df = df.dropna(subset=['League', 'Position', 'Age', 'Injury_Type'])
    
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
    print("Training model on new dataset...")
    model.fit(X_train, y_train)
    
    # Prediction
    y_pred = model.predict(X_test)
    
    # One-hot encoded feature names correctly
    onehot_features = list(model.named_steps['preprocessor'].transformers_[1][1].get_feature_names_out(cat_features))
    feature_names = num_features + onehot_features
    
    # Metrics
    metrics = {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'report': classification_report(y_test, y_pred, output_dict=True),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        'feature_importance': model.named_steps['classifier'].feature_importances_.tolist(),
        'feature_names': feature_names
    }
    
    # Save model and metrics
    model_dir = 'c:\\Users\\97335\\.gemini\\antigravity\\scratch\\injuryguard_ai\\models'
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, 'injury_model.pkl')
    metrics_path = os.path.join(model_dir, 'model_metrics.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
        
    with open(metrics_path, 'wb') as f:
        pickle.dump(metrics, f)
        
    print(f"Model successfully trained and saved!")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Model saved to: {model_path}")
    print(f"Metrics saved to: {metrics_path}")

if __name__ == "__main__":
    train_new_injury_model()
