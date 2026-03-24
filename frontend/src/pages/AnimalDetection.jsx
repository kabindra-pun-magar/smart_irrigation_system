import React, { useState, useRef, useEffect } from "react";
import "../styles/AnimalDetection.css";

export default function AnimalDetection() {
  const [isLive, setIsLive] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState({
    active: false,
    currentAnimal: null,
    confidence: 0,
    lastDetection: null
  });
  
  const [detections, setDetections] = useState([
    {
      id: 1,
      timestamp: "2024-03-25 10:30:25",
      animal: "Cow 🐄",
      confidence: 94,
      action: "Alert + Buzzer",
      image: null
    },
    {
      id: 2,
      timestamp: "2024-03-25 08:15:12",
      animal: "Dog 🐕",
      confidence: 87,
      action: "Alert + Light",
      image: null
    },
    {
      id: 3,
      timestamp: "2024-03-24 19:45:30",
      animal: "Goat 🐐",
      confidence: 91,
      action: "Alert + Buzzer",
      image: null
    },
    {
      id: 4,
      timestamp: "2024-03-24 06:20:15",
      animal: "Wild Boar 🐗",
      confidence: 78,
      action: "Alert + Buzzer + Light",
      image: null
    }
  ]);

  const [settings, setSettings] = useState({
    sensitivity: 70,
    confidenceThreshold: 75,
    enableBuzzer: true,
    enableLight: true,
    enableSpeaker: false,
    autoCapture: true,
    ignoreHumans: true,
    nightMode: false
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      message: "Cow detected in Field A!",
      time: "10:30 AM",
      read: false
    },
    {
      id: 2,
      type: "warning",
      message: "Dog detected near crops",
      time: "08:15 AM",
      read: false
    },
    {
      id: 3,
      type: "info",
      message: "Detection system activated",
      time: "07:00 AM",
      read: true
    }
  ]);

  const [stats, setStats] = useState({
    totalDetections: 47,
    uniqueAnimals: 5,
    todayDetections: 12,
    falseAlarms: 3
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Simulate live video feed
  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        // Simulate random detection
        const animals = ["Cow 🐄", "Goat 🐐", "Dog 🐕", "Wild Boar 🐗"];
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        const confidence = Math.floor(Math.random() * (95 - 70 + 1) + 70);
        
        setDetectionStatus({
          active: true,
          currentAnimal: randomAnimal,
          confidence: confidence,
          lastDetection: new Date().toLocaleTimeString()
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const startDetection = () => {
    setIsLive(true);
    // Add system message
    const newAlert = {
      id: Date.now(),
      type: "info",
      message: "Animal detection system activated",
      time: new Date().toLocaleTimeString(),
      read: false
    };
    setAlerts([newAlert, ...alerts]);
  };

  const stopDetection = () => {
    setIsLive(false);
    setDetectionStatus({
      active: false,
      currentAnimal: null,
      confidence: 0,
      lastDetection: null
    });
  };

  const triggerDeterrent = (action) => {
    alert(`${action} triggered!`);
    // Add to logs
    const newDetection = {
      id: detections.length + 1,
      timestamp: new Date().toLocaleString(),
      animal: "Manual Trigger",
      confidence: 100,
      action: action,
      image: null
    };
    setDetections([newDetection, ...detections]);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const markAlertRead = (id) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const updateSettings = () => {
    alert("Settings saved successfully!");
    // Backend integration will go here
  };

  return (
    <div className="animal-detection-page">
      {/* Glass Background Effect */}
      <div className="glass-bg-animal"></div>
      
      {/* Header Section */}
      <div className="page-header glass-card-animal">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🐄</span>
            Animal Detection System
            <span className="title-icon">📹</span>
          </h1>
          <p className="page-description">
            Real-time animal detection with automatic deterrent system to protect your crops
          </p>
        </div>
        
        {/* Control Buttons */}
        <div className="header-actions">
          {!isLive ? (
            <button className="start-detection-btn glass-btn-animal" onClick={startDetection}>
              <span className="btn-icon">▶️</span>
              Start Detection
            </button>
          ) : (
            <button className="stop-detection-btn glass-btn-animal" onClick={stopDetection}>
              <span className="btn-icon">⏹️</span>
              Stop Detection
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card glass-card-animal">
          <div className="stat-icon">🐾</div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalDetections}</div>
            <div className="stat-label">Total Detections</div>
          </div>
        </div>
        <div className="stat-card glass-card-animal">
          <div className="stat-icon">🦊</div>
          <div className="stat-info">
            <div className="stat-number">{stats.uniqueAnimals}</div>
            <div className="stat-label">Unique Animals</div>
          </div>
        </div>
        <div className="stat-card glass-card-animal">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-number">{stats.todayDetections}</div>
            <div className="stat-label">Today's Detections</div>
          </div>
        </div>
        <div className="stat-card glass-card-animal">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-number">{stats.falseAlarms}</div>
            <div className="stat-label">False Alarms</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="detection-grid">
        {/* Video Feed Section */}
        <div className="video-feed-section glass-card-animal">
          <h2 className="section-title">📹 Live Camera Feed</h2>
          <div className="video-container">
            {isLive ? (
              <div className="live-feed">
                <div className="camera-placeholder">
                  <div className="camera-icon">📷</div>
                  <p>Live Camera Feed</p>
                  {detectionStatus.currentAnimal && (
                    <div className="detection-overlay">
                      <div className="detection-box">
                        <span className="animal-tag">{detectionStatus.currentAnimal}</span>
                        <span className="confidence-tag">{detectionStatus.confidence}%</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="feed-status">
                  <span className="live-badge">LIVE</span>
                  <span className="feed-resolution">1280x720</span>
                  <span className="feed-fps">30 FPS</span>
                </div>
              </div>
            ) : (
              <div className="camera-offline">
                <div className="offline-icon">📹</div>
                <p>Camera Offline</p>
                <button className="start-camera-btn" onClick={startDetection}>
                  Start Detection
                </button>
              </div>
            )}
          </div>
          
          {detectionStatus.active && detectionStatus.currentAnimal && (
            <div className="current-detection">
              <div className="detection-header">
                <span className="detection-icon">⚠️</span>
                <span className="detection-title">Current Detection</span>
              </div>
              <div className="detection-details">
                <div className="animal-detail">
                  <span className="label">Animal:</span>
                  <span className="value">{detectionStatus.currentAnimal}</span>
                </div>
                <div className="confidence-detail">
                  <span className="label">Confidence:</span>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${detectionStatus.confidence}%` }}></div>
                    <span className="confidence-text">{detectionStatus.confidence}%</span>
                  </div>
                </div>
                <div className="time-detail">
                  <span className="label">Detected at:</span>
                  <span className="value">{detectionStatus.lastDetection}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Alerts */}
        <div className="alerts-section glass-card-animal">
          <div className="section-header">
            <h2 className="section-title">🚨 Real-time Alerts</h2>
            {alerts.length > 0 && (
              <button className="clear-alerts" onClick={clearAlerts}>
                Clear All
              </button>
            )}
          </div>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="no-alerts">
                <div className="no-alerts-icon">✅</div>
                <p>No new alerts</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type} ${!alert.read ? 'unread' : ''}`}>
                  <div className="alert-icon">
                    {alert.type === 'critical' && '🔴'}
                    {alert.type === 'warning' && '⚠️'}
                    {alert.type === 'info' && 'ℹ️'}
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                  {!alert.read && (
                    <button className="mark-read" onClick={() => markAlertRead(alert.id)}>✓</button>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Deterrent Controls */}
          <div className="deterrent-controls">
            <h3>🔊 Automatic Deterrent</h3>
            <div className="deterrent-buttons">
              <button className="deterrent-btn buzzer" onClick={() => triggerDeterrent("Buzzer")}>
                🔔 Buzzer
              </button>
              <button className="deterrent-btn light" onClick={() => triggerDeterrent("Light")}>
                💡 Light
              </button>
              <button className="deterrent-btn speaker" onClick={() => triggerDeterrent("Speaker")}>
                🔊 Speaker
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings and Controls */}
      <div className="settings-section glass-card-animal">
        <h2 className="section-title">⚙️ Detection Settings</h2>
        <div className="settings-grid">
          <div className="setting-item">
            <label>Detection Sensitivity</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sensitivity}
                onChange={(e) => setSettings({...settings, sensitivity: parseInt(e.target.value)})}
                className="sensitivity-slider"
              />
              <span className="sensitivity-value">{settings.sensitivity}%</span>
            </div>
            <div className="setting-hint">Higher = More sensitive</div>
          </div>
          
          <div className="setting-item">
            <label>Confidence Threshold</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                className="threshold-slider"
              />
              <span className="threshold-value">{settings.confidenceThreshold}%</span>
            </div>
            <div className="setting-hint">Minimum confidence to trigger alert</div>
          </div>
          
          <div className="setting-item">
            <label>Smart Filtering</label>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.ignoreHumans}
                  onChange={(e) => setSettings({...settings, ignoreHumans: e.target.checked})}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Ignore Humans</span>
              </label>
            </div>
          </div>
          
          <div className="setting-item">
            <label>Night Mode</label>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.nightMode}
                  onChange={(e) => setSettings({...settings, nightMode: e.target.checked})}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">IR Camera Support</span>
              </label>
            </div>
          </div>
          
          <div className="setting-item">
            <label>Auto Capture</label>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoCapture}
                  onChange={(e) => setSettings({...settings, autoCapture: e.target.checked})}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Save Images on Detection</span>
              </label>
            </div>
          </div>
          
          <div className="setting-item">
            <label>Deterrent Actions</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableBuzzer}
                  onChange={(e) => setSettings({...settings, enableBuzzer: e.target.checked})}
                />
                <span>Buzzer</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableLight}
                  onChange={(e) => setSettings({...settings, enableLight: e.target.checked})}
                />
                <span>Light</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableSpeaker}
                  onChange={(e) => setSettings({...settings, enableSpeaker: e.target.checked})}
                />
                <span>Speaker</span>
              </label>
            </div>
          </div>
        </div>
        
        <button className="save-settings-btn glass-btn-animal" onClick={updateSettings}>
          Save Settings
        </button>
      </div>

      {/* Detection History */}
      <div className="history-section glass-card-animal">
        <h2 className="section-title">📊 Detection Logs</h2>
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Animal Detected</th>
                <th>Confidence</th>
                <th>Action Taken</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {detections.map(detection => (
                <tr key={detection.id}>
                  <td>{detection.timestamp}</td>
                  <td className="animal-cell">{detection.animal}</td>
                  <td>
                    <div className="confidence-indicator">
                      <div className="confidence-badge" style={{ backgroundColor: detection.confidence > 85 ? '#4caf50' : detection.confidence > 70 ? '#ff9800' : '#f44336' }}>
                        {detection.confidence}%
                      </div>
                    </div>
                  </td>
                  <td>{detection.action}</td>
                  <td>
                    {detection.image ? (
                      <button className="view-image-btn">View</button>
                    ) : (
                      <span className="no-image">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Animal Statistics */}
      <div className="statistics-section glass-card-animal">
        <h2 className="section-title">📈 Animal Activity Statistics</h2>
        <div className="animal-stats">
          <div className="animal-stat-item">
            <span className="animal-emoji">🐄</span>
            <span className="animal-name">Cows</span>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: '45%' }}></div>
            </div>
            <span className="stat-count">21 detections</span>
          </div>
          <div className="animal-stat-item">
            <span className="animal-emoji">🐐</span>
            <span className="animal-name">Goats</span>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: '32%' }}></div>
            </div>
            <span className="stat-count">15 detections</span>
          </div>
          <div className="animal-stat-item">
            <span className="animal-emoji">🐕</span>
            <span className="animal-name">Dogs</span>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: '23%' }}></div>
            </div>
            <span className="stat-count">11 detections</span>
          </div>
          <div className="animal-stat-item">
            <span className="animal-emoji">🐗</span>
            <span className="animal-name">Wild Boars</span>
            <div className="stat-bar">
              <div className="stat-fill" style={{ width: '0%' }}></div>
            </div>
            <span className="stat-count">0 detections</span>
          </div>
        </div>
      </div>
    </div>
  );
}