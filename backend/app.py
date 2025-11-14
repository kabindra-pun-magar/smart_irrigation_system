"""
Flask API for AI-based Smart Irrigation System
----------------------------------------------
Receives soil and environmental data in JSON format,
predicts whether irrigation is needed using the trained model,
and provides routes for dashboard and API testing.
"""

from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

# === Flask Setup ===
app = Flask(__name__)

# === Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "irrigation_model.pkl")
MODEL_PATH = os.path.normpath(MODEL_PATH)

# === Load Model ===
print(f"📦 Loading model from: {MODEL_PATH}")
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded successfully!")
    else:
        print("⚠️ Model file not found! Please check your model folder.")
except Exception as e:
    print("❌ Error loading model:", e)

# === Root route ===
@app.route('/')
def home():
    return jsonify({"status": "✅ API running", "model_loaded": model is not None})


# === Prediction route ===
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded properly"}), 500

    data = request.get_json(force=True)
    print(f"📥 Received input: {data}")

    try:
        features = np.array([[ 
            data.get('nitrogen', 0),
            data.get('phosphorus', 0),
            data.get('potassium', 0),
            data.get('ph', 7.0),
            data.get('humidity', 50),
            data.get('rainfall', 0),
            data.get('wind_speed', 2.0),
            data.get('solar_radiation', 300),
            data.get('rainfall_last3', 0),
            data.get('humidity_temp_ratio', 0.8),
            data.get('ph_normalized', 1.0)
        ]])

        prediction = model.predict(features)[0]
        result = {
            "irrigation_needed": int(prediction),
            "interpretation": "💧 Irrigation Required" if prediction == 1 else "🌿 No Irrigation Needed"
        }

        print(f"✅ Prediction: {result}")
        return jsonify(result)
    except Exception as e:
        print("❌ Prediction error:", e)
        return jsonify({"error": str(e)}), 400


# === Run Server ===
if __name__ == '__main__':
    print("🚀 Starting Flask server on http://127.0.0.1:5000 ...")
    app.run(debug=True, host='127.0.0.1', port=5000)
