import React from "react";
import { useNavigate } from "react-router-dom"; // NEW

export default function AboutUs() {
  const navigate = useNavigate(); // NEW

  const containerStyle = {
    maxWidth: "800px",
    margin: "80px auto",
    padding: "30px",
    backgroundColor: "#fff", // pure white background
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)", // a little heavier shadow for modal feeling
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    position: "relative", // Important for cross button positioning
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
    navigate("/"); // Go back to main page
  };

  return (
    <div style={containerStyle}>
      
      <button style={closeButtonStyle} onClick={handleClose}>
        &times; {/* This is the ✖ (times symbol) */}
      </button>

      <h1 style={titleStyle}>About Us</h1>

      <p style={paragraphStyle}>
        Welcome to our Library Management System! 
      </p>

      <p style={paragraphStyle}>
        Our mission is to make book borrowing and management seamless and efficient for both students and librarians.
        This system is built with love using React for the frontend and Spring Boot for the backend.
      </p>

      <p style={paragraphStyle}>
        Whether you're looking to borrow a book, return a book, or manage the library's inventory, we are here to help!
        Thank you for using our application. Happy reading! 📖✨
      </p>
    </div>
  );
}
