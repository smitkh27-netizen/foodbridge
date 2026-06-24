'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { ngoAPI, donationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { MapPin, Truck, CheckCircle2, Package, Clock, Navigation } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

export default function NgoDonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadDonations();
  }, [user]);

  const loadDonations = async () => {
    try {
      const { data } = await ngoAPI.getNearbyDonations();
      // Only keep donations accepted by this NGO
      const myDonations = data.donations.filter((d: any) => d.ngoId === user?.uid && d.status !== 'pending');
      setDonations(myDonations);
    } catch { }
    finally { setLoading(false); }
  };

  const markAsReceived = async (donation: any) => {
    setProcessingId(donation._id);
    try {
      // Add to inventory
      await ngoAPI.addInventory({
        title: donation.title,
        category: donation.category,
        quantity: donation.quantity,
        unit: donation.unit || (donation.category === 'food' ? 'kg' : 'items'),
        sourceDonationId: donation._id,
        donorName: donation.donor?.name || 'Anonymous'
      });

      // Update donation status to completed
      await donationAPI.updateStatus(donation._id, { status: 'completed', receivedAt: new Date().toISOString() });
      
      // Reward the volunteer
      if (donation.volunteerId) {
        const volRef = doc(db, 'users', donation.volunteerId);
        const volDoc = await getDoc(volRef);
        if (volDoc.exists()) {
          const vData = volDoc.data();
          await updateDoc(volRef, {
            totalPickups: (vData.totalPickups || 0) + 1,
            volunteerPoints: (vData.volunteerPoints || 0) + 10
          });
        }
      }

      toast.success('Donation marked as Received and added to Inventory!');
      loadDonations();
    } catch { toast.error('Failed to process receipt.'); }
    finally { setProcessingId(null); }
  };

  const getStatusBadge = (d: any) => {
    if (d.status === 'completed') return { label: 'Received', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
    if (d.status === 'delivered') return { label: 'Ready to Receive', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    if (d.status === 'picked_up') return { label: 'In Transit', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    if (d.status === 'assigned') return { label: 'Awaiting Pickup', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
    if (d.volunteerRequestStatus === 'pending') return { label: 'Waiting for Volunteer', color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
    return { label: 'Pending Assignment', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  };

  return (
    <ProtectedRoute allowedRoles={['ngo']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>My Donations</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Track accepted donations from pickup to receipt</p>
            </div>
            <NotificationBell />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading your donations...</div>
          ) : donations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <Package size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No active donations</h3>
              <p style={{ color: '#334155', fontSize: '14px' }}>Accept a donation from the overview page to see it here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {donations.map(d => {
                const badge = getStatusBadge(d);
                return (
                  <div key={d._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '300px' }}>
                      <div style={{ fontSize: '32px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '16px' }}>
                        {categoryIcon[d.category] || '📦'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{d.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                          {d.quantity} {d.unit || (d.category === 'food' ? 'kg/servings' : 'items')} • <span style={{ textTransform: 'capitalize' }}>{d.category}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Volunteer</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {d.volunteerName ? (
                          <>
                            <Truck size={16} color="#0ea5e9" />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{d.volunteerName}</span>
                          </>
                        ) : d.volunteerRequestStatus === 'pending' ? (
                          <>
                            <Clock size={16} color="#f97316" />
                            <span style={{ color: '#f97316', fontSize: '14px', fontWeight: 500 }}>Request Pending</span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Not assigned yet</span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 700, color: badge.color, background: badge.bg, border: `1px solid ${badge.color}30`, minWidth: '160px', textAlign: 'center' }}>
                      {badge.label}
                    </div>

                    <div style={{ minWidth: '150px', textAlign: 'right' }}>
                      {d.status === 'delivered' ? (
                        <button onClick={() => markAsReceived(d)} disabled={processingId === d._id} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                          {processingId === d._id ? 'Processing...' : 'Mark Received'}
                        </button>
                      ) : d.status === 'completed' ? (
                        <div style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <CheckCircle2 size={18} /> In Inventory
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Awaiting Arrival</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
