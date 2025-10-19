import React from 'react';
import { Clock } from 'lucide-react';
import Header from './Header';

const Dashboard = ({ user, setUser }) => (
  <div className="min-h-screen bg-white">
    <Header user={user} setUser={setUser} showAuthLinks={false} />
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
          <div className="topic-grid">
            <button className="topic-button">Arrays</button>
            <button className="topic-button">RAG</button>
            <button className="topic-button">Hash Maps</button>
            <button className="topic-button">Cars</button>
            <button className="topic-button">Rocks</button>
            <button className="topic-button">Linux</button>
            <button className="topic-button">LLM</button>
          </div>
        </div>
        <div className="recent-activity">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-gray-700 mb-6">You completed a total of 10 quizzes</p>
          <div className="space-y-4">
            {['Hash Maps', 'LLM', 'RAG', 'Cars'].map((topic, index) => (
              <div key={index} className="activity-item">
                <h4 className="font-bold text-gray-900 underline">{topic}</h4>
                <p className="text-gray-600 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  2/2/2025
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;