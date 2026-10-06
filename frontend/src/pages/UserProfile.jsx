import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { user, token, login } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password' | 'history'

  // Edit profile
  const [editName, setEditName] = useState('');
  const [editMsg, setEditMsg] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Change password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, regsRes] = await Promise.all([
        axios.get('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/registrations/my', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProfile(profileRes.data);
      setEditName(profileRes.data.name);
      setRegistrations(regsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditMsg(''); setEditError('');
    if (!editName.trim()) { setEditError('Name cannot be empty.'); return; }
    try {
      setEditLoading(true);
      const res = await axios.put('/api/auth/profile', { name: editName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      // Update AuthContext so navbar shows new name
      login({ ...user, name: res.data.name }, token);
      setEditMsg('Profile updated successfully!');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(''); setPwdError('');
    if (newPwd !== confirmPwd) { setPwdError('New passwords do not match.'); return; }
    if (newPwd.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    try {
      setPwdLoading(true);
      await axios.put('/api/auth/change-password', { currentPassword: currentPwd, newPassword: newPwd }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPwdMsg('Password changed successfully!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getEventStatus = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    if (eventDate > now) return { label: 'Upcoming', color: '#2D5741', bg: '#f0fdf4' };
    return { label: 'Completed', color: '#5A6B7A', bg: '#f1f5f9' };
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  const joined = profile?.createdAt ? formatDate(profile.createdAt) : 'N/A';
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="profile-page">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-hero-info">
          <h2 className="profile-name">{profile?.name}</h2>
          <p className="profile-email">✉️ {profile?.email}</p>
          <span className={`profile-role-badge ${profile?.role}`}>{profile?.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}</span>
        </div>
        <div className="profile-meta-stats">
          <div className="profile-meta-item">
            <div className="profile-meta-num">{registrations.length}</div>
            <div className="profile-meta-label">Events Registered</div>
          </div>
          <div className="profile-meta-item">
            <div className="profile-meta-num">
              {registrations.filter(r => new Date(r.event?.date) > new Date()).length}
            </div>
            <div className="profile-meta-label">Upcoming</div>
          </div>
          <div className="profile-meta-item">
            <div className="profile-meta-num">
              {registrations.filter(r => new Date(r.event?.date) <= new Date()).length}
            </div>
            <div className="profile-meta-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {[
          { id: 'info', label: '👤 My Info' },
          { id: 'password', label: '🔑 Change Password' },
          { id: 'history', label: '📋 Registration History' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-tab-content">
        {/* --- INFO TAB --- */}
        {activeTab === 'info' && (
          <div className="profile-card">
            <h3 className="profile-section-title">Personal Information</h3>
            <form onSubmit={handleEditProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={profile?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                <small style={{ color: '#5A6B7A', fontSize: '0.8rem' }}>Email cannot be changed.</small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profile?.role || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }} />
              </div>
              {editMsg && <div className="success-message">{editMsg}</div>}
              {editError && <div className="error-message">{editError}</div>}
              <button type="submit" className="btn-primary" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* --- PASSWORD TAB --- */}
        {activeTab === 'password' && (
          <div className="profile-card">
            <h3 className="profile-section-title">Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
              {pwdMsg && <div className="success-message">{pwdMsg}</div>}
              {pwdError && <div className="error-message">{pwdError}</div>}
              <button type="submit" className="btn-primary" disabled={pwdLoading}>
                {pwdLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="profile-card">
            <h3 className="profile-section-title">Registration History ({registrations.length})</h3>
            {registrations.length === 0 ? (
              <p className="no-data">No registrations yet. <Link to="/">Browse events →</Link></p>
            ) : (
              <div className="registrations-list" style={{ marginTop: '1rem' }}>
                {registrations.map(reg => {
                  const status = getEventStatus(reg.event?.date);
                  return (
                    <div key={reg._id} className="registration-card" style={{ borderLeftColor: status.color }}>
                      <div className="reg-info">
                        <h3>{reg.event?.title}</h3>
                        <p>📅 {reg.event?.date ? formatDate(reg.event.date) : 'N/A'} at {reg.event?.time}</p>
                        <p>📍 {reg.event?.venue}</p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span className={`category-badge ${reg.event?.category?.toLowerCase()}`}>
                            {reg.event?.category}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: status.bg,
                            color: status.color
                          }}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="reg-actions">
                        <Link to={`/event/${reg.event?._id}`} className="btn-secondary btn-small">View</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
