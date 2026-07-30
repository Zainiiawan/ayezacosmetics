'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, login } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Suspense } from 'react';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { isLoading, error: storeError } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>();

  const displayError = formError || storeError;
  const needsSignup =
    !!displayError &&
    /no account found|sign up|doesn't exist|does not exist/i.test(displayError);

  const onSubmit = async (data: LoginFormData) => {
    setFormError('');
    dispatch(clearError());
    const result = await dispatch(login(data) as any);
    if (login.fulfilled.match(result) && result.payload?.tokens) {
      router.replace(redirectTo);
      return;
    }
    const message =
      (typeof result.payload === 'string' && result.payload) ||
      'Unable to sign in. Please check your details.';
    setFormError(message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-black">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5 text-gray-500" />}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5 text-gray-500" />}
                {...register('password', {
                  required: 'Password is required',
                })}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-700 hover:text-gray-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {displayError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{displayError}</p>
              {needsSignup && (
                <Link
                  href={`/register?email=${encodeURIComponent(getValues('email') || '')}`}
                  className="mt-2 inline-block font-semibold text-rose-gold hover:text-rose-gold-dark"
                >
                  Create an account →
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-rose-gold focus:ring-rose-gold"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm text-rose-gold hover:text-rose-gold-dark">
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Sign In
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-rose-gold hover:text-rose-gold-dark">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
