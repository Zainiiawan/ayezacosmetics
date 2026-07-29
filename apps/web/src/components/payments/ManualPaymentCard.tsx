'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ManualAccountInfo = {
  accountName: string;
  number: string;
  methodLabel: string;
};

type ManualPaymentCardProps = {
  account: ManualAccountInfo;
  amountLabel?: string;
  className?: string;
};

export default function ManualPaymentCard({
  account,
  amountLabel,
  className,
}: ManualPaymentCardProps) {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  };

  const numberLabel =
    account.methodLabel === 'JazzCash' ? 'JazzCash Number' : `${account.methodLabel} Number`;

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#d4a574]/40 bg-[#fffaf7] p-5 sm:p-6 space-y-5 text-[#0a0a0a]',
        className
      )}
    >
      <div>
        <h3 className="font-serif text-xl font-semibold text-[#0a0a0a]">
          Send payment via {account.methodLabel}
        </h3>
        <p className="mt-1 text-sm text-[#525252]">
          Transfer exactly to the account below, then submit your proof for verification.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-[#e8d5c4] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
            Account Holder Name
          </p>
          <p className="mt-1 text-lg font-semibold text-[#0a0a0a]">{account.accountName}</p>
        </div>

        <div className="rounded-xl border-2 border-[#b76e79]/35 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
            {numberLabel}
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-2xl font-bold tracking-wider text-[#0a0a0a] tabular-nums">
              {account.number}
            </p>
            <button
              type="button"
              onClick={copyNumber}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b76e79]',
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0a0a0a] text-white hover:bg-[#262626] active:bg-black'
              )}
              aria-label={`Copy ${numberLabel}`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied Successfully
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Number
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {amountLabel && (
        <p className="rounded-lg bg-white border border-[#e8d5c4] px-3 py-2 text-sm font-medium text-[#0a0a0a]">
          Amount to send: <span className="text-[#8b4d5b]">{amountLabel}</span>
        </p>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-[#0a0a0a]">Payment instructions</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#262626]">
          <li>Send the payment to the displayed account.</li>
          <li>Copy the Transaction ID from JazzCash or Easypaisa.</li>
          <li>Enter the Transaction ID.</li>
          <li>Enter the paid amount.</li>
          <li>Upload the payment screenshot.</li>
          <li>Submit for verification.</li>
        </ol>
      </div>
    </div>
  );
}
