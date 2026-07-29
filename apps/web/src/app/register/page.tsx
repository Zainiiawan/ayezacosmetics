'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, register as registerUser } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const passwordHint =
  'Min 8 characters with uppercase, lowercase, number, and special character (!@#$…)';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error: storeError } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch('password');
  const displayError = formError || storeError;
  const alreadyExists =
    !!displayError && /already exists|sign in/i.test(displayError);

  const onSubmit = async (data: RegisterFormData) => {
    setFormError('');
    dispatch(clearError());
    const { terms: _terms, ...registerData } = data;
    const result = await dispatch(registerUser(registerData) as any);

    if (registerUser.fulfilled.match(result)) {
      const payload = result.payload;
      if (payload?.requiresOtp && payload?.email) {
        router.push(`/verify-otp?email=${encodeURIComponent(payload.email)}`);
        return;
      }
      if (payload?.tokens) {
        router.replace('/');
        return;
      }
    }

    const message =
      (typeof result.payload === 'string' && result.payload) ||
      'Unable to create your account. Please check your details.';
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
          <h2 className="text-3xl font-serif font-bold text-black">Create Account</h2>
          <p className="mt-2 text-gray-600">Join us and discover your true beauty</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Sara"
              autoComplete="given-name"
              icon={<User className="w-5 h-5 text-gray-500" />}
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
              })}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="Khan"
              autoComplete="family-name"
              icon={<User className="w-5 h-5 text-gray-500" />}
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
              })}
              error={errors.lastName?.message}
            />
          </div>

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

          <Input
            label="Phone Number (Optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+92 300 1234567"
            icon={<Phone className="w-5 h-5 text-gray-500" />}
            {...register('phone', {
              pattern: {
                value: /^[\d\s+()-]+$/,
                message: 'Invalid phone number',
              },
            })}
            error={errors.phone?.message}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5 text-gray-500" />}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                validate: {
                  upper: (v) => /[A-Z]/.test(v) || 'Add an uppercase letter',
                  lower: (v) => /[a-z]/.test(v) || 'Add a lowercase letter',
                  number: (v) => /[0-9]/.test(v) || 'Add a number',
                  special: (v) => /[^A-Za-z0-9]/.test(v) || 'Add a special character (!@#$)',
                },
              })}
              error={errors.password?.message}
            />
            <p className="mt-1 text-xs text-gray-500">{passwordHint}</p>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-700 hover:text-gray-900"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5 text-gray-500" />}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-700 hover:text-gray-900"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-gold focus:ring-rose-gold"
                {...register('terms', {
                  required: 'You must accept the terms and conditions',
                })}
              />
              <span>
                I accept the{' '}
                <Link href="/terms" className="text-rose-gold hover:text-rose-gold-dark">
                  Terms and Conditions
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1 text-sm font-medium text-red-600">{errors.terms.message}</p>
            )}
          </div>

          {displayError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{displayError}</p>
              {alreadyExists && (
                <Link
                  href="/login"
                  className="mt-2 inline-block font-semibold text-rose-gold hover:text-rose-gold-dark"
                >
                  Go to Sign In →
                </Link>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isLoading}>
            Create Account
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-rose-gold hover:text-rose-gold-dark">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
