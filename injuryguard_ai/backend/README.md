# ⚙️ InjuryGuard AI | Neural Core (Backend)

The **Neural Core** is the intelligence layer of the InjuryGuard AI platform. It handles authentication, data persistence, and executes the multi-stage machine learning pipeline.

## 🛠 Tech Stack
- **Flask** (Python API)
- **MongoDB Atlas** (NoSQL Database)
- **Scikit-Learn** (ML Pipeline)
- **JWT & Bcrypt** (Security Protocol)

## 🧠 ML Pipeline Architecture
The backend implements a **Two-Stage Inference Pipeline**:
1. **Stage 1: Binary Risk Assessment**: Predicts the probability of injury (0-100%) using a calibrated RandomForest model.
2. **Stage 2: Morphological Classification**: For high-risk profiles, it predicts the specific *type* of injury (Hamstring, Knee, Ankle, etc.).

## 📡 API Endpoints (Core)
- `POST /api/login`: Secure session initialization.
- `POST /api/register`: Multi-role user onboarding.
- `POST /api/predict`: Real-time diagnostic inference.
- `POST /api/upload_team`: Batch CSV processing for squad diagnostics.
- `GET /api/health`: System status pulse check.

## 🚀 Development
```bash
# Setup environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Run server
python app.py
```

## 🔐 Database Integration
Ensure your IP is whitelisted in **MongoDB Atlas**. The system connects via the `MONGO_URI` defined in `app.py`.
