import { useEffect, useState } from 'react';
import { getBooks, addBook, updateBook, deleteBook } from '../services/api';

const emptyForm = {
  title: '',
  author: '',
  genre: '',
  isbn: '',
  quantity: '',
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  // Load books on mount
  const loadBooks = () => {
    setLoading(true);
    getBooks()
      .then(setBooks)
      .catch((err) => setMessage({ text: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Controlled input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear this field's error as user types
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.author.trim()) errs.author = 'Author is required';
    if (!form.isbn.trim()) errs.isbn = 'ISBN is required';
    if (form.isbn.trim() && !/^[0-9-]{10,20}$/.test(form.isbn.trim()))
      errs.isbn = 'ISBN must be 10–20 digits (dashes allowed)';
    const qty = Number(form.quantity);
    if (form.quantity === '') errs.quantity = 'Quantity is required';
    else if (isNaN(qty) || qty < 0) errs.quantity = 'Quantity must be 0 or more';
    return errs;
  };

  // Submit — add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      genre: form.genre.trim(),
      isbn: form.isbn.trim(),
      quantity: Number(form.quantity),
    };

    try {
      if (editingId) {
        await updateBook(editingId, payload);
        setMessage({ text: '✅ Book updated', type: 'success' });
      } else {
        await addBook(payload);
        setMessage({ text: '✅ Book added', type: 'success' });
      }
      setForm(emptyForm);
      setEditingId(null);
      setErrors({});
      loadBooks();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    }
  };

  // Start editing — fill form with book data
  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre || '',
      isbn: book.isbn,
      quantity: String(book.quantity),
    });
    setEditingId(book.id);
    setErrors({});
    setMessage({ text: '', type: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setMessage({ text: '', type: '' });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book permanently?')) return;
    try {
      await deleteBook(id);
      setMessage({ text: '🗑️ Book deleted', type: 'success' });
      loadBooks();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    }
  };

  return (
    <div style={styles.page}>
      <h1>Book Management</h1>

      {/* ---------- FORM ---------- */}
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>
          {editingId ? '✏️ Update Book' : '➕ Add New Book'}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <Field
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={errors.title}
          />
          <Field
            label="Author"
            name="author"
            value={form.author}
            onChange={handleChange}
            error={errors.author}
          />
          <Field
            label="Genre"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            placeholder="e.g. Programming"
          />
          <Field
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            error={errors.isbn}
            placeholder="e.g. 9780132350884"
          />
          <Field
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            error={errors.quantity}
          />

          <div style={styles.actions}>
            <button type="submit" style={styles.btnPrimary}>
              {editingId ? 'Update Book' : 'Add Book'}
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

      {/* ---------- LIST ---------- */}
      <h2>All Books ({books.length})</h2>

      {loading ? (
        <p>Loading…</p>
      ) : books.length === 0 ? (
        <p>No books yet. Add your first book above.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Author</th>
                <th style={styles.th}>Genre</th>
                <th style={styles.th}>ISBN</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} style={b.quantity < 2 ? styles.lowRow : {}}>
                  <td style={styles.td}>{b.title}</td>
                  <td style={styles.td}>{b.author}</td>
                  <td style={styles.td}>{b.genre || '—'}</td>
                  <td style={styles.td}>{b.isbn}</td>
                  <td style={styles.td}>
                    {b.quantity} {b.quantity < 2 && <strong>⚠️</strong>}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(b)} style={styles.btnSmallEdit}>
                      Update
                    </button>
                    <button onClick={() => handleDelete(b.id)} style={styles.btnSmallDelete}>
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

/* ---------- Reusable Field component ---------- */
function Field({ label, name, value, onChange, error, type = 'text', placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
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
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    marginTop: 22,
  },
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
  lowRow: { background: '#fee2e2' },
};