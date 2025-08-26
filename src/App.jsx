// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import BeforeLogin from "./BeforeLogin";
import StudentLogin from "./StudentLogin";
import LibrarianLogin from "./LibrarianLogin";
import ContactUs from "./ContactUs"; // Ensure ContactUs is imported

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<BeforeLogin />} /> 
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/librarian-login" element={<LibrarianLogin />} />
      
    </Routes>
  );
}
