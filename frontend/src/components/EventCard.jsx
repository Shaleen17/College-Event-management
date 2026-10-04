import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getEventStatus = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) return 'Today';
    if (eventDate > today) return 'Upcoming';
    return 'Past';
  };

  const status = getEventStatus();

  return (
    <div className={`event-card ${event.category.toLowerCase()}-border`}>
      <div className="event-image-container" style={{position: 'relative'}}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="event-image" />
        ) : (
          <div className="event-image-placeholder">
            <span className="camera-icon">📷</span>
            <p>No Image</p>
          </div>
        )}
        <span className={`event-card-badge ${status.toLowerCase()}`} style={{position: 'absolute', top: '10px', right: '10px'}}>{status}</span>
      </div>
      <div className="event-content">
        <span className={`category-badge ${event.category.toLowerCase()}`}>
          {event.category}
        </span>
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">📅 {formatDate(event.date)} at {event.time}</p>
        <p className="event-venue">📍 {event.venue}</p>
        <p className="event-capacity">👥 Capacity: {event.capacity}</p>
        <Link to={`/event/${event._id}`} className="btn-details">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
