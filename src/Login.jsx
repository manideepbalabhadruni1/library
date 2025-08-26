// src/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";

export default function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [captchaValue, setCaptchaValue] = useState(null); // reCAPTCHA value
  const navigate = useNavigate();

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/users/login", {
        email,
        password,
        captcha: captchaValue, // Optionally send to backend
      });
      const { role } = response.data;
      if (role === 0) {
        navigate("/student-login");
      } else if (role === 1) {
        navigate("/librarian-login");
      } else {
        setError("Unknown role. Contact support.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Invalid email or password");
      } else {
        alert("An error occurred. Try again.");
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/users/forgot-password", {
        email: resetEmail,
      });
      setMessage("The password has been sent to your registered email.");
      setIsForgotPassword(false);
    } catch (error) {
      setError("An error occurred while sending the password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "30px",
            background: "none",
            border: "none",
            fontSize: "30px",
            cursor: "pointer",
            color: "#333"
          }}
        >
          ✖
        </button>
      )}

      <div className="login-container">
        <div className="side-image left">
          <img src="/mm.jpeg" alt="Library left" />
        </div>

        <div className="login-box">
          <h1 className="login-title">
            <img
              src="https://cdn-icons-png.flaticon.com/512/29/29302.png"
              alt="logo"
              style={{ width: "70px", verticalAlign: "middle", marginRight: "10px" }}
            />
            Library <br /> Management System
          </h1>

          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}

          {!isForgotPassword ? (
            <>
              <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="email">📧 Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">🔑 Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>

                {/* reCAPTCHA */}
                <div className="form-group" style={{ marginTop: "15px" }}>
                  <ReCAPTCHA
                    sitekey="6LdU6DQrAAAAAOGWWI46t9h1Nr6O-c8unKDp52ma
" // Replace with your real site key
                    onChange={handleCaptchaChange}
                  />
                </div>

                <button type="submit" className="login-btn" disabled={!captchaValue}>
                  Login
                </button>
              </form>

              <div className="forgot-password">
                <a href="#" onClick={() => setIsForgotPassword(true)}>
                  Forgot Password?
                </a>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label htmlFor="reset-email">📧 Enter your email</label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email to reset"
                  />
                </div>
                <button type="submit" className="login-btn">
                  Send Password
                </button>
                <button
                  type="button"
                  className="login-btn"
                  onClick={() => setIsForgotPassword(false)}
                  style={{ backgroundColor: "gray" }}
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>

        <div className="side-image right">
          <img src="/ss.jpg" alt="Library right" />
        </div>
      </div>
    </div>
  );
}
