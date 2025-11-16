import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const TakeQuiz = ({ user, setUser }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
      const endpoint = `${apiBase}/api/quiz/${quizId}`;

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setQuiz(response.data);
      }
    } catch (err) {
      console.error('Fetch quiz error:', err);
      setError(err.response?.data?.msg || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (choiceId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: choiceId
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      const selectedChoiceId = selectedAnswers[index];
      const correctChoice = question.choices.find(c => c.is_correct);
      if (selectedChoiceId === correctChoice.id) {
        correctAnswers++;
      }
    });

    setScore(correctAnswers);
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
        <Header user={user} setUser={setUser} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white text-lg">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
        <Header user={user} setUser={setUser} />
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  // Results View
  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
        <Header user={user} setUser={setUser} />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg p-8">
            {/* Results Header */}
            <div className="text-center mb-8">
              <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
              <p className="text-xl text-gray-600">
                You scored {score} out of {quiz.questions.length} ({percentage}%)
              </p>
            </div>

            {/* Answer Review */}
            <div className="space-y-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Review Your Answers</h2>
              {quiz.questions.map((question, index) => {
                const selectedChoiceId = selectedAnswers[index];
                const correctChoice = question.choices.find(c => c.is_correct);
                const isCorrect = selectedChoiceId === correctChoice.id;

                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start mb-4">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 mr-2 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.choices.map((choice) => {
                            const isSelected = choice.id === selectedChoiceId;
                            const isCorrectChoice = choice.is_correct;

                            return (
                              <div
                                key={choice.id}
                                className={`p-3 rounded ${
                                  isCorrectChoice
                                    ? 'bg-green-100 border border-green-500'
                                    : isSelected
                                    ? 'bg-red-100 border border-red-500'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <span className={isCorrectChoice ? 'font-semibold' : ''}>
                                  {choice.text}
                                  {isCorrectChoice && ' ✓'}
                                  {isSelected && !isCorrectChoice && ' ✗'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {question.explanation && (
                          <p className="mt-3 text-sm text-gray-600">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setScore(0);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
      <Header user={user} setUser={setUser} />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.quiz.description}</p>
          
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {currentQ.question}
          </h2>

          {/* Answer Choices */}
          <div className="space-y-3">
            {currentQ.choices.map((choice, index) => {
              const isSelected = selectedAnswers[currentQuestion] === choice.id;
              
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectAnswer(choice.id)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {['A', 'B', 'C', 'D'][index]}
                    </span>
                    <span className="font-medium text-gray-900">{choice.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
