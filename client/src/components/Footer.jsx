import { Link } from 'react-router-dom';
import { Heart, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '48px 0 24px'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 800, color: 'white'
              }}>G</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                Golf<span style={{ color: 'var(--accent-emerald)' }}>Charity</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Play golf, win prizes, and make a difference. Every subscription supports charities you believe in.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/pricing" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pricing</Link>
              <Link to="/charities" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Charities</Link>
              <Link to="/signup" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Get Started</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Help Center</a>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Terms of Service</a>
              <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Privacy Policy</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} /> hello@golfcharity.com
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={14} /> golfcharity.com
              </span>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid var(--border-color)', paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 GolfCharity. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            Made with <Heart size={12} style={{ color: 'var(--accent-rose)' }} /> for charity
          </p>
        </div>
      </div>
    </footer>
  );
}
