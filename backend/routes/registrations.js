const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { auth } = require('../middleware/auth');

router.post('/events/:id/register', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existingReg = await Registration.findOne({ user: userId, event: eventId });
    if (existingReg) {
      return res.status(400).json({ message: 'Already registered' });
    }

    const regCount = await Registration.countDocuments({ event: eventId });
    if (regCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const registration = new Registration({ user: userId, event: eventId });
    await registration.save();
    
    res.status(201).json(registration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/events/:id/register', auth, async (req, res) => {
  try {
    const deleted = await Registration.findOneAndDelete({ user: req.user.id, event: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Registration not found' });
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/registrations/my', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id }).populate('event');
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
