import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import EventForm from './pages/EventForm';
import EventRegistrations from './pages/EventRegistrations';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:id" element={<EventDetails />} />
          
          {/* Student Routes */}
          <Route 
            path="/my-registrations" 
            element={
              <ProtectedRoute role="student">
                <MyRegistrations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute role="student">
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute role="admin">
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/event/new" 
            element={
              <ProtectedRoute role="admin">
                <EventForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/event/:id" 
            element={
              <ProtectedRoute role="admin">
                <EventForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/event/:id/registrations" 
            element={
              <ProtectedRoute role="admin">
                <EventRegistrations />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
