import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Dices, Heart, Trophy, BarChart3,
  Edit3, Trash2, CheckCircle, XCircle, DollarSign, Play, Eye,
  Send, Search, ChevronDown, RefreshCw
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Admin Sidebar
function AdminSidebar() {
  const location = useLocation();
  const links = [
    { to: '/admin', icon: <BarChart3 size={18} />, label: 'Analytics', exact: true },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/admin/draws', icon: <Dices size={18} />, label: 'Draws' },
    { to: '/admin/charities', icon: <Heart size={18} />, label: 'Charities' },
    { to: '/admin/winners', icon: <Trophy size={18} />, label: 'Winners' }
  ];
  return (
    <div style={{
      width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
      padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
      minHeight: 'calc(100vh - 72px)'
    }}>
      <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '8px 12px', marginBottom: 8 }}>
        Admin Panel
      </h3>
      {links.map(l => {
        const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to) && l.to !== '/admin';
        return (
          <Link key={l.to} to={l.to} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 'var(--radius-sm)', color: active ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            background: active ? 'rgba(52,211,153,0.1)' : 'transparent',
            fontSize: '0.9rem', fontWeight: active ? 600 : 400, textDecoration: 'none',
            transition: 'all 0.15s'
          }}>{l.icon} {l.label}</Link>
        );
      })}
    </div>
  );
}

