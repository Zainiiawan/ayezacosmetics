'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api/authApi';
import Button from '@/components/ui/Button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-rose-gold animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-black mb-2">Email Verified!</h2>
        <p className="text-gray-600 mb-8">Your email has been verified. You can now sign in and shop.</p>
        <Button onClick={() => router.push('/login')}>Sign In</Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-3xl font-serif font-bold text-black mb-2">Verification Failed</h2>
      <p className="text-gray-600 mb-8">The verification link is invalid or has expired.</p>
      <Link href="/login"><Button variant="outline">Back to Login</Button></Link>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
