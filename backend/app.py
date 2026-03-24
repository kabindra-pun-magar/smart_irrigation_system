import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ==============================
# GLOBAL STATE
# ==============================

latest_data = {
    "temperature": 25,
    "humidity": 50,
    "soil_moisture": 40,
    "irrigation_needed": 0,
    "mode": "AUTO"
}

manual_state = 0  # 0 = OFF, 1 = ON

# ==============================
# MODEL
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "..", "model", "irrigation_model.pkl"))

model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("✅ Model Loaded")
    except Exception as e:
        print("❌ Model Error:", e)

# ==============================
# ROUTES
# ==============================

@app.route('/')
def home():
    return jsonify({"status": "API running"})

@app.route('/latest', methods=['GET'])
def get_latest():
    return jsonify(latest_data)

# ✅ MODE SWITCH
@app.route('/set_mode', methods=['POST'])
def set_mode():
    global latest_data
    data = request.get_json()
    latest_data["mode"] = data.get("mode", "AUTO")
    return jsonify({"mode": latest_data["mode"]})

# ✅ MANUAL CONTROL (FIXED)
@app.route('/set_manual', methods=['POST'])
def set_manual():
    global manual_state
    data = request.get_json()

    manual_state = int(data.get("state", 0))

    print(f"🔧 Manual State Updated: {manual_state}")

    return jsonify({"manual_state": manual_state})

# ==============================
# PREDICT
# ==============================

@app.route('/predict', methods=['POST'])
def predict():
    global latest_data, manual_state

    data = request.get_json()

    latest_data["temperature"] = float(data.get("temperature", 25))
    latest_data["humidity"] = float(data.get("humidity", 50))
    latest_data["soil_moisture"] = float(data.get("soil_moisture", 40))

    # ==========================
    # LOGIC FIX
    # ==========================

    if latest_data["mode"] == "MANUAL":
        latest_data["irrigation_needed"] = manual_state

    else:  # AUTO
        if model:
            features = np.array([[0, 0, 0, 7, latest_data["humidity"], 0, 0, 0, 0, 0, 1]])
            latest_data["irrigation_needed"] = int(model.predict(features)[0])
        else:
            latest_data["irrigation_needed"] = 1 if latest_data["soil_moisture"] < 30 else 0

    return jsonify(latest_data)

# ==============================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)