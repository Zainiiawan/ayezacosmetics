'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api/authApi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword(token, data.password, data.confirmPassword);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-black mb-2">Password Reset!</h2>
        <p className="text-gray-600 mb-6">Your password has been updated. Redirecting to login...</p>
        <Link href="/login"><Button>Go to Login</Button></Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link href="/login" className="inline-flex items-center text-rose-gold hover:text-rose-gold-dark mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Login
      </Link>
      <h2 className="text-3xl font-serif font-bold text-black mb-2">Reset Password</h2>
      <p className="text-gray-600 mb-8">Enter your new password below</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="New Password"
          type="password"
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
          error={errors.password?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
          error={errors.confirmPassword?.message}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" loading={isLoading}>
          Reset Password
        </Button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
