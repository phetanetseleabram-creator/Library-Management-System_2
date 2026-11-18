import { useEffect, useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser, login } from '../services/api';

const emptyForm = { name: '', membership_id: '', role: 'member', password: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const [loginForm, setLoginForm] = useState({ membership_id: '', password: '' });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginError, setLoginError] = useState('');

  const loadUsers = () => {
    setLoading(true);
    getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.membership_id || !loginForm.password) return setLoginError('Both fields required');
    try {
      const data = await login(loginForm.membership_id, loginForm.password);
      setLoggedInUser(data.user);
      setLoginForm({ membership_id: '', password: '' });
    } catch (err) { setLoginError(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.membership_id.trim()) errs.membership_id = 'Required';
    if (!editingId && !form.password.trim()) errs.password = 'Required';
    if (form.password && form.password.length < 4) errs.password = 'Min 4 chars';
    
    if (Object.keys(errs).length) return setErrors(errs);

    const payload = { ...form, password: form.password || undefined };
    try {
      if (editingId) await updateUser(editingId, payload);
      else await addUser(payload);
      setMessage({ text: editingId ? '✅ User updated' : '✅ User added', type: 'success' });
      setForm(emptyForm);
      setEditingId(null);
      loadUsers();
    } catch (err) { setMessage({ text: `❌ ${err.message}`, type: 'error' }); }
  };

  return (
    <div className="page-container">
      <h1>User Management</h1>

      {/* Login */}
      <div className="card">
        <h2>🔐 Login</h2>
        {loggedInUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <p>Welcome, <strong>{loggedInUser.name}</strong> ({loggedInUser.role})</p>
            <button onClick={() => setLoggedInUser(null)} className="btn btn-secondary">Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="form-grid">
            <div className="form-group">
              <label>Membership ID</label>
              <input value={loginForm.membership_id} onChange={e => setLoginForm({...loginForm, membership_id: e.target.value})} className="form-control" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="form-control" />
            </div>
            <div className="form-actions" style={{ marginTop: 0 }}>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 28 }}>Login</button>
            </div>
          </form>
        )}
        {loginError && <div className="alert alert-error" style={{ marginTop: 16 }}>{loginError}</div>}
      </div>

      {/* Admin CRUD */}
      <div className="card">
        <h2>{editingId ? '✏️ Update User' : '➕ Add New User (Admin)'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`form-control ${errors.name ? 'error' : ''}`} />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Membership ID</label>
              <input name="membership_id" value={form.membership_id} onChange={e => setForm({...form, membership_id: e.target.value})} className={`form-control ${errors.membership_id ? 'error' : ''}`} />
              {errors.membership_id && <span className="error-msg">{errors.membership_id}</span>}
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="form-control">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>{editingId ? 'New Password (Optional)' : 'Password'}</label>
              <input type="password" name="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={`form-control ${errors.password ? 'error' : ''}`} />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update User' : 'Add User'}</button>
            {editingId && <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); setErrors({}); }} className="btn btn-secondary">Cancel</button>}
          </div>
        </form>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      </div>

      <h2 className="section-title">All Users ({users.length})</h2>
      {loading ? <p>Loading…</p> : (
        <div className="table-responsive">
          <table>
            <thead><tr><th>Name</th><th>ID</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.membership_id}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <button onClick={() => { setForm({...u, password: ''}); setEditingId(u.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-sm btn-edit">Update</button>
                    {' '}
                    <button onClick={() => { if(window.confirm('Delete?')) deleteUser(u.id).then(loadUsers); }} className="btn btn-sm btn-delete">Delete</button>
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