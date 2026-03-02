import pickle, numpy as np
MODEL_DIR = r'c:\Users\97335\.gemini\antigravity\scratch\injuryguard_ai\models'
with open(MODEL_DIR + '/binary_model.pkl','rb') as f: bm = pickle.load(f)
with open(MODEL_DIR + '/injury_model.pkl','rb') as f: tm = pickle.load(f)
with open(MODEL_DIR + '/encoders.pkl','rb') as f: enc = pickle.load(f)
le_type = enc['type']
classes = list(le_type.classes_)
print('Injury classes:', classes)

profiles = [
    ('Young low-risk GK',  0, 0, 19, 1,  8,  400,  5, 0, 0, 0.3),
    ('Veteran high-risk FW',1, 2, 32,12, 35, 2800,110, 3, 1, 2.1),
    ('Peak Midfielder',     0, 1, 25, 5, 30, 2200, 85, 1, 0, 1.5),
    ('Old fatigued FW',     1, 2, 35,15, 38, 3200,130, 4, 1, 2.8),
    ('Young fit DEF',       2, 0, 21, 2, 20, 1600, 45, 0, 0, 0.5),
    ('Mid-risk Defender',   2, 0, 28, 7, 28, 2100, 60, 2, 0, 1.8),
    ('Low load Sub',        3, 3, 23, 3, 12,  900, 30, 0, 0, 0.4),
    ('Very tired MID',      0, 1, 29, 8, 33, 2700, 95, 2, 1, 2.6),
    ('Low risk midfielder', 0, 1, 22, 2, 25, 1800, 70, 0, 0, 0.8),
]

for p in profiles:
    name, le, po, age, sea, mat, mps, hsr, pi, rf, fat = p
    row = np.array([[le, po, age, sea, mat, mps, hsr, pi, rf, fat,
                     mps/max(mat,1), hsr*fat, pi/max(sea,1), age*fat, rf*pi*fat]])
    risk = float(bm.predict_proba(row)[0][1])
    if risk > 0.3:
        probs = tm.predict_proba(row)[0]
        top = sorted(zip(classes, probs), key=lambda x: -x[1])[:3]
        tlabel = top[0][0]
    else:
        tlabel = 'None'
        top = []
    print(f'{name}: risk={risk*100:.1f}%  type={tlabel}')
    for inj, prob in top:
        print(f'    {inj}: {prob*100:.1f}%')
    print()
