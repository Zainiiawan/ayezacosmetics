'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ManualPaymentCard from '@/components/payments/ManualPaymentCard';
import { orderApi } from '@/lib/api/orderApi';
import { paymentApi } from '@/lib/api/paymentApi';
import { formatPrice } from '@/lib/utils';

export default function PaymentProofPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params.id);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getById(orderId),
  });

  const { data: accounts } = useQuery({
    queryKey: ['payment-accounts'],
    queryFn: paymentApi.getAccounts,
  });

  const [transactionId, setTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const account =
    order?.paymentMethod === 'jazzcash'
      ? accounts?.jazzcash
      : order?.paymentMethod === 'easypaisa'
        ? accounts?.easypaisa
        : null;

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!transactionId.trim() || !paidAmount || !file) {
      setError('Transaction ID, amount, and screenshot are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const uploaded = await paymentApi.uploadScreenshot(file);
      await paymentApi.submitProof(orderId, {
        transactionId: transactionId.trim(),
        paidAmount: Number(paidAmount),
        screenshotUrl: uploaded.url,
        screenshotPublicId: uploaded.publicId,
        note: note || undefined,
      });
      setSuccess('Payment proof submitted. Waiting for admin verification.');
      setTimeout(() => router.push(`/account/orders/${orderId}`), 1200);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit payment proof.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading order...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  }

  if (order.paymentMethod === 'cod') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4">COD orders do not require payment proof.</p>
          <Link href={`/account/orders/${orderId}`}><Button>View Order</Button></Link>
        </div>
      </div>
    );
  }

  if (order.paymentStatus === 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="mb-4 text-green-700">Payment already approved.</p>
          <Link href={`/account/orders/${orderId}`}><Button>View Order</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/account/orders/${orderId}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-gold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to order
        </Link>

        <div className="bg-white rounded-2xl border p-6 md:p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold">Submit Payment Proof</h1>
            <p className="text-gray-500 mt-1">
              Order {order.orderNumber} · Total {formatPrice(order.total)}
            </p>
            {order.paymentStatus === 'rejected' && order.paymentProof?.rejectionReason && (
              <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
                Previous proof rejected: {order.paymentProof.rejectionReason}
              </p>
            )}
          </div>

          {account && (
            <ManualPaymentCard account={account} amountLabel={formatPrice(order.total)} />
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
            <Input
              label="Paid Amount (PKR)"
              type="number"
              min="1"
              step="1"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={String(order.total)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Payment Screenshot</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-rose-gold transition-colors bg-white">
                <Upload className="w-8 h-8 text-rose-gold mb-2" />
                <span className="text-sm text-gray-700">{file ? file.name : 'Upload JPG, PNG or WebP'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                />
              </label>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Payment screenshot preview" className="mt-3 rounded-lg max-h-56 object-contain border" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Note (optional)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

            <Button type="submit" className="w-full" loading={submitting} size="lg">
              Submit Payment Proof
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
