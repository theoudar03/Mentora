from fastapi import FastAPI, HTTPException
import joblib
import numpy as np
import os
from schemas import StudentFeatures

app = FastAPI(title="SAFEHARBOR ML Service")

# Resolve absolute path to the model intelligently regardless of execution directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "rf_model.pkl")

# Load model globally on startup securely
try:
    model = joblib.load(MODEL_PATH)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

@app.post("/predict-risk")
def predict_risk(data: StudentFeatures):
    if model is None:
        raise HTTPException(status_code=500, detail="Machine learning model is currently unavailable on the server.")

    try:
        # Match exactly the 11 feature sequence trained on Random Forest
        features = np.array([[
            data.family_support_score,
            data.fee_payment_score,
            data.perceived_stress_score,
            data.anxiety_score,
            data.sleep_quality_score,
            data.loneliness_score,
            data.academic_pressure_score,
            data.screen_time_score,
            data.campus_belonging_score,
            data.cgpa_score,
            data.attendance_score
        ]])

        # Execute Random Forest prediction securely
        prediction = model.predict(features)[0]

        # Explicitly enforce float conversion preventing numpy JSON serialization errors
        return {
            "risk_score": float(prediction)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
