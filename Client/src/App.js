import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './styles/QuizzyApp.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import GenerateQuiz from './components/GenerateQuiz';
import LandingPage from './components/LandingPage';
import QuizQuestion from './components/QuizQuestion';
import TakeQuiz from './components/TakeQuiz';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

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
            path="/quiz/:quizId"
            element={user ? <TakeQuiz user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz-mobile"
            element={
              <QuizQuestion
                user={user}
                setUser={setUser}
                isMobile={true}
                questionText="What is the command to display the current directory's contents?"
                answers={[
                  { id: 1, letter: 'A', text: 'ls' },
                  { id: 2, letter: 'B', text: 'cd' },
                  { id: 3, letter: 'C', text: 'pwd' },
                  { id: 4, letter: 'D', text: 'mkdir' }
                ]}
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
                questionText="What is the command to display the current directory's contents?"
                answers={[
                  { id: 1, letter: 'A', text: 'ls' },
                  { id: 2, letter: 'B', text: 'cd' },
                  { id: 3, letter: 'C', text: 'pwd' },
                  { id: 4, letter: 'D', text: 'mkdir' }
                ]}
              />
            }
          />
        </Routes>
        {/* Optional: Show nav buttons in development */}
        {/* <NavButtons /> */}
      </div>
    </Router>
  );
};

export default App;
