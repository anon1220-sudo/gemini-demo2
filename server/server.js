import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import logRoutes from './routes/logs.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
// Vercel handles the port, local needs 5000
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Vercel deployment puts frontend and backend on the same origin, 
// so strictly speaking CORS isn't needed for production, but good for safety/local.
app.use(cors({
  origin: '*',
  credentials: true
}));

// --- Database Connection Caching for Serverless ---
// This is crucial! In serverless, the function freezes/thaws. 
// We must reuse the connection to avoid hitting MongoDB connection limits.
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  if (!MONGODB_URI) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables.');
    // Don't throw here to allow the app to start, but API calls will fail gracefully
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB Connected (Cached)');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  }
};

// Middleware to ensure DB is connected before handling any request
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);

app.get('/', (req, res) => {
  res.send('My Learning Blog API is running on Vercel!');
});

// --- Server Startup ---
// Only listen on a port if we are running locally (not in Vercel production)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    // Force connection on startup for local dev
    await connectToDatabase(); 
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless Functions
export default app;