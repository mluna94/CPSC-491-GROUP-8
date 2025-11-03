import React, { useState } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ isSignup = false, setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use environment variable or fallback to localhost for development
  // Empty string means relative URL (same domain) for production
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      // Remove trailing slash from API_URL and leading slash from endpoint if API_URL exists
      const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
      const fullUrl = apiBase ? `${apiBase}${endpoint}` : endpoint;
      
      console.log('Environment:', process.env.NODE_ENV);
      console.log('API_URL:', API_URL);
      console.log('Full URL:', fullUrl);
      
      const res = await axios.post(fullUrl, formData);
      
      // Save token and user data to localStorage (ONLY CHANGE: added user save)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth error:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Connection error. Please try again.';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <div className="flex items-center space-x-3">
          <div className="logo-container">
            <div className="logo-inner"></div>
          </div>
          <span className="font-bold text-lg">Quizzy</span>
        </div>
      </div>

      <div className="auth-form">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h2>

        {isSignup && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Loading...' : (isSignup ? 'Sign up' : 'Login')}
        </button>

        <div className="divider">OR</div>

        <button className="social-button google">
          <span>Continue with Google</span>
        </button>

        <button className="social-button github">
          <span>Continue with GitHub</span>
        </button>

        <p className="text-center text-gray-600 mt-6">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a 
            href={isSignup ? '/login' : '/signup'} 
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isSignup ? 'Login' : 'Sign up'}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
