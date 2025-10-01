// src/components/QuizzyApp.jsx
import React, { useState } from 'react';
import { User, Upload, X, Clock } from 'lucide-react';
import '../styles/QuizzyApp.css';

const QuizzyApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [uploadTab, setUploadTab] = useState('document');

  // // Dynamic state that would be populated by actual logic
  const [quizQuestions] = useState([]);
  const [trendingTopics] = useState([]);
  const [recentActivity] = useState([]);
  const [userNotes, setUserNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalQuizzes] = useState(0);

  const QuizQuestion = ({ isMobile = true }) => {
    // This would receive actual question data from generated quizzes
    const currentQuestion = quizQuestions.length > 0 ? quizQuestions[0] : null;

    const handleAnswerSelect = (index) => {
      setSelectedAnswer(index);
      setShowResult(false);
    };

    const handleCheck = () => {
      setShowResult(true);
    };

    const getButtonColor = (index) => {
      if (!showResult) {
        return selectedAnswer === index ? 'bg-blue-400' : 'bg-blue-400';
      }
      if (currentQuestion && index === currentQuestion.correctAnswer) {
        return 'bg-green-500';
      }
      if (selectedAnswer === index && currentQuestion && index !== currentQuestion.correctAnswer) {
        return 'bg-red-400';
      }
      return 'bg-blue-400';
    };

    // Show message if no questions generated yet
    if (!currentQuestion) {
      return (
        <div className={isMobile ? 'quiz-mobile' : 'quiz-desktop'}>
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">No Quiz Generated</h2>
            <p className="text-gray-600 mb-4">Please upload a document or enter notes to generate quiz questions.</p>
            <button
              onClick={() => setCurrentView('generate')}
              className="primary-button"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={isMobile ? 'quiz-mobile' : 'quiz-desktop'}>
        {isMobile && (
          <div className="quiz-header">
            <X className="text-gray-600" size={24} />
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="text-gray-600 font-medium">1/{quizQuestions.length}</span>
          </div>
        )}

        {!isMobile && (
          <div className="bg-gray-200 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="logo-container">
                  <div className="logo-inner"></div>
                </div>
                <span className="font-bold text-lg">Quizzy</span>
                <nav className="flex space-x-6 ml-8">
                  <span className="nav-link">Home</span>
                  <span className="nav-link">How It Works</span>
                  <span className="nav-link">FAQ</span>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-bold">5:14</span>
                <div className="user-avatar bg-gray-500">
                  <User className="text-white" size={20} />
                </div>
              </div>
            </div>
            <div className="text-left">
              <span className="text-lg font-medium">Question 1/{quizQuestions.length}</span>
            </div>
          </div>
        )}

        <div className="quiz-question">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {currentQuestion.questionText}
          </h1>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`answer-button ${getButtonColor(index)}`}
              >
                <div className="answer-letter">
                  <span className="text-white font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="answer-text">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCheck}
              className="secondary-button"
            >
              {isMobile ? 'Check' : showResult ? 'Next' : 'Check'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="min-h-screen bg-white">
      <div className="dashboard-header">
        <div className="flex items-center space-x-3">
          <div className="logo-container">
            <div className="logo-inner"></div>
          </div>
          <span className="font-bold text-lg">Quizzy</span>
          <nav className="flex space-x-6 ml-8">
            <span className="nav-link">Home</span>
            <span className="nav-link">How It Works</span>
            <span className="nav-link">FAQ</span>
          </nav>
        </div>
        <div className="user-avatar bg-blue-500">
          <User className="text-black" size={20} />
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="quiz-me-section">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Me!</h2>
          <p className="text-gray-700">generate a quiz</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="trending-topics">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trending Topics</h3>
            <p className="text-gray-700 mb-6">click on a topic to begin</p>

            {trendingTopics.length > 0 ? (
              <div className="topic-grid">
                {trendingTopics.map((topic, index) => (
                  <button key={index} className="topic-button">{topic}</button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No trending topics yet</p>
                <p className="text-sm text-gray-400">Topics will appear as you create more quizzes</p>
              </div>
            )}
          </div>

          <div className="recent-activity">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h3>
            <p className="text-gray-700 mb-6">You completed a total of {totalQuizzes} quizzes</p>

            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <h4 className="font-bold text-gray-900 underline">{activity.topic}</h4>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {activity.date}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No recent activity</p>
                <button
                  onClick={() => setCurrentView('generate')}
                  className="primary-button"
                >
                  Create Your First Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const GenerateQuiz = () => {
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      setUploadedFile(file);
      // Here you would implement file processing logic
    };

    const handleNotesChange = (event) => {
      setUserNotes(event.target.value);
    };

    const handleGenerate = () => {
      if (uploadTab === 'document' && !uploadedFile) {
        alert('Please upload a document first');
        return;
      }
      if (uploadTab === 'text' && !userNotes.trim()) {
        alert('Please enter some notes first');
        return;
      }

      setIsGenerating(true);
      // Here you would implement quiz generation logic
      // For demo purposes, just simulate loading
      setTimeout(() => {
        setIsGenerating(false);
        alert('Quiz generation would happen here based on your content!');
      }, 2000);
    };

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="dashboard-header">
          <div className="flex items-center space-x-3">
            <div className="logo-container">
              <div className="logo-inner"></div>
            </div>
            <span className="font-bold text-lg">Quizzy</span>
            <nav className="flex space-x-6 ml-8">
              <span className="nav-link">Home</span>
              <span className="nav-link">How It Works</span>
              <span className="nav-link">FAQ</span>
            </nav>
          </div>
          <div className="user-avatar bg-blue-500">
            <User className="text-black" size={20} />
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate a quiz</h1>
          <p className="text-gray-600 mb-6">Upload a document, type a topic or paste notes to generate questions</p>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setUploadTab('document')}
              className={`tab-button ${uploadTab === 'document' ? 'tab-active' : 'tab-inactive'}`}
            >
              Document
            </button>
            <button
              onClick={() => setUploadTab('text')}
              className={`tab-button ${uploadTab === 'text' ? 'tab-active' : 'tab-inactive'}`}
            >
              Text
            </button>
          </div>

          {uploadTab === 'document' ? (
            <div className="upload-area">
              <Upload className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-600 text-lg mb-4">Drag or upload a document</p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="mb-4"
              />
              {uploadedFile && (
                <p className="text-green-600">Selected: {uploadedFile.name}</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 rounded-lg p-6 mb-6">
              <textarea
                placeholder="Paste in your notes or content"
                value={userNotes}
                onChange={handleNotesChange}
                className="textarea-large focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="primary-button"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    );
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-blue">
      <div className="dashboard-header">
        <div className="flex items-center space-x-3">
          <div className="logo-container">
            <div className="logo-inner"></div>
          </div>
          <span className="font-bold text-lg">Quizzy</span>
          <nav className="flex space-x-6 ml-8">
            <span className="nav-link">Home</span>
            <span className="nav-link">How It Works</span>
            <span className="nav-link">FAQ</span>
          </nav>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => setCurrentView('login')} className="px-4 py-2 text-gray-700 hover:bg-blue-400 rounded transition-colors">
            Login
          </button>
          <button onClick={() => setCurrentView('signup')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Sign up
          </button>
        </div>
      </div>

      <div className="landing-hero">
        <h1 className="hero-title md:text-5xl">
          Master and learn any topic faster with<br />
          AI-powered flashcards
        </h1>
        <p className="hero-subtitle">built for students, designed for self-learners.</p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="primary-button"
        >
          Get started
        </button>
      </div>

      <div className="px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Personalized learning just for you
        </h2>

        <div className="dashboard-preview">
          <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <span className="font-bold text-lg">Dashboard</span>
          </div>

          <div className="preview-section">
            <h3 className="font-bold">Quiz Me!</h3>
            <p className="text-sm text-gray-700">generate a quiz</p>
          </div>

          <div className="preview-grid">
            <div className="preview-section">
              <h4 className="font-bold mb-2">Trending Topics</h4>
              <p className="text-sm text-gray-700 mb-3">click on a topic to begin</p>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Topics appear as you create quizzes</p>
              </div>
            </div>

            <div className="preview-section">
              <h4 className="font-bold mb-2">Recent Activity</h4>
              <p className="text-sm text-gray-700 mb-3">Track your quiz progress</p>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Activity appears after taking quizzes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AuthForm = ({ isSignup = false }) => (
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
                type="text"
                placeholder="Full Name"
                className="form-input"
              />
            </div>
          )}

          <div className="input-group">
            <svg className="w-5 h-5 input-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input
              type="email"
              placeholder="Email"
              className="form-input"
            />
          </div>

          <div className="input-group">
            <svg className="w-5 h-5 input-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="form-input"
            />
          </div>
        </div>

        <button className="w-full primary-button mb-4">
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
            onClick={() => setCurrentView(isSignup ? 'login' : 'signup')}
            className="text-black underline font-medium"
          >
            {isSignup ? 'Login' : 'Login?'}
          </button>
        </p>
      </div>
    </div>
  );

  const navButtons = (
    <div className="nav-buttons">
      <button onClick={() => setCurrentView('landing')} className="nav-button">Landing</button>
      <button onClick={() => setCurrentView('signup')} className="nav-button">Sign Up</button>
      <button onClick={() => setCurrentView('login')} className="nav-button">Login</button>
      <button onClick={() => setCurrentView('dashboard')} className="nav-button">Dashboard</button>
      <button onClick={() => setCurrentView('generate')} className="nav-button">Generate</button>
      <button onClick={() => setCurrentView('quiz-mobile')} className="nav-button">Quiz Mobile</button>
      <button onClick={() => setCurrentView('quiz-desktop')} className="nav-button">Quiz Desktop</button>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'quiz-mobile':
        return <QuizQuestion isMobile={true} />;
      case 'quiz-desktop':
        return <QuizQuestion isMobile={false} />;
      case 'dashboard':
        return <Dashboard />;
      case 'generate':
        return <GenerateQuiz />;
      case 'signup':
        return <AuthForm isSignup={true} />;
      case 'login':
        return <AuthForm isSignup={false} />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative">
      {renderView()}
      {navButtons}
    </div>
  );
};

export default QuizzyApp;