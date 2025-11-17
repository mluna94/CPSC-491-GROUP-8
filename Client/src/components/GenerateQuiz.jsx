import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const GenerateQuiz = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [textContent, setTextContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // === DRAG & DROP ===
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];
    if (!allowed.includes(file.type)) return setError('Only PDF, DOC, DOCX, TXT, MD allowed');
    if (file.size > 10 * 1024 * 1024) return setError('File must be < 10MB');
    setUploadedFile(file);
    setError('');
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // === GENERATE QUIZ ===
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedQuiz(null);
    setShowResults(false);
    setUserAnswers({});
    setScore(0);

    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const endpoint = `${API_URL.replace(/\/$/, '')}/api/quiz/generate`;
      let response;

      if (activeTab === 'upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('numQuestions', numQuestions);
        response = await axios.post(endpoint, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else if (activeTab === 'paste' && textContent.trim().length >= 100) {
        response = await axios.post(endpoint, { text: textContent, numQuestions }, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
      } else {
        setError('Provide content (min 100 chars)');
        return;
      }

      setGeneratedQuiz(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  // === HANDLE ANSWER SELECTION ===
  const selectAnswer = (questionId, choiceId) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  // === SUBMIT QUIZ ===
  const submitQuiz = () => {
    let correct = 0;
    generatedQuiz.questions.forEach(q => {
      const correctChoice = q.choices.find(c => c.is_correct);
      if (userAnswers[q.id] === correctChoice.id) correct++;
    });
    setScore(correct);
    setShowResults(true);
  };

  // === RESTART ===
  const handleGenerateAnother = () => {
    setGeneratedQuiz(null);
    setTextContent('');
    setUploadedFile(null);
    setUserAnswers({});
    setShowResults(false);
  };

  // === SUCCESS + QUIZ TAKING VIEW ===
  if (generatedQuiz) {
    const totalQuestions = generatedQuiz.questions.length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
        <Header user={user} setUser={setUser} />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{generatedQuiz.quiz.title}</h1>
            <p className="text-gray-600 mb-6">{generatedQuiz.quiz.description}</p>

            {!showResults ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Question <strong>{Object.keys(userAnswers).length}</strong> of {totalQuestions} answered
                  </p>
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(userAnswers).length !== totalQuestions}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Submit Quiz <ChevronRight className="ml-1" size={18} />
                  </button>
                </div>

                <div className="space-y-8">
                  {generatedQuiz.questions.map((q, i) => {
                    const selectedChoiceId = userAnswers[q.id];
                    const correctChoice = q.choices.find(c => c.is_correct);

                    return (
                      <div key={q.id} className="border-b pb-6">
                        <p className="font-semibold text-lg mb-3">
                          {i + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.choices.map(choice => (
                            <label
                              key={choice.id}
                              className={`flex items-center p-3 rounded-lg border cursor-pointer transition
                                ${selectedChoiceId === choice.id
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={selectedChoiceId === choice.id}
                                onChange={() => selectAnswer(q.id, choice.id)}
                                className="mr-3"
                              />
                              <span className="flex-1">{choice.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(userAnswers).length !== totalQuestions}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-lg font-semibold"
                  >
                    Submit and See Results
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* RESULTS */}
                <div className="text-center mb-8">
                  <CheckCircle className="mx-auto mb-4 text-green-600" size={72} />
                  <h2 className="text-3xl Deferred font-bold">Quiz Complete!</h2>
                  <p className="text-2xl mt-2">
                    Your Score: <strong className="text-green-600">{score}</strong> / {totalQuestions}
                  </p>
                  <p className="text-lg text-gray-600 mt-1">
                    ({Math.round((score / totalQuestions) * 100)}%)
                  </p>
                </div>

                <div className="space-y-6">
                  {generatedQuiz.questions.map((q, i) => {
                    const userChoice = q.choices.find(c => c.id === userAnswers[q.id]);
                    const correctChoice = q.choices.find(c => c.is_correct);
                    const isCorrect = userChoice?.id === correctChoice.id;

                    return (
                      <div key={q.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="font-semibold">
                          {i + 1}. {q.question}
                        </p>
                        <p className="mt-2">
                          <strong>Your Answer:</strong>{' '}
                          <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                            {userChoice?.text || 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="mt-1">
                            <strong>Correct Answer:</strong>{' '}
-<span className="text-green-700">{correctChoice.text}</span>
                          </p>
                        )}
                        {q.explanation && (
                          <p className="mt-2 text-sm text-gray-700">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    onClick={handleGenerateAnother}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Generate Another Quiz
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    View History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === GENERATION FORM ===
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
      <Header user={user} setUser={setUser} />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Quiz</h1>
        <p className="text-gray-700 mb-8">
          Upload a document or paste text to generate an interactive quiz
        </p>

        {/* Number of Questions */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions: {numQuestions}
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>20</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow'}`}
          >
            <Upload className="inline mr-2" size={20} /> Upload
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'paste' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 shadow'}`}
          >
            <FileText className="inline mr-2" size={20} /> Paste
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Upload */}
        {activeTab === 'upload' && (
          <div
            className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} accept=".pdf,.doc,.docx,.txt,.md" />
            {uploadedFile ? (
              <div>
                <FileText className="mx-auto mb-4 text-blue-600" size={48} />
                <p className="text-lg font-semibold">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-red-600 mt-2">
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-semibold">Drop file or click to upload</p>
                <p className="text-sm text-gray-600">PDF, DOC, DOCX, TXT, MD (max 10MB)</p>
              </div>
            )}
          </div>
        )}

        {/* Paste */}
        {activeTab === 'paste' && (
          <div>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 resize-none"
              placeholder="Paste your study material..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">{textContent.length} characters (min 100)</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleGenerate}
            disabled={loading || (!uploadedFile && !textContent.trim()) || (activeTab === 'paste' && textContent.length < 100)}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Interactive Quiz'}
          </button>
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
            <p className="mt-3 text-gray-700">AI is creating your quiz...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQuiz;