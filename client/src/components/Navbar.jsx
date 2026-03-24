import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10, 15, 28, 0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: 'white'
          }}>G</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Golf<span style={{ color: 'var(--accent-emerald)' }}>Charity</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          <Link to="/charities" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Charities</Link>
          <Link to="/pricing" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'var(--accent-amber)', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle"
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <Link to="/charities" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-secondary)', padding: '8px 0' }}>Charities</Link>
          <Link to="/pricing" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-secondary)', padding: '8px 0' }}>Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-secondary)', padding: '8px 0' }}>Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ color: 'var(--accent-amber)', padding: '8px 0' }}>Admin Panel</Link>}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary" style={{ textAlign: 'center' }}>Log In</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ textAlign: 'center' }}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
