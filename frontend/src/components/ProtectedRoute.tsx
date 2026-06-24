'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their respective dashboard if they try to access wrong role dashboard
        router.push(`/dashboard/${user.role}`);
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(34,197,94,0.1)', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Securing your session...</p>
        </div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null; // Will redirect in useEffect
  }

  // Prevent access to unverified users, except for admin
  if (user && user.role !== 'admin' && user.isVerified === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
            ⏳
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Pending Approval</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            Your account is currently under review by our administration team. You will be able to access your dashboard once approved.
          </p>
          <button onClick={() => { localStorage.clear(); window.location.href='/auth/login'; }} className="btn-outline" style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
