import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents(); // Refresh list
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <Link to="/admin/event/new" className="btn-primary">Add New Event</Link>
      </div>
      
      {!loading && (
        <div className="dashboard-stats">
          <div className="dashboard-stat-card total">
            <div style={{fontSize: '2rem'}}>📋</div>
            <div style={{fontSize: '2rem', fontWeight: '700', color: '#2D5741'}}>{events.length}</div>
            <div style={{color: '#5A6B7A'}}>Total Events</div>
          </div>
          <div className="dashboard-stat-card upcoming">
            <div style={{fontSize: '2rem'}}>📅</div>
            <div style={{fontSize: '2rem', fontWeight: '700', color: '#E87B35'}}>
              {events.filter(e => new Date(e.date) > new Date()).length}
            </div>
            <div style={{color: '#5A6B7A'}}>Upcoming</div>
          </div>
          <div className="dashboard-stat-card capacity">
            <div style={{fontSize: '2rem'}}>👥</div>
            <div style={{fontSize: '2rem', fontWeight: '700', color: '#0369a1'}}>
              {events.reduce((sum, e) => sum + e.capacity, 0)}
            </div>
            <div style={{color: '#5A6B7A'}}>Total Capacity</div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Category</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No events found.</td></tr>
              ) : (
                events.map(event => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.venue}</td>
                    <td>
                      <span className={`category-badge ${event.category.toLowerCase()}`}>
                        {event.category}
                      </span>
                    </td>
                    <td>{event.capacity}</td>
                    <td className="action-cells">
                      <Link to={`/admin/event/${event._id}/registrations`} className="btn-small">View Regs</Link>
                      <Link to={`/admin/event/${event._id}`} className="btn-small btn-secondary">Edit</Link>
                      <button onClick={() => handleDelete(event._id)} className="btn-small btn-danger">Delete</button>
                    </td>
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

export default AdminDashboard;
