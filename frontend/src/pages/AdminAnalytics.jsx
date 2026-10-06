import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const CATEGORY_COLORS = {
  Technical: '#0369a1',
  Cultural: '#7e22ce',
  Sports: '#15803d',
  Workshop: '#c2410c',
};

const AdminAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsRes = await axios.get('/api/events');
      const eventsData = eventsRes.data;
      setEvents(eventsData);

      // Fetch registrations for all events
      const regPromises = eventsData.map(e =>
        axios.get(`/api/events/${e._id}/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => ({ eventId: e._id, count: r.data.length, title: e.title, capacity: e.capacity, category: e.category }))
          .catch(() => ({ eventId: e._id, count: 0, title: e.title, capacity: e.capacity, category: e.category }))
      );
      const regsData = await Promise.all(regPromises);
      setRegistrations(regsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Derived stats ---
  const totalEvents = events.length;
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistrations = registrations.reduce((sum, r) => sum + r.count, 0);
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;

  // Category breakdown for Pie
  const categoryMap = {};
  events.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Registrations per event for Bar (top 8)
  const barData = registrations
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(r => ({
      name: r.title.length > 15 ? r.title.slice(0, 15) + '…' : r.title,
      fullName: r.title,
      Registered: r.count,
      Remaining: Math.max(0, r.capacity - r.count),
    }));

  // Category-wise registration totals
  const catRegMap = {};
  registrations.forEach(r => {
    catRegMap[r.category] = (catRegMap[r.category] || 0) + r.count;
  });
  const catRegData = Object.entries(catRegMap).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <p className="analytics-subtitle">Real-time insights for all events</p>
      </div>

      {/* Summary Cards */}
      <div className="analytics-stat-grid">
        <div className="analytics-stat-card" style={{ borderColor: '#2D5741' }}>
          <div className="analytics-stat-icon">📋</div>
          <div className="analytics-stat-number" style={{ color: '#2D5741' }}>{totalEvents}</div>
          <div className="analytics-stat-label">Total Events</div>
        </div>
        <div className="analytics-stat-card" style={{ borderColor: '#E87B35' }}>
          <div className="analytics-stat-icon">📅</div>
          <div className="analytics-stat-number" style={{ color: '#E87B35' }}>{upcomingEvents}</div>
          <div className="analytics-stat-label">Upcoming Events</div>
        </div>
        <div className="analytics-stat-card" style={{ borderColor: '#0369a1' }}>
          <div className="analytics-stat-icon">👥</div>
          <div className="analytics-stat-number" style={{ color: '#0369a1' }}>{totalRegistrations}</div>
          <div className="analytics-stat-label">Total Registrations</div>
        </div>
        <div className="analytics-stat-card" style={{ borderColor: '#15803d' }}>
          <div className="analytics-stat-icon">🪑</div>
          <div className="analytics-stat-number" style={{ color: '#15803d' }}>{totalCapacity}</div>
          <div className="analytics-stat-label">Total Capacity</div>
        </div>
        <div className="analytics-stat-card" style={{ borderColor: '#7e22ce' }}>
          <div className="analytics-stat-icon">📈</div>
          <div className="analytics-stat-number" style={{ color: '#7e22ce' }}>
            {totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0}%
          </div>
          <div className="analytics-stat-label">Fill Rate</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-row">
        {/* Pie: Events by Category */}
        <div className="analytics-chart-card">
          <h3 className="chart-title">Events by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: Registrations by Category */}
        <div className="analytics-chart-card">
          <h3 className="chart-title">Registrations by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={catRegData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {catRegData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart: Registrations per Event */}
      {barData.length > 0 && (
        <div className="analytics-chart-card analytics-chart-full">
          <h3 className="chart-title">Registrations vs Remaining Capacity (Top Events)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar dataKey="Registered" fill="#2D5741" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Remaining" fill="#E87B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Events Table */}
      <div className="analytics-chart-card analytics-chart-full" style={{ marginTop: '1.5rem' }}>
        <h3 className="chart-title">All Events — Registration Details</h3>
        <div className="table-container" style={{ boxShadow: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Registered</th>
                <th>Capacity</th>
                <th>Fill %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(r => {
                const fillPct = r.capacity > 0 ? Math.round((r.count / r.capacity) * 100) : 0;
                const isFull = fillPct >= 100;
                return (
                  <tr key={r.eventId}>
                    <td>{r.title}</td>
                    <td>
                      <span className={`category-badge ${r.category.toLowerCase()}`}>{r.category}</span>
                    </td>
                    <td>{r.count}</td>
                    <td>{r.capacity}</td>
                    <td>
                      <div className="fill-bar-wrap">
                        <div
                          className="fill-bar"
                          style={{
                            width: `${Math.min(fillPct, 100)}%`,
                            background: fillPct >= 90 ? '#D64545' : fillPct >= 60 ? '#E87B35' : '#2D5741'
                          }}
                        />
                        <span className="fill-pct">{fillPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: isFull ? '#fef2f2' : '#f0fdf4',
                        color: isFull ? '#D64545' : '#15803d'
                      }}>
                        {isFull ? 'Full' : 'Open'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
