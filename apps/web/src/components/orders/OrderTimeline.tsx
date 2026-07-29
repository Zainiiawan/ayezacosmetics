'use client';

import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineStep = {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
  failed?: boolean;
};

type Props = {
  steps: TimelineStep[];
};

export default function OrderTimeline({ steps }: Props) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  step.failed
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : step.done || step.current
                      ? 'border-rose-gold bg-rose-gold text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                )}
              >
                {step.failed ? (
                  <XCircle className="h-4 w-4" />
                ) : step.done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-8',
                    step.done ? 'bg-rose-gold' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            <div className={cn('pb-8', isLast && 'pb-0')}>
              <p
                className={cn(
                  'font-medium',
                  step.current ? 'text-rose-gold' : step.done ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function buildOrderTimeline(order: {
  status: string;
  paymentMethod: string;
  paymentStatus: string;
}): TimelineStep[] {
  const paymentWaiting =
    order.paymentMethod !== 'cod' &&
    (order.paymentStatus === 'waiting_verification' ||
      order.paymentStatus === 'pending' ||
      order.paymentStatus === 'rejected');
  const paymentApproved = order.paymentStatus === 'paid' || order.paymentMethod === 'cod';
  const preparing = ['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'].includes(
    order.status
  );
  const shipped = ['shipped', 'out_for_delivery', 'delivered'].includes(order.status);
  const delivered = order.status === 'delivered';
  const cancelled = order.status === 'cancelled';

  const steps: TimelineStep[] = [
    {
      key: 'placed',
      label: 'Order Placed',
      done: true,
      current: order.status === 'pending' || order.status === 'pending_confirmation',
    },
  ];

  if (order.paymentMethod !== 'cod') {
    steps.push({
      key: 'payment_waiting',
      label:
        order.paymentStatus === 'rejected'
          ? 'Payment Rejected — Resubmit Proof'
          : 'Payment Waiting Verification',
      done: paymentApproved,
      current: paymentWaiting && !paymentApproved,
      failed: order.paymentStatus === 'rejected',
    });
    steps.push({
      key: 'payment_approved',
      label: 'Payment Approved',
      done: paymentApproved && preparing,
      current: paymentApproved && order.status === 'processing',
    });
  } else {
    steps.push({
      key: 'pending_confirmation',
      label: 'Pending Confirmation',
      done: preparing || order.status !== 'pending_confirmation',
      current: order.status === 'pending_confirmation',
    });
  }

  steps.push(
    {
      key: 'preparing',
      label: 'Preparing Order',
      done: shipped || delivered,
      current: order.status === 'processing' || order.status === 'confirmed',
    },
    {
      key: 'shipped',
      label: 'Shipped',
      done: delivered,
      current: order.status === 'shipped' || order.status === 'out_for_delivery',
    },
    {
      key: 'delivered',
      label: 'Delivered',
      done: delivered,
      current: delivered,
    }
  );

  if (cancelled) {
    steps.push({
      key: 'cancelled',
      label: 'Cancelled',
      done: true,
      current: true,
      failed: true,
    });
  }

  return steps;
}
