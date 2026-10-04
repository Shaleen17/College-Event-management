import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/registrations/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(res.data);
    } catch (err) {
      setError('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    
    try {
      await axios.delete(`/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRegistrations(); // Refresh list
    } catch (err) {
      alert('Failed to cancel registration.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="page-container">
      <h2>My Registrations</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="registrations-list">
          {registrations.length === 0 ? (
            <p className="no-data">You haven't registered for any events yet. <Link to="/">Browse events</Link></p>
          ) : (
            registrations.map(reg => (
              <div key={reg._id} className="registration-card">
                <div className="reg-info">
                  <h3>{reg.event.title}</h3>
                  <p>📅 {formatDate(reg.event.date)} at {reg.event.time}</p>
                  <p>📍 {reg.event.venue}</p>
                  <span className={`category-badge ${reg.event.category.toLowerCase()}`}>
                    {reg.event.category}
                  </span>
                </div>
                <div className="reg-actions">
                  <Link to={`/event/${reg.event._id}`} className="btn-secondary">View</Link>
                  <button onClick={() => handleCancel(reg.event._id)} className="btn-danger">Cancel</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
