'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useSelector((state: RootState) => state.auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/');
      return;
    }
    setReady(true);
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-500">
        {!isHydrated ? 'Loading session…' : 'Checking access…'}
      </div>
    );
  }

  return <>{children}</>;
}
