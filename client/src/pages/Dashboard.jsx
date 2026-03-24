import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Target, Heart, Trophy, DollarSign, Plus, Edit3, Trash2, Calendar, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [scores, setScores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState({ winners: [], totalWon: 0, pendingAmount: 0, paidAmount: 0 });
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreForm, setScoreForm] = useState({ value: '', date: '' });
  const [editingScore, setEditingScore] = useState(null);
  const [charityPercentage, setCharityPercentage] = useState(user?.charityPercentage || 10);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [subData, scoresData, drawsData, winData, charitiesData] = await Promise.allSettled([
        api.getSubscriptionStatus(),
        api.getScores(),
        api.getDraws(),
        api.getMyWinnings(),
        api.getCharities()
      ]);
      if (subData.status === 'fulfilled') setSubscription(subData.value);
      if (scoresData.status === 'fulfilled') setScores(scoresData.value.scores || []);
      if (drawsData.status === 'fulfilled') setDraws(drawsData.value.draws || []);
      if (winData.status === 'fulfilled') setWinnings(winData.value);
      if (charitiesData.status === 'fulfilled') setCharities(charitiesData.value.charities || []);
    } catch (e) {}
    setLoading(false);
  };

  const addScore = async (e) => {
    e.preventDefault();
    try {
      const data = await api.addScore({ value: parseInt(scoreForm.value), date: scoreForm.date });
      setScores(data.scores);
      setScoreForm({ value: '', date: '' });
      toast.success('Score added!');
    } catch (err) { toast.error(err.message); }
  };

  const updateScore = async (id) => {
    try {
      const data = await api.updateScore(id, { value: parseInt(editingScore.value), date: editingScore.date });
      setScores(data.scores);
      setEditingScore(null);
      toast.success('Score updated!');
    } catch (err) { toast.error(err.message); }
  };

  const deleteScore = async (id) => {
    if (!confirm('Delete this score?')) return;
    try {
      const data = await api.deleteScore(id);
      setScores(data.scores);
      toast.success('Score deleted');
    } catch (err) { toast.error(err.message); }
  };

  const selectCharity = async (charityId) => {
    try {
      await api.selectCharity({ charityId, charityPercentage });
      await refreshUser();
      toast.success('Charity updated!');
    } catch (err) { toast.error(err.message); }
  };

  const uploadProof = async (winnerId, file) => {
    try {
      const uploadData = await api.uploadImage(file);
      await api.submitProof(winnerId, { proofImageUrl: uploadData.url });
      const winData = await api.getMyWinnings();
      setWinnings(winData);
      toast.success('Proof submitted for verification!');
    } catch (err) { toast.error(err.message); }
  };

  const cancelSub = async () => {
    if (!confirm('Cancel your subscription?')) return;
    try {
      await api.cancelSubscription();
      await refreshUser();
      loadAll();
      toast.success('Subscription cancelled');
    } catch (err) { toast.error(err.message); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Target size={16} /> },
    { id: 'scores', label: 'Scores', icon: <Edit3 size={16} /> },
    { id: 'draws', label: 'Draws', icon: <Trophy size={16} /> },
    { id: 'charity', label: 'Charity', icon: <Heart size={16} /> },
    { id: 'winnings', label: 'Winnings', icon: <DollarSign size={16} /> }
  ];

  if (loading) return <div className="page loading-container"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            Welcome, <span style={{ color: 'var(--accent-emerald)' }}>{user?.name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your golf journey and charitable impact</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-4" style={{ marginBottom: 32 }}>
              <div className="stat-card">
                <div className="stat-label"><CreditCard size={14} style={{ display: 'inline', marginRight: 4 }} />Subscription</div>
                <div className="stat-value" style={{ fontSize: '1.2rem', marginTop: 8 }}>
                  <span className={`badge ${user?.subscriptionStatus === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {user?.subscriptionStatus || 'None'}
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label"><Target size={14} style={{ display: 'inline', marginRight: 4 }} />Scores Entered</div>
                <div className="stat-value">{scores.length}/5</div>
              </div>
              <div className="stat-card">
                <div className="stat-label"><Heart size={14} style={{ display: 'inline', marginRight: 4 }} />Charity %</div>
                <div className="stat-value">{user?.charityPercentage || 10}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label"><Trophy size={14} style={{ display: 'inline', marginRight: 4 }} />Total Won</div>
                <div className="stat-value">£{((winnings.totalWon || 0) / 100).toFixed(2)}</div>
              </div>
            </div>

            {user?.subscriptionStatus !== 'active' && (
              <div className="glass-card" style={{ textAlign: 'center', padding: 40, borderColor: 'rgba(245,158,11,0.3)', marginBottom: 24 }}>
                <Trophy size={32} style={{ color: 'var(--accent-amber)', marginBottom: 16 }} />
                <h3 style={{ marginBottom: 8 }}>Subscribe to Enter Draws</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Get your subscription started to enter scores and win prizes</p>
                <Link to="/pricing" className="btn btn-gold">View Plans</Link>
              </div>
            )}

            {subscription?.subscription && (
              <div className="glass-card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Subscription Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Plan</span><br/>{subscription.subscription.plan}</div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</span><br/><span className="badge badge-success">{subscription.subscription.status}</span></div>
                  <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Renewal</span><br/>{subscription.subscription.currentPeriodEnd ? new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</div>
                </div>
                {subscription.subscription.status === 'active' && (
                  <button onClick={cancelSub} className="btn btn-danger btn-sm" style={{ marginTop: 16 }}>Cancel Subscription</button>
                )}
              </div>
            )}

            {scores.length > 0 && (
              <div className="glass-card">
                <h3 style={{ marginBottom: 16 }}>Your Latest Scores</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {scores.map(s => (
                    <div key={s._id} style={{
                      background: 'var(--bg-glass)', padding: '16px 24px', borderRadius: 'var(--radius-md)',
                      textAlign: 'center', border: '1px solid var(--border-color)', minWidth: 80
                    }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{s.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(s.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Scores Tab */}
        {tab === 'scores' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16 }}>
                <Plus size={18} style={{ display: 'inline', marginRight: 8 }} />
                Add New Score
              </h3>
              <form onSubmit={addScore} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 120 }}>
                  <label className="form-label">Score (1-45)</label>
                  <input type="number" className="form-input" min="1" max="45" required
                    placeholder="Stableford score" value={scoreForm.value}
                    onChange={e => setScoreForm({ ...scoreForm, value: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 150 }}>
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={scoreForm.date}
                    onChange={e => setScoreForm({ ...scoreForm, date: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">Add Score</button>
              </form>
              {scores.length >= 5 && (
                <p style={{ color: 'var(--accent-amber)', fontSize: '0.8rem', marginTop: 8 }}>
                  ⚠️ You have 5 scores. Adding a new one will replace the oldest.
                </p>
              )}
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: 16 }}>Your Scores ({scores.length}/5)</h3>
              {scores.length === 0 ? (
                <div className="empty-state"><p>No scores entered yet. Add your first score above!</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Score</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {scores.map(s => (
                      <tr key={s._id}>
                        <td>
                          {editingScore?._id === s._id ? (
                            <input type="number" className="form-input" min="1" max="45" style={{ width: 80 }}
                              value={editingScore.value} onChange={e => setEditingScore({ ...editingScore, value: e.target.value })} />
                          ) : (
                            <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>{s.value}</span>
                          )}
                        </td>
                        <td>
                          {editingScore?._id === s._id ? (
                            <input type="date" className="form-input" style={{ width: 150 }}
                              value={editingScore.date?.split('T')[0]} onChange={e => setEditingScore({ ...editingScore, date: e.target.value })} />
                          ) : new Date(s.date).toLocaleDateString()}
                        </td>
                        <td>
                          {editingScore?._id === s._id ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => updateScore(s._id)} className="btn btn-primary btn-sm">Save</button>
                              <button onClick={() => setEditingScore(null)} className="btn btn-secondary btn-sm">Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => setEditingScore({ ...s, date: s.date })} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                                <Edit3 size={12} /> Edit
                              </button>
                              <button onClick={() => deleteScore(s._id)} className="btn btn-danger btn-sm" style={{ gap: 4 }}>
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* Draws Tab */}
        {tab === 'draws' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card">
              <h3 style={{ marginBottom: 16 }}>Draw History</h3>
              {draws.length === 0 ? (
                <div className="empty-state"><p>No draws published yet. Stay tuned!</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Month</th><th>Winning Numbers</th><th>Winners</th><th>Prize Pool</th><th>Status</th></tr></thead>
                  <tbody>
                    {draws.map(d => (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 600 }}>{d.month}/{d.year}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {d.winningNumbers?.map((n, i) => (
                              <span key={i} style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: scores.some(s => s.value === n) ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                                border: '1px solid var(--border-color)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 700
                              }}>{n}</span>
                            ))}
                          </div>
                        </td>
                        <td>{d.totalWinners || 0}</td>
                        <td>£{((d.prizePool || 0) / 100).toFixed(2)}</td>
                        <td><span className={`badge ${d.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* Charity Tab */}
        {tab === 'charity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Your Charity</h3>
              {user?.selectedCharity ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: 'rgba(52,211,153,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-emerald)'
                  }}>
                    <Heart size={20} />
                  </div>
                  <div>
                    <h4>{typeof user.selectedCharity === 'object' ? user.selectedCharity.name : 'Selected Charity'}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Contributing {user.charityPercentage}% of subscription
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No charity selected yet.</p>
              )}
            </div>

            <div className="glass-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Contribution: {charityPercentage}%</h3>
              <input type="range" min="10" max="100" value={charityPercentage}
                onChange={e => setCharityPercentage(parseInt(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                <span>10% min</span><span>100%</span>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: 16 }}>Select a Charity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {charities.map(c => {
                  const isSelected = (typeof user?.selectedCharity === 'object' ? user.selectedCharity?._id : user?.selectedCharity) === c._id;
                  return (
                    <div key={c._id} className="card-flat" style={{
                      cursor: 'pointer', border: isSelected ? '1px solid var(--accent-emerald)' : undefined,
                      transition: 'all 0.2s'
                    }} onClick={() => selectCharity(c._id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                          background: c.image ? `url(${c.image}) center/cover` : 'rgba(52,211,153,0.1)'
                        }} />
                        <div>
                          <h4 style={{ fontSize: '0.9rem' }}>{c.name}</h4>
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{c.category}</span>
                        </div>
                        {isSelected && <CheckCircle size={18} style={{ color: 'var(--accent-emerald)', marginLeft: 'auto' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Winnings Tab */}
        {tab === 'winnings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-3" style={{ marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-value">£{((winnings.totalWon || 0) / 100).toFixed(2)}</div>
                <div className="stat-label">Total Won</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  £{((winnings.pendingAmount || 0) / 100).toFixed(2)}
                </div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">£{((winnings.paidAmount || 0) / 100).toFixed(2)}</div>
                <div className="stat-label">Paid Out</div>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ marginBottom: 16 }}>Winnings History</h3>
              {!winnings.winners?.length ? (
                <div className="empty-state"><p>No winnings yet. Keep playing!</p></div>
              ) : (
                <table className="data-table">
                  <thead><tr><th>Draw</th><th>Match</th><th>Prize</th><th>Verification</th><th>Payment</th><th>Action</th></tr></thead>
                  <tbody>
                    {winnings.winners.map(w => (
                      <tr key={w._id}>
                        <td>{w.draw?.month}/{w.draw?.year}</td>
                        <td><span className="badge badge-info">{w.matchType}-Match</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>£{(w.prizeAmount / 100).toFixed(2)}</td>
                        <td>
                          <span className={`badge ${w.verificationStatus === 'approved' ? 'badge-success' : w.verificationStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                            {w.verificationStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${w.paymentStatus === 'paid' ? 'badge-success' : 'badge-neutral'}`}>
                            {w.paymentStatus}
                          </span>
                        </td>
                        <td>
                          {w.verificationStatus === 'pending' && (
                            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', gap: 4 }}>
                              <Upload size={12} /> Upload Proof
                              <input type="file" accept="image/*" hidden
                                onChange={e => e.target.files?.[0] && uploadProof(w._id, e.target.files[0])} />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
