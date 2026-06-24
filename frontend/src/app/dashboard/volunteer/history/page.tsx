'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, History, MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { volunteerAPI } from '@/lib/api';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

export default function VolunteerHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    volunteerAPI.getHistory().then(({ data }) => setHistory(data.history || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Pickup History</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Review your past successful deliveries</p>
            </div>
            <NotificationBell />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading history...</div>
          ) : history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <History size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No history yet</h3>
              <p style={{ color: '#334155', fontSize: '14px' }}>Complete your first pickup to start building your record!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {history.map(p => (
                <div key={p._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px' }}>
                    <div style={{ fontSize: '32px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '14px' }}>{categoryIcon[p.category] || '📦'}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.quantity} {p.unit}</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <MapPin size={14} color="#f97316" /> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>From:</span> {p.pickupLocation?.address || 'Donor Location'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <Navigation size={14} color="#0ea5e9" /> <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>To:</span> {p.ngoName || 'NGO'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '150px' }}>
                    <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#22c55e', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <CheckCircle2 size={14} /> Delivered
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {format(new Date(p.updatedAt || p.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
