import React from 'react';

function ScoreCircle({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = ((100 - score) / 100) * circumference;

  const getColor = (s) => {
    if (s >= 85) return '#22c55e';
    if (s >= 70) return '#3b82f6';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s) => {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Average';
    return 'Needs Work';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
        />
        <text
          x="65"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill={color}
        >
          {score}
        </text>
        <text
          x="65"
          y="80"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#6b7280"
        >
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold mt-1" style={{ color }}>
        {getLabel(score)}
      </span>
    </div>
  );
}

function EvaluationResult({ result, onReset }) {
  if (!result) return null;

  const { score, feedback, suggestions = [], questionBreakdown = [] } = result;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">📊 Evaluation Result</h2>
        <button
          onClick={onReset}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← New Evaluation
        </button>
      </div>

      <div className="flex flex-col items-center py-4">
        <ScoreCircle score={score} />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Feedback</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{feedback}</p>
      </div>

      {questionBreakdown.length > 0 && (
        <div className="bg-emerald-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-emerald-900 mb-3">
            🧾 Per Question Percentage & Reason
          </h3>
          <div className="space-y-3">
            {questionBreakdown.map((item, idx) => (
              <div key={idx} className="bg-white border border-emerald-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-800">Q{idx + 1}: {item.question}</p>
                  <span className="text-sm font-bold text-emerald-700 whitespace-nowrap">
                    {item.percentage}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-indigo-800 mb-3">🎯 Improvement Suggestions</h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-indigo-700">
                <span className="mt-0.5 text-indigo-500">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EvaluationResult;
