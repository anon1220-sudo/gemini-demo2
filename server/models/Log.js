import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  image: {
    type: String, // Base64 string or URL
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Log', LogSchema);