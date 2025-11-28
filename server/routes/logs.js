import express from 'express';
import Log from '../models/Log.js';

const router = express.Router();

// @route   GET /api/logs
// @desc    Get all logs
router.get('/', async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/logs
// @desc    Create a new log
router.post('/', async (req, res) => {
  const { title, content, tags, date } = req.body;

  const log = new Log({
    title,
    content,
    tags,
    date
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
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags, date } = req.body;
    const updatedLog = await Log.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, date },
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json(updatedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/logs/:id
// @desc    Delete a log
router.delete('/:id', async (req, res) => {
  console.log(`[DELETE] Request received for ID: ${req.params.id}`);
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) {
      console.log(`[DELETE] Log not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Log not found' });
    }
    console.log(`[DELETE] Successfully deleted: ${req.params.id}`);
    res.json({ message: 'Log deleted' });
  } catch (err) {
    console.error(`[DELETE] Error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

export default router;