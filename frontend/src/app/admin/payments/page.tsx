'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { paymentApi } from '@/lib/api/paymentApi';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments-pending'],
    queryFn: () => paymentApi.getPending({ page: 1, limit: 50 }),
    enabled: user?.role === 'admin',
    refetchInterval: 10000,
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      orderId,
      action,
      rejectionReason,
    }: {
      orderId: string;
      action: 'approve' | 'reject';
      rejectionReason?: string;
    }) => paymentApi.verify(orderId, { action, rejectionReason }),
    onSuccess: (_data, vars) => {
      setMessage(vars.action === 'approve' ? 'Payment approved' : 'Payment rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-payments-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      refetch();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Verification failed';
      setMessage(msg);
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link href="/login?redirect=/admin/payments"><Button>Admin Login</Button></Link>
      </div>
    );
  }

  if (user.role !== 'admin') {
    router.replace('/');
    return null;
  }

  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin" className="inline-flex items-center text-rose-gold mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold">Payment Verification</h1>
          <p className="text-gray-500 mt-1">Review JazzCash & Easypaisa payment proofs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className="mb-4 rounded-lg bg-black text-white px-4 py-3 text-sm">{message}</div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading payments...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-gray-500">
            No payments waiting for verification.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const customer =
                typeof order.user === 'object' && order.user
                  ? `${order.user.firstName} ${order.user.lastName}`
                  : 'Customer';
              const proof = order.paymentProof;
              return (
                <div key={order._id} className="bg-white rounded-2xl border p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <h2 className="font-serif text-xl font-semibold">{order.orderNumber}</h2>
                        <span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-amber-100 text-amber-800">
                          {order.paymentStatus?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Customer:</strong> {customer}
                        {typeof order.user === 'object' && order.user?.email ? ` · ${order.user.email}` : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Order Total:</strong> {formatPrice(order.total)} ·{' '}
                        <strong>Date:</strong> {order.createdAt ? formatDate(order.createdAt) : '—'}
                      </p>

                      <div className="border rounded-xl p-3 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 mb-2">PRODUCTS</p>
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>{formatPrice(item.total)}</span>
                          </div>
                        ))}
                      </div>

                      {proof && (
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg border p-3">
                            <p className="text-gray-500">Transaction ID</p>
                            <p className="font-semibold break-all">{proof.transactionId}</p>
                          </div>
                          <div className="rounded-lg border p-3">
                            <p className="text-gray-500">Paid Amount</p>
                            <p className="font-semibold">{formatPrice(proof.paidAmount)}</p>
                          </div>
                          {proof.note && (
                            <div className="rounded-lg border p-3 sm:col-span-2">
                              <p className="text-gray-500">Note</p>
                              <p>{proof.note}</p>
                            </div>
                          )}
                          <div className="rounded-lg border p-3 sm:col-span-2 text-xs text-gray-500">
                            Submitted {proof.submittedAt ? formatDate(proof.submittedAt) : '—'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {proof?.screenshotUrl ? (
                        <a href={proof.screenshotUrl} target="_blank" rel="noreferrer" className="block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proof.screenshotUrl}
                            alt="Payment screenshot"
                            className="w-full rounded-xl border object-contain max-h-72 bg-gray-50"
                          />
                        </a>
                      ) : (
                        <div className="rounded-xl border bg-gray-50 h-48 flex items-center justify-center text-gray-400 text-sm">
                          No screenshot
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          disabled={verifyMutation.isPending || order.paymentStatus === 'paid'}
                          onClick={() =>
                            verifyMutation.mutate({ orderId: order._id, action: 'approve' })
                          }
                        >
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                      <textarea
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Rejection reason (optional)"
                        value={rejectReason[order._id] || ''}
                        onChange={(e) =>
                          setRejectReason((prev) => ({ ...prev, [order._id]: e.target.value }))
                        }
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={verifyMutation.isPending}
                        onClick={() =>
                          verifyMutation.mutate({
                            orderId: order._id,
                            action: 'reject',
                            rejectionReason: rejectReason[order._id],
                          })
                        }
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
