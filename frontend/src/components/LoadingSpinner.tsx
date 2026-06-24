'use client';

export default function LoadingSpinner({ size = 40, color = '#22c55e' }: { size?: number, color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        border: '3px solid var(--bg-card2)', 
        borderTop: `3px solid ${color}`, 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
