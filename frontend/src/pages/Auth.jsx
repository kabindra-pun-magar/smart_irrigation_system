import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import "../styles/Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login success");
        window.location.href = "/dashboard";
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup success");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glass-card">
        {/* Welcome Header */}
        <div className="welcome-header">
          <h1>
            <i className="fas fa-seedling"></i>
            Welcome to the Smart Farming Hub
            <i className="fas fa-tractor"></i>
          </h1>
          <p className="tagline">Grow smarter, harvest better</p>
        </div>

        {/* Form Section */}
        <div className="auth-form">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="form-subtitle">
            {isLogin 
              ? "Sign in to access your farm dashboard" 
              : "Join the community of smart farmers"}
          </p>

          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth()}
            />
          </div>

          <button 
            className={`auth-btn ${loading ? "loading" : ""}`} 
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-arrow-right-to-bracket"></i>
            )}
            {isLogin ? "Login" : "Signup"}
          </button>

          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              className="toggle-btn" 
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? "Create Account" : "Sign In"}
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {/* Decorative farm elements */}
          <div className="farm-decor">
            <span className="decor-icon"><i className="fas fa-apple-alt"></i></span>
            <span className="decor-icon"><i className="fas fa-carrot"></i></span>
            <span className="decor-icon"><i className="fas fa-leaf"></i></span>
            <span className="decor-icon"><i className="fas fa-tractor"></i></span>
          </div>
        </div>
      </div>
    </div>
  );
}