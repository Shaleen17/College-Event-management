const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared existing data.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      name: 'Admin',
      email: 'admin@tcet.ac.in',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created.');

    const events = [
      {
        title: 'Techfest 2027',
        category: 'Technical',
        venue: 'Main Auditorium',
        capacity: 200,
        date: new Date('2027-01-15'),
        time: '10:00 AM',
        description: 'TCET annual tech festival full of exciting events.',
        imageUrl: '',
        createdBy: admin._id
      },
      {
        title: 'Cultural Night',
        category: 'Cultural',
        venue: 'Open Air Theatre',
        capacity: 300,
        date: new Date('2027-01-20'),
        time: '6:00 PM',
        description: 'A night filled with music, dance, and performances.',
        imageUrl: '',
        createdBy: admin._id
      },
      {
        title: 'Hackathon 24hrs',
        category: 'Technical',
        venue: 'Computer Lab',
        capacity: 50,
        date: new Date('2026-12-10'),
        time: '9:00 AM',
        description: '24-hour coding challenge to build awesome projects.',
        imageUrl: '',
        createdBy: admin._id
      },
      {
        title: 'Sports Day',
        category: 'Sports',
        venue: 'College Ground',
        capacity: 500,
        date: new Date('2027-02-05'),
        time: '8:00 AM',
        description: 'Annual sports day with track and field events.',
        imageUrl: '',
        createdBy: admin._id
      },
      {
        title: 'Web Development Workshop',
        category: 'Workshop',
        venue: 'Seminar Hall',
        capacity: 40,
        date: new Date('2026-11-18'),
        time: '1:00 PM',
        description: 'Learn to build modern web applications from scratch.',
        imageUrl: '',
        createdBy: admin._id
      },
      {
        title: 'AI & ML Guest Lecture',
        category: 'Workshop',
        venue: 'Auditorium B',
        capacity: 100,
        date: new Date('2027-01-10'),
        time: '11:00 AM',
        description: 'Expert talk on Artificial Intelligence and Machine Learning.',
        imageUrl: '',
        createdBy: admin._id
      }
    ];

    await Event.insertMany(events);
    console.log('Seed events created.');

    mongoose.disconnect();
    console.log('Done and disconnected.');
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.disconnect();
  }
}

seed();
