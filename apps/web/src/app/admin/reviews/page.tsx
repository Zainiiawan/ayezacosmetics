'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Star, Check, X } from 'lucide-react';
import { reviewApi, Review } from '@/lib/api/reviewApi';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-pending-reviews'],
    queryFn: reviewApi.getPending,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) =>
      reviewApi.moderate(reviewId, { isApproved }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pending-reviews'] }),
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-black">Review Moderation</h1>
            <p className="text-sm text-gray-500">{reviews.length} pending reviews</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            No pending reviews to moderate
          </div>
        ) : (
          reviews.map((review) => {
            const productInfo = typeof review.product === 'object' ? review.product : null;
            return (
            <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      by {review.user?.firstName} {review.user?.lastName}
                    </span>
                  </div>
                  <h3 className="font-medium text-black">{review.title}</h3>
                  <p className="text-gray-600 mt-1">{review.body}</p>
                  {productInfo && (
                    <p className="text-sm text-rose-gold mt-2">Product: {productInfo.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {review.createdAt ? formatDate(review.createdAt) : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => moderateMutation.mutate({ reviewId: review._id, isApproved: true })}
                    loading={moderateMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moderateMutation.mutate({ reviewId: review._id, isApproved: false })}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
