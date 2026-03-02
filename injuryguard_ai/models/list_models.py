import os
import time

model_dir = 'c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai/models'
for f in os.listdir(model_dir):
    path = os.path.join(model_dir, f)
    stats = os.stat(path)
    print(f"{f:25} | {time.ctime(stats.st_mtime)} | {stats.st_size} bytes")
