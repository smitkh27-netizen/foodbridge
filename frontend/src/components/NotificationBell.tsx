'use client';
import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  _id: string; title: string; message: string;
  isRead: boolean; createdAt: string; type: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll();
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  useEffect(() => { fetchNotifications(); const i = setInterval(fetchNotifications, 30000); return () => clearInterval(i); }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const typeColor: Record<string, string> = {
    donation_created: '#22c55e', donation_accepted: '#0ea5e9',
    volunteer_assigned: '#a855f7', pickup_done: '#f97316',
    delivery_done: '#22c55e', ngo_verified: '#22c55e', account_suspended: '#ef4444',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ position: 'relative', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
        <Bell size={18} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{ position: 'absolute', right: 0, top: '110%', width: '380px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 999, overflow: 'hidden', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Notifications</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCheck size={14} /> Mark all read</button>}
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px' }}>No notifications yet</p>
                </div>
              ) : notifications.map(n => (
                <div key={n._id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--bg-card)', display: 'flex', gap: '12px', alignItems: 'flex-start', background: n.isRead ? 'transparent' : 'rgba(34,197,94,0.03)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(34,197,94,0.03)'; }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColor[n.type] || 'var(--text-muted)', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: n.isRead ? 400 : 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{n.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                  </div>
                  {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: '6px' }} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
