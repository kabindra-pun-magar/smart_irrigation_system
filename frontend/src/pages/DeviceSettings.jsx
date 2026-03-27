import React, { useState, useEffect } from "react";
import "../styles/DeviceSettings.css";

export default function DeviceSettings() {
  const [activeTab, setActiveTab] = useState('wifi');
  const [deviceStatus, setDeviceStatus] = useState({
    online: true,
    lastSync: new Date().toLocaleString(),
    ipAddress: "192.168.1.100",
    firmware: "v2.1.0",
    uptime: "3d 12h 30m"
  });

  const [wifiConfig, setWifiConfig] = useState({
    ssid: "SmartFarm_WiFi",
    password: "********",
    signalStrength: 85
  });

  const [sensorCalibration, setSensorCalibration] = useState({
    soilMoistureMin: 30,
    soilMoistureMax: 80,
    temperatureMin: 15,
    temperatureMax: 35,
    humidityMin: 40,
    humidityMax: 85
  });

  const [irrigationSchedule, setIrrigationSchedule] = useState([
    { id: 1, enabled: true, time: "06:00", duration: 10, days: ["Mon", "Wed", "Fri"] },
    { id: 2, enabled: false, time: "18:00", duration: 15, days: ["Tue", "Thu", "Sat"] }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", message: "Soil moisture below 30%", time: "10:30 AM", read: false },
    { id: 2, type: "info", message: "Device connected successfully", time: "08:00 AM", read: true },
    { id: 3, type: "success", message: "Irrigation cycle completed", time: "Yesterday", read: true }
  ]);

  const [aiControl, setAiControl] = useState({
    enabled: false,
    confidence: 0,
    lastDecision: "No AI decisions yet",
    overrideMode: "auto"
  });

  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    time: "12:00",
    duration: 10,
    days: []
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleWifiSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://10.0.11.114:5000/set_wifi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ssid: wifiConfig.ssid,
          password: wifiConfig.password
        })
      });

      if (response.ok) {
        alert("WiFi configuration sent to device successfully!");
      } else {
        alert("Failed to send WiFi configuration to device");
      }

    } catch (err) {
      console.error("Error sending WiFi config:", err);
      alert("Failed to connect to server. Please check if the backend is running.");
    }
  };

  const handleCalibrationUpdate = () => {
    alert("Sensor calibration updated!");
    // Backend integration will go here
  };

  const addSchedule = () => {
    const newId = irrigationSchedule.length + 1;
    setIrrigationSchedule([...irrigationSchedule, { ...newSchedule, id: newId, enabled: true }]);
    setShowNewSchedule(false);
    setNewSchedule({ time: "12:00", duration: 10, days: [] });
  };

  const toggleSchedule = (id) => {
    setIrrigationSchedule(irrigationSchedule.map(schedule =>
      schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
    ));
  };

  const deleteSchedule = (id) => {
    setIrrigationSchedule(irrigationSchedule.filter(schedule => schedule.id !== id));
  };

  const syncDevice = () => {
    alert("Syncing device...");
    setDeviceStatus({ ...deviceStatus, lastSync: new Date().toLocaleString() });
  };

  const markAlertAsRead = (id) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const toggleAIControl = () => {
    setAiControl({ ...aiControl, enabled: !aiControl.enabled });
  };

  return (
    <div className="device-settings-page">
      {/* Glass Background Effect */}
      <div className="glass-bg-purple"></div>
      
      {/* Header Section */}
      <div className="page-header glass-card-purple">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">⚙️</span>
            Device Settings
            <span className="title-icon">🤖</span>
          </h1>
          <p className="page-description">
            Configure, monitor, and control your IoT irrigation device
          </p>
        </div>
        
        {/* Device Status */}
        <div className="device-status-header">
          <div className={`status-indicator ${deviceStatus.online ? 'online' : 'offline'}`}>
            {deviceStatus.online ? '● Online' : '○ Offline'}
          </div>
          <button className="sync-btn glass-btn-purple" onClick={syncDevice}>
            <span className="btn-icon">🔄</span>
            Sync Device
          </button>
        </div>
      </div>

      {/* Device Info Cards */}
      <div className="device-info-cards">
        <div className="info-card glass-card-purple">
          <div className="info-icon">📡</div>
          <div className="info-content">
            <div className="info-label">IP Address</div>
            <div className="info-value">{deviceStatus.ipAddress}</div>
          </div>
        </div>
        <div className="info-card glass-card-purple">
          <div className="info-icon">🕐</div>
          <div className="info-content">
            <div className="info-label">Last Sync</div>
            <div className="info-value">{deviceStatus.lastSync}</div>
          </div>
        </div>
        <div className="info-card glass-card-purple">
          <div className="info-icon">📦</div>
          <div className="info-content">
            <div className="info-label">Firmware</div>
            <div className="info-value">{deviceStatus.firmware}</div>
          </div>
        </div>
        <div className="info-card glass-card-purple">
          <div className="info-icon">⏱️</div>
          <div className="info-content">
            <div className="info-label">Uptime</div>
            <div className="info-value">{deviceStatus.uptime}</div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs glass-card-purple">
        <button 
          className={`tab-btn-purple ${activeTab === 'wifi' ? 'active' : ''}`}
          onClick={() => setActiveTab('wifi')}
        >
          <span className="tab-icon">📶</span>
          WiFi Config
        </button>
        <button 
          className={`tab-btn-purple ${activeTab === 'calibration' ? 'active' : ''}`}
          onClick={() => setActiveTab('calibration')}
        >
          <span className="tab-icon">📊</span>
          Calibration
        </button>
        <button 
          className={`tab-btn-purple ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <span className="tab-icon">⏰</span>
          Irrigation Schedule
        </button>
        <button 
          className={`tab-btn-purple ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <span className="tab-icon">🔔</span>
          Alerts
        </button>
        <button 
          className={`tab-btn-purple ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <span className="tab-icon">🧠</span>
          AI Control
        </button>
      </div>

      {/* WiFi Configuration Tab */}
      {activeTab === 'wifi' && (
        <div className="config-section glass-card-purple">
          <h2 className="section-title">🌐 WiFi Configuration</h2>
          <p className="section-description">Configure your device to connect to WiFi network</p>
          
          <form onSubmit={handleWifiSubmit} className="wifi-form">
            <div className="form-group">
              <label>Network SSID</label>
              <input
                type="text"
                value={wifiConfig.ssid}
                onChange={(e) => setWifiConfig({...wifiConfig, ssid: e.target.value})}
                placeholder="Enter WiFi name"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={wifiConfig.password}
                onChange={(e) => setWifiConfig({...wifiConfig, password: e.target.value})}
                placeholder="Enter WiFi password"
                className="form-input"
              />
            </div>
            
            <div className="signal-strength">
              <label>Signal Strength</label>
              <div className="signal-bars">
                <div className={`bar ${wifiConfig.signalStrength >= 20 ? 'active' : ''}`}></div>
                <div className={`bar ${wifiConfig.signalStrength >= 40 ? 'active' : ''}`}></div>
                <div className={`bar ${wifiConfig.signalStrength >= 60 ? 'active' : ''}`}></div>
                <div className={`bar ${wifiConfig.signalStrength >= 80 ? 'active' : ''}`}></div>
                <span className="signal-percent">{wifiConfig.signalStrength}%</span>
              </div>
            </div>
            
            <button type="submit" className="submit-btn glass-btn-purple">
              Send to Device
            </button>
          </form>
        </div>
      )}

      {/* Sensor Calibration Tab */}
      {activeTab === 'calibration' && (
        <div className="config-section glass-card-purple">
          <h2 className="section-title">📊 Sensor Calibration</h2>
          <p className="section-description">Adjust sensor thresholds for your specific crop and region</p>
          
          <div className="calibration-grid">
            <div className="calibration-item">
              <label>Soil Moisture Range (%)</label>
              <div className="range-control">
                <input
                  type="number"
                  value={sensorCalibration.soilMoistureMin}
                  onChange={(e) => setSensorCalibration({...sensorCalibration, soilMoistureMin: parseInt(e.target.value)})}
                  className="range-input"
                />
                <span>to</span>
                <input
                  type="number"
                  value={sensorCalibration.soilMoistureMax}
                  onChange={(e) => setSensorCalibration({...sensorCalibration, soilMoistureMax: parseInt(e.target.value)})}
                  className="range-input"
                />
              </div>
              <div className="range-hint">Optimal: 30-80%</div>
            </div>
            
            <div className="calibration-item">
              <label>Temperature Range (°C)</label>
              <div className="range-control">
                <input
                  type="number"
                  value={sensorCalibration.temperatureMin}
                  onChange={(e) => setSensorCalibration({...sensorCalibration, temperatureMin: parseInt(e.target.value)})}
                  className="range-input"
                />
                <span>to</span>
                <input
                  type="number"
                  value={sensorCalibration.temperatureMax}
                  onChange={(e) => setSensorCalibration({...sensorCalibration, temperatureMax: parseInt(e.target.value)})}
                  className="range-input"
                />
              </div>
              <div className="range-hint">Optimal: 15-35°C</div>
            </div>
            
            <div className="calibration-item">
              <label>Humidity Range (%)</label>
              <div className="range-control">
                <input
                  type="number"
                  value={sensorCalibration.humidityMin}
                  onChange={(e) => setSensorCalibration({...sensorCalibration, humidityMin: parseInt(e.target.value)})}
                  className="range-input"
                />
                <span>to</span>
                <input
                  type="number"
                  value={sensorCalibration.humidityMax}
                  onChange={(e) => setSensorCalibration({...sensorCalibration, humidityMax: parseInt(e.target.value)})}
                  className="range-input"
                />
              </div>
              <div className="range-hint">Optimal: 40-85%</div>
            </div>
          </div>
          
          <button onClick={handleCalibrationUpdate} className="submit-btn glass-btn-purple">
            Apply Calibration
          </button>
        </div>
      )}

      {/* Irrigation Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="config-section glass-card-purple">
          <h2 className="section-title">⏱️ Irrigation Schedule</h2>
          <p className="section-description">Set automated irrigation schedules for your farm</p>
          
          <div className="schedules-list">
            {irrigationSchedule.map(schedule => (
              <div key={schedule.id} className="schedule-item">
                <div className="schedule-header">
                  <div className="schedule-time">
                    <span className="time-icon">⏰</span>
                    <span className="time-value">{schedule.time}</span>
                    <span className="duration">({schedule.duration} mins)</span>
                  </div>
                  <div className="schedule-controls">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={() => toggleSchedule(schedule.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <button className="delete-schedule" onClick={() => deleteSchedule(schedule.id)}>🗑️</button>
                  </div>
                </div>
                <div className="schedule-days">
                  {schedule.days.map(day => (
                    <span key={day} className="day-badge">{day}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {!showNewSchedule ? (
            <button className="add-schedule-btn glass-btn-purple" onClick={() => setShowNewSchedule(true)}>
              + Add New Schedule
            </button>
          ) : (
            <div className="new-schedule-form">
              <h3>New Irrigation Schedule</h3>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={newSchedule.duration}
                  onChange={(e) => setNewSchedule({...newSchedule, duration: parseInt(e.target.value)})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Days of Week</label>
                <div className="days-selector">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      className={`day-btn ${newSchedule.days.includes(day) ? 'selected' : ''}`}
                      onClick={() => {
                        if (newSchedule.days.includes(day)) {
                          setNewSchedule({...newSchedule, days: newSchedule.days.filter(d => d !== day)});
                        } else {
                          setNewSchedule({...newSchedule, days: [...newSchedule.days, day]});
                        }
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowNewSchedule(false)}>Cancel</button>
                <button className="save-btn glass-btn-purple" onClick={addSchedule}>Save Schedule</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="config-section glass-card-purple">
          <h2 className="section-title">🔔 Alerts & Notifications</h2>
          <p className="section-description">Monitor important events and system notifications</p>
          
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
                    {alert.type === 'warning' && '⚠️'}
                    {alert.type === 'info' && 'ℹ️'}
                    {alert.type === 'success' && '✅'}
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                  {!alert.read && (
                    <button className="mark-read" onClick={() => markAlertAsRead(alert.id)}>✓</button>
                  )}
                </div>
              ))
            )}
          </div>
          
          {alerts.length > 0 && (
            <button className="clear-alerts-btn" onClick={clearAllAlerts}>
              Clear All Alerts
            </button>
          )}
        </div>
      )}

      {/* AI Control Tab */}
      {activeTab === 'ai' && (
        <div className="config-section glass-card-purple">
          <h2 className="section-title">🧠 AI Control System</h2>
          <p className="section-description">Enable AI-assisted irrigation decisions for optimal water usage</p>
          
          <div className="ai-control-card">
            <div className="ai-toggle-section">
              <div className="ai-status">
                <span className="ai-icon">🤖</span>
                <span className="ai-label">AI Assistant Mode</span>
              </div>
              <label className="toggle-switch-large">
                <input
                  type="checkbox"
                  checked={aiControl.enabled}
                  onChange={toggleAIControl}
                />
                <span className="toggle-slider-large"></span>
              </label>
            </div>
            
            {aiControl.enabled && (
              <div className="ai-details">
                <div className="ai-confidence">
                  <label>AI Decision Confidence</label>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: '75%' }}></div>
                    <span className="confidence-value">75%</span>
                  </div>
                </div>
                
                <div className="ai-override">
                  <label>Override Mode</label>
                  <select className="override-select" value={aiControl.overrideMode} onChange={(e) => setAiControl({...aiControl, overrideMode: e.target.value})}>
                    <option value="auto">Auto (AI + Manual)</option>
                    <option value="ai-only">AI Only</option>
                    <option value="manual-only">Manual Only</option>
                  </select>
                </div>
                
                <div className="ai-last-decision">
                  <label>Last AI Decision</label>
                  <div className="decision-card">
                    <p>Soil moisture at 32% - Recommended irrigation for 8 minutes</p>
                    <span className="decision-time">2 hours ago</span>
                  </div>
                </div>
                
                <div className="ai-benefits">
                  <h4>Benefits of AI Control:</h4>
                  <ul>
                    <li>💧 Reduces water waste by up to 30%</li>
                    <li>🌱 Optimizes irrigation based on weather forecasts</li>
                    <li>📊 Learns from historical data and crop patterns</li>
                    <li>🔮 Predicts optimal irrigation times</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}