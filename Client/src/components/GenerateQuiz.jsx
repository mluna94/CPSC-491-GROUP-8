import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import Header from './Header';

const GenerateQuiz = ({ user, setUser }) => {
  const [uploadTab, setUploadTab] = useState('document');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} setUser={setUser} showAuthLinks={false} />
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
            <p className="text-gray-600 text-lg">Drag or upload a document</p>
          </div>
        ) : (
          <div className="bg-gray-200 rounded-lg p-6 mb-6">
            <textarea
              placeholder="Paste in your notes or content"
              className="textarea-large focus:outline-none"
            />
          </div>
        )}
        <button className="primary-button">Generate</button>
      </div>
    </div>
  );
};

export default GenerateQuiz;