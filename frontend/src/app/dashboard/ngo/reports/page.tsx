'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { ngoAPI } from '@/lib/api';
import { BarChart3, TrendingUp, Users, HeartHandshake } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NgoReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just pulling basic dash stats for the report demo
    ngoAPI.getDashboard().then(({ data }) => setStats(data.stats)).finally(() => setLoading(false));
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
              <div style={{ fontSize: '15px', opacity: 0.9 }}>Successful distributions this month</div>
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

          <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px' }}>
            <BarChart3 size={64} color="var(--border)" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Detailed Analytics Coming Soon</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>We are working on comprehensive visual charts and downloadable PDF reports for your NGO's stakeholders.</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
