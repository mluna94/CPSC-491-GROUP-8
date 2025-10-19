const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

// CORS configuration for separate frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  /\.vercel\.app$/  // Allow all Vercel preview deployments
];

// Server/index.js
app.use(cors({
  origin: ['https://quizzy.vercel.app', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Test Supabase connection
const supabase = require('./config/supabase');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running with Supabase' });
});

app.use('/api/auth', authRoutes);

// Export for Vercel (serverless)
module.exports = app;

// For local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Using Supabase for database');
  });
}

