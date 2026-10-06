require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://college-event-management-azure-one.vercel.app',
  'https://tcet-events.vercel.app'
];

app.use(cors({
  origin(origin, callback) {
    const isAllowed =
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin);

    callback(null, isAllowed);
  },
  credentials: true
}));
app.use(express.json());

const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

app.get('/', (req, res) => {
  res.json({ message: 'TCET Events API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: connectionStates[mongoose.connection.readyState] || 'unknown',
    jwtConfigured: Boolean(process.env.JWT_SECRET)
  });
});

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: 'Database connection is not ready. Check the MONGO_URI deployment setting.'
  });
};

const requireJwtSecret = (req, res, next) => {
  if (process.env.JWT_SECRET) {
    return next();
  }

  return res.status(503).json({
    message: 'JWT_SECRET is not configured on the backend deployment.'
  });
};

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Database-backed API routes will return 503.');
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// routes
app.use('/api/auth', requireDatabase, requireJwtSecret, authRoutes);
app.use('/api/events', requireDatabase, eventRoutes);
app.use('/api', requireDatabase, requireJwtSecret, registrationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
