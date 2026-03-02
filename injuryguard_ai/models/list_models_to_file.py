import os
import time

model_dir = 'c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai/models'
with open('c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai/models/listing.txt', 'w') as out:
    for f in os.listdir(model_dir):
        path = os.path.join(model_dir, f)
        stats = os.stat(path)
        out.write(f"{f} | {time.ctime(stats.st_mtime)} | {stats.st_size} bytes\n")
