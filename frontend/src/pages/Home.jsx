import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [search, category]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/events?search=${search}&category=${category}`);
      setEvents(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Discover <span className="accent-text">Events</span> at TCET</h1>
        <p className="hero-subtitle">Your gateway to exciting events at Thakur College of Engineering & Technology. Browse, register, and participate!</p>
        
        {imageLoaded ? (
          <div className="hero-image-box">
            <img src="/images/campus.jpg" alt="TCET Campus" className="hero-campus-image" />
          </div>
        ) : !imageFailed ? (
          <div className="hero-image-box">
            <img 
              src="/images/campus.jpg" 
              alt="TCET Campus" 
              className="hero-campus-image"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
              style={{display: 'none'}}
            />
          </div>
        ) : null}
      </div>

      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{events.length}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🏷️</div>
          <div className="stat-number">{new Set(events.map(e => e.category)).size}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{events.reduce((sum, e) => sum + e.capacity, 0)}</div>
          <div className="stat-label">Total Seats</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">📍</div>
          <div className="stat-number">{new Set(events.map(e => e.venue)).size}</div>
          <div className="stat-label">Venues</div>
        </div>
      </div>

      <div className="filters-section">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search events..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="category-filters">
          <button 
            className={`filter-btn ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {['Technical', 'Cultural', 'Sports', 'Workshop'].map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="section-header">
        <h2 className="section-title">Upcoming Events</h2>
      </div>
      
      {loading ? (
        <div className="events-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="event-card">
              <div className="skeleton skeleton-card"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => <EventCard key={event._id} event={event} />)
          ) : (
            <div className="no-events">No events found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
