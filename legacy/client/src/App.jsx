import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './pages/Home';
import Services from './pages/Services';
// import About from './pages/About';
// import Contact from './pages/Contact';
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}