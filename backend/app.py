from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.irrigation import irrigation_bp, handle_prediction
from models.model_loader import load_model

app = Flask(__name__)
CORS(app)

# Load ML model
model = load_model()

# Register routes
app.register_blueprint(irrigation_bp)

@app.route('/')
def home():
    return jsonify({"status": "Backend running"})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    result = handle_prediction(data, model)

    return jsonify({
        "status": "updated",
        "data": result
    })

if __name__ == "__main__":
    print("🚀 Server running on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)