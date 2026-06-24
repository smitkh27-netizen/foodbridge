'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard, Package, MapPin, Users, BarChart3,
  ClipboardList, Truck, Star, Settings, LogOut, Heart,
  ShieldCheck, Bell, Boxes, Menu, X
} from 'lucide-react';

const donorLinks = [
  { href: '/dashboard/donor', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/donor/donate', icon: Package, label: 'New Donation' },
  { href: '/dashboard/donor/history', icon: ClipboardList, label: 'My Donations' },
  { href: '/dashboard/donor/impact', icon: BarChart3, label: 'My Impact' },
];
const ngoLinks = [
  { href: '/dashboard/ngo', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/ngo/donations', icon: MapPin, label: 'Nearby Donations' },
  { href: '/dashboard/ngo/inventory', icon: Boxes, label: 'Inventory' },
  { href: '/dashboard/ngo/volunteers', icon: Users, label: 'Volunteers' },
  { href: '/dashboard/ngo/reports', icon: BarChart3, label: 'Impact Reports' },
];
const volunteerLinks = [
  { href: '/dashboard/volunteer', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/volunteer/pickups', icon: Truck, label: 'My Pickups' },
  { href: '/dashboard/volunteer/history', icon: ClipboardList, label: 'History' },
  { href: '/dashboard/volunteer/leaderboard', icon: Star, label: 'Leaderboard' },
];
const adminLinks = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/admin/users', icon: Users, label: 'User Management' },
  { href: '/dashboard/admin/donations', icon: Package, label: 'All Donations' },
  { href: '/dashboard/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

const roleLinks: Record<string, typeof donorLinks> = {
  donor: donorLinks, ngo: ngoLinks, volunteer: volunteerLinks, admin: adminLinks,
};
const roleColors: Record<string, string> = {
  donor: '#22c55e', ngo: '#0ea5e9', volunteer: '#f97316', admin: '#a855f7',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user) return null;

  const links = roleLinks[user.role] || [];
  const color = roleColors[user.role] || '#22c55e';

  return (
    <>
      <button className="mobile-sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="FoodBridge Logo" width={36} height={36} style={{ borderRadius: '10px' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>FoodBridge</span>
        </Link>
      </div>

      {/* User Info */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${color}, ${color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {user.name}
              {(user.role === 'ngo' || user.role === 'admin') && <ShieldCheck size={14} color={color} />}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
              {user.role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setIsOpen(false)} className={`sidebar-link${active ? ' active' : ''}`}
              style={active ? { color, background: `${color}18`, borderLeft: `3px solid ${color}` } : {}}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="sidebar-link">
          <Settings size={18} /><span>Settings</span>
        </Link>
        <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={18} /><span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
