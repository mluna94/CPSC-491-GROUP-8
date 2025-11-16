import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const Dashboard = ({ user, setUser }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch user's quizzes when component mounts
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
      const endpoint = `${apiBase}/api/quiz/user/all`;
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.quizzes) {
        setQuizzes(response.data.quizzes);
      }
      
    } catch (err) {
      console.error('Fetch quizzes error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to fetch quizzes';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
      const endpoint = `${apiBase}/api/quiz/${quizId}`;
      
      await axios.delete(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove quiz from state
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      
    } catch (err) {
      console.error('Delete quiz error:', err);
      alert('Failed to delete quiz');
    }
  };

  const handleTakeQuiz = (quizId) => {
    // Navigate to quiz taking view (you'll need to implement this)
    navigate(`/quiz/${quizId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} setUser={setUser} showAuthLinks={false} />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            {quizzes.length > 0 
              ? `You have ${quizzes.length} quiz${quizzes.length !== 1 ? 'es' : ''} created`
              : 'No quizzes yet. Create your first quiz!'}
          </p>
        </div>

        {/* Generate Quiz Section */}
        <div className="quiz-me-section mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Me!</h2>
              <p className="text-gray-700">Generate a new AI-powered quiz from your content</p>
            </div>
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Generate New Quiz
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your quizzes...</p>
          </div>
        ) : (
          <>
            {/* My Quizzes Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">My Quizzes</h3>
              
              {quizzes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h4>
                  <p className="text-gray-600 mb-6">
                    Get started by generating your first AI-powered quiz!
                  </p>
                  <button
                    onClick={() => navigate('/generate')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Create Your First Quiz
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      {/* Quiz Header */}
                      <div className="mb-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          {quiz.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {quiz.description}
                        </p>
                      </div>

                      {/* Quiz Meta Info */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(quiz.created_at)}
                      </div>

                      {/* Quiz Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTakeQuiz(quiz.id)}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Take Quiz
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats Section (Optional) */}
            {quizzes.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Total Quizzes</h4>
                  <p className="text-3xl font-bold text-blue-600">{quizzes.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Latest Quiz</h4>
                  <p className="text-sm font-semibold text-green-600">
                    {formatDate(quizzes[0].created_at)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Quick Action</h4>
                  <button
                    onClick={() => navigate('/generate')}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Generate Another →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
