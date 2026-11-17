import { useEffect, useState } from 'react';
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  login,
} from '../services/api';

const emptyForm = {
  name: '',
  membership_id: '',
  role: 'member',
  password: '',
};

export default function Users() {
  // ----- Admin CRUD state -----
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  // ----- Login state -----
  const [loginForm, setLoginForm] = useState({ membership_id: '', password: '' });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch((err) => setMessage({ text: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.membership_id || !loginForm.password) {
      setLoginError('Both fields are required');
      return;
    }
    try {
      const data = await login(loginForm.membership_id, loginForm.password);
      setLoggedInUser(data.user);
      setLoginForm({ membership_id: '', password: '' });
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => setLoggedInUser(null);

  // ---------- ADMIN CRUD ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.membership_id.trim()) errs.membership_id = 'Membership ID is required';
    if (!editingId && !form.password.trim()) errs.password = 'Password required for new user';
    if (form.password && form.password.length < 4)
      errs.password = 'Password must be at least 4 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: form.name.trim(),
      membership_id: form.membership_id.trim(),
      role: form.role,
      password: form.password || undefined,
    };

    try {
      if (editingId) {
        await updateUser(editingId, payload);
        setMessage({ text: '✅ User updated', type: 'success' });
      } else {
        await addUser(payload);
        setMessage({ text: '✅ User added', type: 'success' });
      }
      setForm(emptyForm);
      setEditingId(null);
      setErrors({});
      loadUsers();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      membership_id: user.membership_id,
      role: user.role || 'member',
      password: '', // don't prefill password
    });
    setEditingId(user.id);
    setErrors({});
    setMessage({ text: '', type: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setMessage({ text: '', type: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(id);
      setMessage({ text: '🗑️ User deleted', type: 'success' });
      loadUsers();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    }
  };

  return (
    <div style={styles.page}>
      <h1>User Management</h1>

      {/* ---------- LOGIN SECTION ---------- */}
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>🔐 Login</h2>

        {loggedInUser ? (
          <div style={styles.loggedIn}>
            <p style={{ margin: 0 }}>
              Welcome, <strong>{loggedInUser.name}</strong> ({loggedInUser.role})
            </p>
            <button onClick={handleLogout} style={styles.btnSecondary}>
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            <Field
              label="Membership ID"
              name="membership_id"
              value={loginForm.membership_id}
              onChange={(e) =>
                setLoginForm({ ...loginForm, membership_id: e.target.value })
              }
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />
            <div style={styles.actions}>
              <button type="submit" style={styles.btnPrimary}>
                Login
              </button>
            </div>
          </form>
        )}

        {loginError && <p style={styles.errorLine}>{loginError}</p>}
      </div>

      {/* ---------- ADMIN CRUD SECTION ---------- */}
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>
          {editingId ? '✏️ Update User' : '➕ Add New User (Admin)'}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <Field
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Field
            label="Membership ID"
            name="membership_id"
            value={form.membership_id}
            onChange={handleChange}
            error={errors.membership_id}
            placeholder="e.g. LIB-001"
          />

          <div style={styles.selectGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Field
            label={editingId ? 'New Password (optional)' : 'Password'}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder={editingId ? 'Leave blank to keep current' : ''}
          />

          <div style={styles.actions}>
            <button type="submit" style={styles.btnPrimary}>
              {editingId ? 'Update User' : 'Add User'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={styles.btnSecondary}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message.text && (
          <p
            style={{
              marginTop: 12,
              color: message.type === 'error' ? '#dc2626' : '#16a34a',
              fontWeight: 500,
            }}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* ---------- USER LIST ---------- */}
      <h2>All Users ({users.length})</h2>

      {loading ? (
        <p>Loading…</p>
      ) : users.length === 0 ? (
        <p>No users yet. Add the first user above.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Membership ID</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.membership_id}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        u.role === 'admin' ? styles.badgeAdmin : styles.badgeMember
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(u)} style={styles.btnSmallEdit}>
                      Update
                    </button>
                    <button onClick={() => handleDelete(u.id)} style={styles.btnSmallDelete}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable Field ---------- */
function Field({ label, name, value, onChange, error, type = 'text', placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
      <label style={styles.label} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = {
  page: { padding: 24 },
  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'flex-start',
  },
  selectGroup: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 },
  label: { fontSize: 13, fontWeight: 600, color: '#475569' },
  input: {
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  },
  inputError: { borderColor: '#dc2626', background: '#fef2f2' },
  errorText: { color: '#dc2626', fontSize: 12 },
  errorLine: { color: '#dc2626', marginTop: 8, fontWeight: 500 },
  actions: { display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 22 },
  btnPrimary: {
    padding: '10px 20px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  btnSecondary: {
    padding: '10px 20px',
    background: '#e2e8f0',
    color: '#0f172a',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  btnSmallEdit: {
    padding: '6px 12px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
    marginRight: 6,
  },
  btnSmallDelete: {
    padding: '6px 12px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    fontSize: 13,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  th: {
    textAlign: 'left',
    padding: 12,
    background: '#e2e8f0',
    fontSize: 13,
    textTransform: 'uppercase',
    color: '#475569',
  },
  td: { padding: 12, borderBottom: '1px solid #e2e8f0', fontSize: 14 },
  badgeAdmin: {
    padding: '2px 10px',
    background: '#dbeafe',
    color: '#1e40af',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  badgeMember: {
    padding: '2px 10px',
    background: '#e2e8f0',
    color: '#475569',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  loggedIn: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    background: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: 8,
  },
};