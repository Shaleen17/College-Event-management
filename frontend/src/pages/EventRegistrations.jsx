import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EventRegistrations = () => {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch event details
      const eventRes = await axios.get(`/api/events/${id}`);
      setEvent(eventRes.data);
      
      // Fetch registrations
      const regRes = await axios.get(`/api/events/${id}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(regRes.data);
    } catch (err) {
      setError('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h2>Registrations for: {event ? event.title : 'Loading...'}</h2>
        <Link to="/admin/dashboard" className="btn-secondary">Back to Dashboard</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="stats-card">
        <p>Total Registrations: <strong>{registrations.length}</strong> {event && `/ ${event.capacity}`}</p>
      </div>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr><td colSpan="3" className="text-center">No registrations yet.</td></tr>
              ) : (
                registrations.map(reg => (
                  <tr key={reg._id}>
                    <td>{reg.user.name}</td>
                    <td>{reg.user.email}</td>
                    <td>{formatDate(reg.registeredAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
