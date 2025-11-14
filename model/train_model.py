import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import joblib
import matplotlib.pyplot as plt
import os
from xgboost import XGBClassifier

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
MODEL_PATH = os.path.join(BASE_DIR, "irrigation_model_best.pkl")

print("📁 Data Directory:", DATA_DIR)
print("💾 Model Save Path:", MODEL_PATH)

print("\n📥 Loading NASA dataset...")
weather_path = os.path.join(DATA_DIR, "daily_dataset.csv")
if not os.path.exists(weather_path):
    print("❌ Error: NASA daily_dataset.csv not found.")
    exit()

with open(weather_path, 'r') as f:
    lines = f.readlines()
skip = 0
for i, line in enumerate(lines):
    if "-END HEADER-" in line:
        skip = i + 1
        break

weather = pd.read_csv(weather_path, skiprows=skip)
if "GWETTOP" not in weather.columns:
    print("❌ Error: Expected NASA columns not found.")
    exit()

weather = weather[weather["GWETTOP"] != -999]
weather = weather.rename(columns={
    "GWETTOP": "soil_wetness",
    "RH2M": "humidity",
    "IMERG_PRECTOT": "rainfall",
    "WS10M_RANGE": "wind_speed",
    "ALLSKY_SFC_SW_DWN": "solar_radiation"
})
weather["date"] = pd.to_datetime(
    weather["YEAR"].astype(str) + weather["DOY"].astype(str), format="%Y%j"
).dt.normalize()
weather = weather[["date", "soil_wetness", "humidity", "rainfall", "wind_speed", "solar_radiation"]]
clean_weather_path = os.path.join(DATA_DIR, "cleaned_weather_data.csv")
weather.to_csv(clean_weather_path, index=False)
print("✅ Cleaned NASA data saved:", clean_weather_path)

print("\n📥 Loading soil chemistry dataset...")
soil_path = os.path.join(DATA_DIR, "soildataNepal.csv")
if not os.path.exists(soil_path):
    print("❌ Error: soildataNepal.csv not found.")
    exit()

soil = pd.read_csv(soil_path)
if "timestamp" not in soil.columns:
    print("❌ Error: 'timestamp' column missing.")
    exit()

soil["date"] = pd.to_datetime(soil["timestamp"]).dt.normalize()
weather["date"] = pd.to_datetime(weather["date"]).dt.normalize()
print("✅ Soil dataset loaded successfully!")

merged = pd.merge(soil, weather, on="date", how="left")
enriched_path = os.path.join(DATA_DIR, "enriched_dataset.csv")
merged.to_csv(enriched_path, index=False)
print("✅ Soil + NASA weather data merged successfully!")
print(f"📄 Merged dataset saved at: {enriched_path}")

print("\n🧠 Training Models...")

merged["irrigation_needed"] = np.where(
    (merged["soil_wetness"] < 0.3) & (merged["rainfall"] < 1.0),
    1, 0
)

features = ["nitrogen", "phosphorus", "potassium", "ph",
            "humidity", "rainfall", "wind_speed", "solar_radiation"]

merged["rainfall_last3"] = merged["rainfall"].rolling(3, min_periods=1).mean()
merged["humidity_temp_ratio"] = merged["humidity"] / (merged["solar_radiation"] + 1)
merged["ph_normalized"] = (merged["ph"] - merged["ph"].mean()) / merged["ph"].std()
features += ["rainfall_last3", "humidity_temp_ratio", "ph_normalized"]

X = merged[features].fillna(merged[features].mean())
y = merged["irrigation_needed"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

param_grid = {
    "n_estimators": [100, 200],
    "max_depth": [5, 10, None],
    "min_samples_split": [2, 5],
    "min_samples_leaf": [1, 2]
}

grid = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1
)
grid.fit(X_train, y_train)
rf_model = grid.best_estimator_
rf_acc = accuracy_score(y_test, rf_model.predict(X_test))

xgb_model = XGBClassifier(
    n_estimators=300,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss",
    use_label_encoder=False
)

xgb_model.set_params(**{
    "objective": "binary:logistic",
    "base_score": 0.5
})

xgb_model.fit(X_train, y_train)
xgb_acc = accuracy_score(y_test, xgb_model.predict(X_test))

print(f"🌳 Random Forest Accuracy: {rf_acc:.3f}")
print(f"⚡ XGBoost Accuracy: {xgb_acc:.3f}")

if xgb_acc >= rf_acc:
    best_model = xgb_model
    best_name = "XGBoost"
    best_acc = xgb_acc
else:
    best_model = rf_model
    best_name = "Random Forest"
    best_acc = rf_acc

joblib.dump(best_model, MODEL_PATH)
print(f"✅ Best Model: {best_name} (Accuracy: {best_acc:.3f})")
print(f"💾 Model saved successfully at: {MODEL_PATH}")

print("\n📊 Classification Report:")
print(classification_report(y_test, best_model.predict(X_test)))

importances = None
if best_name == "Random Forest":
    importances = best_model.feature_importances_
elif hasattr(best_model, "feature_importances_"):
    importances = best_model.feature_importances_

if importances is not None:
    feat_imp = pd.Series(importances, index=features).sort_values(ascending=False)
    feat_imp.plot(kind='bar', figsize=(8,4), title=f"{best_name} Feature Importance")
    plt.tight_layout()
    plt.show()

print("\n🎯 Training and comparison completed successfully!")
