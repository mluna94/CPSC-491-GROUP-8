import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import Header from './Header';

const GenerateQuiz = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'paste'
  const [textContent, setTextContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  
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
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, TXT, or MD file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setError('');
  };

  const removeFile = () => {
    setUploadedFile(null);
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      let content = '';

      if (activeTab === 'upload' && uploadedFile) {
        // Read file content
        const formData = new FormData();
        formData.append('file', uploadedFile);

        // TODO: Send to backend API
        // const response = await axios.post(`${API_URL}/api/quiz/generate`, formData);
        
        alert('File uploaded: ' + uploadedFile.name + '\n\nBackend API integration coming soon!');
      } else if (activeTab === 'paste' && textContent.trim()) {
        // Send text content
        // TODO: Send to backend API
        // const response = await axios.post(`${API_URL}/api/quiz/generate`, { text: textContent });
        
        alert('Text content received!\n\nBackend API integration coming soon!');
      } else {
        setError('Please provide content to generate a quiz');
      }
    } catch (err) {
      console.error('Generate error:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400">
      <Header user={user} setUser={setUser} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Quiz</h1>
        <p className="text-gray-700 mb-8">
          Upload a document or paste text to automatically generate quiz questions
        </p>

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
              className={`upload-area ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop a file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or
              </p>
              <label className="primary-button inline-block cursor-pointer">
                Browse Files
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileInput}
                />
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: PDF, DOC, DOCX, TXT, MD (Max 10MB)
              </p>
            </div>

            {/* Uploaded File Display */}
            {uploadedFile && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-300 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="text-blue-500 mr-3" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={24} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paste Tab */}
        {activeTab === 'paste' && (
          <div className="upload-area">
            <textarea
              className="textarea-large"
              placeholder="Paste your text content here... (lecture notes, articles, study materials, etc.)"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2 text-left">
              {textContent.length} characters
            </p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleGenerate}
            disabled={loading || (!uploadedFile && !textContent.trim())}
            className="primary-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload a document or paste your study material</li>
            <li>Our AI analyzes the content and identifies key concepts</li>
            <li>Multiple choice questions are automatically generated</li>
            <li>Review and practice with your personalized quiz</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuiz;


