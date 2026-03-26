import React, { useEffect, useMemo, useState } from 'react';
import {
  changeUserPassword,
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../services/api';

const initialForm = {
  name: '',
  username: '',
  password: '',
  role: 'student',
};

function AdminDashboard({ currentUser, onCurrentUserUpdate }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState(initialForm);
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [busyAction, setBusyAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sortedUsers = useMemo(
    () => [...users].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
    [users]
  );

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const beginEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
    });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createUser(form);
      setSuccess('User registered successfully.');
      setForm(initialForm);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (userId) => {
    setBusyAction(`edit-${userId}`);
    setError('');
    setSuccess('');

    try {
      const response = await updateUser(userId, {
        name: editForm.name,
        username: editForm.username,
        role: editForm.role,
      });

      setUsers((current) =>
        current.map((user) => (user.id === userId ? response.user : user))
      );

      if (response.user.id === currentUser.id) {
        onCurrentUserUpdate(response.user);
      }

      setSuccess('User updated successfully.');
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to update user.');
    } finally {
      setBusyAction('');
    }
  };

  const handlePasswordChange = async (userId) => {
    const password = (passwordDrafts[userId] || '').trim();
    if (!password) {
      setError('Enter a new password before saving.');
      setSuccess('');
      return;
    }

    setBusyAction(`password-${userId}`);
    setError('');
    setSuccess('');

    try {
      await changeUserPassword(userId, password);
      setPasswordDrafts((current) => ({ ...current, [userId]: '' }));
      setSuccess('Password updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to update password.');
    } finally {
      setBusyAction('');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name} (${user.username})?`);
    if (!confirmed) return;

    setBusyAction(`delete-${user.id}`);
    setError('');
    setSuccess('');

    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editingId === user.id) {
        cancelEdit();
      }
      setSuccess('User deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to delete user.');
    } finally {
      setBusyAction('');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Registration</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Create user accounts</h2>
        <p className="mt-2 text-sm text-slate-500">
          Only administrators can register students, instructors, and other administrators.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(event) => handleChange('username', event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Default Password</label>
            <input
              type="text"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(event) => handleChange('role', event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? 'Creating account...' : 'Register User'}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Users</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Registered accounts</h2>
          </div>
          <button
            onClick={loadUsers}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">No users found.</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Username</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {sortedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium">
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(event) => handleEditChange('name', event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(event) => handleEditChange('username', event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {editingId === user.id ? (
                        <select
                          value={editForm.role}
                          onChange={(event) => handleEditChange('role', event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Administrator</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {editingId === user.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(user.id)}
                              disabled={busyAction === `edit-${user.id}`}
                              className="rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white disabled:bg-slate-300"
                              type="button"
                            >
                              {busyAction === `edit-${user.id}` ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                              type="button"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => beginEdit(user)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                            type="button"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && sortedUsers.length > 0 && (
          <div className="mt-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Password Change and Delete</h3>
            {sortedUsers.map((user) => (
              <div key={`${user.id}-security`} className="grid gap-3 rounded-2xl bg-white p-4 lg:grid-cols-[1fr_220px_auto_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user.username}</p>
                </div>
                <input
                  type="text"
                  value={passwordDrafts[user.id] || ''}
                  onChange={(event) =>
                    setPasswordDrafts((current) => ({ ...current, [user.id]: event.target.value }))
                  }
                  placeholder="New password"
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
                <button
                  onClick={() => handlePasswordChange(user.id)}
                  disabled={busyAction === `password-${user.id}`}
                  type="button"
                  className="rounded-2xl border border-cyan-200 px-4 py-3 text-sm font-semibold text-cyan-700 disabled:border-slate-200 disabled:text-slate-400"
                >
                  {busyAction === `password-${user.id}` ? 'Saving...' : 'Change Password'}
                </button>
                <button
                  onClick={() => handleDeleteUser(user)}
                  disabled={busyAction === `delete-${user.id}` || user.id === currentUser.id}
                  type="button"
                  className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 disabled:border-slate-200 disabled:text-slate-400"
                >
                  {busyAction === `delete-${user.id}` ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;