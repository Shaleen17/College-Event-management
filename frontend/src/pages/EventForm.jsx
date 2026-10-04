import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EventForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'Technical',
    capacity: '',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`/api/events/${id}`);
      // Format date for input field (YYYY-MM-DD)
      const dateObj = new Date(res.data.date);
      const formattedDate = dateObj.toISOString().split('T')[0];
      
      setFormData({
        ...res.data,
        date: formattedDate
      });
    } catch (err) {
      setError('Failed to load event data.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      if (isEditMode) {
        await axios.put(`/api/events/${id}`, formData, config);
      } else {
        await axios.post('/api/events', formData, config);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <h2>{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-group half">
            <label>Time</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="form-group">
          <label>Venue</label>
          <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          <div className="form-group half">
            <label>Capacity</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" />
          </div>
        </div>
        
        <div className="form-group">
          <label>Image URL (Optional)</label>
          <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