// Analytics Page
function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!data) return <p>Failed to load analytics.</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: 24 }}>Dashboard Overview</h2>
      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Users', value: data.totalUsers, icon: <Users size={18} /> },
          { label: 'Active Subscribers', value: data.activeSubscribers, icon: <DollarSign size={18} /> },
          { label: 'Total Charities', value: data.totalCharities, icon: <Heart size={18} /> },
          { label: 'Total Draws', value: data.totalDraws, icon: <Dices size={18} /> }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent-emerald)', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            £{((data.totalPrizePool || 0) / 100).toFixed(0)}
          </div>
          <div className="stat-label">Total Prize Pool</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">£{((data.totalCharityContributions || 0) / 100).toFixed(0)}</div>
          <div className="stat-label">Charity Contributions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.pendingVerification || 0}</div>
          <div className="stat-label">Pending Verification</div>
        </div>
      </div>

      {data.charityLeaderboard?.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: 16 }}>Charity Leaderboard</h3>
          <table className="data-table">
            <thead><tr><th>#</th><th>Charity</th><th>Supporters</th></tr></thead>
            <tbody>
              {data.charityLeaderboard.map((c, i) => (
                <tr key={i}><td>{i + 1}</td><td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.supporters}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Users Management
function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const params = search ? `search=${search}` : '';
      const data = await api.getAdminUsers(params);
      setUsers(data.users);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const updateUser = async (id, updates) => {
    try {
      await api.updateAdminUser(id, updates);
      toast.success('User updated');
      setEditing(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>User Management</h2>
        <div style={{ position: 'relative', width: 250 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search users..." style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="loading-container"><div className="spinner" /></div> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Subscription</th><th>Charity</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>{u.role}</span></td>
                  <td>
                    {editing?._id === u._id ? (
                      <select className="form-input" style={{ width: 120, padding: '4px 8px', fontSize: '0.8rem' }}
                        value={editing.subscriptionStatus} onChange={e => setEditing({ ...editing, subscriptionStatus: e.target.value })}>
                        {['none', 'active', 'cancelled', 'lapsed'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`badge ${u.subscriptionStatus === 'active' ? 'badge-success' : 'badge-neutral'}`}>{u.subscriptionStatus}</span>
                    )}
                  </td>
                  <td>{u.selectedCharity?.name || '—'}</td>
                  <td>
                    {editing?._id === u._id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => updateUser(u._id, { subscriptionStatus: editing.subscriptionStatus })} className="btn btn-primary btn-sm">Save</button>
                        <button onClick={() => setEditing(null)} className="btn btn-secondary btn-sm">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditing({ ...u })} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                        <Edit3 size={12} /> Edit
                      </button>
                    )}
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

// Draws Management
function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawForm, setDrawForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), drawType: 'random' });
  const [simResult, setSimResult] = useState(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => { loadDraws(); }, []);
  const loadDraws = async () => {
    try { const d = await api.getDraws(); setDraws(d.draws); } catch (e) {}
    setLoading(false);
  };

  const executeDraw = async () => {
    setExecuting(true);
    try {
      const data = await api.executeDraw(drawForm);
      toast.success(`Draw executed! ${data.draw.totalWinners} winners found.`);
      loadDraws();
    } catch (err) { toast.error(err.message); }
    setExecuting(false);
  };

  const simulate = async () => {
    try {
      const data = await api.simulateDraw({ drawType: drawForm.drawType });
      setSimResult(data);
      toast.success('Simulation complete');
    } catch (err) { toast.error(err.message); }
  };

  const publish = async (id) => {
    if (!confirm('Publish these results? Winners will be notified.')) return;
    try {
      await api.publishDraw(id);
      toast.success('Draw published! Winners notified.');
      loadDraws();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: 24 }}>Draw Management</h2>

      <div className="glass-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Execute New Draw</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Month</label>
            <select className="form-input" value={drawForm.month}
              onChange={e => setDrawForm({ ...drawForm, month: parseInt(e.target.value) })}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Year</label>
            <input type="number" className="form-input" value={drawForm.year}
              onChange={e => setDrawForm({ ...drawForm, year: parseInt(e.target.value) })} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Draw Type</label>
            <select className="form-input" value={drawForm.drawType}
              onChange={e => setDrawForm({ ...drawForm, drawType: e.target.value })}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          <button onClick={simulate} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
            <Eye size={14} /> Simulate
          </button>
          <button onClick={executeDraw} disabled={executing} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
            <Play size={14} /> {executing ? 'Running...' : 'Execute'}
          </button>
        </div>
      </div>

      {simResult && (
        <div className="glass-card" style={{ marginBottom: 24, borderColor: 'rgba(139,92,246,0.3)' }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} style={{ color: 'var(--accent-violet)' }} /> Simulation Results
          </h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {simResult.winningNumbers?.map((n, i) => (
              <span key={i} style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1rem'
              }}>{n}</span>
            ))}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Winners: 5-match: {simResult.results?.fiveMatch?.length || 0}, 
            4-match: {simResult.results?.fourMatch?.length || 0}, 
            3-match: {simResult.results?.threeMatch?.length || 0}
          </p>
        </div>
      )}

      <div className="glass-card">
        <h3 style={{ marginBottom: 16 }}>Draw History</h3>
        {loading ? <div className="loading-container"><div className="spinner" /></div> : (
          <table className="data-table">
            <thead><tr><th>Month</th><th>Type</th><th>Numbers</th><th>Winners</th><th>Pool</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {draws.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.month}/{d.year}</td>
                  <td><span className="badge badge-info">{d.drawType}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {d.winningNumbers?.map((n, i) => (
                        <span key={i} style={{
                          width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-glass)',
                          border: '1px solid var(--border-color)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
                        }}>{n}</span>
                      ))}
                    </div>
                  </td>
                  <td>{d.totalWinners}</td>
                  <td>£{((d.prizePool || 0) / 100).toFixed(0)}</td>
                  <td><span className={`badge ${d.status === 'published' ? 'badge-success' : d.status === 'simulated' ? 'badge-warning' : 'badge-neutral'}`}>{d.status}</span></td>
                  <td>
                    {d.status === 'simulated' && (
                      <button onClick={() => publish(d._id)} className="btn btn-gold btn-sm" style={{ gap: 4 }}>
                        <Send size={12} /> Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Charities Management
function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'other', image: '', website: '', featured: false });
  const [editId, setEditId] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const data = await api.getCharities(); setCharities(data.charities); } catch (e) {}
    setLoading(false);
  };

  const save = async () => {
    try {
      if (editId) { await api.updateCharity(editId, form); toast.success('Charity updated'); }
      else { await api.createCharity(form); toast.success('Charity created'); }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', description: '', category: 'other', image: '', website: '', featured: false });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const deleteCharity = async (id) => {
    if (!confirm('Deactivate this charity?')) return;
    try { await api.deleteCharity(id); toast.success('Charity deactivated'); load(); } catch (err) { toast.error(err.message); }
  };

  const startEdit = (c) => {
    setForm({ name: c.name, description: c.description, category: c.category, image: c.image || '', website: c.website || '', featured: c.featured });
    setEditId(c._id);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>Charity Management</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', category: 'other', image: '', website: '', featured: false }); }}
          className="btn btn-primary btn-sm">
          {showForm ? 'Cancel' : '+ Add Charity'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>{editId ? 'Edit' : 'New'} Charity</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['health', 'education', 'environment', 'community', 'sports', 'youth', 'other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
            <label htmlFor="featured" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Featured Charity</label>
          </div>
          <button onClick={save} className="btn btn-primary">{editId ? 'Update' : 'Create'} Charity</button>
        </div>
      )}

      {loading ? <div className="loading-container"><div className="spinner" /></div> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Category</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {charities.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className="badge badge-success">{c.category}</span></td>
                  <td>{c.featured ? '⭐' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => startEdit(c)} className="btn btn-secondary btn-sm" style={{ gap: 4 }}><Edit3 size={12} /> Edit</button>
                      <button onClick={() => deleteCharity(c._id)} className="btn btn-danger btn-sm" style={{ gap: 4 }}><Trash2 size={12} /> Delete</button>
                    </div>
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

// Winners Management
function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [filter]);
  const load = async () => {
    try {
      const params = filter ? `status=${filter}` : '';
      const data = await api.getWinners(params);
      setWinners(data.winners);
    } catch (e) {}
    setLoading(false);
  };

  const verify = async (id, status) => {
    try {
      await api.verifyWinner(id, { status });
      toast.success(`Winner ${status}`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const markPaid = async (id) => {
    try {
      await api.markPaid(id);
      toast.success('Marked as paid');
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>Winners & Payouts</h2>
        <select className="form-input" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <div className="loading-container"><div className="spinner" /></div> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>User</th><th>Draw</th><th>Match</th><th>Prize</th><th>Proof</th><th>Verification</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>
              {winners.map(w => (
                <tr key={w._id}>
                  <td style={{ fontWeight: 600 }}>{w.user?.name || 'N/A'}</td>
                  <td>{w.draw?.month}/{w.draw?.year}</td>
                  <td><span className="badge badge-info">{w.matchType}-Match</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>£{(w.prizeAmount / 100).toFixed(2)}</td>
                  <td>
                    {w.proofImageUrl ? (
                      <a href={w.proofImageUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                        <Eye size={12} /> View
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${
                      w.verificationStatus === 'approved' ? 'badge-success' :
                      w.verificationStatus === 'rejected' ? 'badge-danger' :
                      w.verificationStatus === 'submitted' ? 'badge-warning' : 'badge-neutral'
                    }`}>{w.verificationStatus}</span>
                  </td>
                  <td>
                    <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-success' : 'badge-neutral'}`}>{w.paymentStatus}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {w.verificationStatus === 'submitted' && (
                        <>
                          <button onClick={() => verify(w._id, 'approved')} className="btn btn-primary btn-sm" style={{ gap: 4 }}>
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button onClick={() => verify(w._id, 'rejected')} className="btn btn-danger btn-sm" style={{ gap: 4 }}>
                            <XCircle size={12} /> Reject
                          </button>
                        </>
                      )}
                      {w.verificationStatus === 'approved' && w.paymentStatus !== 'paid' && (
                        <button onClick={() => markPaid(w._id)} className="btn btn-gold btn-sm" style={{ gap: 4 }}>
                          <DollarSign size={12} /> Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {winners.length === 0 && <div className="empty-state"><p>No winners found.</p></div>}
        </div>
      )}
    </div>
  );
}

// Main Admin Layout
export default function AdminDashboard() {
  return (
    <div style={{ display: 'flex', paddingTop: 72 }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: 32, minHeight: 'calc(100vh - 72px)' }}>
        <Routes>
          <Route index element={<Analytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="draws" element={<AdminDraws />} />
          <Route path="charities" element={<AdminCharities />} />
          <Route path="winners" element={<AdminWinners />} />
        </Routes>
      </div>
      <style>{`
        @media (max-width: 768px) {
          div[style*="width: 240"] { display: none; }
        }
      `}</style>
    </div>
  );
}
