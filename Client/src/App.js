import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './styles/QuizzyApp.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import GenerateQuiz from './components/GenerateQuiz';
import LandingPage from './components/LandingPage';
import QuizQuestion from './components/QuizQuestion';

const App = () => {
  const [user, setUser] = useState(null);

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