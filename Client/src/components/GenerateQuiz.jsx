import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
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
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, TXT, or MD file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setError('');
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedQuiz(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to generate quizzes');
        navigate('/login');
        return;
      }

      let response;
      const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
      const endpoint = `${apiBase}/api/quiz/generate`;

      if (activeTab === 'upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('numQuestions', numQuestions);
        
        response = await axios.post(endpoint, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
      } else if (activeTab === 'paste' && textContent.trim()) {
        response = await axios.post(endpoint, {
          text: textContent,
          numQuestions: numQuestions
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
      } else {
        setError('Please provide content to generate a quiz');
        return;
      }
      
      if (response.data && response.data.quiz) {
        setGeneratedQuiz(response.data);
        // Clear form
        setUploadedFile(null);
        setTextContent('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      
    } catch (err) {
      console.error('Generate error:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to generate quiz. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedQuiz(null);
    setError('');
  };

  // Success View - Show generated quiz summary
  if (generatedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
        <Header user={user} setUser={setUser} />

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quiz Generated Successfully! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              Your AI-powered quiz has been created and saved to your account
            </p>

            {/* Quiz Details */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Title:</strong> {generatedQuiz.quiz.title}
                </p>
                <p className="text-gray-700">
                  <strong>Description:</strong> {generatedQuiz.quiz.description}
                </p>
                <p className="text-gray-700">
                  <strong>Questions Generated:</strong> {generatedQuiz.questions.length}
                </p>
                <p className="text-gray-700">
                  <strong>Quiz ID:</strong> {generatedQuiz.quiz.id}
                </p>
                <p className="text-gray-700">
                  <strong>Created:</strong> {new Date(generatedQuiz.quiz.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Generated Questions Preview */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Questions Preview</h2>
              <div className="space-y-4">
                {generatedQuiz.questions.map((q, index) => (
                  <div key={q.id} className="border-b border-gray-200 pb-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      {index + 1}. {q.question}
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {q.choices.map((choice, choiceIndex) => (
                        <li 
                          key={choice.id} 
                          className={`text-gray-700 ${choice.is_correct ? 'text-green-600 font-semibold' : ''}`}
                        >
                          {['A', 'B', 'C', 'D'][choiceIndex]}. {choice.text}
                          {choice.is_correct && ' ✓ (Correct)'}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p className="text-sm text-gray-600 mt-2 ml-4">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleGenerateAnother}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Generate Another Quiz
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generation Form View
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
      <Header user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Quiz</h1>
        <p className="text-gray-700 mb-8">
          Upload a document or paste text to automatically generate quiz questions using AI
        </p>

        {/* Number of Questions Selector */}
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

        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`tab-button ${activeTab === 'upload' ? 'tab-active' : 'tab-inactive'}`}
          >
            <Upload className="inline mr-2" size={20} />
            Upload Document
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`tab-button ${activeTab === 'paste' ? 'tab-active' : 'tab-inactive'}`}
          >
            <FileText className="inline mr-2" size={20} />
            Paste Text
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              
              {uploadedFile ? (
                <div className="text-center">
                  <FileText className="mx-auto mb-4 text-blue-600" size={48} />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your file here, or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports PDF, DOC, DOCX, TXT, and MD files (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paste Tab */}
        {activeTab === 'paste' && (
          <div>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Paste your study material here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2 text-left">
              {textContent.length} characters (minimum 100 characters required)
            </p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading || (!uploadedFile && !textContent.trim()) || (activeTab === 'paste' && textContent.length < 100)}
            className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Quiz...' : 'Generate Quiz with AI'}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 mt-2">
              AI is analyzing your content and generating questions...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This usually takes 10-30 seconds
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload a document or paste your study material (minimum 100 characters)</li>
            <li>Choose the number of questions you want (5-20)</li>
            <li>Our AI (Claude) analyzes the content and identifies key concepts</li>
            <li>Multiple choice questions are automatically generated with explanations</li>
            <li>Your quiz is saved to your account for future use</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Tip:</strong> For best results, provide well-structured content with clear concepts and topics.
              The AI works best with educational material, study notes, or informative articles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuiz;
