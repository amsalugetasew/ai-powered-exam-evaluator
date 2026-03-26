import React, { useEffect, useState } from 'react';
import EvaluationResult from './EvaluationResult';
import { getStudentExams, submitStudentAnswer } from '../services/api';

function StudentDashboard({ user }) {
  const [exams, setExams] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');
  const [error, setError] = useState('');

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentExams();
      const examList = data.exams || [];
      setExams(examList);
      setAnswers(
        examList.reduce((accumulator, exam) => {
          accumulator[exam.id] = exam.submission?.answer || '';
          return accumulator;
        }, {})
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load exams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleSubmit = async (examId) => {
    setSubmittingId(examId);
    setError('');
    try {
      const response = await submitStudentAnswer(examId, answers[examId] || '');
      const nextSubmission = response.submission;
      setExams((current) =>
        current.map((exam) => (exam.id === examId ? { ...exam, submission: nextSubmission } : exam))
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to submit answer.');
    } finally {
      setSubmittingId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Student Page</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Submit your answers</h2>
        <p className="mt-2 text-sm text-slate-500">Welcome, {user.name}. Answer each published question and the system will evaluate your response immediately.</p>

        <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          Only the question is shown here. The instructor's correct answer stays hidden and is used only by the system during evaluation.
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={loadExams}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            Refresh exams
          </button>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading exam list...</p>
        ) : exams.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No exams are available yet.</p>
        ) : (
          <div className="mt-6 space-y-5">
            {exams.map((exam) => {
              const isSubmitting = submittingId === exam.id;
              const answer = answers[exam.id] || '';

              return (
                <div key={exam.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Instructor: {exam.instructorName}</p>
                    </div>
                    {exam.submission && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                        Latest score {exam.submission.score}%
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{exam.question}</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Your Answer</label>
                    <textarea
                      value={answer}
                      onChange={(event) =>
                        setAnswers((current) => ({ ...current, [exam.id]: event.target.value }))
                      }
                      rows={7}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      placeholder="Write your answer here..."
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSubmit(exam.id)}
                      disabled={isSubmitting || !answer.trim()}
                      className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isSubmitting ? 'Evaluating...' : 'Submit for Evaluation'}
                    </button>
                  </div>

                  {exam.submission && (
                    <div className="mt-5">
                      <EvaluationResult result={exam.submission} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;