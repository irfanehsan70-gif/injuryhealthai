import pandas as pd
import os

path1 = 'c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai/data/football_injury_dataset_10000_new.csv'
path2 = 'c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai/data/semi_realistic_multi_league_injury_dataset_10000.csv'

if os.path.exists(path1):
    df1 = pd.read_csv(path1, nrows=0)
    print(f"Path1 ({os.path.basename(path1)}) columns:")
    for col in df1.columns:
        print(f" - {col}")

if os.path.exists(path2):
    df2 = pd.read_csv(path2, nrows=0)
    print(f"\nPath2 ({os.path.basename(path2)}) columns:")
    for col in df2.columns:
        print(f" - {col}")
