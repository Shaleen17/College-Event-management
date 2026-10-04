const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    await Registration.deleteMany({ event: req.params.id });
    
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/registrations', auth, adminOnly, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id }).populate('user', 'name email');
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
