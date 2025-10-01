import React, { useState } from 'react';
import { User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // For redirection

const AuthForm = ({ isSignup = false, setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');  // Redirect using router
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{isSignup ? 'Sign Up' : 'Login'}</h2>

        <div className="space-y-4 mb-6">
          {isSignup && (
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                name="name"
                onChange={handleChange}
                type="text"
                placeholder="Full Name"
                className="form-input"
                value={formData.name}
              />
            </div>
          )}

          <div className="input-group">
            <svg className="w-5 h-5 input-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input
              name="email"
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="form-input"
              value={formData.email}
            />
          </div>

          <div className="input-group">
            <svg className="w-5 h-5 input-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <input
              name="password"
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="form-input"
              value={formData.password}
            />
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full primary-button mb-4">
          {isSignup ? 'Sign up' : 'Login'}
        </button>

        <div className="text-center text-gray-500 mb-4">or</div>

        <div className="social-buttons">
          <button className="social-button">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>
          <button className="social-button">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-gray-600">
          {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
          <button
            onClick={() => navigate(isSignup ? '/login' : '/signup')}
            className="text-black underline font-medium"
          >
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;