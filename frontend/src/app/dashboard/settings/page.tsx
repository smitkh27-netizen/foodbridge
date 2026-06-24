'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Phone, Building, Briefcase, Mail, CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    organization: '',
    ngoName: '',
    ngoRegNumber: '',
    ngoAddress: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: (user as any).phone || '',
        organization: (user as any).organization || '',
        ngoName: user.ngoName || '',
        ngoRegNumber: (user as any).ngoRegNumber || '',
        ngoAddress: (user as any).ngoAddress || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required');
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      const updatedUser = { ...user, ...form } as any;
      setUser(updatedUser);
      localStorage.setItem('foodbridge_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute allowedRoles={['donor', 'ngo', 'volunteer', 'admin']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>Account Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>Manage your profile details and preferences.</p>

            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--primary)" /> Profile Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Non-editable email */}
                <div className="form-group">
                  <label className="input-label">Email Address (Read-only)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" value={user.email} disabled className="input" style={{ paddingLeft: '44px', background: 'var(--bg-card2)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="input-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="name" value={form.name} onChange={handleChange} className="input" style={{ paddingLeft: '44px' }} placeholder="John Doe" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="phone" value={form.phone} onChange={handleChange} className="input" style={{ paddingLeft: '44px' }} placeholder="+91 9876543210" />
                    </div>
                  </div>
                </div>

                {user.role === 'donor' && (
                  <div className="form-group">
                    <label className="input-label">Organization Name (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input name="organization" value={form.organization} onChange={handleChange} className="input" style={{ paddingLeft: '44px' }} placeholder="e.g. Acme Corp" />
                    </div>
                  </div>
                )}

                {user.role === 'ngo' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="input-label">NGO Registered Name</label>
                      <div style={{ position: 'relative' }}>
                        <Building size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input name="ngoName" value={form.ngoName} onChange={handleChange} className="input" style={{ paddingLeft: '44px' }} placeholder="Hope Foundation" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="input-label">NGO Registration Number</label>
                      <input name="ngoRegNumber" value={form.ngoRegNumber} onChange={handleChange} className="input" placeholder="REG/2024/001234" />
                    </div>
                    <div className="form-group">
                      <label className="input-label">NGO Registered Address</label>
                      <input name="ngoAddress" value={form.ngoAddress} onChange={handleChange} className="input" placeholder="123 Hope Lane, City Center" />
                    </div>
                  </div>
                )}
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSave} disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                    {loading ? 'Saving...' : <><CheckCircle2 size={18} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
