import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Heart, Target, ArrowRight, Star, Users, DollarSign, TrendingUp } from 'lucide-react';
import api from '../services/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

export default function Home() {
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    api.getFeaturedCharities().then(d => setCharities(d.charities)).catch(() => {});
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(5,150,105,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(45,212,191,0.1) 0%, transparent 60%), var(--bg-primary)',
        position: 'relative', textAlign: 'center', padding: '120px 24px 80px'
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(52,211,153,0.05)', top: '10%', left: '-5%', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,158,11,0.05)', bottom: '10%', right: '-5%', filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite reverse' }} />
        
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>
          <motion.div variants={fadeUp} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 'var(--radius-full)', padding: '8px 20px', marginBottom: 32,
            fontSize: '0.85rem', color: 'var(--accent-emerald)'
          }}>
            <Star size={14} /> Where Golf Meets Giving
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
            lineHeight: 1.05, marginBottom: 24, fontFamily: 'var(--font-display)'
          }}>
            Play Golf.<br />
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Win Prizes.
            </span><br />
            <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Change Lives.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontSize: '1.2rem', color: 'var(--text-secondary)',
            maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7
          }}>
            Subscribe, track your Stableford scores, enter monthly prize draws, and support the charities you care about — all in one platform.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/charities" className="btn btn-secondary btn-lg">
              Explore Charities
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32,
            marginTop: 80, padding: '32px 0', borderTop: '1px solid var(--border-color)'
          }}>
            {[
              { icon: <Users size={20} />, value: '10K+', label: 'Active Golfers' },
              { icon: <DollarSign size={20} />, value: '£250K+', label: 'Prize Pool' },
              { icon: <Heart size={20} />, value: '£100K+', label: 'For Charity' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-emerald)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              How It <span style={{ color: 'var(--accent-emerald)' }}>Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Three simple steps to start winning and giving back
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            {[
              { icon: <Target size={28} />, step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion goes to your chosen charity and the prize pool.' },
              { icon: <TrendingUp size={28} />, step: '02', title: 'Enter Scores', desc: 'Submit your latest 5 Stableford golf scores. Keep them updated each time you play.' },
              { icon: <Trophy size={28} />, step: '03', title: 'Win & Give', desc: 'Every month, your scores are matched in our prize draw. Match numbers to win — and your charity benefits too.' }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card" style={{ textAlign: 'center', padding: 40, position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 16, right: 20,
                  fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900,
                  color: 'rgba(52,211,153,0.08)'
                }}>{item.step}</div>
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: 'rgba(52,211,153,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-emerald)', margin: '0 auto 20px'
                }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 12 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              Prize <span style={{ color: 'var(--accent-amber)' }}>Tiers</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Three ways to win every month. The more you match, the bigger the prize.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { match: '5 Numbers', pool: '40%', jackpot: true, color: '#f59e0b', icon: '🏆' },
              { match: '4 Numbers', pool: '35%', jackpot: false, color: '#8b5cf6', icon: '🥈' },
              { match: '3 Numbers', pool: '25%', jackpot: false, color: '#34d399', icon: '🥉' }
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card" style={{
                textAlign: 'center', padding: '40px 32px',
                borderColor: tier.jackpot ? 'rgba(245,158,11,0.3)' : undefined,
                boxShadow: tier.jackpot ? 'var(--shadow-gold)' : undefined
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{tier.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8, color: tier.color }}>{tier.match}</h3>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {tier.pool}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>of prize pool</p>
                {tier.jackpot && (
                  <div style={{
                    marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(245,158,11,0.15)', padding: '6px 16px',
                    borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 600
                  }}>
                    ✨ Jackpot — rolls over if unclaimed
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Charities */}
      {charities.length > 0 && (
        <section style={{ padding: '100px 0', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 64 }}>
              <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', marginBottom: 16 }}>
                Charities We <span style={{ color: 'var(--accent-emerald)' }}>Support</span>
              </motion.h2>
              <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
                Choose a cause close to your heart. At least 10% of your subscription supports them.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {charities.slice(0, 3).map((c, i) => (
                <motion.div key={c._id || i} variants={fadeUp}>
                  <Link to={`/charities/${c._id}`} className="glass-card" style={{ display: 'block', textDecoration: 'none', overflow: 'hidden', padding: 0 }}>
                    <div style={{
                      height: 180, background: `url(${c.image}) center/cover`,
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, rgba(10,15,28,0.9))' }} />
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>{c.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {c.description?.substring(0, 120)}...
                      </p>
                      <span className="badge badge-success" style={{ marginTop: 12 }}>{c.category}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/charities" className="btn btn-secondary" style={{ gap: 8 }}>
                View All Charities <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(5,150,105,0.2) 0%, transparent 70%)',
              padding: '80px 40px', borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(52,211,153,0.15)'
            }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
              Ready to Make a Difference?
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 32px' }}>
              Join thousands of golfers who play, win, and give back every month.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to="/signup" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
                Start Your Journey <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
