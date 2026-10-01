import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheckDouble, FaCircle } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const typeColors = {
  fee_due: 'bg-red-500',
  attendance_low: 'bg-orange-500',
  result_published: 'bg-green-500',
  grievance_update: 'bg-purple-500',
  admission: 'bg-blue-500',
  exam_scheduled: 'bg-indigo-500',
  library: 'bg-teal-500',
  general: 'bg-gray-500',
};

const typeIcons = {
  fee_due: '💰',
  attendance_low: '📋',
  result_published: '🏆',
  grievance_update: '📣',
  admission: '🎓',
  exam_scheduled: '📝',
  library: '📚',
  general: '🔔',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const token = localStorage.getItem('access_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const [notifsRes, countRes] = await Promise.all([
        fetch(`${API}/notifications/my`, { headers }),
        fetch(`${API}/notifications/my/unread-count`, { headers }),
      ]);
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (countRes.ok) { const d = await countRes.json(); setUnread(d.unread_count); }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', headers });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    setLoading(true);
    await fetch(`${API}/notifications/mark-all-read`, { method: 'PATCH', headers });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
    setLoading(false);
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <FaBell className="text-xl text-white" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
          >
            {unread > 99 ? '99+' : unread}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-white font-semibold">Notifications</h3>
                {unread > 0 && <p className="text-indigo-200 text-xs">{unread} unread</p>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} disabled={loading}
                    className="text-indigo-200 hover:text-white text-xs flex items-center gap-1 transition-colors">
                    <FaCheckDouble /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FaBell className="text-4xl mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-indigo-50/60' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full ${typeColors[n.notif_type] || 'bg-gray-400'} flex items-center justify-center text-sm flex-shrink-0`}>
                      {typeIcons[n.notif_type] || '🔔'}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium text-gray-800 leading-tight ${!n.is_read ? 'font-semibold' : ''}`}>
                          {n.title}
                        </p>
                        {!n.is_read && <FaCircle className="text-indigo-500 text-[6px] flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
