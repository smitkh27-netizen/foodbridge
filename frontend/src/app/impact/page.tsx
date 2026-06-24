'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { analyticsAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Heart, Shirt, BookOpen, Star, Users, Building2 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORY_COLORS: Record<string, string> = { food: '#22c55e', clothes: '#0ea5e9', toys: '#f97316', books: '#a855f7', other: '#14b8a6' };
const CATEGORY_ICON: Record<string, string> = { food: '🍱', clothes: '👕', toys: '🧸', books: '📚', other: '♻️' };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color, fontWeight: 700, fontSize: '14px' }}>{p.value} donations</div>)}
    </div>
  );
  return null;
};

export default function ImpactPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getPlatform()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch((e) => console.log('API call failed during migration:', e.message))
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = analytics?.monthly?.map((m: any) => ({
    name: MONTHS[m._id.month - 1],
    donations: m.count,
    completed: m.completed,
  })) || [];

  const pieData = analytics?.categoryBreakdown?.map((c: any) => ({
    name: c._id, value: c.count, color: CATEGORY_COLORS[c._id] || 'var(--text-muted)',
  })) || [];

  const impactStats = [
    { label: 'Meals Saved', value: analytics?.totalMealsSaved || 0, icon: '🍽️', color: '#22c55e', desc: 'Total estimated servings' },
    { label: 'Total Donations', value: analytics?.totalDonations || 0, icon: '📦', color: '#0ea5e9', desc: 'Items listed on platform' },
    { label: 'Deliveries Done', value: analytics?.totalCompleted || 0, icon: '✅', color: '#22c55e', desc: 'Successfully completed' },
    { label: 'Active NGOs', value: analytics?.activeNgos || 0, icon: '🏢', color: '#f97316', desc: 'Verified & operating' },
    { label: 'Volunteers', value: analytics?.activeVolunteers || 0, icon: '🚗', color: '#a855f7', desc: 'Ready to help' },
    { label: 'Success Rate', value: `${analytics?.successRate || 0}%`, icon: '📈', color: '#f59e0b', desc: 'Donation completion rate' },
  ];

  return (
    <div style={{ background: 'var(--bg-card2)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '100px', maxWidth: '1280px', margin: '0 auto', padding: '100px 24px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Platform Impact</span>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, margin: '16px 0 16px', color: 'var(--text-primary)' }}>
            Our Collective <span className="gradient-text">Impact</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px', margin: '0 auto' }}>
            Real numbers. Real people helped. See how FoodBridge is changing lives every single day.
          </p>
        </div>

        {/* Impact Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
          {impactStats.map(s => (
            <div key={s.label} className="card-stat" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: s.color, fontFamily: 'Outfit, sans-serif', marginBottom: '8px' }}>
                {loading ? '—' : s.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Monthly Bar Chart */}
          <div className="card">
            <h2 style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '24px' }}>Monthly Donation Trend</h2>
            {loading || monthlyData.length === 0 ? (
              <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                {loading ? 'Loading chart...' : 'No data available yet'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barCategoryGap="30%">
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-card)' }} />
                  <Bar dataKey="donations" fill="#22c55e" radius={[6, 6, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Pie Chart */}
          <div className="card">
            <h2 style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '24px' }}>By Category</h2>
            {loading || pieData.length === 0 ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                {loading ? 'Loading...' : 'No data yet'}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [v, n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  {pieData.map((d: any) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{CATEGORY_ICON[d.name]} {d.name}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '60px', background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(14,165,233,0.08))', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '28px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Be Part of the Story</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '28px' }}>Every donation adds to these numbers. Start your contribution today.</p>
          <a href="/auth/register?role=donor" className="btn-primary" style={{ padding: '14px 36px', fontSize: '16px' }}>Start Donating →</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
