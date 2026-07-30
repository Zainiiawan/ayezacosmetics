'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { analyticsApi } from '@/lib/api/analyticsApi';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary,
  });

  const stats = [
    {
      name: 'Total Revenue',
      value: data ? formatPrice(data.revenue) : '—',
      icon: DollarSign,
    },
    {
      name: 'Paid Orders',
      value: data ? String(data.paidOrders) : '—',
      icon: ShoppingCart,
    },
    {
      name: 'Low Stock Products',
      value: data ? String(data.lowStockCount) : '—',
      icon: AlertTriangle,
    },
    {
      name: 'Top Products',
      value: data ? String(data.topProducts.length) : '—',
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-black">Analytics</h1>
            <p className="text-sm text-gray-500">Store performance overview</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading analytics...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="w-12 h-12 bg-rose-gold/10 rounded-lg flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-rose-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-1">{stat.value}</h3>
                  <p className="text-gray-600">{stat.name}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-gold" />
                  Orders by Status
                </h3>
                <div className="space-y-3">
                  {data &&
                    Object.entries(data.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize text-gray-600">{status.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-lg mb-4">Top Products</h3>
                <div className="space-y-3">
                  {data?.topProducts.map((product) => (
                    <div key={product._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-black">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.soldCount} sold</p>
                      </div>
                      <p className="text-rose-gold font-medium">{formatPrice(product.basePrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
