import React from "react";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const navigate = useNavigate();

  const containerStyle = {
    maxWidth: "800px",
    margin: "80px auto",
    padding: "30px",
    backgroundColor: "#fff", // pure white background
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)", // heavier shadow like modal
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    position: "relative", // Important for close button
  };

  const titleStyle = {
    color: "rgb(230, 100, 0)",
    marginBottom: "20px",
    textAlign: "center",
  };

  const paragraphStyle = {
    marginBottom: "15px",
    lineHeight: "1.6",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "15px",
    right: "20px",
    fontSize: "24px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
  };

  const handleClose = () => {
    navigate("/"); // Back to homepage
  };

  return (
    <div style={containerStyle}>
      <button style={closeButtonStyle} onClick={handleClose}>
        &times;
      </button>

      <h1 style={titleStyle}>Contact Us</h1>

      <p style={paragraphStyle}>
        Have questions? We are here to assist you!
      </p>

      <p style={paragraphStyle}>
        📧 Email: support@lmsportal.com
      </p>

      <p style={paragraphStyle}>
        📞 Phone: 123-456-7890
      </p>

      <p style={paragraphStyle}>
        🕘 Working Hours: 9 AM - 5 PM (Monday to Friday)
      </p>

      <p style={paragraphStyle}>
        We will get back to you as soon as possible. Thank you for reaching out!
      </p>
    </div>
  );
}
