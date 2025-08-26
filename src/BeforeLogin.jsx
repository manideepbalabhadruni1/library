import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./BeforeLogin.css";
import Login from "./Login";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";

function BeforeLogin() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleAboutUsClick = () => {
    navigate("/about");
  };

  const handleContactUsClick = () => {
    navigate("/contact");
  };

  return (
    <div className="before-login-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo-container">
          <img src="/mhs.jpg" alt="MHS Logo" className="mhs-logo" />
        </div>
        <div className="nav-buttons">
          <button className="login-button" onClick={handleLoginClick}>
            Login
          </button>
          <button className="secondary-button" onClick={handleAboutUsClick}>
            About Us
          </button>
          <button className="secondary-button" onClick={handleContactUsClick}>
            Contact Us
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="center-content">
                <div className="lms-center-circle">LIBRARY MANAGEMENT SYSTEM</div>
                <div className="modules-grid">
                  <div className="module" onClick={handleLoginClick}>
                    <img src="/bok.jpg" alt="My Books" />
                    <div>My Books</div>
                  </div>
                  <div className="module" onClick={handleLoginClick}>
                    <img src="/lib.webp" alt="Library" />
                    <div>Library</div>
                  </div>
                  <div className="module" onClick={handleLoginClick}>
                    <img src="/borrow.jpg" alt="Borrow" />
                    <div>Borrow</div>
                  </div>
                  <div className="module" onClick={handleLoginClick}>
                    <img src="/return.jpg" alt="Return" />
                    <div>Return</div>
                  </div>
                  <div className="module" onClick={handleLoginClick}>
                    <img src="/feed.jpg" alt="Feedback" />
                    <div>Feedback</div>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2025 LMS Portal. All Rights Reserved.
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="full-screen-modal">
          <Login onClose={handleCloseModal} />
        </div>
      )}
    </div>
  );
}

export default BeforeLogin;
