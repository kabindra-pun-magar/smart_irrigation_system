"""
Flask API for AI-based Smart Irrigation System
----------------------------------------------
Receives sensor data from ESP32,
predicts irrigation need using trained ML model,
returns JSON response.
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
        print("⚠️ Model file not found!")
except Exception as e:
    print("❌ Error loading model:", e)

# === Root route (health check) ===
@app.route('/')
def home():
    return jsonify({
        "status": "API running",
        "model_loaded": model is not None
    })


# === Prediction route ===
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json(force=True)
        print("📥 Received:", data)

        # Extract values (with safe defaults)
        nitrogen = data.get('nitrogen', 0)
        phosphorus = data.get('phosphorus', 0)
        potassium = data.get('potassium', 0)
        ph = data.get('ph', 7.0)
        humidity = data.get('humidity', 50)
        rainfall = data.get('rainfall', 0)
        wind_speed = data.get('wind_speed', 2.0)
        solar_radiation = data.get('solar_radiation', 300)
        rainfall_last3 = data.get('rainfall_last3', 0)
        humidity_temp_ratio = data.get('humidity_temp_ratio', 0.8)
        ph_normalized = data.get('ph_normalized', 1.0)

        features = np.array([[
            nitrogen,
            phosphorus,
            potassium,
            ph,
            humidity,
            rainfall,
            wind_speed,
            solar_radiation,
            rainfall_last3,
            humidity_temp_ratio,
            ph_normalized
        ]])

        prediction = model.predict(features)[0]

        result = {
            "irrigation_needed": int(prediction),
            "interpretation": "💧 Irrigation Required"
            if prediction == 1
            else "🌿 No Irrigation Needed"
        }

        print("✅ Prediction:", result)
        return jsonify(result)

    except Exception as e:
        print("❌ Prediction error:", e)
        return jsonify({"error": str(e)}), 400


# === Run Server (IMPORTANT CHANGE HERE) ===
if __name__ == '__main__':
    print("🚀 Starting Flask server on network...")
    app.run(debug=False, host='0.0.0.0', port=5000)