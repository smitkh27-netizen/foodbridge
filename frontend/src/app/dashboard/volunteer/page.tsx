'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { Truck, CheckCircle2, Star, MapPin, Camera, ArrowUpRight, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { volunteerAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    volunteerAPI.getDashboard().then(({ data }) => setDashData(data))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const updateStatus = async (pickupId: string, status: string) => {
    setUpdatingId(pickupId);
    try {
      const formData = new FormData();
      formData.append('status', status);
      await volunteerAPI.updatePickup(pickupId, formData);
      toast.success(`Status updated to ${status.replace('_', ' ')}!`);
      const { data } = await volunteerAPI.getDashboard();
      setDashData(data);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const respondToRequest = async (donationId: string, accept: boolean) => {
    setUpdatingId(donationId);
    try {
      await volunteerAPI.respondToRequest(donationId, accept);
      toast.success(accept ? 'Pickup accepted!' : 'Pickup declined.');
      const { data } = await volunteerAPI.getDashboard();
      setDashData(data);
    } catch { toast.error('Failed to respond to request'); }
    finally { setUpdatingId(null); }
  };

  const stats = [
    { label: 'Assigned', value: dashData?.stats?.assigned || 0, color: '#0ea5e9', icon: Truck },
    { label: 'Picked Up', value: dashData?.stats?.pickedUp || 0, color: '#f97316', icon: CheckCircle2 },
    { label: 'Completed', value: dashData?.stats?.completed || 0, color: '#22c55e', icon: CheckCircle2 },
    { label: 'Points Earned', value: dashData?.stats?.points || 0, color: '#f59e0b', icon: Star },
  ];

  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                Volunteer Hub 🚗
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage your pickups and track your impact</p>
            </div>
            <NotificationBell />
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '32px' }}>
            {stats.map(s => (
              <div key={s.label} className="card-stat">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={22} color={s.color} />
                  </div>
                  <ArrowUpRight size={16} color="#334155" />
                </div>
                <div style={{ fontSize: '34px', fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {dashData?.pendingRequests?.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }}></span> Pending Requests
              </h2>
              <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {dashData.pendingRequests.map((p: any) => (
                  <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '32px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '14px' }}>{categoryIcon[p.category] || '📦'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.quantity}</div>
                      </div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid var(--bg-card2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <MapPin size={12} /> Pickup Location
                      </div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{p.pickupLocation?.address || 'Address not provided'}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '13px' }}>{p.ngoName?.[0] || 'N'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Requested by NGO: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.ngoName}</span></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => respondToRequest(p._id, true)} disabled={updatingId === p._id} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '14px' }}>
                        {updatingId === p._id ? 'Processing...' : 'Accept Request'}
                      </button>
                      <button onClick={() => respondToRequest(p._id, false)} disabled={updatingId === p._id} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Pickups */}
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Active Pickups</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading your assignments...</div>
          ) : !dashData?.activePickups?.length ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <Truck size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No active pickups</h3>
              <p style={{ color: '#334155', fontSize: '14px' }}>Your NGO will assign pickups to you. Stay available!</p>
            </div>
          ) : (
            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {dashData.activePickups.map((p: any) => (
                <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '14px' }}>{categoryIcon[p.category] || '📦'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.quantity}</div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: p.status === 'assigned' ? 'rgba(14,165,233,0.15)' : 'rgba(249,115,22,0.15)', color: p.status === 'assigned' ? '#0ea5e9' : '#f97316', border: `1px solid ${p.status === 'assigned' ? '#0ea5e930' : '#f9731630'}` }}>
                      {p.status === 'assigned' ? 'ASSIGNED' : 'PICKED UP'}
                    </span>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid var(--bg-card2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <MapPin size={12} /> Pickup Location
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{p.pickupLocation?.address || 'Address not provided'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{p.donor?.phone}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '13px' }}>{p.ngoName?.[0] || p.assignedNgo?.name?.[0] || 'N'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Assigned by: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.ngoName || p.assignedNgo?.ngoName || p.assignedNgo?.name}</span></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(p.pickupLocation?.address || '')}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
                      <Navigation size={14} /> Navigate
                    </a>
                    {p.status === 'assigned' && (
                      <button onClick={() => updateStatus(p._id, 'picked_up')} disabled={updatingId === p._id} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
                        {updatingId === p._id ? 'Updating...' : 'Mark Picked Up'}
                      </button>
                    )}
                    {p.status === 'picked_up' && (
                      <button onClick={() => updateStatus(p._id, 'delivered')} disabled={updatingId === p._id} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '13px', background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                        {updatingId === p._id ? 'Updating...' : 'Mark Delivered'}
                      </button>
                    )}
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
