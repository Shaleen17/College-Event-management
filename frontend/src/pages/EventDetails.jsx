import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user && user.role === 'student') {
      checkRegistration();
    }
  }, [id, user]);

  useEffect(() => {
    if (!event) return;
    
    const calculateTimeLeft = () => {
      const eventDate = new Date(event.date);
      const now = new Date();
      const diff = eventDate - now;
      
      if (diff <= 0) {
        setTimeLeft(null); // event has passed
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const fetchEventDetails = async () => {
    try {
      const res = await axios.get(`/api/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const res = await axios.get('/api/registrations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const registered = res.data.some(reg => reg.event._id === id);
      setIsRegistered(registered);
    } catch (err) {
      console.error('Failed to check registration status', err);
    }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    
    try {
      await axios.post(`/api/events/${id}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRegistered(true);
      setMessage('Successfully registered for the event!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    
    try {
      await axios.delete(`/api/events/${id}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRegistered(false);
      setMessage('Registration cancelled.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (!event) return <div className="error-message">Event not found.</div>;

  return (
    <div className="event-details-container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="event-details-card">
        <div className="event-details-header">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="event-details-image" />
          ) : (
            <div className="event-details-image-placeholder">
              <span className="camera-icon-large">📷</span>
            </div>
          )}
        </div>
        
        <div className="event-details-content">
          <div className="event-header-row">
            <span className={`category-badge ${event.category.toLowerCase()}`}>{event.category}</span>
          </div>
          
          {timeLeft ? (
            <div className="countdown-section">
              <p style={{marginBottom: '10px', fontSize: '0.9rem'}}>Event starts in</p>
              <div className="countdown-grid">
                <div className="countdown-item">
                  <span className="countdown-value">{timeLeft.days}</span>
                  <span className="countdown-unit">Days</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{timeLeft.hours}</span>
                  <span className="countdown-unit">Hours</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{timeLeft.minutes}</span>
                  <span className="countdown-unit">Minutes</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{timeLeft.seconds}</span>
                  <span className="countdown-unit">Seconds</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="countdown-section" style={{background: '#5A6B7A'}}>
              <p>This event has already passed</p>
            </div>
          )}

          <h1 className="event-details-title">{event.title}</h1>
          <p className="event-description">{event.description}</p>
          
          <div className="event-info-grid">
            <div className="info-item">
              <strong>Date:</strong> {formatDate(event.date)}
            </div>
            <div className="info-item">
              <strong>Time:</strong> {event.time}
            </div>
            <div className="info-item">
              <strong>Venue:</strong> {event.venue}
            </div>
            <div className="info-item">
              <strong>Capacity:</strong> {event.capacity}
            </div>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <div className="event-actions">
            {!user ? (
              <p>Please <button onClick={() => navigate('/login')} className="link-btn">login</button> to register.</p>
            ) : user.role === 'student' ? (
              isRegistered ? (
                <button 
                  className="btn-danger" 
                  onClick={handleCancel} 
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Cancel Registration'}
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Register Now'}
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
      
      {showConfetti && (
        <div className="registration-success-overlay" onClick={() => setShowConfetti(false)}>
          <div className="confetti-message">
            <div style={{fontSize: '4rem', marginBottom: '15px'}}>🎉</div>
            <h2 style={{color: '#2D5741', marginBottom: '10px'}}>Registered!</h2>
            <p style={{color: '#5A6B7A'}}>You've successfully registered for this event.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
