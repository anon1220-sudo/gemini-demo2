import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('Log', LogSchema);