# IoT-Enabled Smart Irrigation System with AI-Based Prediction

### 👨‍🌾 Overview

A real-time IoT + AI system that predicts irrigation needs using soil and environmental data.

### 🧩 Project Structure

- **data/**: soil + NASA weather data
- **model/**: AI training scripts and saved model
- **backend/**: Flask API
- **hardware/**: ESP32 code

### 🧠 Features

- AI-based irrigation prediction (Random Forest)
- Real-time IoT sensor integration (ESP32)
- Cloud-ready Flask backend API
- Uses real NASA POWER and Nepal soil data

### ⚙️ To Run

1. Train Model
   ```bash
   cd model
   python train_model.py
   ```
