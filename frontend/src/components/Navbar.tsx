'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Heart, Bell, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const dashboardLink = user ? `/dashboard/${user.role}` : '/auth/login';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'transparent',
      transition: 'all 0.3s ease',
      paddingTop: scrolled ? '16px' : '24px'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="FoodBridge Logo" width={40} height={40} style={{ borderRadius: '12px' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px', background: 'linear-gradient(135deg, #22c55e, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FoodBridge
          </span>
        </Link>

        {/* Desktop Nav - Dark Pill Island */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '12px 36px', borderRadius: '100px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }} className="hidden-mobile">
          {[['/', 'Home'], ['/about', 'About'], ['/marketplace', 'Marketplace'], ['/impact', 'Impact'], ['/contact', 'Contact']].map(([href, label]) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <Link key={href} href={href} className="nav-link" style={{ position: 'relative', color: isActive ? '#38bdf8' : 'white', fontWeight: 600, fontSize: '15px', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'} onMouseLeave={e => e.currentTarget.style.color = isActive ? '#38bdf8' : 'white'}>
                {label}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '2px', background: '#38bdf8', borderRadius: '2px', boxShadow: '0 0 8px rgba(56,189,248,0.6)' }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'white' }}>
                  {user.name[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '8px', minWidth: '180px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <Link href={dashboardLink} onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4', e.currentTarget.style.color = '#16a34a')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'var(--text-secondary)')}>
                    <User size={15} /> Dashboard
                  </Link>
                  <button onClick={() => { logout(); setDropdownOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden-mobile" style={{ display: 'flex', gap: '12px' }}>
              <Link href="/auth/login" className="btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>Sign In</Link>
              <Link href="/auth/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Get Started</Link>
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }} className="show-mobile">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
          {[['/', 'Home'], ['/about', 'About'], ['/marketplace', 'Marketplace'], ['/impact', 'Impact'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setIsOpen(false)} style={{ display: 'block', padding: '12px 0', color: 'var(--text-secondary)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{label}</Link>
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            {!user && <>
              <Link href="/auth/login" className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Sign In</Link>
              <Link href="/auth/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Get Started</Link>
            </>}
          </div>
        </div>
      )}
    </nav>
  );
}
