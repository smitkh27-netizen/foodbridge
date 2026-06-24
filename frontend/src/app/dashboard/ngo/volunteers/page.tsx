'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';
import { Users, Star, Truck, ShieldCheck, Mail, Phone } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NgoVolunteersPage() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    usersAPI.getVolunteers().then(({ data }) => setVolunteers(data.volunteers || [])).finally(() => setLoading(false));
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['ngo']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Volunteer Network</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Directory of all active FoodBridge volunteers</p>
            </div>
            <NotificationBell />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading volunteers...</div>
          ) : volunteers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <Users size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No volunteers found</h3>
              <p style={{ color: '#334155', fontSize: '14px' }}>Wait for volunteers to register on the platform.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {volunteers.map(v => (
                <div key={v._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#f97316,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '24px', flexShrink: 0 }}>
                      {v.name?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {v.name}
                        {v.isVerified && <ShieldCheck size={16} color="#22c55e" />}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '13px', fontWeight: 700 }}>
                          <Star size={14} fill="#f59e0b" /> {v.volunteerPoints || 0} pts
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9', fontSize: '13px', fontWeight: 600 }}>
                          <Truck size={14} /> {v.totalPickups || 0} pickups
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <Phone size={14} color="var(--text-muted)" /> {v.phone || 'Phone not provided'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <Mail size={14} color="var(--text-muted)" /> {v.email || 'Email not provided'}
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
