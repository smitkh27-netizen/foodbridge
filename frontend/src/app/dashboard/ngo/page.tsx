'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { MapPin, CheckCircle2, Clock, Boxes, Users, ArrowUpRight, Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ngoAPI, donationAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };
const urgencyColors: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function NgoDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview' | 'donations'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assignModal, setAssignModal] = useState<{ open: boolean; donationId: string | null }>({ open: false, donationId: null });
  const [detailsModal, setDetailsModal] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [dashRes, donRes, volRes] = await Promise.all([
          ngoAPI.getDashboard(), ngoAPI.getNearbyDonations(), usersAPI.getVolunteers()
        ]);
        setStats(dashRes.data.stats);
        setDonations(donRes.data.donations || []);
        setVolunteers(volRes.data.volunteers || []);
      } catch (e) {} finally { setLoading(false); }
    };
    loadData();
  }, [user]);

  const acceptDonation = async (donationId: string) => {
    try {
      await donationAPI.updateStatus(donationId, { 
        status: 'accepted',
        ngoId: user?.uid,
        ngoName: user?.ngoName || user?.name || 'Verified NGO',
        ngoEmail: user?.email || '',
        ngoPhone: (user as any)?.phone || '',
        ngoRegNumber: (user as any)?.ngoRegNumber || '',
        ngoAddress: (user as any)?.ngoAddress || ''
      });
      setDonations(prev => prev.map(d => d._id === donationId ? { ...d, status: 'accepted', ngoId: user?.uid } : d));
      toast.success('Donation accepted! Please assign a volunteer.');
      
      // Automatically prompt to assign volunteer
      setAssignModal({ open: true, donationId });
    } catch { toast.error('Failed to accept'); }
  };

  const declineDonation = async (donationId: string) => {
    try {
      await donationAPI.updateStatus(donationId, { status: 'cancelled' });
      setDonations(prev => prev.filter(d => d._id !== donationId));
      toast.success('Donation declined');
    } catch { toast.error('Failed to decline'); }
  };

  const assignVolunteer = async (volunteerId: string) => {
    if (!assignModal.donationId) return;
    try {
      await ngoAPI.assignVolunteer({ donationId: assignModal.donationId, volunteerId });
      setDonations(prev => prev.map(d => d._id === assignModal.donationId ? { ...d, requestedVolunteerId: volunteerId, volunteerRequestStatus: 'pending' } : d));
      setAssignModal({ open: false, donationId: null });
      toast.success('Volunteer request sent!');
    } catch { toast.error('Failed to assign'); }
  };

  const filtered = donations.filter(d =>
    (d.status === 'pending' || ((d.status === 'accepted' || d.status === 'assigned') && d.ngoId === user?.uid)) &&
    (d.title?.toLowerCase().includes(search.toLowerCase()) || d.pickupLocation?.city?.toLowerCase().includes(search.toLowerCase())) &&
    (!categoryFilter || d.category === categoryFilter)
  );

  const statCards = [
    { label: 'Active Requests', value: stats?.accepted || 0, color: '#0ea5e9', icon: CheckCircle2 },
    { label: 'Pending Nearby', value: stats?.pendingNearby || 0, color: '#f97316', icon: Clock },
    { label: 'Completed', value: stats?.completed || 0, color: '#22c55e', icon: CheckCircle2 },
    { label: 'Volunteers', value: stats?.volunteerCount || 0, color: '#a855f7', icon: Users },
  ];

  return (
    <ProtectedRoute allowedRoles={['ngo']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>NGO Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{user?.ngoName || user?.name} • Manage donations & volunteers</p>
            </div>
            <NotificationBell />
          </div>

          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: '32px' }}>
            {statCards.map(s => (
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

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
            {[['overview', 'Overview'], ['donations', 'Available Donations']].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t as any)}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, background: tab === t ? '#22c55e' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>

          {tab === 'overview' ? (
            /* Inventory Preview */
            <div className="card">
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Inventory Overview</h2>
              {stats?.inventoryItems === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <Boxes size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>No inventory yet. Accept donations to start building your inventory.</p>
                </div>
              ) : (
                <div style={{ padding: '20px', background: 'rgba(34,197,94,0.06)', borderRadius: '14px', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: '#22c55e', fontFamily: 'Outfit, sans-serif' }}>{stats?.inventoryItems}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total items in inventory</div>
                </div>
              )}
            </div>
          ) : (
            /* Available Donations */
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city..." className="input" style={{ paddingLeft: '40px' }} />
                </div>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input" style={{ width: 'auto', minWidth: '150px' }}>
                  <option value="">All Categories</option>
                  {['food','clothes','toys','books','other'].map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>)}
                </select>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading nearby donations...</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }} className="card">
                  <MapPin size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No available donations found.</p>
                </div>
              ) : (
                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {filtered.map(d => (
                    <div key={d._id} className="card" onClick={() => setDetailsModal(d)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '32px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '14px' }}>{categoryIcon[d.category]}</div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{d.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{d.quantity}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: urgencyColors[d.urgency] || 'var(--text-secondary)', background: `${urgencyColors[d.urgency]}15` || 'rgba(148,163,184,0.1)', padding: '3px 10px', borderRadius: '100px', border: `1px solid ${urgencyColors[d.urgency]}30` }}>
                          {d.urgency?.toUpperCase()}
                        </span>
                      </div>

                      {/* Location */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        {d.pickupLocation?.address || d['pickupLocation.address'] || d.pickupLocation?.city || d['pickupLocation.city'] || 'Location not specified'}
                      </div>

                      {/* Donor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '13px' }}>{d.donor?.name?.[0]}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.donor?.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.donor?.organization || 'Individual Donor'}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-secondary)' }}>{formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}</span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {d.status === 'pending' ? (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); acceptDonation(d._id); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Accept</button>
                            <button onClick={(e) => { e.stopPropagation(); declineDonation(d._id); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>Decline</button>
                          </>
                        ) : d.volunteerRequestStatus === 'pending' ? (
                          <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(249,115,22,0.1)', color: '#f97316', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}>Request Sent to Volunteer...</div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setAssignModal({ open: true, donationId: d._id }); }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '14px' }}>Assign Vol.</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assign Volunteer Modal */}
          {assignModal.open && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '480px', padding: '28px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>Assign a Volunteer</h3>
                {volunteers.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No volunteers available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {volunteers.map(v => (
                      <button key={v._id} onClick={() => assignVolunteer(v._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#22c55e50', e.currentTarget.style.background = 'rgba(34,197,94,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.background = 'var(--bg-card)')}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#f97316,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>{v.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{v.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v.totalPickups} pickups • {v.volunteerPoints} pts</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setAssignModal({ open: false, donationId: null })} className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {detailsModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setDetailsModal(null)}>
              <div style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '560px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>{detailsModal.title}</h2>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: urgencyColors[detailsModal.urgency] || 'var(--text-secondary)', background: `${urgencyColors[detailsModal.urgency]}15` || 'rgba(148,163,184,0.1)', padding: '4px 12px', borderRadius: '100px', border: `1px solid ${urgencyColors[detailsModal.urgency]}30`, marginTop: '8px', display: 'inline-block' }}>
                      {detailsModal.urgency?.toUpperCase()} URGENCY
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card2)', padding: '20px', borderRadius: '16px' }}>
                  <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Quantity</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{detailsModal.quantity} {detailsModal.unit}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Category</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{categoryIcon[detailsModal.category]} {detailsModal.category}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Pickup Address</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {detailsModal.pickupLocation?.address || detailsModal['pickupLocation.address']},{' '}
                        {detailsModal.pickupLocation?.city || detailsModal['pickupLocation.city']}{' '}
                        {detailsModal.pickupLocation?.pincode || detailsModal['pickupLocation.pincode']}
                      </div>
                    </div>
                    {detailsModal.description && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Description</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 400, fontSize: '14px', lineHeight: '1.5' }}>{detailsModal.description}</div>
                      </div>
                    )}
                    {detailsModal.specialInstructions && (
                      <div style={{ gridColumn: 'span 2', background: 'rgba(245,158,11,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <div style={{ color: '#d97706', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Special Instructions</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>{detailsModal.specialInstructions}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Donor Information</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: '14px' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '18px' }}>{detailsModal.donor?.name?.[0]}</div>
                     <div>
                       <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{detailsModal.donor?.name}</div>
                       <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{detailsModal.donor?.organization || 'Individual Donor'}</div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                         <div style={{ fontSize: '14px', fontWeight: 600, color: '#0ea5e9', background: 'rgba(14,165,233,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', width: 'fit-content' }}>
                           📞 Current: {detailsModal.currentMobileNo || detailsModal.donor?.phone || 'Not provided'}
                         </div>
                         {detailsModal.alternateMobileNo && (
                           <div style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', width: 'fit-content' }}>
                             📞 Alternate: {detailsModal.alternateMobileNo}
                           </div>
                         )}
                       </div>
                     </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button onClick={() => { acceptDonation(detailsModal._id); setDetailsModal(null); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>Accept Donation</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
