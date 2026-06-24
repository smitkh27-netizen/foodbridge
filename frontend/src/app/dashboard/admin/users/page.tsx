'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { Users, Package, ShieldCheck, TrendingUp, ArrowUpRight, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'users' | 'ngos' | 'volunteers'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const usersRes = await adminAPI.getAllUsers();
        setUsers(usersRes.data.users || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const { data } = await adminAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Action failed'); }
  };

  const verifyNgo = async (id: string) => {
    try {
      await adminAPI.verifyNgo(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified: true } : u));
      toast.success('User verified!');
    } catch { toast.error('Verification failed'); }
  };

  const filtered = users.filter(u =>
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter)
  );

  const roleColor: Record<string, string> = { donor: '#22c55e', ngo: '#0ea5e9', volunteer: '#f97316', admin: '#a855f7' };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Users...</div>;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>User Management</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage all accounts, NGOs, and Volunteers</p>
            </div>
            <NotificationBell />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
            {[['users', 'All Users'], ['ngos', 'NGO Verification'], ['volunteers', 'Volunteer Verification']].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t as any)}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, background: tab === t ? '#a855f7' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>

          {(tab === 'users' || tab === 'ngos' || tab === 'volunteers') && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input" style={{ paddingLeft: '40px' }} />
                </div>
                {tab === 'users' && (
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input" style={{ width: 'auto', minWidth: '140px' }}>
                    <option value="">All Roles</option>
                    {['donor','ngo','volunteer','admin'].map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
                  </select>
                )}
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      {tab === 'users' && <th>Role</th>}
                      <th>Email</th>
                      {tab === 'ngos' && <th>NGO Details</th>}
                      {tab === 'volunteers' && <th>Aadhar Details</th>}
                      {(tab === 'ngos' || tab === 'volunteers') && <th>Verified</th>}
                      {tab === 'users' && <th>Status</th>}
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tab === 'ngos' ? filtered.filter(u => u.role === 'ngo') : tab === 'volunteers' ? filtered.filter(u => u.role === 'volunteer') : filtered).map(u => (
                      <tr key={u._id} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer', transition: 'background 0.2s' }} className="hover-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${roleColor[u.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: roleColor[u.role], fontSize: '14px', flexShrink: 0 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500, fontSize: '14px' }}>{u.name}</span>
                          </div>
                        </td>
                        {tab === 'users' && <td><span className="badge" style={{ background: `${roleColor[u.role]}15`, color: roleColor[u.role], border: `1px solid ${roleColor[u.role]}30`, textTransform: 'capitalize' }}>{u.role}</span></td>}
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.email}</td>
                        {tab === 'ngos' && (
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>{u.ngoName || '—'}</span>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reg: {u.ngoRegNumber || 'N/A'}</span>
                            </div>
                          </td>
                        )}
                        {tab === 'volunteers' && (
                          <td>
                            {u.aadharNumber ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{u.aadharNumber}</span>
                              </div>
                            ) : <span style={{ color: 'var(--text-muted)' }}>Not Provided</span>}
                          </td>
                        )}
                        {(tab === 'ngos' || tab === 'volunteers') && (
                          <td>
                            {u.isVerified
                              ? <span className="badge badge-green"><CheckCircle size={12} /> Verified</span>
                              : <span className="badge badge-orange"><AlertTriangle size={12} /> Pending</span>}
                          </td>
                        )}
                        {tab === 'users' && (
                          <td>
                            <span className={`badge ${u.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                              {u.isActive !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                        )}
                        <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {u.createdAt ? formatDistanceToNow(
                            u.createdAt?.toDate ? u.createdAt.toDate() : 
                            (u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt)), 
                            { addSuffix: true }
                          ) : 'Recently'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {(tab === 'ngos' || tab === 'volunteers') && !u.isVerified && (
                              <button onClick={(e) => { e.stopPropagation(); verifyNgo(u._id); }} style={{ padding: '6px 14px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#22c55e', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                Verify
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); toggleStatus(u._id); }}
                              style={{ padding: '6px 14px', background: u.isActive !== false ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${u.isActive !== false ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, borderRadius: '8px', color: u.isActive !== false ? '#ef4444' : '#22c55e', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                              {u.isActive !== false ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {selectedUser && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)', position: 'relative' }}>
                <button onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <XCircle size={24} />
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${roleColor[selectedUser.role]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: roleColor[selectedUser.role], fontSize: '24px' }}>
                    {selectedUser.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedUser.name}</h2>
                    <span className="badge" style={{ background: `${roleColor[selectedUser.role]}15`, color: roleColor[selectedUser.role], textTransform: 'capitalize', marginTop: '4px' }}>{selectedUser.role}</span>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</div>
                    <div style={{ fontWeight: 600 }}>{selectedUser.email}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone Number</div>
                    <div style={{ fontWeight: 600 }}>{selectedUser.phone || 'N/A'}</div>
                  </div>
                  {selectedUser.role === 'donor' && selectedUser.organization && (
                    <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px', gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Organization</div>
                      <div style={{ fontWeight: 600 }}>{selectedUser.organization}</div>
                    </div>
                  )}
                  {selectedUser.role === 'donor' && (
                    <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px', gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Donations Made</div>
                      <div style={{ fontWeight: 600, fontSize: '18px', color: '#22c55e' }}>{selectedUser.totalDonations || 0}</div>
                    </div>
                  )}
                  {selectedUser.role === 'ngo' && (
                    <>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px', gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>NGO Name</div>
                        <div style={{ fontWeight: 600 }}>{selectedUser.ngoName}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Registration No.</div>
                        <div style={{ fontWeight: 600 }}>{selectedUser.ngoRegNumber}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Verification Status</div>
                        <div style={{ fontWeight: 600, color: selectedUser.isVerified ? '#22c55e' : '#f59e0b' }}>
                          {selectedUser.isVerified ? 'Verified' : 'Pending Approval'}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedUser.role === 'volunteer' && (
                    <>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Aadhar Number</div>
                        <div style={{ fontWeight: 600 }}>{selectedUser.aadharNumber}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Verification Status</div>
                        <div style={{ fontWeight: 600, color: selectedUser.isVerified ? '#22c55e' : '#f59e0b' }}>
                          {selectedUser.isVerified ? 'Verified' : 'Pending Approval'}
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Deliveries Completed</div>
                        <div style={{ fontWeight: 600, fontSize: '18px', color: '#0ea5e9' }}>{selectedUser.totalPickups || 0}</div>
                      </div>
                      <div style={{ background: 'var(--bg-card2)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Volunteer Points</div>
                        <div style={{ fontWeight: 600, fontSize: '18px', color: '#f97316' }}>{selectedUser.volunteerPoints || 0}</div>
                      </div>
                    </>
                  )}
                </div>

                {selectedUser.role === 'volunteer' && selectedUser.aadharUrl && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Aadhar Card Document</h3>
                    <img src={selectedUser.aadharUrl} alt="Aadhar Card" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
                  </div>
                )}

                {selectedUser.role === 'ngo' && selectedUser.ngoLicenseUrl && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>NGO License Certificate</h3>
                    {selectedUser.ngoLicenseUrl.includes('.pdf') ? (
                      <a href={selectedUser.ngoLicenseUrl} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ display: 'inline-block' }}>View PDF Document</a>
                    ) : (
                      <img src={selectedUser.ngoLicenseUrl} alt="NGO License" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} />
                    )}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  {(!selectedUser.isVerified && (selectedUser.role === 'ngo' || selectedUser.role === 'volunteer')) && (
                    <button onClick={() => { verifyNgo(selectedUser._id); setSelectedUser(prev => ({ ...prev, isVerified: true })); }} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      Approve Account
                    </button>
                  )}
                  <button onClick={() => { toggleStatus(selectedUser._id); setSelectedUser(prev => ({ ...prev, isActive: prev.isActive !== false ? false : true })); }} className="btn-outline" style={{ flex: 1, justifyContent: 'center', color: selectedUser.isActive !== false ? '#ef4444' : '#22c55e', borderColor: selectedUser.isActive !== false ? '#ef4444' : '#22c55e' }}>
                    {selectedUser.isActive !== false ? 'Suspend Account' : 'Re-activate Account'}
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
