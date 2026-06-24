'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { donationAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Heart, Package, Leaf, Users, Award, TrendingUp } from 'lucide-react';

export default function DonorImpactPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalKg: 0,
    totalMeals: 0,
    ngosHelped: 0
  });

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await donationAPI.getMyDonations();
        const donations = res.data.donations || [];
        
        let kg = 0;
        let meals = 0;
        const ngos = new Set();

        donations.forEach((d: any) => {
          if (d.unit === 'kg') kg += Number(d.quantity) || 0;
          if (d.estimatedServings) meals += Number(d.estimatedServings) || 0;
          if (d.ngoId) ngos.add(d.ngoId);
        });

        setStats({
          totalDonations: donations.length,
          totalKg: kg,
          totalMeals: meals,
          ngosHelped: ngos.size
        });
      } catch (err) {
        console.error("Failed to load impact stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['donor']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>My Impact</h1>
                <p style={{ color: 'var(--text-muted)' }}>See the difference you've made in the community.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '8px 16px', borderRadius: '100px', fontWeight: 700, fontSize: '14px' }}>
                <Award size={18} /> Top 10% Donor
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading your impact...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={24} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Donations</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginTop: '4px' }}>{stats.totalDonations}</div>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={24} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Meals Provided</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginTop: '4px' }}>{stats.totalMeals}</div>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Leaf size={24} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Food Saved (Kg)</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginTop: '4px' }}>{stats.totalKg}</div>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={24} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>NGOs Supported</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', marginTop: '4px' }}>{stats.ngosHelped}</div>
                    </div>
                  </div>

                </div>

                {/* Banner */}
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', borderRadius: '24px', padding: '32px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>You're making a real difference!</h2>
                    <p style={{ opacity: 0.9, maxWidth: '400px', lineHeight: '1.6' }}>Every kg of food you donate reduces food waste and feeds someone in need. Keep up the amazing work.</p>
                  </div>
                  <TrendingUp size={120} style={{ position: 'absolute', right: '20px', opacity: 0.2, bottom: '-20px' }} />
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
