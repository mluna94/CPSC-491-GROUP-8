import React from 'react';
import Header from './Header';
import { Link } from 'react-router-dom';

const LandingPage = ({ user, setUser }) => (
  <div className="min-h-screen bg-gradient-blue">
    <Header user={user} setUser={setUser} showAuthLinks={true} />
    <div className="landing-hero">
      <h1 className="hero-title md:text-5xl">
        Master and learn any topic faster with<br />
        AI-powered flashcards
      </h1>
      <p className="hero-subtitle">built for students, designed for self-learners.</p>
      <Link to="/dashboard" className="primary-button">
        Get started
      </Link>
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
            <div className="preview-topics">
              <span className="font-bold">Arrays</span>
              <span className="font-bold">RAG</span>
              <span className="font-bold">Hash Maps</span>
              <span className="font-bold">Cars</span>
              <span className="font-bold">Rocks</span>
              <span className="font-bold">Linux</span>
              <span className="font-bold">LLM</span>
            </div>
          </div>
          <div className="preview-section">
            <h4 className="font-bold mb-2">Recent Activity</h4>
            <p className="text-sm text-gray-700 mb-3">You completed a total of 10 quizzes</p>
            <div className="preview-activities space-y-2">
              {['Hash Maps', 'LLM', 'RAG', 'Cars'].map((topic, index) => (
                <div key={index} className="preview-activity">
                  <span className="preview-activity-title">{topic}</span>
                  <p className="preview-activity-date">⏰ 2/2/2025</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LandingPage;