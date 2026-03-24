import React, { useState } from 'react';

function TextInput({ onSubmit, loading }) {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ question, correctAnswer, studentAnswer });
  };

  const isValid = question.trim() && correctAnswer.trim() && studentAnswer.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Question
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Enter the exam question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Correct / Model Answer
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Enter the correct or model answer..."
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          rows={5}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Student's Answer
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Enter the student's answer..."
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          rows={5}
        />
      </div>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Evaluating...
          </span>
        ) : (
          '🤖 Evaluate Answer'
        )}
      </button>
    </form>
  );
}

export default TextInput;
