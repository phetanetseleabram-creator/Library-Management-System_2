import { useEffect, useState } from 'react';
import { getBooks } from '../services/api';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container">Loading…</div>;
  if (error) return <div className="page-container alert alert-error">{error}</div>;

  const lowStock = books.filter((b) => b.quantity < 2).length;
  const totalCopies = books.reduce((s, b) => s + b.quantity, 0);

  return (
    <div className="page-container">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Unique Books</p>
          <p className="stat-value">{books.length}</p>
        </div>
        <div className={`stat-card ${lowStock > 0 ? 'stat-warning' : ''}`}>
          <p className="stat-label">Low Stock Alerts ⚠️</p>
          <p className="stat-value">{lowStock}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Copies in Library</p>
          <p className="stat-value">{totalCopies}</p>
        </div>
      </div>

      <h2 className="section-title">Book Availability</h2>
      {books.length === 0 ? (
        <p>No books yet. Add some on the Books page.</p>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className={b.quantity < 2 ? 'row-low-stock' : ''}>
                  <td><strong>{b.title}</strong></td>
                  <td>{b.author}</td>
                  <td>{b.genre || '—'}</td>
                  <td>
                    {b.quantity} {b.quantity < 2 && <span style={{color: 'var(--danger)'}}>⚠️ Low</span>}
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