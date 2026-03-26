import React from 'react';

function Header({ user, onLogout }) {
  const roleLabel = user?.role === 'admin' ? 'Administrator' : user?.role;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-2xl text-white shadow-lg shadow-cyan-600/30">
            🧠
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Exam Evaluator</h1>
            <p className="text-sm text-slate-500">Role-based evaluation workflow for schools and instructors</p>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">{roleLabel}</p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">Secure login required</div>
        )}
      </div>
    </header>
  );
}

export default Header;
