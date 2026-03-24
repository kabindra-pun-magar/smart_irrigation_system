import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    soil_moisture: 0,
    irrigation_needed: 0,
    mode: "AUTO"
  });

  const [connectionStatus, setConnectionStatus] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const previousState = useRef(0);
  const soundRef = useRef(null);

  useEffect(() => {
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Soil Moisture',
            data: [],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.2)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Temperature',
            data: [],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.2)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Humidity',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.2)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
              font: {
                size: 12
              }
            },
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255,255,255,0.1)'
            },
            ticks: {
              color: '#ffffff'
            }
          },
          x: {
            grid: {
              color: 'rgba(255,255,255,0.1)'
            },
            ticks: {
              color: '#ffffff',
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });

    updateDashboard();
    const interval = setInterval(updateDashboard, 3000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const showAlert = (message, type = 'info') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const updateDashboard = () => {
    fetch("http://127.0.0.1:5000/latest")
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(d => {
        setData(d);
        setConnectionStatus(true);
        setLastUpdate(new Date());

        let chart = chartInstance.current;
        if (chart) {
          let time = new Date().toLocaleTimeString();
          
          chart.data.labels.push(time);
          chart.data.datasets[0].data.push(d.soil_moisture);
          chart.data.datasets[1].data.push(d.temperature);
          chart.data.datasets[2].data.push(d.humidity);

          if (chart.data.labels.length > 15) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(ds => ds.data.shift());
          }

          chart.update();
        }

        if (d.irrigation_needed === 1 && previousState.current === 0) {
          soundRef.current.play();
          showAlert("💧 Irrigation needed! System activated.", "warning");
        }

        previousState.current = d.irrigation_needed;
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setConnectionStatus(false);
        showAlert("⚠️ Connection lost. Retrying...", "error");
      });
  };

  const toggleMode = (v) => {
    fetch("http://127.0.0.1:5000/set_mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: v ? "MANUAL" : "AUTO" })
    })
      .then(() => {
        showAlert(`Mode switched to ${v ? "MANUAL" : "AUTO"}`, "success");
      })
      .catch(err => {
        console.error("Error setting mode:", err);
        showAlert("Failed to switch mode", "error");
      });
  };

  const setManual = (v) => {
    fetch("http://127.0.0.1:5000/set_manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: v })
    })
      .then(() => {
        showAlert(v ? "💧 Irrigation turned ON" : "🌿 Irrigation turned OFF", "success");
      })
      .catch(err => {
        console.error("Error setting manual:", err);
        showAlert("Failed to control irrigation", "error");
      });
  };

  const getSoilMoistureStatus = (value) => {
    if (value < 30) return { text: "Dry", color: "#ef4444", icon: "🔥" };
    if (value < 60) return { text: "Normal", color: "#f59e0b", icon: "💧" };
    return { text: "Optimal", color: "#22c55e", icon: "🌊" };
  };

  const getTemperatureStatus = (value) => {
    if (value < 15) return { text: "Cool", color: "#3b82f6", icon: "❄️" };
    if (value < 30) return { text: "Ideal", color: "#22c55e", icon: "🌡️" };
    return { text: "Hot", color: "#ef4444", icon: "🔥" };
  };

  const getHumidityStatus = (value) => {
    if (value < 40) return { text: "Dry", color: "#ef4444", icon: "🏜️" };
    if (value < 70) return { text: "Comfortable", color: "#22c55e", icon: "💨" };
    return { text: "High", color: "#3b82f6", icon: "💧" };
  };

  const soilStatus = getSoilMoistureStatus(data.soil_moisture);
  const tempStatus = getTemperatureStatus(data.temperature);
  const humidityStatus = getHumidityStatus(data.humidity);

  return (
    <div className="dashboard-page">
      {/* Glass Background Effect */}
      <div className="glass-bg-dashboard"></div>
      
      {/* Notification */}
      {showNotification && (
        <div className={`notification ${notificationMessage.includes("error") ? 'error' : notificationMessage.includes("warning") ? 'warning' : 'success'}`}>
          <span className="notification-icon">
            {notificationMessage.includes("error") ? "❌" : notificationMessage.includes("warning") ? "⚠️" : "✅"}
          </span>
          <span className="notification-text">{notificationMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header glass-card-dashboard">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">🌱</span>
            Smart Irrigation System
            <span className="title-icon">💧</span>
          </h1>
          <p className="dashboard-description">
            Real-time monitoring and intelligent irrigation control for optimal crop growth
          </p>
        </div>
        
        <div className="connection-status">
          <div className={`status-dot ${connectionStatus ? 'online' : 'offline'}`}></div>
          <span className="status-text">{connectionStatus ? 'Connected' : 'Disconnected'}</span>
          <div className="last-update">
            <span className="update-icon">🕐</span>
            <span className="update-text">{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="sensors-grid">
        <div className="sensor-card glass-card-dashboard">
          <div className="sensor-icon temp-icon">🌡️</div>
          <div className="sensor-info">
            <div className="sensor-label">Temperature</div>
            <div className="sensor-value" style={{ color: tempStatus.color }}>
              {data.temperature}°C
            </div>
            <div className="sensor-status">
              <span className="status-badge" style={{ backgroundColor: tempStatus.color }}>
                {tempStatus.icon} {tempStatus.text}
              </span>
            </div>
          </div>
        </div>

        <div className="sensor-card glass-card-dashboard">
          <div className="sensor-icon humidity-icon">💧</div>
          <div className="sensor-info">
            <div className="sensor-label">Humidity</div>
            <div className="sensor-value" style={{ color: humidityStatus.color }}>
              {data.humidity}%
            </div>
            <div className="sensor-status">
              <span className="status-badge" style={{ backgroundColor: humidityStatus.color }}>
                {humidityStatus.icon} {humidityStatus.text}
              </span>
            </div>
          </div>
        </div>

        <div className="sensor-card glass-card-dashboard">
          <div className="sensor-icon soil-icon">🪴</div>
          <div className="sensor-info">
            <div className="sensor-label">Soil Moisture</div>
            <div className="sensor-value" style={{ color: soilStatus.color }}>
              {data.soil_moisture}%
            </div>
            <div className="sensor-status">
              <span className="status-badge" style={{ backgroundColor: soilStatus.color }}>
                {soilStatus.icon} {soilStatus.text}
              </span>
            </div>
          </div>
          <div className="moisture-bar">
            <div className="moisture-fill" style={{ width: `${data.soil_moisture}%`, backgroundColor: soilStatus.color }}></div>
          </div>
        </div>

        <div className={`sensor-card irrigation-card glass-card-dashboard ${data.irrigation_needed ? 'irrigation-active' : ''}`}>
          <div className="sensor-icon irrigation-icon">💦</div>
          <div className="sensor-info">
            <div className="sensor-label">Irrigation System</div>
            <div className={`irrigation-status ${data.irrigation_needed ? 'active' : 'inactive'}`}>
              {data.irrigation_needed ? 'IRRIGATION ON' : 'IRRIGATION OFF'}
            </div>
            <div className="mode-indicator">
              Mode: <span className={`mode-${data.mode.toLowerCase()}`}>{data.mode}</span>
            </div>
            {data.irrigation_needed && (
              <div className="water-drops">
                <span className="water-drop">💧</span>
                <span className="water-drop">💧</span>
                <span className="water-drop">💧</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode Control */}
      <div className="mode-control glass-card-dashboard">
        <div className="mode-header">
          <span className="mode-icon">🎮</span>
          <span className="mode-title">Control Mode</span>
        </div>
        <div className="mode-switch-container">
          <span className={`mode-option ${data.mode === "AUTO" ? 'active' : ''}`}>AUTO</span>
          <label className="mode-toggle">
            <input
              type="checkbox"
              checked={data.mode === "MANUAL"}
              onChange={(e) => toggleMode(e.target.checked)}
            />
            <span className="toggle-slider-mode"></span>
          </label>
          <span className={`mode-option ${data.mode === "MANUAL" ? 'active' : ''}`}>MANUAL</span>
        </div>
        
        {data.mode === "MANUAL" && (
          <div className="manual-controls">
            <button className="control-btn on-btn" onClick={() => setManual(1)}>
              <span className="btn-icon">💧</span>
              Turn ON Irrigation
            </button>
            <button className="control-btn off-btn" onClick={() => setManual(0)}>
              <span className="btn-icon">🌿</span>
              Turn OFF Irrigation
            </button>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="chart-section glass-card-dashboard">
        <div className="chart-header">
          <span className="chart-icon">📊</span>
          <span className="chart-title">Sensor Data Trends</span>
          <span className="chart-subtitle">Last 15 readings</span>
        </div>
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats glass-card-dashboard">
        <div className="stat-item">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">24/7</div>
            <div className="stat-label">Monitoring</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💧</div>
          <div className="stat-content">
            <div className="stat-value">-30%</div>
            <div className="stat-label">Water Saved</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <div className="stat-value">+25%</div>
            <div className="stat-label">Yield Increase</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <div className="stat-value">Smart</div>
            <div className="stat-label">AI Control</div>
          </div>
        </div>
      </div>

      {/* Audio for alert */}
      <audio ref={soundRef}>
        <source src="https://www.soundjay.com/nature/water-drip-1.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}