import { useEffect, useState } from 'react';
import {
  getBooks,
  getUsers,
  getTransactions,
  createTransaction,
} from '../services/api';

const emptyForm = {
  book_id: '',
  user_id: '',
  type: 'borrow',
  quantity: 1,
};

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load all data needed for this page
  const loadAll = () => {
    setLoading(true);
    Promise.all([getBooks(), getUsers(), getTransactions()])
      .then(([b, u, t]) => {
        setBooks(b);
        setUsers(u);
        setTransactions(t);
      })
      .catch((err) => setMessage({ text: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // When switching to add_stock, user isn't required
  const requiresUser = form.type === 'borrow' || form.type === 'return';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Validation
    if (!form.book_id) {
      setMessage({ text: 'Please select a book', type: 'error' });
      return;
    }
    if (requiresUser && !form.user_id) {
      setMessage({ text: 'Please select a user for borrow/return', type: 'error' });
      return;
    }
    const qty = Number(form.quantity);
    if (!qty || qty < 1) {
      setMessage({ text: 'Quantity must be 1 or more', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTransaction({
        book_id: Number(form.book_id),
        user_id: form.user_id ? Number(form.user_id) : null,
        type: form.type,
        quantity: qty,
      });
      setMessage({
        text: `✅ ${form.type.replace('_', ' ')} recorded. New stock: ${res.newStock}`,
        type: 'success',
      });
      setForm({ ...emptyForm, book_id: form.book_id }); // keep book selection for convenience
      loadAll();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get selected book's current stock (for display hint)
  const selectedBook = books.find((b) => b.id === Number(form.book_id));

  return (
    <div style={styles.page}>
      <h1>Transactions</h1>

      {/* ---------- FORM ---------- */}
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>➕ Record Transaction</h2>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Book select */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Book</label>
            <select
              name="book_id"
              value={form.book_id}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Select a book…</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (stock: {b.quantity})
                </option>
              ))}
            </select>
            {selectedBook && (
              <span style={styles.hint}>
                Current stock: <strong>{selectedBook.quantity}</strong>
              </span>
            )}
          </div>

          {/* User select (only for borrow/return) */}
          {requiresUser && (
            <div style={styles.fieldWrap}>
              <label style={styles.label}>User</label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select a user…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.membership_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type select */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="borrow">Borrow (deduct stock)</option>
              <option value="return">Return (add stock)</option>
              <option value="add_stock">Add Stock (new arrival)</option>
            </select>
          </div>

          {/* Quantity */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              style={{ ...styles.input, width: 100 }}
            />
          </div>

          <div style={styles.actions}>
            <button type="submit" style={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Transaction'}
            </button>
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

      {/* ---------- HISTORY ---------- */}
      <h2>Transaction History ({transactions.length})</h2>

      {loading ? (
        <p>Loading…</p>
      ) : transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Book</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={styles.td}>
                    {t.created_at
                      ? new Date(t.created_at).toLocaleString()
                      : '—'}
                  </td>
                  <td style={styles.td}>{t.book_title || '—'}</td>
                  <td style={styles.td}>{t.user_name || '—'}</td>
                  <td style={styles.td}>
                    <span style={typeBadge(t.type)}>
                      {t.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>{t.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */
function typeBadge(type) {
  const colors = {
    borrow: { background: '#fef3c7', color: '#92400e' },
    return: { background: '#dcfce7', color: '#166534' },
    add_stock: { background: '#dbeafe', color: '#1e40af' },
  };
  return {
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
    ...(colors[type] || {}),
  };
}

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
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 },
  label: { fontSize: 13, fontWeight: 600, color: '#475569' },
  input: {
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
  },
  hint: { fontSize: 12, color: '#64748b' },
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
};