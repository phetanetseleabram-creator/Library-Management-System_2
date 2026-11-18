import { useEffect, useState } from 'react';
import { getBooks, getUsers, getTransactions, createTransaction } from '../services/api';

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [txs, setTxs] = useState([]);
  const [form, setForm] = useState({ book_id: '', user_id: '', type: 'borrow', quantity: 1 });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([getBooks(), getUsers(), getTransactions()])
      .then(([b, u, t]) => { setBooks(b); setUsers(u); setTxs(t); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const requiresUser = form.type === 'borrow' || form.type === 'return';
  const selectedBook = books.find(b => b.id === Number(form.book_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!form.book_id) return setMessage({ text: 'Select a book', type: 'error' });
    if (requiresUser && !form.user_id) return setMessage({ text: 'Select a user', type: 'error' });
    if (Number(form.quantity) < 1) return setMessage({ text: 'Qty must be 1+', type: 'error' });

    try {
      const res = await createTransaction({
        book_id: Number(form.book_id),
        user_id: form.user_id ? Number(form.user_id) : null,
        type: form.type,
        quantity: Number(form.quantity)
      });
      setMessage({ text: `✅ Recorded. New stock: ${res.newStock}`, type: 'success' });
      setForm({ ...form, quantity: 1 });
      loadAll();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="page-container">
      <h1>Transactions</h1>

      <div className="card">
        <h2>➕ Record Transaction</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Book</label>
            <select value={form.book_id} onChange={e => setForm({...form, book_id: e.target.value})} className="form-control">
              <option value="">Select Book…</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title} (stock: {b.quantity})</option>)}
            </select>
            {selectedBook && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current stock: {selectedBook.quantity}</span>}
          </div>
          
          {requiresUser && (
            <div className="form-group">
              <label>User</label>
              <select value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} className="form-control">
                <option value="">Select User…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="form-control">
              <option value="borrow">Borrow (Deduct)</option>
              <option value="return">Return (Add)</option>
              <option value="add_stock">Add Stock</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="form-control" />
          </div>

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Submit Transaction</button>
          </div>
        </form>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      </div>

      <h2 className="section-title">Transaction History ({txs.length})</h2>
      {loading ? <p>Loading…</p> : (
        <div className="table-responsive">
          <table>
            <thead><tr><th>Date</th><th>Book</th><th>User</th><th>Type</th><th>Qty</th></tr></thead>
            <tbody>
              {txs.map(t => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td><strong>{t.book_title}</strong></td>
                  <td>{t.user_name || '—'}</td>
                  <td><span className={`badge badge-${t.type}`}>{t.type.replace('_', ' ')}</span></td>
                  <td>{t.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}