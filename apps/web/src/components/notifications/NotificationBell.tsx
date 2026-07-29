'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { notificationApi } from '@/lib/api/notificationApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatDate } from '@/lib/utils';

export default function NotificationBell() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list({ limit: 20 }),
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const markAll = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!isAuthenticated) return null;

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-700 hover:text-rose-gold transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-gold text-white text-[10px] flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-medium text-sm">Notifications</p>
            <button
              type="button"
              className="text-xs text-rose-gold hover:underline"
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n._id}
                  href={n.link || '/account'}
                  onClick={() => {
                    if (!n.isRead) markOne.mutate(n._id);
                    setOpen(false);
                  }}
                  className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                    n.isRead ? 'opacity-70' : 'bg-rose-gold/5'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
