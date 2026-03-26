import React, { useState } from 'react';

function LoginPage({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ username, password });
  };

  const canSubmit = username.trim() && password.trim() && !loading;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-950 via-slate-900 to-teal-900 p-8 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Role-Based Exam Workspace</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">One system for administrators, instructors, and students.</h2>
          <p className="mt-4 max-w-xl text-sm text-slate-200 leading-7">
            Administrators register users, instructors publish questions with model answers, and students submit responses to receive AI evaluation with percentage breakdowns and reasons.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Admin</p>
              <p className="mt-2 text-sm text-slate-100">Create accounts and assign roles with default login credentials.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Instructor</p>
              <p className="mt-2 text-sm text-slate-100">Load questions and correct answers, then review student evaluations by name.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Student</p>
              <p className="mt-2 text-sm text-slate-100">Answer assigned questions and immediately see score, reasons, and feedback.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Login</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Access your dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Use the username and password created by the administrator.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Default admin credentials are seeded from the server environment. If unchanged, use username <span className="font-semibold text-slate-900">admin</span> and password <span className="font-semibold text-slate-900">admin123</span>.
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;