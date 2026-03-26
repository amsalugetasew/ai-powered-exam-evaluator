import React, { useEffect, useState } from 'react';
import { createExam, createExamWithFiles, getInstructorExams } from '../services/api';

const initialForm = {
  title: '',
  question: '',
  correctAnswer: '',
};

function InstructorDashboard() {
  const [exams, setExams] = useState([]);
  const [entryMode, setEntryMode] = useState('text');
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({ questionFile: null, correctAnswerFile: null });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const accept =
    '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInstructorExams();
      setExams(data.exams || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load instructor dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setFiles((current) => ({ ...current, [field]: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (entryMode === 'file') {
        await createExamWithFiles({
          title: form.title,
          questionFile: files.questionFile,
          correctAnswerFile: files.correctAnswerFile,
        });
      } else {
        await createExam(form);
      }

      setForm(initialForm);
      setFiles({ questionFile: null, correctAnswerFile: null });
      setSuccess('Question and correct answer loaded successfully.');
      await loadExams();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to create exam.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Instructor Page</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Load question and correct answer</h2>
        <p className="mt-2 text-sm text-slate-500">Students will see the question only. Their answers will be evaluated against your model answer.</p>

        <div className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setEntryMode('text')}
            className={`rounded-2xl px-4 py-2 transition ${
              entryMode === 'text' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('file')}
            className={`rounded-2xl px-4 py-2 transition ${
              entryMode === 'file' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500'
            }`}
          >
            Upload Files
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="Example: Midterm Essay Question 1"
            />
          </div>

          {entryMode === 'text' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Question</label>
                <textarea
                  value={form.question}
                  onChange={(event) => handleChange('question', event.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Correct Answer</label>
                <textarea
                  value={form.correctAnswer}
                  onChange={(event) => handleChange('correctAnswer', event.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Question File</label>
                <input
                  type="file"
                  accept={accept}
                  onChange={(event) => handleFileChange('questionFile', event.target.files?.[0] || null)}
                  className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {files.questionFile && (
                  <p className="mt-2 text-xs text-slate-500">Selected: {files.questionFile.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Correct Answer File</label>
                <input
                  type="file"
                  accept={accept}
                  onChange={(event) => handleFileChange('correctAnswerFile', event.target.files?.[0] || null)}
                  className="block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {files.correctAnswerFile && (
                  <p className="mt-2 text-xs text-slate-500">Selected: {files.correctAnswerFile.name}</p>
                )}
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                Students will only receive the question text extracted from your uploaded file. The correct answer stays on the instructor side for evaluation only.
              </div>
            </>
          )}

          {error && <div className="lg:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {success && <div className="lg:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                !form.title.trim() ||
                (entryMode === 'text'
                  ? !form.question.trim() || !form.correctAnswer.trim()
                  : !files.questionFile || !files.correctAnswerFile)
              }
              className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? 'Saving...' : 'Publish Exam'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Evaluation Tracking</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Student results by exam</h2>
          </div>
          <button
            onClick={loadExams}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No exams published yet.</p>
        ) : (
          <div className="mt-6 space-y-5">
            {exams.map((exam) => (
              <div key={exam.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{exam.question}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Correct Answer</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{exam.correctAnswer}</p>
                </div>

                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Student Evaluations</p>
                  {exam.submissions.length === 0 ? (
                    <p className="text-sm text-slate-500">No student submissions yet.</p>
                  ) : (
                    exam.submissions.map((submission) => (
                      <div key={submission.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{submission.studentName}</p>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{submission.studentUsername}</p>
                          </div>
                          <div className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-800">
                            {submission.score}%
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Student Answer</p>
                            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{submission.answer}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Evaluation Reason</p>
                            <p className="mt-2 text-sm text-slate-700">{submission.feedback}</p>
                          </div>
                        </div>

                        {submission.questionBreakdown?.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {submission.questionBreakdown.map((item, index) => (
                              <div key={`${submission.id}-${index}`} className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                                <span className="font-semibold">Q{index + 1}:</span> {item.question} <span className="ml-2 font-semibold">{item.percentage}%</span>
                                <p className="mt-1 text-emerald-800">{item.why}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default InstructorDashboard;