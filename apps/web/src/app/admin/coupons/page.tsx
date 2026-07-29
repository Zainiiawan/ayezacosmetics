'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Plus, Tag } from 'lucide-react';
import { couponApi, Coupon } from '@/lib/api/couponApi';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as Coupon['type'],
    value: '',
    minOrderAmount: '',
    description: '',
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: couponApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: couponApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', minOrderAmount: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: couponApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      description: form.description || undefined,
      isActive: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-black">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-black">Coupons</h1>
              <p className="text-sm text-gray-500">{coupons.length} coupons</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Coupon
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl p-6 shadow-sm space-y-4 max-w-lg">
            <h3 className="font-serif font-bold">Create Coupon</h3>
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Coupon['type'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <Input label="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
            <Input label="Min Order (optional)" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" loading={createMutation.isPending}>Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No coupons yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Value</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Usage</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4 text-rose-gold" />
                        {coupon.code}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{coupon.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : coupon.type === 'free_shipping' ? 'Free' : `PKR ${coupon.value}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {coupon.usageCount ?? 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${coupon.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {coupon.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {coupon.isActive !== false && (
                          <button
                            onClick={() => deleteMutation.mutate(coupon._id)}
                            className="text-sm text-red-500 hover:underline"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
