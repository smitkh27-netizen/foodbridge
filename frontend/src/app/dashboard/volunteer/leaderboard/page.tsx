'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { Star, Trophy, Medal, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { volunteerAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function VolunteerLeaderboardPage() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    volunteerAPI.getLeaderboard().then(({ data }) => setVolunteers(data.volunteers || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const getMedalColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // Gold
    if (index === 1) return '#94a3b8'; // Silver
    if (index === 2) return '#b45309'; // Bronze
    return 'transparent';
  };

  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Leaderboard <Trophy size={28} color="#f59e0b" />
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Top contributors in the FoodBridge network</p>
            </div>
            <NotificationBell />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading leaderboard...</div>
          ) : (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: '0' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                      <th>Volunteer</th>
                      <th>Location</th>
                      <th style={{ textAlign: 'right' }}>Total Pickups</th>
                      <th style={{ textAlign: 'right' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v, i) => (
                      <tr key={v._id} style={{ background: v._id === user?.uid ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                        <td style={{ textAlign: 'center' }}>
                          {i < 3 ? (
                            <Medal size={24} color={getMedalColor(i)} style={{ display: 'inline-block' }} />
                          ) : (
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#f97316,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '14px' }}>
                              {v.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                              {v.name} {v._id === user?.uid && <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '6px' }}>(You)</span>}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Global</div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{v.totalPickups || 0}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '6px 12px', borderRadius: '100px', fontWeight: 700, fontSize: '14px' }}>
                            <Star size={14} fill="#f59e0b" /> {v.volunteerPoints || 0}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
