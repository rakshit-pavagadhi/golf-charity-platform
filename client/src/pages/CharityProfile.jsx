import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CharityProfile() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCharity(id).then(d => setCharity(d.charity)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleSelect = async () => {
    if (!user) return toast.error('Please login first');
    try {
      await api.selectCharity({ charityId: id, charityPercentage: user.charityPercentage || 10 });
      toast.success(`Now supporting ${charity.name}!`);
      refreshUser();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="page loading-container"><div className="spinner" /></div>;
  if (!charity) return <div className="page container"><p>Charity not found.</p></div>;

  const isSelected = user?.selectedCharity?._id === id || user?.selectedCharity === id;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <Link to="/charities" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Charities
        </Link>

        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {charity.image && (
            <div style={{ height: 300, background: `url(${charity.image}) center/cover`, position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, rgba(10,15,28,1))' }} />
            </div>
          )}
          <div style={{ padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 8 }}>{charity.name}</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="badge badge-success">{charity.category}</span>
                  {charity.featured && <span className="badge badge-warning">⭐ Featured</span>}
                </div>
              </div>
              {user && (
                <button onClick={handleSelect} className={isSelected ? 'btn btn-secondary' : 'btn btn-primary'} style={{ gap: 8 }}>
                  <Heart size={16} fill={isSelected ? 'var(--accent-emerald)' : 'none'} />
                  {isSelected ? 'Currently Supporting' : 'Support This Charity'}
                </button>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem', marginBottom: 32 }}>
              {charity.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
              <div className="stat-card">
                <div className="stat-value">{charity.supporterCount || 0}</div>
                <div className="stat-label">Supporters</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">£{((charity.totalContributions || 0) / 100).toFixed(0)}</div>
                <div className="stat-label">Total Raised</div>
              </div>
            </div>

            {charity.website && (
              <a href={charity.website} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ gap: 8 }}>
                <ExternalLink size={16} /> Visit Website
              </a>
            )}

            {charity.events?.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Upcoming Events</h3>
                {charity.events.map((ev, i) => (
                  <div key={i} className="card-flat" style={{ marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: 'rgba(52,211,153,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      color: 'var(--accent-emerald)'
                    }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{ev.title}</h4>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {ev.date && <span>{new Date(ev.date).toLocaleDateString()}</span>}
                        {ev.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{ev.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
