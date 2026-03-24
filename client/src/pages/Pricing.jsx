import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function Pricing() {
  const { user } = useAuth();

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error('Please sign up first');
      return;
    }
    try {
      const data = await api.createCheckout(plan);
      if (data.url) window.location.href = data.url;
    } catch (err) {
      toast.error(err.message || 'Failed to start checkout');
    }
  };

  const plans = [
    {
      name: 'Monthly',
      price: '£9.99',
      period: '/month',
      icon: <Zap size={24} />,
      gradient: 'var(--gradient-primary)',
      features: [
        'Enter monthly prize draws',
        'Track 5 Stableford scores',
        'Choose your charity',
        'Win from 3 match tiers',
        'Access to full dashboard',
        'Email notifications'
      ],
      popular: false,
      plan: 'monthly'
    },
    {
      name: 'Yearly',
      price: '£89.99',
      period: '/year',
      savings: 'Save £29.89',
      icon: <Crown size={24} />,
      gradient: 'var(--gradient-gold)',
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Exclusive yearly draws',
        'Higher prize pool weight',
        'Annual impact report'
      ],
      popular: true,
      plan: 'yearly'
    }
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900, textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Simple, Transparent <span style={{ color: 'var(--accent-emerald)' }}>Pricing</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 60px' }}>
            Every subscription supports charity. Choose a plan that works for you.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
          {plans.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="glass-card" style={{
                padding: '48px 36px', position: 'relative', overflow: 'hidden',
                border: plan.popular ? '1px solid rgba(245,158,11,0.3)' : undefined,
                boxShadow: plan.popular ? 'var(--shadow-gold)' : undefined
              }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: 16, right: -28, transform: 'rotate(45deg)',
                  background: 'var(--gradient-gold)', color: '#1a1a2e',
                  padding: '4px 36px', fontSize: '0.7rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>Best Value</div>
              )}

              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: plan.popular ? 'rgba(245,158,11,0.15)' : 'rgba(52,211,153,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: plan.popular ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                margin: '0 auto 20px'
              }}>{plan.icon}</div>

              <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>{plan.name}</h2>
              
              {plan.savings && (
                <span className="badge badge-warning" style={{ marginBottom: 12 }}>{plan.savings}</span>
              )}

              <div style={{ margin: '20px 0 32px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800 }}>{plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: 'none', marginBottom: 32, textAlign: 'left' }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 0', color: 'var(--text-secondary)', fontSize: '0.9rem'
                  }}>
                    <Check size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {user?.subscriptionStatus === 'active' ? (
                <div className="badge badge-success" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  Already Subscribed
                </div>
              ) : (
                <button onClick={() => handleSubscribe(plan.plan)}
                  className={plan.popular ? 'btn btn-gold' : 'btn btn-primary'}
                  style={{ width: '100%', gap: 8 }}>
                  Subscribe Now <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 40, lineHeight: 1.7 }}>
          All subscriptions auto-renew. Cancel anytime from your dashboard.<br />
          Minimum 10% of your subscription goes directly to your chosen charity.
        </p>
      </div>
    </div>
  );
}
