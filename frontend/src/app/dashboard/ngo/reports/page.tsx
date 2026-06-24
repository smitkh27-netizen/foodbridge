'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { ngoAPI } from '@/lib/api';
import { TrendingUp, Users, HeartHandshake, Package } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NgoReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ngoAPI.getImpactReport().then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute allowedRoles={['ngo']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Impact Reports</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Analyze your NGO's community impact</p>
            </div>
            <NotificationBell />
          </div>

          <div className="grid-2" style={{ marginBottom: '32px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.9, marginBottom: '20px' }}>
                <HeartHandshake size={24} />
                <span style={{ fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Impact</span>
              </div>
              <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{stats?.totalDonations || 0}</div>
              <div style={{ fontSize: '15px', opacity: 0.9 }}>Total donations processed</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.9, marginBottom: '20px' }}>
                <Users size={24} />
                <span style={{ fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>People Served</span>
              </div>
              <div style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{stats?.peopleServed || 0}</div>
              <div style={{ fontSize: '15px', opacity: 0.9 }}>Estimated individuals helped</div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '24px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Package size={20} color="#0ea5e9" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Category Breakdown</h2>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : stats?.categoryBreakdown?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.categoryBreakdown.map((item: any) => {
                    const percentage = Math.round((item.value / stats.totalDonations) * 100);
                    return (
                      <div key={item.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                          <span style={{ textTransform: 'capitalize' }}>{item.name}</span>
                          <span>{item.value} ({percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: '#0ea5e9', borderRadius: '100px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <TrendingUp size={20} color="#22c55e" />
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Trend</h2>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : stats?.monthlyTrend?.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingTop: '20px' }}>
                  {stats.monthlyTrend.map((item: any) => {
                    const maxCount = Math.max(...stats.monthlyTrend.map((t: any) => t.value));
                    const height = maxCount > 0 ? Math.round((item.value / maxCount) * 100) : 0;
                    return (
                      <div key={item.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '100%', height: '150px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <div style={{ width: '40px', height: `${height}%`, background: 'linear-gradient(to top, #22c55e, #4ade80)', borderRadius: '6px 6px 0 0', minHeight: '10px', transition: 'height 0.5s ease-out' }}></div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
