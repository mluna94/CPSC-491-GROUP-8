import React, { useState } from 'react';
import { User, X } from 'lucide-react';
import Header from './Header';

const QuizQuestion = ({ user, setUser, isMobile = true, questionText, options, correctAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

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
    if (index === correctAnswer) {
      return 'bg-green-500';
    }
    if (selectedAnswer === index && index !== correctAnswer) {
      return 'bg-red-400';
    }
    return 'bg-blue-400';
  };

  return (
    <div className={isMobile ? 'quiz-mobile' : 'quiz-desktop'}>
      {isMobile ? (
        <div className="quiz-header">
          <X className="text-gray-600" size={24} />
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="text-gray-600 font-medium">1/10</span>
        </div>
      ) : (
        <Header user={user} setUser={setUser} showAuthLinks={false} />
      )}
      <div className="quiz-question">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {questionText}
        </h1>
        <div className="space-y-4 mb-8">
          {options.map((option, index) => (
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

export default QuizQuestion;