'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Heart, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 70% 30%, rgba(34,197,94,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(14,165,233,0.08) 0%, transparent 60%), var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', top: '-40px', left: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }} className="hover-text-primary">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '8px' }}>
            <Image src="/logo.png" alt="FoodBridge Logo" width={48} height={48} style={{ borderRadius: '14px' }} />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '24px', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FoodBridge</span>
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Sign in to continue your impact.</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '36px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="input" style={{ paddingLeft: '44px' }} required />
              </div>
            </div>
            <div className="form-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="input" style={{ paddingLeft: '44px', paddingRight: '44px' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={18} /></>}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            New to FoodBridge?{' '}
            <Link href="/auth/register" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
