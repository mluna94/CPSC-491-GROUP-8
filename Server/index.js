const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

// CORS configuration - allow all Vercel domains and localhost
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow all vercel.app domains
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    // Otherwise deny
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Quizzy Backend API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      quiz: '/api/quiz/*'
    }
  });
});
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
const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);


