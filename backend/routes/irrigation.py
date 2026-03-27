from flask import Blueprint, request, jsonify
from services.prediction import predict_irrigation
import time

irrigation_bp = Blueprint("irrigation", __name__)

latest_data = {
    "temperature": 0,
    "humidity": 0,
    "soil_moisture": 0,
    "irrigation_needed": 0,
    "confidence": None,
    "reason": [],
    "mode": "AUTO",
    "timestamp": 0
}

manual_state = 0

@irrigation_bp.route('/latest', methods=['GET'])
def get_latest():
    return jsonify(latest_data)

@irrigation_bp.route('/set_mode', methods=['POST'])
def set_mode():
    data = request.get_json()
    latest_data["mode"] = data.get("mode", "AUTO")
    return jsonify({"mode": latest_data["mode"]})

@irrigation_bp.route('/set_manual', methods=['POST'])
def set_manual():
    global manual_state
    data = request.get_json()
    manual_state = int(data.get("state", 0))
    return jsonify({"manual_state": manual_state})

def handle_prediction(data, model):
    global latest_data, manual_state

    try:
        temp = float(data.get("temperature", 0))
        hum = float(data.get("humidity", 0))
        soil = float(data.get("soil_moisture", 0))
    except:
        return jsonify({"error": "Invalid sensor data"}), 400

    latest_data["temperature"] = temp
    latest_data["humidity"] = hum
    latest_data["soil_moisture"] = soil
    latest_data["timestamp"] = time.time()

    if latest_data["mode"] == "MANUAL":
        latest_data["irrigation_needed"] = manual_state
        latest_data["confidence"] = None
        latest_data["reason"] = ["Manual mode"]
        return latest_data

    result = predict_irrigation(data, model)

    if "error" in result:
        return result

    latest_data["irrigation_needed"] = result["prediction"]
    latest_data["confidence"] = result["confidence"]
    latest_data["reason"] = result["reason"]

    return latest_data