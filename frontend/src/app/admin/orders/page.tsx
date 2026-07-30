'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { orderApi, Order } from '@/lib/api/orderApi';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS = [
  'pending',
  'pending_confirmation',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  pending_confirmation: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [message, setMessage] = useState('');

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderApi.getAllAdmin({ limit: 50 }),
    refetchInterval: 10000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, status, trackingNumber, courierName, trackingUrl, estimatedDelivery, message }: {
      orderId: string; status: string; trackingNumber?: string; courierName?: string;
      trackingUrl?: string; estimatedDelivery?: string; message?: string;
    }) => orderApi.updateStatus(orderId, { status, trackingNumber, courierName, trackingUrl, estimatedDelivery, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setCourierName('');
      setTrackingUrl('');
      setEstimatedDelivery('');
      setMessage('');
    },
  });

  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-black">Orders</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Auto-refreshes every 10s · Last updated {new Date(dataUpdatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Order</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Total</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const customer = typeof order.user === 'object' ? order.user : null;
                      return (
                        <tr key={order._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {customer ? `${customer.firstName} ${customer.lastName}` : '—'}
                          </td>
                          <td className="px-4 py-3 font-medium text-rose-gold">{formatPrice(order.total)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100'}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {order.createdAt ? formatDate(order.createdAt) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status);
                                setTrackingNumber(order.trackingNumber ?? '');
                                setCourierName(order.courierName ?? '');
                                setTrackingUrl(order.trackingUrl ?? '');
                                setEstimatedDelivery(order.estimatedDelivery?.slice(0, 10) ?? '');
                              }}
                              className="text-sm text-rose-gold hover:underline"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h3 className="font-serif font-bold text-lg mb-4">Update Order</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedOrder.orderNumber}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking Number</label>
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                    placeholder="Courier tracking ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Courier Name</label>
                  <input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                    placeholder="e.g. TCS, Leopards"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tracking URL (optional)</label>
                  <input
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Delivery</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:border-rose-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:outline-none"
                    placeholder="Status update message"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    loading={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        orderId: selectedOrder._id,
                        status: newStatus,
                        trackingNumber: trackingNumber || undefined,
                        courierName: courierName || undefined,
                        trackingUrl: trackingUrl || undefined,
                        estimatedDelivery: estimatedDelivery || undefined,
                        message: message || undefined,
                      })
                    }
                  >
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
