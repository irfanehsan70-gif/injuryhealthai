import pandas as pd
df = pd.read_csv(r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\data\football_injury_dataset_10000_new.csv')
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())
# Find a column that indicates injury
for col in df.columns:
    if 'injury' in col.lower() or 'label' in col.lower() or 'type' in col.lower():
        print(f"\n{col}:")
        print(df[col].value_counts(dropna=False).head(10))
