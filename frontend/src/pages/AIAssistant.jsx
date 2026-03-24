import React, { useState, useRef, useEffect } from "react";
import "../styles/AI.css";

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your Smart Farm AI Assistant. 🌾\n\nI can help you with:\n• Crop recommendations\n• Pest control advice\n• Irrigation scheduling\n• Soil management\n• Weather insights\n• Market prices\n\nHow can I assist you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  const categories = [
    { id: "all", name: "All", icon: "🌾" },
    { id: "crops", name: "Crops", icon: "🌽" },
    { id: "irrigation", name: "Irrigation", icon: "💧" },
    { id: "pest", name: "Pest Control", icon: "🐛" },
    { id: "soil", name: "Soil", icon: "🪴" },
    { id: "weather", name: "Weather", icon: "⛅" },
    { id: "market", name: "Market", icon: "💰" }
  ];

  const suggestions = {
    crops: [
      "Best crops for clay soil?",
      "High-yield summer crops",
      "Organic farming techniques",
      "Crop rotation benefits"
    ],
    irrigation: [
      "Drip irrigation setup guide",
      "Best time for irrigation",
      "Water conservation tips",
      "Irrigation scheduling methods"
    ],
    pest: [
      "Natural pest control methods",
      "Common crop diseases",
      "Organic pesticides",
      "Preventive measures for pests"
    ],
    soil: [
      "How to improve soil fertility?",
      "Soil testing methods",
      "Composting techniques",
      "pH level management"
    ],
    weather: [
      "Weather impact on crops",
      "Rainfall prediction benefits",
      "Climate-smart farming",
      "Seasonal farming calendar"
    ],
    market: [
      "Current vegetable prices",
      "Best time to sell crops",
      "Organic market demand",
      "Export opportunities"
    ]
  };

  const getCurrentSuggestions = () => {
    if (activeCategory === "all") {
      return [
        "How to improve soil fertility?",
        "Best irrigation practices",
        "Natural pest control methods",
        "High-yield crop varieties",
        "Weather forecasting for farmers",
        "Organic farming certification"
      ];
    }
    return suggestions[activeCategory] || suggestions.crops;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input;
    const userMsg = {
      id: messages.length + 1,
      sender: "user",
      text: currentInput,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const res = await fetch("http://127.0.0.1:5000/ask_ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: currentInput })
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const data = await res.json();

      const aiMsg = {
        id: messages.length + 2,
        sender: "ai",
        text: data.answer || data.error || "⚠️ No response from AI",
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error("Frontend Error:", err);
      
      const errorMsg = {
        id: messages.length + 2,
        sender: "ai",
        text: "⚠️ Backend not responding. Using offline mode. I can still provide general farming advice!",
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Simulate AI response for offline mode
      setTimeout(() => {
        const offlineResponse = {
          id: messages.length + 3,
          sender: "ai",
          text: generateOfflineResponse(currentInput),
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, offlineResponse]);
      }, 1000);
    }

    setLoading(false);
  };

  const generateOfflineResponse = (query) => {
    const responses = {
      "soil": "To improve soil fertility: 1) Add organic compost, 2) Practice crop rotation, 3) Use green manure, 4) Maintain proper pH levels, 5) Avoid over-tilling. Regular soil testing is recommended every 6 months.",
      "irrigation": "Best irrigation practices: Drip irrigation saves up to 50% water. Water early morning or evening to reduce evaporation. Check soil moisture 2-3 inches deep before irrigating.",
      "pest": "Natural pest control: Use neem oil spray, introduce beneficial insects like ladybugs, practice companion planting, maintain field hygiene, and use pheromone traps for monitoring.",
      "crop": "For summer farming: Choose heat-tolerant varieties like okra, eggplant, sweet potatoes, and millets. Ensure adequate irrigation and mulching to retain soil moisture.",
      "weather": "Monitor weather forecasts for planting and harvesting. Use rain gauges, install weather stations, and consider climate-smart agriculture practices for changing weather patterns.",
      "market": "For better market prices: Join farmer cooperatives, use digital platforms, focus on organic certification, build direct connections with buyers, and monitor price trends."
    };
    
    const lowerQuery = query.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }
    
    return "I'm here to help with your farming needs! I can assist with crop selection, irrigation scheduling, pest management, soil health, and market insights. Could you please provide more details about what you'd like to know? 🌱";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all chat messages?")) {
      setMessages([{
        id: 1,
        sender: "ai",
        text: "Chat cleared! How can I help you with your farming needs today? 🌾",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.sender === "user" ? "You" : "AI Assistant"} (${msg.timestamp}):\n${msg.text}\n`
    ).join("\n");
    
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `farm-chat-${new Date().toISOString().slice(0,19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
        setShowVoiceInput(false);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
        setShowVoiceInput(false);
        alert("Voice recognition failed. Please try again.");
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      alert("Voice recognition is not supported in your browser.");
    }
  };

  return (
    <div className="ai-page">
      {/* Glass Background Effect */}
      <div className="glass-bg-ai"></div>
      
      {/* Header Section */}
      <div className="ai-header glass-card-ai">
        <div className="header-content">
          <h1 className="ai-title">
            <span className="title-icon">🤖</span>
            Smart Farm AI Assistant
            <span className="title-icon">🌾</span>
          </h1>
          <p className="ai-description">
            Your intelligent farming companion - get instant answers, expert advice, and personalized recommendations
          </p>
        </div>
        
        <div className="header-actions">
          <button className="action-btn glass-btn-ai" onClick={clearChat}>
            <span className="btn-icon">🗑️</span>
            Clear Chat
          </button>
          <button className="action-btn glass-btn-ai" onClick={exportChat}>
            <span className="btn-icon">📥</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ai-stats">
        <div className="stat-card glass-card-ai">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-number">{messages.filter(m => m.sender === "user").length}</div>
            <div className="stat-label">Questions Asked</div>
          </div>
        </div>
        <div className="stat-card glass-card-ai">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-card glass-card-ai">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-number">98%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>
        <div className="stat-card glass-card-ai">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">1K+</div>
            <div className="stat-label">Farmers Helped</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters glass-card-ai">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Main Chat Area */}
      <div className="chat-container glass-card-ai">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender === "user" ? "user-message" : "ai-message"}`}>
              <div className="message-avatar">
                {msg.sender === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-bubble">
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-wrapper ai-message">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="suggestions-section">
          <div className="suggestions-title">
            <span className="suggestions-icon">💡</span>
            Suggested Questions
          </div>
          <div className="suggestions-grid">
            {getCurrentSuggestions().map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <button 
              className="voice-btn" 
              onClick={startVoiceInput}
              title="Voice Input"
            >
              {isRecording ? "🔴" : "🎤"}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about farming, crops, irrigation, pest control..."
              rows="1"
            />
            <button 
              className="send-btn" 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions glass-card-ai">
        <h3 className="quick-title">⚡ Quick Actions</h3>
        <div className="quick-grid">
          <div className="quick-card" onClick={() => setInput("What's the weather forecast for farming this week?")}>
            <div className="quick-icon">⛅</div>
            <div className="quick-text">Weather Forecast</div>
          </div>
          <div className="quick-card" onClick={() => setInput("Calculate irrigation schedule for my 2-acre farm")}>
            <div className="quick-icon">💧</div>
            <div className="quick-text">Irrigation Calculator</div>
          </div>
          <div className="quick-card" onClick={() => setInput("Current market prices for vegetables")}>
            <div className="quick-icon">💰</div>
            <div className="quick-text">Market Prices</div>
          </div>
          <div className="quick-card" onClick={() => setInput("Recommend crops for my region")}>
            <div className="quick-icon">🌽</div>
            <div className="quick-text">Crop Advisor</div>
          </div>
          <div className="quick-card" onClick={() => setInput("Identify this pest problem")}>
            <div className="quick-icon">🐛</div>
            <div className="quick-text">Pest Identifier</div>
          </div>
          <div className="quick-card" onClick={() => setInput("Farming subsidies and schemes")}>
            <div className="quick-icon">📋</div>
            <div className="quick-text">Government Schemes</div>
          </div>
        </div>
      </div>

      {/* Farming Tips */}
      <div className="tips-section glass-card-ai">
        <h3 className="tips-title">🌱 Farming Tips of the Day</h3>
        <div className="tips-carousel">
          <div className="tip-card">
            <div className="tip-icon">💧</div>
            <div className="tip-content">
              <div className="tip-text">Water your plants early morning or late evening to reduce evaporation</div>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🪴</div>
            <div className="tip-content">
              <div className="tip-text">Add compost to soil every 3 months for better nutrient content</div>
            </div>
          </div>
          <div className="tip-card">
            <div className="tip-icon">🐞</div>
            <div className="tip-content">
              <div className="tip-text">Ladybugs are natural pest controllers - attract them with marigolds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}