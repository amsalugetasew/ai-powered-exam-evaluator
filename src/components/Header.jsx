import React from 'react';

function Header() {
  return (
    <header className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧠</span>
          <div>
            <h1 className="text-2xl font-bold">AI Exam Evaluator</h1>
            <p className="text-indigo-200 text-sm mt-1">
              Evaluate student answers with AI-powered intelligence
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
