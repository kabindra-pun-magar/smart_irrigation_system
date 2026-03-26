import React, { useState, useRef, useEffect } from "react";
import "../styles/AnimalDetection.css";

const BASE_URL = process.env.REACT_APP_DETECTION_API_URL || "http://127.0.0.1:5001";
const DETECTION_INTERVAL = 3000; // 3 seconds (recommended by backend)

export default function AnimalDetection() {
  const [isLive, setIsLive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  const [detectionStatus, setDetectionStatus] = useState({
    active: false,
    currentAnimal: null,
    confidence: 0,
    lastDetection: null,
    imageData: null
  });
  
  const [detections, setDetections] = useState([]);
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

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    uniqueAnimals: 0,
    todayDetections: 0,
    falseAlarms: 0
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const lastFrameTimeRef = useRef(Date.now());

  // Helper: Format animal name with emoji
  const formatAnimalName = (animal) => {
    const icons = {
      'cow': '🐄',
      'dog': '🐕',
      'sheep': '🐑',
      'horse': '🐎',
      'elephant': '🐘',
      'bird': '🐦',
      'cat': '🐱',
      'bear': '🐻',
      'zebra': '🦓',
      'giraffe': '🦒'
    };
    const animalLower = animal.toLowerCase();
    return `${icons[animalLower] || '🦊'} ${animal.charAt(0).toUpperCase() + animal.slice(1)}`;
  };

  // Add detection to history
  const addToHistory = (detection) => {
    const newDetection = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      animal: formatAnimalName(detection.class),
      confidence: detection.confidence,
      action: getDeterrentAction(detection.confidence),
      image: detectionStatus.imageData
    };
    setDetections(prev => [newDetection, ...prev.slice(0, 49)]); // Keep last 50
  };

  // Add alert
  const addAlert = (detection) => {
    const newAlert = {
      id: Date.now(),
      type: detection.confidence > 85 ? "critical" : "warning",
      message: `🚨 ${formatAnimalName(detection.class)} detected! Confidence: ${detection.confidence}%`,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Keep last 20
  };

  // Get deterrent action
  const getDeterrentAction = (confidence) => {
    const actions = [];
    if (settings.enableBuzzer) actions.push("Buzzer");
    if (settings.enableLight) actions.push("Light");
    if (settings.enableSpeaker) actions.push("Speaker");
    return actions.join(" + ") || "Alert";
  };

  // Trigger deterrent
  const triggerDeterrent = async (animal) => {
    try {
      await fetch(`${BASE_URL}/trigger_deterrent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          animal: animal,
          actions: {
            buzzer: settings.enableBuzzer,
            light: settings.enableLight,
            speaker: settings.enableSpeaker
          }
        })
      });
    } catch (error) {
      console.error("Failed to trigger deterrent:", error);
    }
  };

  // Optimized capture and detect function
  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    // Frame rate limiting
    const now = Date.now();
    if (now - lastFrameTimeRef.current < DETECTION_INTERVAL) return;
    lastFrameTimeRef.current = now;
    
    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Use smaller canvas for better performance
      const targetWidth = 640;
      const targetHeight = 480;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Draw and resize in one step
      context.drawImage(
        videoRef.current, 
        0, 0, 
        videoRef.current.videoWidth, 
        videoRef.current.videoHeight,
        0, 0, 
        targetWidth, 
        targetHeight
      );
      
      // Compress image to reduce payload size
      const imageData = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
      
      // Set timeout for detection API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${BASE_URL}/detect_animal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        console.error("Detection error:", result.error);
        return;
      }
      
      // Process detections
      if (result.detections && result.detections.length > 0) {
        const topDetection = result.detections[0]; // Already sorted by confidence
        
        if (topDetection.confidence >= settings.confidenceThreshold) {
          // Update UI
          setDetectionStatus({
            active: true,
            currentAnimal: formatAnimalName(topDetection.class),
            confidence: topDetection.confidence,
            lastDetection: new Date().toLocaleTimeString(),
            imageData: imageData
          });
          
          // Add to history
          addToHistory(topDetection);
          
          // Show alert
          addAlert(topDetection);
          
          // Trigger deterrent
          if (settings.enableBuzzer || settings.enableLight || settings.enableSpeaker) {
            triggerDeterrent(topDetection.class);
          }
        }
      } else {
        setDetectionStatus(prev => ({ ...prev, active: false, currentAnimal: null }));
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Detection request timeout');
      } else {
        console.error("Detection API error:", error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Start detection loop with proper cleanup
  const startDetectionLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (isLive && !isProcessing && videoRef.current && videoRef.current.readyState >= 2) {
        captureAndDetect();
      }
    }, DETECTION_INTERVAL);
  };

  // Start camera and detection
  const startDetection = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        setIsLive(true);
        setCameraError(null);
        
        // Add system message
        const newAlert = {
          id: Date.now(),
          type: "info",
          message: "Animal detection system activated",
          time: new Date().toLocaleTimeString(),
          read: false
        };
        setAlerts(prev => [newAlert, ...prev]);
        
        // Start detection loop
        startDetectionLoop();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
      setIsLive(false);
    }
  };

  const stopDetection = () => {
    // Stop detection loop
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsLive(false);
    setDetectionStatus({
      active: false,
      currentAnimal: null,
      confidence: 0,
      lastDetection: null,
      imageData: null
    });
    setIsProcessing(false);
  };

  const manualTriggerDeterrent = async (action) => {
    try {
      await fetch(`${BASE_URL}/trigger_deterrent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          animal: "Manual Trigger",
          actions: {
            buzzer: action === "buzzer",
            light: action === "light",
            speaker: action === "speaker"
          }
        })
      });
      
      // Add to detections
      const newDetection = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        animal: "🔧 Manual Trigger",
        confidence: 100,
        action: `${action.charAt(0).toUpperCase() + action.slice(1)} triggered`,
        image: null
      };
      setDetections(prev => [newDetection, ...prev]);
      
    } catch (error) {
      console.error("Manual trigger error:", error);
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const markAlertRead = (id) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const updateSettings = async () => {
    try {
      await fetch(`${BASE_URL}/update_detection_settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    }
  };

  // Fetch detection stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/detection_stats`);
        const data = await response.json();
        if (!data.error) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
            Real-time animal detection with YOLOv8 AI to protect your crops
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

      {/* Camera Error Message */}
      {cameraError && (
        <div className="camera-error glass-card-animal">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{cameraError}</span>
        </div>
      )}

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
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {detectionStatus.currentAnimal && (
                  <div className="detection-overlay">
                    <div className="detection-box">
                      <span className="animal-tag">{detectionStatus.currentAnimal}</span>
                      <span className="confidence-tag">{detectionStatus.confidence}%</span>
                    </div>
                  </div>
                )}
                <div className="feed-status">
                  <span className="live-badge">LIVE</span>
                  <span className="feed-resolution">640x480</span>
                  <span className="feed-fps">~3 FPS</span>
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
            <h3>🔊 Manual Deterrent</h3>
            <div className="deterrent-buttons">
              <button className="deterrent-btn buzzer" onClick={() => manualTriggerDeterrent("buzzer")}>
                🔔 Buzzer
              </button>
              <button className="deterrent-btn light" onClick={() => manualTriggerDeterrent("light")}>
                💡 Light
              </button>
              <button className="deterrent-btn speaker" onClick={() => manualTriggerDeterrent("speaker")}>
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
                      <button className="view-image-btn" onClick={() => window.open(detection.image)}>View</button>
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
    </div>
  );
}