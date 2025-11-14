import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000"
PREDICT_URL = f"{BASE_URL}/predict"

# === Test Input Data ===
data = {
    "nitrogen": 25,
    "phosphorus": 18,
    "potassium": 40,
    "ph": 6.7,
    "humidity": 72,
    "rainfall": 5.3,
    "wind_speed": 3.1,
    "solar_radiation": 420,
    "rainfall_last3": 4.5,
    "humidity_temp_ratio": 0.85,
    "ph_normalized": 0.96
}

print("🔍 Checking if Flask API is running...")

try:
    # Check if API is alive before sending data
    response = requests.get(BASE_URL, timeout=5)
    if response.status_code == 200:
        print("✅ Flask API is active!")
        print("Server status:", response.json())
    else:
        print("⚠️ Flask server responded incorrectly:", response.text)
        exit()
except requests.exceptions.ConnectionError:
    print("❌ Flask server is NOT running.")
    print("👉 Please start it first using: python app.py")
    exit()
except Exception as e:
    print("⚠️ Error checking server:", e)
    exit()

# Wait a bit then send data
time.sleep(1)

try:
    print("\n📤 Sending test data to /predict ...")
    response = requests.post(PREDICT_URL, json=data, timeout=10)
    if response.status_code == 200:
        print("✅ Prediction Successful!\n")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"⚠️ Server returned {response.status_code}: {response.text}")
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to Flask API.")
except requests.exceptions.Timeout:
    print("⚠️ Request timed out.")
except Exception as e:
    print("⚠️ Unexpected error:", e)
