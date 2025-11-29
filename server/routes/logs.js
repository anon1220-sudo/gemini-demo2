import express from 'express';
import Log from '../models/Log.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/logs
// @desc    Get all logs for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const logs = await Log.find({ user: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/logs
// @desc    Create a new log
router.post('/', auth, async (req, res) => {
  const { title, content, tags, date, image } = req.body;

  const log = new Log({
    user: req.user.id,
    title,
    content,
    tags,
    date,
    image
  });

  try {
    const newLog = await log.save();
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/logs/:id
// @desc    Update a log
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags, date, image } = req.body;
    
    // Ensure the log belongs to the user
    let log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    if (log.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    log = await Log.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, date, image },
      { new: true, runValidators: true }
    );

    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/logs/:id
// @desc    Delete a log
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    
    // Ensure the log belongs to the user
    if (log.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Log.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;