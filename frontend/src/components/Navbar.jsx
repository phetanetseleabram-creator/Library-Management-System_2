import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/books', label: 'Books' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/users', label: 'Users' },
  ];

  return (
    <nav style={styles.nav}>
      <h2 style={styles.brand}>📚 Library System</h2>
      <div style={styles.links}>
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{ ...styles.link, ...(isActive(to) ? styles.active : {}) }}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    padding: '14px 24px',
    background: '#1e293b',
    color: 'white',
  },
  brand: { margin: 0, fontSize: 20 },
  links: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  link: {
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: 6,
    fontWeight: 500,
  },
  active: { background: '#2563eb', color: 'white' },
};