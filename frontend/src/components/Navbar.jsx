import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/books', label: 'Books' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/users', label: 'Users' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>📚</span> Library System
      </div>
      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${pathname === to ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}