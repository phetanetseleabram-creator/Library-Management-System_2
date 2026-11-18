import { useEffect, useState } from 'react';
import { getBooks, addBook, updateBook, deleteBook } from '../services/api';

const emptyForm = { title: '', author: '', genre: '', isbn: '', quantity: '' };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const loadBooks = () => {
    setLoading(true);
    getBooks()
      .then(setBooks)
      .catch((err) => setMessage({ text: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBooks(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.author.trim()) errs.author = 'Required';
    if (!form.isbn.trim()) errs.isbn = 'Required';
    if (form.isbn.trim() && !/^[0-9-]{10,20}$/.test(form.isbn.trim())) errs.isbn = 'Invalid format';
    if (form.quantity === '') errs.quantity = 'Required';
    else if (Number(form.quantity) < 0) errs.quantity = 'Must be 0+';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    const payload = { ...form, quantity: Number(form.quantity) };
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
      loadBooks();
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    }
  };

  const handleEdit = (book) => {
    setForm({ ...book, quantity: String(book.quantity) });
    setEditingId(book.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <h1>Book Management</h1>

      <div className="card">
        <h2>{editingId ? '✏️ Update Book' : '➕ Add New Book'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} className={`form-control ${errors.title ? 'error' : ''}`} />
              {errors.title && <span className="error-msg">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label>Author</label>
              <input name="author" value={form.author} onChange={handleChange} className={`form-control ${errors.author ? 'error' : ''}`} />
              {errors.author && <span className="error-msg">{errors.author}</span>}
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input name="genre" value={form.genre} onChange={handleChange} className="form-control" placeholder="e.g. Programming" />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input name="isbn" value={form.isbn} onChange={handleChange} className={`form-control ${errors.isbn ? 'error' : ''}`} />
              {errors.isbn && <span className="error-msg">{errors.isbn}</span>}
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className={`form-control ${errors.quantity ? 'error' : ''}`} />
              {errors.quantity && <span className="error-msg">{errors.quantity}</span>}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Book' : 'Add Book'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); setErrors({}); }} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      </div>

      <h2 className="section-title">All Books ({books.length})</h2>
      {loading ? <p>Loading…</p> : books.length === 0 ? <p>No books yet.</p> : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Author</th><th>ISBN</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className={b.quantity < 2 ? 'row-low-stock' : ''}>
                  <td><strong>{b.title}</strong></td>
                  <td>{b.author}</td>
                  <td>{b.isbn}</td>
                  <td>{b.quantity} {b.quantity < 2 && '⚠️'}</td>
                  <td>
                    <button onClick={() => handleEdit(b)} className="btn btn-sm btn-edit">Update</button>
                    {' '}
                    <button onClick={() => { if(window.confirm('Delete?')) deleteBook(b.id).then(loadBooks); }} className="btn btn-sm btn-delete">Delete</button>
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