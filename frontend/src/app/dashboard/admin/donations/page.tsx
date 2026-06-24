'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Search, CheckCircle, Clock, AlertTriangle, XCircle, Info, Filter, MoreHorizontal, User as UserIcon, Truck, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminAPI.getAllDonations();
        setDonations(res.data.donations || []);
      } catch {
        toast.error('Failed to load donations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = donations.filter(d => {
    const matchSearch = 
      d.foodType?.toLowerCase().includes(search.toLowerCase()) || 
      d.donor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.ngoName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? d.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="badge badge-green"><CheckCircle size={12} /> Completed</span>;
      case 'delivered': return <span className="badge badge-green"><CheckCircle size={12} /> Delivered</span>;
      case 'assigned': return <span className="badge badge-blue"><Truck size={12} /> Assigned</span>;
      case 'picked_up': return <span className="badge badge-blue"><Truck size={12} /> Picked Up</span>;
      case 'accepted': return <span className="badge badge-orange"><CheckCircle size={12} /> Accepted</span>;
      case 'pending': return <span className="badge badge-orange"><Clock size={12} /> Pending</span>;
      case 'rejected': return <span className="badge badge-red"><AlertTriangle size={12} /> Rejected</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getFoodIcon = (category: string) => {
    return '🍲'; // Simplified for admin dashboard
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Donations...</div>;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                All Donations
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Comprehensive ledger of all donations across the platform.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '12px 24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Ledger</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{donations.length}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search by food type, donor name, or NGO..." 
                  className="input" 
                  style={{ paddingLeft: '48px', height: '48px', fontSize: '15px' }} 
                />
              </div>
              <div style={{ position: 'relative', minWidth: '180px' }}>
                <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)} 
                  className="input" 
                  style={{ paddingLeft: '48px', height: '48px', appearance: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted (NGO)</option>
                  <option value="assigned">Assigned (Volunteer)</option>
                  <option value="picked_up">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Donation Item</th>
                    <th>Donor</th>
                    <th>Assigned NGO</th>
                    <th>Volunteer</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No donations found matching your filters.
                      </td>
                    </tr>
                  ) : filtered.map(d => (
                    <tr key={d._id} className="hover-row" onClick={() => setSelectedDonation(d)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            {getFoodIcon(d.category)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{d.foodType}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{d.quantity} {d.unit || 'items'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {d.donor?.name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                              {d.donor.name[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{d.donor.name}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unknown Donor</span>}
                      </td>
                      <td>
                        {d.ngoName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={14} color="var(--text-secondary)" />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{d.ngoName}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unassigned</span>}
                      </td>
                      <td>
                        {d.volunteerName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserIcon size={14} color="var(--text-secondary)" />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>{d.volunteerName}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unassigned</span>}
                      </td>
                      <td>{getStatusBadge(d.status)}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {d.createdAt ? formatDistanceToNow(
                          d.createdAt?.toDate ? d.createdAt.toDate() : 
                          (d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000) : new Date(d.createdAt)), 
                          { addSuffix: true }
                        ) : 'Recently'}
                      </td>
                      <td>
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border)' }} onClick={(e) => { e.stopPropagation(); setSelectedDonation(d); }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donation Details Modal */}
          {selectedDonation && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', position: 'relative' }}>
                <button onClick={() => setSelectedDonation(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <XCircle size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    {getFoodIcon(selectedDonation.category)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedDonation.foodType}</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {getStatusBadge(selectedDonation.status)}
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> 
                        {selectedDonation.createdAt ? new Date(selectedDonation.createdAt?.toDate ? selectedDonation.createdAt.toDate() : (selectedDonation.createdAt?.seconds ? selectedDonation.createdAt.seconds * 1000 : selectedDonation.createdAt)).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '20px', marginBottom: '32px' }}>
                  {/* Donor Info */}
                  <div style={{ background: 'var(--bg-card2)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <UserIcon size={18} color="#22c55e" />
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Requested By (Donor)</h3>
                    </div>
                    {selectedDonation.donor ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Name:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.donor.name}</span></div>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Phone:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.donor.phone || 'N/A'}</span></div>
                        {selectedDonation.donor.organization && (
                          <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Org:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.donor.organization}</span></div>
                        )}
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Pickup Address:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.pickupLocation?.address || 'N/A'}</span></div>
                      </div>
                    ) : <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Donor information unavailable</div>}
                  </div>

                  {/* NGO Info */}
                  <div style={{ background: 'var(--bg-card2)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Building2 size={18} color="#0ea5e9" />
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Sent To (NGO)</h3>
                    </div>
                    {selectedDonation.ngoName ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>NGO Name:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.ngoName}</span></div>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Email:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.ngoEmail || 'N/A'}</span></div>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Phone:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.ngoPhone || 'N/A'}</span></div>
                        {selectedDonation.status === 'rejected' && (
                          <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            Rejected by this NGO
                          </div>
                        )}
                      </div>
                    ) : <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not accepted by any NGO yet</div>}
                  </div>

                  {/* Volunteer Info */}
                  <div style={{ background: 'var(--bg-card2)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Truck size={18} color="#f97316" />
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Completed By (Volunteer)</h3>
                    </div>
                    {selectedDonation.volunteerName ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Name:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.volunteerName}</span></div>
                        <div><span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Phone:</span> <span style={{ fontWeight: 600 }}>{selectedDonation.volunteerPhone || 'N/A'}</span></div>
                        {(selectedDonation.status === 'completed' || selectedDonation.status === 'delivered') && (
                          <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                            Delivery successfully completed
                          </div>
                        )}
                      </div>
                    ) : <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not assigned to any volunteer yet</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedDonation(null)} className="btn-primary">
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </ProtectedRoute>
  );
}
