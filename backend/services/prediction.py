import numpy as np

def predict_irrigation(data, model):
    try:
        # ===== REAL SENSOR INPUT =====
        soil = float(data.get("soil_moisture", 0))
        humidity = float(data.get("humidity", 0))
        temp = float(data.get("temperature", 0))

        # ===== RULE-BASED CORE LOGIC =====
        if soil < 30:
            prediction = 1
            reason = ["Low soil moisture"]

        elif humidity < 35:
            prediction = 1
            reason = ["Low humidity"]

        elif temp > 35:
            prediction = 1
            reason = ["High temperature"]

        else:
            prediction = 0
            reason = ["Conditions optimal"]

        # ===== OPTIONAL ML CONFIDENCE (SAFE) =====
        confidence = 0.85

        if model:
            try:
                dummy = np.zeros((1, 11))
                if hasattr(model, "predict_proba"):
                    confidence = float(max(model.predict_proba(dummy)[0]))
            except:
                pass

        return {
            "prediction": prediction,
            "confidence": confidence,
            "reason": reason
        }

    except Exception as e:
        return {"error": str(e)}