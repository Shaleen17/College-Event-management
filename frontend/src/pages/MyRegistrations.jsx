import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CertificateGenerator from '../components/CertificateGenerator';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useContext(AuthContext);

  // Certificate modal state
  const [certData, setCertData] = useState(null);

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
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isEventPast = (date) => new Date(date) <= new Date();

  const openCertificate = (reg) => {
    setCertData({
      studentName: user?.name || 'Student',
      eventTitle: reg.event.title,
      eventDate: reg.event.date,
      eventVenue: reg.event.venue,
      eventCategory: reg.event.category,
    });
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className={`category-badge ${reg.event.category.toLowerCase()}`}>
                      {reg.event.category}
                    </span>
                    {isEventPast(reg.event.date) ? (
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, background: '#f1f5f9', color: '#5A6B7A' }}>
                        ✅ Completed
                      </span>
                    ) : (
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, background: '#f0fdf4', color: '#15803d' }}>
                        🟢 Upcoming
                      </span>
                    )}
                  </div>
                </div>
                <div className="reg-actions">
                  <Link to={`/event/${reg.event._id}`} className="btn-secondary btn-small">View</Link>
                  {isEventPast(reg.event.date) ? (
                    <button onClick={() => openCertificate(reg)} className="btn-small" style={{ background: '#E87B35', color: 'white' }}>
                      📜 Certificate
                    </button>
                  ) : (
                    <button onClick={() => handleCancel(reg.event._id)} className="btn-danger btn-small">Cancel</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {certData && (
        <CertificateGenerator
          {...certData}
          onClose={() => setCertData(null)}
        />
      )}
    </div>
  );
};

export default MyRegistrations;
