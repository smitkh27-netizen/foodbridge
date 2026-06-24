'use client';

import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { Users, Package, ShieldCheck, TrendingUp, ArrowUpRight, Search, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsAPI, adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          analyticsAPI.getPlatform(),
          adminAPI.getAllDonations()
        ]);
        setStats(statsRes.data.analytics);
        
        // Just get the 5 most recent
        if (donationsRes.data.donations) {
          setRecentDonations(donationsRes.data.donations.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.users?.total || 0, color: '#22c55e', sub: `${stats?.users?.donors || 0} active donors` },
    { label: 'Active NGOs', value: stats?.users?.ngos || 0, color: '#0ea5e9', sub: 'verified partners' },
    { label: 'Volunteers', value: stats?.users?.volunteers || 0, color: '#f97316', sub: 'fleet members' },
    { label: 'Total Donations', value: stats?.donations?.total || 0, color: '#a855f7', sub: `${stats?.donations?.completed || 0} successfully completed` },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Admin Control Panel</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Platform management & oversight</p>
            </div>
            <NotificationBell />
          </div>

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: '32px' }}>
            {statCards.map(s => (
              <div key={s.label} className="card-stat">
                <div style={{ fontSize: '36px', fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif', marginBottom: '6px' }}>{s.value}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.sub}</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
              </div>
            ))}
          </div>

          {stats && (
            <div className="grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
              <div className="card" style={{ height: '100%' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px' }}>Donation Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'In Transit / Active', value: stats.donations.active || 0, color: '#3b82f6' },
                    { label: 'Pending Request', value: stats.donations.pending || 0, color: '#f59e0b' },
                    { label: 'Completed', value: stats.donations.completed || 0, color: '#22c55e' },
                    { label: 'Rejected', value: stats.donations.rejected || 0, color: '#ef4444' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card" style={{ height: '100%' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px' }}>User Distribution</h3>
                {[
                  { role: 'Donors', count: stats.users.donors || 0, color: '#22c55e' },
                  { role: 'NGOs', count: stats.users.ngos || 0, color: '#0ea5e9' },
                  { role: 'Volunteers', count: stats.users.volunteers || 0, color: '#f97316' },
                ].map(item => (
                  <div key={item.role} style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.role}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.count}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${stats.users.total > 0 ? (item.count / stats.users.total) * 100 : 0}%`, background: item.color, borderRadius: '4px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>Live Donations Feed</h3>
              <Link href="/dashboard/admin/donations" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                View Full Ledger <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="table-wrapper" style={{ margin: 0, borderRadius: 0 }}>
              <table style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Donation Item</th>
                    <th>Status</th>
                    <th>Requested By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No recent donations found.
                      </td>
                    </tr>
                  ) : recentDonations.map(d => (
                    <tr key={d._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{d.foodType}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d.quantity} {d.unit}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          d.status === 'completed' || d.status === 'delivered' ? 'badge-green' : 
                          d.status === 'rejected' ? 'badge-red' : 
                          d.status === 'pending' ? 'badge-orange' : 'badge-blue'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{d.donor?.name || 'Unknown'}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {d.createdAt ? formatDistanceToNow(
                          d.createdAt?.toDate ? d.createdAt.toDate() : 
                          (d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date(d.createdAt)), 
                          { addSuffix: true }
                        ) : 'Recently'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
