import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: "/", name: "Dashboard", icon: "📊" },
    { path: "/ai", name: "AI Assistant", icon: "🤖" },
    { path: "/market", name: "Community Market", icon: "🏪" },
    { path: "/learning", name: "Farm Learning", icon: "🌾" },
    { path: "/animals", name: "Animal Detection", icon: "🐄" },
    { path: "/settings", name: "Device Settings", icon: "⚙️" }
  ];

  return (
    <>
      {/* Hamburger Menu Button */}
      <button className={`hamburger-btn ${!isOpen ? 'active' : ''}`} onClick={toggleSidebar}>
        <span className="hamburger-icon">☰</span>
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="logo">
            <span className="logo-icon">🌱</span>
            {isOpen && <span className="logo-text">Smart Farm</span>}
          </h2>
          <button className="close-sidebar" onClick={toggleSidebar}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {isOpen && <span className="nav-text">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {isOpen && (
          <div className="sidebar-footer">
            <div className="farm-status">
              <div className="status-dot"></div>
              <span>System Online</span>
            </div>
            <div className="farm-version">v2.0.0</div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
}