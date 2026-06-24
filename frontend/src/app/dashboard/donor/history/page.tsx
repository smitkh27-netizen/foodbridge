'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { donationAPI } from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { MapPin, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  accepted: '#0ea5e9',
  assigned: '#8b5cf6',
  picked_up: '#3b82f6',
  delivered: '#10b981', // green
  completed: '#059669', // darker green
  cancelled: '#ef4444'
};

const statusLabels: Record<string, string> = {
  pending: 'Waiting for NGO',
  accepted: 'Accepted by NGO',
  assigned: 'Volunteer Assigned',
  picked_up: 'In Transit',
  delivered: 'Delivered to NGO',
  completed: 'Added to NGO Inventory',
  cancelled: 'Cancelled'
};

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

export default function DonorHistoryPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsModal, setDetailsModal] = useState<any>(null);

  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const res = await donationAPI.getMyDonations();
        setDonations(res.data.donations || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['donor']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>Donation History</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>Track the status and impact of all your past and current donations.</p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading history...</div>
            ) : donations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-card)', borderRadius: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px' }}>No donations yet</p>
                <p style={{ color: 'var(--text-secondary)' }}>Your donation history will appear here once you make your first contribution.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {donations.map(d => (
                  <div key={d._id} className="card" onClick={() => setDetailsModal(d)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: `6px solid ${statusColors[d.status] || '#cbd5e1'}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    
                    {/* Top Row: Info & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '32px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '14px' }}>
                          {categoryIcon[d.category] || '📦'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>{d.title}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                            <span>{d.quantity} {d.unit || (d.category === 'food' ? 'kg/servings' : 'items')}</span>
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{d.category}</span>
                            <span>•</span>
                            <span>{format(new Date(d.createdAt), 'MMM dd, yyyy - hh:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: `${statusColors[d.status]}15`, color: statusColors[d.status], padding: '6px 14px', borderRadius: '100px', fontWeight: 700, fontSize: '13px', border: `1px solid ${statusColors[d.status]}30` }}>
                        {statusLabels[d.status] || d.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Middle Row: Progress and Details */}
                    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '14px' }}>
                      
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pickup Location</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {d.pickupLocation?.address || d['pickupLocation.address'] || d.pickupLocation?.city || d['pickupLocation.city'] || 'Location not specified'}
                        </div>
                      </div>

                      {/* NGO Details */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Handling NGO</div>
                        {d.ngoId || d.status !== 'pending' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} color="#0ea5e9" />
                              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{d.ngoName || 'Verified NGO'}</span>
                            </div>
                            {d.ngoEmail && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '24px' }}>{d.ngoEmail}</span>}
                          </div>
                        ) : (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Pending Acceptance...</div>
                        )}
                      </div>

                      {/* Volunteer Details */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Assigned Volunteer</div>
                        {d.volunteerId ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Truck size={16} color="#8b5cf6" />
                              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{d.volunteerName || 'Delivery Agent'}</span>
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '24px' }}>📞 {d.volunteerPhone || 'Not provided'}</span>
                          </div>
                        ) : (d.ngoId || d.status !== 'pending') ? (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Awaiting Assignment...</div>
                        ) : (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>-</div>
                        )}
                      </div>

                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Modal */}
          {detailsModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setDetailsModal(null)}>
              <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '560px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{detailsModal.title}</h2>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: statusColors[detailsModal.status] || 'var(--text-secondary)', background: `${statusColors[detailsModal.status]}15`, padding: '4px 12px', borderRadius: '100px', border: `1px solid ${statusColors[detailsModal.status]}30`, marginTop: '8px', display: 'inline-block' }}>
                      {statusLabels[detailsModal.status] || detailsModal.status?.toUpperCase()}
                    </span>
                  </div>
                  <button onClick={() => setDetailsModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                </div>

                {detailsModal.images && detailsModal.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {detailsModal.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 }} />
                    ))}
                  </div>
                )}

                {/* NGO & Volunteer Info Section */}
                {(detailsModal.ngoId || detailsModal.status !== 'pending') && (
                  <div style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.15)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#0ea5e9" /> NGO Details
                    </h3>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{detailsModal.ngoName || 'Verified NGO'}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{detailsModal.ngoEmail || 'Contact information hidden'}</div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {detailsModal.ngoPhone && (
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(14,165,233,0.2)' }}>
                            📞 {detailsModal.ngoPhone}
                          </div>
                        )}
                        {detailsModal.ngoRegNumber && (
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            📄 Reg: {detailsModal.ngoRegNumber}
                          </div>
                        )}
                      </div>

                      {detailsModal.ngoAddress && (
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '6px', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                          {detailsModal.ngoAddress}
                        </div>
                      )}
                    </div>
                    
                    {detailsModal.volunteerId && (
                      <div style={{ borderTop: '1px solid rgba(14,165,233,0.15)', paddingTop: '16px', marginTop: '4px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Truck size={18} color="#8b5cf6" /> Assigned Volunteer
                        </h3>
                        <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{detailsModal.volunteerName}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#8b5cf6', marginTop: '6px', display: 'inline-block', background: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.2)' }}>
                          📞 {detailsModal.volunteerPhone || 'Phone number not provided'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
