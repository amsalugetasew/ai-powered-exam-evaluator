import React, { useState } from 'react';
import TextInput from '../components/TextInput';
import FileUpload from '../components/FileUpload';
import EvaluationResult from '../components/EvaluationResult';
import { evaluateText, evaluateFiles } from '../services/api';

function Home() {
  const [mode, setMode] = useState('text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTextSubmit = async ({ question, correctAnswer, studentAnswer }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateText(question, correctAnswer, studentAnswer);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Evaluation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async ({ questionFile, correctAnswerFile, studentAnswerFile }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateFiles(questionFile, correctAnswerFile, studentAnswerFile);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || 'Evaluation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {result ? (
        <EvaluationResult result={result} onReset={handleReset} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${
                mode === 'text'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              ✍️ Text Input
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${
                mode === 'file'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              📄 File Upload
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}
            {mode === 'text' ? (
              <TextInput onSubmit={handleTextSubmit} loading={loading} />
            ) : (
              <FileUpload onSubmit={handleFileSubmit} loading={loading} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
