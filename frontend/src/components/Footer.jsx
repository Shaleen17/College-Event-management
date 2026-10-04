import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>TCET Events</h3>
          <p>Thakur College of Engineering & Technology<br/>Event Management Portal for students and organizers.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📍 Thakur Village, Kandivali (E), Mumbai - 400101</p>
          <p>📧 events@tcet.ac.in</p>
          <p>📞 +91 22 2846 7500</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 TCET Events. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
