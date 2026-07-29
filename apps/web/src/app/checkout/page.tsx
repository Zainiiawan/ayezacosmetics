'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Truck, Lock, Check, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderApi, PaymentMethod } from '@/lib/api/orderApi';
import { paymentApi } from '@/lib/api/paymentApi';
import ManualPaymentCard from '@/components/payments/ManualPaymentCard';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartDiscount = useSelector((state: RootState) => state.cart.discount);
  const couponCode = useSelector((state: RootState) => state.cart.couponCode);
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const shipping = subtotal > 5000 ? 0 : subtotal > 0 ? 200 : 0;
  const total = Math.max(0, subtotal + shipping - (cartDiscount || 0));

  const { data: accounts } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: paymentApi.getAccounts,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      country: 'Pakistan',
      paymentMethod: 'cod',
    },
  });

  const paymentMethod = watch('paymentMethod');

  const paymentMethods = useMemo(
    () =>
      [
        { id: 'cod' as const, name: 'Cash on Delivery', icon: Truck, description: 'Pay when you receive your order' },
        { id: 'jazzcash' as const, name: 'JazzCash', icon: Smartphone, description: 'Manual transfer + screenshot' },
        { id: 'easypaisa' as const, name: 'Easypaisa', icon: Smartphone, description: 'Manual transfer + screenshot' },
      ] as const,
    []
  );

  const account =
    paymentMethod === 'jazzcash'
      ? accounts?.jazzcash
      : paymentMethod === 'easypaisa'
        ? accounts?.easypaisa
        : null;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setError('');
    try {
      const order = await orderApi.create({
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        paymentMethod: data.paymentMethod,
        couponCode: couponCode || undefined,
        notes: data.notes,
      });
      dispatch(clearCart());

      if (data.paymentMethod === 'cod') {
        router.push(`/account/orders/${order._id}?placed=1`);
      } else {
        router.push(`/account/orders/${order._id}/pay`);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Checkout failed. Please try again.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Your cart is empty</h1>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-gold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to cart
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6"
            >
              <div>
                <h1 className="text-3xl font-serif font-bold text-black">Secure Checkout</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Your information is protected
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input label="First name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
                <Input label="Last name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
                <Input label="Phone" error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
                <Input label="Country" error={errors.country?.message} {...register('country', { required: 'Required' })} />
                <div className="md:col-span-2">
                  <Input label="Street address" error={errors.street?.message} {...register('street', { required: 'Required' })} />
                </div>
                <Input label="City" error={errors.city?.message} {...register('city', { required: 'Required' })} />
                <Input label="State / Province" error={errors.state?.message} {...register('state', { required: 'Required' })} />
                <Input label="Postal code" error={errors.postalCode?.message} {...register('postalCode', { required: 'Required' })} />
              </div>

              <div>
                <h2 className="text-xl font-serif font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const selected = paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          selected ? 'border-rose-gold bg-rose-gold/5' : 'border-gray-200 hover:border-rose-gold/40'
                        }`}
                      >
                        <input type="radio" value={method.id} className="mt-1" {...register('paymentMethod')} />
                        <Icon className={`w-5 h-5 mt-0.5 ${selected ? 'text-rose-gold' : 'text-gray-500'}`} />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">{method.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {account && (
                <ManualPaymentCard account={account} amountLabel={formatPrice(total)} />
              )}

              {paymentMethod === 'cod' && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
                  Your order will be placed as <strong>Pending Confirmation</strong>. After admin approval it moves to <strong>Processing</strong>. Payment remains pending until delivery.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Order notes (optional)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-gold"
                  rows={3}
                  {...register('notes')}
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <Button type="submit" className="w-full" loading={isProcessing} size="lg">
                {paymentMethod === 'cod' ? 'Place COD Order' : 'Place Order & Submit Payment'}
              </Button>
            </motion.form>
          </div>

          <aside className="bg-white rounded-2xl border border-gray-100 p-6 h-fit sticky top-24">
            <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={`${item.product._id}-${item.variant || ''}`} className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-700">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-rose-gold"><span>Discount</span><span>-{formatPrice(cartDiscount)}</span></div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 flex items-center gap-1">
              <Check className="w-3 h-3 text-rose-gold" /> Verified purchase reviews after delivery
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
