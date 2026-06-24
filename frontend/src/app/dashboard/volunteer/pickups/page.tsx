'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { Truck, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { volunteerAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

export default function VolunteerPickupsPage() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    volunteerAPI.getDashboard().then(({ data }) => setPickups(data.activePickups || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (pickupId: string, status: string) => {
    setUpdatingId(pickupId);
    try {
      const formData = new FormData();
      formData.append('status', status);
      await volunteerAPI.updatePickup(pickupId, formData);
      toast.success(`Marked as ${status.replace('_', ' ')}!`);
      const { data } = await volunteerAPI.getDashboard();
      setPickups(data.activePickups || []);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>My Pickups</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your active deliveries</p>
            </div>
            <NotificationBell />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading pickups...</div>
          ) : pickups.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <Truck size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No active pickups</h3>
              <p style={{ color: '#334155', fontSize: '14px' }}>You have no active deliveries. Accept a request from the overview page.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {pickups.map(p => (
                <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: p.status === 'picked_up' ? '4px solid #3b82f6' : '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '14px' }}>{categoryIcon[p.category] || '📦'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.quantity} {p.unit}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: p.status === 'picked_up' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: p.status === 'picked_up' ? '#3b82f6' : '#8b5cf6', textTransform: 'uppercase' }}>
                      {p.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}><MapPin size={12} /> Pickup From</div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '14px', marginTop: '2px', fontWeight: 500 }}>{p.pickupLocation?.address || 'Address not provided'}</div>
                    </div>
                    <div style={{ borderTop: '1px dashed var(--border)' }}></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}><Navigation size={12} /> Deliver To</div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '14px', marginTop: '2px', fontWeight: 500 }}>{p.ngoName}</div>
                      {p.ngoAddress && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.ngoAddress}</div>}
                    </div>
                  </div>

                  {p.status === 'assigned' ? (
                    <button onClick={() => updateStatus(p._id, 'picked_up')} disabled={updatingId === p._id} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      {updatingId === p._id ? 'Processing...' : 'Mark as Picked Up'}
                    </button>
                  ) : (
                    <button onClick={() => updateStatus(p._id, 'delivered')} disabled={updatingId === p._id} className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#22c55e', borderColor: '#22c55e' }}>
                      {updatingId === p._id ? 'Processing...' : 'Mark as Delivered to NGO'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
