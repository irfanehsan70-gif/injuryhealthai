import urllib.request
import json

data = json.loads(urllib.request.urlopen(
    urllib.request.Request(
        'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json',
        headers={'User-Agent': 'x'}
    )
).read())

base = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

# Check all exercises, print names + image count
checks = [
    'Seated Band Hamstring Curl',
    'Prone Manual Hamstring',
    'Platform Hamstring Slides',
    'Push Up to Side Plank',
    'Adductor',
    'Adductor/Groin',
    'Front Box Jump',
    'Lateral Box Jump',
    'Balance Board',
    'Single-Leg Hop Progression',
    'Single Leg Glute Bridge',
    'Single Leg Butt Kick',
]

for name in checks:
    match = [e for e in data if e['name'].lower() == name.lower()]
    if match:
        imgs = match[0].get('images', [])
        img0 = base + '/' + imgs[0] if imgs else 'none'
        print('FOUND:', match[0]['name'], '| frames:', len(imgs))
        print('  img0:', img0)
    else:
        print('MISSING:', name)
