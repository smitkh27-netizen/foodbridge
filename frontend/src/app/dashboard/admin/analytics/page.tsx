'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart3, Users, Package, TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsAPI.getPlatform();
        setData(res.data.analytics);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Analytics...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No analytics available.</div>;

  const roleData = [
    { name: 'Donors', value: data.users.donors, color: '#22c55e' },
    { name: 'NGOs', value: data.users.ngos, color: '#0ea5e9' },
    { name: 'Volunteers', value: data.users.volunteers, color: '#f97316' },
  ].filter(d => d.value > 0);

  const donationData = [
    { name: 'Completed', value: data.donations.completed, color: '#22c55e' },
    { name: 'Active (Transit)', value: data.donations.active, color: '#3b82f6' },
    { name: 'Pending', value: data.donations.pending, color: '#f59e0b' },
    { name: 'Rejected', value: data.donations.rejected, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div style={{ display: 'flex', background: 'var(--bg-card2)', minHeight: '100vh' }}>
        <Sidebar />
        <main className="dashboard-content" style={{ flex: 1, padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Platform Analytics
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>In-depth insights into platform usage, donations, and user growth.</p>
          </div>

          <div className="grid-4" style={{ gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <Users size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Users</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{data.users.total}</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Package size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Donations</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{data.donations.total}</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                  <Activity size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Deliveries</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{data.donations.active}</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <TrendingUp size={20} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{data.donations.completed}</div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Donation Volume (Last 7 Days)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="donations" name="Donations" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorDonations)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>User Distribution</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Donation Status Breakdown</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }} width={100} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" name="Donations" radius={[0, 8, 8, 0]} barSize={32}>
                    {donationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
