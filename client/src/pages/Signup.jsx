import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', selectedCharity: '', charityPercentage: 10 });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    api.getCharities().then(d => setCharities(d.charities)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome to GolfCharity!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{
        background: 'radial-gradient(ellipse at center top, rgba(5,150,105,0.1) 0%, transparent 60%)',
        position: 'absolute', inset: 0, pointerEvents: 'none'
      }} />
      <div className="glass-card animate-fade-in" style={{ maxWidth: 480, width: '100%', padding: '48px 40px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'rgba(52,211,153,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-emerald)', margin: '0 auto 16px'
          }}>
            <UserPlus size={24} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the GolfCharity community</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="John Doe" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Min 6 characters" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={14} style={{ color: 'var(--accent-rose)' }} /> Select a Charity
            </label>
            <select className="form-input" value={form.selectedCharity}
              onChange={e => setForm({ ...form, selectedCharity: e.target.value })}>
              <option value="">Choose a charity (optional)</option>
              {charities.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Charity Contribution: {form.charityPercentage}%</label>
            <input type="range" min="10" max="100" value={form.charityPercentage}
              onChange={e => setForm({ ...form, charityPercentage: parseInt(e.target.value) })} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>10% min</span><span>100%</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
