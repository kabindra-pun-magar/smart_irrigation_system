import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "model", "irrigation_model.pkl")

model = None

def load_model():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print("✅ Model Loaded Successfully")
        else:
            print(f"❌ Model not found at {MODEL_PATH}")
            model = None
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        model = None

    return model