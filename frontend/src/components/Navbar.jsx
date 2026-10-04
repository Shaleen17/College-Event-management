import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          TCET Events
        </Link>
        
        <div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          
          {!user && (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="nav-link btn-orange" onClick={closeMenu}>Register</Link>
            </>
          )}
          
          {user && user.role === 'student' && (
            <>
              <Link to="/my-registrations" className="nav-link" onClick={closeMenu}>My Registrations</Link>
              <span className="nav-user">Hi, {user.name}</span>
              <button onClick={handleLogout} className="nav-link btn-logout">Logout</button>
            </>
          )}
          
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
              <span className="nav-user">Hi, {user.name}</span>
              <button onClick={handleLogout} className="nav-link btn-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
