'use client';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { ngoAPI } from '@/lib/api';
import { Boxes, PackageOpen, LayoutGrid, List } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format } from 'date-fns';

const categoryIcon: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

export default function NgoInventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!user) return;
    ngoAPI.getInventory().then(({ data }) => setInventory(data.inventory || [])).finally(() => setLoading(false));
  }, [user]);

  const totalItems = inventory.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  const categories = Array.from(new Set(inventory.map(i => i.category)));

  return (
    <ProtectedRoute allowedRoles={['ngo']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>NGO Inventory</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Manage stock received from donations</p>
            </div>
            <NotificationBell />
          </div>

          <div className="grid-3" style={{ marginBottom: '32px' }}>
            <div className="card-stat">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Boxes size={22} color="#22c55e" />
                </div>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 800, color: '#22c55e', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{inventory.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Unique Deliveries</div>
            </div>
            <div className="card-stat">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PackageOpen size={22} color="#0ea5e9" />
                </div>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 800, color: '#0ea5e9', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{totalItems}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Estimated Units</div>
            </div>
            <div className="card-stat">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutGrid size={22} color="#a855f7" />
                </div>
              </div>
              <div style={{ fontSize: '34px', fontWeight: 800, color: '#a855f7', fontFamily: 'Outfit, sans-serif', marginBottom: '4px' }}>{categories.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Categories</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Current Stock</h2>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: '10px' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '8px', borderRadius: '6px', border: 'none', background: viewMode === 'grid' ? '#e2e8f0' : 'transparent', cursor: 'pointer' }}><LayoutGrid size={18} color="var(--text-secondary)" /></button>
              <button onClick={() => setViewMode('list')} style={{ padding: '8px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#e2e8f0' : 'transparent', cursor: 'pointer' }}><List size={18} color="var(--text-secondary)" /></button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading inventory...</div>
          ) : inventory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <Boxes size={56} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Your inventory is empty</h3>
              <p style={{ color: '#334155', fontSize: '14px' }}>Accept donations and mark them as received to build stock.</p>
            </div>
          ) : (
            <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' } : { display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inventory.map(item => (
                <div key={item._id} className="card" style={viewMode === 'list' ? { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px' } : {}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{ fontSize: '32px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card2)', borderRadius: '16px', shrink: 0 }}>
                      {categoryIcon[item.category] || '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>{item.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Donated by {item.donorName}</div>
                    </div>
                  </div>

                  <div style={viewMode === 'grid' ? { marginTop: '20px', display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px' } : { display: 'flex', gap: '40px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Quantity</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{item.quantity} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.unit}</span></div>
                    </div>
                    <div style={{ textAlign: viewMode === 'grid' ? 'right' : 'left' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Received</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{format(new Date(item.addedAt), 'MMM dd, yyyy')}</div>
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
