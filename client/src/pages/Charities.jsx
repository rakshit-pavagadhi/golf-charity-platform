import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import api from '../services/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Charities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const categories = ['health', 'education', 'environment', 'community', 'sports', 'youth', 'other'];

  useEffect(() => {
    loadCharities();
  }, [search, category]);

  const loadCharities = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const data = await api.getCharities(params.toString());
      setCharities(data.charities);
    } catch (err) { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Charity <span style={{ color: 'var(--accent-emerald)' }}>Directory</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Explore the causes your subscription can support. Every round makes a difference.
          </p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" placeholder="Search charities..."
              style={{ paddingLeft: 42 }} value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 200 }} value={category}
            onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Charity Grid */}
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : charities.length === 0 ? (
          <div className="empty-state">
            <p>No charities found. Try adjusting your search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {charities.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Link to={`/charities/${c._id}`} className="glass-card" style={{ display: 'block', textDecoration: 'none', overflow: 'hidden', padding: 0 }}>
                  <div style={{ height: 200, background: `url(${c.image || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600'}) center/cover` }}>
                    {c.featured && (
                      <span style={{
                        position: 'absolute', top: 12, left: 12,
                        background: 'var(--gradient-gold)', color: '#1a1a2e',
                        padding: '4px 12px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem', fontWeight: 700
                      }}>⭐ Featured</span>
                    )}
                  </div>
                  <div style={{ padding: '20px 24px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>{c.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>
                      {c.description?.substring(0, 140)}...
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="badge badge-success">{c.category}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {c.supporterCount || 0} supporters
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
