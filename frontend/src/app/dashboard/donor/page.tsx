'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { Heart, Package, TrendingUp, Clock, Plus, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { donationAPI } from '@/lib/api';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };
const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'badge-orange' },
  accepted: { label: 'Accepted', class: 'badge-blue' },
  assigned: { label: 'Assigned', class: 'badge-purple' },
  picked_up: { label: 'In Transit', class: 'badge-orange' },
  delivered: { label: 'Delivered', class: 'badge-green' },
  completed: { label: 'Completed', class: 'badge-green' },
  cancelled: { label: 'Cancelled', class: 'badge-red' },
};

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    donationAPI.getMyDonations().then(({ data }) => {
      setDonations(data.donations || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const stats = [
    { label: 'Total Donations', value: donations.length, icon: Package, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Completed', value: donations.filter(d => d.status === 'completed').length, icon: CheckCircle2, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { label: 'Pending', value: donations.filter(d => d.status === 'pending').length, icon: Clock, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { label: 'People Impacted', value: donations.reduce((s, d) => s + (d.estimatedServings || 0), 0) || '—', icon: Heart, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ];

  return (
    <ProtectedRoute allowedRoles={['donor']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Here's your donation activity overview</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <NotificationBell />
              <Link href="/dashboard/donor/donate" className="btn-primary" style={{ padding: '10px 20px' }}>
                <Plus size={16} /> New Donation
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '32px' }}>
            {stats.map((s) => (
              <div key={s.label} className="card-stat">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={24} color={s.color} />
                  </div>
                  <ArrowUpRight size={16} color="#334155" />
                </div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
                {/* Glow */}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
              </div>
            ))}
          </div>

          {/* Recent Donations + Quick Action */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Donations Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Donations</h2>
                <Link href="/dashboard/donor/history" style={{ fontSize: '13px', color: '#22c55e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
              ) : donations.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <Package size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No donations yet. Start making an impact!</p>
                  <Link href="/dashboard/donor/donate" className="btn-primary" style={{ padding: '10px 24px' }}>Create First Donation</Link>
                </div>
              ) : (
                <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                  <table>
                    <thead>
                      <tr><th>Item</th><th>Category</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {donations.slice(0, 8).map(d => (
                        <tr key={d._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>{categoryIcon[d.category] || '📦'}</span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{d.title}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{d.quantity}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge badge-gray`} style={{ textTransform: 'capitalize' }}>{d.category}</span></td>
                          <td><span className={`badge ${statusConfig[d.status]?.class || 'badge-gray'}`}>{statusConfig[d.status]?.label || d.status}</span></td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions + Impact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { href: '/dashboard/donor/donate', label: 'Donate Food', icon: '🍱', color: '#22c55e' },
                    { href: '/dashboard/donor/donate?cat=clothes', label: 'Donate Clothes', icon: '👕', color: '#0ea5e9' },
                    { href: '/dashboard/donor/donate?cat=books', label: 'Donate Books', icon: '📚', color: '#a855f7' },
                    { href: '/dashboard/donor/donate?cat=toys', label: 'Donate Toys', icon: '🧸', color: '#f97316' },
                  ].map(a => (
                    <Link key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', textDecoration: 'none', border: '1px solid var(--bg-card2)', transition: 'all 0.2s', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${a.color}10`, e.currentTarget.style.borderColor = `${a.color}30`, e.currentTarget.style.color = a.color)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)', e.currentTarget.style.borderColor = 'var(--bg-card2)', e.currentTarget.style.color = 'var(--text-secondary)')}>
                      <span style={{ fontSize: '20px' }}>{a.icon}</span> {a.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(14,165,233,0.1))', borderColor: 'rgba(34,197,94,0.2)' }}>
                <Heart size={28} color="#22c55e" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>Your Impact</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>Every donation you make helps reduce food waste and supports families in need. Thank you for making a difference!</p>
                <Link href="/dashboard/donor/impact" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: '#22c55e', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  View Impact <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
