import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './styles/QuizzyApp.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import GenerateQuiz from './components/GenerateQuiz';
import LandingPage from './components/LandingPage';
import QuizQuestion from './components/QuizQuestion';
import axios from 'axios';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use environment variable or fallback to localhost for development
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Restore user session on component mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token with backend
          const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
          const fullUrl = apiBase ? `${apiBase}/api/auth/verify` : '/api/auth/verify';
          
          const res = await axios.get(fullUrl, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser(res.data.user);
        } catch (err) {
          console.error('Token verification failed:', err);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    restoreSession();
  }, [API_URL]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const NavButtons = () => (
    <div className="nav-buttons">
      <Link to="/" className="nav-button">Landing</Link>
      <Link to="/signup" className="nav-button">Sign Up</Link>
      <Link to="/login" className="nav-button">Login</Link>
      <Link to="/dashboard" className="nav-button">Dashboard</Link>
      <Link to="/generate" className="nav-button">Generate</Link>
      <Link to="/quiz-mobile" className="nav-button">Quiz Mobile</Link>
      <Link to="/quiz-desktop" className="nav-button">Quiz Desktop</Link>
    </div>
  );

  return (
    <Router>
      <div className="relative">
        <Routes>
          <Route path="/" element={<LandingPage user={user} setUser={setUser} />} />
          <Route path="/signup" element={<AuthForm isSignup={true} setUser={setUser} />} />
          <Route path="/login" element={<AuthForm isSignup={false} setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/generate"
            element={user ? <GenerateQuiz user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz-mobile"
            element={
              <QuizQuestion
                user={user}
                setUser={setUser}
                isMobile={true}
                questionText="What is the command to display the current directory's contents?"
                options={['cd', 'ls', 'pwd', 'mkdir']}
                correctAnswer={1}
              />
            }
          />
          <Route
            path="/quiz-desktop"
            element={
              <QuizQuestion
                user={user}
                setUser={setUser}
                isMobile={false}
                questionText="Which Sorting Algorithm has a time complexity of O(n log n)?"
                options={['Bubble Sort', 'Merge Sort', 'Selection Sort', 'Insertion Sort']}
                correctAnswer={1}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <NavButtons />
      </div>
    </Router>
  );
};

export default App;
