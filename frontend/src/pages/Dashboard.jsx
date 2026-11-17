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

  if (loading) return <p style={styles.pad}>Loading…</p>;
  if (error) return <p style={{ ...styles.pad, color: 'red' }}>Error: {error}</p>;

  const lowStock = books.filter((b) => b.quantity < 2).length;

  return (
    <div style={styles.pad}>
      <h1>Dashboard</h1>

      <div style={styles.cards}>
        <Card label="Total Books" value={books.length} />
        <Card label="Low Stock ⚠️" value={lowStock} highlight={lowStock > 0} />
        <Card
          label="Total Copies"
          value={books.reduce((s, b) => s + b.quantity, 0)}
        />
      </div>

      <h2>Book Availability</h2>
      {books.length === 0 ? (
        <p>No books yet. Add some on the Books page.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Author</th>
              <th style={styles.th}>Genre</th>
              <th style={styles.th}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr
                key={b.id}
                style={b.quantity < 2 ? styles.lowRow : {}}
              >
                <td style={styles.td}>{b.title}</td>
                <td style={styles.td}>{b.author}</td>
                <td style={styles.td}>{b.genre || '—'}</td>
                <td style={styles.td}>
                  {b.quantity} {b.quantity < 2 && <strong>⚠️ Low</strong>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Card({ label, value, highlight }) {
  return (
    <div style={{ ...styles.card, ...(highlight ? styles.cardWarn : {}) }}>
      <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>{value}</p>
    </div>
  );
}

const styles = {
  pad: { padding: 24 },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    padding: 16,
    background: '#f1f5f9',
    borderRadius: 8,
    borderLeft: '4px solid #2563eb',
  },
  cardWarn: { background: '#fee2e2', borderLeftColor: '#dc2626' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: 10, background: '#e2e8f0', borderBottom: '2px solid #cbd5e1' },
  td: { padding: 10, borderBottom: '1px solid #e2e8f0' },
  lowRow: { background: '#fee2e2' },
};