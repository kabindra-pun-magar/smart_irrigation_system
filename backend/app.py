"""
Smart Irrigation System - Flask Backend
AUTO / MANUAL Mode Supported
"""

from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import os

app = Flask(__name__)

# ==============================
# GLOBAL SYSTEM STATE
# ==============================

latest_data = {
    "temperature": 0,
    "humidity": 0,
    "soil_moisture": 0,
    "irrigation_needed": 0,
    "mode": "AUTO"
}

mode = "AUTO"        # AUTO or MANUAL
manual_state = 0     # 0 = OFF, 1 = ON

# ==============================
# LOAD MODEL
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "irrigation_model.pkl")
MODEL_PATH = os.path.normpath(MODEL_PATH)

model = None

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded")
    else:
        print("⚠️ Model not found")
except Exception as e:
    print("❌ Model loading error:", e)


# ==============================
# ROUTES
# ==============================

@app.route('/')
def home():
    return jsonify({"status": "API running"})


@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")


@app.route('/latest')
def latest():
    return jsonify(latest_data)


@app.route('/set_mode', methods=['POST'])
def set_mode():
    global mode
    data = request.get_json()
    mode = data.get("mode", "AUTO")
    latest_data["mode"] = mode
    return jsonify({"mode": mode})


@app.route('/set_manual', methods=['POST'])
def set_manual():
    global manual_state
    data = request.get_json()
    manual_state = int(data.get("state", 0))
    return jsonify({"manual_state": manual_state})


@app.route('/predict', methods=['POST'])
def predict():

    global latest_data

    data = request.get_json(force=True)

    temperature = data.get("temperature", 0)
    humidity = data.get("humidity", 0)
    soil_moisture = data.get("soil_moisture", 0)

    nitrogen = data.get('nitrogen', 0)
    phosphorus = data.get('phosphorus', 0)
    potassium = data.get('potassium', 0)
    ph = data.get('ph', 7.0)
    rainfall = data.get('rainfall', 0)
    wind_speed = data.get('wind_speed', 0)
    solar_radiation = data.get('solar_radiation', 0)
    rainfall_last3 = data.get('rainfall_last3', 0)
    humidity_temp_ratio = data.get('humidity_temp_ratio', 0)
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

    ml_prediction = model.predict(features)[0] if model else 0

    if mode == "AUTO":
        irrigation = int(ml_prediction)
    else:
        irrigation = manual_state

    latest_data = {
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
        "irrigation_needed": irrigation,
        "mode": mode
    }

    return jsonify({
        "irrigation_needed": irrigation,
        "mode": mode
    })


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=False)
